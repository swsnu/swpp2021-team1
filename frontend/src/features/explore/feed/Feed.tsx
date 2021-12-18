import axios from "axios";
import React, { useEffect, useState } from "react";
import { getFeed } from "../../../common/APIs";
import { IFeed, PostType } from "../../../common/Interfaces";
import FeedEntry from "./FeedEntry";
import FeedEntryRepoPost from "./FeedEntryRepoPost";

const Feed = () => {
    const [entries, setEntries] = useState<IFeed[]>([]);
    const [loading, setLoading] = useState<"idle" | "pending" | "succeeded" | "failed">("idle");
    useEffect(() => {
        const fetchFeed = async () => {
            setLoading("pending");
            setEntries(await getFeed());
            setLoading("succeeded");
        };
        fetchFeed();
    }, []);
    if (loading === "succeeded") {
        return (
            <div data-testid="feed">
                {entries.map((entry) => (entry.post_type === PostType.PERSONAL ? (
                    <FeedEntry
                        entry={entry}
                        key={entry.post_id}
                    />
                ) : <FeedEntryRepoPost entry={entry} key={entry.post_id} />))}
            </div>
        );
    }
    return (<div />);
};

export default Feed;
