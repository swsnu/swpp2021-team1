import React, { useState } from 'react'
import './Sidebar.css';
import { ReactComponent as Logo } from '../assets/logo.svg'
import { Dropdown } from "react-bootstrap";


interface SidebarProps {

}

const Sidebar = (props: SidebarProps) => {
  return (
    <div id="sidebar-container" className="d-flex flex-column flex-shrink-0 pb-3 pt-4">
      <a href="/" className="d-flex align-items-center mb-3 mb-md-0 mx-auto link-dark text-decoration-none">
        <Logo height="30" className="logo" />
      </a>
      {/* <hr /> */}
        <ul className="nav flex-column mb-auto mt-5">
          <li className="nav-item">
            <a href="#" className="nav-link link-dark" aria-current="page">
              <svg className="bi me-2" width="16" height="16"></svg>
              Posts
            </a>

            <a href="#" className="nav-link link-dark">
              <svg className="bi me-2" width="16" height="16"></svg>
              Repositories
            </a>
            <a href="#" className="nav-link link-dark mb-4">
              <svg className="bi me-2" width="16" height="16"></svg>
              Explore
            </a>
            <a href="#" className="nav-link link-dark">
              <svg className="bi me-2" width="16" height="16"></svg>
              Notifications
            </a>
          </li>
        </ul>
        <hr />
          <Dropdown>
            <Dropdown.Toggle id="dropdown-toggle" className="d-flex align-items-center link-dark text-decoration-none" data-bs-toggle="dropdown">
              <img src="https://github.com/mdo.png" alt="" width="32" height="32" className="rounded-circle me-2" />
              <strong>John Doe</strong>
            </Dropdown.Toggle>
            <Dropdown.Menu className="text-small shadow">
              <Dropdown.Item href="#">Settings</Dropdown.Item>
              <hr className="dropdown-divider" />
              <Dropdown.Item href="#">Sign out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
      </div>

  );
}

export default Sidebar;