import { shallow } from "enzyme";
import Mine from "./Mine";

describe("Mine", () => {
    it("Should render correctly", () => {
        const component = shallow(<Mine />);
        expect(component.find("div").length).toBe(1);
    });
});
