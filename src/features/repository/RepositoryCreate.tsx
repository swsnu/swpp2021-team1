import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../app/store";
import {IDummyUser, IRepository, IUser} from "../../common/Interfaces";
import {Redirect, useParams} from "react-router-dom";
import {addRepo} from "./reposSlice";
import {Badge, Button, CloseButton, FormControl, InputGroup} from "react-bootstrap";
import AddCollaborators from "./popup/AddCollaborators";
import {logIn} from "../auth/authSlice";

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

    useEffect(() => {
        dispatch(logIn({email : 'asdf', password : 'asdf'})) //테스트용 임시 처리
    }, [dispatch])

    function addCollaborators() {
        setShow(true);
    }

    function createRepos() {
        //TODO : 날짜 test 필요
        dispatch(addRepo({
            repo_id : -1,
            repo_name : repoName,
            travel_start_date : travelStartDate,
            travel_end_date : travelEndDate,
            collaborator_list : collaborators,
        }))
    }

    //TODO : Error 처리
    return (
        <div>
            {!isLoading && repo && <Redirect to={`/repos/${repo.repo_id}`}/>}
            <h2 className="mt-4">Create Repository</h2>
            <InputGroup className="mt-4">
                <InputGroup.Text>Repository Name</InputGroup.Text>
                <FormControl id='repo-name-input' type='text' value={repoName} placeholder='Type Name Here'
                       onChange={event => setRepoName(event.target.value)}/>
            </InputGroup>
            <InputGroup className="mt-4">
                <InputGroup.Text>Start Date of Your Travel</InputGroup.Text>
                <FormControl id='travel-start-date-input' type='text' value={travelStartDate} placeholder='Type Start Date Here'
                       onChange={event => setTravelStartDate(event.target.value)}/>
            </InputGroup>
            <InputGroup className="mt-4">
                <InputGroup.Text>End Date of Your Travel</InputGroup.Text>
                <FormControl id='travel-end-date-input' type='text' value={travelEndDate} placeholder='Type End Date Here'
                       onChange={event => setTravelEndDate(event.target.value)}/>
            </InputGroup>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Collaborators</h4>
                <Button className="m-2" id='add-collaborator-button' onClick={addCollaborators}>+</Button>
            </div>
            <h5>
                {collaborators.map(value => <Badge className="m-2 p-sm-2" pill>{value.username} </Badge>)}
            </h5>
            <div className="d-flex flex-row-reverse">
                <Button className="m-2" id='create-repo-button' onClick={createRepos}>Create Repository</Button>
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