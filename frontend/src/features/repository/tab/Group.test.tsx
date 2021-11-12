import { shallow } from "enzyme";
import Group from "./Group";

describe("Group", () => {
    it("Should render correctly", () => {
        const component = shallow(<Group />);
        expect(component.find("div").length).toBe(1);
    });
});
