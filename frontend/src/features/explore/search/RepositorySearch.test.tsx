import { mount } from "enzyme";
import { Router } from "react-router";
import { createBrowserHistory } from "history";
import RepositorySearch from "./RepositorySearch";
import { repositorySearchFactory } from "../../../common/Interfaces";

const history = createBrowserHistory();
const mockPush = jest.fn();
const historyMock = { ...history, push: mockPush, listen: jest.fn() };

describe("RepositorySearch", () => {
    it("Should render correctly", () => {
        const component = mount(
            <Router history={historyMock}>
                <RepositorySearch repositorySearch={repositorySearchFactory()} />
            </Router>,
        );
        component.find("ListGroupItem").simulate("click");
        expect(component.find("ListGroupItem").length).toBe(1);
        expect(mockPush).toHaveBeenCalledTimes(1);
    });
});
