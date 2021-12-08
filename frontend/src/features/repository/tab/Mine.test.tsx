import { shallow } from "enzyme";
import LabelsSection from "../../labels/LabelsSection";
import Mine from "./Mine";

describe("Mine", () => {
    it("Should render correctly", () => {
        const component = shallow(<Mine />);
        expect(component.find(LabelsSection).length).toBe(1);
    });
});
