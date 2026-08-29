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
    initCustom,
    setCustomLanguage
} from "./custom.js";


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

    setCustomLanguage(
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

    initCustom();

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
