import React, { useEffect, useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../app/store";
import { IPhoto } from "../../common/Interfaces";
import * as actionCreator from "./photosSlice";
import Photo from "./Photo";
import AddPhoto from "./popup/AddPhoto";
import FocusedPhoto from "./popup/FocusedPhoto";

interface PhotoListProps {

}

export default function PhotoList(props : PhotoListProps) {
    const [index, setIndex] = useState<number>(0);
    const [isLoading, hasError, currentPhoto, photoList] = useSelector<RootState,
        [boolean, boolean, IPhoto|null, IPhoto[]]>((state) =>
            [state.photos.isLoading, state.photos.hasError, state.photos.currentPhoto, state.photos.photoList]);
    const params = useParams<{id : string}>();
    const dispatch = useDispatch<AppDispatch>();
    const [photoShow, setPhotoShow] = useState<boolean>(false);
    const [addShow, setAddShow] = useState<boolean>(false);

    useEffect(() => {
        dispatch(actionCreator.fetchPhotos(parseInt(params.id)));
    }, [dispatch]);

    function onPhotoClick(photo_id : number) {
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
        dispatch(actionCreator.editPhotos({
            repo_id: parseInt(params.id),
            photos: [{ ...currentPhoto as IPhoto, tag }],
        }));
    }

    if (isLoading) return null;
    return (
        <div>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Photos</h4>
                <Button className="m-2" id="add-collaborator-button" onClick={addPhotos}>+</Button>
            </div>
            <ListGroup horizontal>
                {photoList.map((value) => <Photo photo={value} onClick={onPhotoClick} />)}
            </ListGroup>
            <AddPhoto show={addShow} setShow={setAddShow} commitPhotos={commitPhotos} />
            {currentPhoto && (
                <FocusedPhoto
                    photo={currentPhoto}
                    onEdit={onEdit}
                    show={photoShow}
                    setShow={setPhotoShow}
                />
            )}
        </div>
    );
}
