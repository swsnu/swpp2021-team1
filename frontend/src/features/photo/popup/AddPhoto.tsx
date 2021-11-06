import {
    Button, Modal, Form, Image,
} from "react-bootstrap";
import React, { useState } from "react";
import { IUser, SetStateAction } from "../../../common/Interfaces";

interface AddPhotoProps {
    show : boolean;
    setShow : SetStateAction<boolean>;
    commitPhotos : (formData : FormData) => void;
}

export default function AddPhoto(props : AddPhotoProps) {
    const [formData, setFormData] = useState<FormData>(new FormData());
    const [srcs, setSrcs] = useState<string[]>([]);

    function onAddFiles(event : React.ChangeEvent<HTMLInputElement>) {
        const temp = new FormData();
        const sources : string[] = [];
        if (!event.target.files) return;
        Array.from(event.target.files).forEach((value, index) => {
            temp.append("file", value);
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
    }

    function onDelete(src : string) {
        let key = -1;
        const newSrc = srcs.filter((value, index) => {
            if (value === src) key = index;
            return (value !== src);
        });
        setSrcs(newSrc);
        const newFormData = new FormData();
        formData.getAll("file").forEach((value, index) => {
            if (index !== key) {
                newFormData.append("file", value);
            }
        });
        setFormData(newFormData);
    }

    return (
        <Modal show={props.show}>
            <Modal.Header>
                <Modal.Title>Select Photos to Add</Modal.Title>
            </Modal.Header>
            <Form.Group controlId="formFileMultiple" className="mb-3">
                <Form.Control type="file" multiple accept="image/jpeg, image/png" onChange={onAddFiles} />
            </Form.Group>
            {srcs.map((value) => (
                <React.Fragment key={value}>
                    <Preview src={value} onDelete={() => onDelete(value)} />
                </React.Fragment>
            ))}
            <Modal.Footer>
                <Button variant="primary" onClick={close}>Confirm</Button>
            </Modal.Footer>
        </Modal>
    );
}

interface PreviewProps {
    src : string;
    onDelete : () => void;
}

function Preview(props : PreviewProps) {
    return (
        <>
            <Image src={props.src} alt={props.src} thumbnail />
            <button type="button" onClick={props.onDelete}>X</button>
        </>
    );
}
