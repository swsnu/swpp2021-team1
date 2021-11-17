import React, { useRef, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Button } from "react-bootstrap";
import { IPhoto, IPlace } from "../../common/Interfaces";
import Photo from "../photo/Photo";

interface PlaceProps {
    place : IPlace,
    index : number,
    draggable : boolean,
    onPhotoClick : (photo_id : number) => void,
    onAdd : (place_id : number) => void,
    onDelete : (place_id : number, photos : number[]) => void,
    onPlaceDelete : (place_id : number) => void,
}

export default function Place(props : PlaceProps) {
    const newChecked : {[id : number] : boolean} = {};
    props.place.photos.forEach((value) => {
        newChecked[value.photo_id] = false;
    });

    const [checked, setChecked] = useState<{[id : number] : boolean}>(newChecked);

    function onCheck(event : React.ChangeEvent<HTMLInputElement>) {
        const id = parseInt(event.target.name) as number;
        const temp = { ...checked };
        temp[id] = !checked[id];
        setChecked(temp);
    }

    function onDelete() {
        const photos_id : number[] = [];
        Object.keys(checked).forEach((key) => {
            if (checked[parseInt(key)]) photos_id.push(parseInt(key));
        });
        props.onDelete(props.place.place_id, photos_id);
    }

    return (
        <Draggable
            key={props.place.place_id.toString()}
            draggableId={props.place.place_id.toString()}
            index={props.index}
            isDragDisabled={!props.draggable}
        >
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                >
                    <div className="d-flex mt-2 justify-content-between align-items-start">
                        <h4>
                            {props.place.place_name}
                        </h4>
                        {props.draggable && (
                            <div>
                                <Button className="ms-2" onClick={() => props.onAdd(props.place.place_id)}>
                                    ↓
                                </Button>
                                <Button className="ms-2" onClick={onDelete}>
                                    ↑
                                </Button>
                                <Button className="ms-2" onClick={() => props.onPlaceDelete(props.place.place_id)}>
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex flex-row overflow-auto">
                            {props.place.photos.map((value, index) => (
                                <React.Fragment key={value.photo_id.toString()}>
                                    <Photo
                                        photo={value}
                                        onClick={props.onPhotoClick}
                                        checked={checked[value.photo_id]}
                                        mode={props.draggable}
                                        onCheck={onCheck}
                                    />
                                </React.Fragment>
                            ))}
                        </div>
                        <img src="" alt="" {...provided.dragHandleProps} />
                    </div>
                </div>
            )}
        </Draggable>
    );
}
