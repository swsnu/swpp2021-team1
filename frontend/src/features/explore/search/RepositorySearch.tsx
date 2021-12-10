import { Badge, ListGroup } from "react-bootstrap";
import React from "react";
import { useHistory } from "react-router-dom";
import { IRepositorySearch } from "../../../common/Interfaces";

interface RepositorySearchProps {
    repositorySearch : IRepositorySearch;
}

export default function RepositorySearch(props : RepositorySearchProps) {
    const history = useHistory();

    return (
        <ListGroup.Item
            className="d-flex justify-content-between align-items-start"
            variant="primary"
            action
            onClick={() => history.push(`/repos/${props.repositorySearch.repo_id}`)}
        >
            <div className="ms-2 me-auto">
                <h5 className="fw-bold">{props.repositorySearch.repo_name}</h5>
            </div>
            <Badge pill>
                {`#${props.repositorySearch.region_address}`}
            </Badge>
            {
                props.repositorySearch.places.map((value) => (
                    <React.Fragment key={value.place_name}>
                        <Badge pill>
                            {`#${value.place_name}`}
                        </Badge>
                    </React.Fragment>
                ))
            }
        </ListGroup.Item>
    );
}
