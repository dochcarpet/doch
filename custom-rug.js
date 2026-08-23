/* =========================================================
   DOCH — CUSTOM RUG
   IMAGE → YARN → RUG
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

    const ctx =
        canvas.getContext("2d", {
            willReadFrequently: true
        });

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
       GRID / ZOOM ELEMENTS
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
       STATE
       --------------------------------------------------------- */

    let sourceImage = null;

    let originalRatio = 100 / 75;

    let numberOfColors = 4;

    let customPalette = [];

    let generatedPalette = [];

    let backgroundMode = "keep";

    let isGenerating = false;

    let currentGridData = null;

    let currentGrid = null;

    let zoomLevel = 1;

    let detailLevel = 80;


    /* ---------------------------------------------------------
       GRID SETTINGS
       --------------------------------------------------------- */

    const GRID_CELL_CM = 5;

    /*
       DETAIL controls the number of cells across the rug.

       10  = very coarse
       40  = coarse
       80  = medium
       120 = detailed
       180 = very detailed
       240 = very detailed
       300 = maximum

       Physical rug size DOES NOT change.
    */

    const MIN_GRID_WIDTH = 10;

    const MAX_GRID_WIDTH = 300;

    const MIN_GRID_HEIGHT = 10;

    const MAX_GRID_HEIGHT = 300;


    /* ---------------------------------------------------------
       ZOOM SETTINGS
       --------------------------------------------------------- */

    const MIN_ZOOM = 0.5;

    const MAX_ZOOM = 5;

    const ZOOM_STEP = 0.25;


    /* ---------------------------------------------------------
       SOURCE PROCESSING
       --------------------------------------------------------- */

    const MAX_SOURCE_SIZE = 500;


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


    /* ---------------------------------------------------------
       HELPERS
       --------------------------------------------------------- */

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
            hex
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


    /* ---------------------------------------------------------
       COLUMN LABELS
       --------------------------------------------------------- */

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


    /* ---------------------------------------------------------
       GRID LABELS
       --------------------------------------------------------- */

    function renderGridLabels(
        grid
    ) {

        if (
            !gridTopLabels ||
            !gridLeftLabels
        ) {
            return;
        }


        gridTopLabels.innerHTML = "";

        gridLeftLabels.innerHTML = "";


        for (
            let x = 0;
            x < grid.width;
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
            y < grid.height;
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


    /* ---------------------------------------------------------
       FIXED PREVIEW WORKSPACE
       --------------------------------------------------------- */

    function setupFixedWorkspace() {

        if (!rugWorkspace) {
            return;
        }


        /*
           The frame is the viewport.

           IMPORTANT:
           Do not let canvas dimensions determine
           the dimensions of the workspace.
        */

        rugWorkspace.style.position =
            "relative";

        rugWorkspace.style.boxSizing =
            "border-box";

        rugWorkspace.style.overflow =
            "hidden";

        rugWorkspace.style.minWidth =
            "0";

        rugWorkspace.style.minHeight =
            "0";


        /*
           The actual scrolling area is the canvas wrapper.
        */

        if (rugCanvasWrap) {

            rugCanvasWrap.style.boxSizing =
                "border-box";

            rugCanvasWrap.style.position =
                "relative";

            rugCanvasWrap.style.overflow =
                "auto";

            rugCanvasWrap.style.minWidth =
                "0";

            rugCanvasWrap.style.minHeight =
                "0";

            rugCanvasWrap.style.width =
                "100%";

            rugCanvasWrap.style.height =
                "100%";
        }


        /*
           Make sure the canvas itself can never
           force the parent frame to grow.
        */

        canvas.style.display =
            "none";

        canvas.style.maxWidth =
            "none";

        canvas.style.maxHeight =
            "none";

        canvas.style.flex =
            "none";
    }


    /* ---------------------------------------------------------
       DETAIL / GRID DENSITY CONTROL
       --------------------------------------------------------- */

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


        /*
           Fallback:
           climb up from width input until
           we find a reasonably large container.
        */

        let current =
            widthInput?.parentElement;


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
            widthInput?.closest(".panel") ||
            widthInput?.parentElement?.parentElement ||
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


            if (detailInput) {

                detailInput.min =
                    "10";

                detailInput.max =
                    "300";

                detailInput.step =
                    "10";

                detailInput.value =
                    String(detailLevel);
            }


            return;
        }


        const container =
            document.createElement("div");


        container.id =
            "rugDetailControl";


        /*
           IMPORTANT:
           Full width of the left panel.
           No width restriction from the size control.
        */

        container.style.cssText = `
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            margin: 18px 0 0;
            padding: 16px 0 0;
            border-top: 1px solid #292925;
            align-self: stretch;
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
                    font:10px 'DM Mono', monospace;
                    color:#f2f0ea;
                    letter-spacing:.04em;
                ">
                    DETAIL
                </span>

                <span
                    id="rugDetailValue"
                    style="
                        font:10px 'DM Mono', monospace;
                        color:#77746d;
                    "
                >
                    ${detailLevel}
                </span>
            </div>

            <input
                id="rugDetailInput"
                type="range"
                min="10"
                max="300"
                step="10"
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
                font:8px 'DM Mono', monospace;
                color:#55534e;
            ">
                <span>COARSE</span>
                <span>FINE</span>
            </div>
        `;


        const target =
            findLeftPanel();


        /*
           Append after the existing controls,
           but don't let the width control itself
           determine the width.
        */

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
                        10,
                        300
                    );


                detailValue.textContent =
                    `${detailLevel}`;


                if (sourceImage) {

                    generateRug();
                }
            }
        );
    }


    /* ---------------------------------------------------------
       ZOOM
       --------------------------------------------------------- */

    function updateZoom() {

        if (
            !currentGrid ||
            !rugWorkspace
        ) {
            return;
        }


        /*
           Screen representation only.

           Physical grid stays exactly the same.
        */

        const baseCellSize = 24;


        const cellSize =
            baseCellSize *
            zoomLevel;


        const visualWidth =
            currentGrid.width *
            cellSize;


        const visualHeight =
            currentGrid.height *
            cellSize;


        /*
           Canvas gets larger.

           The frame DOES NOT.
        */

        canvas.style.width =
            `${visualWidth}px`;

        canvas.style.height =
            `${visualHeight}px`;

        canvas.style.maxWidth =
            "none";

        canvas.style.maxHeight =
            "none";

        canvas.style.width =
            `${visualWidth}px`;

        canvas.style.height =
            `${visualHeight}px`;

        canvas.style.display =
            "block";

        canvas.style.flex =
            "none";


        /*
           Put the canvas inside the actual scrolling
           wrapper if one exists.
        */

        const scrollContainer =
            rugCanvasWrap ||
            rugWorkspace;


        if (scrollContainer) {

            scrollContainer.style.overflow =
                "auto";

            scrollContainer.style.minWidth =
                "0";

            scrollContainer.style.minHeight =
                "0";
        }


        /*
           Labels.
        */

        if (gridTopLabels) {

            gridTopLabels.style.width =
                `${visualWidth}px`;

            gridTopLabels.style.gridTemplateColumns =
                `repeat(${currentGrid.width}, ${cellSize}px)`;

            gridTopLabels.style.minWidth =
                `${visualWidth}px`;
        }


        if (gridLeftLabels) {

            gridLeftLabels.style.height =
                `${visualHeight}px`;

            gridLeftLabels.style.gridTemplateRows =
                `repeat(${currentGrid.height}, ${cellSize}px)`;

            gridLeftLabels.style.minHeight =
                `${visualHeight}px`;
        }


        if (zoomValue) {

            zoomValue.textContent =
                `${Math.round(zoomLevel * 100)}%`;
        }


        rugWorkspace.style.setProperty(
            "--cell-size",
            `${cellSize}px`
        );

        rugWorkspace.style.setProperty(
            "--grid-width",
            currentGrid.width
        );

        rugWorkspace.style.setProperty(
            "--grid-height",
            currentGrid.height
        );
    }


    if (zoomIn) {

        zoomIn.addEventListener(
            "click",
            () => {

                zoomLevel =
                    clamp(
                        zoomLevel + ZOOM_STEP,
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
                        zoomLevel - ZOOM_STEP,
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

                zoomLevel =
                    1;


                updateZoom();


                const scrollContainer =
                    rugCanvasWrap ||
                    rugWorkspace;


                if (scrollContainer) {

                    scrollContainer.scrollLeft =
                        0;

                    scrollContainer.scrollTop =
                        0;
                }
            }
        );
    }


    /* ---------------------------------------------------------
       COLOR LEGEND
       --------------------------------------------------------- */

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
                        ${count.toLocaleString()} LOOPS
                    </div>
                `;


                colorLegend.appendChild(
                    item
                );
            }
        );
    }


    /* ---------------------------------------------------------
       CREATE EXPORT CONTROLS
       --------------------------------------------------------- */

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
            font:10px "DM Mono", monospace;
            transition:.2s ease;
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
            font:10px "DM Mono", monospace;
            transition:.2s ease;
        `;


        downloadButton.addEventListener(
            "mouseenter",
            () => {

                downloadButton.style.borderColor =
                    "#f2f0ea";
            }
        );


        downloadButton.addEventListener(
            "mouseleave",
            () => {

                downloadButton.style.borderColor =
                    "#292925";
            }
        );


        projectorButton.addEventListener(
            "mouseenter",
            () => {

                projectorButton.style.background =
                    "#b9ff4a";
            }
        );


        projectorButton.addEventListener(
            "mouseleave",
            () => {

                projectorButton.style.background =
                    "#f2f0ea";
            }
        );


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


    /* ---------------------------------------------------------
       IMAGE UPLOAD
       --------------------------------------------------------- */

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


            fileName.textContent =
                file.name;


            const reader =
                new FileReader();


            reader.onload =
                event => {

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
                                lockRatio.checked
                            ) {

                                updateHeightFromWidth();
                            }


                            previewStatus.textContent =
                                "IMAGE LOADED";


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
                        event.target.result;
                };


            reader.readAsDataURL(
                file
            );
        }
    );


    /* ---------------------------------------------------------
       BACKGROUND
       --------------------------------------------------------- */

    keepBackground.addEventListener(
        "click",
        () => {

            backgroundMode =
                "keep";


            keepBackground.classList.add(
                "active"
            );


            removeBackground.classList.remove(
                "active"
            );


            if (sourceImage) {
                generateRug();
            }
        }
    );


    removeBackground.addEventListener(
        "click",
        () => {

            backgroundMode =
                "remove";


            removeBackground.classList.add(
                "active"
            );


            keepBackground.classList.remove(
                "active"
            );


            if (sourceImage) {
                generateRug();
            }
        }
    );


    /* ---------------------------------------------------------
       COLOR COUNT
       --------------------------------------------------------- */

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


    /* ---------------------------------------------------------
       PALETTE
       --------------------------------------------------------- */

    function renderPalette(
        palette
    ) {

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


    /* ---------------------------------------------------------
       SIZE
       --------------------------------------------------------- */

    function updateHeightFromWidth() {

        if (
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
                !lockRatio.checked
            ) {

                generateRug();
            }
        }
    );


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


    /* ---------------------------------------------------------
       BRIGHTNESS / CONTRAST
       --------------------------------------------------------- */

    contrastInput.addEventListener(
        "input",
        () => {

            contrastValue.textContent =
                contrastInput.value;


            if (sourceImage) {
                generateRug();
            }
        }
    );


    brightnessInput.addEventListener(
        "input",
        () => {

            brightnessValue.textContent =
                brightnessInput.value;


            if (sourceImage) {
                generateRug();
            }
        }
    );


    /* ---------------------------------------------------------
       PROCESS IMAGE
       --------------------------------------------------------- */

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
                brightnessInput.value
            );


        const contrast =
            Number(
                contrastInput.value
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


    /* ---------------------------------------------------------
       REMOVE BACKGROUND
       --------------------------------------------------------- */

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


        let background = {
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


    /* ---------------------------------------------------------
       PALETTE EXTRACTION
       --------------------------------------------------------- */

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


    /* ---------------------------------------------------------
       GRID
       --------------------------------------------------------- */

    function calculateGrid() {

        const rugWidth =
            Number(
                widthInput.value
            ) || 100;


        const rugHeight =
            Number(
                heightInput.value
            ) || 75;


        /*
           DETAIL = number of cells across
           the physical rug.

           Example:

           100 × 75 cm

           DETAIL 40
           → 40 × 30

           DETAIL 100
           → 100 × 75

           DETAIL 200
           → 200 × 150

           DETAIL 300
           → 300 × 225
        */

        let gridWidth =
            Math.round(
                detailLevel
            );


        let gridHeight =
            Math.round(
                gridWidth *
                rugHeight /
                rugWidth
            );


        gridWidth =
            clamp(
                gridWidth,
                MIN_GRID_WIDTH,
                MAX_GRID_WIDTH
            );


        gridHeight =
            clamp(
                gridHeight,
                MIN_GRID_HEIGHT,
                MAX_GRID_HEIGHT
            );


        return {
            width: gridWidth,
            height: gridHeight
        };
    }


    /* ---------------------------------------------------------
       CREATE GRID DATA
       --------------------------------------------------------- */

    function createGridImage(
        processed,
        grid
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


        /*
           Safety fallback.
        */

        if (!palette.length) {

            return output;
        }


        for (
            let gy = 0;
            gy < grid.height;
            gy++
        ) {

            const row = [];


            for (
                let gx = 0;
                gx < grid.width;
                gx++
            ) {

                const sx =
                    Math.floor(
                        gx /
                        grid.width *
                        sourceCanvas.width
                    );


                const sy =
                    Math.floor(
                        gy /
                        grid.height *
                        sourceCanvas.height
                    );


                const ex =
                    Math.max(
                        sx + 1,
                        Math.floor(
                            (gx + 1) /
                            grid.width *
                            sourceCanvas.width
                        )
                    );


                const ey =
                    Math.max(
                        sy + 1,
                        Math.floor(
                            (gy + 1) /
                            grid.height *
                            sourceCanvas.height
                        )
                    );


                let r = 0;

                let g = 0;

                let b = 0;

                let alpha = 0;

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


                        const a =
                            sourceData
                                .data[index + 3];


                        if (
                            a < 20
                        ) {
                            continue;
                        }


                        r +=
                            sourceData
                                .data[index];

                        g +=
                            sourceData
                                .data[index + 1];

                        b +=
                            sourceData
                                .data[index + 2];


                        alpha +=
                            a;


                        pixels++;
                    }
                }


                if (
                    !pixels ||
                    alpha === 0
                ) {

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


    function hexToRgbArray(
        palette
    ) {

        return palette.map(
            hexToRgb
        );
    }


    /* ---------------------------------------------------------
       DRAW PREVIEW
       --------------------------------------------------------- */

    function drawRug(
        gridData,
        grid
    ) {

        canvas.width =
            grid.width;


        canvas.height =
            grid.height;


        /*
           Internal canvas resolution is exactly
           the grid resolution.

           Visual dimensions are controlled separately
           by updateZoom().
        */

        canvas.style.imageRendering =
            "pixelated";


        canvas.style.objectFit =
            "fill";


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
            y < grid.height;
            y++
        ) {

            for (
                let x = 0;
                x < grid.width;
                x++
            ) {

                const color =
                    gridData[y][x];


                if (!color) {

                    ctx.fillStyle =
                        "#0e0e0c";


                    ctx.fillRect(
                        x,
                        y,
                        1,
                        1
                    );


                    continue;
                }


                ctx.fillStyle =
                    color;


                ctx.fillRect(
                    x,
                    y,
                    1,
                    1
                );
            }
        }


        renderGridLabels(
            grid
        );


        renderColorLegend(
            gridData,
            customPalette.length
                ? customPalette
                : generatedPalette
        );


        /*
           IMPORTANT:
           updateZoom changes only the canvas.
           It does NOT change the workspace.
        */

        updateZoom();
    }


    /* ---------------------------------------------------------
       STATS
       --------------------------------------------------------- */

    function updateStats(
        grid
    ) {

        const width =
            Number(
                widthInput.value
            ) || 100;


        const height =
            Number(
                heightInput.value
            ) || 75;


        const totalCells =
            grid.width *
            grid.height;


        statColors.textContent =
            customPalette.length ||
            numberOfColors;


        statSize.textContent =
            `${Math.round(width)} × ${Math.round(height)} CM`;


        statGrid.textContent =
            `${grid.width} × ${grid.height}`;


        statLoops.textContent =
            totalCells.toLocaleString();
    }


    /* ---------------------------------------------------------
       GENERATE
       --------------------------------------------------------- */

    function generateRug() {

        if (!sourceImage) {
            return;
        }


        if (isGenerating) {
            return;
        }


        isGenerating =
            true;


        previewStatus.textContent =
            "PROCESSING…";


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
                       Generate palette only when
                       user hasn't manually edited it.
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


                    const grid =
                        calculateGrid();


                    const gridData =
                        createGridImage(
                            processed,
                            grid
                        );


                    currentGridData =
                        gridData;


                    currentGrid =
                        grid;


                    drawRug(
                        gridData,
                        grid
                    );


                    updateStats(
                        grid
                    );


                    if (emptyPreview) {

                        emptyPreview.style.display =
                            "none";
                    }


                    canvas.style.display =
                        "block";


                    previewStatus.textContent =
                        "RUG READY";


                    createExportControls();

                } catch (error) {

                    console.error(
                        "Rug generation error:",
                        error
                    );


                    previewStatus.textContent =
                        "PROCESSING ERROR";

                } finally {

                    isGenerating =
                        false;
                }

            },
            20
        );
    }


    /* =========================================================
       DOWNLOAD PNG
       ========================================================= */

    function downloadRugPNG() {

        if (
            !currentGridData ||
            !currentGrid
        ) {

            alert(
                "Generate the rug first."
            );

            return;
        }


        const EXPORT_CELL_SIZE = 80;

        const LABEL_SIZE = 70;

        const TOP_INFO = 80;

        const LEGEND_HEIGHT =
            150;

        const BORDER = 2;


        const rugPixelWidth =
            currentGrid.width *
            EXPORT_CELL_SIZE;


        const rugPixelHeight =
            currentGrid.height *
            EXPORT_CELL_SIZE;


        const exportWidth =
            LABEL_SIZE +
            rugPixelWidth +
            30;


        const exportHeight =
            TOP_INFO +
            rugPixelHeight +
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


        /* BACKGROUND */

        exportCtx.fillStyle =
            "#11110f";


        exportCtx.fillRect(
            0,
            0,
            exportWidth,
            exportHeight
        );


        /* DATA */

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


        /* HEADER */

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
            `${width} × ${height} CM  ·  ${currentGrid.width} × ${currentGrid.height} CELLS  ·  ${colors} COLORS`,
            30,
            60
        );


        /* GRID POSITION */

        const gridX =
            LABEL_SIZE;


        const gridY =
            TOP_INFO;


        /* CELLS */

        for (
            let y = 0;
            y < currentGrid.height;
            y++
        ) {

            for (
                let x = 0;
                x < currentGrid.width;
                x++
            ) {

                const color =
                    currentGridData[y][x];


                exportCtx.fillStyle =
                    color ||
                    "#11110f";


                exportCtx.fillRect(
                    gridX +
                        x *
                        EXPORT_CELL_SIZE,

                    gridY +
                        y *
                        EXPORT_CELL_SIZE,

                    EXPORT_CELL_SIZE,

                    EXPORT_CELL_SIZE
                );
            }
        }


        /* GRID LINES */

        exportCtx.strokeStyle =
            "rgba(255,255,255,.22)";


        exportCtx.lineWidth =
            1;


        for (
            let x = 0;
            x <= currentGrid.width;
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
                rugPixelHeight
            );


            exportCtx.stroke();
        }


        for (
            let y = 0;
            y <= currentGrid.height;
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
                rugPixelWidth,
                py
            );


            exportCtx.stroke();
        }


        /* OUTER BORDER */

        exportCtx.strokeStyle =
            "#f2f0ea";


        exportCtx.lineWidth =
            BORDER;


        exportCtx.strokeRect(
            gridX,
            gridY,
            rugPixelWidth,
            rugPixelHeight
        );


        /* TOP COORDINATES */

        exportCtx.fillStyle =
            "#aaa79f";


        exportCtx.font =
            "11px Arial";


        exportCtx.textAlign =
            "center";


        for (
            let x = 0;
            x < currentGrid.width;
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
                gridY - 10
            );
        }


        /* LEFT COORDINATES */

        exportCtx.textAlign =
            "right";


        for (
            let y = 0;
            y < currentGrid.height;
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


        /* LEGEND */

        const legendY =
            gridY +
            rugPixelHeight +
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


        const counts =
            new Map();


        currentGridData.forEach(
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


                const itemY =
                    legendY +
                    25 +
                    Math.floor(index / 4) *
                    28;


                const itemX =
                    30 +
                    (index % 4) *
                    190;


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
                    `${normalized} · ${count.toLocaleString()} LOOPS`,
                    itemX + 27,
                    itemY + 14
                );
            }
        );


        /* DOWNLOAD */

        const link =
            document.createElement(
                "a"
            );


        link.download =
            `doch-rug-${width}x${height}cm-${colors}-colors-grid.png`;


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
            !currentGridData ||
            !currentGrid
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
            currentGrid.width /
            currentGrid.height;


        /* WORKSPACE */

        const workspace =
            document.createElement(
                "div"
            );


        workspace.style.cssText = `
            position:relative;
            width:min(92vw,82vh * ${ratio});
            height:min(82vh,92vw / ${ratio});
            max-width:92vw;
            max-height:82vh;
        `;


        /* CANVAS */

        const projectorCanvas =
            document.createElement(
                "canvas"
            );


        projectorCanvas.width =
            currentGrid.width;


        projectorCanvas.height =
            currentGrid.height;


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


        for (
            let y = 0;
            y < currentGrid.height;
            y++
        ) {

            for (
                let x = 0;
                x < currentGrid.width;
                x++
            ) {

                const color =
                    currentGridData[y][x];


                projectorCtx.fillStyle =
                    color ||
                    "#11110f";


                projectorCtx.fillRect(
                    x,
                    y,
                    1,
                    1
                );
            }
        }


        workspace.appendChild(
            projectorCanvas
        );


        /* GRID */

        const gridOverlay =
            document.createElement(
                "div"
            );


        gridOverlay.style.cssText = `
            position:absolute;
            inset:0;
            display:grid;
            grid-template-columns:repeat(${currentGrid.width},1fr);
            grid-template-rows:repeat(${currentGrid.height},1fr);
            pointer-events:none;
        `;


        for (
            let i = 0;
            i <
            currentGrid.width *
            currentGrid.height;
            i++
        ) {

            const cell =
                document.createElement(
                    "div"
                );


            cell.style.cssText = `
                border-right:1px solid rgba(255,255,255,.16);
                border-bottom:1px solid rgba(255,255,255,.16);
            `;


            gridOverlay.appendChild(
                cell
            );
        }


        workspace.appendChild(
            gridOverlay
        );


        /* BORDER */

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


        /* TOP LABELS */

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
            grid-template-columns:repeat(${currentGrid.width},1fr);
            color:rgba(255,255,255,.65);
            font-size:8px;
            line-height:18px;
            text-align:center;
            pointer-events:none;
        `;


        for (
            let x = 0;
            x < currentGrid.width;
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


        /* LEFT LABELS */

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
            grid-template-rows:repeat(${currentGrid.height},1fr);
            color:rgba(255,255,255,.65);
            font-size:8px;
            line-height:1;
            text-align:right;
            pointer-events:none;
        `;


        for (
            let y = 0;
            y < currentGrid.height;
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


        /* TOP INFO */

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
                · ${currentGrid.width} × ${currentGrid.height} CELLS
                · ${colors} COLORS
            </span>
        `;


        overlay.appendChild(
            info
        );


        /* BOTTOM INFO */

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


        /* EXIT */

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


        closeButton.addEventListener(
            "click",
            () => {

                overlay.remove();


                document.removeEventListener(
                    "keydown",
                    escapeHandler
                );


                if (
                    document.fullscreenElement
                ) {

                    document.exitFullscreen()
                        .catch(
                            () => {}
                        );
                }
            }
        );


        overlay.appendChild(
            closeButton
        );


        /* ESC */

        function escapeHandler(
            event
        ) {

            if (
                event.key === "Escape"
            ) {

                overlay.remove();


                document.removeEventListener(
                    "keydown",
                    escapeHandler
                );
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


    /* ---------------------------------------------------------
       GENERATE BUTTON
       --------------------------------------------------------- */

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


    /* ---------------------------------------------------------
       INITIAL STATE
       --------------------------------------------------------- */

    createDetailControl();


    generatedPalette =
        DEFAULT_PALETTE.slice(
            0,
            numberOfColors
        );


    renderPalette(
        generatedPalette
    );


    contrastValue.textContent =
        contrastInput.value;


    brightnessValue.textContent =
        brightnessInput.value;


    statColors.textContent =
        numberOfColors;


    if (zoomValue) {

        zoomValue.textContent =
            "100%";
    }


    setupFixedWorkspace();

})();
