/* =========================================================
   DOCH — CUSTOM RUG
   IMAGE → YARN → RUG

   IMPORTANT CONCEPTS
   ---------------------------------------------------------
   SIZE   = physical rug dimensions in centimeters
   GRID   = physical transfer grid, fixed at 5 × 5 cm
   DETAIL = image processing / visual resolution
   ========================================================= */

(() => {
    "use strict";


    /* ---------------------------------------------------------
       ELEMENTS
       --------------------------------------------------------- */

    const imageInput =
        document.getElementById("imageInput");

    const fileName =
        document.getElementById("fileName");

    const keepBackground =
        document.getElementById("keepBackground");

    const removeBackground =
        document.getElementById("removeBackground");

    const colorCounts =
        document.getElementById("colorCounts");

    const paletteElement =
        document.getElementById("palette");

    const resetPalette =
        document.getElementById("resetPalette");

    const widthInput =
        document.getElementById("widthInput");

    const heightInput =
        document.getElementById("heightInput");

    const lockRatio =
        document.getElementById("lockRatio");

    const contrastInput =
        document.getElementById("contrastInput");

    const brightnessInput =
        document.getElementById("brightnessInput");

    const contrastValue =
        document.getElementById("contrastValue");

    const brightnessValue =
        document.getElementById("brightnessValue");

    const generateButton =
        document.getElementById("generateButton");

    const canvas =
        document.getElementById("rugCanvas");

    const emptyPreview =
        document.getElementById("emptyPreview");

    const previewStatus =
        document.getElementById("previewStatus");

    const statColors =
        document.getElementById("statColors");

    const statSize =
        document.getElementById("statSize");

    const statGrid =
        document.getElementById("statGrid");

    const statLoops =
        document.getElementById("statLoops");


    /* ---------------------------------------------------------
       PREVIEW / GRID ELEMENTS
       --------------------------------------------------------- */

    const rugWorkspace =
        document.getElementById("rugWorkspace");

    const rugCanvasWrap =
        document.getElementById("rugCanvasWrap");

    const gridTopLabels =
        document.getElementById("gridTopLabels");

    const gridLeftLabels =
        document.getElementById("gridLeftLabels");

    const colorLegend =
        document.getElementById("colorLegend");

    const zoomIn =
        document.getElementById("zoomIn");

    const zoomOut =
        document.getElementById("zoomOut");

    const zoomReset =
        document.getElementById("zoomReset");

    const zoomValue =
        document.getElementById("zoomValue");


    /* ---------------------------------------------------------
       SAFETY
       --------------------------------------------------------- */

    if (
        !imageInput ||
        !widthInput ||
        !heightInput ||
        !generateButton ||
        !canvas
    ) {
        console.error(
            "DOCH RUG: required elements are missing."
        );

        return;
    }


    /* ---------------------------------------------------------
       CANVAS
       --------------------------------------------------------- */

    const ctx =
        canvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );


    /* ---------------------------------------------------------
       STATE
       --------------------------------------------------------- */

    let sourceImage = null;

    let originalRatio =
        Number(widthInput.value) /
        Number(heightInput.value) ||
        100 / 75;

    let numberOfColors = 4;

    let customPalette = [];

    let generatedPalette = [];

    let backgroundMode = "keep";

    let isGenerating = false;

    let currentDetailGrid = null;

    let currentPhysicalGrid = null;

    let currentDetailData = null;

    let zoomLevel = 1;

    let detailLevel = 80;

    let showTransferGrid = true;


    /* ---------------------------------------------------------
       PHYSICAL GRID
       ---------------------------------------------------------

       THIS IS NOT IMAGE RESOLUTION.

       This is the grid used when transferring
       the design to the physical rug.

       Example:

       100 × 75 cm rug
       5 × 5 cm grid
       = 20 × 15 physical cells
       --------------------------------------------------------- */

    const GRID_CELL_CM = 5;


    /* ---------------------------------------------------------
       DETAIL SETTINGS
       ---------------------------------------------------------

       DETAIL controls the resolution used to interpret
       the source image.

       It DOES NOT define physical centimeters.

       10  = very coarse
       40  = coarse
       80  = medium
       120 = detailed
       180 = very detailed
       240 = very detailed
       300 = maximum
       --------------------------------------------------------- */

    const MIN_DETAIL = 10;

    const MAX_DETAIL = 300;

    const DETAIL_STEP = 10;


    /* ---------------------------------------------------------
       SOURCE PROCESSING
       --------------------------------------------------------- */

    const MAX_SOURCE_SIZE = 500;


    /* ---------------------------------------------------------
       ZOOM
       --------------------------------------------------------- */

    const MIN_ZOOM = 0.5;

    const MAX_ZOOM = 5;

    const ZOOM_STEP = 0.25;


    /* ---------------------------------------------------------
       DEFAULT PALETTE
       --------------------------------------------------------- */

    const DEFAULT_PALETTE = [
        "#111111",
        "#F2F0EA",
        "#D71920",
        "#2468A8",
        "#F2B84B",
        "#5A8F5A",
        "#8B5A3C",
        "#777777"
    ];


    /* =========================================================
       HELPERS
       ========================================================= */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(max, value)
        );
    }


    function hexToRgb(hex) {

        hex =
            String(hex || "")
                .replace("#", "")
                .trim();


        if (hex.length === 3) {

            hex =
                hex
                    .split("")
                    .map(
                        char =>
                            char + char
                    )
                    .join("");
        }


        const value =
            parseInt(hex, 16);


        return {
            r: (value >> 16) & 255,
            g: (value >> 8) & 255,
            b: value & 255
        };
    }


    function rgbToHex(
        r,
        g,
        b
    ) {

        return (
            "#" +
            [
                r,
                g,
                b
            ]
                .map(
                    value =>
                        clamp(
                            Math.round(value),
                            0,
                            255
                        )
                            .toString(16)
                            .padStart(2, "0")
                            .toUpperCase()
                )
                .join("")
        );
    }


    function colorDistance(
        a,
        b
    ) {

        const dr =
            a.r - b.r;

        const dg =
            a.g - b.g;

        const db =
            a.b - b.b;


        return Math.sqrt(
            dr * dr * 0.299 +
            dg * dg * 0.587 +
            db * db * 0.114
        );
    }


    function normalizeHex(
        value
    ) {

        value =
            String(value || "")
                .trim();


        if (!value.startsWith("#")) {
            value = "#" + value;
        }


        if (
            /^#[0-9a-fA-F]{3}$/.test(value)
        ) {

            return (
                "#" +
                value[1] + value[1] +
                value[2] + value[2] +
                value[3] + value[3]
            ).toUpperCase();
        }


        if (
            /^#[0-9a-fA-F]{6}$/.test(value)
        ) {

            return value.toUpperCase();
        }


        return "#000000";
    }


    function columnLabel(
        number
    ) {

        let label = "";

        let n = number + 1;


        while (n > 0) {

            const remainder =
                (n - 1) % 26;


            label =
                String.fromCharCode(
                    65 + remainder
                ) + label;


            n =
                Math.floor(
                    (n - 1) / 26
                );
        }


        return label;
    }


    /* =========================================================
       PHYSICAL GRID
       ========================================================= */

    function calculatePhysicalGrid() {

        const rugWidth =
            Math.max(
                1,
                Number(widthInput.value) || 100
            );


        const rugHeight =
            Math.max(
                1,
                Number(heightInput.value) || 75
            );


        /*
           Physical transfer grid.

           100 × 75 cm
           / 5 cm
           = 20 × 15

           This has NOTHING to do with DETAIL.
        */

        const columns =
            Math.max(
                1,
                Math.ceil(
                    rugWidth /
                    GRID_CELL_CM
                )
            );


        const rows =
            Math.max(
                1,
                Math.ceil(
                    rugHeight /
                    GRID_CELL_CM
                )
            );


        return {
            width: columns,
            height: rows,
            cellCm: GRID_CELL_CM
        };
    }


    /* =========================================================
       DETAIL GRID
       ========================================================= */

    function calculateDetailGrid() {

        const rugWidth =
            Math.max(
                1,
                Number(widthInput.value) || 100
            );


        const rugHeight =
            Math.max(
                1,
                Number(heightInput.value) || 75
            );


        /*
           DETAIL = number of image samples across.

           It is a computational / visual resolution.

           It does NOT represent centimeters.
        */

        let detailWidth =
            clamp(
                Math.round(detailLevel),
                MIN_DETAIL,
                MAX_DETAIL
            );


        let detailHeight =
            Math.round(
                detailWidth *
                rugHeight /
                rugWidth
            );


        detailHeight =
            Math.max(
                1,
                detailHeight
            );


        return {
            width: detailWidth,
            height: detailHeight
        };
    }


    /* =========================================================
       GRID LABELS
       ========================================================= */

    function clearGridLabels() {

        if (gridTopLabels) {
            gridTopLabels.innerHTML = "";
        }

        if (gridLeftLabels) {
            gridLeftLabels.innerHTML = "";
        }
    }


    function renderGridLabels(
        physicalGrid
    ) {

        clearGridLabels();


        if (
            !gridTopLabels ||
            !gridLeftLabels
        ) {
            return;
        }


        /*
           Labels represent the PHYSICAL GRID,
           not detail pixels.
        */

        for (
            let x = 0;
            x < physicalGrid.width;
            x++
        ) {

            const label =
                document.createElement("span");


            label.textContent =
                columnLabel(x);


            gridTopLabels.appendChild(
                label
            );
        }


        for (
            let y = 0;
            y < physicalGrid.height;
            y++
        ) {

            const label =
                document.createElement("span");


            label.textContent =
                y + 1;


            gridLeftLabels.appendChild(
                label
            );
        }
    }


    /* =========================================================
       DETAIL CONTROL
       ========================================================= */

    let detailInput = null;

    let detailValue = null;


    function findLeftPanel() {

        const selectors = [
            ".controls-panel",
            ".settings-panel",
            ".left-panel",
            ".sidebar",
            ".controls",
            ".control-panel"
        ];


        for (
            const selector
            of selectors
        ) {

            const element =
                document.querySelector(
                    selector
                );


            if (element) {
                return element;
            }
        }


        let current =
            widthInput.parentElement;


        while (
            current &&
            current !== document.body
        ) {

            const rect =
                current.getBoundingClientRect();


            if (
                rect.width > 220 &&
                rect.width < 700
            ) {

                return current;
            }


            current =
                current.parentElement;
        }


        return (
            widthInput.closest(".panel") ||
            widthInput.parentElement?.parentElement ||
            document.body
        );
    }


    function createDetailControl() {

        const existing =
            document.getElementById(
                "rugDetailControl"
            );


        if (existing) {

            detailInput =
                document.getElementById(
                    "rugDetailInput"
                );

            detailValue =
                document.getElementById(
                    "rugDetailValue"
                );

            return;
        }


        const container =
            document.createElement("div");


        container.id =
            "rugDetailControl";


        container.style.cssText = `
            width:100%;
            max-width:100%;
            box-sizing:border-box;
            margin:18px 0 0;
            padding:16px 0 0;
            border-top:1px solid #292925;
        `;


        container.innerHTML = `
            <div style="
                width:100%;
                display:flex;
                justify-content:space-between;
                align-items:center;
                margin-bottom:10px;
                box-sizing:border-box;
            ">
                <span style="
                    font:10px 'DM Mono',monospace;
                    color:#f2f0ea;
                    letter-spacing:.04em;
                ">
                    DETAIL
                </span>

                <span
                    id="rugDetailValue"
                    style="
                        font:10px 'DM Mono',monospace;
                        color:#77746d;
                    "
                >
                    ${detailLevel}
                </span>
            </div>

            <input
                id="rugDetailInput"
                type="range"
                min="${MIN_DETAIL}"
                max="${MAX_DETAIL}"
                step="${DETAIL_STEP}"
                value="${detailLevel}"
                style="
                    display:block;
                    width:100%;
                    max-width:100%;
                    box-sizing:border-box;
                    margin:0;
                    cursor:pointer;
                "
            >

            <div style="
                width:100%;
                display:flex;
                justify-content:space-between;
                margin-top:6px;
                font:8px 'DM Mono',monospace;
                color:#55534e;
            ">
                <span>COARSE</span>
                <span>FINE</span>
            </div>
        `;


        const target =
            findLeftPanel();


        if (!target) {
            return;
        }


        target.appendChild(
            container
        );


        detailInput =
            document.getElementById(
                "rugDetailInput"
            );


        detailValue =
            document.getElementById(
                "rugDetailValue"
            );


        if (!detailInput) {
            return;
        }


        detailInput.addEventListener(
            "input",
            () => {

                detailLevel =
                    clamp(
                        Number(
                            detailInput.value
                        ) || 80,
                        MIN_DETAIL,
                        MAX_DETAIL
                    );


                if (detailValue) {

                    detailValue.textContent =
                        String(detailLevel);
                }


                if (sourceImage) {
                    generateRug();
                }
            }
        );
    }


    /* =========================================================
       PREVIEW WORKSPACE
       ========================================================= */

    function setupWorkspace() {

        if (rugWorkspace) {

            rugWorkspace.style.position =
                "relative";

            rugWorkspace.style.minWidth =
                "0";

            rugWorkspace.style.minHeight =
                "0";

            rugWorkspace.style.overflow =
                "hidden";
        }


        if (rugCanvasWrap) {

            rugCanvasWrap.style.position =
                "relative";

            rugCanvasWrap.style.width =
                "100%";

            rugCanvasWrap.style.height =
                "100%";

            rugCanvasWrap.style.minWidth =
                "0";

            rugCanvasWrap.style.minHeight =
                "0";

            rugCanvasWrap.style.overflow =
                "auto";

            rugCanvasWrap.style.boxSizing =
                "border-box";
        }


        /*
           IMPORTANT:

           Do NOT hide the canvas here.

           The previous version had:

               canvas.style.display = "none";

           which caused the uploaded image / generated
           preview to disappear until another state
           changed it.

           We explicitly keep it visible.
        */

        canvas.style.display =
            "block";

        canvas.style.maxWidth =
            "none";

        canvas.style.maxHeight =
            "none";

        canvas.style.imageRendering =
            "pixelated";


        if (gridTopLabels) {

            gridTopLabels.style.pointerEvents =
                "none";
        }


        if (gridLeftLabels) {

            gridLeftLabels.style.pointerEvents =
                "none";
        }
    }


    /* =========================================================
       ZOOM
       ========================================================= */

    function updateZoom() {

        if (
            !currentDetailGrid ||
            !canvas
        ) {
            return;
        }


        /*
           Visual size is based on DETAIL cells.

           Again:
           this is ONLY preview zoom.

           It is NOT the physical 5 cm grid.
        */

        const baseCellSize =
            8;


        const cellSize =
            baseCellSize *
            zoomLevel;


        const visualWidth =
            currentDetailGrid.width *
            cellSize;


        const visualHeight =
            currentDetailGrid.height *
            cellSize;


        canvas.style.width =
            `${visualWidth}px`;


        canvas.style.height =
            `${visualHeight}px`;


        canvas.style.display =
            "block";


        canvas.style.imageRendering =
            "pixelated";


        /*
           Preview uses detail resolution.
        */

        if (rugCanvasWrap) {

            rugCanvasWrap.style.overflow =
                "auto";
        }


        if (zoomValue) {

            zoomValue.textContent =
                `${Math.round(
                    zoomLevel * 100
                )}%`;
        }


        /*
           Grid labels are not allowed to describe
           detail pixels.

           We don't put every detail pixel into
           the physical coordinate labels.
        */

        clearGridLabels();


        /*
           Optional CSS variables.
        */

        if (rugWorkspace) {

            rugWorkspace.style.setProperty(
                "--detail-cell-size",
                `${cellSize}px`
            );
        }
    }


    /* =========================================================
       ZOOM BUTTONS
       ========================================================= */

    if (zoomIn) {

        zoomIn.addEventListener(
            "click",
            () => {

                zoomLevel =
                    clamp(
                        zoomLevel +
                        ZOOM_STEP,
                        MIN_ZOOM,
                        MAX_ZOOM
                    );

                updateZoom();
            }
        );
    }


    if (zoomOut) {

        zoomOut.addEventListener(
            "click",
            () => {

                zoomLevel =
                    clamp(
                        zoomLevel -
                        ZOOM_STEP,
                        MIN_ZOOM,
                        MAX_ZOOM
                    );

                updateZoom();
            }
        );
    }


    if (zoomReset) {

        zoomReset.addEventListener(
            "click",
            () => {

                zoomLevel = 1;

                updateZoom();
            }
        );
    }


    /* =========================================================
       IMAGE UPLOAD
       ========================================================= */

    imageInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please select an image."
                );

                return;
            }


            if (fileName) {

                fileName.textContent =
                    file.name;
            }


            const reader =
                new FileReader();


            reader.onload =
                readerEvent => {

                    const img =
                        new Image();


                    img.onload =
                        () => {

                            sourceImage =
                                img;


                            originalRatio =
                                img.naturalWidth /
                                img.naturalHeight;


                            if (
                                lockRatio &&
                                lockRatio.checked
                            ) {

                                updateHeightFromWidth();
                            }


                            if (previewStatus) {

                                previewStatus.textContent =
                                    "IMAGE LOADED";
                            }


                            /*
                               Immediately show something.

                               The generated rug comes right after,
                               but empty state must disappear NOW.
                            */

                            if (emptyPreview) {

                                emptyPreview.style.display =
                                    "none";
                            }


                            canvas.style.display =
                                "block";


                            generateRug();
                        };


                    img.onerror =
                        () => {

                            alert(
                                "Could not load this image."
                            );
                        };


                    img.src =
                        readerEvent.target.result;
                };


            reader.readAsDataURL(file);
        }
    );


    /* =========================================================
       BACKGROUND
       ========================================================= */

    if (keepBackground) {

        keepBackground.addEventListener(
            "click",
            () => {

                backgroundMode =
                    "keep";


                keepBackground.classList.add(
                    "active"
                );


                if (removeBackground) {

                    removeBackground.classList.remove(
                        "active"
                    );
                }


                if (sourceImage) {
                    generateRug();
                }
            }
        );
    }


    if (removeBackground) {

        removeBackground.addEventListener(
            "click",
            () => {

                backgroundMode =
                    "remove";


                removeBackground.classList.add(
                    "active"
                );


                if (keepBackground) {

                    keepBackground.classList.remove(
                        "active"
                    );
                }


                if (sourceImage) {
                    generateRug();
                }
            }
        );
    }


    /* =========================================================
       COLOR COUNT
       ========================================================= */

    if (colorCounts) {

        colorCounts.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-colors]"
                    );


                if (!button) {
                    return;
                }


                numberOfColors =
                    Number(
                        button.dataset.colors
                    );


                document
                    .querySelectorAll(
                        "#colorCounts button"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                button.classList.add(
                    "active"
                );


                customPalette = [];


                if (sourceImage) {

                    generateRug();

                } else {

                    generatedPalette =
                        DEFAULT_PALETTE.slice(
                            0,
                            numberOfColors
                        );


                    renderPalette(
                        generatedPalette
                    );
                }
            }
        );
    }


    /* =========================================================
       PALETTE
       ========================================================= */

    function renderPalette(
        palette
    ) {

        if (!paletteElement) {
            return;
        }


        paletteElement.innerHTML =
            "";


        palette.forEach(
            (hex, index) => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "palette-row";


                row.innerHTML = `
                    <input
                        class="palette-color"
                        type="color"
                        value="${normalizeHex(hex)}"
                        data-palette-index="${index}"
                    >

                    <input
                        class="palette-hex"
                        type="text"
                        value="${normalizeHex(hex)}"
                        data-palette-index="${index}"
                        maxlength="7"
                        spellcheck="false"
                    >

                    <button
                        class="palette-delete"
                        type="button"
                        data-palette-delete="${index}"
                    >
                        ×
                    </button>
                `;


                paletteElement.appendChild(
                    row
                );
            }
        );
    }


    if (paletteElement) {

        paletteElement.addEventListener(
            "input",
            event => {

                const index =
                    event.target.dataset
                        .paletteIndex;


                if (
                    index === undefined
                ) {
                    return;
                }


                if (
                    event.target.type ===
                    "color"
                ) {

                    customPalette[index] =
                        event.target.value
                            .toUpperCase();


                    const textInput =
                        paletteElement.querySelector(
                            `.palette-hex[data-palette-index="${index}"]`
                        );


                    if (textInput) {

                        textInput.value =
                            event.target.value
                                .toUpperCase();
                    }


                    if (sourceImage) {
                        generateRug();
                    }
                }
            }
        );


        paletteElement.addEventListener(
            "change",
            event => {

                const index =
                    event.target.dataset
                        .paletteIndex;


                if (
                    index === undefined
                ) {
                    return;
                }


                if (
                    event.target.classList.contains(
                        "palette-hex"
                    )
                ) {

                    const value =
                        normalizeHex(
                            event.target.value
                        );


                    customPalette[index] =
                        value;


                    event.target.value =
                        value;


                    const colorInput =
                        paletteElement.querySelector(
                            `.palette-color[data-palette-index="${index}"]`
                        );


                    if (colorInput) {

                        colorInput.value =
                            value;
                    }


                    if (sourceImage) {
                        generateRug();
                    }
                }
            }
        );


        paletteElement.addEventListener(
            "click",
            event => {

                const deleteButton =
                    event.target.closest(
                        "[data-palette-delete]"
                    );


                if (!deleteButton) {
                    return;
                }


                const index =
                    Number(
                        deleteButton.dataset
                            .paletteDelete
                    );


                if (
                    !customPalette.length
                ) {

                    customPalette =
                        [
                            ...generatedPalette
                        ];
                }


                customPalette.splice(
                    index,
                    1
                );


                if (
                    !customPalette.length
                ) {

                    customPalette =
                        ["#000000"];
                }


                numberOfColors =
                    customPalette.length;


                generatedPalette =
                    [
                        ...customPalette
                    ];


                renderPalette(
                    generatedPalette
                );


                if (sourceImage) {
                    generateRug();
                }
            }
        );
    }


    if (resetPalette) {

        resetPalette.addEventListener(
            "click",
            () => {

                customPalette = [];


                if (sourceImage) {

                    generateRug();

                } else {

                    generatedPalette =
                        DEFAULT_PALETTE.slice(
                            0,
                            numberOfColors
                        );


                    renderPalette(
                        generatedPalette
                    );
                }
            }
        );
    }


    /* =========================================================
       SIZE
       ========================================================= */

    function updateHeightFromWidth() {

        if (
            !lockRatio ||
            !lockRatio.checked
        ) {
            return;
        }


        const width =
            Number(
                widthInput.value
            );


        if (
            !width ||
            !originalRatio
        ) {
            return;
        }


        const height =
            width /
            originalRatio;


        heightInput.value =
            Math.max(
                1,
                Math.round(height)
            );
    }


    widthInput.addEventListener(
        "input",
        () => {

            updateHeightFromWidth();


            if (sourceImage) {
                generateRug();
            }
        }
    );


    heightInput.addEventListener(
        "input",
        () => {

            if (
                sourceImage &&
                (!lockRatio ||
                    !lockRatio.checked)
            ) {

                generateRug();
            }
        }
    );


    if (lockRatio) {

        lockRatio.addEventListener(
            "change",
            () => {

                if (
                    lockRatio.checked
                ) {

                    updateHeightFromWidth();
                }


                if (sourceImage) {
                    generateRug();
                }
            }
        );
    }


    /* =========================================================
       BRIGHTNESS / CONTRAST
       ========================================================= */

    if (contrastInput) {

        contrastInput.addEventListener(
            "input",
            () => {

                if (contrastValue) {

                    contrastValue.textContent =
                        contrastInput.value;
                }


                if (sourceImage) {
                    generateRug();
                }
            }
        );
    }


    if (brightnessInput) {

        brightnessInput.addEventListener(
            "input",
            () => {

                if (brightnessValue) {

                    brightnessValue.textContent =
                        brightnessInput.value;
                }


                if (sourceImage) {
                    generateRug();
                }
            }
        );
    }


    /* =========================================================
       PROCESS IMAGE
       ========================================================= */

    function processImage() {

        if (!sourceImage) {
            return null;
        }


        let width =
            sourceImage.naturalWidth;


        let height =
            sourceImage.naturalHeight;


        const ratio =
            Math.min(
                MAX_SOURCE_SIZE / width,
                MAX_SOURCE_SIZE / height,
                1
            );


        width =
            Math.max(
                1,
                Math.round(
                    width * ratio
                )
            );


        height =
            Math.max(
                1,
                Math.round(
                    height * ratio
                )
            );


        const tempCanvas =
            document.createElement(
                "canvas"
            );


        tempCanvas.width =
            width;


        tempCanvas.height =
            height;


        const tempCtx =
            tempCanvas.getContext(
                "2d",
                {
                    willReadFrequently: true
                }
            );


        tempCtx.drawImage(
            sourceImage,
            0,
            0,
            width,
            height
        );


        const imageData =
            tempCtx.getImageData(
                0,
                0,
                width,
                height
            );


        const data =
            imageData.data;


        const brightness =
            Number(
                brightnessInput?.value || 0
            );


        const contrast =
            Number(
                contrastInput?.value || 0
            );


        const factor =
            (
                259 *
                (contrast + 255)
            ) /
            (
                255 *
                (259 - contrast)
            );


        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

            let r =
                data[i];

            let g =
                data[i + 1];

            let b =
                data[i + 2];


            r +=
                brightness * 2.55;

            g +=
                brightness * 2.55;

            b +=
                brightness * 2.55;


            r =
                factor *
                (r - 128) +
                128;

            g =
                factor *
                (g - 128) +
                128;

            b =
                factor *
                (b - 128) +
                128;


            data[i] =
                clamp(
                    r,
                    0,
                    255
                );

            data[i + 1] =
                clamp(
                    g,
                    0,
                    255
                );

            data[i + 2] =
                clamp(
                    b,
                    0,
                    255
                );
        }


        tempCtx.putImageData(
            imageData,
            0,
            0
        );


        return {
            canvas: tempCanvas,
            imageData
        };
    }


    /* =========================================================
       BACKGROUND REMOVAL
       ========================================================= */

    function applyBackgroundRemoval(
        imageData
    ) {

        if (
            backgroundMode !==
            "remove"
        ) {
            return;
        }


        const data =
            imageData.data;


        const width =
            imageData.width;


        const height =
            imageData.height;


        const cornerPositions = [
            0,

            (width - 1) * 4,

            (height - 1) *
                width *
                4,

            (
                (height - 1) *
                width +
                width -
                1
            ) * 4
        ];


        const background = {
            r: 0,
            g: 0,
            b: 0
        };


        cornerPositions.forEach(
            position => {

                background.r +=
                    data[position];

                background.g +=
                    data[position + 1];

                background.b +=
                    data[position + 2];
            }
        );


        background.r /= 4;
        background.g /= 4;
        background.b /= 4;


        const threshold = 55;


        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

            const current = {
                r: data[i],
                g: data[i + 1],
                b: data[i + 2]
            };


            const distance =
                colorDistance(
                    current,
                    background
                );


            if (
                distance <
                threshold
            ) {

                data[i + 3] = 0;
            }
        }
    }


    /* =========================================================
       PALETTE EXTRACTION
       ========================================================= */

    function extractPalette(
        imageData,
        count
    ) {

        const data =
            imageData.data;


        const buckets =
            new Map();


        const step = 12;


        for (
            let i = 0;
            i < data.length;
            i += 4 * step
        ) {

            const alpha =
                data[i + 3];


            if (
                alpha < 30
            ) {
                continue;
            }


            let r =
                data[i];

            let g =
                data[i + 1];

            let b =
                data[i + 2];


            r =
                Math.floor(
                    r / 16
                ) * 16;

            g =
                Math.floor(
                    g / 16
                ) * 16;

            b =
                Math.floor(
                    b / 16
                ) * 16;


            const key =
                `${r},${g},${b}`;


            buckets.set(
                key,
                (
                    buckets.get(key) ||
                    0
                ) + 1
            );
        }


        const sorted =
            [...buckets.entries()]
                .sort(
                    (a, b) =>
                        b[1] -
                        a[1]
                )
                .slice(0, 60)
                .map(
                    ([key, weight]) => {

                        const [
                            r,
                            g,
                            b
                        ] =
                            key
                                .split(",")
                                .map(Number);


                        return {
                            r,
                            g,
                            b,
                            weight
                        };
                    }
                );


        if (
            !sorted.length
        ) {

            return DEFAULT_PALETTE.slice(
                0,
                count
            );
        }


        const result = [
            sorted[0]
        ];


        while (
            result.length <
            count &&
            result.length <
            sorted.length
        ) {

            let bestCandidate =
                null;


            let bestScore =
                -Infinity;


            for (
                const candidate
                of sorted
            ) {

                const alreadySelected =
                    result.some(
                        selected =>
                            colorDistance(
                                selected,
                                candidate
                            ) < 12
                    );


                if (
                    alreadySelected
                ) {
                    continue;
                }


                let minDistance =
                    Infinity;


                result.forEach(
                    selected => {

                        minDistance =
                            Math.min(
                                minDistance,
                                colorDistance(
                                    selected,
                                    candidate
                                )
                            );
                    }
                );


                const score =
                    minDistance +
                    Math.log(
                        candidate.weight + 1
                    ) * 3;


                if (
                    score >
                    bestScore
                ) {

                    bestScore =
                        score;


                    bestCandidate =
                        candidate;
                }
            }


            if (
                !bestCandidate
            ) {
                break;
            }


            result.push(
                bestCandidate
            );
        }


        return result.map(
            color =>
                rgbToHex(
                    color.r,
                    color.g,
                    color.b
                )
        );
    }


    function hexToRgbArray(
        palette
    ) {

        return palette.map(
            hexToRgb
        );
    }


    /* =========================================================
       CREATE DETAIL IMAGE
       ========================================================= */

    function createDetailImage(
        processed,
        detailGrid
    ) {

        const sourceCanvas =
            processed.canvas;


        const sourceCtx =
            sourceCanvas.getContext(
                "2d",
                {
                    willReadFrequently: true
                }
            );


        const sourceData =
            sourceCtx.getImageData(
                0,
                0,
                sourceCanvas.width,
                sourceCanvas.height
            );


        const output = [];


        const palette =
            hexToRgbArray(
                customPalette.length
                    ? customPalette
                    : generatedPalette
            );


        if (!palette.length) {
            return output;
        }


        for (
            let gy = 0;
            gy < detailGrid.height;
            gy++
        ) {

            const row = [];


            for (
                let gx = 0;
                gx < detailGrid.width;
                gx++
            ) {

                const sx =
                    Math.floor(
                        gx /
                        detailGrid.width *
                        sourceCanvas.width
                    );


                const sy =
                    Math.floor(
                        gy /
                        detailGrid.height *
                        sourceCanvas.height
                    );


                const ex =
                    Math.max(
                        sx + 1,
                        Math.floor(
                            (gx + 1) /
                            detailGrid.width *
                            sourceCanvas.width
                        )
                    );


                const ey =
                    Math.max(
                        sy + 1,
                        Math.floor(
                            (gy + 1) /
                            detailGrid.height *
                            sourceCanvas.height
                        )
                    );


                let r = 0;

                let g = 0;

                let b = 0;

                let pixels = 0;


                for (
                    let y = sy;
                    y < ey;
                    y++
                ) {

                    for (
                        let x = sx;
                        x < ex;
                        x++
                    ) {

                        const index =
                            (
                                y *
                                sourceCanvas.width +
                                x
                            ) * 4;


                        const alpha =
                            sourceData
                                .data[index + 3];


                        if (
                            alpha < 20
                        ) {
                            continue;
                        }


                        r +=
                            sourceData.data[index];

                        g +=
                            sourceData.data[index + 1];

                        b +=
                            sourceData.data[index + 2];

                        pixels++;
                    }
                }


                if (!pixels) {

                    row.push(null);

                    continue;
                }


                const average = {
                    r: r / pixels,
                    g: g / pixels,
                    b: b / pixels
                };


                let closest =
                    palette[0];


                let closestDistance =
                    Infinity;


                palette.forEach(
                    color => {

                        const distance =
                            colorDistance(
                                average,
                                color
                            );


                        if (
                            distance <
                            closestDistance
                        ) {

                            closestDistance =
                                distance;

                            closest =
                                color;
                        }
                    }
                );


                row.push(
                    rgbToHex(
                        closest.r,
                        closest.g,
                        closest.b
                    )
                );
            }


            output.push(
                row
            );
        }


        return output;
    }


    /* =========================================================
       SAMPLE DETAIL IMAGE INTO PHYSICAL GRID
       =========================================================

       This is the important separation.

       DETAIL:

           e.g. 80 × 60

       PHYSICAL GRID:

           e.g. 20 × 15

       The physical grid samples the detailed image.

       Therefore:

       DETAIL = visual fidelity
       GRID   = physical transfer reference
       ========================================================= */

    function createPhysicalGridData(
        detailData,
        detailGrid,
        physicalGrid
    ) {

        const output = [];


        for (
            let py = 0;
            py < physicalGrid.height;
            py++
        ) {

            const row = [];


            for (
                let px = 0;
                px < physicalGrid.width;
                px++
            ) {

                const startX =
                    Math.floor(
                        px /
                        physicalGrid.width *
                        detailGrid.width
                    );


                const endX =
                    Math.max(
                        startX + 1,
                        Math.floor(
                            (px + 1) /
                            physicalGrid.width *
                            detailGrid.width
                        )
                    );


                const startY =
                    Math.floor(
                        py /
                        physicalGrid.height *
                        detailGrid.height
                    );


                const endY =
                    Math.max(
                        startY + 1,
                        Math.floor(
                            (py + 1) /
                            physicalGrid.height *
                            detailGrid.height
                        )
                    );


                const counts =
                    new Map();


                for (
                    let y = startY;
                    y < endY;
                    y++
                ) {

                    for (
                        let x = startX;
                        x < endX;
                        x++
                    ) {

                        const color =
                            detailData[y]?.[x];


                        if (!color) {
                            continue;
                        }


                        counts.set(
                            color,
                            (
                                counts.get(color) ||
                                0
                            ) + 1
                        );
                    }
                }


                let bestColor = null;

                let bestCount = 0;


                counts.forEach(
                    (count, color) => {

                        if (
                            count >
                            bestCount
                        ) {

                            bestCount =
                                count;

                            bestColor =
                                color;
                        }
                    }
                );


                row.push(
                    bestColor
                );
            }


            output.push(
                row
            );
        }


        return output;
    }


    /* =========================================================
       DRAW PREVIEW
       ========================================================= */

    function drawRug(
        detailData,
        detailGrid,
        physicalGrid
    ) {

        currentDetailGrid =
            detailGrid;


        currentPhysicalGrid =
            physicalGrid;


        currentDetailData =
            detailData;


        canvas.width =
            detailGrid.width;


        canvas.height =
            detailGrid.height;


        canvas.style.imageRendering =
            "pixelated";


        canvas.style.display =
            "block";


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.imageSmoothingEnabled =
            false;


        for (
            let y = 0;
            y < detailGrid.height;
            y++
        ) {

            for (
                let x = 0;
                x < detailGrid.width;
                x++
            ) {

                const color =
                    detailData[y]?.[x];


                ctx.fillStyle =
                    color ||
                    "#0e0e0c";


                ctx.fillRect(
                    x,
                    y,
                    1,
                    1
                );
            }
        }


        /*
           IMPORTANT:

           We DO NOT draw the physical 5 cm grid
           into the image canvas.

           The preview image remains clean.

           The physical grid is a separate overlay.
        */

        updateZoom();
    }


    /* =========================================================
       RENDER PHYSICAL GRID OVERLAY
       ========================================================= */

    function renderPhysicalGridOverlay() {

        if (!rugWorkspace) {
            return;
        }


        const old =
            rugWorkspace.querySelector(
                ".doch-transfer-grid"
            );


        if (old) {
            old.remove();
        }


        if (
            !showTransferGrid ||
            !currentPhysicalGrid ||
            !currentDetailGrid
        ) {
            return;
        }


        const overlay =
            document.createElement(
                "div"
            );


        overlay.className =
            "doch-transfer-grid";


        const columns =
            currentPhysicalGrid.width;


        const rows =
            currentPhysicalGrid.height;


        overlay.style.cssText = `
            position:absolute;
            left:0;
            top:0;
            width:${canvas.style.width};
            height:${canvas.style.height};
            display:grid;
            grid-template-columns:repeat(${columns},1fr);
            grid-template-rows:repeat(${rows},1fr);
            pointer-events:none;
            z-index:20;
        `;


        /*
           Only 5 cm transfer cells.

           NOT detail cells.
        */

        for (
            let i = 0;
            i < columns * rows;
            i++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.style.cssText = `
                box-sizing:border-box;
                border-right:1px solid rgba(255,255,255,.32);
                border-bottom:1px solid rgba(255,255,255,.32);
            `;


            overlay.appendChild(
                cell
            );
        }


        rugWorkspace.appendChild(
            overlay
        );
    }


    /* =========================================================
       COLOR LEGEND
       ========================================================= */

    function renderColorLegend(
        gridData,
        palette
    ) {

        if (!colorLegend) {
            return;
        }


        colorLegend.innerHTML =
            "";


        const counts =
            new Map();


        gridData.forEach(
            row => {

                row.forEach(
                    color => {

                        if (!color) {
                            return;
                        }


                        counts.set(
                            color,
                            (
                                counts.get(color) ||
                                0
                            ) + 1
                        );
                    }
                );
            }
        );


        palette.forEach(
            (hex, index) => {

                const normalized =
                    normalizeHex(hex);


                const count =
                    counts.get(
                        normalized
                    ) || 0;


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "legend-item";


                item.innerHTML = `
                    <div
                        class="legend-color"
                        style="background:${normalized}"
                    ></div>

                    <div class="legend-main">

                        <span class="legend-label">
                            COLOR ${index + 1}
                        </span>

                        <span class="legend-hex">
                            ${normalized}
                        </span>

                    </div>

                    <div class="legend-count">
                        ${count.toLocaleString()} DETAIL CELLS
                    </div>
                `;


                colorLegend.appendChild(
                    item
                );
            }
        );
    }


    /* =========================================================
       STATS
       ========================================================= */

    function updateStats(
        physicalGrid,
        detailGrid
    ) {

        const width =
            Math.round(
                Number(
                    widthInput.value
                ) || 100
            );


        const height =
            Math.round(
                Number(
                    heightInput.value
                ) || 75
            );


        const physicalCells =
            physicalGrid.width *
            physicalGrid.height;


        const detailCells =
            detailGrid.width *
            detailGrid.height;


        if (statColors) {

            statColors.textContent =
                customPalette.length ||
                numberOfColors;
        }


        if (statSize) {

            statSize.textContent =
                `${width} × ${height} CM`;
        }


        /*
           statGrid = PHYSICAL TRANSFER GRID

           NOT DETAIL RESOLUTION.
        */

        if (statGrid) {

            statGrid.textContent =
                `${physicalGrid.width} × ${physicalGrid.height}`;
        }


        /*
           statLoops can show the number of physical
           transfer cells, because those are the actual
           useful "loops" for the rug grid.

           Detail resolution is intentionally separate.
        */

        if (statLoops) {

            statLoops.textContent =
                physicalCells.toLocaleString();
        }


        /*
           Optional data attributes for CSS / debugging.
        */

        if (rugWorkspace) {

            rugWorkspace.dataset.detail =
                `${detailGrid.width}×${detailGrid.height}`;

            rugWorkspace.dataset.physicalGrid =
                `${physicalGrid.width}×${physicalGrid.height}`;

            rugWorkspace.dataset.gridCellCm =
                String(GRID_CELL_CM);
        }
    }


    /* =========================================================
       GENERATE
       ========================================================= */

    function generateRug() {

        if (!sourceImage) {
            return;
        }


        if (isGenerating) {
            return;
        }


        isGenerating =
            true;


        if (previewStatus) {

            previewStatus.textContent =
                "PROCESSING…";
        }


        setTimeout(
            () => {

                try {

                    const processed =
                        processImage();


                    if (!processed) {
                        return;
                    }


                    applyBackgroundRemoval(
                        processed.imageData
                    );


                    const tempCtx =
                        processed.canvas
                            .getContext(
                                "2d",
                                {
                                    willReadFrequently: true
                                }
                            );


                    tempCtx.putImageData(
                        processed.imageData,
                        0,
                        0
                    );


                    /*
                       Generate palette only if the user
                       hasn't manually edited it.
                    */

                    if (
                        !customPalette.length
                    ) {

                        generatedPalette =
                            extractPalette(
                                processed.imageData,
                                numberOfColors
                            );


                        renderPalette(
                            generatedPalette
                        );
                    }


                    /*
                       1. IMAGE DETAIL
                    */

                    const detailGrid =
                        calculateDetailGrid();


                    const detailData =
                        createDetailImage(
                            processed,
                            detailGrid
                        );


                    /*
                       2. PHYSICAL 5 CM GRID
                    */

                    const physicalGrid =
                        calculatePhysicalGrid();


                    /*
                       3. Map detailed image to
                          physical transfer cells.
                    */

                    const physicalGridData =
                        createPhysicalGridData(
                            detailData,
                            detailGrid,
                            physicalGrid
                        );


                    /*
                       Keep both.

                       Detail data is used for preview.
                       Physical grid data is used for
                       transfer/export.
                    */

                    currentDetailData =
                        detailData;


                    currentDetailGrid =
                        detailGrid;


                    currentPhysicalGrid =
                        physicalGrid;


                    /*
                       Preview
                    */

                    drawRug(
                        detailData,
                        detailGrid,
                        physicalGrid
                    );


                    /*
                       Physical overlay
                    */

                    renderPhysicalGridOverlay();


                    /*
                       Legend based on actual detail
                       representation.
                    */

                    renderColorLegend(
                        detailData,
                        customPalette.length
                            ? customPalette
                            : generatedPalette
                    );


                    /*
                       Stats
                    */

                    updateStats(
                        physicalGrid,
                        detailGrid
                    );


                    if (emptyPreview) {

                        emptyPreview.style.display =
                            "none";
                    }


                    canvas.style.display =
                        "block";


                    if (previewStatus) {

                        previewStatus.textContent =
                            "RUG READY";
                    }


                    createExportControls();


                } catch (error) {

                    console.error(
                        "Rug generation error:",
                        error
                    );


                    if (previewStatus) {

                        previewStatus.textContent =
                            "PROCESSING ERROR";
                    }

                } finally {

                    isGenerating =
                        false;
                }

            },
            20
        );
    }


    /* =========================================================
       EXPORT CONTROLS
       ========================================================= */

    function createExportControls() {

        if (
            document.getElementById(
                "rugExportControls"
            )
        ) {
            return;
        }


        const container =
            document.createElement("div");


        container.id =
            "rugExportControls";


        container.style.cssText = `
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:8px;
            margin-top:12px;
        `;


        const downloadButton =
            document.createElement("button");


        downloadButton.type =
            "button";


        downloadButton.textContent =
            "DOWNLOAD PNG";


        downloadButton.style.cssText = `
            min-height:52px;
            border:1px solid #292925;
            background:transparent;
            color:#f2f0ea;
            cursor:pointer;
            font:10px "DM Mono",monospace;
        `;


        const projectorButton =
            document.createElement("button");


        projectorButton.type =
            "button";


        projectorButton.textContent =
            "PROJECTOR MODE";


        projectorButton.style.cssText = `
            min-height:52px;
            border:1px solid #292925;
            background:#f2f0ea;
            color:#0b0b0a;
            cursor:pointer;
            font:10px "DM Mono",monospace;
        `;


        downloadButton.addEventListener(
            "click",
            downloadRugPNG
        );


        projectorButton.addEventListener(
            "click",
            openProjectorMode
        );


        container.appendChild(
            downloadButton
        );


        container.appendChild(
            projectorButton
        );


        const previewPanel =
            document.querySelector(
                ".preview-panel"
            );


        if (previewPanel) {

            previewPanel.appendChild(
                container
            );
        }
    }


    /* =========================================================
       DOWNLOAD PNG
       ========================================================= */

    function downloadRugPNG() {

        if (
            !currentDetailData ||
            !currentDetailGrid ||
            !currentPhysicalGrid
        ) {

            alert(
                "Generate the rug first."
            );

            return;
        }


        /*
           EXPORT IS NOW BASED ON THE PHYSICAL GRID.

           The exported rug shows:

           - physical 5 cm cells
           - A-Z / row coordinates
           - dimensions
           - color legend

           It does NOT export every DETAIL pixel
           as if it were a physical grid cell.
        */

        const EXPORT_CELL_SIZE = 100;

        const LABEL_SIZE = 80;

        const TOP_INFO = 100;

        const LEGEND_HEIGHT = 180;

        const BORDER = 3;


        const physicalWidth =
            currentPhysicalGrid.width *
            EXPORT_CELL_SIZE;


        const physicalHeight =
            currentPhysicalGrid.height *
            EXPORT_CELL_SIZE;


        const exportWidth =
            LABEL_SIZE +
            physicalWidth +
            40;


        const exportHeight =
            TOP_INFO +
            physicalHeight +
            LEGEND_HEIGHT;


        const exportCanvas =
            document.createElement(
                "canvas"
            );


        exportCanvas.width =
            exportWidth;


        exportCanvas.height =
            exportHeight;


        const exportCtx =
            exportCanvas.getContext(
                "2d"
            );


        exportCtx.imageSmoothingEnabled =
            false;


        /* -----------------------------------------------------
           BACKGROUND
           ----------------------------------------------------- */

        exportCtx.fillStyle =
            "#11110f";


        exportCtx.fillRect(
            0,
            0,
            exportWidth,
            exportHeight
        );


        /* -----------------------------------------------------
           DATA
           ----------------------------------------------------- */

        const width =
            Math.round(
                Number(
                    widthInput.value
                ) || 100
            );


        const height =
            Math.round(
                Number(
                    heightInput.value
                ) || 75
            );


        const colors =
            customPalette.length ||
            numberOfColors;


        const palette =
            customPalette.length
                ? customPalette
                : generatedPalette;


        /* -----------------------------------------------------
           HEADER
           ----------------------------------------------------- */

        exportCtx.fillStyle =
            "#f2f0ea";


        exportCtx.font =
            "bold 22px Arial";


        exportCtx.fillText(
            "DOCH / RUG GRID",
            30,
            35
        );


        exportCtx.fillStyle =
            "#77746d";


        exportCtx.font =
            "13px Arial";


        exportCtx.fillText(
            `${width} × ${height} CM  ·  ${GRID_CELL_CM} × ${GRID_CELL_CM} CM GRID  ·  ${currentPhysicalGrid.width} × ${currentPhysicalGrid.height} CELLS`,
            30,
            60
        );


        exportCtx.fillText(
            `DETAIL ${detailLevel}  ·  ${currentDetailGrid.width} × ${currentDetailGrid.height} DETAIL CELLS  ·  ${colors} COLORS`,
            30,
            82
        );


        /* -----------------------------------------------------
           GRID POSITION
           ----------------------------------------------------- */

        const gridX =
            LABEL_SIZE;


        const gridY =
            TOP_INFO;


        /* -----------------------------------------------------
           PHYSICAL GRID CELLS
           ----------------------------------------------------- */

        for (
            let py = 0;
            py < currentPhysicalGrid.height;
            py++
        ) {

            for (
                let px = 0;
                px < currentPhysicalGrid.width;
                px++
            ) {

                const startX =
                    Math.floor(
                        px /
                        currentPhysicalGrid.width *
                        currentDetailGrid.width
                    );


                const endX =
                    Math.max(
                        startX + 1,
                        Math.floor(
                            (px + 1) /
                            currentPhysicalGrid.width *
                            currentDetailGrid.width
                        )
                    );


                const startY =
                    Math.floor(
                        py /
                        currentPhysicalGrid.height *
                        currentDetailGrid.height
                    );


                const endY =
                    Math.max(
                        startY + 1,
                        Math.floor(
                            (py + 1) /
                            currentPhysicalGrid.height *
                            currentDetailGrid.height
                        )
                    );


                const counts =
                    new Map();


                for (
                    let y = startY;
                    y < endY;
                    y++
                ) {

                    for (
                        let x = startX;
                        x < endX;
                        x++
                    ) {

                        const color =
                            currentDetailData[y]?.[x];


                        if (!color) {
                            continue;
                        }


                        counts.set(
                            color,
                            (
                                counts.get(color) ||
                                0
                            ) + 1
                        );
                    }
                }


                let color = null;

                let bestCount = 0;


                counts.forEach(
                    (count, candidate) => {

                        if (
                            count >
                            bestCount
                        ) {

                            bestCount =
                                count;

                            color =
                                candidate;
                        }
                    }
                );


                exportCtx.fillStyle =
                    color ||
                    "#11110f";


                exportCtx.fillRect(
                    gridX +
                        px *
                        EXPORT_CELL_SIZE,

                    gridY +
                        py *
                        EXPORT_CELL_SIZE,

                    EXPORT_CELL_SIZE,

                    EXPORT_CELL_SIZE
                );
            }
        }


        /* -----------------------------------------------------
           GRID LINES
           ----------------------------------------------------- */

        exportCtx.strokeStyle =
            "rgba(255,255,255,.30)";


        exportCtx.lineWidth =
            1;


        for (
            let x = 0;
            x <= currentPhysicalGrid.width;
            x++
        ) {

            const px =
                gridX +
                x *
                EXPORT_CELL_SIZE +
                0.5;


            exportCtx.beginPath();


            exportCtx.moveTo(
                px,
                gridY
            );


            exportCtx.lineTo(
                px,
                gridY +
                physicalHeight
            );


            exportCtx.stroke();
        }


        for (
            let y = 0;
            y <= currentPhysicalGrid.height;
            y++
        ) {

            const py =
                gridY +
                y *
                EXPORT_CELL_SIZE +
                0.5;


            exportCtx.beginPath();


            exportCtx.moveTo(
                gridX,
                py
            );


            exportCtx.lineTo(
                gridX +
                physicalWidth,
                py
            );


            exportCtx.stroke();
        }


        /* -----------------------------------------------------
           OUTER BORDER
           ----------------------------------------------------- */

        exportCtx.strokeStyle =
            "#f2f0ea";


        exportCtx.lineWidth =
            BORDER;


        exportCtx.strokeRect(
            gridX,
            gridY,
            physicalWidth,
            physicalHeight
        );


        /* -----------------------------------------------------
           TOP COORDINATES
           ----------------------------------------------------- */

        exportCtx.fillStyle =
            "#aaa79f";


        exportCtx.font =
            "11px Arial";


        exportCtx.textAlign =
            "center";


        for (
            let x = 0;
            x < currentPhysicalGrid.width;
            x++
        ) {

            const centerX =
                gridX +
                x *
                EXPORT_CELL_SIZE +
                EXPORT_CELL_SIZE / 2;


            exportCtx.fillText(
                columnLabel(x),
                centerX,
                gridY - 12
            );
        }


        /* -----------------------------------------------------
           LEFT COORDINATES
           ----------------------------------------------------- */

        exportCtx.textAlign =
            "right";


        for (
            let y = 0;
            y < currentPhysicalGrid.height;
            y++
        ) {

            const centerY =
                gridY +
                y *
                EXPORT_CELL_SIZE +
                EXPORT_CELL_SIZE / 2;


            exportCtx.fillText(
                String(y + 1),
                gridX - 10,
                centerY + 4
            );
        }


        /* -----------------------------------------------------
           LEGEND
           ----------------------------------------------------- */

        const legendY =
            gridY +
            physicalHeight +
            35;


        exportCtx.textAlign =
            "left";


        exportCtx.fillStyle =
            "#f2f0ea";


        exportCtx.font =
            "bold 12px Arial";


        exportCtx.fillText(
            "COLOR LEGEND",
            30,
            legendY
        );


        /*
           Count physical grid cells by color.
        */

        const counts =
            new Map();


        for (
            let py = 0;
            py < currentPhysicalGrid.height;
            py++
        ) {

            for (
                let px = 0;
                px < currentPhysicalGrid.width;
                px++
            ) {

                const startX =
                    Math.floor(
                        px /
                        currentPhysicalGrid.width *
                        currentDetailGrid.width
                    );


                const endX =
                    Math.max(
                        startX + 1,
                        Math.floor(
                            (px + 1) /
                            currentPhysicalGrid.width *
                            currentDetailGrid.width
                        )
                    );


                const startY =
                    Math.floor(
                        py /
                        currentPhysicalGrid.height *
                        currentDetailGrid.height
                    );


                const endY =
                    Math.max(
                        startY + 1,
                        Math.floor(
                            (py + 1) /
                            currentPhysicalGrid.height *
                            currentDetailGrid.height
                        )
                    );


                const local =
                    new Map();


                for (
                    let y = startY;
                    y < endY;
                    y++
                ) {

                    for (
                        let x = startX;
                        x < endX;
                        x++
                    ) {

                        const color =
                            currentDetailData[y]?.[x];


                        if (!color) {
                            continue;
                        }


                        local.set(
                            color,
                            (
                                local.get(color) ||
                                0
                            ) + 1
                        );
                    }
                }


                let bestColor = null;

                let bestCount = 0;


                local.forEach(
                    (count, color) => {

                        if (
                            count >
                            bestCount
                        ) {

                            bestCount =
                                count;

                            bestColor =
                                color;
                        }
                    }
                );


                if (bestColor) {

                    counts.set(
                        bestColor,
                        (
                            counts.get(bestColor) ||
                            0
                        ) + 1
                    );
                }
            }
        }


        palette.forEach(
            (hex, index) => {

                const normalized =
                    normalizeHex(hex);


                const count =
                    counts.get(
                        normalized
                    ) || 0;


                const itemY =
                    legendY +
                    25 +
                    Math.floor(index / 4) *
                    30;


                const itemX =
                    30 +
                    (index % 4) *
                    210;


                exportCtx.fillStyle =
                    normalized;


                exportCtx.fillRect(
                    itemX,
                    itemY - 12,
                    18,
                    18
                );


                exportCtx.strokeStyle =
                    "#77746d";


                exportCtx.strokeRect(
                    itemX,
                    itemY - 12,
                    18,
                    18
                );


                exportCtx.fillStyle =
                    "#f2f0ea";


                exportCtx.font =
                    "11px Arial";


                exportCtx.fillText(
                    `COLOR ${index + 1}`,
                    itemX + 27,
                    itemY
                );


                exportCtx.fillStyle =
                    "#77746d";


                exportCtx.fillText(
                    `${normalized} · ${count} GRID CELLS`,
                    itemX + 27,
                    itemY + 14
                );
            }
        );


        /* -----------------------------------------------------
           DOWNLOAD
           ----------------------------------------------------- */

        const link =
            document.createElement(
                "a"
            );


        link.download =
            `doch-rug-${width}x${height}cm-${GRID_CELL_CM}cm-grid-${colors}-colors.png`;


        link.href =
            exportCanvas.toDataURL(
                "image/png"
            );


        link.click();
    }


    /* =========================================================
       PROJECTOR MODE
       ========================================================= */

    function openProjectorMode() {

        if (
            !currentDetailData ||
            !currentDetailGrid ||
            !currentPhysicalGrid
        ) {

            alert(
                "Generate the rug first."
            );

            return;
        }


        const overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "projectorOverlay";


        overlay.style.cssText = `
            position:fixed;
            inset:0;
            z-index:99999;
            background:#11110f;
            display:flex;
            align-items:center;
            justify-content:center;
            overflow:hidden;
            font-family:Arial,sans-serif;
        `;


        const width =
            Math.round(
                Number(
                    widthInput.value
                ) || 100
            );


        const height =
            Math.round(
                Number(
                    heightInput.value
                ) || 75
            );


        const colors =
            customPalette.length ||
            numberOfColors;


        const ratio =
            width /
            height;


        /* -----------------------------------------------------
           PROJECTOR WORKSPACE
           ----------------------------------------------------- */

        const workspace =
            document.createElement(
                "div"
            );


        workspace.style.cssText = `
            position:relative;
            width:min(88vw,78vh * ${ratio});
            height:min(78vh,88vw / ${ratio});
            max-width:88vw;
            max-height:78vh;
        `;


        /* -----------------------------------------------------
           PHYSICAL GRID IMAGE
           ----------------------------------------------------- */

        const projectorCanvas =
            document.createElement(
                "canvas"
            );


        projectorCanvas.width =
            currentPhysicalGrid.width;


        projectorCanvas.height =
            currentPhysicalGrid.height;


        projectorCanvas.style.cssText = `
            position:absolute;
            inset:0;
            width:100%;
            height:100%;
            image-rendering:pixelated;
            object-fit:fill;
        `;


        const projectorCtx =
            projectorCanvas.getContext(
                "2d"
            );


        projectorCtx.imageSmoothingEnabled =
            false;


        /*
           Render physical 5 cm grid.
        */

        for (
            let py = 0;
            py < currentPhysicalGrid.height;
            py++
        ) {

            for (
                let px = 0;
                px < currentPhysicalGrid.width;
                px++
            ) {

                const startX =
                    Math.floor(
                        px /
                        currentPhysicalGrid.width *
                        currentDetailGrid.width
                    );


                const endX =
                    Math.max(
                        startX + 1,
                        Math.floor(
                            (px + 1) /
                            currentPhysicalGrid.width *
                            currentDetailGrid.width
                        )
                    );


                const startY =
                    Math.floor(
                        py /
                        currentPhysicalGrid.height *
                        currentDetailGrid.height
                    );


                const endY =
                    Math.max(
                        startY + 1,
                        Math.floor(
                            (py + 1) /
                            currentPhysicalGrid.height *
                            currentDetailGrid.height
                        )
                    );


                const local =
                    new Map();


                for (
                    let y = startY;
                    y < endY;
                    y++
                ) {

                    for (
                        let x = startX;
                        x < endX;
                        x++
                    ) {

                        const color =
                            currentDetailData[y]?.[x];


                        if (!color) {
                            continue;
                        }


                        local.set(
                            color,
                            (
                                local.get(color) ||
                                0
                            ) + 1
                        );
                    }
                }


                let bestColor =
                    null;

                let bestCount =
                    0;


                local.forEach(
                    (count, color) => {

                        if (
                            count >
                            bestCount
                        ) {

                            bestCount =
                                count;

                            bestColor =
                                color;
                        }
                    }
                );


                projectorCtx.fillStyle =
                    bestColor ||
                    "#11110f";


                projectorCtx.fillRect(
                    px,
                    py,
                    1,
                    1
                );
            }
        }


        workspace.appendChild(
            projectorCanvas
        );


        /* -----------------------------------------------------
           PHYSICAL GRID OVERLAY
           ----------------------------------------------------- */

        const gridOverlay =
            document.createElement(
                "div"
            );


        gridOverlay.style.cssText = `
            position:absolute;
            inset:0;
            display:grid;
            grid-template-columns:repeat(${currentPhysicalGrid.width},1fr);
            grid-template-rows:repeat(${currentPhysicalGrid.height},1fr);
            pointer-events:none;
        `;


        for (
            let i = 0;
            i <
            currentPhysicalGrid.width *
            currentPhysicalGrid.height;
            i++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.style.cssText = `
                box-sizing:border-box;
                border-right:1px solid rgba(255,255,255,.25);
                border-bottom:1px solid rgba(255,255,255,.25);
            `;


            gridOverlay.appendChild(
                cell
            );
        }


        workspace.appendChild(
            gridOverlay
        );


        /* -----------------------------------------------------
           BORDER
           ----------------------------------------------------- */

        const border =
            document.createElement(
                "div"
            );


        border.style.cssText = `
            position:absolute;
            inset:0;
            border:2px solid rgba(255,255,255,.75);
            pointer-events:none;
        `;


        workspace.appendChild(
            border
        );


        /* -----------------------------------------------------
           TOP LABELS
           ----------------------------------------------------- */

        const topLabels =
            document.createElement(
                "div"
            );


        topLabels.style.cssText = `
            position:absolute;
            left:0;
            right:0;
            top:-22px;
            height:18px;
            display:grid;
            grid-template-columns:repeat(${currentPhysicalGrid.width},1fr);
            color:rgba(255,255,255,.65);
            font-size:8px;
            line-height:18px;
            text-align:center;
            pointer-events:none;
        `;


        for (
            let x = 0;
            x < currentPhysicalGrid.width;
            x++
        ) {

            const label =
                document.createElement(
                    "span"
                );


            label.textContent =
                columnLabel(x);


            topLabels.appendChild(
                label
            );
        }


        workspace.appendChild(
            topLabels
        );


        /* -----------------------------------------------------
           LEFT LABELS
           ----------------------------------------------------- */

        const leftLabels =
            document.createElement(
                "div"
            );


        leftLabels.style.cssText = `
            position:absolute;
            left:-32px;
            top:0;
            bottom:0;
            width:25px;
            display:grid;
            grid-template-rows:repeat(${currentPhysicalGrid.height},1fr);
            color:rgba(255,255,255,.65);
            font-size:8px;
            line-height:1;
            text-align:right;
            pointer-events:none;
        `;


        for (
            let y = 0;
            y < currentPhysicalGrid.height;
            y++
        ) {

            const label =
                document.createElement(
                    "span"
                );


            label.textContent =
                y + 1;


            label.style.display =
                "flex";


            label.style.alignItems =
                "center";


            label.style.justifyContent =
                "flex-end";


            leftLabels.appendChild(
                label
            );
        }


        workspace.appendChild(
            leftLabels
        );


        overlay.appendChild(
            workspace
        );


        /* -----------------------------------------------------
           TOP INFO
           ----------------------------------------------------- */

        const info =
            document.createElement(
                "div"
            );


        info.style.cssText = `
            position:absolute;
            top:18px;
            left:22px;
            right:22px;
            display:flex;
            justify-content:space-between;
            align-items:center;
            pointer-events:none;
            font:10px Arial,sans-serif;
            color:#77746d;
            letter-spacing:.05em;
        `;


        info.innerHTML = `
            <span>
                DOCH / PROJECTOR MODE
            </span>

            <span>
                ${width} × ${height} CM
                · ${GRID_CELL_CM} × ${GRID_CELL_CM} CM GRID
                · ${currentPhysicalGrid.width} × ${currentPhysicalGrid.height}
                · DETAIL ${detailLevel}
            </span>
        `;


        overlay.appendChild(
            info
        );


        /* -----------------------------------------------------
           BOTTOM INFO
           ----------------------------------------------------- */

        const bottomInfo =
            document.createElement(
                "div"
            );


        bottomInfo.style.cssText = `
            position:absolute;
            left:22px;
            bottom:22px;
            color:#77746d;
            font:10px Arial,sans-serif;
            pointer-events:none;
        `;


        bottomInfo.textContent =
            `GRID / ${GRID_CELL_CM} × ${GRID_CELL_CM} CM / A–Z / ROWS`;


        overlay.appendChild(
            bottomInfo
        );


        /* -----------------------------------------------------
           EXIT
           ----------------------------------------------------- */

        const closeButton =
            document.createElement(
                "button"
            );


        closeButton.type =
            "button";


        closeButton.textContent =
            "EXIT PROJECTOR";


        closeButton.style.cssText = `
            position:absolute;
            right:22px;
            bottom:20px;
            min-height:44px;
            padding:0 16px;
            border:1px solid #77746d;
            background:#11110f;
            color:#f2f0ea;
            cursor:pointer;
            font:10px Arial,sans-serif;
            letter-spacing:.04em;
        `;


        function closeProjector() {

            overlay.remove();


            document.removeEventListener(
                "keydown",
                escapeHandler
            );


            if (
                document.fullscreenElement
            ) {

                document
                    .exitFullscreen()
                    .catch(
                        () => {}
                    );
            }
        }


        closeButton.addEventListener(
            "click",
            closeProjector
        );


        overlay.appendChild(
            closeButton
        );


        /* -----------------------------------------------------
           ESC
           ----------------------------------------------------- */

        function escapeHandler(
            event
        ) {

            if (
                event.key === "Escape"
            ) {

                closeProjector();
            }
        }


        document.addEventListener(
            "keydown",
            escapeHandler
        );


        document.body.appendChild(
            overlay
        );


        if (
            overlay.requestFullscreen
        ) {

            overlay
                .requestFullscreen()
                .catch(
                    () => {}
                );
        }
    }


    /* =========================================================
       GENERATE BUTTON
       ========================================================= */

    generateButton.addEventListener(
        "click",
        () => {

            if (!sourceImage) {

                imageInput.click();

                return;
            }


            generateRug();
        }
    );


    /* =========================================================
       INITIAL STATE
       ========================================================= */

    setupWorkspace();

    createDetailControl();


    generatedPalette =
        DEFAULT_PALETTE.slice(
            0,
            numberOfColors
        );


    renderPalette(
        generatedPalette
    );


    /*
       Initial values.
    */

    if (contrastValue && contrastInput) {

        contrastValue.textContent =
            contrastInput.value;
    }


    if (brightnessValue && brightnessInput) {

        brightnessValue.textContent =
            brightnessInput.value;
    }


    /*
       Initial physical grid information,
       even before image upload.
    */

    currentPhysicalGrid =
        calculatePhysicalGrid();


    /*
       Make sure the empty state is visible
       only when there is no image.
    */

    if (!sourceImage && canvas) {

        canvas.style.display =
            "none";
    }

})();
