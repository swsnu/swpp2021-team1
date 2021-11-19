import React, { useRef, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Button, Card } from "react-bootstrap";
import { IPhoto, IPlace } from "../../common/Interfaces";
import Photo from "../photo/Photo";
import "./Place.css";
import grip from "../../common/assets/grip.svg";
import up from "../../common/assets/arrow-up.svg";
import down from "../../common/assets/arrow-down.svg";
import trash from "../../common/assets/trash.svg";

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
        >
            {(provided) => (
                <div
                    className="mt-2 place-entry"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                >
                    <Card className="place-card overflow-hidden">
                        <Card.Header className="d-flex
                        justify-content-between align-items-start place-name pt-2 place-card-header"
                        >
                            <div className="ps-3 pe-2 pt-2">
                                <h5>
                                    {props.place.place_name}
                                </h5>
                            </div>
                            {props.draggable && (
                                <div>
                                    <Button
                                        className="me-1 place-buttons"
                                        onClick={() => props.onAdd(props.place.place_id)}
                                    >
                                        <img src={down} alt={down} />
                                    </Button>
                                    <Button
                                        className="me-1 place-buttons"
                                        onClick={onDelete}
                                    >
                                        <img src={up} alt={up} />
                                    </Button>
                                    <Button
                                        className="me-1 place-buttons"
                                        onClick={() => props.onPlaceDelete(props.place.place_id)}
                                    >
                                        <img src={trash} alt={trash} />
                                    </Button>
                                </div>
                            )}
                        </Card.Header>
                        <Card.Body className="d-flex flex-row-reverse">
                            {props.draggable &&
                            <img className="grip-img ps-1" src={grip} alt={grip} {...provided.dragHandleProps} />}
                            <div className="d-flex flex-row overflow-auto place-photos">
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
                        </Card.Body>
                    </Card>
                </div>

            )}
        </Draggable>
    );
}
