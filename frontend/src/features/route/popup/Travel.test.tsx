import * as google from "@react-google-maps/api";
import { mount } from "enzyme";
import axios from "axios";
import { act, screen, render } from "@testing-library/react";
import { placeFactory, regionFactory } from "../../../common/Interfaces";
import Travel from "./Travel";

describe("Travel", () => {
    const mockShow = jest.fn();

    beforeEach(() => {
        jest.spyOn(google, "GoogleMap").mockImplementation(() => <div /> as any);
        jest.spyOn(axios, "get")
            .mockResolvedValue({ route: [placeFactory(), placeFactory()], region: regionFactory() });
    });

    it("Should not render if show props is false", () => {
        let component : any = null;
        act(() => {
            component = mount(
                <Travel repo_id={-1} show={false} setShow={mockShow} />,
            );
        });
        expect(component.find(".travel-loading").length).toBe(0);
        expect(component.find("Carousel").length).toBe(0);
    });

    it("Should render correctly - before loading", async () => {
        jest.spyOn(axios, "get").mockRejectedValueOnce(undefined);
        render(<Travel repo_id={-1} show setShow={mockShow} />);
        expect(await screen.findByText("Loading...")).toBeVisible();
    });

    it("Should render correctly - after loading", async () => {
        jest.spyOn(axios, "get").mockImplementation(() => ({
            then: (e: any) => {
                e({ data: { route: [placeFactory(), placeFactory()], region: regionFactory() } });
                return ({ catch: jest.fn() });
            },
        }) as any);
        window.google = { maps: { LatLng: jest.fn() } as any };
        const component = mount(<Travel repo_id={-1} show setShow={mockShow} />);
        expect(component.find("Carousel").length).toBe(1);
        component.find(".carousel-control-next").at(1).simulate("click");
        component.find("CloseButton").simulate("click");
        expect(mockShow).toHaveBeenCalledTimes(1);
    });
});
