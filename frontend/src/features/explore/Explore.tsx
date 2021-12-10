import React, { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import Feed from "./feed/Feed";
import Search from "./search/Search";

const Explore = () => {
    const [key, setKey] = useState("feed");
    return (
        <div>
            <h2 className="mt-5 mb-2">Explore</h2>
            <Tabs
                activeKey={key}
                onSelect={(k) => setKey(k as string)}
                className="mb-3"
            >
                <Tab eventKey="feed" title="Feed">
                    <Feed />
                </Tab>
                <Tab eventKey="search" title="Search">
                    <Search />
                </Tab>
            </Tabs>
        </div>
    );
};

export default Explore;
