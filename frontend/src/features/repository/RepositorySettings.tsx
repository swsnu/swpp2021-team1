import React, { useState } from "react";
import {
    Badge, Button, Form, FormControl, InputGroup,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import AddCollaborators from "./popup/AddCollaborators";
import { IRepository, IUser, Visibility } from "../../common/Interfaces";
import * as actionCreator from "./reposSlice";
import { AppDispatch, RootState } from "../../app/store";

interface RepositorySettingProps {

}

export default function RepositorySettings(props : RepositorySettingProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [user, repo] = useSelector<RootState, [IUser, IRepository]>((state) =>
        [state.auth.account as IUser, state.repos.currentRepo as IRepository]);
    const [repoName, setRepoName] = useState<string>(repo.repo_name);
    const [travelStartDate, setTravelStartDate] = useState<string>(repo.travel_start_date);
    const [travelEndDate, setTravelEndDate] = useState<string>(repo.travel_end_date);
    const [show, setShow] = useState<boolean>(false);
    const [valid, setValid] = useState<(boolean)[]>([true, true, true]);
    const [visibility, setVisibility] = useState<Visibility>(repo.visibility);
    const history = useHistory();

    function onChange(event : React.ChangeEvent<HTMLInputElement>) {
        switch (event.target.name) {
        case "repo-name":
            setRepoName(event.target.value);
            if (event.target.value !== "") setValid([true, valid[1], valid[2]]);
            else setValid([false, valid[1], valid[2]]);
            break;
        case "start-date":
            setTravelStartDate(event.target.value);
            if (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(event.target.value)) {
                setValid([valid[0], true, valid[2]]);
            }
            else {
                setValid([valid[0], false, valid[2]]);
            }
            break;
        case "end-date":
            setTravelEndDate(event.target.value);
            if (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(event.target.value)) {
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

    function addCollaborators() {
        setShow(true);
    }

    function setCollaborators(collaborators : IUser[]) {
        dispatch(actionCreator.addCollaborators({
            repoID: repo.repo_id,
            users: collaborators.map((value) => value.username),
        }));
    }

    function editRepo() {
        dispatch(actionCreator.editRepository({
            repo_id: repo.repo_id,
            repo_name: repoName,
            owner: repo.owner,
            travel_start_date: travelStartDate,
            travel_end_date: travelEndDate,
            visibility,
            collaborators: [],
        }));
    }

    function deleteRepo() {
        dispatch(actionCreator.removeRepository(repo.repo_id))
            .then(() => {
                history.push(`/main/${user.username}`);
            });
    }

    function leaveRepo() {
        dispatch(actionCreator.secedeRepository({ username: user.username, repoID: repo.repo_id }))
            .then(() => {
                history.push(`/main/${user.username}`);
            });
    }

    return (
        <div>
            <h2 className="mt-4">Repository Settings</h2>
            <InputGroup className="mt-4" hasValidation>
                <InputGroup.Text>Repository Name</InputGroup.Text>
                <Form.Control
                    id="repo-name-input"
                    name="repo-name"
                    type="text"
                    value={repoName}
                    placeholder="Type Name Here"
                    isValid={valid[0]}
                    isInvalid={!valid[0]}
                    onChange={onChange}
                />
                <Form.Control.Feedback type="invalid">
                    Please choose your repository name.
                </Form.Control.Feedback>
            </InputGroup>
            <InputGroup className="mt-4" hasValidation>
                <InputGroup.Text>Start Date of Your Travel</InputGroup.Text>
                <Form.Control
                    id="travel-start-date-input"
                    name="start-date"
                    type="text"
                    value={travelStartDate}
                    placeholder="2020-09-30"
                    isValid={valid[1]}
                    isInvalid={!valid[1]}
                    onChange={onChange}
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
                    isValid={valid[2]}
                    isInvalid={!valid[2]}
                    onChange={onChange}
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
                        onChange={(e) => setVisibility(Visibility.ALL)}
                    />
                    <Form.Check
                        inline
                        label="Members' Friends"
                        type="checkbox"
                        checked={visibility === Visibility.MEMBER_AND_FRIENDS}
                        onChange={(e) => setVisibility(Visibility.MEMBER_AND_FRIENDS)}
                    />
                    <Form.Check
                        inline
                        label="Only Members"
                        type="checkbox"
                        checked={visibility === Visibility.ONLY_MEMBERS}
                        onChange={(e) => setVisibility(Visibility.ONLY_MEMBERS)}
                    />
                </div>
            </Form>
            <div className="d-flex flex-row-reverse">
                <Button
                    className="m-2"
                    id="create-repo-button"
                    onClick={editRepo}
                    disabled={!(valid[0] && valid[1] && valid[2])}
                >
                    Change Repository Info
                </Button>
            </div>
            { repo.owner === user.username && (
                <Button
                    onClick={deleteRepo}
                >
                    Delete This Repository
                </Button>
            )}
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Collaborators</h4>
                <Button className="m-2" id="add-collaborator-button" onClick={addCollaborators}>+</Button>
            </div>
            <h5>
                {repo.collaborators.map((value) => (
                    <Badge className="m-2 p-sm-2" pill>
                        {value.username}
                        {" "}
                    </Badge>
                ))}
            </h5>
            <Button
                onClick={leaveRepo}
            >
                Leave This Repository
            </Button>
            <AddCollaborators
                user={user}
                show={show}
                setShow={setShow}
                collaborators={repo.collaborators}
                setCollaborators={setCollaborators}
            />
        </div>
    );
}
