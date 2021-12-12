import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import * as actionCreator from "./reposSlice";
import { AppDispatch, RootState } from "../../app/store";
import { IRepository, IUser, RepoTravel } from "../../common/Interfaces";
import "./RepositoryHeader.css";
import megaphone from "../../common/assets/megaphone.svg";
import help from "../../common/assets/help.svg";
import error from "../../common/assets/error.svg";

// suppress tsx-no-component-props
export default function RepositoryHeader() {
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, hasError] = useSelector<RootState, [boolean, boolean]>((state) =>
        [state.repos.isLoading, state.repos.hasError]);
    const [user, currentRepo] = useSelector<RootState, [IUser|null, IRepository|null]>((state) =>
        [state.auth.account, state.repos.currentRepo]);
    const params = useParams<{id : string}>();
    const [on, setOn] = useState<boolean>(false);

    useEffect(() => {
        if (!currentRepo || currentRepo.repo_id !== parseInt(params.id)) {
            dispatch(actionCreator.fetchRepository(parseInt(params.id)));
        }
    }, [dispatch]);

    useEffect(() => {
        if (currentRepo) {
            setOn(!!currentRepo.travel && currentRepo.travel === RepoTravel.TRAVEL_ON);
        }
    }, [dispatch, currentRepo]);

    function toggleRepoPost(event : React.ChangeEvent<HTMLInputElement>) {
        const toggled = event.target.checked ? RepoTravel.TRAVEL_ON : RepoTravel.TRAVEL_OFF;
        dispatch(actionCreator.changeRepoPost({ repo_id: (currentRepo as IRepository).repo_id, travel: toggled }));
        setOn(event.target.checked);
    }

    if (isLoading) return null;
    if (hasError) {
        return (
            <h3 className="mt-5 fst-italic">
                <img src={error} alt={error} height="45" className="me-3" />
                404 Error : Repository Not Found :(
            </h3>
        );
    }
    if (!currentRepo) return (<div>Unexpected Error!</div>);
    const hasAuth = user && currentRepo.collaborators.filter((value) => user.username === value.username).length > 0;
    return (
        <div className="d-flex mt-4 justify-content-between align-items-start">
            <a href={`/repos/${currentRepo.repo_id}`} className="text-decoration-none text-black">
                <h2 className="mt-4">{currentRepo.repo_name}</h2>
                <h6 className="mt-2">{`${currentRepo.travel_start_date} ~ ${currentRepo.travel_end_date}`}</h6>
            </a>
            {hasAuth && (
                <div className="mt-4 me-4 d-flex flex-row">
                    <img
                        className="me-3"
                        height="35"
                        src={megaphone}
                        alt={megaphone}
                    />
                    <Form.Check
                        className="me-3 big-toggle"
                        type="switch"
                        id="custom-switch"
                        checked={on}
                        onChange={toggleRepoPost}
                    />
                    <OverlayTrigger
                        placement="bottom"
                        delay={{ show: 150, hide: 250 }}
                        overlay={(
                            <Tooltip>
                                Enabling it will expose your repository to others&#39; feeds.
                            </Tooltip>
                        )}
                    >
                        {({ ref, ...triggerHandler }) => (
                            <img
                                className="helper"
                                height="25"
                                ref={ref}
                                {...triggerHandler}
                                src={help}
                                alt={help}
                            />
                        )}
                    </OverlayTrigger>
                </div>
            )}
        </div>
    );
}
