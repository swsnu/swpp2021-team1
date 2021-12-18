import "./FeedEntry.css";

import { faFolder, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Card, Carousel, Figure } from "react-bootstrap";
import { Link } from "react-router-dom";

import avatar from "../../../common/assets/avatar.jpg";
import { IFeed } from "../../../common/Interfaces";

interface FeedEntryProps {
    entry: IFeed
}

const FeedEntry = (props: FeedEntryProps) => {
    const { entry } = props;
    const [index, setIndex] = useState<number>(0);
    const currentPhoto = entry.photos[index];
    const author = entry.author ? entry.author[0] : undefined;

    const handleSelect = (selectedIndex: number) => {
        setIndex(selectedIndex);
    };

    return (
        <Card className="mb-5 px-4 pt-4 pb-3" style={{ maxWidth: 700 }}>
            <div className="row align-items-center mb-3 mx-auto">
                <div className="d-flex justify-content-between mb-3">
                    <Link
                        to={`/repos/${entry.repo_id}`}
                        className="text-decoration-none"
                    >
                        <FontAwesomeIcon
                            className="mt-2 me-2"
                            icon={faFolder}
                            width="1em"
                            height="1em"
                        />
                        {entry.repo_name}
                    </Link>
                    <div className="text-muted small">
                        <FontAwesomeIcon
                            className="mt-2 me-2"
                            icon={faMapMarkerAlt}
                            width="1em"
                            height="1em"
                        />
                        <span className="text-sm my-1">{props.entry.region.region_address}</span>
                    </div>
                </div>
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
                <hr className="my-2" />
                <Figure>
                    <Carousel
                        data-testid="carousel"
                        activeIndex={index}
                        onSelect={handleSelect}
                        className="shadow-2-strong rounded-5 my-2 mx-auto w-100"
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
                <hr className="mb-2" />
                <Link
                    className="fs-4 feed-title ms-2"
                    to={`/posts/${entry.post_id}`}
                >
                    {props.entry.title}

                </Link>
            </div>

            <div
                className="ms-auto"
            />
        </Card>
    );
};

export default FeedEntry;
