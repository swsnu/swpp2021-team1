// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import Enzyme from "enzyme";
import EnzymeAdapter from "enzyme-adapter-react-17-updated";
import server from "./mocks/server";

Enzyme.configure({
    adapter: new (EnzymeAdapter as any)(),
    disableLifecycleMethods: true,
});

// mock server를 쓰고 싶다면 이 밑 3줄 주석을 해제하시오!
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers);
// afterAll(() => server.close());
