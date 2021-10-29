import React, { useState } from "react";
import "./Sidebar.css";
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell, faBook, faCompass, faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {

}

const Sidebar = (props: SidebarProps) => (
    <div id="sidebar-container" className="d-flex flex-column flex-shrink-0 pb-3 pt-4">
        {/* <hr /> */}
        <ul className="nav flex-column mb-auto mt-2">
            <li className="nav-item">
                <a id="posts-menu" href="#" className="nav-link link-dark fs-5" aria-current="page">
                    <FontAwesomeIcon className="me-3" icon={faPencilAlt} color="#f69d72" />
                    Posts
                </a>

                <a id="repositories-menu" href="#" className="nav-link link-dark fs-5">
                    <FontAwesomeIcon className="me-3" icon={faBook} color="#f69d72" />
                    Repositories
                </a>
                <a id="explore-menu" href="#" className="nav-link link-dark mb-4 fs-5">
                    <FontAwesomeIcon className="me-3" icon={faCompass} color="#f69d72" />
                    Explore
                </a>
                <a id="noticelist-menu" href="#" className="nav-link link-dark fs-5">
                    <FontAwesomeIcon className="me-3" icon={faBell} color="#f69d72" />
                    Notifications
                </a>
            </li>
        </ul>
        <hr />
        <Dropdown>
            <Dropdown.Toggle
                id="settings-menu"
                className="d-flex align-items-center link-dark text-decoration-none"
                data-bs-toggle="dropdown"
            >
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

export default Sidebar;
