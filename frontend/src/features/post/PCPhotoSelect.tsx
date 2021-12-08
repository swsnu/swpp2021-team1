import React, { useEffect, useRef, useState } from "react";

import { useAppDispatch } from "../../app/hooks";
import { IPhoto } from "../../common/Interfaces";
import Photo from "../photo/Photo";
import { focusPhoto } from "../photo/photosSlice";

interface PCPhotoSelectProps {
    photos: IPhoto[] // 선택 가능한 사진 목록
    setSelectedPhotos: (photos: IPhoto[]) => void
    checked: {[id: number]: boolean}
}

// PCPhotoSelect : PostCreate PhotoSelect라는 뜻. PostCreate 페이지에서 사용하는 특수한(?) PhotoSelect 컴포넌트
export default function PCPhotoSelect(props : PCPhotoSelectProps) {
    const dispatch = useAppDispatch();

    const { photos, setSelectedPhotos } = props;

    const [photoShow, setPhotoShow] = useState<boolean>(false);
    const [currentPhoto, setCurrentPhoto] = useState<IPhoto | null>(null);
    const [checked, setChecked] = useState<{ [ id: number ]: boolean }>({});
    const firstUpdate = useRef(true);

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
        setChecked(props.checked);
        // console.log("abc");
    }, [dispatch]);

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            return;
        }
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
