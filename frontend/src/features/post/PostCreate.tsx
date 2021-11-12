import {
    Button, DropdownButton, FloatingLabel, Form,
} from "react-bootstrap";
import React, { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { useHistory, useLocation } from "react-router";
import { AppDispatch, RootState } from "../../app/store";
import {
    IDiscussion, IPhoto, IPost, IRepository,
} from "../../common/Interfaces";
import { newRepoPost } from "./postsSlice";
import {
    getPhotos, getPost, getRepositories, getRepository,
} from "../../common/APIs";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import PCPhotoSelect from "./PCPhotoSelect";

interface PostcreateProps {
    mode: "create/user" | "create/repo" | "edit"
}

export default function Postcreate(props : PostcreateProps) {
    const [loading, setLoading] = useState<"pending" | "idle" | "succeeded" | "failed">("idle");
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.auth.account);
    const [allPhotos, setAllPhotos] = useState<IPhoto[]>([]);

    const [repoOptions, setRepoOptions] = useState<IRepository[]>([]); // Repos to show up in Dropdown list
    const [photoOptions, setPhotoOptions] = useState<IPhoto[]>([]);

    const [title, setTitle] = useState<string>("");
    const [text, setText] = useState<string>("");
    const [selectedPhotos, setSelectedPhotos] = useState<IPhoto[]>([]);
    const [selectedRepoId, setSelectedRepoId] = useState<number>(-1);
    const [submitEnabled, setSubmitEnabled] = useState<boolean>(false);
    const post = useSelector<RootState, IPost|null>((state) => state.posts.currentPost);

    const params = useParams<{repo_id: string | undefined, post_id: string | undefined}>();

    const [currentPost, setCurrentPost] = useState<IPost | null>(null); // Only in "edit"

    const history = useHistory();

    const onRepoSelect = (e: FormEvent<HTMLSelectElement>): void =>
        setSelectedRepoId(parseInt(e.currentTarget.value));

    useEffect(() => {
        if (title && text && selectedPhotos.length > 0 && selectedRepoId) setSubmitEnabled(true);
        else setSubmitEnabled(false);
    }, [title, text, selectedPhotos, selectedRepoId]);

    useEffect(() => {
        if (selectedRepoId === -1) setPhotoOptions([]);
        else setPhotoOptions(allPhotos.filter((photo) => photo.repo_id === selectedRepoId));
    }, [selectedRepoId]);

    useEffect(() => {
        const setUp = async () => {
            const data = await getRepositories(account?.username as string);
            setRepoOptions(data);
            const results: Promise<IPhoto[]>[] = [];
            data.forEach((repo) => results.push(getPhotos(repo.repo_id)));
            setAllPhotos((await Promise.all(results)).flat());
            if (props.mode === "create/repo") {
                if (params.repo_id) setSelectedRepoId(parseInt(params.repo_id));
            }
            else if (props.mode === "edit") {
                const postId = parseInt(params.post_id as string);
                setCurrentPost(await getPost(postId));
                setTitle(currentPost?.title as string);
                setText(currentPost?.text as string);
                setSelectedRepoId(currentPost?.repo_id as number);
                if (currentPost?.photos) setSelectedPhotos(currentPost?.photos);
            }
        };
        if (loading === "idle") {
            setLoading("pending");
            try {
                setUp();
                setLoading("succeeded");
            }
            catch (e) {
                setLoading("failed");
            }
        }
    }, [dispatch]);

    function onCreate() {
        const taggedPhotos = selectedPhotos.map((value) => ({ ...value, local_tag: value.tag }));
        dispatch(newRepoPost({
            repo_id: selectedRepoId as number,
            title,
            text,
            photos: taggedPhotos,
        })).then(() => {
            history.push(`/posts/${post?.post_id}`);
        });
    }

    let content;

    if (loading === "succeeded") {
        content = (
            <div>
                <h3 className="mt-4">Create Post</h3>
                <Form.Select
                    value={selectedRepoId}
                    onChange={onRepoSelect}
                >
                    <option value={-1} key="-1">Select Repository...</option>
                    {
                        repoOptions.map((repo) => (
                            <option value={repo.repo_id} key={String(repo.repo_id)}>
                                {repo.repo_name}
                            </option>
                        ))
                    }
                </Form.Select>
                { photoOptions.length > 0 ? (
                    <>
                        <Form.Label className="mt-4">Photos</Form.Label>
                        <PCPhotoSelect
                            photos={photoOptions}
                            setSelectedPhotos={setSelectedPhotos}
                        />
                    </>
                ) : ""}
                <Form.Label className="mt-4">Title</Form.Label>
                <Form.Control
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
                <Form.Label className="mt-4">Content</Form.Label>
                <Form.Control
                    as="textarea"
                    style={{ height: "250px" }}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                />
                <div className="d-flex flex-row-reverse">
                    <Button className="mt-4" disabled={!submitEnabled} onClick={onCreate}>Confirm</Button>
                </div>
            </div>
        );
    }
    else if (loading === "failed") content = <>Failed to load page</>;
    else return <></>;
    return content;
}
