import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router-dom";
import { discussionFactory } from "../../common/Interfaces";
import Discussion from "./Disucssion";

describe("Discussion", () => {
    it("Should render correctly", () => {
        const history = createBrowserHistory();
        const historyMock = { ...history, push: jest.fn(), listen: jest.fn() };

        const component = mount(
            <Router history={historyMock}>
                <Discussion discussion={discussionFactory()} />
            </Router>,
        );
        component.find("ListGroupItem").simulate("click");
        expect(component.find("ListGroupItem").length).toBe(1);
    });
});
