import React, { useEffect } from "react";
import "./Sidebar.css";
import { Dropdown } from "react-bootstrap";
import { useHistory } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBell, faBook, faCompass, faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Redirect, Link } from "react-router-dom";
import * as actionCreators from "../auth/authSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

import avatar from "../../common/assets/avatar.jpg";

interface SidebarProps {

}

function Sidebar(props: SidebarProps) {
    const dispatch = useAppDispatch();
    const [isLoading, hasError, account] = useAppSelector((state) =>
        [state.auth.isLoading, state.auth.hasError, state.auth.account]);
    const history = useHistory();

    useEffect(() => {
        dispatch(actionCreators.fetchSession());
        const id = setInterval(() => {
            dispatch(actionCreators.fetchSession());
        }, 1000);

        return () => clearInterval(id);
    }, [dispatch]);

    if (isLoading) return null;
    if (hasError) {
        dispatch(actionCreators.handleError(null));
        return <Redirect to="/login" />;
    }

    const onSignOutClick = () => {
        dispatch(actionCreators.signOut()).then(() => history.push("/login"));
    };

    return (
        <div id="sidebar-container" className="d-flex flex-column flex-shrink-0 pb-3 pt-4">
            {/* <hr /> */}
            <ul className="nav flex-column mb-auto mt-2">
                <li className="nav-item">
                    <Link
                        to={`/main/${account?.username}`}
                        className="nav-link link-dark fs-5"
                    >
                        <FontAwesomeIcon className="me-3" icon={faPencilAlt} color="#f69d72" />
                        Posts
                    </Link>

                    <Link
                        id="repositories-menu"
                        to={`/main/${account?.username}/repos`}
                        className="nav-link link-dark fs-5"
                    >
                        <FontAwesomeIcon className="me-3" icon={faBook} color="#f69d72" />
                        Repositories
                    </Link>
                    <Link
                        id="explore-menu"
                        to="#"
                        className="nav-link link-dark mb-4 fs-5"
                    >
                        <FontAwesomeIcon className="me-3" icon={faCompass} color="#f69d72" />
                        Explore
                    </Link>
                    <Link
                        id="explore-menu"
                        to="#"
                        className="nav-link link-dark mb-4 fs-5"
                    >
                        <FontAwesomeIcon className="me-3" icon={faBell} color="#f69d72" />
                        Notifications
                    </Link>
                </li>
            </ul>
            <hr />
            <Dropdown>
                <Dropdown.Toggle
                    id="settings-menu"
                    className="d-flex align-items-center link-dark text-decoration-none"
                    data-bs-toggle="dropdown"
                >
                    <img
                        src={account?.profile_picture ? account?.profile_picture : avatar}
                        alt=""
                        width="32"
                        height="32"
                        className="rounded-circle me-2"
                    />
                    <strong>{account?.username}</strong>
                </Dropdown.Toggle>
                <Dropdown.Menu className="text-small shadow">
                    <Dropdown.Item
                        onClick={() => history.push(`/main/${account?.username}/setting`)}
                    >
                        Settings
                    </Dropdown.Item>
                    <hr className="dropdown-divider" />
                    <Dropdown.Item onClick={onSignOutClick}>Sign out</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

export default Sidebar;
