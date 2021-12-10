import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
    Route, Redirect, Switch,
} from "react-router-dom";
import SignIn from "../features/auth/login/SignIn";
import Profile from "../features/profile/Profile";
import ProfileSetting from "../features/profile/ProfileSetting";
import Sidebar from "../features/sidebar/Sidebar";
import RepositoryList from "../features/repository/RepositoryList";
import RepositoryDetail from "../features/repository/RepositoryDetail";
import RepositoryCreate from "../features/repository/RepositoryCreate";
import Topbar from "../common/topbar/Topbar";
import DiscussionList from "../features/discussion/DiscussionList";
import DiscussionCreate from "../features/discussion/DiscussionCreate";
import DiscussionDetail from "../features/discussion/DiscussionDetail";
import RepositoryHeader from "../features/repository/RepositoryHeader";
import PostList from "../features/post/PostList";
import "./App.css";
import PostDetail from "../features/post/PostDetail";
import PostCreate from "../features/post/PostCreate";
import PlaceDetail from "../features/route/PlaceDetail";
import NotificationList from "../features/notification/NotificationList";

export default function App() {
    return (
        <div className="App">
            <Switch>
                <Route path="/login" exact component={SignIn} />
                <>
                    <Topbar />
                    <Container fluid="md">
                        <Row>
                            <Col xs="3">
                                <Sidebar />
                            </Col>
                            <Col xs="9" className="main-section">
                                <Container>
                                    <Switch>
                                        <Route path="/repos/create" />
                                        <Route path="/repos/:id" component={RepositoryHeader} />
                                    </Switch>
                                    <Switch>
                                        <Route
                                            exact
                                            path={["/main/:user", "/main/:user/repos"]}
                                            render={() => (
                                                <>
                                                    <Profile />
                                                    <Switch>
                                                        <Route
                                                            path="/main/:user"
                                                            exact
                                                            component={PostList}
                                                        />
                                                        <Route
                                                            path="/main/:user/repos"
                                                            exact
                                                            component={RepositoryList}
                                                        />
                                                    </Switch>
                                                </>
                                            )}
                                        />
                                        <Route path="/main/:user/notification" exact component={NotificationList} />
                                        <Route path="/main/:user/setting" exact component={ProfileSetting} />
                                        <Route path="/repos/create" exact component={RepositoryCreate} />
                                        <Route path="/repos/:id" exact component={RepositoryDetail} />
                                        <Route path="/repos/:id/discussion" exact component={DiscussionList} />
                                        <Route path="/repos/:id/discussion/create" exact component={DiscussionCreate} />
                                        <Route path="/repos/:id/place" exact component={PlaceDetail} />
                                        <Route
                                            path="/repos/:id/discussion/:id2"
                                            exact
                                            component={DiscussionDetail}
                                        />
                                        <Route
                                            exact
                                            path="/repos/:repo_id/posts/create"
                                            render={() => <PostCreate mode="create/repo" />}
                                        />
                                        <Route
                                            exact
                                            path="/repos/:repo_id/posts"
                                            component={PostList}
                                        />
                                        <Route
                                            path="/main/:user/create"
                                            exact
                                            render={() => <PostCreate mode="create/user" />}
                                        />
                                        <Route
                                            path="/posts/:post_id/edit"
                                            exact
                                            render={() => <PostCreate mode="edit" />}
                                        />
                                        <Route path="/posts/:post_id" exact component={PostDetail} />
                                        <Redirect from="/" to="/login" />
                                    </Switch>
                                </Container>
                            </Col>
                        </Row>
                    </Container>
                </>
            </Switch>
        </div>
    );
}
