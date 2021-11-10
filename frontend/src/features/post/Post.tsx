import React from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { IPost } from "../../common/Interfaces";
import Profile from "../profile/Profile";
import "./Posts.css";

interface PostProps {
    post: IPost
}

export default function Post(props : PostProps) {
    const { post } = props;
    return (
        <div className="col-lg-4 col-xs-12 mb-4">
            <Link to={`/posts/${post.post_id}`} className="text-decoration-none text-dark">
                <div className="card" style={{ height: "100%" }}>
                    <div className="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                        <img
                            src={post.photos ? post.photos[0].image : ""}
                            className="img-fluid"
                            alt="thumbnail"
                        />
                        <div
                            className="mask"
                            style={{ backgroundColor: "rgba(251, 251, 251, 0.15)" }}
                        />
                    </div>
                    <div className="card-body">
                        <h5 className="card-title">{post.title}</h5>
                        <p className="card-text small text-muted">
                            {post.post_time}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    );
}
