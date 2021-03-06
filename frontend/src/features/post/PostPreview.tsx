import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useHistory, useParams } from "react-router";
import { getRepositoryPosts } from "../../common/APIs";
import { IPost } from "../../common/Interfaces";
import Post from "./Post";

// suppress no-tsx-component-props
const PostPreview = () => {
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
                <div
                    data-testid="post-preview"
                    className="d-flex mt-4 align-items-center w-100"
                    style={{ justifyContent: "space-between" }}
                >
                    <h4>Posts</h4>
                    <div>
                        <Button
                            className="m-2"
                            id="post-list-button"
                            onClick={() => history.push(`/repos/${repoId}/posts`)}
                        >
                            View More
                        </Button>

                    </div>
                </div>
                <div className="row">
                    {posts.slice(0, 5).map((post) => <Post post={post} key={post.post_id} />)}
                </div>

            </>
        );
    }
    if (loading === "failed") return <div data-testid="error">Failed to load posts</div>;
    return <div data-testid="loading" />;
};

export default PostPreview;
