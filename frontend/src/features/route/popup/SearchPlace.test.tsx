import { mount } from "enzyme";
import SearchPlace from "./SearchPlace";
import { placeQueryFactory } from "../../../common/Interfaces";

describe("SearchPlace", () => {
    const mockShow = jest.fn();
    const mockConfirm = jest.fn();
    const mockSearch = jest.fn();
    const mockClear = jest.fn();

    it("Should render correctly", () => {
        const component = mount(
            <SearchPlace
                queryResult={[placeQueryFactory()]}
                isLoading={false}
                onConfirm={mockConfirm}
                onSearch={mockSearch}
                onClear={mockClear}
                show
                setShow={mockShow}
            />,
        );
        expect(component.find("ModalHeader").length).toBe(1);
    });

    it("Should disable button if on loading", () => {
        const component = mount(
            <SearchPlace
                queryResult={[]}
                isLoading
                onConfirm={mockConfirm}
                onSearch={mockSearch}
                onClear={mockClear}
                show
                setShow={mockShow}
            />,
        );
        component.find("InputGroup").find("Button").simulate("click");
        expect(mockSearch).toHaveBeenCalledTimes(0);
    });

    it("Should be able to search places or region", () => {
        const placeQuery = placeQueryFactory();
        const component = mount(
            <SearchPlace
                queryResult={[placeQuery]}
                isLoading={false}
                onConfirm={mockConfirm}
                onSearch={mockSearch}
                onClear={mockClear}
                show
                setShow={mockShow}
            />,
        );
        component.find("InputGroup").find("input").simulate("change", { target: { value: "test" } });
        component.find("InputGroup").find("Button").simulate("click");
        expect(mockSearch).toHaveBeenCalledWith("test");
        component.find("ListGroupItem").find("input").simulate("change", { target: { value: true } });
        component.find("ListGroupItem").simulate("click");
        component.find("ModalFooter").find("Button").at(0).simulate("click");
        expect(mockConfirm).toHaveBeenCalledWith(placeQuery);
        expect(mockShow).toHaveBeenCalledTimes(1);
        expect(mockClear).toHaveBeenCalledTimes(1);
    });

    it("Should be able to cancel modal", () => {
        const component = mount(
            <SearchPlace
                queryResult={[{ ...placeQueryFactory(), name: undefined }]}
                isLoading={false}
                onConfirm={mockConfirm}
                onSearch={mockSearch}
                onClear={mockClear}
                show
                setShow={mockShow}
            />,
        );
        component.find("ModalFooter").find("Button").at(1).simulate("click");
        expect(mockConfirm).toHaveBeenCalledTimes(0);
        expect(mockShow).toHaveBeenCalledTimes(1);
        expect(mockClear).toHaveBeenCalledTimes(1);
    });
});
