import { mount } from "enzyme";
import { BrowserRouter } from "react-router-dom";
import { act } from "@testing-library/react";
import { repositoryFactory, userFactory } from "../../../common/Interfaces";
import AddCollaborators from "./AddCollaborators";

const mockFunction = jest.fn();
const mockShow = jest.fn();

describe("AddCollaborators", () => {
    it("Should display No Result if no searched friends", async () => {
        const user = userFactory();
        const friend = userFactory();
        const component = mount(
            <AddCollaborators
                user={{ ...userFactory(), friends: [] }}
                collaborators={[user]}
                setCollaborators={mockFunction}
                setShow={mockShow}
                show
            />,
        );
        component.find("DropdownToggle").simulate("click");
        component.find("#repo-name-input").at(0).simulate("change", { target: { value: "" } });
        expect(component.find("DropdownItem").at(0).text()).toEqual("No Result");
    });

    it("Should add collaborator correctly", async () => {
        const user = userFactory();
        const friend = userFactory();
        const component = mount(
            <AddCollaborators
                user={{ ...userFactory(), friends: [friend] }}
                collaborators={[user]}
                setCollaborators={mockFunction}
                setShow={mockShow}
                show
            />,
        );
        component.find("DropdownToggle").simulate("click");
        component.find("#repo-name-input").at(0).simulate("change", { target: { value: "" } });
        component.find("DropdownItem").at(0).simulate("click");
        component.find("Collaborator CloseButton").simulate("click");
        component.find("ModalFooter Button").simulate("click");
        expect(mockFunction).toHaveBeenCalledWith([user]);
        expect(mockShow).toHaveBeenCalledTimes(1);
    });
});
