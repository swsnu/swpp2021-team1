import React from "react";
import {IRepository} from "../../common/Interfaces";
import {Badge, ListGroup} from "react-bootstrap";
import {useHistory} from "react-router-dom";
import "./Repository.css"

interface RepositoryProps {
    repository : IRepository;
}

export default function Repository(props : RepositoryProps) {

    const history = useHistory();
    let collabString : string = "";
    props.repository.collaborators.forEach(value => collabString += (value.username + ', '))
    collabString = collabString.slice(0, collabString.length-2);
    collabString = "johndoe, ddony_0530" //테스팅용 임시

    return (
        <ListGroup.Item className="d-flex justify-content-between align-items-start"
                        variant="primary"
                        action onClick={() => history.push(`/repos/${props.repository.repo_id}`)}>
            <div className="ms-2 me-auto">
                <h5 className="fw-bold">{props.repository.repo_name}</h5>
                {collabString}
            </div>
            <Badge pill>
                {props.repository.travel_start_date + '~' + props.repository.travel_end_date}
            </Badge>
        </ListGroup.Item>
    )

}