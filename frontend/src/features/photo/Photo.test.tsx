import { mount } from "enzyme";
import { photoFactory } from "../../common/Interfaces";
import Photo from "./Photo";

const mockFunction = jest.fn();
const mockCheck = jest.fn();

describe("Photo", () => {
    it("Should display image and can focus image", async () => {
        const photo = photoFactory();
        const component = mount(
            <Photo photo={photo} onClick={mockFunction} mode={false} checked={false} onCheck={mockCheck} />,
        );
        expect(component.find("img").length).toBe(1);
        component.find("button").simulate("click");
        expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it("Should be able to check photos", async () => {
        const photo = photoFactory();
        const component = mount(
            <Photo photo={photo} onClick={mockFunction} mode checked={false} onCheck={mockCheck} />,
        );
        expect(component.find("FormCheck").length).toBe(1);
        component.find("FormCheck input").simulate("change", { target: { value: true } });
        expect(mockCheck).toHaveBeenCalledTimes(1);
    });
});
