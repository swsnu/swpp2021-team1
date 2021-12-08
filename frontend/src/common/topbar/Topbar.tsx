import React from "react";
import { Container, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { ReactComponent as Logo } from "../assets/logo.svg";
import "./Topbar.css";

const Topbar = () => {
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.auth.account);
    return (
        <Navbar bg="primary" className="top-bar">
            <Container>
                <Link
                    to={`/main/${account?.username}`}
                >
                    <Navbar.Brand className="logo-container">
                        <Logo className="logo" />
                    </Navbar.Brand>
                </Link>
            </Container>
        </Navbar>
    );
};

export default Topbar;
