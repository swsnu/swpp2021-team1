import React, { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { IUser } from "../../../common/Interfaces";
import * as actionCreator from "../authSlice";
import SignUp from "./popup/SignUp";
import "./SignIn.css";
import { ReactComponent as Logo } from "../../../common/assets/logo.svg";

// suppress tsx-no-component-props
export default function SignIn() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [signupModalShow, setSignupModalShow] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const [account, hasError] = useSelector<RootState, [IUser|null, boolean]>((state) =>
        [state.auth.account, state.auth.hasError]);
    const [loginClicked, setLoginClicked] = useState<boolean>(false);

    useEffect(() => {
        dispatch(actionCreator.handleError(null));
        dispatch(actionCreator.fetchSession());
    }, [dispatch]);

    function onLogIn() {
        setLoginClicked(true);
        dispatch(actionCreator.signIn({ username, password }));
    }

    function onModalClose() {
        setSignupModalShow(false);
    }

    return (
        <div id="viewport" style={{ paddingBottom: "50 !important" }}>
            {account && (<Redirect to={`/main/${account.username}`} />)}
            <Form id="form-container" className="p-5">
                <Form.Group className="mb-3">
                    <Logo className="login-logo mb-4 mx-3" />
                    <Form.Control
                        value={username}
                        type="text"
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Username"
                        isInvalid={loginClicked && hasError}
                    />
                    <Form.Control.Feedback type="invalid">
                        Log in failed.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Control
                        value={password}
                        type="password"
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Password"
                        isInvalid={loginClicked && hasError}
                    />
                    <Form.Control.Feedback type="invalid">
                        Log in failed.
                    </Form.Control.Feedback>
                </Form.Group>
                <div className="d-flex flex-column">
                    <Button
                        id="login-button"
                        onClick={onLogIn}
                        disabled={username === "" || password === ""}
                        variant="primary"
                    >
                        Log In
                    </Button>
                    <div id="signup-button">
                        <Button onClick={() => setSignupModalShow(true)} variant="link">Sign Up!</Button>
                        <SignUp show={signupModalShow} onModalClose={onModalClose} />
                    </div>
                </div>
            </Form>

        </div>
    );
}
