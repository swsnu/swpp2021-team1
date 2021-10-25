import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import * as actionCreators from "../../authSlice"
import {AppDispatch, RootState} from "../../../../app/store";
import React from "react";
import ReactDOM from 'react-dom'
import { Modal, Button, Form } from "react-bootstrap";
import {IUser} from "../../../../common/Interfaces";
import { fetchAllUsers } from "../../../../common/APIs";

interface SignUpProps {
    show: boolean
    onModalClose: () => void
}

export default function SignUp(props : SignUpProps) {
    const [email, setEmail] = useState<string>("");
    const [realName, setRealName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [canUse, setCanUse] = useState<boolean|null|undefined>(undefined);
    //해당 닉네임을 이용할 수 있는지 확인하는 state
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, hasError] = useSelector<RootState, [boolean, boolean]>(state =>
        [state.auth.isLoading, state.auth.hasError]);


    useEffect(() => {
        if (username === '') setCanUse(undefined);
        else {
            const checkUsernameDup = async () => {
                const userList = await fetchAllUsers();
                if (userList.find((user) => user.username === username)) setCanUse(false);
                else setCanUse(true);
            }
            checkUsernameDup();
        }
    }, [username]);

    function onSignUp() {
        /*정규표현식으로 signup 형식 지정(hw2 참조)*/
        let flag = true;

        // ! Bootstrap에서 자동으로 이메일 validation 해줘서 일단 이건 뺌
        // if (!/^[^.@\s]+@[A-Za-z\d.]+$/.test(email)) {
        //     //TODO
        //     flag = false;
        // }

        if (!/^[a-zA-Z\d][_]+$/.test(realName)) {
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
        dispatch(actionCreators.signUp({email : email, real_name : realName, username : username, password : password, profile_picture : 'default', friends : []}));
    }

    // 테스트 위해 잠깐 주석처리함
    //error에 대한 처리 필요
    // if (isLoading && !hasError) return null;

    return (
    <Modal show={props.show} onHide={props.onModalClose}>
        <Modal.Header closeButton>
            <Modal.Title>Sign up a new account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)}/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)}/>
                    <Form.Text className="text-muted">
                        {canUse === true ? 'OK!' :
                        canUse === false ? `${username} is already taken` :
                        canUse === null ? <br /> : <br />}
                    </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control type="text" value={realName} onChange={e => setRealName(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={onSignUp}>Confirm</Button>
        </Modal.Footer>
    </Modal>
    )
}