import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Select from "react-select";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { ILabel, IPhoto } from "../../common/Interfaces";
import Photo from "../photo/Photo";
import { fetchPhotos, focusPhoto } from "../photo/photosSlice";
import { labelsSelectors, loadLabels } from "./labelsSlice";

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
    const params = useParams<{ repo_id: string }>();
    const repoId = parseInt(params.repo_id);
    const allPhotos = useAppSelector((state) => state.photos.photoList);
    const [selectedLabels, setSelectedLabels] = useState<labelOption[]>([]);
    const [displayPhotos, setDisplayPhotos] = useState<IPhoto[]>([]);
    const [checkedPhotos, setCheckedPhotos] = useState<IPhoto[]>([]);
    const [photoFocused, setPhotoFocused] = useState<boolean>(false);
    const [checked, setChecked] = useState<{[id: number]: boolean}>({});

    useEffect(() => {
        const loadPage = async () => {
            await dispatch(fetchPhotos(repoId));
            await dispatch(loadLabels({ repoId }));
            if (allPhotos) setDisplayPhotos(allPhotos);
        };
        if (labelsLoading === "idle") loadPage();
    }, [dispatch]);

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

    let content;

    if (labelsLoading === "failed" || photosHasError) content = <div>Error!</div>;
    else if (!labels || labelsLoading === "idle" || labelsLoading === "pending" || photosIsLoading) content = <div />;
    else {
        content = (
            <div>
                <Select
                    defaultValue={[]}
                    isMulti
                    name="labels"
                    value={selectedLabels}
                    onChange={(newValue) => setSelectedLabels([...newValue])}
                    options={labels.map((label) => ({
                        value: label,
                        label: label.label_name,
                    }))}
                    className="basic-multi-select"
                    classNamePrefix="select"
                />
                <div
                    className="d-flex p-2
                    justify-content-between
                    align-items-stretch
                    flex-wrap width-100"
                >

                    {displayPhotos?.map((value) => (
                        <React.Fragment key={value.photo_id.toString()}>
                            <Photo
                                photo={value}
                                onClick={onPhotoClick}
                                checked={checked[value.photo_id]}
                                mode={false}
                                onCheck={onCheck}
                            />
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    }
    return content;
};

export default LabelsSection;
