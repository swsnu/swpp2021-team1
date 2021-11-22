import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Select from "react-select";

import { useSelector } from "react-redux";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import store, { RootState } from "../../app/store";
import {
    ILabel, IPhoto, IRepository, IUser,
} from "../../common/Interfaces";
import Photo from "../photo/Photo";
import { editPhoto, fetchPhotos, focusPhoto } from "../photo/photosSlice";
import { labelsSelectors, loadLabels } from "./labelsSlice";
import "./LabelsSection.css";
import FocusedPhoto from "../photo/popup/FocusedPhoto";

interface labelsSectionProps
{

}

interface labelOption {
    value: ILabel,
    label: string
}

const LabelsSection = (props: labelsSectionProps) => {
    const dispatch = useAppDispatch();
    const labels = labelsSelectors.selectAll(store.getState());
    const labelsLoading = useAppSelector((state) => state.labels.loading);
    const photosIsLoading = useAppSelector((state) => state.photos.isLoading);
    const photosHasError = useAppSelector((state) => state.photos.hasError);
    const params = useParams<{ id: string }>();
    const repoId = parseInt(params.id);
    const allPhotos = useAppSelector((state) => state.photos.photoList);
    const [selectedLabels, setSelectedLabels] = useState<labelOption[]>([]);
    const [displayPhotos, setDisplayPhotos] = useState<IPhoto[]>([]);
    const [photoFocused, setPhotoFocused] = useState<boolean>(false);
    const [checked, setChecked] = useState<{ [ id: number ]: boolean }>({});
    const currentPhoto = useAppSelector((state) => state.photos.currentPhoto);
    const [user, repo] = useSelector<RootState, [IUser|null, IRepository|null]>((state) =>
        [state.auth.account, state.repos.currentRepo]);
    const [mode, setMode] = useState<boolean>(false);

    useEffect(() => {
        const loadPage = async () => {
            await dispatch(loadLabels({ repoId }));
        };
        if (labelsLoading === "idle") loadPage();
    }, [dispatch]);

    useEffect(() => {
        if (allPhotos) setDisplayPhotos(allPhotos);
    }, [allPhotos]);

    useEffect(() => {
        const listOfLabels = selectedLabels.map((option) => option.value);
        if (selectedLabels.length === 0) setDisplayPhotos(allPhotos);
        else setDisplayPhotos(allPhotos.filter((photo) => photo.label?.some((r) => listOfLabels.includes(r))));
    }, [selectedLabels]);

    const onPhotoClick = (photoId: number) => {
        dispatch(focusPhoto(photoId));
        setPhotoFocused(true);
    };

    const onCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = parseInt(event.target.name) as number;
        const temp = { ...checked };
        temp[id] = !checked[id];
        setChecked(temp);
    };

    function onEdit(tag : string) {
        dispatch(editPhoto({
            repo_id: repoId,
            photo: { ...currentPhoto as IPhoto, tag },
        }));
    }

    let content;

    if (labelsLoading === "failed" || photosHasError) content = <div>Error!</div>;
    else if (!labels || labelsLoading === "idle" || labelsLoading === "pending" || photosIsLoading) content = <div />;
    else {
        content = (
            <div className="mt-3">
                <div className="d-flex justify-content-between">
                    <Select
                        defaultValue={[]}
                        isMulti
                        name="labels"
                        value={selectedLabels}
                        placeholder="Filter by Labels..."
                        onChange={(newValue) => setSelectedLabels([...newValue])}
                        options={labels.map((label) => ({
                            value: label,
                            label: label.label_name,
                        }))}
                        className="basic-multi-select mx-5"
                        classNamePrefix="select"
                    />
                    <DropdownButton title="Edit...">
                        <Dropdown.Item>New label...</Dropdown.Item>
                        <Dropdown.Item>Assign labels to photos</Dropdown.Item>
                        <Dropdown.Item>Rename label</Dropdown.Item>
                        <Dropdown.Item>Delete label</Dropdown.Item>
                    </DropdownButton>
                    <div>

                        <Button
                            onClick={() => setMode(!mode)}
                        >
                            {mode ? "Cancel" : "Edit"}

                        </Button>
                    </div>
                </div>
                <div
                    className="p-2 photosContainer"
                >

                    {displayPhotos?.map((value) => (
                        <div
                            className="photoEntry my-2"
                            key={value.photo_id.toString()}
                        >
                            <Photo
                                photo={value}
                                onClick={onPhotoClick}
                                checked={checked[value.photo_id]}
                                mode={mode}
                                onCheck={onCheck}
                            />
                        </div>
                    ))}
                </div>
                {
                    currentPhoto && (
                        <FocusedPhoto
                            photo={currentPhoto}
                            onEdit={onEdit}
                            show={photoFocused}
                            setShow={setPhotoFocused}
                            canEdit
                        />
                    )
                }
            </div>
        );
    }
    return content;
};

export default LabelsSection;
