import {
    Button, DropdownButton, FloatingLabel, Form,
} from "react-bootstrap";
import React, { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { useLocation } from "react-router";
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
function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
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

    const repoId = useQuery().get("repo_id"); // Only in "create/repo"
    const [currentPost, setCurrentPost] = useState<IPost | null>(null); // Only in "edit"

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
                if (repoId) setSelectedRepoId(parseInt(repoId));
            }
            else if (props.mode === "edit") {
                const postId = parseInt(useParams<{post_id: string}>().post_id);
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
        dispatch(newRepoPost({
            repo_id: selectedRepoId as number,
            title,
            text,
            photos: selectedPhotos,
        }));
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
