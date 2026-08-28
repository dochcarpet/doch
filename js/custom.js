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


/* =========================================================
   CUSTOM RUG PRICE CALCULATOR
========================================================= */

const CUSTOM_RUG_PRICE_PER_100CM2 = 1.5;

const CUSTOM_RUG_SHAPE_MULTIPLIERS = {

    rectangle: 1,

    square: 1,

    round: 1.10,

    organic: 1.20

};

const CUSTOM_RUG_SURFACE_MULTIPLIERS = {

    flat: 1,

    carved: 1.20

};


function calculateCustomRugPrice() {

    const width =
        Number(
            rugWidthInput?.value
        );

    const height =
        Number(
            rugHeightInput?.value
        );

    const quantity =
        Math.max(
            1,
            Number(
                rugQuantityInput?.value
            ) || 1
        );

    const shape =
        rugShapeInput?.value ||
        "rectangle";

    const surface =
        rugSurfaceInput?.value ||
        "flat";


    if (
        !width ||
        !height ||
        width < 40 ||
        height < 40
    ) {

        if (rugEstimatePrice) {

            rugEstimatePrice.textContent =
                "€ —";

        }

        return null;

    }


    const area =
        width * height;


    const basePrice =
        (
            area / 100
        ) *
        CUSTOM_RUG_PRICE_PER_100CM2;


    const shapeMultiplier =
        CUSTOM_RUG_SHAPE_MULTIPLIERS[
            shape
        ] || 1;


    const surfaceMultiplier =
        CUSTOM_RUG_SURFACE_MULTIPLIERS[
            surface
        ] || 1;


    const price =
        basePrice *
        shapeMultiplier *
        surfaceMultiplier *
        quantity;


    const roundedPrice =
        Math.ceil(
            price / 5
        ) * 5;


    if (rugEstimatePrice) {

        rugEstimatePrice.textContent =
            `€${roundedPrice}`;

    }


    return roundedPrice;

}

