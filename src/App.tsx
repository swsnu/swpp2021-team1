import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import LogIn from "./container/login/LogIn";
import Profile from "./container/profile/Profile";
import ProfileSetting from "./container/profile/ProfileSetting";

export default function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Switch>
                    <Route path='/login' exact component={LogIn} />
                    <Route path='/main/:user' exact component={Profile} />
                    <Route path='/main/:user/setting' exact component={ProfileSetting} />
                    <Redirect from='/' to='/login' />
                </Switch>
            </div>
        </BrowserRouter>
    )
}