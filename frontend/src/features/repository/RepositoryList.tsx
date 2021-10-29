import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, ListGroup } from "react-bootstrap";
import { AppDispatch, RootState } from "../../app/store";
import { IRepository, IUser, Visibility } from "../../common/Interfaces";
import * as actionCreator from "./reposSlice";
import Repository from "./Repository";
import Profile from "../profile/Profile";
import { signIn } from "../auth/authSlice";

interface RepositoryListProps {

}

export default function RepositoryList(props : RepositoryListProps) {
    // assume : repolist로 진입 전에 authSlice의 toBeLoaded가 실행되어 user를 loading해야함.

    const dispatch = useDispatch<AppDispatch>();
    const [userIsLoading, userHasError] = useSelector<RootState, [boolean, boolean]>((state) =>
        [state.auth.isLoading, state.auth.hasError]);
    const [isLoading, hasError] = useSelector<RootState, [boolean, boolean]>((state) =>
        [state.repos.isLoading, state.repos.hasError]);
    const [account, user, repoList] = useSelector<RootState, [IUser|null, IUser|null, IRepository[]]>((state) =>
        [state.auth.account, state.auth.currentUser, state.repos.repoList]);
    const history = useHistory();

    useEffect(() => {
        if (user && !userIsLoading) {
            dispatch(actionCreator.fetchRepositories(user.username));
        }
    }, [dispatch, user]);

    useEffect(() => {
    // TODO
    }, [dispatch]);

    function onClick() {
        dispatch(actionCreator.toBeLoaded(null));
        history.push("/repos/create");
    }

    console.log(account?.username);
    console.log(user?.username);

    // TODO : Error 처리
    return (
        <div>
            {
                !isLoading && !hasError && (
                    <>
                        <ListGroup>
                            {repoList.map((value) => <Repository repository={value} />)}
                        </ListGroup>
                        { account && user && account.username === user.username &&
                            (
                                <div className="d-grid gap-3">
                                    <Button
                                        variant="outline-primary"
                                        size="lg"
                                        id="repo-create-button"
                                        onClick={onClick}
                                    >
                                        +
                                    </Button>
                                </div>
                            )}
                    </>
                )
            }
        </div>
    );
}