import {
    Button, Form, FormControl, InputGroup, ListGroup, Modal,
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

    function search(query : string) {
        setClicked(null);
        props.onSearch(query);
    }

    return (
        <Modal show={props.show}>
            <Modal.Header>
                <Modal.Title>Add Place</Modal.Title>
            </Modal.Header>
            <InputGroup>
                <FormControl
                    id="place-query-input"
                    type="text"
                    value={query}
                    placeholder="Search Friends"
                    onChange={(event) => setQuery(event.target.value)}
                />
                <Button onClick={() => search(query)} disabled={props.isLoading}>
                    {props.isLoading ? "Loading" : "Search"}
                </Button>
            </InputGroup>
            <ListGroup className="overflow-auto" style={{ height: "30vh" }}>
                {props.queryResult.length > 0 ?
                    props.queryResult.map((value) => (
                        <ListGroup.Item
                            key={value.place_id}
                            onClick={() => onClickPlace(value)}
                            className="d-flex flex-row align-items-start"
                        >
                            <Form.Check
                                className="m-1"
                                type="checkbox"
                                checked={clicked !== null && value.place_id === clicked.place_id}
                                name={value.place_id.toString()}
                                onChange={() => setClicked(value)}
                            />
                            <h6 className="m-2">
                                {`${value.name ? value.name : value.formatted_address}`}
                                {value.name ? (` (${value.formatted_address})`) : ""}
                            </h6>
                        </ListGroup.Item>
                    )) :
                    <ListGroup.Item disabled>No Result</ListGroup.Item>}
            </ListGroup>
            <Modal.Footer>
                <Button variant="primary" onClick={onConfirm} disabled={!clicked}>Confirm</Button>
                <Button variant="primary" onClick={() => props.setShow(false)}>Cancel</Button>
            </Modal.Footer>
        </Modal>
    );
}
