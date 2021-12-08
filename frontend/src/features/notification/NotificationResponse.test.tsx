import { createBrowserHistory } from "history";
import { mount } from "enzyme";
import { Router } from "react-router-dom";
import { NoticeType, notificationFactory } from "../../common/Interfaces";
import NotificationResponse from "./NotificationResponse";

const history = createBrowserHistory();
const mockPush = jest.fn();
const historyMock = { ...history, push: mockPush, listen: jest.fn() };
const notification = notificationFactory();

describe("NotificationResponse", () => {
    it("Should render correctly - noti_friend ", () => {
        const mockResponse = jest.fn();
        const component = mount(
            <Router history={historyMock}>
                <NotificationResponse
                    notification={{
                        ...notification,
                        classification: NoticeType.FRIEND_REQUEST,
                    }}
                    response={mockResponse}
                />
            </Router>,
        );
        expect(component.find(".noti_friend").length).toBe(3);
        component.find(".noti_friend").at(0).simulate("click");
    });

    it("Should render correctly - noti_invite ", () => {
        const mockResponse = jest.fn();
        const component = mount(
            <Router history={historyMock}>
                <NotificationResponse
                    notification={{
                        ...notification,
                        classification: NoticeType.INVITATION,
                    }}
                    response={mockResponse}
                />
            </Router>,
        );
        expect(component.find(".noti_invite").length).toBe(3);
        component.find(".noti_invite").at(0).simulate("click");
    });

    it("Should be able to response", () => {
        const mockResponse = jest.fn();
        const component = mount(
            <Router history={historyMock}>
                <NotificationResponse
                    notification={{
                        ...notification,
                        classification: 10,
                    }}
                    response={mockResponse}
                />
            </Router>,
        );
        component.find("button").at(0).simulate("click");
        expect(mockResponse).toHaveBeenCalledTimes(1);
        component.find("button").at(1).simulate("click");
        expect(mockResponse).toHaveBeenCalledTimes(2);
    });
});
