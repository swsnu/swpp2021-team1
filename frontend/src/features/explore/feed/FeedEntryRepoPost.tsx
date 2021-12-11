import React, { useState } from "react";
import { useHistory } from "react-router";
import { Button, Card } from "react-bootstrap";
import { IFeed } from "../../../common/Interfaces";
import Travel from "../../route/popup/Travel";

interface FeedEntryRepoPostProps {
    entry: IFeed
}

const FeedEntryRepoPost = (props: FeedEntryRepoPostProps) => {
    const { entry } = props;
    const author = entry.author ? entry.author[0] : undefined;
    const history = useHistory();
    const [travelShow, setTravelShow] = useState<boolean>(false);

    return (
        <Card className="border-bottom my-5" style={{ maxWidth: 700 }}>
            <div className="row align-items-center mb-4 mx-auto">
                <div
                    className="col-lg-6 text-center
                        text-lg-start mb-3 m-lg-0 d-flex align-items-center justify-content-between"
                    style={{ width: "100%" }}
                >
                    <span className="text-muted ms-1">{props.entry.post_time}</span>
                </div>
                <div className="d-flex justify-content-between">
                    {entry.author.length > 1 ?
                        `${author?.username} and ${entry.author.length - 1} others have travelled to ${entry.region}.` :
                        `${author?.username} has travelled to ${entry.region}.`}
                    <Button
                        id="travel-button"
                        onClick={() => setTravelShow(true)}
                    >
                        Travel
                    </Button>
                </div>
            </div>
            <div className="ms-auto">
                <Button
                    variant="link"
                    onClick={() => history.push(`/repos/${entry.repo_id}`)}
                >
                    View Repository

                </Button>
            </div>
            <Travel repo_id={entry.repo_id} show={travelShow} setShow={setTravelShow} />
        </Card>
    );
};

export default FeedEntryRepoPost;
