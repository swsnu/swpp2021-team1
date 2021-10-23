import React from "react";
import { Container } from "react-bootstrap";
import Album from "../../common/album/Album";
import Profile from "../profile/Profile";
import './Post.css'

interface PostProps {

}

export default function Post(props : PostProps) {

    return (
        <div>
            <Profile/>
            {/* <hr className="mx-3"/> */}
            <Container className="posts-container">
                {/* <h3 id="posts-label" className="ms-3 pb-2">Posts</h3> */}
                <Album />
            </Container>
        </div>
    )

}