import React from "react";
import { Provider } from "react-redux";
import store from "../src/app/store";

// You can import global CSS files here.

// No-op wrapper.
export const Wrapper: React.FC = ({
    children,
}) => <Provider store={store}>{children}</Provider>;
