/* =========================================================
   DOCH — MAIN
========================================================= */

import {
    initProducts,
    setProductsLanguage,
    getProducts
} from "./products.js";

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

    currentLanguage = language;

    document.documentElement.lang =
        language;


    /*
       Regular translated elements
    */

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


    /*
       Placeholders
    */

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


    /*
       Language buttons
    */

    document
        .querySelectorAll(".lang-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.lang === language
            );

        });


    /*
       Tell products module to rerender
       itself in the new language.
    */

    setProductsLanguage(language);


    /*
       Tell cart.js about language.

       cart.js is currently a classic script,
       so we expose the current language
       through window.
    */

    window.currentLanguage =
        language;

    window.translations =
        translations;


    /*
       If cart.js exposes updateCart,
       refresh it after language change.
    */

    if (
        typeof window.updateCart ===
        "function"
    ) {

        window.updateCart();

    }

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


function closeProductModal() {

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "active"
    );

    delete modal.dataset.product;

    document.body.classList.remove(
        "no-scroll"
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
               cart.js currently lives as a
               classic script.

               Its functions are therefore
               available through window.
            */

            if (
                typeof window.addToCart ===
                "function"
            ) {

                window.addToCart(
                    product
                );

            }


            closeProductModal();


            if (
                typeof window.openCart ===
                "function"
            ) {

                window.openCart();

            }

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
            event.key !==
            "Escape"
        ) {
            return;
        }


        /*
           Product modal
        */

        if (
            modal?.classList.contains(
                "active"
            )
        ) {

            closeProductModal();

        }


        /*
           Custom modal
        */

        if (
            customModal?.classList.contains(
                "active"
            )
        ) {

            closeCustomModal();

        }


        /*
           Cart
        */

        if (
            typeof window.closeCart ===
            "function"
        ) {

            window.closeCart();

        }

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
        .forEach(element => {

            element.style.opacity =
                "0";

            element.style.transform =
                "translateY(35px)";

            element.style.transition =
                "opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1)";


            scrollObserver.observe(
                element
            );

        });

}


/* =========================================================
   FAQ
========================================================= */

function initFAQ() {

    const faqItems =
        document.querySelectorAll(
            ".faq-item"
        );


    faqItems.forEach(item => {

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

    });

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


    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!name || !contact) {

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


    /* -----------------------------------------
       BUTTON STATE
    ----------------------------------------- */

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
   INITIALIZATION
========================================================= */

async function init() {

    /*
       Make translation data available
       to the existing classic cart.js.
    */

    window.translations =
        translations;

    window.currentLanguage =
        currentLanguage;


    /*
       Initial language.
    */

    setLanguage(
        currentLanguage
    );


    /*
       Products are owned by products.js.
    */

    await initProducts();


    /*
       UI behaviour.
    */

    initFAQ();

    initScrollReveal();


    console.log(
        "DOCH MAIN INITIALIZED"
    );

}


/* =========================================================
   START
========================================================= */

init();
