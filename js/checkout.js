/* =========================================================
   DOCH — CHECKOUT
========================================================= */

import {
    formatPrice
} from "./utils.js";


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://kixsnkhmxyytecvvwnse.supabase.co";

const SUPABASE_KEY =
    "ТВОЙ_SUPABASE_PUBLISHABLE_KEY";


/* =========================================================
   STATE
========================================================= */

let checkoutOpen = false;


/* =========================================================
   DOM
========================================================= */

const checkoutButton =
    document.getElementById("checkoutButton");


/* =========================================================
   OPEN CHECKOUT
========================================================= */

function openCheckout() {

    if (checkoutOpen) {
        return;
    }

    checkoutOpen = true;

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
                        required
                    ></textarea>

                </div>


                <div class="checkout-summary">

                    <span>
                        TOTAL
                    </span>

                    <strong id="checkoutTotal">
                        €0
                    </strong>

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


    /* -----------------------------------------
       TOTAL
    ----------------------------------------- */

    const total =
        window.DOCH_CART_TOTAL || 0;

    const totalElement =
        document.getElementById(
            "checkoutTotal"
        );

    if (totalElement) {

        totalElement.textContent =
            `€${formatPrice(total)}`;

    }


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
   CLOSE CHECKOUT
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

}


/* =========================================================
   SUBMIT
========================================================= */

async function handleCheckout(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const submitButton =
        document.getElementById(
            "checkoutSubmit"
        );


    const message =
        document.getElementById(
            "checkoutMessage"
        );


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
        window.DOCH_CART_TOTAL || 0;


    if (!name || !email || !address) {

        return;

    }


    submitButton.disabled =
        true;


    submitButton
        .querySelector("span")
        .textContent =
        "CREATING ORDER...";


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/orders`,
                {
                    method: "POST",

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
                        JSON.stringify({
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
                        })
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
            "ORDER CREATED.";


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
   INIT
========================================================= */

if (checkoutButton) {

    checkoutButton.addEventListener(
        "click",
        openCheckout
    );

}
