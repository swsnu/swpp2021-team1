import { SetStateAction, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { Carousel, Modal } from "react-bootstrap";
import { IPlace } from "../../../common/Interfaces";

interface TravelProps {
    repo_id : number;
    show : boolean;
    setShow : SetStateAction<boolean>;
}

export default function Travel(props : TravelProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [places, setPlaces] = useState<IPlace[]>();
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
        axios.get<never, AxiosResponse<IPlace[]>>(`/api/repositories/${props.repo_id}/travel/`)
            .then((response) => {
                setIsLoading(false);
                setPlaces(response.data);
            });
    }, []);

    const totalImage : string[] = [];
    places?.forEach((value) => {
        value.photos.forEach((src) => {
            totalImage.push(src.image);
        });
    });

    return (
        <Modal show={props.show}>
            {isLoading ? <h3 className="travel-loading">Loading...</h3> : (
                <div>
                    <Carousel activeIndex={index} indicators={false}>
                        {totalImage.map((src) => (
                            <Carousel.Item interval={3000}>
                                <img
                                    className="d-block w-100"
                                    src={src}
                                    alt={src}
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </div>
            )}
        </Modal>
    );
}
