/* =========================================================
   DOCH — CUSTOM RUG
========================================================= */

import {
    translations
} from "./translations.js";

import {
    SUPABASE_URL,
    SUPABASE_KEY
} from "./config.js";


let currentLanguage = "en";


/* =========================================================
   DOM
========================================================= */

const customButton =
    document.getElementById("customButton");

const customModal =
    document.getElementById("customModal");

const customModalClose =
    document.getElementById("customModalClose");

const customForm =
    document.getElementById("customRequestForm");

const customSuccess =
    document.getElementById("customSuccess");

const customSubmit =
    customForm
        ? customForm.querySelector(".custom-submit")
        : null;


/* =========================================================
   CUSTOM RUG OPTIONS
========================================================= */

const rugWidthInput =
    document.getElementById("rugWidth");

const rugHeightInput =
    document.getElementById("rugHeight");

const rugShapeInput =
    document.getElementById("rugShape");

const rugSurfaceInput =
    document.getElementById("rugSurface");

const rugQuantityInput =
    document.getElementById("rugQuantity");

const rugEstimatePrice =
    document.getElementById("rugEstimatePrice");

const rugShapeOptions =
    document.querySelectorAll(
        ".rug-shape-option"
    );

const rugSurfaceOptions =
    document.querySelectorAll(
        ".rug-surface-option"
    );

const quantityMinus =
    document.getElementById("quantityMinus");

const quantityPlus =
    document.getElementById("quantityPlus");
