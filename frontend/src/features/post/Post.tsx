import React from "react";
import { Container } from "react-bootstrap";
import Profile from "../profile/Profile";
import "./Post.css";

interface PostProps {

}

export default function Post(props : PostProps) {
    return (
        <div>
            {/* <hr className="mx-3"/> */}
            <Container className="posts-container">
                {/* <h3 id="posts-label" className="ms-3 pb-2">Posts</h3> */}
                {/* <Album /> */}
            </Container>
        </div>
    );
}
