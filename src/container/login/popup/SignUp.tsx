import {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import * as actionCreators from "../../../store/slice/UserSlice"
import {StoreDispatch, StoreState} from "../../../store/Store";
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

interface SignUpProps {
    show: boolean
    onModalClose: () => {}
}

export default function SignUp(props : SignUpProps) {
    const [email, setEmail] = useState<string>("");
    const [nickname, setNickname] = useState<string>("");
    const [username, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [canUse, setCanUse] = useState<boolean|null|undefined>(undefined);
    //해당 닉네임을 이용할 수 있는지 확인하는 state
    const dispatch = useDispatch<StoreDispatch>();
    const [isLoading, hasError] = useSelector<StoreState, [boolean, boolean]>(state =>
        [state.users.isLoading, state.users.hasError]);

    function onCheck() {
        setCanUse(null);
        /*TODO : request api server to check duplication*/
    }

    function onSignUp() {
        /*정규표현식으로 signup 형식 지정(hw2 참조)*/
        let flag = true;

        // ! Bootstrap에서 자동으로 이메일 validation 해줘서 일단 이건 뺌
        // if (!/^[^.@\s]+@[A-Za-z\d.]+$/.test(email)) {
        //     //TODO
        //     flag = false;
        // }

        if (!/^[a-zA-Z\d][_]+$/.test(nickname)) {
            //TODO
            flag = false;
        }
        if (!/^[a-zA-Z]+$/.test(username)) {
            //TODO
            flag = false;
        }
        if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
            //TODO
            flag = false;
        }
        if (!flag || canUse !== true) return;
        dispatch(actionCreators.signUp({email : email, nickname : nickname, username : username, password : password, profilePicture : 'default'}));
    }

    //error에 대한 처리 필요
    if (isLoading && !hasError) return null;
    return (
    <Modal show={props.show} onHide={() => props.onModalClose}>
        <Modal.Header closeButton>
            <Modal.Title>Sign up a new account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)}/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicNickname">
                    <Form.Label>Nickname</Form.Label>
                    <Form.Control type="text" value={nickname} onChange={e => setNickname(e.target.value)} />
                    <button onClick={onCheck}>Check Duplicated Nickname</button>
                    <Form.Text className="text-muted">
                        {canUse === true ? 'Acceptable Nickname' :
                        canUse === false ? 'Duplicated Nickname' :
                        canUse === null ? 'Loading...' : 'Duplication Check Please'}
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Name</Form.Label>

                </Form.Group>
            </Form>
                
                <div>Name :  <input value={username} type={"text"} onChange={event => setName(event.target.value)}/></div>
                <div>Password :  <input value={password} type={"text"} onChange={event => setPassword(event.target.value)}/></div>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={onSignUp}>Confirm</Button>
        </Modal.Footer>
    </Modal>
    )
}