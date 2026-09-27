/* =========================================================
   DOCH — PAYMENT CONFIG
========================================================= */

export const PAYMENT_CONFIG = {

    region: "RU",

    displayCurrency: "EUR",

    providers: {

        RU: {
            provider: "YOOKASSA",
            currency: "RUB"
        },

        EU: {
            provider: "STRIPE",
            currency: "EUR"
        },

        CRYPTO: {
            provider: "CRYPTO",
            currency: "EUR"
        }

    }

};
