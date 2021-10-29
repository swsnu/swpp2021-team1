import React, {useEffect, useState} from 'react'
import {IUser, SetStateAction} from "../../../common/Interfaces";
import {
    Badge,
    Button,
    CloseButton,
    Dropdown,
    FormControl,
    InputGroup,
    Modal,
} from "react-bootstrap";
import "./AddCollaborators.css"

interface AddCollaboratorsProps {
    user : IUser;
    show : boolean;
    setShow : SetStateAction<boolean>;
    collaborators : IUser[];
    setCollaborators : SetStateAction<IUser[]>|((collaborators : IUser[]) => void);
}

export default function AddCollaborators(props : AddCollaboratorsProps) {

    const [collaborators, setCollaborators] = useState<IUser[]>(props.collaborators);
    const [queryString, setQueryString] = useState<string>("");
    const [clicked, setClicked] = useState<boolean>(false);
    const [filteredFriend, setFilteredFriend] = useState<IUser[]>(props.user.friends as IUser[]);

    function close() {
        props.setCollaborators(collaborators);
        props.setShow(false);
    }

    function remove(name : string) {
        const temp = collaborators.filter(value => value.username !== name);
        setCollaborators(temp);
    }

    function onChangeForm(event : React.ChangeEvent<HTMLInputElement>) {
        const string = event.target.value;
        setQueryString(string);
        setFilteredFriend((props.user.friends as IUser[]).filter(value => value.username.includes(string)));
    }

    function onAdd(user : IUser) {
        console.log("added")
        setCollaborators([...collaborators, user]);
    }

    return (
        <Modal show={props.show} onHide={close}>
            <Modal.Header>
                <Modal.Title>Add Collaborators</Modal.Title>
            </Modal.Header>
            <Dropdown className="d-grid gap-3">
                <Dropdown.Toggle className="d-flex" split variant="primary" id="dropdown-basic">
                    <InputGroup>
                        <FormControl id='repo-name-input' type='text' value={queryString} placeholder='Search Friends'
                                     onChange={onChangeForm}/>
                    </InputGroup>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {filteredFriend.length > 0 ?
                        filteredFriend.map(value =>
                            <Dropdown.Item
                                onClick={() => onAdd(value)}
                                disabled={collaborators.filter(value1 => value1.username === value.username).length !== 0}>
                                {value.username}
                            </Dropdown.Item>) :
                        <Dropdown.Item disabled={true}>No Result</Dropdown.Item>}
                </Dropdown.Menu>
                <div className="d-flex ms-2 me-2">
                    {collaborators.map(value => <Collaborator canDelete={value.username !== props.user.username} user={value} remove={remove}/>)}
                </div>
            </Dropdown>
            <Modal.Footer>
                <Button variant="primary" onClick={close}>Confirm</Button>
            </Modal.Footer>
        </Modal>
    )
}

interface CollaboratorProps {
    user : IUser;
    remove : (name : string) => void;
    canDelete : boolean;
}

function Collaborator(props : CollaboratorProps) {
    return (
        <React.Fragment key={props.user.username}>
            <h5>
                <Badge className="m-2 p-sm-2" pill>{props.user.username}
                    {props.canDelete && <CloseButton onClick={() => props.remove(props.user.username)}/>}
                </Badge>
            </h5>
        </React.Fragment>
    )
}