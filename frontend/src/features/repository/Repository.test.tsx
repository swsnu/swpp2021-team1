import { mount } from "enzyme";
import { BrowserRouter } from "react-router-dom";
import Repository from "./Repository";
import { repositoryFactory, userFactory } from "../../common/Interfaces";

describe("Repository", () => {
    it("Should render correctly", () => {
        const component = mount(
            <BrowserRouter>
                <Repository repository={{ ...repositoryFactory(), collaborators: [userFactory()] }} />
            </BrowserRouter>,
        );
        component.find("ListGroupItem").simulate("click");
        expect(component.find("ListGroupItem").length).toBe(1);
    });
});
