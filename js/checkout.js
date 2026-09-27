/* =========================================================
   DOCH — CHECKOUT
========================================================= */

import {
    getCart,
    getCartTotal
} from "./cart.js";

import {
    SUPABASE_URL,
    SUPABASE_KEY
} from "./config.js";


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://kixsnkhmxyytecvvwnse.supabase.co";

const SUPABASE_KEY =
    "ТВОЙ_PUBLISHABLE_KEY";


/* =========================================================
   DOM
========================================================= */

const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );


/* =========================================================
   STATE
========================================================= */

let checkoutOpen = false;


/* =========================================================
   OPEN
========================================================= */

function openCheckout() {

    const cart =
        getCart();

    if (!cart.length) {
        return;
    }

    if (checkoutOpen) {
        return;
    }

    checkoutOpen = true;


    const total =
        getCartTotal();


    const modal =
        document.createElement("div");

    modal.className =
        "checkout-modal";

    modal.id =
        "checkoutModal";


    modal.innerHTML = `

        <div class="checkout-inner">

            <button
                type="button"
                class="checkout-close"
                id="checkoutClose"
                aria-label="Close"
            >
                ×
            </button>


            <div class="eyebrow">
                CHECKOUT
            </div>


            <h2>
                YOUR<br>
                <em>ORDER.</em>
            </h2>


            <div class="checkout-items">

                ${cart.map(product => `

                    <div class="checkout-item">

                        <span>
                            ${escapeHtml(
                                product.name ||
                                "DOCH RUG"
                            )}
                        </span>

                        <strong>
                            ${product.currency || "EUR"}
                            ${formatPrice(
                                product.price
                            )}
                        </strong>

                    </div>

                `).join("")}

            </div>


            <div class="checkout-total">

                <span>
                    TOTAL
                </span>

                <strong>
                    €${formatPrice(total)}
                </strong>

            </div>


            <form id="checkoutForm">


                <div class="checkout-field">

                    <label for="checkoutName">
                        NAME
                    </label>

                    <input
                        type="text"
                        id="checkoutName"
                        name="name"
                        autocomplete="name"
                        required
                    >

                </div>


                <div class="checkout-field">

                    <label for="checkoutEmail">
                        EMAIL
                    </label>

                    <input
                        type="email"
                        id="checkoutEmail"
                        name="email"
                        autocomplete="email"
                        required
                    >

                </div>


                <div class="checkout-field">

                    <label for="checkoutTelegram">
                        TELEGRAM
                    </label>

                    <input
                        type="text"
                        id="checkoutTelegram"
                        name="telegram"
                        placeholder="@username"
                    >

                </div>


                <div class="checkout-field">

                    <label for="checkoutAddress">
                        SHIPPING ADDRESS
                    </label>

                    <textarea
                        id="checkoutAddress"
                        name="address"
                        rows="4"
                        autocomplete="street-address"
                        required
                    ></textarea>

                </div>


                <button
                    type="submit"
                    class="big-button"
                    id="checkoutSubmit"
                >

                    <span>
                        CONTINUE TO PAYMENT
                    </span>

                    <span>
                        →
                    </span>

                </button>


                <div
                    id="checkoutMessage"
                    class="checkout-message"
                ></div>

            </form>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    document.body.classList.add(
        "no-scroll"
    );


    /* -----------------------------------------
       CLOSE
    ----------------------------------------- */

    document
        .getElementById("checkoutClose")
        ?.addEventListener(
            "click",
            closeCheckout
        );


    /* -----------------------------------------
       FORM
    ----------------------------------------- */

    document
        .getElementById("checkoutForm")
        ?.addEventListener(
            "submit",
            handleCheckout
        );

}


/* =========================================================
   CLOSE
========================================================= */

function closeCheckout() {

    const modal =
        document.getElementById(
            "checkoutModal"
        );


    if (modal) {

        modal.remove();

    }


    checkoutOpen = false;


    document.body.classList.remove(
        "no-scroll"
    );

}


/* =========================================================
   SUBMIT
========================================================= */

async function handleCheckout(event) {

    event.preventDefault();


    const cart =
        getCart();


    if (!cart.length) {
        return;
    }


    const form =
        event.currentTarget;


    const formData =
        new FormData(form);


    const name =
        String(
            formData.get("name") || ""
        ).trim();


    const email =
        String(
            formData.get("email") || ""
        ).trim();


    const telegram =
        String(
            formData.get("telegram") || ""
        ).trim();


    const address =
        String(
            formData.get("address") || ""
        ).trim();


    const total =
        getCartTotal();


    const submitButton =
        document.getElementById(
            "checkoutSubmit"
        );


    const message =
        document.getElementById(
            "checkoutMessage"
        );


    if (
        !name ||
        !email ||
        !address
    ) {

        return;

    }


    submitButton.disabled =
        true;


    submitButton
        .querySelector("span")
        .textContent =
        "CREATING ORDER...";


    try {

        const order = {

            name,

            email,

            telegram,

            description:
                address,

            price:
                total,

            currency:
                "EUR",

            payment_method:
                null,

            payment_status:
                "PENDING",

            order_status:
                "AWAITING_PAYMENT"

        };


        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/orders`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Prefer":
                            "return=representation"

                    },

                    body:
                        JSON.stringify(
                            order
                        )

                }
            );


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(
                error ||
                `HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "DOCH ORDER CREATED:",
            result
        );


        message.textContent =
            "ORDER CREATED. PAYMENT COMING NEXT.";


        submitButton
            .querySelector("span")
            .textContent =
            "ORDER CREATED";


    } catch (error) {

        console.error(
            "DOCH CHECKOUT ERROR:",
            error
        );


        message.textContent =
            "Something went wrong. Please try again.";


        submitButton.disabled =
            false;


        submitButton
            .querySelector("span")
            .textContent =
            "CONTINUE TO PAYMENT";

    }

}


/* =========================================================
   HELPERS
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function formatPrice(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


/* =========================================================
   INIT
========================================================= */

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        openCheckout
    );

}
