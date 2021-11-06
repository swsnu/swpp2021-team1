import { ListGroup } from "react-bootstrap";
import { IPhoto } from "../../common/Interfaces";

interface PhotoProps {
    photo : IPhoto;
    onClick : (photo_id : number) => void;
}

export default function Photo(props : PhotoProps) {
    return (
        <ListGroup.Item>
            <button onClick={() => props.onClick(props.photo.photo_id)} type="button">
                <img src={props.photo.image} alt={props.photo.image} />
            </button>
        </ListGroup.Item>
    );
}
