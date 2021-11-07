import { FloatingLabel, Form } from "react-bootstrap";
import { useState } from "react";

interface DiscussionCreateProps {

}

export default function DiscussionCreate(props : DiscussionCreateProps) {
    const [title, setTitle] = useState<string>("");
    const [text, setText] = useState<string>("");

    return (
        <div>
            <FloatingLabel label="Title">
                <Form.Control
                    as="textarea"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
            </FloatingLabel>
            <FloatingLabel label="Content">
                <Form.Control
                    as="textarea"
                    style={{ height: "600px" }}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                />
            </FloatingLabel>
        </div>
    );
}
