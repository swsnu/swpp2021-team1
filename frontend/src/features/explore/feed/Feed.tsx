import React, { useEffect, useState } from "react";
import { getFeed } from "../../../common/APIs";
import { IFeed, PostType } from "../../../common/Interfaces";
import FeedEntry from "./FeedEntry";
import FeedEntryRepoPost from "./FeedEntryRepoPost";

const Feed = () => {
    const [entries, setEntries] = useState<IFeed[]>([]);
    useEffect(() => {
        const fetchFeed = async () => {
            const data = await getFeed();
            setEntries(data);
        };
        fetchFeed();
    }, []);
    return (
        <>
            {entries.map((entry) => (entry.post_type === PostType.PERSONAL ? (
                <FeedEntry
                    entry={entry}
                    key={entry.post_id}
                />
            ) : <FeedEntryRepoPost entry={entry} key={entry.post_id} />))}
        </>
    );
};

export default Feed;
