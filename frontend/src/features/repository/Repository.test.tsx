import { mount } from "enzyme";
import { createBrowserHistory } from "history";
import { Router } from "react-router";
import Repository from "./Repository";
import { repositoryFactory, userFactory } from "../../common/Interfaces";

const history = createBrowserHistory();
const mockPush = jest.fn();
const historyMock = { ...history, push: mockPush, listen: jest.fn() };

describe("Repository", () => {
    it("Should render correctly", () => {
        const component = mount(
            <Router history={historyMock}>
                <Repository repository={{ ...repositoryFactory(), collaborators: [userFactory()] }} />
            </Router>,
        );
        component.find("ListGroupItem").simulate("click");
        expect(component.find("ListGroupItem").length).toBe(1);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });
});
