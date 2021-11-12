import React, { useEffect, useState } from "react";
import { Pagination, Button } from "react-bootstrap";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { setConstantValue } from "typescript";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { getRepositoryPosts } from "../../common/APIs";
import { IPost } from "../../common/Interfaces";
import PlusButton from "../../common/plusButton/PlusButton";
import Post from "./Post";
import { fetchRepoPosts, fetchUserPosts, postsSelectors } from "./postsSlice";

// Post[], create-post-button

interface PostPreviewProps {

}

const PostPreview = (props: PostPreviewProps) => {
    const history = useHistory();
    const repoId = parseInt(useParams<{id: string}>().id);
    const [loading, setLoading] = useState<"idle" | "pending" | "succeeded" | "failed">("idle");
    const [posts, setPosts] = useState<IPost[]>([]);

    useEffect(() => {
        const fetchRepoPosts = async () => {
            setLoading("pending");
            try {
                const fetchedPosts = await getRepositoryPosts(repoId);
                setPosts(fetchedPosts);
                setLoading("succeeded");
            }
            catch (e) {
                setLoading("failed");
            }
        };
        if (loading === "idle") {
            fetchRepoPosts();
        }
    }, [loading]);

    if (loading === "succeeded") {
        return (
            <>
                {" "}
                <div className="d-flex mt-4 align-items-center w-100" style={{ justifyContent: "space-between" }}>
                    <h4>Posts</h4>
                    <div>
                        <Button
                            className="m-2"
                            id="post-list-button"
                            onClick={() => history.push(`/repos/${repoId}/posts`)}
                        >
                            View More
                        </Button>
                        <Button
                            className="m-2"
                            id="post-create-button"
                            onClick={() => {
                                history.push(`/repos/${repoId}/posts/create`);
                            }}
                        >
                            +
                        </Button>

                    </div>
                </div>
                <div className="row">
                    {posts.slice(0, 5).map((post) => <Post post={post} key={post.post_id} />)}
                </div>

            </>
        );
    }
    if (loading === "failed") return <>Failed to load posts</>;
    return <></>;
};

export default PostPreview;
