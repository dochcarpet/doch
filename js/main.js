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

    const contactInput =
        document.getElementById(
            "customerContact"
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

    const contact =
        contactInput?.value.trim() ||
        "";

    const message =
        messageInput?.value.trim() ||
        "";

    const file =
        imageInput?.files?.[0] ||
        null;


    /* =================================================
       VALIDATION
    ================================================= */

    if (
        !name ||
        !contact
    ) {

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
           3. CONTACT DETECTION
        ================================================= */

        const order = {

            name:
                name,

            email:
                null,

            telegram:
                null,

            instagram:
                null,

            image_url:
                imageUrl,

            description:
                message,

            status:
                "new"

        };


        const normalizedContact =
            contact.toLowerCase();


        if (
            normalizedContact.includes("@") &&
            normalizedContact.includes(".")
        ) {

            order.email =
                contact;

        } else if (
            normalizedContact.includes(
                "telegram"
            ) ||
            normalizedContact.startsWith("@")
        ) {

            order.telegram =
                contact;

        } else if (
            normalizedContact.includes(
                "instagram"
            )
        ) {

            order.instagram =
                contact;

        } else {

            /*
               Unknown contact type.
               Keep it in telegram field
               for compatibility with the
               current orders schema.
            */

            order.telegram =
                contact;

        }


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
            currentLanguage === "ru"
                ? "Не удалось отправить запрос. Попробуйте ещё раз."
                : "Could not send your request. Please try again."
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
   CURSOR LENS
========================================================= */

function initCursorLens() {

    /*
       Disable on touch devices.
    */

    if (
        window.matchMedia("(hover: none)").matches ||
        window.innerWidth <= 800
    ) {
        return;
    }


    const products =
        document.querySelectorAll(
            ".product-image"
        );


    products.forEach(imageContainer => {

        const image =
            imageContainer.querySelector("img");


        if (!image) {
            return;
        }


        let targetX = 0;
        let targetY = 0;

        let currentX = 0;
        let currentY = 0;

        let hovering = false;


        /*
           Lens strength.

           Increase these if you want
           the effect more insane.
        */

        const MAX_SHIFT = 28;
        const MAX_SCALE = 1.18;


        /* -----------------------------------------
           MOUSE ENTER
        ----------------------------------------- */

        imageContainer.addEventListener(
            "mouseenter",
            () => {

                hovering = true;

            }
        );


        /* -----------------------------------------
           MOUSE MOVE
        ----------------------------------------- */

        imageContainer.addEventListener(
            "mousemove",
            event => {

                const rect =
                    imageContainer.getBoundingClientRect();


                /*
                   Cursor position inside image
                   from -1 to +1.
                */

                const x =
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width;


                const y =
                    (
                        event.clientY -
                        rect.top
                    ) /
                    rect.height;


                const normalizedX =
                    x * 2 - 1;


                const normalizedY =
                    y * 2 - 1;


                /*
                   Move the image slightly
                   opposite to cursor.

                   This creates the feeling
                   that the lens is inspecting
                   the surface.
                */

                targetX =
                    -normalizedX *
                    MAX_SHIFT;


                targetY =
                    -normalizedY *
                    MAX_SHIFT;


                /*
                   Strong zoom when cursor
                   approaches the center.
                */

                const distance =
                    Math.sqrt(
                        normalizedX *
                        normalizedX +
                        normalizedY *
                        normalizedY
                    );


                const lensStrength =
                    Math.max(
                        0,
                        1 - distance
                    );


                const scale =
                    1 +
                    (
                        (MAX_SCALE - 1) *
                        lensStrength
                    );


                image.style.setProperty(
                    "--lens-scale",
                    scale
                );

            }
        );


        /* -----------------------------------------
           MOUSE LEAVE
        ----------------------------------------- */

        imageContainer.addEventListener(
            "mouseleave",
            () => {

                hovering = false;

                targetX = 0;
                targetY = 0;

                image.style.setProperty(
                    "--lens-scale",
                    "1"
                );

            }
        );


        /* -----------------------------------------
           SMOOTH MOTION
        ----------------------------------------- */

        function animate() {

            currentX +=
                (
                    targetX -
                    currentX
                ) * .12;


            currentY +=
                (
                    targetY -
                    currentY
                ) * .12;


            const scale =
                image.style.getPropertyValue(
                    "--lens-scale"
                ) ||
                "1";


            if (hovering) {

                image.style.transform =
                    `
                    scale(${scale})
                    translate3d(
                        ${currentX}px,
                        ${currentY}px,
                        0
                    )
                    `;

            } else {

                currentX *= .82;
                currentY *= .82;


                image.style.transform =
                    `
                    scale(1)
                    translate3d(
                        ${currentX}px,
                        ${currentY}px,
                        0
                    )
                    `;

            }


            requestAnimationFrame(
                animate
            );

        }


        animate();

    });

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

    initCursorLens();

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

    if (
        typeof THREE === "undefined"
    ) {
        console.warn(
            "Three.js not loaded"
        );

        return;
    }


    const images =
        document.querySelectorAll(
            ".product-image img"
        );


    images.forEach(img => {

        const container =
            img.parentElement;


        if (!container) {
            return;
        }


        /*
           Prevent duplicate initialization.
        */

        if (
            container.dataset.threeReady
        ) {
            return;
        }

        container.dataset.threeReady =
            "true";


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
                window.devicePixelRatio,
                2
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

        const texture =
            new THREE.TextureLoader()
                .load(
                    img.currentSrc ||
                    img.src
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
           SHADER
        ================================================= */

        const uniforms = {

            uTexture: {
                value: texture
            },

            uMouse: {
                value:
                    new THREE.Vector2(
                        .5,
                        .5
                    )
            },

            uTargetMouse: {
                value:
                    new THREE.Vector2(
                        .5,
                        .5
                    )
            },

            uHover: {
                value: 0
            },

            uTime: {
                value: 0
            }

        };


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

                    uniform vec2 uTargetMouse;

                    uniform float uHover;

                    uniform float uTime;

                    varying vec2 vUv;


                    void main() {

                        vec2 uv = vUv;


                        /*
                           Mouse position.
                        */

                        vec2 mouse =
                            uTargetMouse;


                        /*
                           Distance from cursor.
                        */

                        float distanceFromMouse =
                            distance(
                                uv,
                                mouse
                            );


                        /*
                           Lens radius.

                           This is the important part.

                           We want a BIG,
                           soft distortion —
                           not a tiny circle.
                        */

                        float radius =
                            .48;


                        /*
                           Smooth falloff.
                        */

                        float strength =
                            1.0 -
                            smoothstep(
                                0.0,
                                radius,
                                distanceFromMouse
                            );


                        /*
                           Organic bulge.

                           Instead of simply
                           scaling the image,
                           we push UVs away
                           from the cursor.
                        */

                        vec2 direction =
                            uv - mouse;


                        /*
                           Fish-eye displacement.
                        */

                        float distortion =
                            strength *
                            uHover *
                            .20;


                        uv +=
                            direction *
                            distortion;


                        /*
                           Additional subtle
                           wave distortion.
                        */

                        float wave =
                            sin(
                                distanceFromMouse *
                                18.0 -
                                uTime *
                                2.5
                            );


                        uv +=
                            direction *
                            wave *
                            strength *
                            uHover *
                            .012;


                        /*
                           Slight zoom while hovering.
                        */

                        vec2 centered =
                            uv - .5;


                        uv =
                            .5 +
                            centered *
                            (
                                1.0 -
                                uHover *
                                .045
                            );


                        /*
                           Texture.
                        */

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
                2,
                32,
                32
            );


        const mesh =
            new THREE.Mesh(
                geometry,
                material
            );


        scene.add(mesh);


        /* =================================================
           MOUSE
        ================================================= */

        let mouseX = .5;
        let mouseY = .5;


        container.addEventListener(
            "mousemove",
            event => {

                const rect =
                    container.getBoundingClientRect();


                mouseX =
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width;


                mouseY =
                    1 -
                    (
                        event.clientY -
                        rect.top
                    ) /
                    rect.height;


                uniforms.uTargetMouse.value
                    .set(
                        mouseX,
                        mouseY
                    );

            }
        );


        container.addEventListener(
            "mouseenter",
            () => {

                uniforms.uHover.value =
                    1;

            }
        );


        container.addEventListener(
            "mouseleave",
            () => {

                uniforms.uHover.value =
                    0;

                uniforms.uTargetMouse.value
                    .set(
                        .5,
                        .5
                    );

            }
        );


        /* =================================================
           ANIMATION
        ================================================= */

        function animate(
            time
        ) {

            requestAnimationFrame(
                animate
            );


            uniforms.uTime.value =
                time * .001;


            /*
               Smooth cursor movement.
            */

            uniforms.uMouse.value.lerp(
                uniforms.uTargetMouse.value,
                .12
            );


            /*
               Make shader use the
               smoothed mouse position.
            */

            uniforms.uTargetMouse.value =
                uniforms.uMouse.value;


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
