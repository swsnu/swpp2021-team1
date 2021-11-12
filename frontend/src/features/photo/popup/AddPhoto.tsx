import {
    Button, Modal, Form, Image, CloseButton, ListGroup,
} from "react-bootstrap";
import React, { useState } from "react";
import { IUser, SetStateAction } from "../../../common/Interfaces";
import "./AddPhoto.css";

interface AddPhotoProps {
    show : boolean;
    setShow : SetStateAction<boolean>;
    commitPhotos : (formData : FormData) => void;
}

export default function AddPhoto(props : AddPhotoProps) {
    const [formData, setFormData] = useState<FormData>(new FormData());
    const [srcs, setSrcs] = useState<string[]>([]);
    const [key, setKey] = useState<string>(Date.now().toString());
    const [disabled, setDisabled] = useState<boolean>(false);

    function onAddFiles(event : React.ChangeEvent<HTMLInputElement>) {
        setDisabled(true);
        const temp = new FormData();
        const sources : string[] = [];
        if (!event.target.files) return;
        Array.from(event.target.files).forEach((value, index) => {
            temp.append("image", value);
            const fileReader = new FileReader();
            fileReader.readAsDataURL(value);
            fileReader.onload = (e) => {
                sources.push(e.target?.result as string);
                if (event.target.files && index === event.target.files.length - 1) {
                    setSrcs(sources);
                }
            };
        });
        setFormData(temp);
    }

    function close() {
        props.commitPhotos(formData);
        props.setShow(false);
        reset();
    }

    function reset() {
        setFormData(new FormData());
        setSrcs([]);
        setDisabled(false);
        setKey(Date.now().toString());
    }

    return (
        <Modal
            show={props.show}
            onHide={() => {
                props.setShow(false);
                reset();
            }}
        >
            <Modal.Header>
                <Modal.Title>Select Photos to Add</Modal.Title>
            </Modal.Header>
            <Form.Group controlId="formFileMultiple" className="mb-3">
                <Form.Control
                    key={key}
                    type="file"
                    multiple
                    accept="image/jpeg, image/png"
                    onChange={onAddFiles}
                    disabled={disabled}
                />
            </Form.Group>
            <div className="d-flex flex-row preview-list overflow-auto p-2">
                {srcs.map((value) => (
                    <React.Fragment key={value}>
                        <Image className="h-100 ms-1 me-1" src={value} alt={value} rounded />
                    </React.Fragment>
                ))}
            </div>
            <Modal.Footer>
                <Button variant="primary" onClick={reset}>Reset</Button>
                <Button variant="primary" onClick={close}>Confirm</Button>
            </Modal.Footer>
        </Modal>
    );
}
