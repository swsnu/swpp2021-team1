import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useHistory, useParams } from "react-router-dom";
import {
    Badge, Button, Tab, Tabs,
} from "react-bootstrap";
import { AppDispatch, RootState } from "../../app/store";
import { IRepository, IUser } from "../../common/Interfaces";
import * as actionCreator from "./reposSlice";
import AddCollaborators from "./popup/AddCollaborators";
import RepositorySettings from "./tab/RepositorySettings";
import Group from "./tab/Group";
import Mine from "./tab/Mine";

interface RepositoryDetailProps {

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

    useEffect(() => {
        if (!currentRepo || currentRepo.repo_id !== parseInt(params.id)) {
            dispatch(actionCreator.fetchRepository(parseInt(params.id)));
        }
    }, [dispatch]);

    if (userIsLoading) return null;
    if (isLoading) return null;
    if (hasError) return (<div>404 Error : You cannot watch this repository.</div>);
    if (!currentRepo) return (<div>Unexpected Error!</div>);
    const hasAuth = user && currentRepo.collaborators.filter((value) => user.username === value.username).length > 0;
    return (
        <div>
            <h2 className="mt-3">{currentRepo.repo_name}</h2>
            <h5 className="mt-3">{`${currentRepo.travel_start_date} ~ ${currentRepo.travel_end_date}`}</h5>
            <Tabs defaultActiveKey="group" className="mt-3">
                <Tab eventKey="group" title="Group">
                    <Group />
                </Tab>
                <Tab eventKey="mine" title="Mine">
                    <Mine />
                </Tab>
                { hasAuth && (
                    <Tab eventKey="setting" title="Setting">
                        <RepositorySettings />
                    </Tab>
                )}
            </Tabs>
        </div>
    );
}
