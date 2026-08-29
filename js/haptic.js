/* =========================================================
   DOCH — PRODUCT HAPTICS
   Subtle vibration feedback for mobile product interaction
========================================================= */

function initProductHaptics() {

    /*
       Vibration API is mainly supported
       on Android browsers.

       iOS Safari currently does not expose
       navigator.vibrate().
    */

    if (
        typeof navigator === "undefined" ||
        typeof navigator.vibrate !== "function"
    ) {
        console.log(
            "DOCH HAPTICS: vibration not supported"
        );

        return;
    }


    const products =
        document.querySelectorAll(
            ".product-image"
        );


    products.forEach(
        container => {

            if (
                container.dataset.hapticsReady
            ) {
                return;
            }


            container.dataset.hapticsReady =
                "true";


            let lastX = 0;
            let lastY = 0;
            let lastVibration = 0;


            /* =================================================
               TOUCH START
            ================================================= */

            container.addEventListener(
                "touchstart",
                event => {

                    const touch =
                        event.touches[0];

                    if (!touch) {
                        return;
                    }


                    lastX =
                        touch.clientX;

                    lastY =
                        touch.clientY;


                    /*
                       Very subtle initial feedback.
                    */

                    navigator.vibrate(
                        8
                    );

                },
                {
                    passive: true
                }
            );


            /* =================================================
               TOUCH MOVE
            ================================================= */

            container.addEventListener(
                "touchmove",
                event => {

                    const touch =
                        event.touches[0];

                    if (!touch) {
                        return;
                    }


                    const dx =
                        touch.clientX -
                        lastX;


                    const dy =
                        touch.clientY -
                        lastY;


                    const distance =
                        Math.sqrt(
                            dx * dx +
                            dy * dy
                        );


                    /*
                       Don't vibrate on every
                       tiny finger movement.
                    */

                    if (
                        distance < 35
                    ) {
                        return;
                    }


                    const now =
                        Date.now();


                    /*
                       Minimum interval between
                       vibrations.
                    */

                    if (
                        now -
                        lastVibration <
                        180
                    ) {
                        return;
                    }


                    lastVibration =
                        now;


                    lastX =
                        touch.clientX;

                    lastY =
                        touch.clientY;


                    /*
                       Tiny tactile pulse.
                    */

                    navigator.vibrate(
                        5
                    );

                },
                {
                    passive: true
                }
            );


            /* =================================================
               TOUCH END
            ================================================= */

            container.addEventListener(
                "touchend",
                () => {

                    /*
                       Small finishing pulse.
                    */

                    navigator.vibrate(
                        6
                    );

                },
                {
                    passive: true
                }
            );

        }
    );


    console.log(
        "DOCH PRODUCT HAPTICS INITIALIZED"
    );

}


/* =========================================================
   START
========================================================= */

export {
    initProductHaptics
};
