import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
    BrowserRouter, Route, Redirect, Switch,
} from "react-router-dom";
import SignIn from "../features/auth/login/SignIn";
import Profile from "../features/profile/Profile";
import ProfileSetting from "../features/profile/ProfileSetting";
import Sidebar from "../features/sidebar/Sidebar";
import Post from "../features/post/Post";
import RepositoryList from "../features/repository/RepositoryList";
import RepositoryDetail from "../features/repository/RepositoryDetail";
import RepositoryCreate from "../features/repository/RepositoryCreate";
import Topbar from "../common/topbar/Topbar";
import DiscussionList from "../features/discussion/DiscussionList";
import DiscussionCreate from "../features/discussion/DiscussionCreate";
import DiscussionDetail from "../features/discussion/DiscussionDetail";

export default function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Switch>
                    <Route path="/login" exact component={SignIn} />
                    <>
                        <Topbar />
                        <Container>
                            <Row>
                                <Col xs="3">
                                    <Sidebar />
                                </Col>
                                <Col xs="9" style={{ marginTop: 55 }}>
                                    <Switch>
                                        <Route exact path={["/main/:user", "/main/:user/repos"]}>
                                            <Profile />
                                            <Switch>
                                                <Route path="/main/:user" exact component={Post} />
                                                <Route path="/main/:user/repos" exact component={RepositoryList} />
                                            </Switch>
                                        </Route>
                                        <Route path="/main/:user/setting" exact component={ProfileSetting} />
                                        <Route path="/repos/create" exact component={RepositoryCreate} />
                                        <Route path="/repos/:id" exact component={RepositoryDetail} />
                                        <Route path="/repos/:id/discussion" exact component={DiscussionList} />
                                        <Route path="/repos/:id/discussion/create" exact component={DiscussionCreate} />
                                        <Route
                                            path="/repos/:id/discussion/create/:id2"
                                            exact
                                            component={DiscussionDetail}
                                        />
                                        <Redirect from="/" to="/login" />
                                    </Switch>
                                </Col>
                            </Row>
                        </Container>
                    </>
                </Switch>
            </div>
        </BrowserRouter>
    );
}
