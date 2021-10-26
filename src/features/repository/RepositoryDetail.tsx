import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../app/store";
import {IDummyUser, IRepository, IUser} from "../../common/Interfaces";
import {useHistory, useParams} from "react-router-dom";
import * as actionCreator from "./reposSlice";
import AddCollaborators from "./popup/AddCollaborators";
import {Badge, Button} from "react-bootstrap";

interface RepositoryDetailProps {

}

export default function RepositoryDetail(props : RepositoryDetailProps) {

    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, hasError] = useSelector<RootState, [boolean, boolean]>(state => [state.repos.isLoading, state.repos.hasError]);
    const [user, currentRepo] = useSelector<RootState, [IUser,IRepository|null]>(state => [state.auth.account as IUser, state.repos.currentRepo]);
    const history = useHistory();
    const params = useParams<{id : string}>();
    const [show, setShow] = useState<boolean>(false);

    useEffect(() => {
        dispatch(actionCreator.getRepo(parseInt(params.id)));
    }, [dispatch])

    function addCollaborators() {
        setShow(true);
    }

    function setCollaborators(collaborators : IDummyUser[]) {
        dispatch(actionCreator.changeCollaborators({repoID : currentRepo?.repo_id as number, users : collaborators}));
    }

    if (hasError) return (<div>Error!</div>)
    if (!currentRepo) return null;
    const hasAuth = user && currentRepo.collaborator_list.filter(value => user.username === value.username).length > 0;
    return (
        <div>
            <h2>{currentRepo.repo_name}</h2>
            <h4>{currentRepo.travel_start_date + '~' + currentRepo.travel_end_date}</h4>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Collaborators</h4>
                {hasAuth && <Button className="m-2" id='add-collaborator-button' onClick={addCollaborators}>+</Button>}
            </div>
            <h5>
                {currentRepo.collaborator_list.map(value => <Badge className="m-2 p-sm-2" pill>{value.username} </Badge>)}
            </h5>
            {user && /*테스트용 임시 처리*/hasAuth &&
            <AddCollaborators user={user}
                              show={show}
                              setShow={setShow}
                              collaborators={currentRepo.collaborator_list}
                              setCollaborators={setCollaborators}/>}
        </div>
    )

}