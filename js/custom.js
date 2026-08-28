/* =========================================================
   DOCH — CUSTOM RUG
========================================================= */

import {
    SUPABASE_URL,
    SUPABASE_KEY
} from "./config.js";



/* =========================================================
   STATE
========================================================= */

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
   INPUTS
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


/* =========================================================
   OPTIONS
========================================================= */

const rugShapeOptions =
    document.querySelectorAll(
        ".rug-shape-option"
    );

const rugSurfaceOptions =
    document.querySelectorAll(
        ".rug-surface-option"
    );


/* =========================================================
   QUANTITY BUTTONS
========================================================= */

const quantityMinus =
    document.getElementById("quantityMinus");

const quantityPlus =
    document.getElementById("quantityPlus");


/* =========================================================
   LANGUAGE
========================================================= */

export function setCustomLanguage(language) {

    if (!translations[language]) {
        return;
    }

    currentLanguage =
        language;

}


/* =========================================================
   CUSTOM MODAL
========================================================= */

function openCustomModal() {

    if (!customModal) {
        return;
    }

    customModal.classList.add(
        "active"
    );

    document.body.classList.add(
        "no-scroll"
    );

    calculateCustomRugPrice();

}


function closeCustomModal() {

    if (!customModal) {
        return;
    }

    customModal.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "no-scroll"
    );

}


/* =========================================================
   OPEN / CLOSE EVENTS
========================================================= */

if (customButton) {

    customButton.addEventListener(
        "click",
        openCustomModal
    );

}


if (customModalClose) {

    customModalClose.addEventListener(
        "click",
        closeCustomModal
    );

}


if (customModal) {

    customModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                customModal
            ) {

                closeCustomModal();

            }

        }
    );

}


/* =========================================================
   PRICE CALCULATOR
========================================================= */

const CUSTOM_RUG_PRICE_PER_100CM2 =
    1.5;


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


/* =========================================================
   SHAPE OPTIONS
========================================================= */

rugShapeOptions.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                rugShapeOptions.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                const shape =
                    button.dataset.shape;


                if (rugShapeInput) {

                    rugShapeInput.value =
                        shape;

                }


                calculateCustomRugPrice();

            }
        );

    }
);


/* =========================================================
   SURFACE OPTIONS
========================================================= */

rugSurfaceOptions.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                rugSurfaceOptions.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                const surface =
                    button.dataset.surface;


                if (rugSurfaceInput) {

                    rugSurfaceInput.value =
                        surface;

                }


                calculateCustomRugPrice();

            }
        );

    }
);


/* =========================================================
   SIZE → PRICE
========================================================= */

[
    rugWidthInput,
    rugHeightInput
].forEach(
    input => {

        if (!input) {
            return;
        }


        input.addEventListener(
            "input",
            calculateCustomRugPrice
        );

    }
);


/* =========================================================
   QUANTITY INPUT
========================================================= */

if (rugQuantityInput) {

    rugQuantityInput.addEventListener(
        "input",
        () => {

            let quantity =
                Number(
                    rugQuantityInput.value
                ) || 1;


            quantity =
                Math.min(
                    10,
                    Math.max(
                        1,
                        quantity
                    )
                );


            rugQuantityInput.value =
                quantity;


            calculateCustomRugPrice();

        }
    );

}


/* =========================================================
   QUANTITY MINUS
========================================================= */

if (quantityMinus) {

    quantityMinus.addEventListener(
        "click",
        () => {

            const current =
                Number(
                    rugQuantityInput?.value
                ) || 1;


            if (rugQuantityInput) {

                rugQuantityInput.value =
                    Math.max(
                        1,
                        current - 1
                    );

            }


            calculateCustomRugPrice();

        }
    );

}


/* =========================================================
   QUANTITY PLUS
========================================================= */

if (quantityPlus) {

    quantityPlus.addEventListener(
        "click",
        () => {

            const current =
                Number(
                    rugQuantityInput?.value
                ) || 1;


            if (rugQuantityInput) {

                rugQuantityInput.value =
                    Math.min(
                        10,
                        current + 1
                    );

            }


            calculateCustomRugPrice();

        }
    );

}


/* =========================================================
   SUBMIT CUSTOM RUG
========================================================= */

async function submitCustomRugRequest(
    event
) {

    event.preventDefault();


    if (!customForm) {
        return;
    }


    /* =================================================
       INPUTS
    ================================================= */

    const nameInput =
        document.getElementById(
            "customerName"
        );


    const emailInput =
        document.getElementById(
            "customerEmail"
        );


    const messageInput =
        document.getElementById(
            "customerMessage"
        );


    const imageInput =
        document.getElementById(
            "customerImage"
        );


    /* =================================================
       VALUES
    ================================================= */

    const name =
        nameInput?.value.trim() ||
        "";


    const email =
        emailInput?.value.trim() ||
        "";


    const message =
        messageInput?.value.trim() ||
        "";


    const file =
        imageInput?.files?.[0] ||
        null;


    const width =
        Number(
            rugWidthInput?.value
        ) || 0;


    const height =
        Number(
            rugHeightInput?.value
        ) || 0;


    const shape =
        rugShapeInput?.value ||
        "rectangle";


    const surface =
        rugSurfaceInput?.value ||
        "flat";


    const quantity =
        Number(
            rugQuantityInput?.value
        ) || 1;


    const estimatedPrice =
        calculateCustomRugPrice();


    /* =================================================
       VALIDATION
    ================================================= */

    if (
        !name ||
        !email
    ) {

        alert(
            currentLanguage === "ru"
                ? "Пожалуйста, укажите имя и email."
                : "Please enter your name and email."
        );

        return;

    }


    if (
        width < 40 ||
        height < 40 ||
        width > 170 ||
        height > 200
    ) {

        alert(
            currentLanguage === "ru"
                ? "Укажите размер ковра в допустимом диапазоне."
                : "Please enter a rug size within the available range."
        );

        return;

    }


    if (!estimatedPrice) {

        alert(
            currentLanguage === "ru"
                ? "Пожалуйста, укажите размер ковра."
                : "Please enter the rug size."
        );

        return;

    }


    if (!file) {

        alert(
            currentLanguage === "ru"
                ? "Пожалуйста, выберите изображение."
                : "Please choose an image."
        );

        return;

    }


    /* =================================================
       FILE SIZE
    ================================================= */

    const maxFileSize =
        10 * 1024 * 1024;


    if (
        file.size >
        maxFileSize
    ) {

        alert(
            currentLanguage === "ru"
                ? "Изображение должно быть меньше 10 MB."
                : "Image must be smaller than 10 MB."
        );

        return;

    }


    /* =================================================
       BUTTON STATE
    ================================================= */

    const originalButtonHTML =
        customSubmit?.innerHTML ||
        "";


    if (customSubmit) {

        customSubmit.disabled =
            true;

        customSubmit.style.opacity =
            "0.5";

        customSubmit.style.pointerEvents =
            "none";

        customSubmit.innerHTML =
            currentLanguage === "ru"
                ? "ОТПРАВЛЯЕМ... ↗"
                : "SENDING... ↗";

    }


    try {

        /* =================================================
           1. FILE EXTENSION
        ================================================= */

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const safeExtension =
            /^[a-z0-9]+$/.test(
                extension
            )
                ? extension
                : "jpg";


        /* =================================================
           2. UNIQUE FILE NAME
        ================================================= */

        const fileName =
            `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;


        const filePath =
            `custom/${fileName}`;


        /* =================================================
           3. STORAGE BUCKET
        ================================================= */

        const bucket =
            "custom-rugs";


        /* =================================================
           4. UPLOAD IMAGE
        ================================================= */

        const uploadResponse =
            await fetch(
                `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
                {
                    method: "POST",

                  headers: {
                      "apikey":
                          SUPABASE_KEY,
                  
                      "Authorization":
                          `Bearer ${SUPABASE_KEY}`
                  },

                    body:
                        file

                }
            );


        if (
            !uploadResponse.ok
        ) {

            const errorText =
                await uploadResponse.text();


            throw new Error(
                `Storage upload failed: ${uploadResponse.status} ${errorText}`
            );

        }


        /* =================================================
           5. PUBLIC IMAGE URL
        ================================================= */

        const imageUrl =
            `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;


        /* =================================================
           6. ORDER DATA
        ================================================= */


        /* =================================================
           7. CREATE DATABASE RECORD
        ================================================= */

         console.log("DOCH SUPABASE URL:", SUPABASE_URL);
         console.log(
             "DOCH KEY TYPE:",
             SUPABASE_KEY?.startsWith("sb_publishable_")
                 ? "publishable"
                 : "NOT publishable"
         );
         console.log(
             "DOCH KEY LENGTH:",
             SUPABASE_KEY?.length
         );

        const orderResponse =
    await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/create_custom_rug_order`,
       console.log("RPC STATUS:", orderResponse.status);

const rawResponse = await orderResponse.text();

console.log("RPC RAW RESPONSE:", rawResponse);

if (!orderResponse.ok) {
    throw new Error(
        `Order creation failed: ${orderResponse.status} ${rawResponse}`
    );
}

let createdOrder;

try {
    createdOrder = JSON.parse(rawResponse);
} catch (error) {
    throw new Error(
        `Invalid RPC response: ${rawResponse}`
    );
}

console.log(
    "DOCH CUSTOM ORDER:",
    createdOrder
);
        {
            method: "POST",

            headers: {
                "apikey":
                    SUPABASE_KEY,

                "Authorization":
                    `Bearer ${SUPABASE_KEY}`,

                "Content-Type":
                    "application/json"
            },

            body:
                JSON.stringify({
                    p_name: name,
                    p_email: email,
                    p_image_url: imageUrl,
                    p_description: message,
                    p_width: width,
                    p_height: height,
                    p_shape: shape,
                    p_surface: surface,
                    p_quantity: quantity,
                    p_estimated_price: estimatedPrice
                })
        }
    );


        if (
            !orderResponse.ok
        ) {

            const errorText =
                await orderResponse.text();


            throw new Error(
                `Order creation failed: ${orderResponse.status} ${errorText}`
            );

        }


        console.log(
            "DOCH CUSTOM ORDER:",
            createdOrder
        );


        /* =================================================
           8. SUCCESS
        ================================================= */

        customForm.style.display =
            "none";


        if (customSuccess) {

            customSuccess.innerHTML =
                translations[
                    currentLanguage
                ]["customModal.success"];


            customSuccess.style.display =
                "block";

        }


        customForm.reset();


        /* =================================================
           RESTORE DEFAULTS
        ================================================= */

        if (rugShapeInput) {

            rugShapeInput.value =
                "rectangle";

        }


        if (rugSurfaceInput) {

            rugSurfaceInput.value =
                "flat";

        }


        rugShapeOptions.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.shape ===
                    "rectangle"
                );

            }
        );


        rugSurfaceOptions.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.surface ===
                    "flat"
                );

            }
        );


        if (rugQuantityInput) {

            rugQuantityInput.value =
                1;

        }


        calculateCustomRugPrice();


    } catch (error) {

        console.error(
            "DOCH CUSTOM RUG ERROR:",
            error
        );


        alert(
            error?.message ||
            (
                currentLanguage === "ru"
                    ? "Не удалось отправить запрос."
                    : "Could not send your request."
            )
        );


    } finally {

        if (customSubmit) {

            customSubmit.disabled =
                false;

            customSubmit.style.opacity =
                "";

            customSubmit.style.pointerEvents =
                "";

            customSubmit.innerHTML =
                originalButtonHTML;

        }

    }

}


/* =========================================================
   FORM EVENT
========================================================= */

if (customForm) {

    customForm.addEventListener(
        "submit",
        submitCustomRugRequest
    );

}


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        if (
            customModal?.classList.contains(
                "active"
            )
        ) {

            closeCustomModal();

        }

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

export function initCustom() {

    calculateCustomRugPrice();

    console.log(
        "DOCH CUSTOM INITIALIZED"
    );

}
