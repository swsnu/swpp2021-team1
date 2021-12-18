import { mount, shallow } from "enzyme";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import * as ReactRouterDom from "react-router-dom";
import { Carousel } from "react-bootstrap";
import { feedFactoryPersonal } from "../../../common/Interfaces";
import FeedEntry from "./FeedEntry";
import MockedPhoto from "../../photo/Photo";
import MockedFocusedPhoto from "../../photo/popup/FocusedPhoto";

// jest.spyOn(ReactRouterDom, "Link").mockImplementation(() => () => (<div />));

describe("FeedEntry", () => {
    it("should render", () => {
        const wrapper = mount(
            <BrowserRouter>
                <FeedEntry entry={feedFactoryPersonal()} />
            </BrowserRouter>,
        );
        expect(wrapper.find(FeedEntry).length).toBe(1);
    });
    it("should handle carousel index change", () => {
        const wrapper = mount(
            <BrowserRouter>
                <FeedEntry entry={feedFactoryPersonal()} />
            </BrowserRouter>,
        );
        const nextButton = wrapper.find("a.carousel-control-next");
        nextButton.simulate("click");
    });
});
