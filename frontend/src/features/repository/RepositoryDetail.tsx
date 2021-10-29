import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { Badge, Button } from "react-bootstrap";
import { AppDispatch, RootState } from "../../app/store";
import { IRepository, IUser } from "../../common/Interfaces";
import * as actionCreator from "./reposSlice";
import AddCollaborators from "./popup/AddCollaborators";
import RepositorySettings from "./RepositorySettings";

interface RepositoryDetailProps {

}

enum RepositoryTab {
    Group, Mine, Setting
}

export default function RepositoryDetail(props : RepositoryDetailProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [userIsLoading, userHasError] = useSelector<RootState, [boolean, boolean]>((state) =>
        [state.auth.isLoading, state.auth.hasError]);
    const [isLoading, hasError] = useSelector<RootState, [boolean, boolean]>((state) =>
        [state.repos.isLoading, state.repos.hasError]);
    const [user, currentRepo] = useSelector<RootState, [IUser|null, IRepository|null]>((state) =>
        [state.auth.account, state.repos.currentRepo]);
    const history = useHistory();
    const params = useParams<{id : string}>();
    const [tab, setTab] = useState<RepositoryTab>(RepositoryTab.Group);

    useEffect(() => {
    // TODO if (!user) dispatch(actionCreator.getAccount());
        if (!currentRepo || currentRepo.repo_id !== parseInt(params.id)) {
            dispatch(actionCreator.fetchRepository(parseInt(params.id)));
        }
    }, [dispatch]);

    // if (userIsLoading) return null;
    if (userHasError) return (<Redirect to="/login" />); // TODO
    if (isLoading) return null;
    if (hasError) return (<div>Error!</div>);
    if (!currentRepo) return (<div>Unexpected Error!</div>);
    const hasAuth = user && currentRepo.collaborators.filter((value) => user.username === value.username).length > 0;
    return (
        <div>
            <h2>{currentRepo.repo_name}</h2>
            <h4>{`${currentRepo.travel_start_date}~${currentRepo.travel_end_date}`}</h4>
            <Button />
            {" "}
            {/* TODO */}
            {tab === RepositoryTab.Setting && <RepositorySettings />}
        </div>
    );
}
