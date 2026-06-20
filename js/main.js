/**
 * @fileoverview Entry point for the BuyMyTimeBack application.
 */

import { init } from "./app.js";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
