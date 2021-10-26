import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../app/store";
import {IDummyUser, IRepository, IUser} from "../../common/Interfaces";
import {Redirect, useParams} from "react-router-dom";
import * as actionCreator from "./reposSlice";
import {Badge, Button, FormControl, InputGroup, Form} from "react-bootstrap";
import AddCollaborators from "./popup/AddCollaborators";
import {signIn} from "../auth/authSlice"; //테스트용 임시 처리

interface RepositoryCreateProps {

}

export default function RepositoryCreate(props : RepositoryCreateProps) {

    //assume isLoading이 true 상태

    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, hasError] = useSelector<RootState, [boolean, boolean]>(state => [state.repos.isLoading, state.repos.hasError]);
    const [user, repo] = useSelector<RootState, [IUser,IRepository|null]>(state => [state.auth.account as IUser, state.repos.currentRepo]);
    const [repoName, setRepoName] = useState<string>("");
    const [travelStartDate, setTravelStartDate] = useState<string>("");
    const [travelEndDate, setTravelEndDate] = useState<string>("");
    const [collaborators, setCollaborators] = useState<IDummyUser[]>([{profile_picture : 'test', real_name : 'test', username : 'test'}]); //테스트용 임시
    const [show, setShow] = useState<boolean>(false);
    const [valid, setValid] = useState<(boolean|null)[]>([null, null, null]);

    useEffect(() => {
        dispatch(signIn({email : 'asdf', password : 'asdf'})) //테스트용 임시 처리
    }, [dispatch])

    function addCollaborators() {
        setShow(true);
    }

    function createRepos() {
        dispatch(actionCreator.addRepo({
            repo_id : -1,
            repo_name : repoName,
            travel_start_date : travelStartDate,
            travel_end_date : travelEndDate,
            collaborator_list : collaborators,
        }))
    }

    function onChange(event : React.ChangeEvent<HTMLInputElement>) {
        switch (event.target.name) {
            case 'repo-name' :
                setRepoName(event.target.value);
                if (event.target.value !== "") setValid([true, valid[1], valid[2]]);
                else setValid([false, valid[1], valid[2]]);
                break;
            case 'start-date' :
                setTravelStartDate(event.target.value);
                if (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(event.target.value))
                    setValid([valid[0], true, valid[2]]);
                else setValid([valid[0], false, valid[2]]);
                break;
            case 'end-date' :
                setTravelEndDate(event.target.value);
                if (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(event.target.value))
                    setValid([valid[0], valid[1], true]);
                else setValid([valid[0], valid[1], false]);
                break;
        }
    }

    //TODO : Error 처리
    return (
        <div>
            {!isLoading && repo && <Redirect to={`/repos/${repo.repo_id}`}/>} {/*TODO*/}
            <h2 className="mt-4">Create Repository</h2>
            <InputGroup className="mt-4" hasValidation>
                <InputGroup.Text>Repository Name</InputGroup.Text>
                <Form.Control id='repo-name-input' name='repo-name'
                              type='text' value={repoName}
                              placeholder='Type Name Here'
                              isValid={valid[0] !== null && valid[0]}
                              isInvalid={valid[0] !== null && !valid[0]}
                       onChange={onChange}/>
                <Form.Control.Feedback type="invalid">
                    Please choose your repository name.
                </Form.Control.Feedback>
            </InputGroup>
            <InputGroup className="mt-4" hasValidation>
                <InputGroup.Text>Start Date of Your Travel</InputGroup.Text>
                <Form.Control id='travel-start-date-input' name='start-date'
                              type='text' value={travelStartDate}
                              placeholder='2020-09-30'
                              isValid={valid[1] !== null && valid[1]}
                              isInvalid={valid[1] !== null && !valid[1]}
                       onChange={onChange}/>
                <Form.Control.Feedback type="invalid">
                    Please choose valid date.
                </Form.Control.Feedback>
            </InputGroup>
            <InputGroup className="mt-4" hasValidation>
                <InputGroup.Text>End Date of Your Travel</InputGroup.Text>
                <FormControl id='travel-end-date-input' name='end-date'
                             type='text' value={travelEndDate}
                             placeholder='2020-09-30'
                             isValid={valid[2] !== null && valid[2]}
                             isInvalid={valid[2] !== null && !valid[2]}
                       onChange={onChange}/>
                <Form.Control.Feedback type="invalid">
                    Please choose valid date.
                </Form.Control.Feedback>
            </InputGroup>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Collaborators</h4>
                <Button className="m-2" id='add-collaborator-button' onClick={addCollaborators}>+</Button>
            </div>
            <h5>
                {collaborators.map(value => <Badge className="m-2 p-sm-2" pill>{value.username} </Badge>)}
            </h5>
            <div className="d-flex flex-row-reverse">
                <Button className="m-2" id='create-repo-button'
                        onClick={createRepos}
                        disabled={!(valid[0] && valid[1] && valid[2])}>Create Repository</Button>
            </div>

            {user && //테스트용 임시 처리
               <AddCollaborators user={user}
                              show={show}
                              setShow={setShow}
                              collaborators={collaborators}
                              setCollaborators={setCollaborators}/>}
        </div>
    )

}