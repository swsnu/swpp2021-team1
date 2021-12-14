import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
    Button, Form, InputGroup, Modal,
} from "react-bootstrap";
import axios from "axios";
import { IUser, Visibility } from "../../../../common/Interfaces";
import * as actionCreators from "../../authSlice";
import { AppDispatch } from "../../../../app/store";

interface SignUpProps {
    show: boolean
    onModalClose: () => void
}

export default function SignUp(props : SignUpProps) {
    const [email, setEmail] = useState<string>("");
    const [realName, setRealName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [canUse, setCanUse] = useState<boolean|null|undefined>(undefined);
    const [valid, setValid] = useState<(boolean|null)[]>([null, null, null, null]);
    const [visibility, setVisibility] = useState<Visibility>(Visibility.ALL);
    // 해당 닉네임을 이용할 수 있는지 확인하는 state
    const dispatch = useDispatch<AppDispatch>();

    function checkDuplicate() {
        axios.get<IUser>(`/api/users/${username}`)
            .then(() => {
                setCanUse(false);
            })
            .catch(() => {
                setCanUse(true);
            });
    }

    function onSignUp() {
        /* 정규표현식으로 signup 형식 지정(hw2 참조) */
        dispatch(actionCreators.signUp({
            email,
            real_name: realName,
            username,
            password,
            bio,
            visibility,
        })).then(() => {
            dispatch(actionCreators.signIn({ username, password }));
        });
    }

    function onChange(event : React.ChangeEvent<HTMLInputElement>) {
        switch (event.target.name) {
        case "email":
            setEmail(event.target.value);
            if (/^[^@\s]+@[A-Za-z\d.]+$/.test(event.target.value)) {
                setValid([true, valid[1], valid[2], valid[3]]);
            }
            else {
                setValid([false, valid[1], valid[2], valid[3]]);
            }
            break;

        case "username":
            setUsername(event.target.value);
            setCanUse(null);
            if (/^[a-zA-Z\d_]+$/.test(event.target.value) && event.target.value.length >= 3) {
                setValid([valid[0], true, valid[2], valid[3]]);
            }
            else {
                setValid([valid[0], false, valid[2], valid[3]]);
            }
            break;

        case "realname":
            setRealName(event.target.value);
            if (/^[a-zA-Z][a-zA-Z\s]*$/.test(event.target.value) && event.target.value.length <= 150) {
                setValid([valid[0], valid[1], true, valid[3]]);
            }
            else {
                setValid([valid[0], valid[1], false, valid[3]]);
            }
            break;

        case "password":
            setPassword(event.target.value);
            if (/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(event.target.value)) {
                setValid([valid[0], valid[1], valid[2], true]);
            }
            else {
                setValid([valid[0], valid[1], valid[2], false]);
            }
            break;
        default:
            break;
        }
    }

    return (
        <Modal show={props.show} onHide={props.onModalClose}>
            <Modal.Header closeButton>
                <Modal.Title>Sign up a new account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            name="email"
                            onChange={onChange}
                            isValid={valid[0] !== null && valid[0]}
                            isInvalid={valid[0] !== null && !valid[0]}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please write valid email.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                value={username}
                                name="username"
                                onChange={onChange}
                                aria-describedby="addon"
                                isValid={valid[1] !== null && valid[1] && canUse === true}
                                isInvalid={(valid[1] !== null || canUse !== undefined) && (!valid[1] || !canUse)}
                            />
                            <Button id="addon" onClick={checkDuplicate}>Duplicate Check</Button>
                            <Form.Control.Feedback type="invalid">
                                {!valid[1] ? "Please choose valid user name." :
                                    canUse === null ? "Duplicate check please." :
                                        "You cannot use the name."}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={realName}
                            name="realname"
                            onChange={onChange}
                            isValid={valid[2] !== null && valid[2]}
                            isInvalid={valid[2] !== null && !valid[2]}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please write your name in English.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            name="password"
                            onChange={onChange}
                            isValid={valid[3] !== null && valid[3]}
                            isInvalid={valid[3] !== null && !valid[3]}
                        />
                        <Form.Control.Feedback type="invalid">
                            Password should be 8 letters or longer with at least one number and alphabet.
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <h6>Your account information is visible to...</h6>
                        <div className="mt-3">
                            <Form.Check
                                inline
                                label="Anyone"
                                type="checkbox"
                                checked={visibility === Visibility.ALL}
                                onChange={() => setVisibility(Visibility.ALL)}
                            />
                            <Form.Check
                                inline
                                label="Friends"
                                type="checkbox"
                                checked={visibility === Visibility.MEMBER_AND_FRIENDS}
                                onChange={() => setVisibility(Visibility.MEMBER_AND_FRIENDS)}
                            />
                            <Form.Check
                                inline
                                label="No One"
                                type="checkbox"
                                checked={visibility === Visibility.ONLY_MEMBERS}
                                onChange={() => setVisibility(Visibility.ONLY_MEMBERS)}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                            as="textarea"
                            style={{ height: "75px" }}
                            type="bio"
                            value={bio}
                            name="bio"
                            onChange={(event) => setBio(event.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    id="confirm"
                    variant="primary"
                    onClick={onSignUp}
                    disabled={!(valid[0] && valid[1] && valid[2] && valid[3] && canUse === true)}
                >
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
