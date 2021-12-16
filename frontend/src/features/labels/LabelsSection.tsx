import "./LabelsSection.css";

import React, { useEffect, useState } from "react";
import {
    Badge, Button, Dropdown, DropdownButton, OverlayTrigger, Tooltip,
} from "react-bootstrap";
import { useParams } from "react-router";
import CreatableSelect from "react-select/creatable";
import { ActionMeta, OnChangeValue } from "react-select";

import { unwrapResult } from "@reduxjs/toolkit";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import {
    ILabel, IPhoto,
} from "../../common/Interfaces";
import Photo from "../photo/Photo";
import { assignLabel, editPhoto, focusPhoto } from "../photo/photosSlice";
import FocusedPhoto from "../photo/popup/FocusedPhoto";
import {
    deleteOneLabel, editLabel, labelsSelectors, loadLabels, newLabel,
} from "./labelsSlice";

interface labelOption {
    value: ILabel,
    label: string
}

// suppress tsx-no-component-props
const LabelsSection = () => {
    const dispatch = useAppDispatch();
    const labels = labelsSelectors.selectAll(store.getState());
    const labelsLoading = useAppSelector((state) => state.labels.loading);
    const photosIsLoading = useAppSelector((state) => state.photos.isLoading);
    const photosHasError = useAppSelector((state) => state.photos.hasError);
    const params = useParams<{ id: string }>();
    const repoId = parseInt(params.id);
    const allPhotos = useAppSelector((state) => state.photos.photoList);
    const [selectedLabel, setSelectedLabel] = useState<labelOption | null>(null);
    const [displayPhotos, setDisplayPhotos] = useState<IPhoto[]>([]);
    const [photoFocused, setPhotoFocused] = useState<boolean>(false);
    const [checked, setChecked] = useState<{ [ id: number ]: boolean }>({});
    const currentPhoto = useAppSelector((state) => state.photos.currentPhoto);
    const [mode, setMode] = useState<boolean>(false);
    const [hoveringPhoto, setHoveringPhoto] = useState<number | null>(null);

    useEffect(() => {
        if (labelsLoading === "idle") dispatch(loadLabels({ repoId }));
    }, [dispatch, labelsLoading]);

    useEffect(() => {
        if (allPhotos) setDisplayPhotos(allPhotos);
    }, [allPhotos]);

    useEffect(() => {
        if (!selectedLabel) setDisplayPhotos(allPhotos);
        else {
            const filterPhoto = (photo: IPhoto) => {
                if (photo.labels) {
                    return photo.labels.some(
                        (label) => label.label_id === selectedLabel.value.label_id,
                    );
                }
                return false;
            };
            setDisplayPhotos(allPhotos.filter((photo: IPhoto) => filterPhoto(photo)));
        }
    }, [selectedLabel]);

    useEffect(() => {
        if (!mode) {
            setChecked({});
        }
        else {
            allPhotos.forEach((photo) => {
                if (photo.labels?.some(
                    (label) => label.label_id === selectedLabel?.value.label_id,
                )) {
                    setChecked({ ...checked, [photo.photo_id]: false });
                }
                else setChecked({ ...checked, [photo.photo_id]: true });
            });
            setDisplayPhotos(allPhotos);
        }
    }, [mode]);

    const onPhotoClick = (photoId: number) => {
        dispatch(focusPhoto(photoId));
        setPhotoFocused(true);
    };

    const onCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
        const id = parseInt(event.target.name);
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

    const onAssignLabel = () => {
        dispatch(assignLabel({
            repoId,
            labelId: selectedLabel?.value.label_id as number,
            photos: allPhotos.filter((photo) => checked[photo.photo_id]),
        }));
        setMode(!mode);
    };

    const handleCreate = async (inputValue: string) => {
        const replaced = inputValue.toLowerCase().replace(/\W/g, "") as string;
        const resultAction = await dispatch(newLabel({ repoId, labelName: replaced }));
        const resultLabel = unwrapResult(resultAction).find((label) => label.label_name === replaced);
        if (resultLabel) {
            const newOption: labelOption = {
                label: replaced,
                value: resultLabel,
            };
            setSelectedLabel(newOption);
        }
    };

    let content;

    if (labelsLoading === "failed" || photosHasError) content = <div data-testid="error-content">Error!</div>;
    else if (!labels ||
        labelsLoading === "idle" ||
        labelsLoading === "pending" ||
        photosIsLoading) content = <div data-testid="loading-content" />;
    else {
        content = (
            <div data-testid="content" className="mt-3">
                <div className="d-flex justify-content-between">
                    <CreatableSelect
                        defaultValue={null}
                        name="labels"
                        value={selectedLabel}
                        placeholder="Enter an existing label or a new label..."
                        onChange={(value) => setSelectedLabel(value)}
                        options={labels.map((label) => ({
                            value: label,
                            label: label.label_name,
                        }))}
                        onCreateOption={handleCreate}
                        className="basic-creatable-select mx-5 w-100"
                        classNamePrefix="select"
                        isClearable
                        isDisabled={mode}
                    />
                    <DropdownButton
                        title="Action..."
                        disabled={!selectedLabel}
                    >
                        <Dropdown.Item
                            onClick={() => setMode(!mode)}
                            disabled={!selectedLabel}
                            hidden={mode}
                        >
                            {`Assign photos to '${selectedLabel?.label}'`}
                        </Dropdown.Item>
                        <Dropdown.Item
                            hidden={mode}
                            onClick={() => {
                                const newName = window.prompt("Enter new name: ");
                                const label = labels.find((label) => label.label_name === selectedLabel?.label);
                                if (newName) {
                                    dispatch(editLabel({
                                        repoId,
                                        labelId: label?.label_id as number,
                                        newName: newName.toLowerCase().replace(/\W/g, "") as string,
                                    }));
                                }
                                dispatch(loadLabels({ repoId }));
                            }}
                        >
                            {`Rename '${selectedLabel?.label}'`}

                        </Dropdown.Item>
                        <Dropdown.Item
                            hidden={mode}
                            disabled={
                                displayPhotos.length > 0
                            }
                            onClick={() => {
                                dispatch(deleteOneLabel({
                                    repoId,
                                    labelId: selectedLabel?.value?.label_id as number,
                                }));
                                setSelectedLabel(null);
                            }}
                        >
                            {`Delete '${selectedLabel?.label}'`}
                        </Dropdown.Item>
                        <Dropdown.Item
                            hidden={!mode}
                            onClick={onAssignLabel}
                        >
                            Apply
                        </Dropdown.Item>
                        <Dropdown.Divider hidden={!mode} />
                        <Dropdown.Item
                            hidden={!mode}
                            onClick={() => setMode(false)}
                        >
                            Cancel
                        </Dropdown.Item>
                    </DropdownButton>
                </div>
                <div
                    className="p-2 photosContainer"
                >

                    {displayPhotos?.map((value) => (
                        <div
                            className="photoEntry my-2"
                            key={value.photo_id.toString()}
                            onMouseOver={() => setHoveringPhoto(value.photo_id)}
                            onFocus={() => setHoveringPhoto(value.photo_id)}
                            onMouseOut={() => setHoveringPhoto(null)}
                            onBlur={() => setHoveringPhoto(null)}
                            style={{ position: "relative" }}
                        >
                            <Photo
                                photo={value}
                                onClick={onPhotoClick}
                                checked={checked[value.photo_id]}
                                mode={mode}
                                focusable={!mode}
                                onCheck={onCheck}
                            />
                            <div
                                className="badges-container px-3"
                                hidden={hoveringPhoto !== value.photo_id}
                            >
                                {
                                    value.labels?.map((label) => (
                                        <Badge
                                            key={label.label_name}
                                            className="label-badge"
                                        >
                                            <i className="bi-alarm" />
                                            {label.label_name}
                                        </Badge>
                                    ))
                                }

                            </div>
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
                            canEdit={!mode}
                            postCreateMode={false}
                        />
                    )
                }
            </div>
        );
    }
    return content;
};

export default LabelsSection;
