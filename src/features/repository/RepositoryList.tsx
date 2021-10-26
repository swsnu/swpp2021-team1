import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../app/store";
import {IDummyUser, IRepository, IUser} from "../../common/Interfaces";
import {useHistory, useParams} from "react-router-dom";
import * as actionCreator from "./reposSlice";
import Repository from "./Repository";
import Profile from "../profile/Profile";
import {Button, ListGroup} from "react-bootstrap";

interface RepositoryListProps {

}

export default function RepositoryList(props : RepositoryListProps) {

    //assume : repolist로 진입 전에 authSlice의 toBeLoaded가 실행되어 user를 loading해야함.

    const dispatch = useDispatch<AppDispatch>();
    const [userIsLoading] = useSelector<RootState, [boolean, boolean]>(state => [state.auth.isLoading, state.auth.hasError]);
    const [isLoading, hasError] = useSelector<RootState, [boolean, boolean]>(state => [state.repos.isLoading, state.repos.hasError]);
    const [user, repoList] = useSelector<RootState, [IDummyUser|null,IRepository[]]>(state => [state.auth.currentUser, state.repos.repoList]);
    const history = useHistory();
    const params = useParams<{user : string}>();

    useEffect(() => {
        if (user && !userIsLoading) {
            dispatch(actionCreator.getRepoList(user.username));
        }
    }, [dispatch, user])


    //TODO : Error 처리
    return (
        <div>
            <Profile/>
            {
                !isLoading && !hasError && (
                    <>
                        {console.log("hello")}
                        <ListGroup>
                            {repoList.map(value => <Repository repository={value} />)}
                        </ListGroup>
                        <div className="d-grid gap-3">
                            <Button variant='outline-primary'
                                    size="lg"
                                    id='repo-create-button'
                                    onClick={() => history.push('/repos/create')}>+</Button>
                        </div>
                    </>
                )
            }
        </div>
    )
}