import React, { useContext, useEffect } from "react";
import {
    Button, Col, Container, Row,
} from "react-bootstrap";
import {
    Route, Redirect, Switch, Link,
} from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
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
import Explore from "../features/explore/Explore";
import { SocketContext } from "./socket";
import {
    INotification,
    IPost, IRepository, NoticeType, PostType,
} from "../common/Interfaces";
import { useAppDispatch, useAppSelector } from "./hooks";
import { updateCount } from "../features/notification/noticesSlice";

export default function App() {
    const socket = useContext<WebSocket>(SocketContext);
    const account = useAppSelector((state) => state.auth.account);
    const dispatch = useAppDispatch();

    const markAsRead = (notificationId: number) => {
        socket.send(JSON.stringify({
            type: "notification_read",
            notification_id: notificationId,
        }));
    };

    useEffect(() => {
        if (account) {
            socket.send(JSON.stringify({
                type: "notification_get_count",
            }));
        }
    }, [account]);

    useEffect(() => {
        socket.onopen = () => {
            console.log("WebSocket Client Connected");
        };
        socket.onmessage = (message) => {
            console.log(message);
            const data = JSON.parse(message.data);
            if ("new" in data) {
                const notiData: INotification = data;
                const notiType = notiData.classification;
                const notiId = notiData.notification_id;
                let toastContent;
                if (notiType === NoticeType.COMMENT) {
                    toastContent = "comment";
                }
                else if (notiType === NoticeType.FORK) {
                    toastContent = "fork";
                }
                else if (notiType === NoticeType.FRIEND_REQUEST) {
                    toastContent = "friendRequest";
                }
                else if (notiType === NoticeType.INVITATION) {
                    toastContent = "invitation";
                }
                else if (notiType === NoticeType.LIKE) {
                    toastContent = "like";
                }
                else if (notiType === NoticeType.NEW_DISCUSSION) {
                    toastContent = "new discussion";
                }
                else if (notiType === NoticeType.NEW_POST) {
                    const post = notiData.post as IPost;
                    const repo = notiData.repository as IRepository;
                    if (post.post_type === PostType.REPO) {
                        toastContent = () => (
                            <div>
                                Your repository
                                <Link
                                    to={`/repos/${repo.repo_id}`}
                                >
                                    {repo.repo_name}
                                </Link>
                                was posted.
                            </div>
                        );
                    }
                    else {
                        const authorUsername = post.author![0].username;
                        toastContent = (params: { closeToast: () => void}) => (
                            <div>
                                New Post on
                                {" "}
                                <Link to={`/repos/${repo.repo_id}`}>
                                    {repo.repo_name}
                                </Link>
                                {" "}
                                by
                                {" "}
                                <Link to={`/main/${authorUsername}`}>
                                    {authorUsername}
                                </Link>
                                <Link
                                    to={`/posts/${post.post_id}`}
                                    className="float-end"
                                >
                                    <Button
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => {
                                            params.closeToast();
                                            markAsRead(notiId);
                                        }}
                                    >
                                        View
                                    </Button>
                                </Link>
                            </div>
                        );
                    }
                }
                else toastContent = "Wrong notification type";
                toast(toastContent, {
                    autoClose: 10000,
                    closeOnClick: false,
                    onClose: () => markAsRead(notiId),
                });
            }
            else if ("count" in data) {
                const { count } = data;
                dispatch(updateCount(count));
            }
        };
    }, [SocketContext]);
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
                                        <Route path="/explore" exact component={Explore} />
                                        <Route path="/notification" exact component={NotificationList} />
                                        <Redirect from="/" to="/login" />
                                    </Switch>
                                </Container>
                            </Col>
                        </Row>
                    </Container>
                </>
            </Switch>
            <ToastContainer />
        </div>
    );
}
