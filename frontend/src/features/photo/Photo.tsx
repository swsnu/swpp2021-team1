import {Form, ListGroup } from "react-bootstrap";
import {IPhoto, Visibility} from "../../common/Interfaces";
import {type} from "os";
import React from "react";

interface PhotoProps {
    photo : IPhoto;
    onClick : (photo_id : number) => void;
    mode : boolean;
    checked : boolean;
    onCheck : (e : React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Photo(props : PhotoProps) {
    return (
        <ListGroup.Item>
            <button disabled={props.mode} onClick={() => props.onClick(props.photo.photo_id)} type="button">
                <img src={props.photo.image} alt={props.photo.image} />
                <Form.Check
                    type="checkbox"
                    checked={props.checked}
                    name={props.photo.photo_id.toString()}
                    onChange={(e) => props.onCheck(e)}
                />
            </button>
        </ListGroup.Item>
    );
}
