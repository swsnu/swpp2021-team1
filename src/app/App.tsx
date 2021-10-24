import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import LogIn from "../features/auth/login/LogIn";
import Profile from "../features/profile/Profile";
import ProfileSetting from "../features/profile/ProfileSetting";
import Sidebar from '../common/sidebar/Sidebar';
import Post from '../features/post/Post';
import RepositoryList from "../features/repository/RepositoryList";
import RepositoryDetail from "../features/repository/RepositoryDetail";
import RepositoryCreate from "../features/repository/RepositoryCreate";

export default function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Switch>
                    <Route path='/login' exact component={LogIn} />
                    <>
                        <Container>
                            <Row>
                                <Col xs="3">
                                    <Sidebar />
                                </Col>
                                <Col xs="9">
                                    <Switch>
                                        <Route path='/main/:user' exact component={Post} />
                                        <Route path='/main/:user/setting' exact component={ProfileSetting} />
                                        <Route path='/main/:user/repos' exact component={RepositoryList}/>
                                        <Route path='/repos/:id' exact component={RepositoryDetail} />
                                        <Route path='/repos/create' exact component={RepositoryCreate} />
                                        <Redirect from='/' to='/login' />
                                    </Switch>
                                </Col>
                            </Row>
                        </Container>
                    </>
                </Switch>
            </div>
        </BrowserRouter>
    )
}