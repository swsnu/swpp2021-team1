import { mount, shallow } from "enzyme";
import { BrowserRouter } from "react-router-dom";
import { feedFactoryRepo, userFactory } from "../../../common/Interfaces";
import FeedEntryRepoPost from "./FeedEntryRepoPost";

describe("FeedEntryRepoPost", () => {
    it("should render", () => {
        const wrapper = shallow(
            <BrowserRouter>
                <FeedEntryRepoPost entry={feedFactoryRepo()} />
            </BrowserRouter>,
        );
        expect(wrapper.find(FeedEntryRepoPost).length).toBe(1);
    });
    it("should handle travel button click", () => {
        const wrapper = mount(
            <BrowserRouter>
                <FeedEntryRepoPost entry={feedFactoryRepo()} />
            </BrowserRouter>,
        );
        const travelButton = wrapper.find("button#travel-button");
        travelButton.simulate("click");
    });
    it("should handle multiple authors", () => {
        const entry = feedFactoryRepo();
        entry.author.push(userFactory());
        const wrapper = mount(
            <BrowserRouter>
                <FeedEntryRepoPost entry={entry} />
            </BrowserRouter>,
        );
        expect(wrapper.html()).toMatch("others have travelled to");
    });
});
