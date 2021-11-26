import { mount } from "enzyme";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import React from "react";
import Place from "./Place";
import { placeFactory } from "../../common/Interfaces";
import * as Photo from "../photo/Photo";

describe("Place", () => {
    const photoClickMock = jest.fn();
    const addMock = jest.fn();
    const deleteMock = jest.fn();
    const placeDeleteMock = jest.fn();
    beforeEach(() => {
        jest.spyOn(Photo, "default").mockImplementation((props) => (
            <div>
                <input
                    id="a"
                    type="checkbox"
                    checked={props.checked}
                    name={props.photo.photo_id.toString()}
                    onChange={(e) => props.onCheck(e)}
                />
            </div>
        ));
    });

    it("Should not render edit button in not draggable mode", () => {
        const component = mount(
            <DragDropContext onDragEnd={jest.fn}>
                <Droppable droppableId="places">
                    {(provided) => (
                        <div
                            className="mt-4"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            <Place
                                place={placeFactory()}
                                index={0}
                                draggable={false}
                                onPhotoClick={photoClickMock}
                                onAdd={addMock}
                                onDelete={deleteMock}
                                onPlaceDelete={placeDeleteMock}
                            />
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>,
        );
        expect(component.find("Draggable").length).toBe(1);
        expect(component.find("Button").length).toBe(0);
    });

    it("Should buttons correctly", () => {
        const component = mount(
            <DragDropContext onDragEnd={jest.fn}>
                <Droppable droppableId="places">
                    {(provided) => (
                        <div
                            className="mt-4"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            <Place
                                place={placeFactory()}
                                index={0}
                                draggable
                                onPhotoClick={photoClickMock}
                                onAdd={addMock}
                                onDelete={deleteMock}
                                onPlaceDelete={placeDeleteMock}
                            />
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>,
        );
        component.find("#a").simulate("change", { target: { value: true } });
        component.find("Button").at(0).simulate("click");
        expect(addMock).toHaveBeenCalledTimes(1);
        component.find("Button").at(1).simulate("click");
        expect(deleteMock).toHaveBeenCalledTimes(1);
        component.find("Button").at(2).simulate("click");
        expect(placeDeleteMock).toHaveBeenCalledTimes(1);
    });
});
