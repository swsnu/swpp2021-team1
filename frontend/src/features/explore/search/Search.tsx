import {
    Button, Dropdown, DropdownButton, FormControl, InputGroup, ListGroup,
} from "react-bootstrap";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { IRepositorySearch, IUser } from "../../../common/Interfaces";
import * as actionCreators from "./searchSlice";
import Friend from "../../profile/Friend";
import RepositorySearch from "./RepositorySearch";
import "./Search.css";

// suppress tsx-no-component-props
export default function Search() {
    const [query, setQuery] = useState<string>("");
    const [mode, setMode] = useState<string>("User");
    const [isLoading, userResult, repositoryResult, searchInfo] = useSelector<RootState,
        [boolean, IUser[], IRepositorySearch[], string|null]>((state) =>
            [state.search.isLoading, state.search.userResult, state.search.repositoryResult, state.search.searchInfo]);
    const dispatch = useDispatch<AppDispatch>();

    function search(mode : string, query : string) {
        switch (mode) {
        case "User":
            dispatch(actionCreators.searchUser(query));
            break;
        case "Repository":
            dispatch(actionCreators.searchRepository(query));
            break;
        case "Region":
            dispatch(actionCreators.searchRegion(query));
            break;
        default:
            break;
        }
        dispatch(actionCreators.saveSearchInfo(`${mode} - ${query}`));
    }

    return (
        <div className="mt-4">
            <InputGroup className="m-auto">
                <DropdownButton
                    variant="outline-secondary"
                    id="search-mode-dropdown"
                    title={mode}
                >
                    <Dropdown.Item onClick={() => setMode("User")}>
                        User
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setMode("Repository")}>
                        Repository
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setMode("Region")}>
                        Region
                    </Dropdown.Item>
                </DropdownButton>
                <FormControl
                    id="search-query-input"
                    type="text"
                    value={query}
                    placeholder="Enter your keywords."
                    onChange={(event) => setQuery(event.target.value)}
                />
                <Button
                    style={{ width: "6rem" }}
                    id="search-button"
                    onClick={() => search(mode, query)}
                    disabled={isLoading || query.length < 3}
                >
                    {isLoading ? "Loading" : "Search"}
                </Button>
            </InputGroup>
            {!isLoading && searchInfo && (
                userResult.length + repositoryResult.length === 0 ?
                    <h6 className="fst-italic mt-5">{`No result for ${searchInfo} :(`}</h6> : (
                        <h6 className="fst-italic mt-5">
                            {`Result for ${searchInfo} : ${userResult.length + repositoryResult.length}`}
                        </h6>
                    )
            )}
            {!isLoading && (
                <div className="mt-3">
                    <ListGroup className="overflow-auto">
                        {userResult.map((value) => (
                            <React.Fragment key={value.username}>
                                <Friend friend={value} />
                            </React.Fragment>
                        ))}
                    </ListGroup>
                    <ListGroup className="overflow-auto">
                        {repositoryResult.map((value) => (
                            <React.Fragment key={value.repo_id}>
                                <RepositorySearch repositorySearch={value} />
                            </React.Fragment>
                        ))}
                    </ListGroup>
                </div>
            )}
        </div>
    );
}
