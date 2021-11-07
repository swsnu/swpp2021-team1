// src/mocks/browser.js
import { setupWorker } from "msw";
import handlers from "./handlers";

// This configures a Service Worker with the given request handlers.
export default setupWorker(...handlers);
