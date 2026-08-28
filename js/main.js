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

        "customModal.eyebrow": "CUSTOM RUG REQUEST",

"customModal.title":
    "MAKE YOUR<br><span>RUG.</span>",

"customModal.name":
    "NAME",

         "customModal.namePlaceholder":
             "Your name",
         
         "customModal.contact":
             "CONTACT",
         
         "customModal.contactPlaceholder":
             "Telegram / Instagram / Email",
         
         "customModal.message":
             "TELL US ABOUT YOUR RUG",
         
         "customModal.messagePlaceholder":
             "Size, idea, anything we should know...",
         
         "customModal.image":
             "MEME / IMAGE",
         
         "customModal.submit":
             "SEND REQUEST",
         
         "customModal.success":
             "REQUEST SENT.<br>WE'LL GET BACK TO YOU.",

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

        "customModal.eyebrow": "ЗАПРОС НА КОВЁР",

         "customModal.title":
             "СДЕЛАТЬ СВОЙ<br><span>КОВЁР.</span>",
         
         "customModal.name":
             "ИМЯ",
         
         "customModal.namePlaceholder":
             "Ваше имя",
         
         "customModal.contact":
             "КОНТАКТ",
         
         "customModal.contactPlaceholder":
             "Telegram / Instagram / Email",
         
         "customModal.message":
             "РАССКАЖИТЕ О КОВРЕ",
         
         "customModal.messagePlaceholder":
             "Размер, идея, всё, что нам стоит знать...",
         
         "customModal.image":
             "МЕМ / КАРТИНКА",
         
         "customModal.submit":
             "ОТПРАВИТЬ ЗАПРОС",
         
         "customModal.success":
             "ЗАПРОС ОТПРАВЛЕН.<br>МЫ С ВАМИ СВЯЖЕМСЯ.",

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
    .querySelectorAll("[data-i18n-placeholder]")
    .forEach(element => {

        const key =
            element.dataset.i18nPlaceholder;

        if (translations[language][key]) {

            element.placeholder =
                translations[language][key];

        }

    });


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


    /*
       Supabase Storage bucket
    */

    const CUSTOM_BUCKET =
        "custom-rugs";


    console.log("CUSTOM MODAL:", {
        button: customButton,
        modal: customModal,
        close: customModalClose,
        form: customForm
    });


    // =====================================================
    // OPEN
    // =====================================================

    if (customButton && customModal) {

        customButton.addEventListener(
            "click",
            () => {

                customModal.classList.add("active");

                document.body.classList.add(
                    "no-scroll"
                );

            }
        );

    }


    // =====================================================
    // CLOSE
    // =====================================================

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


    if (customModalClose) {

        customModalClose.addEventListener(
            "click",
            closeCustomModal
        );

    }


    // =====================================================
    // CLICK OUTSIDE
    // =====================================================

    if (customModal) {

        customModal.addEventListener(
            "click",
            event => {

                if (
                    event.target === customModal
                ) {

                    closeCustomModal();

                }

            }
        );

    }


    // =====================================================
    // ESC
    // =====================================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                customModal &&
                customModal.classList.contains("active")
            ) {

                closeCustomModal();

            }

        }
    );


    // =====================================================
    // CUSTOM RUG FORM
    // =====================================================

    if (!customForm) {
        return;
    }


    customForm.addEventListener(
        "submit",
        async event => {

            /*
               VERY IMPORTANT:
               Prevent normal HTML form submission.

               This is what stops:
               ?name=...
               ?contact=...
               ?message=...
               ?image=...
            */

            event.preventDefault();


            // -------------------------------------------------
            // GET FORM DATA
            // -------------------------------------------------

            const name =
                document
                    .getElementById("customerName")
                    .value
                    .trim();

            const contact =
                document
                    .getElementById("customerContact")
                    .value
                    .trim();

            const message =
                document
                    .getElementById("customerMessage")
                    .value
                    .trim();

            const imageInput =
                document.getElementById(
                    "customerImage"
                );

            const file =
                imageInput &&
                imageInput.files
                    ? imageInput.files[0]
                    : null;


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

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


            // -------------------------------------------------
            // LIMIT IMAGE SIZE
            // -------------------------------------------------

            const maxFileSize =
                10 * 1024 * 1024; // 10 MB


            if (
                file.size > maxFileSize
            ) {

                alert(
                    currentLanguage === "ru"
                        ? "Изображение должно быть меньше 10 MB."
                        : "Image must be smaller than 10 MB."
                );

                return;

            }


            // -------------------------------------------------
            // BUTTON STATE
            // -------------------------------------------------

            const originalButtonHTML =
                customSubmit
                    ? customSubmit.innerHTML
                    : "";


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

                // =================================================
                // 1. UPLOAD IMAGE TO SUPABASE STORAGE
                // =================================================

                const fileExtension =
                    file.name
                        .split(".")
                        .pop()
                        .toLowerCase();


                const safeExtension =
                    /^[a-z0-9]+$/.test(
                        fileExtension
                    )
                        ? fileExtension
                        : "jpg";


                const fileName =
                    `${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;


                const filePath =
                    `custom/${fileName}`;


                console.log(
                    "Uploading custom rug image:",
                    filePath
                );


                const uploadResponse =
                    await fetch(
                        `${SUPABASE_URL}/storage/v1/object/${CUSTOM_BUCKET}/${filePath}`,
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

                            body: file
                        }
                    );


                if (!uploadResponse.ok) {

                    const errorText =
                        await uploadResponse.text();

                    throw new Error(
                        `Storage upload failed: ${uploadResponse.status} ${errorText}`
                    );

                }


                console.log(
                    "Image uploaded successfully."
                );


                // =================================================
                // 2. GET PUBLIC IMAGE URL
                // =================================================

                const imageUrl =
                    `${SUPABASE_URL}/storage/v1/object/public/${CUSTOM_BUCKET}/${filePath}`;


                console.log(
                    "Image URL:",
                    imageUrl
                );


                // =================================================
                // 3. CREATE ORDER IN SUPABASE
                // =================================================

                const order =
                    {

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


                /*
                   Put contact into the correct field.

                   We support:
                   Telegram
                   Instagram
                   Email
                */

                const normalizedContact =
                    contact.toLowerCase();


                if (
                    normalizedContact.includes("@") &&
                    normalizedContact.includes(".")
                ) {

                    order.email =
                        contact;

                } else if (
                    normalizedContact.includes("telegram") ||
                    normalizedContact.startsWith("@")
                ) {

                    order.telegram =
                        contact;

                } else if (
                    normalizedContact.includes("instagram")
                ) {

                    order.instagram =
                        contact;

                } else {

                    /*
                       If we cannot determine the platform,
                       store it in telegram for now.
                    */

                    order.telegram =
                        contact;

                }


                console.log(
                    "Creating order:",
                    order
                );


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


                if (!orderResponse.ok) {

                    const errorText =
                        await orderResponse.text();

                    throw new Error(
                        `Order creation failed: ${orderResponse.status} ${errorText}`
                    );

                }


                const createdOrder =
                    await orderResponse.json();


                console.log(
                    "CUSTOM RUG ORDER CREATED:",
                    createdOrder
                );


                // =================================================
                // 4. SUCCESS
                // =================================================

                customForm.style.display =
                    "none";


                customSuccess.innerHTML =
                    translations[
                        currentLanguage
                    ]["customModal.success"];


                customSuccess.style.display =
                    "block";


                // -------------------------------------------------
                // Reset form after successful submission
                // -------------------------------------------------

                customForm.reset();


            } catch (error) {

                console.error(
                    "CUSTOM RUG REQUEST ERROR:",
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
    );

});
