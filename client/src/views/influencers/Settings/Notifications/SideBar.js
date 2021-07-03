import React from "react"
import { ListGroup, ListGroupItem } from "reactstrap"
import PerfectScrollbar from "react-perfect-scrollbar"
import { X, Info, Check, Tablet } from "react-feather"



export default function SideBar(props){

    return (
        <React.Fragment>
        <span
          className="sidebar-close-icon"
          onClick={() => props.toggleSideBar(false)}
        >
          <X size={15} />
        </span>
        <div className="todo-app-menu">
          <PerfectScrollbar
            className="sidebar-menu-list"
            options={{
              wheelPropagation: false 
            }}
          >
            <h5 className="mt-2 mb-1 pt-25">Filters</h5>
            <ListGroup className="font-medium-1">
            <ListGroupItem
                className="border-0"
                onClick={() => {
                  props.changeFilter("all")
                }}
                active={props.filter=== "all"}
              >
                <Tablet size={22} />
                <span className="align-middle ml-1">All</span>
              </ListGroupItem>
            <ListGroupItem
                className="border-0"
                onClick={() => {
                  props.changeFilter("is_read")
                }}
                active={props.filter=== "is_read"}
              >
                <Check size={22} />
                <span className="align-middle ml-1">Read</span>
              </ListGroupItem>
              <ListGroupItem
                className="border-0"
                onClick={() => {
                  props.changeFilter("un_read")
                }}
                active={props.filter=== "un_read"}
              >
                <Info size={22} />
                <span className="align-middle ml-1">UnRead</span>
              </ListGroupItem>
            </ListGroup>
          </PerfectScrollbar>
        </div>
      </React.Fragment>
    )
}