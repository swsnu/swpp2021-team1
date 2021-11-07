import { mount } from "enzyme";
import { BrowserRouter } from "react-router-dom";
import { act } from "@testing-library/react";
import { photoFactory } from "../../common/Interfaces";
import Photo from "./Photo";

const mockFunction = jest.fn();
const mockCheck = jest.fn();

describe("FocusedPhoto", () => {
    it("Should display image and can focus image", async () => {
        const photo = photoFactory();
        const component = mount(
            <Photo photo={photo} onClick={mockFunction} mode={false} checked={false} onCheck={mockCheck} />,
        );
        expect(component.find("img").length).toBe(1);
        component.find("button").simulate("click");
        expect(mockFunction).toHaveBeenCalledTimes(1);
    });
});