import {
    Button, Dropdown, FormControl, InputGroup, Modal,
} from "react-bootstrap";
import React, { useState } from "react";
import { PlaceQueryResult } from "../routeSlice";
import { SetStateAction } from "../../../common/Interfaces";

interface SearchPlaceProps {
    queryResult : PlaceQueryResult[],
    isLoading : boolean,
    onConfirm : (place : PlaceQueryResult) => void,
    onSearch : (query : string) => void,
    show : boolean,
    setShow : SetStateAction<boolean>,
}

export default function SearchPlace(props : SearchPlaceProps) {
    const [query, setQuery] = useState<string>("");
    const [clicked, setClicked] = useState<PlaceQueryResult|null>(null);

    function onClickPlace(item : PlaceQueryResult) {
        setClicked(item);
    }

    function onConfirm() {
        props.onConfirm((clicked as PlaceQueryResult));
        props.setShow(false);
    }

    return (
        <Modal show={props.show}>
            <Modal.Header>
                <Modal.Title>Add Place</Modal.Title>
            </Modal.Header>
            <Dropdown className="d-grid gap-3">
                <Dropdown.Toggle className="d-flex" split variant="primary" id="dropdown-basic">
                    <InputGroup>
                        <FormControl
                            id="place-query-input"
                            type="text"
                            value={query}
                            placeholder="Search Friends"
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        <Button onClick={() => props.onSearch(query)} disabled={props.isLoading}>
                            {props.isLoading ? "Loading" : "Search"}
                        </Button>
                    </InputGroup>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {props.queryResult.length > 0 ?
                        props.queryResult.map((value) => (
                            <Dropdown.Item
                                key={value.place_id}
                                onClick={() => onClickPlace(value)}
                            >
                                <h6>
                                    {`${value.name ? value.name : value.formatted_address}`}
                                    {value.name ? (` (${value.formatted_address})`) : ""}
                                </h6>
                            </Dropdown.Item>
                        )) :
                        <Dropdown.Item disabled>No Result</Dropdown.Item>}
                </Dropdown.Menu>
                <div className="ms-2 me-2 mt-4">
                    <h5>
                        {`Selected Place : ${(clicked && clicked.name) ? clicked.name :
                            (clicked ? clicked.formatted_address : "")}`}
                    </h5>
                    {clicked && clicked.name && (
                        <div>
                            <h6>{clicked.formatted_address}</h6>
                        </div>
                    )}
                </div>
            </Dropdown>
            <Modal.Footer>
                <Button variant="primary" onClick={onConfirm} disabled={!clicked}>Confirm</Button>
                <Button variant="primary" onClick={() => props.setShow(false)}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
}
