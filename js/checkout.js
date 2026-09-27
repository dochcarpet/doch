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

import {
    PAYMENT_CONFIG
} from "./payment-config.js";

import {
    translations
} from "./translations.js";


/* =========================================================
   LANGUAGE
========================================================= */

function getCurrentLanguage() {

    const lang =
        document.documentElement.lang;

    return lang === "ru"
        ? "ru"
        : "en";

}


function t(key) {

    const language =
        getCurrentLanguage();

    return (
        translations?.[language]?.[key] ||
        translations?.en?.[key] ||
        key
    );

}


/* =========================================================
   CREATE ORDER
========================================================= */

export async function createOrder(customer) {

    const cart =
        getCart();

    const total =
        getCartTotal();


    if (!cart.length) {

        throw new Error(
            "Cart is empty"
        );

    }


    const region =
        PAYMENT_CONFIG.region;

    const regionConfig =
        PAYMENT_CONFIG.providers?.[region];


    if (!regionConfig) {

        throw new Error(
            `Payment region "${region}" is not configured.`
        );

    }


    const response =
        await fetch(
            `${SUPABASE_URL}/rest/v1/orders`,
            {
                method: "POST",

                headers: {
                    "apikey":
                        SUPABASE_KEY,

                    "Content-Type":
                        "application/json",

                    "Prefer":
                        "return=minimal"
                },

                body:
                    JSON.stringify({

                        name:
                            customer.name,

                        email:
                            customer.email,

                        telegram:
                            customer.telegram ||
                            null,

                        instagram:
                            customer.instagram ||
                            null,

                        description:
                            customer.address ||
                            null,

                        price:
                            total,

                        currency:
                            PAYMENT_CONFIG.displayCurrency,

                        payment_region:
                            region,

                        payment_currency:
                            regionConfig.currency,

                        payment_provider:
                            regionConfig.provider,

                        payment_amount:
                            total,

                        order_status:
                            "AWAITING_PAYMENT",

                        payment_status:
                            "PENDING",

                        payment_id:
                            null,

                        status:
                            "new"

                    })
            }
        );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Order creation failed: ${response.status} ${errorText}`
        );

    }


    return true;

}


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

let checkoutOpen =
    false;


/* =========================================================
   OPEN
========================================================= */

function openCheckout() {
   
    console.log("CHECKOUT CLICKED");

    const cart =
          getCart();
      
    console.log("CHECKOUT CART:", cart);


    if (!cart.length) {
        return;
    }


    if (checkoutOpen) {
        return;
    }


    checkoutOpen =
        true;


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
                aria-label="${escapeHtml(
                    t("payment.close")
                )}"
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
                    ${escapeHtml(
                        t("cart.total")
                    )}
                </span>

                <strong>
                    €${formatPrice(total)}
                </strong>

            </div>


            <form id="checkoutForm">


                <div class="checkout-field">

                    <label for="checkoutName">
                        ${escapeHtml(
                            t("customModal.name")
                        )}
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
                        ${escapeHtml(
                            t("customModal.email")
                        )}
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


    checkoutOpen =
        false;


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
            formData.get("name") ||
            ""
        ).trim();


    const email =
        String(
            formData.get("email") ||
            ""
        ).trim();


    const telegram =
        String(
            formData.get("telegram") ||
            ""
        ).trim();


    const address =
        String(
            formData.get("address") ||
            ""
        ).trim();


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

        const order =
            await createOrder({

                name,

                email,

                telegram,

                instagram:
                    null,

                address

            });


        console.log(
            "DOCH ORDER CREATED:",
            order
        );


        showPaymentMethods();


        submitButton
            .querySelector("span")
            .textContent =
            t("payment.title");


    } catch (error) {

        console.error(
            "DOCH CHECKOUT ERROR:",
            error
        );


        message.textContent =
            getCurrentLanguage() === "ru"
                ? "Что-то пошло не так. Попробуйте ещё раз."
                : "Something went wrong. Please try again.";


        submitButton.disabled =
            false;


        submitButton
            .querySelector("span")
            .textContent =
            getCurrentLanguage() === "ru"
                ? "ПЕРЕЙТИ К ОПЛАТЕ"
                : "CONTINUE TO PAYMENT";

    }

}


/* =========================================================
   PAYMENT METHODS
========================================================= */

function showPaymentMethods() {

    const modal =
        document.getElementById(
            "checkoutModal"
        );


    if (!modal) {
        return;
    }


    const inner =
        modal.querySelector(
            ".checkout-inner"
        );


    if (!inner) {
        return;
    }


    const cryptoProvider =
        PAYMENT_CONFIG.providers?.CRYPTO;


    const regionProvider =
        PAYMENT_CONFIG.providers?.[
            PAYMENT_CONFIG.region
        ];


    const cryptoEnabled =
        cryptoProvider?.enabled === true;


    const regionEnabled =
        regionProvider?.enabled === true;


    const cryptoMethods =
        cryptoProvider?.methods || {};


    const cryptoButtons =
        Object.entries(
            cryptoMethods
        )
        .filter(
            ([, method]) =>
                method?.enabled === true
        )
        .map(
            ([currency]) => `

                <button
                    type="button"
                    class="big-button payment-method-button"
                    data-payment-method="CRYPTO"
                    data-crypto-currency="${escapeHtml(
                        currency
                    )}"
                >

                    <span>
                        ${escapeHtml(
                            currency
                        )}
                    </span>

                    <span>
                        →
                    </span>

                </button>

            `
        )
        .join("");


    const cryptoSection =
        cryptoEnabled &&
        cryptoButtons
            ? `

                <div class="payment-method-section">

                    <div class="eyebrow">
                        ${escapeHtml(
                            t("payment.crypto")
                        )}
                    </div>

                    ${cryptoButtons}

                </div>

            `
            : "";


    let providerLabel =
        "CARD / SBP";


    if (
        regionProvider?.provider ===
        "STRIPE"
    ) {

        providerLabel =
            "CARD";

    }


    const providerSection = `

        <div class="payment-method-section">

            <div class="eyebrow">
                ${escapeHtml(
                    providerLabel
                )}
            </div>

            <button
                type="button"
                class="big-button payment-method-button"
                id="disabledPaymentMethod"
                disabled
            >

                <span>
                    ${escapeHtml(
                        t("payment.comingSoon")
                    )}
                </span>

                <span>
                    —
                </span>

            </button>

        </div>

    `;


    inner.innerHTML = `

        <div class="payment-methods">

            <div class="eyebrow">
                ${escapeHtml(
                    t("payment.title")
                )}
            </div>


            <h2>
                CHOOSE<br>
                <em>PAYMENT.</em>
            </h2>


            ${cryptoSection}


            ${providerSection}


            <button
                type="button"
                class="checkout-close"
                id="paymentBackButton"
            >
                ${escapeHtml(
                    t("payment.back")
                )}
            </button>

        </div>

    `;


    /* -----------------------------------------
       CRYPTO OPTIONS
    ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-payment-method='CRYPTO']"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const currency =
                        button.dataset
                            .cryptoCurrency;

                    showCryptoPayment(
                        currency
                    );

                }
            );

        });


    /* -----------------------------------------
       BACK
    ----------------------------------------- */

    document
        .getElementById(
            "paymentBackButton"
        )
        ?.addEventListener(
            "click",
            closeCheckout
        );

}


/* =========================================================
   CRYPTO PAYMENT
========================================================= */

function showCryptoPayment(
    cryptoCurrency = "USDT"
) {

    const modal =
        document.getElementById(
            "checkoutModal"
        );


    if (!modal) {
        return;
    }


    const total =
        getCartTotal();


    const cryptoProvider =
        PAYMENT_CONFIG.providers?.CRYPTO;


    const crypto =
        cryptoProvider?.methods?.[
            cryptoCurrency
        ];


    if (!crypto) {

        console.error(
            "CRYPTO METHOD NOT FOUND:",
            cryptoCurrency
        );

        return;

    }


    const wallet =
        crypto.wallet ||
        "WALLET COMING SOON";


    const network =
        crypto.network ||
        "NETWORK";


    const currency =
        cryptoCurrency;


    const paymentHTML = `

        <div class="crypto-payment">

            <div class="eyebrow">
                ${escapeHtml(
                    t("payment.title")
                )}
            </div>


            <h2>
                PAY WITH<br>
                <em>${escapeHtml(
                    currency
                )}.</em>
            </h2>


            <div class="checkout-total">

                <span>
                    ${escapeHtml(
                        t("payment.total")
                    )}
                </span>

                <strong>
                    €${formatPrice(total)}
                </strong>

            </div>


            <div class="crypto-details">

                <div class="crypto-row">

                    <span>
                        ${escapeHtml(
                            t("payment.currency")
                        )}
                    </span>

                    <strong>
                        ${escapeHtml(
                            currency
                        )}
                    </strong>

                </div>


                <div class="crypto-row">

                    <span>
                        ${escapeHtml(
                            t("payment.network")
                        )}
                    </span>

                    <strong>
                        ${escapeHtml(
                            network
                        )}
                    </strong>

                </div>


                <div class="crypto-wallet">

                    <span>
                        ${escapeHtml(
                            t("payment.wallet")
                        )}
                    </span>


                    <div class="crypto-wallet-address">

                        ${escapeHtml(
                            wallet
                        )}

                    </div>


                    ${
                        crypto.wallet
                            ? `
                                <button
                                    type="button"
                                    class="big-button"
                                    id="copyCryptoWallet"
                                >

                                    <span>
                                        ${escapeHtml(
                                            t("payment.copy")
                                        )}
                                    </span>

                                    <span>
                                        ⧉
                                    </span>

                                </button>
                              `
                            : ""
                    }

                </div>

            </div>


            <div class="checkout-message">

                ${escapeHtml(
                    t("payment.send")
                )}

            </div>


            <button
                type="button"
                class="big-button"
                id="cryptoPaidButton"
            >

                <span>
                    ${escapeHtml(
                        t("payment.paid")
                    )}
                </span>

                <span>
                    →
                </span>

            </button>


            <button
                type="button"
                class="checkout-close"
                id="cryptoBackButton"
            >

                ${escapeHtml(
                    t("payment.back")
                )}

            </button>

        </div>

    `;


    const inner =
        modal.querySelector(
            ".checkout-inner"
        );


    if (!inner) {
        return;
    }


    inner.innerHTML =
        paymentHTML;


    /* -----------------------------------------
       COPY WALLET
    ----------------------------------------- */

    const copyButton =
        document.getElementById(
            "copyCryptoWallet"
        );


    if (copyButton) {

        copyButton.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        crypto.wallet
                    );


                    copyButton
                        .querySelector("span")
                        .textContent =
                        t("payment.copied");


                } catch (error) {

                    console.error(
                        "COPY WALLET ERROR:",
                        error
                    );

                }

            }
        );

    }


    /* -----------------------------------------
       PAID
    ----------------------------------------- */

    document
        .getElementById(
            "cryptoPaidButton"
        )
        ?.addEventListener(
            "click",
            () => {

                showCryptoPending();

            }
        );


    /* -----------------------------------------
       BACK
    ----------------------------------------- */

    document
        .getElementById(
            "cryptoBackButton"
        )
        ?.addEventListener(
            "click",
            showPaymentMethods
        );

}


/* =========================================================
   CRYPTO PENDING
========================================================= */

function showCryptoPending() {

    const modal =
        document.getElementById(
            "checkoutModal"
        );


    if (!modal) {
        return;
    }


    const inner =
        modal.querySelector(
            ".checkout-inner"
        );


    if (!inner) {
        return;
    }


    inner.innerHTML = `

        <div class="crypto-payment">

            <div class="eyebrow">
                ${escapeHtml(
                    t("payment.received")
                )}
            </div>


            <h2>
                THANK<br>
                <em>YOU.</em>
            </h2>


            <p class="checkout-message">

                ${escapeHtml(
                    t("payment.verifying")
                )}

            </p>


            <button
                type="button"
                class="big-button"
                id="cryptoCloseButton"
            >

                <span>
                    ${escapeHtml(
                        t("payment.close")
                    )}
                </span>

                <span>
                    →
                </span>

            </button>

        </div>

    `;


    document
        .getElementById(
            "cryptoCloseButton"
        )
        ?.addEventListener(
            "click",
            closeCheckout
        );

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


console.log(
    "DOCH checkout loaded"
);


/* =========================================================
   TEST
========================================================= */

window.testCreateOrder =
    async function () {

        try {

            const order =
                await createOrder({

                    name:
                        "TEST DOCH",

                    email:
                        "test@doch.test",

                    telegram:
                        "@test",

                    instagram:
                        null

                });


            console.log(
                "ORDER CREATED:",
                order
            );


        } catch (error) {

            console.error(
                "ORDER ERROR:",
                error
            );

        }

    };


/* =========================================================
   DEBUG
========================================================= */

window.debugSupabaseRole =
    async function () {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/rpc/debug_current_role`,
                {
                    headers: {
                        "apikey":
                            SUPABASE_KEY
                    }
                }
            );


        console.log(
            "SUPABASE ROLE:",
            await response.text()
        );

    };
