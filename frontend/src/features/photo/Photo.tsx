import { Form, Image, ListGroup } from "react-bootstrap";
import { type } from "os";
import React from "react";
import { IPhoto, Visibility } from "../../common/Interfaces";
import "./Photo.css";

interface PhotoProps {
    photo : IPhoto;
    onClick : (photo_id : number) => void;
    mode : boolean;
    checked : boolean;
    onCheck : (e : React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Photo(props : PhotoProps) {
    return (
        <button
            className="photo-wrapper-button m-1"
            disabled={props.mode}
            onClick={() => props.onClick(props.photo.photo_id)}
            type="button"
        >
            <Image className="h-100" src={props.photo.image} alt={props.photo.image} rounded />
            {props.mode && (
                <Form.Check
                    className="photo-checkbox m-1 me-3"
                    type="checkbox"
                    checked={props.checked}
                    name={props.photo.photo_id.toString()}
                    onChange={(e) => props.onCheck(e)}
                />
            )}
        </button>
    );
}
