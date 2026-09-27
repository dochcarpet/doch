/* =========================================================
   DOCH — PAYMENT CONFIG
========================================================= */

export const PAYMENT_CONFIG = {

    region: "RU",

    displayCurrency: "EUR",


    /* -----------------------------------------
       CRYPTO
    ----------------------------------------- */

    crypto: {

        enabled: true,

        currency: "USDT",

        network: "TRC20",

        wallet: ""

    },


    /* -----------------------------------------
       PROVIDERS
    ----------------------------------------- */

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

            currency: "USDT"

        }

    }

};
