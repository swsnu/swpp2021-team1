import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, ListGroup } from "react-bootstrap";
import { AppDispatch, RootState } from "../../app/store";
import { IRepository, IUser } from "../../common/Interfaces";
import * as actionCreator from "./reposSlice";
import Repository from "./Repository";

// suppress tsx-no-component-props
export default function RepositoryList() {
    const dispatch = useDispatch<AppDispatch>();
    const userIsLoading = useSelector<RootState, boolean>((state) => state.auth.isLoading);
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

    function onClick() {
        dispatch(actionCreator.toBeLoaded(null));
        history.push("/repos/create");
    }

    return (
        <div>
            {
                !isLoading && !hasError && (
                    <>
                        <ListGroup>
                            {repoList.map((value) => (
                                <React.Fragment key={value.repo_id.toString()}>
                                    <Repository repository={value} />
                                </React.Fragment>
                            ))}
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
