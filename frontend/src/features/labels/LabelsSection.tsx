import "./LabelsSection.css";

import React, { useEffect, useState } from "react";
import { Badge, Dropdown, DropdownButton } from "react-bootstrap";
import { useParams } from "react-router";
import Select from "react-select";

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
    const [selectedLabels, setSelectedLabels] = useState<labelOption[]>([]);
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
        const listOfLabels = selectedLabels.map((option) => option.value);
        if (selectedLabels.length === 0) setDisplayPhotos(allPhotos);
        else {
            const filterPhoto = (photo: IPhoto) => {
                if (photo.labels) {
                    return photo.labels.some(
                        (label) => listOfLabels.some(
                            (labelToMatch) => labelToMatch.label_id === label.label_id,
                        ),
                    );
                }
                return false;
            };
            setDisplayPhotos(allPhotos.filter((photo: IPhoto) => filterPhoto(photo)));
        }
    }, [selectedLabels]);

    useEffect(() => {
        setChecked({});
    }, [mode]);

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

    const onNewLabel = () => {
        const newName = window.prompt("Name of new label: ");
        dispatch(newLabel({ repoId: (repoId as number), labelName: (newName as string) }));
    };

    const onAssignLabel = (labelId: number) => {
        dispatch(assignLabel({
            repoId: (repoId as number),
            labelId,
            photos: allPhotos.filter((photo) => checked[photo.photo_id]),
        }));
        setMode(!mode);
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
                    <DropdownButton title="Edit..." hidden={mode}>
                        <Dropdown.Item
                            onClick={onNewLabel}
                        >
                            New label...
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => setMode(!mode)}
                        >
                            Assign labels
                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                const labelName = window.prompt("Enter name of label to edit: ");
                                const label = labels.find((label) => label.label_name === labelName);
                                if (label) {
                                    const newName = window.prompt("Enter new name: ");
                                    dispatch(editLabel({
                                        repoId: repoId as number, labelId: label.label_id, newName: newName as string,
                                    }));
                                }
                                else {
                                    window.alert(`Label '${labelName}' does not exist!`);
                                }
                            }}
                        >
                            Rename label

                        </Dropdown.Item>
                        <Dropdown.Item
                            onClick={() => {
                                const labelName = window.prompt("Enter name of label to delete");
                                const label = labels.find((label) => label.label_name === labelName);
                                if (label) {
                                    dispatch(deleteOneLabel({
                                        repoId: repoId as number,
                                        labelId: label.label_id,
                                    }));
                                }
                                else {
                                    window.alert(`Label '${labelName}' does not exist!`);
                                }
                            }}
                        >
                            Delete label
                        </Dropdown.Item>
                    </DropdownButton>
                    <DropdownButton title="Done..." hidden={!mode}>
                        {labels.map((label) => (
                            <Dropdown.Item
                                key={label.label_id}
                                onClick={() => onAssignLabel(label.label_id)}
                                value={label.label_id}
                            >
                                {label.label_name}
                            </Dropdown.Item>
                        ))}
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => setMode(!mode)}>Cancel</Dropdown.Item>
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
