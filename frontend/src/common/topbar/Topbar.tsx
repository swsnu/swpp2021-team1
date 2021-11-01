import React from "react";
import { Container, Navbar } from "react-bootstrap";
import { ReactComponent as Logo } from "../assets/logo.svg";
import "./Topbar.css";

const Topbar = () => (
    <Navbar bg="primary" className="top-bar">
        <Container>
            <Navbar.Brand className="logo-container">
                <Logo className="logo" />
            </Navbar.Brand>
        </Container>
    </Navbar>
);

export default Topbar;
