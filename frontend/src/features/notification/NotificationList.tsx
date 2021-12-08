// suppress no-tsx-component-props
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ListGroup } from "react-bootstrap";
import * as actionCreators from "./noticesSlice";
import { AppDispatch, RootState } from "../../app/store";
import { INotification, NoticeAnswerType, NoticeType } from "../../common/Interfaces";
import NotificationResponse from "./NotificationResponse";
import Notification from "./Notification";

export default function NotificationList() {
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, hasError, notifications] = useSelector<RootState, [boolean, boolean, INotification[]]>(
        (state) => [state.notices.isLoading, state.notices.hasError, state.notices.notifications],
    );

    useEffect(() => {
        dispatch(actionCreators.fetchNotifications());
    }, [dispatch]);

    function response(id : number, answer : NoticeAnswerType) {
        dispatch(actionCreators.responseNotification({ id, answer }));
    }

    if (isLoading) return null;
    return (
        <div>
            <h4 className="mb-3 mt-5">Notifications</h4>
            <ListGroup>
                {notifications.map((value) => {
                    if (value.classification <= NoticeType.INVITATION) {
                        return <NotificationResponse notification={value} response={response} />;
                    }
                    return <Notification notification={value} />;
                })}
            </ListGroup>
        </div>
    );
}
