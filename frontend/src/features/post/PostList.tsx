import React, { useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { IPost } from "../../common/Interfaces";

interface PostListProps {

}

// Post[], create-post-button

const PostList = (props: PostListProps) => {
    const dispatch = useAppDispatch();
    const [posts, setPosts] = useState<IPost[]>([]);
    return (
        <div />
    );
};

export default PostList;
