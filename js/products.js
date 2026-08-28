import { fetchProducts } from "./supabase.js";
import {
    formatPrice,
    formatNumber,
    escapeHtml
} from "./utils.js";
import { translations } from "./translations.js";


/* =========================================================
   STATE
========================================================= */

let products = [];
let currentLanguage = "en";

let productModal = null;


/* =========================================================
   INIT
========================================================= */

export async function initProducts() {

    productModal =
        document.getElementById("productModal");


    try {

        products =
            await fetchProducts();

        console.log(
            "DOCH PRODUCTS:",
            products.length,
            products.map(product => ({
                id: product.id,
                title:
                    product.title_en ||
                    product.title_ru,
                status: product.status,
                cover:
                    product.cover_image,
                gallery:
                    product.gallery
            }))
        );


        renderProducts();


    } catch (error) {

        console.error(
            "Could not load products:",
            error
        );


        const container =
            document.querySelector(".products");


        if (container) {

            container.innerHTML = `
                <div style="
                    grid-column:1/-1;
                    padding:60px 0;
                    font:10px var(--mono);
                    color:var(--grey);
                ">
                    PRODUCTS COULD NOT BE LOADED.
                </div>
            `;

        }

    }

}


/* =========================================================
   LANGUAGE
========================================================= */

export function setProductsLanguage(
    language
) {

    currentLanguage =
        language;


    renderProducts();


    const activeId =
        productModal?.dataset.product;


    if (activeId) {

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(activeId)
            );


        if (product) {

            openProduct(product);

        }

    }

}


/* =========================================================
   GETTERS
========================================================= */

export function getProducts() {

    return products;

}


export function getProductTitle(
    product
) {

    if (
        currentLanguage === "ru" &&
        product.title_ru
    ) {

        return product.title_ru;

    }


    return (
        product.title_en ||
        product.title_ru ||
        "UNTITLED RUG"
    );

}


export function getProductDescription(
    product
) {

    if (
        currentLanguage === "ru" &&
        product.description_ru
    ) {

        return product.description_ru;

    }


    return (
        product.description_en ||
        product.description_ru ||
        translations[currentLanguage]["modal.text"]
    );

}


export function getStatusLabel(
    status
) {

    const key = {

        available:
            "status.available",

        made_to_order:
            "status.made",

        sold:
            "status.sold",

        handmade:
            "status.handmade"

    }[status];


    return (
        translations[currentLanguage][key] ||
        translations[currentLanguage]["status.handmade"]
    );

}


export function getProductImages(
    product
) {

    const images = [];


    /*
       Main cover image
    */

    if (product.cover_image) {

        images.push(
            product.cover_image
        );

    }


    /*
       Gallery
    */

    let gallery =
        product.gallery;


    /*
       Supabase may return JSON as string
    */

    if (
        typeof gallery === "string"
    ) {

        try {

            gallery =
                JSON.parse(gallery);

        } catch (error) {

            console.warn(
                "Could not parse gallery:",
                gallery
            );

            gallery = [];

        }

    }


    if (
        Array.isArray(gallery)
    ) {

        images.push(
            ...gallery
        );

    }


    /*
       Remove empty values and duplicates
    */

    return [
        ...new Set(
            images
                .filter(Boolean)
                .map(
                    image =>
                        String(image).trim()
                )
                .filter(Boolean)
        )
    ];

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const container =
        document.querySelector(
            ".products"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!products.length) {

        container.innerHTML = `
            <div style="
                grid-column:1/-1;
                padding:80px 0;
                font:10px var(--mono);
                color:var(--grey);
            ">
                NO RUGS YET.
            </div>
        `;

        return;

    }


    products.forEach(
        (product, index) => {

            const article =
                document.createElement(
                    "article"
                );


            article.className =
                "product" +
                (
                    index === 0
                        ? " product-large"
                        : ""
                );


            article.dataset.product =
                product.id;


            const title =
                getProductTitle(
                    product
                );


            const status =
                getStatusLabel(
                    product.status
                );


            const dimensions =
                product.width_cm &&
                product.height_cm

                    ? `${formatNumber(product.width_cm)} × ${formatNumber(product.height_cm)} CM`

                    : "";


            article.innerHTML = `

                <div class="product-image">

                    <img
                        src="${escapeHtml(
                            product.cover_image || ""
                        )}"
                        alt="${escapeHtml(title)}"
                        loading="${
                            index === 0
                                ? "eager"
                                : "lazy"
                        }"
                    >

                    <span class="image-note">
                        ${escapeHtml(status)}
                    </span>

                </div>


                <div class="product-info">

                    <div>

                        <span class="product-number">
                            ${String(index + 1).padStart(3, "0")}
                        </span>

                        <h3>
                            ${escapeHtml(title)}
                        </h3>

                    </div>


                    <div class="product-price">

                        <span>
                            ${dimensions}
                        </span>

                        <strong>
                            ${escapeHtml(
                                product.currency ||
                                "EUR"
                            )}

                            ${formatPrice(
                                product.price
                            )}
                        </strong>

                    </div>

                </div>

            `;


            article.addEventListener(
                "click",
                () => openProduct(product)
            );


            container.appendChild(
                article
            );

        }
    );


    initScrollReveal();

}


/* =========================================================
   PRODUCT MODAL
========================================================= */

export function openProduct(product) {

    if (!product) {
        return;
    }


    if (!productModal) {

        productModal =
            document.getElementById(
                "productModal"
            );

    }


    if (!productModal) {
        return;
    }


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const modalPrice =
        document.getElementById(
            "modalPrice"
        );


    const modalSize =
        document.getElementById(
            "modalSize"
        );


    const modalDescription =
        productModal.querySelector(
            ".modal-content p"
        );


    if (modalTitle) {

        modalTitle.textContent =
            getProductTitle(product);

    }


    if (modalPrice) {

        modalPrice.textContent =
            `${product.currency || "EUR"} ${formatPrice(product.price)}`;

    }


    if (modalSize) {

        modalSize.textContent =
            product.width_cm &&
            product.height_cm

                ? `${formatNumber(product.width_cm)} × ${formatNumber(product.height_cm)} CM`

                : "";

    }


    if (modalDescription) {

        modalDescription.textContent =
            getProductDescription(
                product
            );

    }


    /*
       Gallery
    */

    const galleryImages =
        getProductImages(product);


    const modalImage =
        document.getElementById(
            "modalImage"
        );


    if (modalImage) {

        modalImage.innerHTML = `

            <div class="modal-gallery">

                <button
                    class="gallery-arrow gallery-prev"
                    type="button"
                    aria-label="${
                        translations[currentLanguage]["modal.previous"]
                    }"
                >
                    ←
                </button>


                <img
                    id="galleryImage"
                    src="${escapeHtml(
                        galleryImages[0] || ""
                    )}"
                    alt="${escapeHtml(
                        getProductTitle(product)
                    )}"
                >


                <button
                    class="gallery-arrow gallery-next"
                    type="button"
                    aria-label="${
                        translations[currentLanguage]["modal.next"]
                    }"
                >
                    →
                </button>

            </div>


            <div class="gallery-dots">

                ${galleryImages.map(
                    (_, index) => `

                        <button
                            type="button"
                            class="gallery-dot ${
                                index === 0
                                    ? "active"
                                    : ""
                            }"
                            data-gallery-index="${index}"
                            aria-label="${
                                translations[currentLanguage]["modal.image"]
                            } ${index + 1}"
                        ></button>

                    `
                ).join("")}

            </div>

        `;


        initProductGallery(
            galleryImages
        );

    }


    /*
       Cart button
    */

    productModal.dataset.product =
        product.id;


    const addButton =
        document.getElementById(
            "addCart"
        );


    if (addButton) {

        const buttonText =
            addButton.querySelector(
                "span"
            );


        if (
            product.status === "sold"
        ) {

            addButton.disabled =
                true;

            addButton.style.opacity =
                ".35";

            addButton.style.pointerEvents =
                "none";


            if (buttonText) {

                buttonText.textContent =
                    translations[currentLanguage]["status.sold"];

            }

        } else {

            addButton.disabled =
                false;

            addButton.style.opacity =
                "";

            addButton.style.pointerEvents =
                "";


            if (buttonText) {

                buttonText.textContent =
                    translations[currentLanguage]["modal.add"];

            }

        }

    }


    productModal.classList.add(
        "active"
    );


    document.body.classList.add(
        "no-scroll"
    );

}


export function closeProductModal() {

    if (!productModal) {
        return;
    }


    productModal.classList.remove(
        "active"
    );


    delete productModal.dataset.product;


    document.body.classList.remove(
        "no-scroll"
    );

}


/* =========================================================
   GALLERY
========================================================= */

function initProductGallery(
    images
) {

    if (
        !images ||
        !images.length
    ) {
        return;
    }


    const image =
        document.getElementById(
            "galleryImage"
        );


    const prev =
        productModal.querySelector(
            ".gallery-prev"
        );


    const next =
        productModal.querySelector(
            ".gallery-next"
        );


    const dots =
        productModal.querySelectorAll(
            ".gallery-dot"
        );


    let currentIndex = 0;


    if (
        images.length <= 1
    ) {

        if (prev) {
            prev.style.display =
                "none";
        }

        if (next) {
            next.style.display =
                "none";
        }

        return;

    }


    function showImage(index) {

        currentIndex =
            (
                index +
                images.length
            ) % images.length;


        if (image) {

            image.src =
                images[currentIndex];

        }


        dots.forEach(
            (dot, i) => {

                dot.classList.toggle(
                    "active",
                    i === currentIndex
                );

            }
        );

    }


    if (prev) {

        prev.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                showImage(
                    currentIndex - 1
                );

            }
        );

    }


    if (next) {

        next.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                showImage(
                    currentIndex + 1
                );

            }
        );

    }


    dots.forEach(
        dot => {

            dot.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    showImage(
                        Number(
                            dot.dataset.galleryIndex
                        )
                    );

                }
            );

        }
    );


    /*
       Mobile swipe
    */

    if (image) {

        let touchStartX = 0;


        image.addEventListener(
            "touchstart",
            event => {

                touchStartX =
                    event.touches[0].clientX;

            },
            {
                passive: true
            }
        );


        image.addEventListener(
            "touchend",
            event => {

                const touchEndX =
                    event.changedTouches[0].clientX;


                const diff =
                    touchStartX -
                    touchEndX;


                if (
                    Math.abs(diff) < 40
                ) {
                    return;
                }


                if (diff > 0) {

                    showImage(
                        currentIndex + 1
                    );

                } else {

                    showImage(
                        currentIndex - 1
                    );

                }

            },
            {
                passive: true
            }
        );

    }

}


/* =========================================================
   KEYBOARD GALLERY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            !productModal ||
            !productModal.classList.contains(
                "active"
            )
        ) {
            return;
        }


        const galleryImage =
            document.getElementById(
                "galleryImage"
            );


        if (!galleryImage) {
            return;
        }


        const images =
            productModal.querySelectorAll(
                ".gallery-dot"
            );


        if (!images.length) {
            return;
        }


        /*
           Keyboard navigation is intentionally
           delegated to the visible gallery buttons.
        */

        if (
            event.key === "ArrowLeft"
        ) {

            const button =
                productModal.querySelector(
                    ".gallery-prev"
                );

            button?.click();

        }


        if (
            event.key === "ArrowRight"
        ) {

            const button =
                productModal.querySelector(
                    ".gallery-next"
                );

            button?.click();

        }

    }
);


/* =========================================================
   SCROLL REVEAL
========================================================= */

let observer;


function initScrollReveal() {

    if (observer) {

        observer.disconnect();

    }


    observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.style.opacity =
                                "1";

                            entry.target.style.transform =
                                "translateY(0)";

                        }

                    }
                );

            },
            {
                threshold: .08
            }
        );


    document
        .querySelectorAll(
            ".manifesto h2, .product, .process-card, .queue-item, .about-grid"
        )
        .forEach(
            element => {

                element.style.opacity =
                    "0";

                element.style.transform =
                    "translateY(35px)";

                element.style.transition =
                    "opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1)";


                observer.observe(
                    element
                );

            }
        );

}
