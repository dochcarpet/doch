/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://kixsnkhmxyytecvvwnse.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_NeFuQSbmP2VLBEdDLnIi5Q_5iUyMHNF";


/* =========================================================
   STATE
========================================================= */

let products = [];
let cart = [];
let currentLanguage = "en";


/* =========================================================
   DOM
========================================================= */

const productsContainer =
    document.querySelector(".products");

const modal =
    document.getElementById("productModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalPrice =
    document.getElementById("modalPrice");

const modalSize =
    document.getElementById("modalSize");

const modalImage =
    document.getElementById("modalImage");

const modalDescription =
    modal.querySelector(".modal-content p");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const cartCount =
    document.getElementById("cartCount");


/* =========================================================
   TRANSLATIONS
========================================================= */

const translations = {

    en: {

        "nav.drop": "DROP",
        "nav.custom": "CUSTOM",
        "nav.process": "PROCESS",

        "cart.label": "CART",
        "cart.your": "YOUR CART",
        "cart.empty": "Nothing here yet.",
        "cart.total": "TOTAL",
        "cart.checkout": "CHECKOUT",

        "hero.top": "HANDMADE / INTERNET ART",
        "hero.title1": "MEMES.",
        "hero.title2": "MADE TO",
        "hero.title3": "TOUCH.",
        "hero.description":
            "Internet culture, memes & digital chaos — translated into handmade rugs.",

        "manifesto.eyebrow": "01 / THE IDEA",
        "manifesto.title":
            "THE INTERNET<br>WAS NEVER<br><em>THIS SOFT.</em>",
        "manifesto.mono":
            "HANDMADE. WEIRD. UNNECESSARY.<br>EXACTLY AS IT SHOULD BE.",

        "drop.eyebrow": "02 / CURRENT DROP",
        "drop.title":
            "INTERNET<br><em>RELICS</em>",
        "drop.objects": "OBJECTS",

        "product.one": "ONE OF ONE",
        "product.made": "MADE TO ORDER",
        "product.sold": "SOLD OUT",
        "product.handmade": "HANDMADE",

        "custom.eyebrow": "CUSTOM RUGS",
        "custom.title":
            "GOT A<br><span>MEME?</span>",
        "custom.text":
            "Send us the image. We'll put it on the floor.",
        "custom.button":
            "MAKE MY RUG",

        "custom.side1": "YOUR IMAGE",
        "custom.side2": "YARN",
        "custom.side3": "YOUR RUG",

        "process.eyebrow": "03 / THE PROCESS",
        "process.title":
            "MADE BY<br><em>HAND.</em>",
        "process.subtitle":
            "Not printed.<br>Not AI generated.<br>Not mass produced.",

        "process.design.title": "DESIGN",
        "process.design.text":
            "Meme → image → rug design. Every piece starts with an idea.",

        "process.taft.title": "TAFT",
        "process.taft.text":
            "Hundreds of thousands of yarn loops, placed by hand.",

        "process.carve.title": "CARVE",
        "process.carve.text":
            "Every surface is sculpted until the image comes alive.",

        "process.ship.title": "SHIP",
        "process.ship.text":
            "Your rug leaves the studio and enters the wild.",

        "queue.eyebrow": "06 / PRODUCTION QUEUE",
        "queue.title":
            "CURRENTLY<br><em>IN PRODUCTION</em>",
        "queue.live": "LIVE",
        "queue.note":
            "Every rug is made after the order is placed.",

        "about.eyebrow": "07 / THE ARTIST",
        "about.title":
            "TOO MANY<br>MEMES.<br><em>NOT ENOUGH<br>RUGS.</em>",
        "about.large":
            "DOCH is a handmade rug studio turning internet culture into physical objects.",
        "about.text":
            "Every rug is made by hand, one piece at a time. Some are funny. Some are stupid. Some are genuinely beautiful. We like all three.",
        "about.link":
            "MEET THE ARTIST ↗",

        "footer.tag":
            "HANDMADE INTERNET ART",

        "modal.eyebrow":
            "INTERNET RELIC",
        "modal.text":
            "Handmade to order. Production begins after payment.",
        "modal.add":
            "ADD TO CART",

        "status.available": "AVAILABLE",
        "status.made": "MADE TO ORDER",
        "status.sold": "SOLD OUT",
        "status.handmade": "HANDMADE",

                /* =========================
           FAQ
        ========================= */

        "faq.eyebrow": "05 / FAQ",
        "faq.title":
            "QUESTIONS<br><em>YOU MIGHT HAVE.</em>",

        "faq.q1":
            "IS THIS A REAL RUG?",
        "faq.a1":
            "Unfortunately, yes. Every rug is actually made by hand. We use real yarn, real tools and an unreasonable amount of time.",

        "faq.q2":
            "CAN I ORDER MY OWN MEME?",
        "faq.a2":
            "Yes. Send us the image and we’ll turn it into a rug. The worse the meme, the better the rug.",

        "faq.q3":
            "HOW LONG DOES IT TAKE?",
        "faq.a3":
            "Each rug is handmade, so production time depends on the size and complexity of the design. We’ll tell you the estimated time before production starts.",

        "faq.q4":
            "DO YOU SHIP?",
        "faq.a4":
            "Yes. Your internet relic can leave the studio and travel to you.",

        "faq.q5":
            "WHY?",
        "faq.a5":
            "We don't know. We just felt the internet deserved to be slightly softer.",

    },


    ru: {

        "nav.drop": "КОВРЫ",
        "nav.custom": "НА ЗАКАЗ",
        "nav.process": "ПРОЦЕСС",

        "cart.label": "КОРЗИНА",
        "cart.your": "ВАША КОРЗИНА",
        "cart.empty": "Здесь пока ничего нет.",
        "cart.total": "ИТОГО",
        "cart.checkout": "ОФОРМИТЬ",

        "hero.top": "РУЧНАЯ РАБОТА / ИНТЕРНЕТ-АРТ",
        "hero.title1": "МЕМЫ.",
        "hero.title2": "КОТОРЫЕ",
        "hero.title3": "ХОЧЕТСЯ ТРОГАТЬ.",
        "hero.description":
            "Интернет-культура, мемы и цифровой хаос — превращённые в ковры ручной работы.",

        "manifesto.eyebrow": "01 / ИДЕЯ",
        "manifesto.title":
            "ИНТЕРНЕТ<br>ЕЩЁ НИКОГДА<br><em>НЕ БЫЛ ТАКИМ МЯГКИМ.</em>",
        "manifesto.mono":
            "РУЧНАЯ РАБОТА. СТРАННО. БЕСПОЛЕЗНО.<br>ИМЕННО ТАК, КАК И ДОЛЖНО БЫТЬ.",

        "drop.eyebrow": "02 / ТЕКУЩИЙ ДРОП",
        "drop.title":
            "ИНТЕРНЕТ<br><em>РЕЛИКВИИ</em>",
        "drop.objects": "ОБЪЕКТА",

        "product.one": "ЕДИНСТВЕННЫЙ",
        "product.made": "ПОД ЗАКАЗ",
        "product.sold": "ПРОДАН",
        "product.handmade": "РУЧНАЯ РАБОТА",

        "custom.eyebrow": "КОВЁР НА ЗАКАЗ",
        "custom.title":
            "ЕСТЬ<br><span>МЕМ?</span>",
        "custom.text":
            "Присылай картинку. Мы превратим её в ковёр.",
        "custom.button":
            "СДЕЛАТЬ МОЙ КОВЁР",

        "custom.side1": "ТВОЯ КАРТИНКА",
        "custom.side2": "НАША РАБОТА",
        "custom.side3": "ТВОЙ КОВЁР",

        "process.eyebrow": "03 / ПРОЦЕСС",
        "process.title":
            "СДЕЛАНО<br><em>ВРУЧНУЮ.</em>",
        "process.subtitle":
            "Не напечатано.<br>Не сгенерировано ИИ. <br>Не массовое производство.",

        "process.design.title": "ДИЗАЙН",
        "process.design.text":
            "Мем → изображение → дизайн ковра. Всё начинается с идеи.",

        "process.taft.title": "ТАФТИНГ",
        "process.taft.text":
            "Сотни тысяч петель пряжи, выбитых вручную.",

        "process.carve.title": "КАРВИНГ",
        "process.carve.text":
            "Каждая поверхность вырезается вручную, пока изображение не оживёт.",

        "process.ship.title": "ОТПРАВКА",
        "process.ship.text":
            "Ковёр покидает студию и отправляется в мир.",

        "queue.eyebrow": "06 / ОЧЕРЕДЬ ПРОИЗВОДСТВА",
        "queue.title":
            "СЕЙЧАС<br><em>В ПРОИЗВОДСТВЕ</em>",
        "queue.live": "LIVE",
        "queue.note":
            "Каждый ковёр начинает производиться после оформления заказа.",

        "about.eyebrow": "07 / O DOCH",
        "about.title":
            "СЛИШКОМ МНОГО<br>МЕМОВ.<br><em>СЛИШКОМ МАЛО<br>КОВРОВ.</em>",
        "about.large":
            "DOCH — студия ковров ручной работы, которая превращает интернет-культуру в физические объекты.",
        "about.text":
            "Каждый ковёр делается вручную, по одному. Некоторые смешные. Некоторые тупые. Некоторые реально красивые. Нам нравятся все три варианта.",
        "about.link":
            "ПОЗНАКОМИТЬСЯ С ХУДОЖНИЦЕЙ ↗",

        "footer.tag":
            "РУЧНОЙ ИНТЕРНЕТ-АРТ",

        "modal.eyebrow":
            "ИНТЕРНЕТ-РЕЛИКВИЯ",
        "modal.text":
            "Изготавливается вручную под заказ. Производство начинается после оплаты.",
        "modal.add":
            "В КОРЗИНУ",

        "status.available": "В НАЛИЧИИ",
        "status.made": "ПОД ЗАКАЗ",
        "status.sold": "ПРОДАН",
        "status.handmade": "РУЧНАЯ РАБОТА",

                /* =========================
           FAQ
        ========================= */

        "faq.eyebrow": "05 / FAQ",
        "faq.title":
            "ВОПРОСЫ,<br><em>КОТОРЫЕ МОГУТ<br>У ВАС ВОЗНИКНУТЬ.</em>",

        "faq.q1":
            "ЭТО ВООБЩЕ НАСТОЯЩИЙ КОВЁР?",
        "faq.a1":
            "К сожалению, да. Каждый ковёр действительно делается вручную. Настоящая пряжа, настоящие инструменты и совершенно неразумное количество времени.",

        "faq.q2":
            "МОЖНО ЗАКАЗАТЬ СВОЙ МЕМ?",
        "faq.a2":
            "Да. Присылайте картинку — мы превратим её в ковёр. Чем хуже мем, тем лучше ковёр.",

        "faq.q3":
            "СКОЛЬКО ЭТО ДЕЛАЕТСЯ?",
        "faq.a3":
            "Каждый ковёр делается вручную, поэтому срок зависит от размера и сложности дизайна. Точные сроки мы сообщим до начала производства.",

        "faq.q4":
            "ВЫ ОТПРАВЛЯЕТЕ КОВРЫ?",
        "faq.a4":
            "Да. Ваша интернет-реликвия может покинуть студию и отправиться к вам.",

        "faq.q5":
            "ЗАЧЕМ?",
        "faq.a5":
            "Не знаем. Просто решили, что интернету иногда не помешает стать немного мягче.",

    }

};


/* =========================================================
   SUPABASE API
========================================================= */

async function loadProducts() {

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/products?select=*&status=neq.hidden&order=sort_order.asc,created_at.desc`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                `Supabase error: ${response.status}`
            );

        }

        products = await response.json();

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

        productsContainer.innerHTML = `
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


/* =========================================================
   PRODUCT STATUS
========================================================= */

function getStatusLabel(status) {

    const key = {

        available: "status.available",
        made_to_order: "status.made",
        sold: "status.sold",
        handmade: "status.handmade"

    }[status];

    return (
        translations[currentLanguage][key] ||
        translations[currentLanguage]["status.handmade"]
    );

}


/* =========================================================
   PRODUCT TITLE
========================================================= */

function getProductTitle(product) {

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


/* =========================================================
   PRODUCT DESCRIPTION
========================================================= */

function getProductDescription(product) {

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

/* =========================================================
   PRODUCT IMAGES
========================================================= */

function getProductImages(product) {

    const images = [];

    /*
       Main cover image.
    */

    if (product.cover_image) {

        images.push(
            product.cover_image
        );

    }


    /*
       Additional gallery images.
    */

    let gallery =
        product.gallery;


    /*
       Supabase may return JSON as a string.
    */

    if (typeof gallery === "string") {

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


    if (Array.isArray(gallery)) {

        images.push(
            ...gallery
        );

    }


    /*
       Remove empty values and duplicates.
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

    if (!productsContainer) {
        return;
    }

    productsContainer.innerHTML = "";

    if (!products.length) {

        productsContainer.innerHTML = `
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
                document.createElement("article");

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
                getProductTitle(product);

            const status =
                getStatusLabel(product.status);

            const dimensions =
                product.width_cm &&
                product.height_cm

                    ? `${formatNumber(product.width_cm)} × ${formatNumber(product.height_cm)} CM`

                    : "";

            article.innerHTML = `

                <div class="product-image">

                    <img
                        src="${escapeHtml(product.cover_image || "")}"
                        alt="${escapeHtml(title)}"
                        loading="${index === 0 ? "eager" : "lazy"}"
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
                            ${escapeHtml(product.currency || "EUR")}
                            ${formatPrice(product.price)}
                        </strong>

                    </div>

                </div>

            `;

            article.addEventListener(
                "click",
                () => openProduct(product)
            );

            productsContainer.appendChild(
                article
            );

        }
    );

    initScrollReveal();

}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function openProduct(product) {

    if (!product) {
        return;
    }

    modalTitle.textContent =
        getProductTitle(product);

    modalPrice.textContent =
        `${product.currency || "EUR"} ${formatPrice(product.price)}`;

    modalSize.textContent =
        product.width_cm &&
        product.height_cm

            ? `${formatNumber(product.width_cm)} × ${formatNumber(product.height_cm)} CM`

            : "";

    modalDescription.textContent =
        getProductDescription(product);


    /*
       Build gallery.
    */

    const galleryImages =
        getProductImages(product);


    modalImage.innerHTML = `

        <div class="modal-gallery">

            <button
                class="gallery-arrow gallery-prev"
                type="button"
                aria-label="Previous image"
            >
                ←
            </button>

            <img
                id="galleryImage"
                src="${escapeHtml(galleryImages[0] || "")}"
                alt="${escapeHtml(getProductTitle(product))}"
            >

            <button
                class="gallery-arrow gallery-next"
                type="button"
                aria-label="Next image"
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
                        aria-label="Image ${index + 1}"
                    ></button>

                `
            ).join("")}

        </div>

    `;


    /*
       Product status / cart button.
    */

    modal.dataset.product =
        product.id;

    const addButton =
        document.getElementById("addCart");

    const buttonText =
        addButton.querySelector("span");


    if (
        product.status === "sold"
    ) {

        addButton.disabled =
            true;

        addButton.style.opacity =
            ".35";

        addButton.style.pointerEvents =
            "none";

        buttonText.textContent =
            "×";

    } else {

        addButton.disabled =
            false;

        addButton.style.opacity =
            "";

        addButton.style.pointerEvents =
            "";

        buttonText.textContent =
            translations[currentLanguage]["modal.add"];

    }


    modal.classList.add(
        "active"
    );

    document.body.classList.add(
        "no-scroll"
    );


    /*
       Activate gallery.
    */

    initProductGallery(
        galleryImages
    );

}


/* =========================================================
   PRODUCT GALLERY
========================================================= */

function initProductGallery(images) {

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
        modal.querySelector(
            ".gallery-prev"
        );

    const next =
        modal.querySelector(
            ".gallery-next"
        );

    const dots =
        modal.querySelectorAll(
            ".gallery-dot"
        );


    let currentIndex = 0;


    /*
       If there is only one image,
       hide navigation.
    */

    if (images.length <= 1) {

        if (prev) {
            prev.style.display = "none";
        }

        if (next) {
            next.style.display = "none";
        }

        return;

    }


    function showImage(index) {

        currentIndex =
            (
                index +
                images.length
            ) % images.length;

        image.src =
            images[currentIndex];


        dots.forEach(
            (dot, i) => {

                dot.classList.toggle(
                    "active",
                    i === currentIndex
                );

            }
        );

    }


    /*
       Previous.
    */

    prev.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            showImage(
                currentIndex - 1
            );

        }
    );


    /*
       Next.
    */

    next.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            showImage(
                currentIndex + 1
            );

        }
    );


    /*
       Dots.
    */

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
       Keyboard arrows.
    */

    function keyboardHandler(event) {

        if (
            !modal.classList.contains("active")
        ) {
            return;
        }

        if (
            event.key === "ArrowLeft"
        ) {

            showImage(
                currentIndex - 1
            );

        }

        if (
            event.key === "ArrowRight"
        ) {

            showImage(
                currentIndex + 1
            );

        }

    }


    /*
       Avoid adding duplicate global
       keyboard listeners.
    */

    document.removeEventListener(
        "keydown",
        window.__dochGalleryKeyboard
    );

    window.__dochGalleryKeyboard =
        keyboardHandler;

    document.addEventListener(
        "keydown",
        window.__dochGalleryKeyboard
    );


    /*
       Mobile swipe.
    */

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


/* =========================================================
   CLOSE MODAL
========================================================= */

document
    .getElementById("modalClose")
    .addEventListener(
        "click",
        closeModal
    );


function closeModal() {

    modal.classList.remove(
        "active"
    );

    delete modal.dataset.product;

    document.body.classList.remove(
        "no-scroll"
    );

}


/* =========================================================
   ADD TO CART
========================================================= */

document
    .getElementById("addCart")
    .addEventListener(
        "click",
        () => {

            const id =
                modal.dataset.product;

            const product =
                products.find(
                    item =>
                        item.id === id
                );

            if (!product) {
                return;
            }

            if (
                product.status === "sold"
            ) {
                return;
            }

            cart.push(product);

            updateCart();

            closeModal();

            openCart();

        }
    );


/* =========================================================
   CART
========================================================= */

document
    .getElementById("cartButton")
    .addEventListener(
        "click",
        openCart
    );


document
    .getElementById("cartClose")
    .addEventListener(
        "click",
        closeCart
    );


cartOverlay.addEventListener(
    "click",
    closeCart
);


function openCart() {

    cartDrawer.classList.add(
        "active"
    );

    cartOverlay.classList.add(
        "active"
    );

    document.body.classList.add(
        "no-scroll"
    );

}


function closeCart() {

    cartDrawer.classList.remove(
        "active"
    );

    cartOverlay.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "no-scroll"
    );

}


/* =========================================================
   CART UPDATE
========================================================= */

function updateCart() {

    cartCount.textContent =
        cart.length;


    if (!cart.length) {

        cartItems.innerHTML = `

            <p class="empty-cart">
                ${translations[currentLanguage]["cart.empty"]}
            </p>

        `;

        cartTotal.textContent =
            "€0";

        return;

    }


    cartItems.innerHTML = "";

    let total = 0;


    cart.forEach(
        (product, index) => {

            total +=
                Number(
                    product.price
                );


            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "cart-item";


            element.innerHTML = `

                <div>

                    <div class="cart-item-name">

                        ${escapeHtml(
                            getProductTitle(product)
                        )}

                    </div>

                    <button
                        class="remove-item"
                        data-index="${index}"
                        style="
                            border:0;
                            background:none;
                            padding:8px 0;
                            cursor:pointer;
                            font:9px var(--mono);
                            color:#777;
                        "
                    >
                        ${
                            currentLanguage === "ru"
                                ? "УДАЛИТЬ"
                                : "REMOVE"
                        }
                    </button>

                </div>

                <div class="cart-item-price">

                    ${escapeHtml(
                        product.currency ||
                        "EUR"
                    )}

                    ${formatPrice(
                        product.price
                    )}

                </div>

            `;


            cartItems.appendChild(
                element
            );

        }
    );


    cartTotal.textContent =
        `€${formatPrice(total)}`;


    document
        .querySelectorAll(
            ".remove-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );

                        cart.splice(
                            index,
                            1
                        );

                        updateCart();                                                         

                    }
                );

            }
        );

}


/* =========================================================
   LANGUAGE
========================================================= */

function setLanguage(language) {

    if (
        !translations[language]
    ) {
        return;
    }


    currentLanguage =
        language;


    document.documentElement.lang =
        language;


    document
        .querySelectorAll(
            "[data-i18n]"
        )
        .forEach(
            element => {

                const key =
                    element.dataset.i18n;


                if (
                    translations[language][key]
                ) {

                    element.innerHTML =
                        translations[language][key];

                }

            }
        );


    document
        .querySelectorAll(
            ".lang-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.lang ===
                    language
                );

            }
        );


    if (products.length) {
    renderProducts();
   }


    const activeId =
        modal.dataset.product;


    if (activeId) {

        const product =
            products.find(
                item =>
                    item.id === activeId
            );

        if (product) {

            openProduct(
                product
            );

        }

    }


    updateCart();

}


/* =========================================================
   LANGUAGE BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".lang-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setLanguage(
                        button.dataset.lang
                    );

                }
            );

        }
    );


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

            closeCart();

        }

    }
);


/* =========================================================
   HERO GLITCH
========================================================= */

const heroTitle =
    document.querySelector(
        ".hero-title"
    );


setInterval(
    () => {

        if (
            Math.random() > .65
        ) {

            heroTitle.style.transform =
                `translate(
                    ${Math.random() * 4 - 2}px,
                    ${Math.random() * 3 - 1.5}px
                )`;


            setTimeout(
                () => {

                    heroTitle.style.transform =
                        "";

                },
                80
            );

        }

    },
    1600
);


/* =========================================================
   SCROLL REVEALS
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


/* =========================================================
   HELPERS
========================================================= */

function formatPrice(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 0
        }
    );

}


function formatNumber(value) {

    const number =
        Number(value);


    if (
        Number.isInteger(number)
    ) {

        return number;

    }


    return number
        .toFixed(1)
        .replace(".0", "");

}


function escapeHtml(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character])
    );

}

/* =========================================================
   FAQ
========================================================= */

function initFAQ() {

    const faqItems =
        document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {

        const summary =
            item.querySelector("summary");

        const answer =
            item.querySelector(".faq-answer");

        if (!summary || !answer) {
            return;
        }

        summary.addEventListener("click", event => {

            event.preventDefault();

            const isOpen =
                item.hasAttribute("open");

            /*
               Close all other FAQ items.
            */

            faqItems.forEach(otherItem => {

                if (otherItem !== item) {

                    otherItem.removeAttribute("open");

                    otherItem.classList.remove("active");

                }

            });


            /*
               Toggle current item.
            */

            if (isOpen) {

                item.removeAttribute("open");
                item.classList.remove("active");

            } else {

                item.setAttribute("open", "");
                item.classList.add("active");

            }

        });

    });

}


/* =========================================================
   INITIALIZATION
========================================================= */

setLanguage("en");

loadProducts();

initFAQ();

// =========================================================
// CUSTOM RUG REQUEST MODAL
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    const customButton = document.getElementById("customButton");
    const customModal = document.getElementById("customModal");
    const customModalClose = document.getElementById("customModalClose");

    console.log("CUSTOM MODAL:", {
        button: customButton,
        modal: customModal,
        close: customModalClose
    });


    // OPEN

    if (customButton && customModal) {

        customButton.addEventListener("click", () => {

            console.log("MAKE MY RUG clicked");

            customModal.classList.add("active");
            document.body.classList.add("no-scroll");

        });

    }


    // CLOSE

    if (customModalClose && customModal) {

        customModalClose.addEventListener("click", () => {

            customModal.classList.remove("active");
            document.body.classList.remove("no-scroll");

        });

    }


    // CLOSE BY CLICKING OUTSIDE

    if (customModal) {

        customModal.addEventListener("click", (event) => {

            if (event.target === customModal) {

                customModal.classList.remove("active");
                document.body.classList.remove("no-scroll");

            }

        });

    }


    // CLOSE WITH ESC

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            customModal &&
            customModal.classList.contains("active")
        ) {

            customModal.classList.remove("active");
            document.body.classList.remove("no-scroll");

        }

    });

});


