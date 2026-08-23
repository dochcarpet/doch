/* =========================================================
   PRODUCTS
========================================================= */

const products = {

    witness: {
        title: "Свидетель из Фрязино",
        titleEn: "Witness from Fryazino",
        price: 690,
        size: "180 CM",
        image: "rug-one"
    },

    cool: {
        title: "Охлади траханье",
        titleEn: "Kandibober",
        price: 290,
        size: "90 CM",
        image: "rug-two"
    },

    npc: {
        title: "NPC ENERGY",
        titleEn: "NPC ENERGY",
        price: 240,
        size: "80 CM",
        image: "rug-three"
    },

    cat: {
        title: "CRYING CAT",
        titleEn: "CRYING CAT",
        price: 210,
        size: "70 CM",
        image: "rug-four"
    }

};


let cart = [];


/* =========================================================
   DOM
========================================================= */

const modal = document.getElementById("productModal");

const modalTitle =
    document.getElementById("modalTitle");

const modalPrice =
    document.getElementById("modalPrice");

const modalSize =
    document.getElementById("modalSize");

const modalImage =
    document.getElementById("modalImage");

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
        "manifesto.text":
            "We take the things you weren't supposed to put on the wall — and put them on the floor.",
        "manifesto.mono":
            "HANDMADE. WEIRD. UNNECESSARY.<br>EXACTLY AS IT SHOULD BE.",

        "drop.eyebrow": "02 / CURRENT DROP",
        "drop.title":
            "INTERNET<br><em>RELICS</em>",
        "drop.objects": "04 OBJECTS",

        "product.one": "ONE OF ONE",
        "product.made": "MADE TO ORDER",
        "product.sold": "SOLD OUT",
        "product.handmade": "HANDMADE",

        "product.witness": "Witness from Fryazino",
        "product.kandibober": "Kandibober",

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

        "process.eyebrow": "04 / THE PROCESS",
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

        "queue.eyebrow": "05 / PRODUCTION QUEUE",
        "queue.title":
            "CURRENTLY<br><em>IN PRODUCTION</em>",
        "queue.live": "LIVE / 04",
        "queue.note":
            "Every rug is made after the order is placed.",

        "about.eyebrow": "06 / THE ARTIST",
        "about.title":
            "TOO MANY<br>MEMES.<br><em>NOT ENOUGH<br>RUGS.</em>",
        "about.large":
            "DOCH is a handmade rug studio turning internet culture into physical objects.",
        "about.text":
            "Every rug is made by hand, one piece at a time. Some are funny. Some are stupid. Some are genuinely beautiful. We like all three.",
        "about.link":
            "MEET THE ARTIST ↗",

        "footer.title":
            "SEE YOU<br>ON THE <em>FLOOR.</em>",
        "footer.tag":
            "HANDMADE INTERNET ART",

        "modal.eyebrow":
            "INTERNET RELIC",
        "modal.text":
            "Handmade to order. Production begins after payment.",
        "modal.add":
            "ADD TO CART"

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
        "manifesto.text":
            "Мы берём вещи, которые не стоило вешать на стену — и кладём их на пол.",
        "manifesto.mono":
            "РУЧНАЯ РАБОТА. СТРАННО. БЕСПОЛЕЗНО.<br>ИМЕННО ТАК, КАК И ДОЛЖНО БЫТЬ.",

        "drop.eyebrow": "02 / ТЕКУЩИЙ ДРОП",
        "drop.title":
            "ИНТЕРНЕТ<br><em>РЕЛИКВИИ</em>",
        "drop.objects": "04 ОБЪЕКТА",

        "product.one": "ЕДИНСТВЕННЫЙ",
        "product.made": "ПОД ЗАКАЗ",
        "product.sold": "ПРОДАН",
        "product.handmade": "РУЧНАЯ РАБОТА",

        "product.witness": "Свидетель из Фрязино",
        "product.kandibober": "Кандибобер",

        "custom.eyebrow": "КОВЁР НА ЗАКАЗ",
        "custom.title":
            "ЕСТЬ<br><span>МЕМ?</span>",
        "custom.text":
            "Присылай картинку. Мы превратим её в ковёр.",
        "custom.button":
            "СДЕЛАТЬ МОЙ КОВЁР",

        "custom.side1": "ТВОЯ КАРТИНКА",
        "custom.side2": "ПРЯЖА",
        "custom.side3": "ТВОЙ КОВЁР",

        "process.eyebrow": "04 / ПРОЦЕСС",
        "process.title":
            "СДЕЛАНО<br><em>ВРУЧНУЮ.</em>",
        "process.subtitle":
            "Не напечатано.<br>Не сгенерировано ИИ.<br>Не массовое производство.",

        "process.design.title": "ДИЗАЙН",
        "process.design.text":
            "Мем → изображение → дизайн ковра. Всё начинается с идеи.",

        "process.taft.title": "ТАФТ",
        "process.taft.text":
            "Сотни тысяч петель пряжи, сделанных вручную.",

        "process.carve.title": "КАРВИНГ",
        "process.carve.text":
            "Каждая поверхность выстригается вручную, пока изображение не оживает.",

        "process.ship.title": "ДОСТАВКА",
        "process.ship.text":
            "Ковёр покидает студию и отправляется в новую жизнь.",

        "queue.eyebrow": "05 / ОЧЕРЕДЬ ПРОИЗВОДСТВА",
        "queue.title":
            "СЕЙЧАС<br><em>В ПРОИЗВОДСТВЕ</em>",
        "queue.live": "LIVE / 04",
        "queue.note":
            "Каждый ковёр начинает производиться после оформления заказа.",

        "about.eyebrow": "06 / ХУДОЖНИЦА",
        "about.title":
            "СЛИШКОМ МНОГО<br>МЕМОВ.<br><em>СЛИШКОМ МАЛО<br>КОВРОВ.</em>",
        "about.large":
            "DOCH — студия ковров ручной работы, которая превращает интернет-культуру в физические объекты.",
        "about.text":
            "Каждый ковёр делается вручную, по одному. Некоторые смешные. Некоторые тупые. Некоторые реально красивые. Нам нравятся все три варианта.",
        "about.link":
            "ПОЗНАКОМИТЬСЯ С ХУДОЖНИЦЕЙ ↗",

        "footer.title":
            "УВИДИМСЯ<br>НА <em>ПОЛУ.</em>",
        "footer.tag":
            "РУЧНОЙ ИНТЕРНЕТ-АРТ",

        "modal.eyebrow":
            "ИНТЕРНЕТ-РЕЛИКВИЯ",
        "modal.text":
            "Изготавливается вручную под заказ. Производство начинается после оплаты.",
        "modal.add":
            "В КОРЗИНУ"

    }

};


let currentLanguage = "en";


/* =========================================================
   LANGUAGE
========================================================= */

function setLanguage(language) {

    if (!translations[language]) return;

    currentLanguage = language;

    document.documentElement.lang = language;

    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key = element.dataset.i18n;

            if (!translations[language][key]) return;

            element.innerHTML =
                translations[language][key];

        });


    document
        .querySelectorAll(".lang-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.lang === language
            );

        });


    /*
        Update modal if it is currently open.
    */

    const activeProduct =
        modal.dataset.product;

    if (activeProduct && products[activeProduct]) {

        updateModalLanguage(
            activeProduct
        );

    }

}


function updateModalLanguage(id) {

    const item = products[id];

    if (!item) return;

    if (currentLanguage === "ru") {

        modalTitle.textContent =
            item.title;

    } else {

        modalTitle.textContent =
            item.titleEn;

    }

}


/* language buttons */

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
   PRODUCT MODAL
========================================================= */

document
    .querySelectorAll(".product")
    .forEach(product => {

        product.addEventListener(
            "click",
            () => {

                const id =
                    product.dataset.product;

                const item =
                    products[id];

                if (!item) return;

                updateModalLanguage(id);

                modalPrice.textContent =
                    `€${item.price}`;

                modalSize.textContent =
                    item.size;

                modalImage.className =
                    `modal-image ${item.image}`;

                modal.dataset.product =
                    id;

                modal.classList.add("active");

                document.body.classList.add(
                    "no-scroll"
                );

            }
        );

    });


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

            const item =
                products[id];

            if (!item) return;

            cart.push(item);

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
   UPDATE CART
========================================================= */

function updateCart() {

    cartCount.textContent =
        cart.length;


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="empty-cart">
                ${
                    translations[currentLanguage]
                    ["cart.empty"]
                }
            </p>
        `;

        cartTotal.textContent =
            "€0";

        return;

    }


    cartItems.innerHTML =
        "";

    let total = 0;


    cart.forEach(
        (item, index) => {

            total += item.price;

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "cart-item";


            const title =
                currentLanguage === "ru"
                    ? item.title
                    : item.titleEn;


            element.innerHTML = `

                <div>

                    <div class="cart-item-name">
                        ${title}
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
                        REMOVE
                    </button>

                </div>

                <div class="cart-item-price">
                    €${item.price}
                </div>

            `;


            cartItems.appendChild(
                element
            );

        }
    );


    cartTotal.textContent =
        `€${total}`;


    document
        .querySelectorAll(
            ".remove-item"
        )
        .forEach(button => {

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

        });

}


/* =========================================================
   CUSTOM BUTTON
========================================================= */

document
    .getElementById("customButton")
    .addEventListener(
        "click",
        () => {

            const message =
                currentLanguage === "ru"

                    ? "КОВЁР НА ЗАКАЗ\n\n" +
                      "Здесь появится форма заказа."

                    : "CUSTOM RUG REQUEST\n\n" +
                      "This will become the custom order form.";

            alert(message);

        }
    );


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

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

        if (Math.random() > 0.65) {

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

const observer =
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
            threshold: 0.08
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


/* =========================================================
   FISH-EYE / LENS EFFECT
========================================================= */

const productImages =
    document.querySelectorAll(
        ".product-image"
    );


productImages.forEach(
    image => {

        image.addEventListener(
            "mousemove",
            event => {

                /*
                    Mobile doesn't have meaningful hover.
                */

                if (
                    window.innerWidth <= 800
                ) return;


                const rect =
                    image.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left;

                const y =
                    event.clientY -
                    rect.top;


                const percentX =
                    (x / rect.width) * 100;

                const percentY =
                    (y / rect.height) * 100;


                /*
                    Small image movement makes
                    the lens feel alive.
                */

                const moveX =
                    (percentX - 50) * -0.035;

                const moveY =
                    (percentY - 50) * -0.035;


                image.style.setProperty(
                    "--lens-x",
                    `${percentX}%`
                );

                image.style.setProperty(
                    "--lens-y",
                    `${percentY}%`
                );

                image.style.setProperty(
                    "--image-x",
                    `${moveX}px`
                );

                image.style.setProperty(
                    "--image-y",
                    `${moveY}px`
                );

            }
        );


        image.addEventListener(
            "mouseleave",
            () => {

                image.style.setProperty(
                    "--lens-x",
                    "50%"
                );

                image.style.setProperty(
                    "--lens-y",
                    "50%"
                );

                image.style.setProperty(
                    "--image-x",
                    "0px"
                );

                image.style.setProperty(
                    "--image-y",
                    "0px"
                );

            }
        );

    }
);


/* =========================================================
   INITIAL LANGUAGE
========================================================= */

setLanguage("en");


/* =========================================================
   INITIAL CART
========================================================= */

updateCart();
