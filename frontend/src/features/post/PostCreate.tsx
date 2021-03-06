import { unwrapResult } from "@reduxjs/toolkit";
import React, {
    FormEvent, useEffect, useRef, useState,
} from "react";
import { Button, Form } from "react-bootstrap";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";
import store from "../../app/store";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
    getCollaborators, getPost, getRepositories,
} from "../../common/APIs";
import {
    ILabel, IPost, IRepository,
} from "../../common/Interfaces";
import { labelsSelectors, loadLabels } from "../labels/labelsSlice";
import { fetchPhotos } from "../photo/photosSlice";
import PCPhotoSelect from "./PCPhotoSelect";
import { newRepoPost, PhotoWithLocalTag, postEdited } from "./postsSlice";
import "../PostCreate.css";

interface PostCreateProps {
    mode: "create/user" | "create/repo" | "edit"
}

interface labelOption {
    value: ILabel,
    label: string
}

const PostCreate = (props : PostCreateProps) => {
    const dispatch = useAppDispatch();

    const account = useAppSelector((state) => state.auth.account);

    // PostCreate 페이지의 로딩 상태를 나타내는 state.
    // postsSlice의 loading과는 별개임!!
    const [loading, setLoading] = useState<"pending" | "idle" | "succeeded" | "failed">("idle");

    const photoOptions = useAppSelector((state) => state.photos.photoList);
    const [repoOptions, setRepoOptions] = useState<IRepository[]>([]);
    const [title, setTitle] = useState<string>("");
    const [text, setText] = useState<string>("");
    const [selectedRepoId, setSelectedRepoId] = useState<number>(-1);
    const [submitEnabled, setSubmitEnabled] = useState<boolean>(false);
    const [currentPost, setCurrentPost] = useState<IPost | null>(null); // Only in "edit"
    const [checked, setChecked] = useState<{ [ id: number ]: boolean }>({});
    const labels = labelsSelectors.selectAll(store.getState());
    const [labelOptions, setLabelOptions] = useState<ILabel[]>([]);
    const [selectedLabel, setSelectedLabel] = useState<labelOption | null>(null);
    const initialized = useRef({ currentPost: false, selectedRepoId: false });

    const params = useParams<{repo_id: string | undefined, post_id: string | undefined}>();
    const history = useHistory();

    // repo를 드롭다운에서 선택하면, selectedRepoId를 선택된 레포로 설정함
    const onRepoSelect = (e: FormEvent<HTMLSelectElement>): void =>
        setSelectedRepoId(parseInt(e.currentTarget.value));

    // 제목, 내용이 빈칸이 아니고, 사진이 1개 이상 선택되었고, repo가 선택되었으면 submit 버튼을 enable함
    useEffect(() => {
        if (title && text &&
            Object.values(checked).some((value) => value) && selectedRepoId) setSubmitEnabled(true);
        else setSubmitEnabled(false);
    }, [title, text, checked, selectedRepoId]);

    useEffect(() => {
        // 페이지 초기화 함수
        const setUp = async () => {
            try {
                // RepositoryDetail 페이지로부터 유입된 경우
                if (props.mode === "create/repo") {
                    const collaborators = await getCollaborators(parseInt(params.repo_id as string));
                    if (!collaborators.some((collaborator) => collaborator.username === account?.username)) {
                        history.push(`/repos/${params.repo_id}`);
                    }
                    // selectedRepoId를 params의 :repo_id로 세팅함
                    setSelectedRepoId(parseInt(params.repo_id as string));
                    setLoading("succeeded");
                }
                else if (props.mode === "create/user" && account) {
                    const data = await getRepositories(account.username);
                    setRepoOptions(data);
                    setSelectedRepoId(-1);
                    setLoading("succeeded");
                }
                // 기존의 Post를 수정하는 경우
                else if (props.mode === "edit") {
                    // params의 :post_id에 해당하는 Post 오브젝트를 fetch하고, currentPost를 이로 세팅
                    const data = await getPost(parseInt(params.post_id as string));
                    setCurrentPost(data);
                    setLoading("succeeded");
                }
                else {
                    setLoading("idle");
                }
            }
            catch {
                setLoading("failed");
            }
        };
        if (loading === "idle") {
            setLoading("pending");
            setUp();
        }
    }, [dispatch, account]);

    useEffect(() => {
        if (!initialized.current.currentPost) {
            initialized.current.currentPost = true;
            return;
        }
        // 현재 페이지에 currentPost를 불러옴
        setTitle(currentPost?.title as string);
        setText(currentPost?.text as string);
        setSelectedRepoId(currentPost?.repo_id as number);
    }, [currentPost]);

    useEffect(() => {
        const setUpOptions = async () => {
            await dispatch(fetchPhotos({ repoId: selectedRepoId }));
            if (currentPost?.photos && props.mode === "edit") {
                const tempChecked: { [ id: number ]: boolean } = {};
                photoOptions.forEach((option) => {
                    tempChecked[option.photo_id] = !!currentPost?.photos.find(
                        (photo) => photo.photo_id === option.photo_id,
                    );
                });
                setChecked(tempChecked);
            }
            dispatch(loadLabels({ repoId: selectedRepoId }));
        };
        if (selectedRepoId === -1) {
            dispatch(fetchPhotos({ repoId: -1 }));
            dispatch(loadLabels({ repoId: -1 }));
        }
        else {
            setUpOptions();
        }
    }, [selectedRepoId]);

    useEffect(() => {
        setLabelOptions(labels);
    }, [labels]);

    // 작성 후 Submit 버튼을 눌렀을 때,
    const onCreate = async () => {
        const taggedPhotos = photoOptions.filter((photo) => checked[photo.photo_id]);
        const photosPayload: PhotoWithLocalTag[] = [];
        taggedPhotos.forEach((photo) => {
            photosPayload.push(photo.local_tag ? {
                photo_id: photo.photo_id,
                local_tag: photo.local_tag as string,
            } : {
                photo_id: photo.photo_id,
                local_tag: photo.tag as string,
            });
        });
        try {
            let resultAction;
            // 새 Post를 서버에 업로드
            if (props.mode !== "edit") {
                resultAction = await dispatch(newRepoPost({
                    repo_id: selectedRepoId,
                    title,
                    text,
                    photos: photosPayload,
                }));
            }
            else {
                resultAction = await dispatch(postEdited({
                    post_id: parseInt(params.post_id as string),
                    title,
                    text,
                    photos: photosPayload,
                }));
            }
            // 그 Post 페이지로 리다이렉트
            const originalPromiseResult = unwrapResult(resultAction);
            history.push(`/posts/${originalPromiseResult?.post_id}`);
        }
        catch (e) {
            toast.error("Failed to create post!");
            history.push("/");
        }
    };

    useEffect(() => {
        const filterByLabels = async () => {
            dispatch(fetchPhotos({ repoId: selectedRepoId, labelName: selectedLabel?.label }));
        };
        filterByLabels();
    }, [selectedLabel]);

    if (loading === "succeeded") {
        return (
            <div>
                <h3 className="mt-4">{props.mode !== "edit" ? "Create Post" : "Edit Post"}</h3>
                {props.mode === "create/user" ? (
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
                ) : ""}
                <Form.Label className="mt-4">Photos</Form.Label>
                <Select
                    defaultValue={null}
                    name="labels"
                    value={selectedLabel}
                    placeholder="Filter by Labels..."
                    onChange={(value) => setSelectedLabel(value)}
                    options={labelOptions.map((label) => ({
                        value: label,
                        label: label.label_name,
                    }))}
                    className="basic-select"
                    classNamePrefix="select"
                    isClearable
                />
                { photoOptions.length > 0 ? (
                    <>
                        <PCPhotoSelect
                            photos={photoOptions}
                            checked={checked}
                            setChecked={setChecked}
                            mode={props.mode === "edit" ? "edit" : "new"}
                        />
                    </>
                ) : <p>No photos available!</p>}
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
                <ToastContainer />
            </div>
        );
    }
    if (loading === "failed") return <>Failed to load page</>;
    return <></>;
};

export default PostCreate;
