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


/* =========================================================
   OPEN / CLOSE
========================================================= */

function openCart() {

    cartDrawer.classList.add("active");

    cartOverlay.classList.add("active");

    document.body.classList.add("no-scroll");

}


function closeCart() {

    cartDrawer.classList.remove("active");

    cartOverlay.classList.remove("active");

    document.body.classList.remove("no-scroll");

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
                        product.currency || "EUR"
                    )}

                    ${formatPrice(product.price)}

                </div>

            `;


            cartItems.appendChild(element);

        }
    );


    cartTotal.textContent =
        `€${formatPrice(total)}`;


    cartItems
        .querySelectorAll(".remove-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.index
                        );

                    cart.splice(index, 1);

                    updateCart();

                }
            );

        });

}


/* =========================================================
   ADD TO CART
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
   EVENTS
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
