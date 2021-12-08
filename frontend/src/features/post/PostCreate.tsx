import { unwrapResult } from "@reduxjs/toolkit";
import React, { FormEvent, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { RootState } from "../../app/store";
import { getPhotos, getPost, getRepositories } from "../../common/APIs";
import { IPhoto, IPost, IRepository } from "../../common/Interfaces";
import PCPhotoSelect from "./PCPhotoSelect";
import { newRepoPost } from "./postsSlice";

interface PostcreateProps {
    mode: "create/user" | "create/repo" | "edit"
}

export default function Postcreate(props : PostcreateProps) {
    const dispatch = useAppDispatch();

    const account = useAppSelector((state) => state.auth.account);
    const post = useSelector<RootState, IPost | null>((state) => state.posts.currentPost);

    // PostCreate 페이지의 로딩 상태를 나타내는 state.
    // postsSlice의 loading과는 별개임!!
    const [loading, setLoading] = useState<"pending" | "idle" | "succeeded" | "failed">("idle");

    const [allPhotos, setAllPhotos] = useState<IPhoto[]>([]);
    const [repoOptions, setRepoOptions] = useState<IRepository[]>([]); // Repos to show up in Dropdown list
    const [photoOptions, setPhotoOptions] = useState<IPhoto[]>([]);
    const [title, setTitle] = useState<string>("");
    const [text, setText] = useState<string>("");
    const [selectedPhotos, setSelectedPhotos] = useState<IPhoto[]>([]);
    const [selectedRepoId, setSelectedRepoId] = useState<number>(-1);
    const [submitEnabled, setSubmitEnabled] = useState<boolean>(false);
    const [currentPost, setCurrentPost] = useState<IPost | null>(null); // Only in "edit"
    const [checked, setChecked] = useState({});

    const params = useParams<{repo_id: string | undefined, post_id: string | undefined}>();
    const history = useHistory();

    // repo를 드롭다운에서 선택하면, selectedRepoId를 선택된 레포로 설정함
    const onRepoSelect = (e: FormEvent<HTMLSelectElement>): void =>
        setSelectedRepoId(parseInt(e.currentTarget.value));

    // repo를 선택했을 때, 그 repo의 사진만 필터링하여 PhotoOptions로 설정함
    useEffect(() => {
        if (selectedRepoId === -1) setPhotoOptions([]);
        else setPhotoOptions(allPhotos.filter((photo) => photo.repo_id === selectedRepoId));
    }, [selectedRepoId]);

    useEffect(() => {
        const tempChecked: { [ id: number ]: boolean } = {};
        photoOptions.forEach((option) => {
            if (currentPost?.photos.find(
                (photo) => photo.photo_id === option.photo_id,
            )) tempChecked[option.photo_id] = true;
        });
        setChecked(tempChecked);
    }, [photoOptions]);

    // 제목, 내용이 빈칸이 아니고, 사진이 1개 이상 선택되었고, repo가 선택되었으면 submit 버튼을 enable함
    useEffect(() => {
        if (title && text && selectedPhotos.length > 0 && selectedRepoId) setSubmitEnabled(true);
        else setSubmitEnabled(false);
    }, [title, text, selectedPhotos, selectedRepoId]);

    useEffect(() => {
        // 페이지 초기화 함수
        const setUp = async () => {
            // 유저의 repo 모든 repo 목록을 불러와 repoOptions에 세팅함
            const data = await getRepositories(account?.username as string);
            setRepoOptions(data);
            const results: Promise<IPhoto[]>[] = [];
            data.forEach((repo) => results.push(getPhotos(repo.repo_id)));
            // repoOptions의 모든 repo에서 모든 Photo들을 불러와 allPhotos에 저장
            setAllPhotos((await Promise.all(results)).flat());
            // RepositoryDetail 페이지로부터 유입된 경우
            if (props.mode === "create/repo") {
                // selectedRepoId를 params의 :repo_id로 세팅함
                if (params.repo_id) setSelectedRepoId(parseInt(params.repo_id));
            }
            // 기존의 Post를 수정하는 경우
            else if (props.mode === "edit") {
                // params의 :post_id에 해당하는 Post 오브젝트를 fetch하고, currentPost를 이로 세팅
                const data = await getPost(parseInt(params.post_id as string));
                setCurrentPost(data);
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
    useEffect(() => {
        // 현재 페이지에 currentPost를 불러옴
        setTitle(currentPost?.title as string);
        setText(currentPost?.text as string);
        setSelectedRepoId(currentPost?.repo_id as number);
        if (currentPost?.photos) {
            // console.log("setSelectedPhotos");
            setSelectedPhotos(currentPost?.photos);
        }
    }, [currentPost]);

    // 작성 후 Submit 버튼을 눌렀을 때,
    const onCreate = async () => {
        // TODO
        // 선택한 Photo들에 local tag를 append함
        const taggedPhotos = selectedPhotos.map((value) => ({ ...value, local_tag: value.tag }));
        try {
            // 새 Post를 서버에 업로드
            const resultAction = await dispatch(newRepoPost({
                repo_id: selectedRepoId as number,
                title,
                text,
                photos: taggedPhotos,
            }));
            // 그 Post 페이지로 리다이렉트
            const originalPromiseResult = unwrapResult(resultAction);
            history.push(`/posts/${originalPromiseResult?.post_id}`);
        }
        catch (e) {
            window.alert("Failed to create post!");
            history.push("/");
        }
    };

    if (loading === "succeeded") {
        return (
            <div>
                <h3 className="mt-4">Create Post</h3>
                {props.mode !== "edit" ? (
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
                { photoOptions.length > 0 ? (
                    <>
                        <Form.Label className="mt-4">Photos</Form.Label>
                        <PCPhotoSelect
                            photos={photoOptions}
                            setSelectedPhotos={setSelectedPhotos}
                            checked={checked}
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
            </div>
        );
    }
    if (loading === "failed") return <>Failed to load page</>;
    return <></>;
}
