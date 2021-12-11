import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import {
    Badge, Button, Form, FormControl, InputGroup,
} from "react-bootstrap";
import { useLocation } from "react-router";
import { AppDispatch, RootState } from "../../app/store";
import {
    IRepository, IUser, SetStateAction, Visibility,
} from "../../common/Interfaces";
import * as actionCreator from "./reposSlice";
import AddCollaborators from "./popup/AddCollaborators";
import { clearResult, PlaceQueryResult, searchRegion } from "../route/routeSlice";
import SearchPlace from "../route/popup/SearchPlace";

// suppress tsx-no-component-props
export default function RepositoryCreate() {
    // assume isLoading이 true 상태

    const dispatch = useDispatch<AppDispatch>();
    const userIsLoading = useSelector<RootState, boolean>((state) => state.auth.isLoading);
    const [isLoading, hasError] = useSelector<RootState, [boolean, boolean]>((state) =>
        [state.repos.isLoading, state.repos.hasError]);
    const [user, repo] = useSelector<RootState, [IUser|null, IRepository|null]>((state) =>
        [state.auth.account, state.repos.currentRepo]);
    const [isQueryLoading, queryResult] = useSelector<RootState, [boolean, PlaceQueryResult[]]>((state) =>
        [state.route.isQueryLoading, state.route.queryResult]);
    const [repoName, setRepoName] = useState<string>("");
    const [travelStartDate, setTravelStartDate] = useState<string>("");
    const [travelEndDate, setTravelEndDate] = useState<string>("");
    const [collaborators, setCollaborators] = useState<IUser[]>(user ? [user] : []);
    const [show, setShow] = useState<boolean>(false);
    const [searchShow, setSearchShow] = useState<boolean>(false);
    const [valid, setValid] = useState<(boolean|null)[]>([null, null, null]);
    const [visibility, setVisibility] = useState<Visibility>(Visibility.ALL);
    const [flag, setFlag] = useState<boolean>(!!user);
    const [region, setRegion] = useState<PlaceQueryResult|null>(null);
    const location = useLocation<{repo_id : number, region_name : string}|undefined>();
    useEffect(() => {
        if (!flag && user) {
            if (collaborators.filter((value) => value.username === user.username).length === 0) {
                setCollaborators([user, ...collaborators]);
            }
            setFlag(true);
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (repo) {
            if (location.state) {
                dispatch(actionCreator.forkRoute({
                    repo_id: repo.repo_id,
                    forked_repo_id: location.state.repo_id,
                }));
            }
            else if (region) {
                dispatch(actionCreator.editRegion({
                    repo_id: repo.repo_id,
                    place_id: region.place_id,
                }));
            }
        }
    }, [dispatch, repo]);

    function addCollaborators() {
        setShow(true);
    }

    function createRepos() {
        dispatch(actionCreator.createRepository({
            repo_id: -1,
            repo_name: repoName,
            owner: user?.username as string,
            travel_start_date: travelStartDate,
            travel_end_date: travelEndDate,
            visibility,
            collaborators,
        }));
    }

    if (userIsLoading) return null;
    return (
        <div>
            {!isLoading && !hasError && <Redirect to={`/repos/${(repo as IRepository).repo_id}`} />}
            <h2 className="mt-4">Create Repository</h2>
            <InputGroup className="mt-4" hasValidation>
                <InputGroup.Text>Repository Name</InputGroup.Text>
                <Form.Control
                    id="repo-name-input"
                    name="repo-name"
                    type="text"
                    value={repoName}
                    placeholder="Type Name Here"
                    isValid={valid[0] !== null && valid[0]}
                    isInvalid={valid[0] !== null && !valid[0]}
                    onChange={(event) =>
                        onChange(
                            event as React.ChangeEvent<HTMLInputElement>,
                            setRepoName,
                            setTravelStartDate,
                            setTravelEndDate,
                            setValid,
                            valid,
                        )}
                />
                <Form.Control.Feedback type="invalid">
                    Please choose your repository name.
                </Form.Control.Feedback>
            </InputGroup>
            <InputGroup className="mt-4">
                <InputGroup.Text>You are traveling to...</InputGroup.Text>
                <Form.Control
                    id="repo-region-input"
                    name="repo-region"
                    type="text"
                    value={location.state ?
                        location.state.region_name : region ?
                            region.formatted_address : ""}
                    readOnly
                />
                <Button id="search-region-button" onClick={() => setSearchShow(true)} disabled={!!location.state}>
                    {location.state ? "Forked" : "Search"}
                </Button>
            </InputGroup>
            <InputGroup className="mt-4" hasValidation>
                <InputGroup.Text>Start Date of Your Travel</InputGroup.Text>
                <Form.Control
                    id="travel-start-date-input"
                    name="start-date"
                    type="text"
                    value={travelStartDate}
                    placeholder="2020-09-30"
                    isValid={valid[1] !== null && valid[1]}
                    isInvalid={valid[1] !== null && !valid[1]}
                    onChange={(event) =>
                        onChange(
                            event as React.ChangeEvent<HTMLInputElement>,
                            setRepoName,
                            setTravelStartDate,
                            setTravelEndDate,
                            setValid,
                            valid,
                        )}
                />
                <Form.Control.Feedback type="invalid">
                    Please choose valid date.
                </Form.Control.Feedback>
            </InputGroup>
            <InputGroup className="mt-4" hasValidation>
                <InputGroup.Text>End Date of Your Travel</InputGroup.Text>
                <FormControl
                    id="travel-end-date-input"
                    name="end-date"
                    type="text"
                    value={travelEndDate}
                    placeholder="2020-09-30"
                    isValid={valid[2] !== null && valid[2]}
                    isInvalid={valid[2] !== null && !valid[2]}
                    onChange={(event) =>
                        onChange(
                            event as React.ChangeEvent<HTMLInputElement>,
                            setRepoName,
                            setTravelStartDate,
                            setTravelEndDate,
                            setValid,
                            valid,
                        )}
                />
                <Form.Control.Feedback type="invalid">
                    Please choose valid date.
                </Form.Control.Feedback>
            </InputGroup>
            <Form className="mt-3">
                <h5>Your repository is visible to...</h5>
                <div className="mt-3">
                    <Form.Check
                        inline
                        label="Anyone"
                        type="checkbox"
                        checked={visibility === Visibility.ALL}
                        onChange={() => setVisibility(Visibility.ALL)}
                    />
                    <Form.Check
                        inline
                        label="Members' Friends"
                        type="checkbox"
                        checked={visibility === Visibility.MEMBER_AND_FRIENDS}
                        onChange={() => setVisibility(Visibility.MEMBER_AND_FRIENDS)}
                    />
                    <Form.Check
                        inline
                        label="Only Members"
                        type="checkbox"
                        checked={visibility === Visibility.ONLY_MEMBERS}
                        onChange={() => setVisibility(Visibility.ONLY_MEMBERS)}
                    />
                </div>
            </Form>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Collaborators</h4>
                <Button className="m-2" id="add-collaborator-button" onClick={addCollaborators}>+</Button>
            </div>
            <h5>
                {collaborators.map((value) => (
                    <React.Fragment key={value.username}>
                        <Badge className="m-2 p-sm-2" pill>
                            {value.username}
                            {" "}
                        </Badge>
                    </React.Fragment>
                ))}
            </h5>
            <div className="d-flex flex-row-reverse">
                <Button
                    className="m-2"
                    id="create-repo-button"
                    onClick={createRepos}
                    disabled={!(valid[0] && valid[1] && valid[2]) || (!region && !location.state)}
                >
                    Create Repository
                </Button>
            </div>

            {user && // 테스트용 임시 처리
               (
                   <AddCollaborators
                       user={user}
                       show={show}
                       setShow={setShow}
                       collaborators={collaborators}
                       setCollaborators={setCollaborators}
                   />
               )}

            <SearchPlace
                queryResult={queryResult}
                isLoading={isQueryLoading}
                onConfirm={(result) => setRegion(result)}
                onSearch={(query) => dispatch(searchRegion(query))}
                onClear={() => dispatch(clearResult(null))}
                show={searchShow}
                setShow={setSearchShow}
            />
        </div>
    );
}

function checkValid(date : string) {
    const check = new Date(date);
    const [y, m, d] = date.split("-");
    return !(check.getFullYear() !== parseInt(y) ||
        check.getMonth() !== parseInt(m) - 1 ||
        check.getDate() !== parseInt(d));
}

export function onChange(event : React.ChangeEvent<HTMLInputElement>,
    setRepoName : SetStateAction<string>,
    setTravelStartDate : SetStateAction<string>,
    setTravelEndDate : SetStateAction<string>,
    setValid : SetStateAction<any[]>,
    valid : (boolean|null)[]) {
    switch (event.target.name) {
    case "repo-name":
        setRepoName(event.target.value);
        if (event.target.value !== "") setValid([true, valid[1], valid[2]]);
        else setValid([false, valid[1], valid[2]]);
        break;
    case "start-date":
        setTravelStartDate(event.target.value);
        if (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(event.target.value) &&
                checkValid(event.target.value)) {
            setValid([valid[0], true, valid[2]]);
        }
        else {
            setValid([valid[0], false, valid[2]]);
        }
        break;
    case "end-date":
        setTravelEndDate(event.target.value);
        if (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(event.target.value) &&
                checkValid(event.target.value)) {
            setValid([valid[0], valid[1], true]);
        }
        else {
            setValid([valid[0], valid[1], false]);
        }
        break;
    default:
        break;
    }
}
