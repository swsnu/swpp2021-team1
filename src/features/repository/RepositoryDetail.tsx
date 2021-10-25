import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../app/store";
import {IDummyUser, IRepository, IUser} from "../../common/Interfaces";
import {useHistory, useParams} from "react-router-dom";
import {getRepo, getRepoList} from "./reposSlice";

interface RepositoryDetailProps {

}

export default function RepositoryDetail(props : RepositoryDetailProps) {

    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, hasError] = useSelector<RootState, [boolean, boolean]>(state => [state.repos.isLoading, state.repos.hasError]);
    const [user, currentRepo] = useSelector<RootState, [IUser,IRepository|null]>(state => [state.auth.account as IUser, state.repos.currentRepo]);
    const history = useHistory();
    const params = useParams<{id : string}>();

    useEffect(() => {
        dispatch(getRepo(parseInt(params.id)));
    }, [dispatch])



    if (hasError) return (<div>Error!</div>)
    return (
        <div>
            <h2>{currentRepo?.repo_name}</h2>
            <h4>{currentRepo?.travel_start_date + '~' + currentRepo?.travel_end_date}</h4>
            <h3>Collaborators</h3>
            <button>Add Collaborators</button>
        </div>
    )

}