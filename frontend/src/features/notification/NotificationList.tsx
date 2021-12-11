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
    const [isLoading, notifications] = useSelector<RootState, [boolean, INotification[]]>(
        (state) => [state.notices.isLoading, state.notices.notifications],
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
                { notifications.length > 0 ?
                    (
                        notifications.map((value) => {
                            if (value.classification <= NoticeType.INVITATION) {
                                return (
                                    <React.Fragment key={value.notification_id}>
                                        <NotificationResponse
                                            notification={value}
                                            response={response}
                                        />
                                    </React.Fragment>
                                );
                            }
                            return (
                                <React.Fragment key={value.notification_id}>
                                    <Notification notification={value} />
                                </React.Fragment>
                            );
                        })
                    ) :
                    (
                        <ListGroup.Item className="text-muted">
                            <h5 className="m-2 fst-italic">
                                There are no notifications.
                            </h5>
                        </ListGroup.Item>
                    )}
            </ListGroup>
        </div>
    );
}
