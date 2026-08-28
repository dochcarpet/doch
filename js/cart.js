/* =========================================================
   CART
========================================================= */

let cart = [];


/* =========================================================
   DOM
========================================================= */

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

const cartButton =
    document.getElementById("cartButton");

const cartClose =
    document.getElementById("cartClose");


/* =========================================================
   OPEN
========================================================= */

function openCart() {

    if (!cartDrawer || !cartOverlay) {
        return;
    }

    cartDrawer.classList.add("active");

    cartOverlay.classList.add("active");

    document.body.classList.add("no-scroll");

}


/* =========================================================
   CLOSE
========================================================= */

function closeCart() {

    if (!cartDrawer || !cartOverlay) {
        return;
    }

    cartDrawer.classList.remove("active");

    cartOverlay.classList.remove("active");

    document.body.classList.remove("no-scroll");

}


/* =========================================================
   ADD
========================================================= */

function addToCart(product) {

    if (!product) {
        return;
    }

    if (product.status === "sold") {
        return;
    }

    cart.push(product);

    updateCart();

}


/* =========================================================
   REMOVE
========================================================= */

function removeFromCart(index) {

    if (
        index < 0 ||
        index >= cart.length
    ) {
        return;
    }

    cart.splice(index, 1);

    updateCart();

}


/* =========================================================
   RENDER
========================================================= */

function updateCart() {

    if (!cartCount || !cartItems || !cartTotal) {
        return;
    }


    /* -----------------------------------------
       COUNT
    ----------------------------------------- */

    cartCount.textContent =
        cart.length;


    /* -----------------------------------------
       EMPTY
    ----------------------------------------- */

    if (!cart.length) {

        cartItems.innerHTML = `

            <p class="empty-cart">
                ${
                    translations[currentLanguage]["cart.empty"]
                }
            </p>

        `;

        cartTotal.textContent =
            "€0";

        return;

    }


    /* -----------------------------------------
       ITEMS
    ----------------------------------------- */

    cartItems.innerHTML = "";

    let total = 0;


    cart.forEach(
        (product, index) => {

            total +=
                Number(product.price || 0);


            const element =
                document.createElement("div");

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
                        type="button"
                        data-index="${index}"
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
                        product.currency || "EUR"
                    )}

                    ${formatPrice(product.price)}

                </div>

            `;


            cartItems.appendChild(
                element
            );

        }
    );


    /* -----------------------------------------
       TOTAL
    ----------------------------------------- */

    cartTotal.textContent =
        `€${formatPrice(total)}`;


    /* -----------------------------------------
       REMOVE EVENTS
    ----------------------------------------- */

    cartItems
        .querySelectorAll(".remove-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    removeFromCart(
                        Number(
                            button.dataset.index
                        )
                    );

                }
            );

        });

}


/* =========================================================
   EVENTS
========================================================= */

if (cartButton) {

    cartButton.addEventListener(
        "click",
        openCart
    );

}


if (cartClose) {

    cartClose.addEventListener(
        "click",
        closeCart
    );

}


if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        closeCart
    );

}
