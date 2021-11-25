import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import * as actionCreator from "./reposSlice";
import { AppDispatch, RootState } from "../../app/store";
import { IRepository } from "../../common/Interfaces";
import "./RepositoryHeader.css";

interface RepositoryHeaderProps {

}

export default function RepositoryHeader(props : RepositoryHeaderProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, hasError] = useSelector<RootState, [boolean, boolean]>((state) =>
        [state.repos.isLoading, state.repos.hasError]);
    const [currentRepo] = useSelector<RootState, [IRepository|null]>((state) =>
        [state.repos.currentRepo]);
    const params = useParams<{id : string}>();

    useEffect(() => {
        if (!currentRepo || currentRepo.repo_id !== parseInt(params.id)) {
            dispatch(actionCreator.fetchRepository(parseInt(params.id)));
        }
    }, [dispatch]);

    if (isLoading) return null;
    if (hasError) return (<div>404 Error : You cannot watch this repository.</div>);
    if (!currentRepo) return (<div>Unexpected Error!</div>);
    return (
        <a href={`/repos/${currentRepo.repo_id}`} className="text-decoration-none text-black">
            <h2 className="mt-4">{currentRepo.repo_name}</h2>
            <h6 className="mt-2">{`${currentRepo.travel_start_date} ~ ${currentRepo.travel_end_date}`}</h6>
        </a>
    );
}
