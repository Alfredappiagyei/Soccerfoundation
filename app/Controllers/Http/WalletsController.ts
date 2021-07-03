'use strict'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import NotEnoughFundException from 'App/Exceptions/NotEnoughFundException'
import Transaction, {
  CashFlow,
  Providers,
  TransactionStatuses,
} from 'App/Models/Transaction'
import Wallet, { SupportedCurrencies } from 'App/Models/Wallet'
import { verifyTransaction, transfer, verifyTransfer } from '../Lib/flutterwave'
import { formatCurrency } from '../Lib/utils'
import Logger from '@ioc:Adonis/Core/Logger'
import { ROLES } from 'App/Models/User'
import CampaignInfluencer, { CampaignInfluencerStatus } from 'App/Models/CampaignInfluencer'

export default class WalletsController {
  public index ({ auth }: HttpContextContract) {
    return auth.user
      ?.related('wallet')
      .query()
      .firstOrFail()
  }

  public async topupAccount ({ request, response, auth }: HttpContextContract) {
    const validationSchema = schema.create({
      amount: schema.number([rules.required()]),
      external_transaction_id: schema.number([rules.required()]),
      currency: schema.enum(Object.values(SupportedCurrencies)),
      provider: schema.enum(Object.values(Providers)),
    })

    const validatedData = await request.validate({
      schema: validationSchema,
    })
    try {
      const transaction = await verifyTransaction(
        validatedData.external_transaction_id
      )
      if (transaction.data.status !== 'successful') {
        throw new Error(transaction.message)
      }
      const user = auth.user
      const wallet = (await auth.user
        ?.related('wallet')
        .query()
        .first()) as Wallet
      const finalBalance = formatCurrency(transaction.data.amount).add(
        wallet?.balance as number
      ).value
      const savedTransaction = await user?.related('transactions').create({
        status: TransactionStatuses.SUCCESFUL,
        totalCharge: transaction.data.charged_amount,
        amount: transaction.data.amount,
        currency: transaction.data.currency,
        paymentType: transaction.data.payment_type,
        settledAmount: transaction.data.amount_settled,
        accountNumber: /mobile/gi.test(transaction.data.payment_type)
          ? transaction.data.customer.phone_number
          : transaction.data.card?.first_6digits,
        flow: CashFlow.INWARD,
        walletId: wallet?.id,
        provider: validatedData.provider,
        fees: transaction.data.app_fee + transaction.data.merchant_fee,
        activity: 'WALLET_LOAD',
        initialBalance: wallet?.balance,
        finalBalance: finalBalance,
        externalTransactionId: transaction.data.id as any,
      })
      wallet.balance = finalBalance
      await wallet?.save()
      return {
        wallet,
        transaction: savedTransaction,
      }
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }

  public async transfer ({ request, auth }: HttpContextContract) {
    const validationSchema = schema.create({
      amount: schema.number([rules.required()]),
      phone_number: schema.string({ trim: true, escape: true }, [
        rules.required(),
        rules.phone(),
      ]),
      currency: schema.enum(Object.values(SupportedCurrencies)),
      provider: schema.enum(Object.values(Providers)),
      network: schema.enum(
        ['MTN', 'TIGO', 'VODAFONE', 'AIRTEL'],
        [rules.requiredWhen('provider', '=', Providers.FLUTTERWAVE)]
      ),
    })

    const validatedData = await request.validate({
      schema: validationSchema,
    })
    const user = auth.user
    const wallet = (await auth.user
      ?.related('wallet')
      .query()
      .first()) as Wallet
    this.hasEnoughFundsForTransfer(validatedData.amount, wallet)
    const savedTransaction = (await user?.related('transactions').create({
      status: TransactionStatuses.PENDING,
      amount: validatedData.amount,
      currency: validatedData.currency,
      paymentType: validatedData.network,
      accountNumber: validatedData.phone_number,
      flow: CashFlow.OUTWARD,
      walletId: wallet?.id,
      provider: validatedData.provider,
      activity: 'WALLET_TRANSFER',
      initialBalance: wallet?.balance,
      finalBalance: wallet.balance,
    })) as Transaction

    try {
      const transferPayload = await transfer({
        currency: validatedData.currency,
        reference: `ripple_${savedTransaction?.id}`,
        phoneNumber: validatedData.phone_number,
        network: validatedData.network,
        fullName: user?.businessName || (user?.full_name as string),
        amount: validatedData.amount,
      })
      savedTransaction.externalTransactionId = transferPayload.data.id
      savedTransaction.fees = transferPayload.data.fee
      savedTransaction.totalCharge = formatCurrency(validatedData.amount).add(
        transferPayload.data.fee
      ).value

      await savedTransaction.save()

      return {
        data: savedTransaction,
      }
    } catch (error) {
      savedTransaction.status = TransactionStatuses.FAILED
      savedTransaction.description = error.message
      await savedTransaction.save()
      throw error
    }
  }

  private hasEnoughFundsForTransfer (amount: number, wallet: Wallet) {
    if (formatCurrency(amount).value > formatCurrency(wallet.balance).value) {
      throw new NotEnoughFundException()
    }
  }

  public async transferCallback ({ request }: HttpContextContract) {
    const validationSchema = schema.create({
      data: schema.object().members({
        id: schema.number(),
        reference: schema.string({ trim: true }),
      }),
    })
    const validated = await request.validate({
      schema: validationSchema,
    })
    const transactionId = validated.data.reference.replace('ripple_', '')

    const verifiedTransfer = await verifyTransfer(validated.data.id)
    const transaction = await Transaction.findOrFail(transactionId)
    const wallet = await transaction
      .related('wallet')
      .query()
      .firstOrFail()
    Logger.info('Processing transfer callback for', {
      external_id: verifiedTransfer.data.id,
    })

    if (verifiedTransfer.data.status !== 'SUCCESSFUL') {
      transaction.status = TransactionStatuses.FAILED
      transaction.description = verifiedTransfer.data.complete_message
      await transaction.save()
    } else {
      this.hasEnoughFundsForTransfer(transaction.amount, wallet)
      const finalBalance = formatCurrency(wallet.balance).subtract(
        transaction.amount
      ).value
      transaction.status = TransactionStatuses.SUCCESFUL
      transaction.finalBalance = finalBalance
      transaction.description = verifiedTransfer.data.complete_message
      await transaction.save()
      wallet.balance = finalBalance
      await wallet.save()
    }
  }

  public async releaseFundsToInfluencer ({
    request,
    auth,
  }: HttpContextContract) {
    const user = auth.user
    const data = request.all()
    const userRole = await user
      ?.related('userRole')
      .query()
      .firstOrFail()
    const validationSchema = schema.create({
      sender_id: schema.number([
        rules.exists({ table: 'users', column: 'id' }),
      ]),
      receipent_id: schema.number([
        rules.exists({ table: 'users', column: 'id' }),
      ]),
      amount: schema.number(),
      campaign_id: schema.number([
        rules.exists({ table: 'campaigns', column: 'id' }),
        rules.exists({
          table: 'campaign_influencers',
          column: 'campaign_id',
          where: { influencer_id: data?.receipent_id },
        }),
      ]),
    })

    const validatedData = await request.validate({
      schema: validationSchema,
      messages: {
        'campaign_id.exists': 'Campaign does not exist',
        'influencer_id.exists': 'User does not exist',
      },
      data: {
        ...data,
        sender_id: userRole?.name === ROLES.ADMIN ? data.sender_id : user?.id,
      },
    })

    const senderWallet = await Wallet.query()
      .where('userId', validatedData.sender_id)
      .firstOrFail()
    this.hasEnoughFundsForTransfer(validatedData.amount, senderWallet)

    const finalBrandBalance = formatCurrency(senderWallet.balance).subtract(
      validatedData.amount
    ).value

    // brand transaction
    await Transaction.create({
      status: TransactionStatuses.PENDING,
      amount: validatedData.amount,
      currency: senderWallet.currency,
      flow: CashFlow.OUTWARD,
      walletId: senderWallet?.id,
      activity: 'CAMPAIGN_PAYOUT',
      initialBalance: senderWallet?.balance,
      finalBalance: finalBrandBalance,
      userId: validatedData.sender_id,
      campaignId: validatedData.campaign_id,
      influencerId: validatedData.receipent_id,
    })

    await senderWallet
      .merge({
        balance: finalBrandBalance,
      })
      .save()

    const receiverWallet = await Wallet.query()
      .where('userId', validatedData.receipent_id)
      .firstOrFail()
    const finalInfluencerBalance = formatCurrency(receiverWallet.balance).add(
      validatedData.amount
    ).value

    // influencer transaction
    await Transaction.create({
      status: TransactionStatuses.PENDING,
      amount: validatedData.amount,
      currency: receiverWallet.currency,
      flow: CashFlow.INWARD,
      walletId: receiverWallet?.id,
      activity: 'CAMPAIGN_PAYOUT',
      initialBalance: receiverWallet?.balance,
      finalBalance: finalInfluencerBalance,
      userId: validatedData.sender_id,
      campaignId: validatedData.campaign_id,
      influencerId: validatedData.receipent_id,
    })

    await receiverWallet
      .merge({
        balance: finalInfluencerBalance,
      })
      .save()

    await CampaignInfluencer.query()
      .where('campaign_id', validatedData.campaign_id)
      .where('influencer_id', validatedData.receipent_id)
      .update({
        amount_paid: validatedData.amount,
        status: CampaignInfluencerStatus.COMPLETED,
      })

    return {
      data: 'Payout completed',
    }
  }
}
