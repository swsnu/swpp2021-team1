import React, { useEffect, useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import FocusedPhoto from "../photo/popup/FocusedPhoto";
import { AppDispatch, RootState } from "../../app/store";
import { IPhoto } from "../../common/Interfaces";
import Photo from "../photo/Photo";
import { focusPhoto } from "../photo/photosSlice";
import { useAppDispatch } from "../../app/hooks";

interface PCPhotoSelectProps {
    photos: IPhoto[]
    setSelectedPhotos: (photos: IPhoto[]) => void
}

export default function PCPhotoSelect(props : PCPhotoSelectProps) {
    const { photos, setSelectedPhotos } = props;
    const dispatch = useAppDispatch();
    const [photoShow, setPhotoShow] = useState<boolean>(false);
    const [currentPhoto, setCurrentPhoto] = useState<IPhoto | null>(null);
    const [checked, setChecked] = useState<{[id : number] : boolean}>({});

    function onPhotoClick(photo_id : number) {
        dispatch(focusPhoto(photo_id));
        setPhotoShow(true);
    }

    function onCheck(event : React.ChangeEvent<HTMLInputElement>) {
        const id = parseInt(event.target.name) as number;
        const temp = { ...checked };
        temp[id] = !checked[id];
        setChecked(temp);
    }

    useEffect(() => {
        const checkedPhotos: IPhoto[] = [];
        Object.entries(checked).forEach(
            ([photoId, isChecked]) => {
                if (isChecked) {
                    const foundPhoto = photos.find((photo) => photo.photo_id === parseInt(photoId));
                    if (foundPhoto) checkedPhotos.push(foundPhoto);
                }
            },
        );
        setSelectedPhotos(checkedPhotos);
    }, [checked]);

    return (
        <div id="post-create-photo-select">
            <div
                className="d-flex flex-row photo-list overflow-auto mt-2 justify-content-start"
                style={{ height: "20vh" }}
            >
                {photos.map((value: IPhoto) => (
                    <React.Fragment key={value.photo_id.toString()}>
                        <Photo
                            photo={value}
                            mode
                            onClick={onPhotoClick}
                            checked={checked[value.photo_id]}
                            onCheck={onCheck}
                        />
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
