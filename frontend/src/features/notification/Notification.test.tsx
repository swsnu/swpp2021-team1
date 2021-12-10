import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import {
    IPost, NoticeType, notificationFactory, PostType,
} from "../../common/Interfaces";
import Notification from "./Notification";

const history = createBrowserHistory();
const mockPush = jest.fn();
const historyMock = { ...history, push: mockPush, listen: jest.fn() };
const notification = notificationFactory();

describe("Notification", () => {
    it("Should render correctly - repo_post ", () => {
        const component = mount(
            <Router history={historyMock}>
                <Notification notification={{
                    ...notification,
                    classification: NoticeType.NEW_POST,
                    post: { ...notification.post as IPost, post_type: PostType.REPO },
                }}
                />
            </Router>,
        );
        expect(component.find(".noti_repo_post").length).toBe(2);
        component.find(".noti_repo_post").at(0).simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("Should render correctly - personal_post ", () => {
        let component = mount(
            <Router history={historyMock}>
                <Notification notification={{
                    ...notification,
                    classification: NoticeType.NEW_POST,
                    post: { ...notification.post as IPost, post_type: PostType.PERSONAL },
                }}
                />
            </Router>,
        );
        expect(component.find(".noti_personal_post").length).toBe(2);
        component.find(".noti_personal_post").at(0).simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(1);
        component = mount(
            <Router history={historyMock}>
                <Notification notification={{
                    ...notification,
                    classification: NoticeType.NEW_POST,
                    post: { ...notification.post as IPost, post_type: PostType.PERSONAL },
                    from_user: { ...notification.from_user, profile_picture: undefined },
                }}
                />
            </Router>,
        );
        expect(component.find(".noti_personal_post").length).toBe(2);
    });

    it("Should render correctly - noti_discussion ", () => {
        const component = mount(
            <Router history={historyMock}>
                <Notification notification={{
                    ...notification,
                    classification: NoticeType.NEW_DISCUSSION,
                }}
                />
            </Router>,
        );
        expect(component.find(".noti_discussion").length).toBe(2);
        component.find(".noti_discussion").at(0).simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it("Should render correctly - noti_comment_discussion ", () => {
        const component = mount(
            <Router history={historyMock}>
                <Notification notification={{
                    ...notification,
                    classification: NoticeType.COMMENT,
                    post: undefined,
                    count: 1,
                }}
                />
            </Router>,
        );
        const text = component.find(".noti_comment_discussion").at(1).text();
        expect(component.find(".noti_comment_discussion").length).toBe(2);
        component.find(".noti_comment_discussion").at(0).simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(1);
        const component2 = mount(
            <Router history={historyMock}>
                <Notification notification={{
                    ...notification,
                    classification: NoticeType.COMMENT,
                    post: undefined,
                    count: 2,
                }}
                />
            </Router>,
        );
        expect(component2.find(".noti_comment_discussion").at(1).text()).not.toEqual(text);
    });

    it("Should render correctly - noti_comment_post ", () => {
        const component = mount(
            <Router history={historyMock}>
                <Notification notification={{
                    ...notification,
                    classification: NoticeType.COMMENT,
                    discussion: undefined,
                    count: 1,
                }}
                />
            </Router>,
        );
        const text = component.find(".noti_comment_post").at(1).text();
        expect(component.find(".noti_comment_post").length).toBe(2);
        component.find(".noti_comment_post").at(0).simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(1);
        const component2 = mount(
            <Router history={historyMock}>
                <Notification notification={{
                    ...notification,
                    classification: NoticeType.COMMENT,
                    discussion: undefined,
                    count: 2,
                }}
                />
            </Router>,
        );
        expect(component2.find(".noti_comment_post").at(1).text()).not.toEqual(text);
    });

    it("Should render correctly - noti_fork ", () => {
        const component = mount(
            <Router history={historyMock}>
                <Notification notification={{
                    ...notification,
                    classification: NoticeType.FORK,
                    count: 1,
                }}
                />
            </Router>,
        );
        const text = component.find(".noti_fork").at(1).text();
        expect(component.find(".noti_fork").length).toBe(2);
        component.find(".noti_fork").at(0).simulate("click");
        expect(mockPush).toHaveBeenCalledTimes(1);
        const component2 = mount(
            <Router history={historyMock}>
                <Notification notification={{
                    ...notification,
                    classification: NoticeType.FORK,
                    count: 2,
                }}
                />
            </Router>,
        );
        expect(component2.find(".noti_fork").at(1).text()).not.toEqual(text);
    });
});
