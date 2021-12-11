import React, { useState } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import {
    Button, Carousel, Figure, Card,
} from "react-bootstrap";
import { IFeed } from "../../../common/Interfaces";
import avatar from "../../../common/assets/avatar.jpg";

interface FeedEntryProps {
    entry: IFeed
}

const FeedEntry = (props: FeedEntryProps) => {
    const { entry } = props;
    const [index, setIndex] = useState<number>(0);
    const currentPhoto = entry.photos[index];
    const author = entry.author ? entry.author[0] : undefined;
    const history = useHistory();

    const handleSelect = (selectedIndex: number) => {
        setIndex(selectedIndex);
    };

    return (
        <Card className="mb-5" style={{ maxWidth: 700 }}>
            <div className="row align-items-center mb-4 mx-auto">
                {/* <FontAwesomeIcon
                className="mt-2 me-3"
                icon={faMapMarkerAlt} width="1em" height="1em" color="#f69d72" /> */}
                <span className="text-muted text-sm my-1">{props.entry.region}</span>
                <div
                    className="col-lg-6 text-center
                        text-lg-start mb-3 m-lg-0 d-flex align-items-center justify-content-between"
                    style={{ width: "100%" }}
                >
                    <Link
                        to={`/main/${author?.username}`}
                        id="author-username"
                        className="text-decoration-none text-dark"
                    >
                        <img
                            src={author?.profile_picture ? author?.profile_picture : avatar}
                            className="rounded-circle shadow-1-strong me-3"
                            height="40"
                            alt=""
                            loading="lazy"
                        />

                        <strong>

                            {author?.username}

                        </strong>
                    </Link>
                    <span className="text-muted ms-1">{props.entry.post_time}</span>
                </div>
                <hr />
                <h1 className="fs-4">{props.entry.title}</h1>
                <Figure>
                    <Carousel
                        activeIndex={index}
                        onSelect={handleSelect}
                        className="shadow-2-strong rounded-5 mb-4 mx-auto w-100"
                        style={{ maxWidth: 700 }}
                        interval={null}
                    >
                        {props.entry?.photos.map((photo) => (
                            <Carousel.Item
                                key={photo.photo_id}
                            >
                                <img
                                    className="d-block w-100"
                                    src={photo.image}
                                    alt={`id ${photo.photo_id}`}
                                    style={{ verticalAlign: "auto !important" }}
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                    <Figure.Caption className="text-center">
                        {currentPhoto?.local_tag}
                    </Figure.Caption>
                </Figure>
            </div>

            <div
                className="ms-auto"
            >
                <Button
                    onClick={() => history.push(`/posts/${entry.post_id}`)}
                >
                    View Detail
                </Button>

            </div>
        </Card>
    );
};

export default FeedEntry;
