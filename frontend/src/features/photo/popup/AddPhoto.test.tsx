import { mount } from "enzyme";
import AddPhoto from "./AddPhoto";

const mockFunction = jest.fn();
const mockShow = jest.fn();

describe("AddPhoto", () => {
    jest.setTimeout(20000);
    it("Should be able to close modal", async () => {
        const component = mount(
            <AddPhoto show setShow={mockShow} commitPhotos={mockFunction} />,
        );
        component.find("ModalFooter Button").at(1).simulate("click");
        expect(mockFunction).toHaveBeenCalledTimes(1);
        expect(mockShow).toHaveBeenCalledTimes(1);
    });

    it("Should be able to put file", (done) => {
        const component = mount(
            <AddPhoto show setShow={mockShow} commitPhotos={mockFunction} />,
        );
        const file = new File([], "a.jpg");
        const file2 = new File([], "b.jpg");
        component.find("FormControl input").simulate("change", {});
        component.find("FormControl input").simulate("change", { target: { files: [file, file2] } });
        setTimeout(() => {
            done();
        }, 1000);
    });
});
