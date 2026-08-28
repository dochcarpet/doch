/* =========================================================
   DOCH — MAIN
========================================================= */

import {
    initProducts,
    setProductsLanguage,
    getProducts,
    closeProductModal
} from "./products.js";

import {
    addToCart,
    openCart,
    closeCart,
    setCartLanguage
} from "./cart.js";

import {
    translations
} from "./translations.js";

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

const modal =
    document.getElementById("productModal");

const modalClose =
    document.getElementById("modalClose");

const addCartButton =
    document.getElementById("addCart");

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
   LANGUAGE
========================================================= */

function setLanguage(language) {

    if (!translations[language]) {
        return;
    }

    currentLanguage =
        language;

    document.documentElement.lang =
        language;


    /* -----------------------------------------
       REGULAR TRANSLATED ELEMENTS
    ----------------------------------------- */

    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.dataset.i18n;

            const value =
                translations[language][key];

            if (value !== undefined) {

                element.innerHTML =
                    value;

            }

        });


    /* -----------------------------------------
       PLACEHOLDERS
    ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-i18n-placeholder]"
        )
        .forEach(element => {

            const key =
                element.dataset.i18nPlaceholder;

            const value =
                translations[language][key];

            if (value !== undefined) {

                element.placeholder =
                    value;

            }

        });


    /* -----------------------------------------
       LANGUAGE BUTTONS
    ----------------------------------------- */

    document
        .querySelectorAll(".lang-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.lang === language
            );

        });


    /* -----------------------------------------
       PRODUCTS
    ----------------------------------------- */

    setProductsLanguage(
        language
    );


    /* -----------------------------------------
       CART
    ----------------------------------------- */

    setCartLanguage(
        language
    );

}


/* =========================================================
   LANGUAGE BUTTONS
========================================================= */

document
    .querySelectorAll(".lang-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                setLanguage(
                    button.dataset.lang
                );

            }
        );

    });


/* =========================================================
   PRODUCT MODAL CLOSE
========================================================= */

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeProductModal
    );

}


/* =========================================================
   ADD PRODUCT TO CART
========================================================= */

if (addCartButton) {

    addCartButton.addEventListener(
        "click",
        () => {

            const productId =
                modal?.dataset.product;

            if (!productId) {
                return;
            }


            const products =
                getProducts();


            const product =
                products.find(
                    item =>
                        String(item.id) ===
                        String(productId)
                );


            if (!product) {
                return;
            }


            /*
               Do not add sold products.
            */

            if (
                product.status === "sold"
            ) {
                return;
            }


            addToCart(
                product
            );


            closeProductModal();


            openCart();

        }
    );

}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        /* -----------------------------------------
           PRODUCT MODAL
        ----------------------------------------- */

        if (
            modal?.classList.contains(
                "active"
            )
        ) {

            closeProductModal();

        }


        /* -----------------------------------------
           CUSTOM MODAL
        ----------------------------------------- */

        if (
            customModal?.classList.contains(
                "active"
            )
        ) {

            closeCustomModal();

        }


        /* -----------------------------------------
           CART
        ----------------------------------------- */

        closeCart();

    }
);


/* =========================================================
   SCROLL REVEAL
========================================================= */

let scrollObserver = null;


function initScrollReveal() {

    if (
        !("IntersectionObserver" in window)
    ) {
        return;
    }


    if (scrollObserver) {

        scrollObserver.disconnect();

    }


    scrollObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        entry.target.style.opacity =
                            "1";

                        entry.target.style.transform =
                            "translateY(0)";


                        scrollObserver.unobserve(
                            entry.target
                        );

                    }
                );

            },
            {
                threshold: 0.08
            }
        );


    document
        .querySelectorAll(
            [
                ".manifesto h2",
                ".product",
                ".process-card",
                ".queue-item",
                ".about-grid"
            ].join(",")
        )
        .forEach(
            element => {

                element.style.opacity =
                    "0";

                element.style.transform =
                    "translateY(35px)";

                element.style.transition =
                    "opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1)";


                scrollObserver.observe(
                    element
                );

            }
        );

}


/* =========================================================
   FAQ
========================================================= */

function initFAQ() {

    const faqItems =
        document.querySelectorAll(
            ".faq-item"
        );


    faqItems.forEach(
        item => {

            const summary =
                item.querySelector(
                    "summary"
                );


            if (!summary) {
                return;
            }


            summary.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const isOpen =
                        item.hasAttribute(
                            "open"
                        );


                    /*
                       Close everything else.
                    */

                    faqItems.forEach(
                        otherItem => {

                            if (
                                otherItem ===
                                item
                            ) {
                                return;
                            }


                            otherItem.removeAttribute(
                                "open"
                            );


                            otherItem.classList.remove(
                                "active"
                            );

                        }
                    );


                    /*
                       Toggle current item.
                    */

                    if (isOpen) {

                        item.removeAttribute(
                            "open"
                        );

                        item.classList.remove(
                            "active"
                        );

                    } else {

                        item.setAttribute(
                            "open",
                            ""
                        );

                        item.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   CUSTOM RUG MODAL
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
   CUSTOM RUG PRICE CALCULATOR
========================================================= */

/*
   Base price per 100 cm².

   Change this ONE number when we finalize
   the actual DOCH pricing model.
*/

const CUSTOM_RUG_PRICE_PER_100CM2 = 1.5;


/*
   Shape multipliers.

   Rectangle is the base price.
*/

const CUSTOM_RUG_SHAPE_MULTIPLIERS = {

    rectangle: 1,

    square: 1,

    round: 1.10,

    organic: 1.20

};


/*
   Surface multipliers.

   Carving costs more because it requires
   additional manual work.

*/

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
   QUANTITY
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
   CUSTOM MODAL EVENTS
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
   CUSTOM RUG REQUEST
========================================================= */

async function submitCustomRugRequest(
    event
) {

    event.preventDefault();


    if (!customForm) {
        return;
    }


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

    return;

}
       if (
    !estimatedPrice
) {

    alert(
        currentLanguage === "ru"
            ? "Пожалуйста, укажите размер ковра."
            : "Please enter the rug size."
    );

    return;

}

        alert(
            currentLanguage === "ru"
                ? "Пожалуйста, укажите имя и контакт."
                : "Please enter your name and contact."
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
           1. UPLOAD IMAGE
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


        const fileName =
            `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;


        const filePath =
            `custom/${fileName}`;


        const bucket =
            "custom-rugs";


        const uploadResponse =
            await fetch(
                `${SUPABASE_URL}/storage/v1/object/${bucket}/${filePath}`,
                {
                    method: "POST",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Content-Type":
                            file.type ||
                            "application/octet-stream",

                        "x-upsert":
                            "false"

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
           2. PUBLIC IMAGE URL
        ================================================= */

        const imageUrl =
            `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;


/* =================================================
   3. CONTACT
================================================= */

const contactType =
    document.getElementById("contactType")?.value ||
    "telegram";


const order = {

    name:
        name,

    email:
        contactType === "email"
            ? contact
            : null,

    telegram:
        contactType === "telegram"
            ? contact
            : null,

    instagram:
        contactType === "instagram"
            ? contact
            : null,

    image_url:
        imageUrl,

    description:
        message,

    width:
        width,

    height:
        height,

    shape:
        shape,

    surface:
        surface,

    quantity:
        quantity,

    estimated_price:
        estimatedPrice,

    status:
        "new"

}; 

        /* =================================================
           4. CREATE ORDER
        ================================================= */

        const orderResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/orders`,
                {
                    method: "POST",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "return=representation"

                    },

                    body:
                        JSON.stringify(order)

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


        const createdOrder =
            await orderResponse.json();


        console.log(
            "DOCH CUSTOM ORDER:",
            createdOrder
        );


        /* =================================================
           5. SUCCESS
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


if (customForm) {

    customForm.addEventListener(
        "submit",
        submitCustomRugRequest
    );

}

/* =========================================================
   INITIALIZATION
========================================================= */

async function init() {

    /*
       Make translation data available
       globally as a compatibility layer.
    */

    window.translations =
        translations;

    window.currentLanguage =
        currentLanguage;


    /* -----------------------------------------
       INITIAL LANGUAGE
    ----------------------------------------- */

    setLanguage(
        currentLanguage
    );


    /* -----------------------------------------
       PRODUCTS
    ----------------------------------------- */

    await initProducts();


    /* -----------------------------------------
       UI
    ----------------------------------------- */

    initFAQ();

    initScrollReveal();

    initProductDistortion();

    console.log(
        "DOCH MAIN INITIALIZED"
    );

}


/* =========================================================
   START
========================================================= */

init();

/* =========================================================
   PRODUCT IMAGE — THREE.JS FISH-EYE DISTORTION
========================================================= */

function initProductDistortion() {

    if (typeof THREE === "undefined") {
        console.warn("Three.js not loaded");
        return;
    }


    const containers =
        document.querySelectorAll(".product-image");


    containers.forEach(container => {

        if (container.dataset.threeReady) {
            return;
        }


        const img =
            container.querySelector("img");


        if (!img) {
            return;
        }


        container.dataset.threeReady = "true";


        /* =================================================
           SCENE
        ================================================= */

        const scene =
            new THREE.Scene();


        /* =================================================
           CAMERA
        ================================================= */

        const camera =
            new THREE.OrthographicCamera(
                -1,
                1,
                1,
                -1,
                0,
                1
            );


        /* =================================================
           RENDERER
        ================================================= */

        const renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                1.5
            )
        );


        renderer.setSize(
            container.clientWidth,
            container.clientHeight,
            false
        );


        renderer.domElement.classList.add(
            "distortion-canvas"
        );


        container.appendChild(
            renderer.domElement
        );


        /* =================================================
           TEXTURE
        ================================================= */

        const textureLoader =
            new THREE.TextureLoader();


        const texture =
            textureLoader.load(
                img.currentSrc || img.src,
                () => {

                    /*
                       Once Three.js has the image,
                       hide the original <img>.

                       This prevents the original image
                       and WebGL image from being rendered
                       on top of each other.
                    */

                    img.style.opacity = "0";

                }
            );


        texture.minFilter =
            THREE.LinearFilter;

        texture.magFilter =
            THREE.LinearFilter;

        texture.wrapS =
            THREE.ClampToEdgeWrapping;

        texture.wrapT =
            THREE.ClampToEdgeWrapping;


        /* =================================================
           UNIFORMS
        ================================================= */

        const uniforms = {

            uTexture: {
                value: texture
            },

            uMouse: {
                value:
                    new THREE.Vector2(
                        0.5,
                        0.5
                    )
            },

            uTargetMouse: {
                value:
                    new THREE.Vector2(
                        0.5,
                        0.5
                    )
            },

            uHover: {
                value: 0
            },

            uTargetHover: {
                value: 0
            },

            uTime: {
                value: 0
            }

        };


        /* =================================================
           MATERIAL
        ================================================= */

        const material =
            new THREE.ShaderMaterial({

                uniforms,

                vertexShader: `

                    varying vec2 vUv;

                    void main() {

                        vUv = uv;

                        gl_Position =
                            vec4(
                                position,
                                1.0
                            );

                    }

                `,

                fragmentShader: `

                    uniform sampler2D uTexture;

                    uniform vec2 uMouse;

                    uniform float uHover;

                    uniform float uTime;

                    varying vec2 vUv;


                    void main() {

                        vec2 uv =
                            vUv;


                        /*
                           Distance from cursor.
                        */

                        float distanceFromMouse =
                            distance(
                                uv,
                                uMouse
                            );


                        /*
                           Lens radius.
                        */

                        float radius =
                            0.48;


                        /*
                           Soft lens falloff.
                        */

                        float strength =
                            1.0 -
                            smoothstep(
                                0.0,
                                radius,
                                distanceFromMouse
                            );


                        /*
                           Direction from cursor.
                        */

                        vec2 direction =
                            uv - uMouse;


                        /*
                           Fish-eye.
                        */

                        float distortion =
                            strength *
                            uHover *
                            0.20;


                        uv +=
                            direction *
                            distortion;


                        /*
                           Subtle organic movement.
                        */

                        float wave =
                            sin(
                                distanceFromMouse * 18.0 -
                                uTime * 2.5
                            );


                        uv +=
                            direction *
                            wave *
                            strength *
                            uHover *
                            0.012;


                        /*
                           Clamp prevents sampling
                           outside the texture.
                        */

                        uv =
                            clamp(
                                uv,
                                0.001,
                                0.999
                            );


                        vec4 color =
                            texture2D(
                                uTexture,
                                uv
                            );


                        gl_FragColor =
                            color;

                    }

                `

            });


        /* =================================================
           GEOMETRY
        ================================================= */

        const geometry =
            new THREE.PlaneGeometry(
                2,
                2
            );


        const mesh =
            new THREE.Mesh(
                geometry,
                material
            );


        scene.add(
            mesh
        );


        /* =================================================
           MOUSE
        ================================================= */

        container.addEventListener(
            "mousemove",
            event => {

                const rect =
                    container.getBoundingClientRect();


                const x =
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width;


                const y =
                    1 -
                    (
                        event.clientY -
                        rect.top
                    ) /
                    rect.height;


                uniforms.uTargetMouse.value.set(
                    x,
                    y
                );

            }
        );


        container.addEventListener(
            "mouseenter",
            () => {

                uniforms.uTargetHover.value =
                    1;

            }
        );


        container.addEventListener(
            "mouseleave",
            () => {

                uniforms.uTargetHover.value =
                    0;

                uniforms.uTargetMouse.value.set(
                    0.5,
                    0.5
                );

            }
        );


        /* =================================================
           ANIMATION
        ================================================= */
/* =================================================
   ANIMATION
========================================================= */

function animate(time) {

    requestAnimationFrame(
        animate
    );


    uniforms.uTime.value =
        time * 0.001;


    uniforms.uMouse.value.lerp(
        uniforms.uTargetMouse.value,
        0.12
    );


    uniforms.uHover.value +=
        (
            uniforms.uTargetHover.value -
            uniforms.uHover.value
        ) * 0.08;


    renderer.render(
        scene,
        camera
    );

}


requestAnimationFrame(
    animate
);
   


        /* =================================================
           RESIZE
        ================================================= */

        const resizeObserver =
            new ResizeObserver(
                () => {

                    const width =
                        container.clientWidth;

                    const height =
                        container.clientHeight;


                    if (
                        !width ||
                        !height
                    ) {
                        return;
                    }


                    renderer.setSize(
                        width,
                        height,
                        false
                    );

                }
            );


        resizeObserver.observe(
            container
        );

    });

}
