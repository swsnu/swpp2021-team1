import {
    Button, Form, Image, InputGroup, Modal,
} from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { IPhoto, SetStateAction } from "../../../common/Interfaces";

interface FocusedPhotoProps {
    photo : IPhoto;
    onEdit : (str : string) => void;
    show : boolean;
    setShow : SetStateAction<boolean>;
}

export default function FocusedPhoto(props : FocusedPhotoProps) {
    const [tag, setTag] = useState<string>(props.photo.tag as string);

    function onClose() {
        props.onEdit(tag);
        props.setShow(false);
    }

    return (
        <Modal show={props.show} onHide={onClose}>
            <Modal.Header closeButton />
            <Image src={props.photo.image} alt={props.photo.image} rounded />
            <Modal.Footer>
                <InputGroup className="mb-3">
                    <Form.Control
                        type="text"
                        value={tag}
                        placeholder="Explain your photo"
                        onChange={(event) => setTag(event.target.value)}
                    />
                </InputGroup>
            </Modal.Footer>
        </Modal>
    );
}
