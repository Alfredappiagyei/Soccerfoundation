import React from 'react'
import 'react-contexify/dist/ReactContexify.min.css'
import '../../../../assets/scss/plugins/extensions/context-menu.scss'
import 'react-toastify/dist/ReactToastify.css'
import { Menu, Item, MenuProvider, Submenu } from 'react-contexify'
import { Button } from 'reactstrap'
import { Filter as FilterIcon } from 'react-feather'
import { AvForm } from 'availity-reactstrap-validation'
import AvRadioGroup from 'availity-reactstrap-validation/lib/AvRadioGroup'
import AvRadio from 'availity-reactstrap-validation/lib/AvRadio'

export default function Filter ({ filters, setFilters,getFeeds }) {
  const submitRef = React.createRef()

  const MenuLeftClick = () => {
    return (
      <AvForm ref={submitRef} onSubmit={(e, errors, values)=>{
        if(errors.length) return 
        const transformedFields = Object.keys(values).reduce((acc, key)=>{
          const value = values[key]
          if(value !== 'all'){
            acc[key] = value
          }
          return acc
        }, {})
        setFilters(transformedFields)
        getFeeds(transformedFields)
      }}> 
        <Menu id='menu_left'>
          <Submenu label='Feed Status'>
            <AvRadioGroup required name="is_published" defaultValue={filters?.is_published ?? "all"}>
            <Item disabled>
                <AvRadio label='All' value={'all'} />
              </Item>
              <Item disabled>
                <AvRadio label='Published' value={'true'} />
              </Item>
              <Item disabled>
                <AvRadio label='UnPublished' value={'false'} />
              </Item>
            </AvRadioGroup>
          </Submenu>
          <Submenu label='Feed Channel'>
            <AvRadioGroup required name="channel" defaultValue={filters?.channel ?? "all"}>
            <Item disabled>
                <AvRadio label='All' value={'all'} />
              </Item>
              <Item disabled>
                <AvRadio label='Twitter' value='twitter' />
              </Item>
              <Item disabled>
                <AvRadio label='Custom' value='custom' />
              </Item>
              <Item disabled>
                <AvRadio label='Facebook' value='facebook' />
              </Item>
              <Item disabled>
                <AvRadio label='Instagram' value='instagram' />
              </Item>
            </AvRadioGroup>
          </Submenu>
          <Item onClick={()=> {
            submitRef.current.handleSubmit()
          }}>
          <Button  className='w-100' type='submit' color='primary'>
            Apply
          </Button>
          </Item>
       
        </Menu>
      </AvForm>
    )
  }

  return (
    <>
      <MenuProvider id='menu_left' event='onClick'>
        <Button size='sm' color='warning'>
          <FilterIcon size={14} />
        </Button>
      </MenuProvider>
      <MenuLeftClick />
    </>
  )
}
