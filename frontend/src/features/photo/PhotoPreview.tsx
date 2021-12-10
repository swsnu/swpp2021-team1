import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../app/store";
import { IPhoto, IRepository, IUser } from "../../common/Interfaces";
import * as actionCreator from "./photosSlice";
import Photo from "./Photo";
import AddPhoto from "./popup/AddPhoto";
import FocusedPhoto from "./popup/FocusedPhoto";
import "./PhotoPreview.css";

interface PhotoPreviewProps {

}

export default function PhotoPreview(props : PhotoPreviewProps) {
    const [isLoading, hasError, currentPhoto, photoList] = useSelector<RootState,
        [boolean, boolean, IPhoto|null, IPhoto[]]>((state) =>
            [state.photos.isLoading, state.photos.hasError, state.photos.currentPhoto, state.photos.photoList]);
    const params = useParams<{id : string}>();
    const dispatch = useDispatch<AppDispatch>();
    const [photoShow, setPhotoShow] = useState<boolean>(false);
    const [addShow, setAddShow] = useState<boolean>(false);
    const [deleteMode, setDeleteMode] = useState<boolean>(false);
    const [checked, setChecked] = useState<{[id : number] : boolean}>({});

    const [user, repo] = useSelector<RootState, [IUser|null, IRepository|null]>((state) =>
        [state.auth.account, state.repos.currentRepo]);
    const auth = user !== null &&
        repo !== null &&
        repo.collaborators.filter((value) => value.username === user.username).length > 0;

    useEffect(() => {
        dispatch(actionCreator.fetchPhotos(parseInt(params.id))).then(() => {
            const newChecked : {[id : number] : boolean} = {};
            photoList.forEach((value) => {
                newChecked[value.photo_id] = false;
            });
            setChecked(newChecked);
        });
    }, [dispatch]);

    function onPhotoClick(photo_id: number) {
        dispatch(actionCreator.focusPhoto(photo_id));
        setPhotoShow(true);
    }

    function addPhotos() {
        setAddShow(true);
    }

    function commitPhotos(formData : FormData) {
        dispatch(actionCreator.addPhotos({ repo_id: parseInt(params.id), images: formData }));
    }

    function onEdit(tag : string) {
        dispatch(actionCreator.editPhoto({
            repo_id: parseInt(params.id),
            photo: { ...currentPhoto as IPhoto, tag },
        }));
    }

    function onCheck(event : React.ChangeEvent<HTMLInputElement>) {
        const id = parseInt(event.target.name) as number;
        const temp = { ...checked };
        temp[id] = !checked[id];
        setChecked(temp);
    }

    function commitDelete() {
        const photos_id : {photo_id : number}[] = [];
        Object.keys(checked).forEach((key) => {
            if (checked[parseInt(key)]) photos_id.push({ photo_id: parseInt(key) });
        });
        setDeleteMode(false);
        dispatch(actionCreator.removePhotos({ repo_id: parseInt(params.id), photos_id }))
            .then(() => {
                const newChecked : {[id : number] : boolean} = {};
                photoList.forEach((value) => {
                    newChecked[value.photo_id] = false;
                });
                setChecked(newChecked);
            });
    }

    function cancelDelete() {
        const newChecked : {[id : number] : boolean} = {};
        photoList.forEach((value) => {
            newChecked[value.photo_id] = false;
        });
        setChecked(newChecked);
        setDeleteMode(false);
    }

    if (isLoading) return null;
    return (
        <div>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Photos</h4>
                {auth && (
                    <div>
                        {deleteMode && (
                            <Button
                                className="m-2"
                                id="cancel-photo-button"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            className="m-2"
                            id="delete-photo-button"
                            onClick={deleteMode ? commitDelete : () => setDeleteMode(true)}
                        >
                            {deleteMode ? "Commit" : "Delete"}
                        </Button>
                        <Button className="m-2" id="add-photo-button" onClick={addPhotos}>+</Button>
                    </div>
                )}
            </div>
            <div className="d-flex flex-row photo-list overflow-auto mt-2">
                {photoList.map((value) => (
                    <React.Fragment key={value.photo_id.toString()}>
                        <Photo
                            photo={value}
                            onClick={onPhotoClick}
                            checked={checked[value.photo_id]}
                            mode={deleteMode}
                            focusable={!deleteMode}
                            onCheck={onCheck}
                        />
                    </React.Fragment>
                ))}
            </div>
            <AddPhoto show={addShow} setShow={setAddShow} commitPhotos={commitPhotos} />
            {currentPhoto && (
                <FocusedPhoto
                    photo={currentPhoto}
                    onEdit={onEdit}
                    show={photoShow}
                    setShow={setPhotoShow}
                    canEdit={auth}
                    postCreateMode={false}
                />
            )}
        </div>
    );
}
