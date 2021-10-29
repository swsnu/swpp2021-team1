import React, {useState} from "react";
import {Badge, Button} from "react-bootstrap";
import AddCollaborators from "./popup/AddCollaborators";
import {IRepository, IUser} from "../../common/Interfaces";
import * as actionCreator from "./reposSlice";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../app/store";
import {useHistory, useParams} from "react-router-dom";

interface RepositorySettingProps {

}

export default function RepositorySettings(props : RepositorySettingProps) {


    const dispatch = useDispatch<AppDispatch>()
    const [show, setShow] = useState<boolean>(false);
    const [user, currentRepo] = useSelector<RootState, [IUser,IRepository]>(state =>
        [state.auth.account as IUser, state.repos.currentRepo as IRepository]);

    function addCollaborators() {
        setShow(true);
    }

    function setCollaborators(collaborators : IUser[]) {
        dispatch(actionCreator.addCollaborators({
            repoID : currentRepo?.repo_id as number,
            users : collaborators.map(value => value.username)}));
    }

    return (
        <div>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Collaborators</h4>
                <Button className="m-2" id='add-collaborator-button' onClick={addCollaborators}>+</Button>
            </div>
            <h5>
                {currentRepo.collaborators.map(value => <Badge className="m-2 p-sm-2" pill>{value.username} </Badge>)}
            </h5>
            <AddCollaborators user={user}
                              show={show}
                              setShow={setShow}
                              collaborators={currentRepo.collaborators}
                              setCollaborators={setCollaborators}/>
        </div>
    )
}