import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { AppDispatch, RootState } from "../../../app/store";
import { IDummyUser, IUser } from "../../../common/Interfaces";
import { Redirect } from "react-router-dom";
import * as actionCreator from "../authSlice"
import { Form, Button } from "react-bootstrap";
import SignUp from "./popup/SignUp";
import './SignIn.css'
import {useDispatch, useSelector} from "react-redux";

interface SignInProps {

}

export default function SignIn(props: SignInProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [signupModalShow, setSignupModalShow] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const [account, hasError] =
    useSelector<RootState, [IUser|null, boolean]>(state =>
        [state.auth.account, state.auth.hasError]);

    function onLogIn() {
        dispatch(actionCreator.signIn({ email, password }));
    }

    function onModalClose() {
        setSignupModalShow(false);
    }

    return (
        <div id="viewport" className="p-5" >
            {account && <Redirect to={`/main/${account.username}`} />}
            <Form id="form-container" className="p-5">
                <Form.Group className="mb-3">
                    <Form.Control value={email} type="email"
                                  onChange={event => setEmail(event.target.value)}
                                  placeholder="Email" isInvalid={hasError}/>
                    <Form.Control.Feedback type="invalid">
                        Log in failed.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Control value={password} type="password"
                                  onChange={event => setPassword(event.target.value)}
                                  placeholder="Password" isInvalid={hasError}/>
                    <Form.Control.Feedback type="invalid">
                        Log in failed.
                    </Form.Control.Feedback>
                </Form.Group>
                <div className="d-flex flex-column">
                    <Button id="login-button" onClick={onLogIn}
                    disabled={email === "" || password === ""}
                    variant="primary">Log In</Button>
                    <div id="signup-button" >
                        <Button onClick={() => setSignupModalShow(true)} variant="link">Sign Up!</Button>
                        <SignUp show={signupModalShow} onModalClose={onModalClose} />
                    </div>
                </div>
            </Form>

        </div>
    )

}