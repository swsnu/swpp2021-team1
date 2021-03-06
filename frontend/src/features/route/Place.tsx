import React, { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Button, Card } from "react-bootstrap";
import { IPlace } from "../../common/Interfaces";
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
    onAdd : (index : number) => void,
    onDelete : (index : number, photos : number[]) => void,
    onPlaceDelete : (index : number) => void,
}

export default function Place(props : PlaceProps) {
    const newChecked : {[id : number] : boolean} = {};
    props.place.photos.forEach((value) => {
        newChecked[value.photo_id] = false;
    });

    const [checked, setChecked] = useState<{[id : number] : boolean}>(newChecked);

    function onCheck(event : React.ChangeEvent<HTMLInputElement>) {
        const id = parseInt(event.target.name);
        const temp = { ...checked };
        temp[id] = !checked[id];
        setChecked(temp);
    }

    function onDelete() {
        const photos_id : number[] = [];
        Object.keys(checked).forEach((key) => {
            if (checked[parseInt(key)]) photos_id.push(parseInt(key));
        });
        props.onDelete(props.index, photos_id);
    }

    return (
        <Draggable
            draggableId={props.place.place_in_route_id.toString()}
            index={props.index}
        >
            {(provided) => (
                <div
                    className="mt-3 place-entry"
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
                                        className="me-2 mt-1 place-buttons p-0"
                                        onClick={() => props.onAdd(props.index)}
                                    >
                                        <img height={32} className="m-0" src={down} alt={down} />
                                    </Button>
                                    <Button
                                        className="me-4 mt-1 place-buttons p-0"
                                        onClick={onDelete}
                                    >
                                        <img height={32} src={up} alt={up} />
                                    </Button>
                                    <Button
                                        className="me-2 mt-1 place-buttons p-0"
                                        onClick={() => props.onPlaceDelete(props.index)}
                                    >
                                        <img height={32} src={trash} alt={trash} />
                                    </Button>
                                </div>
                            )}
                        </Card.Header>
                        <Card.Body className="d-flex flex-row-reverse place-wrapper">
                            {props.draggable &&
                            <img className="grip-img ps-1" src={grip} alt={grip} {...provided.dragHandleProps} />}
                            <div className="d-flex flex-row overflow-auto place-photos">
                                {props.place.photos.map((value) => (
                                    <React.Fragment key={value.photo_id.toString()}>
                                        <Photo
                                            photo={value}
                                            onClick={props.onPhotoClick}
                                            checked={checked[value.photo_id]}
                                            mode={props.draggable}
                                            focusable={!props.draggable}
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
