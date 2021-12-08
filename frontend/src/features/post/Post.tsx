import "./Posts.css";

import React from "react";
import { Link } from "react-router-dom";

import { IPost } from "../../common/Interfaces";

interface PostProps {
    post: IPost
}

// PostList에 보여지는 Post 미리보기 엔트리
export default function Post(props : PostProps) {
    const { post } = props; // Post object
    return (
        <div className=" post col-lg-4 col-xs-12 mb-4">
            <Link to={`/posts/${post.post_id}`} className="text-decoration-none text-dark">
                <div className="card" style={{ height: "100%" }}>
                    <div className="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
                        <img
                            src={post.photos.length > 0 ? post.photos[0].image : ""}
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
