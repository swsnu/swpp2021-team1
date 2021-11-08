import { mount } from "enzyme";
import { BrowserRouter } from "react-router-dom";
import { act } from "@testing-library/react";
import { photoFactory } from "../../../common/Interfaces";
import FocusedPhoto from "./FocusedPhoto";

const mockFunction = jest.fn();
const mockShow = jest.fn();

describe("FocusedPhoto", () => {
    it("Should display image and tag", async () => {
        const photo = photoFactory();
        const component = mount(
            <FocusedPhoto show setShow={mockShow} onEdit={mockFunction} photo={photo} />,
        );
        expect(component.find("Image").length).toBe(1);
        expect(component.find("InputGroup").length).toBe(1);
    });

    it("Should change photo tags", async () => {
        const photo = photoFactory();
        const component = mount(
            <FocusedPhoto show setShow={mockShow} onEdit={mockFunction} photo={photo} />,
        );
        component.find("InputGroup FormControl input").simulate("change", { target: { value: "hello" } });
        component.find("ModalHeader CloseButton button").simulate("click");
        expect(mockFunction).toHaveBeenCalledWith("hello");
    });
});