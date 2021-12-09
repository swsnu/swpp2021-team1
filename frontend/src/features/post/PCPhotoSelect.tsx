import React, { useEffect, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { IPhoto } from "../../common/Interfaces";
import Photo from "../photo/Photo";
import { focusPhoto } from "../photo/photosSlice";
import FocusedPhoto from "../photo/popup/FocusedPhoto";

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
    const [checked, setChecked] = useState<{ [ id: number ]: boolean }>({});
    const firstUpdate = useRef(true);
    const currentPhoto = useAppSelector((state) => state.photos.currentPhoto);

    // 사진을 클릭했을때 그 사진을 focus함
    function onPhotoClick(photo_id: number) {
        dispatch(focusPhoto(photo_id));
        setPhotoShow(true);
    }

    // 체크박스를 체크했을 때 checked 상태를 세팅함
    function onCheck(event : React.ChangeEvent<HTMLInputElement>) {
        const id = parseInt(event.target.name) as number;
        const temp = { ...checked };
        temp[id] = !checked[id];
        setChecked(temp);
    }

    const onEdit = () => 1;

    // 초기화: props로 들어온 기존 value로 checked 설정 (edit mode에만 해당)
    useEffect(() => {
        setChecked(props.checked);
        // console.log("abc");
    }, [dispatch]);

    // checked가 변하면, selectedPhotos를 그에 맞게 세팅함
    useEffect(() => {
        // 초기화시에는 실행 x.
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
                    <div key={value.photo_id.toString()}>
                        <Photo
                            photo={value}
                            mode
                            focusable={checked[value.photo_id]}
                            onClick={onPhotoClick}
                            checked={checked[value.photo_id]}
                            onCheck={onCheck}
                        />
                    </div>
                ))}
                {currentPhoto && (
                    <FocusedPhoto
                        photo={currentPhoto}
                        onEdit={onEdit}
                        show={photoShow}
                        setShow={setPhotoShow}
                        canEdit
                        localTagMode
                    />
                )}
            </div>
        </div>
    );
}
