import React from 'react'
import {  Card, CardBody, CardHeader, CardTitle } from 'reactstrap'
import Chart from 'react-apexcharts'

function StatisticsCards (props) {
  return (
    <Card>
      {props.header ? (
        <CardHeader>
          <CardTitle> {props.header} </CardTitle>
          {props.actions}
        </CardHeader>
      ): null}
      <CardBody
        className={`${
          props.className ? props.className : 'stats-card-body'
        } d-flex ${
          !props.iconRight && !props.hideChart
            ? 'flex-column align-items-start'
            : props.iconRight
            ? 'justify-content-between flex-row-reverse align-items-center'
            : props.hideChart && !props.iconRight
            ? 'justify-content-center flex-column text-center'
            : null
        } ${!props.hideChart ? 'pb-0' : 'pb-2'} pt-2`}
      >
        {props.icon ? (
          <div className='icon-section'>
            <div
              className={`avatar avatar-stats p-50 m-0 ${
                props.iconBg ? `bg-rgba-${props.iconBg}` : 'bg-rgba-primary'
              }`}
            >
              <div className='avatar-content'>{props.icon}</div>
            </div>
          </div>
        ) : null}
        <div className='title-section'>
          <h2 className='text-bold-600 mt-1 mb-25'>{props.stat}</h2>
          <p className='mb-0'>{props.statTitle}</p>
        </div>
      </CardBody>
      {!props.hideChart && (
        <Chart
          options={props.options}
          series={props.series}
          type={props.type}
          height={props.height ? props.height : 100}
        />
      )}
      <div className='ml-2 mb-2'>
      {props.buttonAction}
      </div>

    </Card>
  )
}
export default StatisticsCards
