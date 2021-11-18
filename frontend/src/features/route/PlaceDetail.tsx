import { Button, ListGroup, Offcanvas } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { AppDispatch, RootState } from "../../app/store";
import {
    IPhoto, IPlace, IRepository, IRoute, IUser,
} from "../../common/Interfaces";
import { PlaceQueryResult } from "./routeSlice";
import * as actionCreators from "./routeSlice";
import Place from "./Place";
import FocusedPhoto from "../photo/popup/FocusedPhoto";
import Photo from "../photo/Photo";
import SearchPlace from "./popup/SearchPlace";
import "./PlaceDetail.css";

interface PlaceDetailProps {

}

export default function PlaceDetail(props : PlaceDetailProps) {
    const [isLoading, hasError, isQueryLoading, route, queryResult, focusedPhoto] =
        useSelector<RootState, [boolean, boolean, boolean, IRoute|null, PlaceQueryResult[], IPhoto|null]>((state) =>
            [
                state.route.isLoading,
                state.route.hasError,
                state.route.isQueryLoading,
                state.route.currentRoute,
                state.route.queryResult,
                state.route.focusedPhoto,
            ]);
    const [mode, setMode] = useState<boolean>(false);
    const [notAssigned, setNotAssigned] = useState<IPhoto[]>([]);
    const [places, setPlaces] = useState<IPlace[]>([]);
    const [checked, setChecked] = useState<{[id : number] : boolean}>([]);
    const [show, setShow] = useState<boolean>(false);
    const [photoShow, setPhotoShow] = useState<boolean>(false);
    const history = useHistory();
    const dispatch = useDispatch<AppDispatch>();
    const params = useParams<{id : string}>();

    const [user, repo] = useSelector<RootState, [IUser|null, IRepository|null]>((state) =>
        [state.auth.account, state.repos.currentRepo]);
    const auth = user !== null &&
        repo !== null &&
        repo.collaborators.filter((value) => value.username === user.username).length > 0;

    useEffect(() => {
        dispatch(actionCreators.fetchRoute(parseInt(params.id)));
    }, [dispatch]);

    function changeMode() {
        setMode(true);
        setNotAssigned((route as IRoute).not_assigned);
        setPlaces((route as IRoute).places);
        const newChecked : {[id : number] : boolean} = {};
        (route as IRoute).not_assigned.forEach((value) => {
            newChecked[value.photo_id] = false;
        });
        setChecked(newChecked);
    }

    function onEdit() {
        setMode(false);
        dispatch(actionCreators.editPlaces({ repo_id: parseInt(params.id), places }));
    }

    function cancel() {
        setMode(false);
    }

    function onDragEnd(result: DropResult) {
        if (!result.destination) return;
        const temp = [...places];
        const [reorderedItem] = temp.splice(result.source.index, 1);
        temp.splice(result.destination.index, 0, reorderedItem);
        setPlaces(temp);
    }

    function onAdd(place_id : number) {
        const photos : number[] = [];
        Object.keys(checked).forEach((key) => {
            if (checked[parseInt(key)]) photos.push(parseInt(key));
        });
        const index = places.findIndex((value) => value.place_id === place_id);
        const photoList = notAssigned.filter((value) => photos.find((value1) => value1 === value.photo_id));
        const leftList = notAssigned.filter((value) => !photos.find((value1) => value1 === value.photo_id));
        setNotAssigned(leftList);
        const newPlaces : IPlace[] = [...places];
        newPlaces[index] = { ...newPlaces[index], photos: [...newPlaces[index].photos, ...photoList] };
        setPlaces(newPlaces);
        const newChecked : {[id : number] : boolean} = {};
        leftList.forEach((value) => {
            newChecked[value.photo_id] = false;
        });
        setChecked(newChecked);
    }

    function onDelete(place_id : number, photos : number[]) {
        const index = places.findIndex((value) => value.place_id === place_id);
        const photoList = places[index].photos.filter((value) => photos.find((value1) => value1 === value.photo_id));
        const leftList = places[index].photos.filter((value) => !photos.find((value1) => value1 === value.photo_id));
        const temp : IPhoto[] = [...notAssigned, ...photoList];
        setNotAssigned(temp);
        const newPlaces : IPlace[] = [...places];
        newPlaces[index] = { ...newPlaces[index], photos: leftList };
        setPlaces(newPlaces);
        const newChecked : {[id : number] : boolean} = {};
        temp.forEach((value) => {
            newChecked[value.photo_id] = false;
        });
        setChecked(newChecked);
    }

    function onPlaceDelete(place_id : number) {
        const index = places.findIndex((value) => value.place_id === place_id);
        const temp = [...places];
        const [deleted] = temp.splice(index, 1);
        setPlaces(temp);
        setNotAssigned([...notAssigned, ...deleted.photos]);
    }

    function onCheck(event : React.ChangeEvent<HTMLInputElement>) {
        const id = parseInt(event.target.name) as number;
        const temp = { ...checked };
        temp[id] = !checked[id];
        setChecked(temp);
    }

    function onPhotoClick(photo_id : number) {
        dispatch(actionCreators.focusPhoto(photo_id));
        setPhotoShow(true);
    }

    function onEditPhoto(tag : string) {
        dispatch(actionCreators.editPhoto({
            repo_id: parseInt(params.id),
            photo: { ...focusedPhoto as IPhoto, tag },
        }));
    }

    if (isLoading || hasError) return null;
    return (
        <div className="mt-4 p-2 place-detail-wrapper">
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h3>Places</h3>
                {auth && (
                    <div>
                        {!mode && (
                            <Button
                                className="m-2"
                                id="edit-place-button"
                                onClick={changeMode}
                            >
                                Edit
                            </Button>
                        )}
                        <Button
                            className="m-2"
                            id="add-place-button"
                            onClick={() => setShow(true)}
                        >
                            +
                        </Button>
                    </div>
                )}
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="places">
                    {(provided) => (
                        <div
                            className="mt-4"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {!mode ?
                                (route as IRoute).places.map((value, index) => (
                                    <React.Fragment key={value.place_id.toString()}>
                                        <Place
                                            place={value}
                                            index={index}
                                            draggable={mode}
                                            onPhotoClick={onPhotoClick}
                                            onAdd={onAdd}
                                            onDelete={onDelete}
                                            onPlaceDelete={onPlaceDelete}
                                        />
                                    </React.Fragment>
                                )) :
                                places.map((value, index) => (
                                    <React.Fragment key={value.place_id.toString()}>
                                        <Place
                                            place={value}
                                            index={index}
                                            draggable={mode}
                                            onPhotoClick={onPhotoClick}
                                            onAdd={onAdd}
                                            onDelete={onDelete}
                                            onPlaceDelete={onPlaceDelete}
                                        />
                                    </React.Fragment>
                                ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <Offcanvas show={mode} placement="top" backdrop={false} scroll>
                <Offcanvas.Header>
                    <Offcanvas.Title>Edit Places</Offcanvas.Title>
                    <div>
                        <Button className="m-2" onClick={onEdit}>
                            Confirm
                        </Button>
                        <Button className="m-2" onClick={cancel}>
                            Cancel
                        </Button>
                    </div>
                </Offcanvas.Header>
                <Offcanvas.Body className="not-assigned-wrapper">
                    <div className="d-flex flex-row not-assigned-list overflow-auto mt-2">
                        {notAssigned.map((value) => (
                            <React.Fragment key={value.photo_id.toString()}>
                                <Photo
                                    photo={value}
                                    onClick={onPhotoClick}
                                    checked={checked[value.photo_id]}
                                    mode={mode}
                                    onCheck={onCheck}
                                />
                            </React.Fragment>
                        ))}
                    </div>
                    <h6 className="text-muted mt-2">
                        Not Assigned Photo
                    </h6>
                </Offcanvas.Body>
            </Offcanvas>
            {focusedPhoto && (
                <FocusedPhoto
                    photo={focusedPhoto}
                    onEdit={onEditPhoto}
                    show={photoShow}
                    setShow={setPhotoShow}
                    canEdit={auth}
                />
            )}
            <SearchPlace
                queryResult={queryResult}
                isLoading={isQueryLoading}
                onConfirm={(result) =>
                    dispatch(actionCreators.addPlace({ repo_id: parseInt(params.id), place_id: result.place_id }))}
                onSearch={(query) =>
                    dispatch(actionCreators.searchPlace({ repo_id: parseInt(params.id), queryString: query }))}
                show={show}
                setShow={setShow}
            />
        </div>
    );
}
