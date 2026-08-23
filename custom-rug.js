/* =========================================================
   DOCH — CUSTOM RUG
   IMAGE → YARN → RUG

   DETAIL
   ---------------------------------------------------------
   Controls image processing resolution.

   10%  = coarse
   50%  = medium
   100% = maximum detail

   GRID
   ---------------------------------------------------------
   Physical transfer grid.
   Always based on GRID_CELL_CM.

   Example:
   100 × 75 cm
   5 cm cells
   = 20 × 15 physical cells

   DETAIL and GRID are completely independent.
   ========================================================= */

(() => {
    "use strict";


    /* =========================================================
       ELEMENTS
       ========================================================= */

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
        canvas
            ? canvas.getContext("2d", {
                willReadFrequently: true
            })
            : null;

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


    /* =========================================================
       STATE
       ========================================================= */

    let sourceImage = null;

    let originalRatio = 100 / 75;

    let numberOfColors = 4;

    let customPalette = [];

    let generatedPalette = [];

    let backgroundMode = "keep";

    let currentGridData = null;

    let currentGrid = null;

    let currentDetailData = null;

    let currentPreviewMode = "rug";

    let zoomLevel = 1;

    let detailLevel = 50;

    let isGenerating = false;

    let generationTimer = null;

    let detailInput = null;

    let detailValue = null;


    /* =========================================================
       SETTINGS
       ========================================================= */

    const GRID_CELL_CM = 5;

    /*
       DETAIL is now a percentage.

       10  = coarse
       50  = medium
       100 = fine
    */

    const MIN_DETAIL = 10;
    const MAX_DETAIL = 100;
    const DETAIL_STEP = 5;

    /*
       Maximum pixels used while processing source image.
    */

    const MAX_SOURCE_SIZE = 900;

    /*
       Maximum detail grid dimension.

       Prevents absurdly large 500×375 / 1000×750
       processing grids.
    */

    const MAX_DETAIL_WIDTH = 300;

    /*
       Zoom
    */

    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 5;
    const ZOOM_STEP = 0.25;

    /*
       Default preview cell size.

       This is only a rendering unit.
       It has NOTHING to do with physical rug cells.
    */

    const PREVIEW_CELL = 8;


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

    function clamp(value, min, max) {

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
                    .map(char => char + char)
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


    function rgbToHex(r, g, b) {

        return (
            "#" +
            [r, g, b]
                .map(value =>
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


    function normalizeHex(value) {

        value =
            String(value || "")
                .trim();

        if (!value.startsWith("#")) {
            value = "#" + value;
        }

        if (/^#[0-9a-fA-F]{3}$/.test(value)) {

            return (
                "#" +
                value[1] + value[1] +
                value[2] + value[2] +
                value[3] + value[3]
            ).toUpperCase();
        }

        if (/^#[0-9a-fA-F]{6}$/.test(value)) {
            return value.toUpperCase();
        }

        return "#000000";
    }


    function colorDistance(a, b) {

        const dr = a.r - b.r;
        const dg = a.g - b.g;
        const db = a.b - b.b;

        return Math.sqrt(
            dr * dr * 0.299 +
            dg * dg * 0.587 +
            db * db * 0.114
        );
    }


    function hexToRgbArray(palette) {
        return palette.map(hexToRgb);
    }


    function columnLabel(number) {

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

        const width =
            Number(widthInput?.value) || 100;

        const height =
            Number(heightInput?.value) || 75;

        return {

            width: Math.max(
                1,
                Math.round(
                    width /
                    GRID_CELL_CM
                )
            ),

            height: Math.max(
                1,
                Math.round(
                    height /
                    GRID_CELL_CM
                )
            )
        };
    }


    /* =========================================================
       DETAIL CONTROL
       ========================================================= */

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
                    MIN_DETAIL;

                detailInput.max =
                    MAX_DETAIL;

                detailInput.step =
                    DETAIL_STEP;

                detailInput.value =
                    detailLevel;
            }

            if (detailValue) {
                detailValue.textContent =
                    `${detailLevel}%`;
            }

            bindDetailInput();

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
                    ${detailLevel}%
                </span>
            </div>

            <input
                id="rugDetailInput"
                type="range"
                min="${MIN_DETAIL}"
                max="${MAX_DETAIL}"
                step="${DETAIL_STEP}"
                value="${detailLevel}"
                aria-label="Image detail"
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
                margin-top:7px;
                font:8px 'DM Mono',monospace;
                color:#55534e;
            ">
                <span>COARSE</span>
                <span>FINE</span>
            </div>
        `;


        let target = null;


        if (widthInput) {

            target =
                widthInput.closest(
                    ".controls-panel, .settings-panel, .left-panel, .sidebar, .controls, .control-panel"
                );
        }


        if (!target && widthInput) {

            target =
                widthInput.parentElement?.parentElement;
        }


        if (!target) {
            target = document.body;
        }


        target.appendChild(container);


        detailInput =
            document.getElementById(
                "rugDetailInput"
            );

        detailValue =
            document.getElementById(
                "rugDetailValue"
            );


        bindDetailInput();
    }


    function bindDetailInput() {

        if (
            !detailInput ||
            detailInput.dataset.bound === "true"
        ) {
            return;
        }


        detailInput.dataset.bound =
            "true";


        detailInput.addEventListener(
            "input",
            () => {

                detailLevel =
                    clamp(
                        Number(
                            detailInput.value
                        ) || 50,
                        MIN_DETAIL,
                        MAX_DETAIL
                    );


                if (detailValue) {

                    detailValue.textContent =
                        `${detailLevel}%`;
                }


                if (sourceImage) {
                    scheduleGeneration();
                }
            }
        );
    }


    /* =========================================================
       WORKSPACE
       ========================================================= */

    function setupWorkspace() {

        if (!rugWorkspace) {
            return;
        }


        rugWorkspace.style.position =
            "relative";

        rugWorkspace.style.width =
            "100%";

        rugWorkspace.style.height =
            "100%";

        rugWorkspace.style.minWidth =
            "0";

        rugWorkspace.style.minHeight =
            "0";

        rugWorkspace.style.overflow =
            "hidden";


        if (rugCanvasWrap) {

            rugCanvasWrap.style.position =
                "absolute";

            rugCanvasWrap.style.inset =
                "0";

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

            rugCanvasWrap.style.display =
                "flex";

            rugCanvasWrap.style.alignItems =
                "center";

            rugCanvasWrap.style.justifyContent =
                "center";

            rugCanvasWrap.style.padding =
                "28px";

            rugCanvasWrap.style.scrollbarGutter =
                "stable";
        }
    }


    /* =========================================================
       FIT PREVIEW
       ========================================================= */

    function getWorkspaceSize() {

        if (!rugCanvasWrap) {

            return {
                width: 900,
                height: 700
            };
        }


        return {

            width:
                Math.max(
                    100,
                    rugCanvasWrap.clientWidth -
                    56
                ),

            height:
                Math.max(
                    100,
                    rugCanvasWrap.clientHeight -
                    56
                )
        };
    }


    function getBasePreviewSize() {

        if (!currentDetailData) {

            return {
                width: 1,
                height: 1
            };
        }


        return {

            width:
                currentDetailData.width *
                PREVIEW_CELL,

            height:
                currentDetailData.height *
                PREVIEW_CELL
        };
    }


    function calculateFitZoom() {

        const workspace =
            getWorkspaceSize();

        const base =
            getBasePreviewSize();


        if (
            !base.width ||
            !base.height
        ) {
            return 1;
        }


        const fitX =
            workspace.width /
            base.width;

        const fitY =
            workspace.height /
            base.height;


        return clamp(
            Math.min(
                fitX,
                fitY,
                1
            ),
            MIN_ZOOM,
            1
        );
    }


    /* =========================================================
       SOURCE IMAGE PREVIEW
       ========================================================= */

    function showSourceImage() {

        if (
            !sourceImage ||
            !canvas ||
            !ctx
        ) {
            return;
        }


        const workspace =
            getWorkspaceSize();


        const imageWidth =
            sourceImage.naturalWidth;

        const imageHeight =
            sourceImage.naturalHeight;


        const fit =
            Math.min(
                workspace.width /
                    imageWidth,

                workspace.height /
                    imageHeight,

                1
            );


        const width =
            Math.max(
                1,
                Math.round(
                    imageWidth * fit
                )
            );


        const height =
            Math.max(
                1,
                Math.round(
                    imageHeight * fit
                )
            );


        canvas.width =
            width;

        canvas.height =
            height;


        canvas.style.position =
            "relative";

        canvas.style.left =
            "auto";

        canvas.style.top =
            "auto";

        canvas.style.width =
            `${width}px`;

        canvas.style.height =
            `${height}px`;

        canvas.style.maxWidth =
            "100%";

        canvas.style.maxHeight =
            "100%";

        canvas.style.imageRendering =
            "auto";

        canvas.style.display =
            "block";


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        ctx.imageSmoothingEnabled =
            true;


        ctx.drawImage(
            sourceImage,
            0,
            0,
            width,
            height
        );


        currentPreviewMode =
            "source";


        if (emptyPreview) {

            emptyPreview.style.display =
                "none";
        }


        if (previewStatus) {

            previewStatus.textContent =
                "IMAGE LOADED";
        }
    }


    /* =========================================================
       DETAIL GRID
       ========================================================= */

    function calculateDetailGrid() {

        const width =
            Number(widthInput?.value) || 100;

        const height =
            Number(heightInput?.value) || 75;


        /*
           Physical dimensions define aspect ratio.

           DETAIL controls how many processing cells
           are used across the width.
        */

        const minWidth =
            Math.max(
                20,
                calculatePhysicalGrid().width * 2
            );


        const maxWidth =
            Math.max(
                minWidth,
                MAX_DETAIL_WIDTH
            );


        const detailWidth =
            Math.round(
                minWidth +
                (
                    maxWidth -
                    minWidth
                ) *
                (
                    detailLevel -
                    MIN_DETAIL
                ) /
                (
                    MAX_DETAIL -
                    MIN_DETAIL
                )
            );


        const detailHeight =
            Math.max(
                1,
                Math.round(
                    detailWidth *
                    height /
                    width
                )
            );


        return {

            width:
                detailWidth,

            height:
                detailHeight
        };
    }


    /* =========================================================
       ZOOM
       ========================================================= */

    function updateZoom() {

        if (
            !canvas ||
            !currentDetailData
        ) {
            return;
        }


        const base =
            getBasePreviewSize();


        const width =
            base.width *
            zoomLevel;


        const height =
            base.height *
            zoomLevel;


        canvas.style.position =
            "relative";

        canvas.style.left =
            "auto";

        canvas.style.top =
            "auto";

        canvas.style.width =
            `${width}px`;

        canvas.style.height =
            `${height}px`;

        canvas.style.maxWidth =
            "none";

        canvas.style.maxHeight =
            "none";

        canvas.style.display =
            "block";

        canvas.style.imageRendering =
            "pixelated";


        if (zoomValue) {

            zoomValue.textContent =
                `${Math.round(
                    zoomLevel * 100
                )}%`;
        }


        if (rugCanvasWrap) {

            if (zoomLevel <= 1) {

                rugCanvasWrap.style.overflow =
                    "hidden";

            } else {

                rugCanvasWrap.style.overflow =
                    "auto";
            }
        }


        requestAnimationFrame(
            drawPhysicalGridOverlay
        );
    }


    function resetZoomToFit() {

        zoomLevel =
            calculateFitZoom();


        /*
           Never go below 50%.
        */

        zoomLevel =
            Math.max(
                MIN_ZOOM,
                zoomLevel
            );


        updateZoom();
    }


    /* =========================================================
       GRID LABELS
       ========================================================= */

    function renderGridLabels(grid) {

        if (
            !gridTopLabels ||
            !gridLeftLabels
        ) {
            return;
        }


        gridTopLabels.innerHTML =
            "";

        gridLeftLabels.innerHTML =
            "";


        for (
            let x = 0;
            x < grid.width;
            x++
        ) {

            const span =
                document.createElement(
                    "span"
                );


            span.textContent =
                columnLabel(x);


            gridTopLabels.appendChild(
                span
            );
        }


        for (
            let y = 0;
            y < grid.height;
            y++
        ) {

            const span =
                document.createElement(
                    "span"
                );


            span.textContent =
                String(y + 1);


            gridLeftLabels.appendChild(
                span
            );
        }
    }


    /* =========================================================
       PHYSICAL GRID OVERLAY
       ========================================================= */

    function drawPhysicalGridOverlay() {

        if (
            !rugCanvasWrap ||
            !currentDetailData ||
            !currentGrid
        ) {
            return;
        }


        let overlay =
            document.getElementById(
                "physicalGridOverlay"
            );


        if (!overlay) {

            overlay =
                document.createElement(
                    "div"
                );


            overlay.id =
                "physicalGridOverlay";


            overlay.style.cssText = `
                position:absolute;
                pointer-events:none;
                z-index:20;
                box-sizing:border-box;
            `;


            rugCanvasWrap.appendChild(
                overlay
            );
        }


        const base =
            getBasePreviewSize();


        const width =
            base.width *
            zoomLevel;

        const height =
            base.height *
            zoomLevel;


        /*
           IMPORTANT:

           Physical grid is calculated directly
           from physical grid dimensions.

           It does NOT depend on detail resolution.
        */

        const cellWidth =
            width /
            currentGrid.width;

        const cellHeight =
            height /
            currentGrid.height;


        overlay.style.width =
            `${width}px`;

        overlay.style.height =
            `${height}px`;


        overlay.style.left =
            "50%";

        overlay.style.top =
            "50%";

        overlay.style.transform =
            "translate(-50%, -50%)";


        overlay.style.backgroundImage = `
            linear-gradient(
                to right,
                rgba(255,255,255,.28) 1px,
                transparent 1px
            ),
            linear-gradient(
                to bottom,
                rgba(255,255,255,.28) 1px,
                transparent 1px
            )
        `;


        overlay.style.backgroundSize =
            `${cellWidth}px ${cellHeight}px`;


        overlay.style.border =
            "1px solid rgba(255,255,255,.65)";
    }


    /* =========================================================
       PROCESS SOURCE IMAGE
       ========================================================= */

    function processImage() {

        if (!sourceImage) {
            return null;
        }


        let width =
            sourceImage.naturalWidth;

        let height =
            sourceImage.naturalHeight;


        const scale =
            Math.min(
                MAX_SOURCE_SIZE / width,
                MAX_SOURCE_SIZE / height,
                1
            );


        width =
            Math.max(
                1,
                Math.round(
                    width * scale
                )
            );


        height =
            Math.max(
                1,
                Math.round(
                    height * scale
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
                brightnessInput?.value
            ) || 0;


        const contrast =
            Number(
                contrastInput?.value
            ) || 0;


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
                clamp(r, 0, 255);

            data[i + 1] =
                clamp(g, 0, 255);

            data[i + 2] =
                clamp(b, 0, 255);
        }


        tempCtx.putImageData(
            imageData,
            0,
            0
        );


        return {

            canvas:
                tempCanvas,

            imageData:
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


        const positions = [

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


        positions.forEach(
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

            const color = {

                r: data[i],

                g:
                    data[i + 1],

                b:
                    data[i + 2]
            };


            if (
                colorDistance(
                    color,
                    background
                ) < threshold
            ) {

                data[i + 3] =
                    0;
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


        for (
            let i = 0;
            i < data.length;
            i += 48
        ) {

            if (
                data[i + 3] < 30
            ) {
                continue;
            }


            const r =
                Math.floor(
                    data[i] / 16
                ) * 16;


            const g =
                Math.floor(
                    data[i + 1] / 16
                ) * 16;


            const b =
                Math.floor(
                    data[i + 2] / 16
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
                        b[1] - a[1]
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


        if (!sorted.length) {

            return DEFAULT_PALETTE.slice(
                0,
                count
            );
        }


        const result = [
            sorted[0]
        ];


        while (
            result.length < count &&
            result.length < sorted.length
        ) {

            let best = null;

            let bestScore =
                -Infinity;


            sorted.forEach(
                candidate => {

                    const duplicate =
                        result.some(
                            selected =>
                                colorDistance(
                                    selected,
                                    candidate
                                ) < 12
                        );


                    if (duplicate) {
                        return;
                    }


                    let minimum =
                        Infinity;


                    result.forEach(
                        selected => {

                            minimum =
                                Math.min(
                                    minimum,
                                    colorDistance(
                                        selected,
                                        candidate
                                    )
                                );
                        }
                    );


                    const score =
                        minimum +
                        Math.log(
                            candidate.weight + 1
                        ) * 3;


                    if (
                        score >
                        bestScore
                    ) {

                        bestScore =
                            score;

                        best =
                            candidate;
                    }
                }
            );


            if (!best) {
                break;
            }


            result.push(best);
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


        const palette =
            hexToRgbArray(
                customPalette.length
                    ? customPalette
                    : generatedPalette
            );


        const output = [];


        if (!palette.length) {
            return output;
        }


        for (
            let y = 0;
            y < detailGrid.height;
            y++
        ) {

            const row = [];


            for (
                let x = 0;
                x < detailGrid.width;
                x++
            ) {

                const sx =
                    Math.floor(
                        x /
                        detailGrid.width *
                        sourceCanvas.width
                    );


                const sy =
                    Math.floor(
                        y /
                        detailGrid.height *
                        sourceCanvas.height
                    );


                const ex =
                    Math.max(
                        sx + 1,
                        Math.floor(
                            (
                                x + 1
                            ) /
                            detailGrid.width *
                            sourceCanvas.width
                        )
                    );


                const ey =
                    Math.max(
                        sy + 1,
                        Math.floor(
                            (
                                y + 1
                            ) /
                            detailGrid.height *
                            sourceCanvas.height
                        )
                    );


                let r = 0;
                let g = 0;
                let b = 0;
                let pixels = 0;


                for (
                    let py = sy;
                    py < ey;
                    py++
                ) {

                    for (
                        let px = sx;
                        px < ex;
                        px++
                    ) {

                        const index =
                            (
                                py *
                                sourceCanvas.width +
                                px
                            ) * 4;


                        const alpha =
                            sourceData.data[
                                index + 3
                            ];


                        if (
                            alpha < 20
                        ) {
                            continue;
                        }


                        r +=
                            sourceData.data[
                                index
                            ];

                        g +=
                            sourceData.data[
                                index + 1
                            ];

                        b +=
                            sourceData.data[
                                index + 2
                            ];

                        pixels++;
                    }
                }


                if (!pixels) {

                    row.push(null);

                    continue;
                }


                const average = {

                    r:
                        r / pixels,

                    g:
                        g / pixels,

                    b:
                        b / pixels
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


            output.push(row);
        }


        return output;
    }


    /* =========================================================
       DRAW DETAIL PREVIEW
       ========================================================= */

    function drawDetailPreview(
        data,
        detailGrid
    ) {

        if (
            !canvas ||
            !ctx
        ) {
            return;
        }


        canvas.width =
            detailGrid.width;

        canvas.height =
            detailGrid.height;


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
                    data[y]?.[x];


                ctx.fillStyle =
                    color ||
                    "#11110f";


                ctx.fillRect(
                    x,
                    y,
                    1,
                    1
                );
            }
        }


        currentDetailData =
            detailGrid;


        currentPreviewMode =
            "rug";


        /*
           IMPORTANT:
           after every regeneration the image
           automatically fits the available workspace.
        */

        zoomLevel =
            calculateFitZoom();


        updateZoom();


        if (emptyPreview) {

            emptyPreview.style.display =
                "none";
        }
    }


    /* =========================================================
       COLOR LEGEND
       ========================================================= */

    function renderColorLegend(
        data,
        palette
    ) {

        if (!colorLegend) {
            return;
        }


        colorLegend.innerHTML =
            "";


        const counts =
            new Map();


        data.forEach(
            row => {

                row.forEach(
                    color => {

                        if (!color) {
                            return;
                        }


                        counts.set(
                            color,
                            (
                                counts.get(
                                    color
                                ) || 0
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
                        ${
                            (
                                counts.get(
                                    normalized
                                ) || 0
                            ).toLocaleString()
                        } CELLS
                    </div>
                `;


                colorLegend.appendChild(
                    item
                );
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


                    const text =
                        paletteElement.querySelector(
                            `.palette-hex[data-palette-index="${index}"]`
                        );


                    if (text) {

                        text.value =
                            event.target.value
                                .toUpperCase();
                    }


                    if (sourceImage) {
                        scheduleGeneration();
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


                    const color =
                        paletteElement.querySelector(
                            `.palette-color[data-palette-index="${index}"]`
                        );


                    if (color) {
                        color.value =
                            value;
                    }


                    if (sourceImage) {
                        scheduleGeneration();
                    }
                }
            }
        );


        paletteElement.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-palette-delete]"
                    );


                if (!button) {
                    return;
                }


                const index =
                    Number(
                        button.dataset
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
                    scheduleGeneration();
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

                    scheduleGeneration();

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
       IMAGE UPLOAD
       ========================================================= */

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            event => {

                const file =
                    event.target.files?.[0];


                if (!file) {
                    return;
                }


                if (
                    !file.type.startsWith(
                        "image/"
                    )
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
                                    lockRatio?.checked
                                ) {

                                    updateHeightFromWidth();
                                }


                                /*
                                   SHOW ORIGINAL IMAGE.

                                   This remains visible until
                                   rug generation actually finishes.
                                */

                                showSourceImage();


                                /*
                                   Generate after browser had a chance
                                   to paint the uploaded image.
                                */

                                scheduleGeneration(
                                    50
                                );
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


                reader.readAsDataURL(file);
            }
        );
    }


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


                removeBackground?.classList.remove(
                    "active"
                );


                if (sourceImage) {
                    scheduleGeneration();
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


                keepBackground?.classList.remove(
                    "active"
                );


                if (sourceImage) {
                    scheduleGeneration();
                }
            }
        );
    }


    /* =========================================================
       COLORS
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


                colorCounts
                    .querySelectorAll(
                        "button"
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

                    scheduleGeneration();

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
            !lockRatio?.checked
        ) {
            return;
        }


        const width =
            Number(
                widthInput?.value
            );


        if (
            !width ||
            !originalRatio
        ) {
            return;
        }


        heightInput.value =
            Math.max(
                1,
                Math.round(
                    width /
                    originalRatio
                )
            );
    }


    if (widthInput) {

        widthInput.addEventListener(
            "input",
            () => {

                updateHeightFromWidth();


                if (sourceImage) {
                    scheduleGeneration();
                }
            }
        );
    }


    if (heightInput) {

        heightInput.addEventListener(
            "input",
            () => {

                if (
                    sourceImage &&
                    !lockRatio?.checked
                ) {

                    scheduleGeneration();
                }
            }
        );
    }


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
                    scheduleGeneration();
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
                    scheduleGeneration();
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
                    scheduleGeneration();
                }
            }
        );
    }


    /* =========================================================
       STATS
       ========================================================= */

    function updateStats() {

        const width =
            Number(
                widthInput?.value
            ) || 100;


        const height =
            Number(
                heightInput?.value
            ) || 75;


        const grid =
            calculatePhysicalGrid();


        const colors =
            customPalette.length ||
            numberOfColors;


        if (statColors) {

            statColors.textContent =
                colors;
        }


        if (statSize) {

            statSize.textContent =
                `${Math.round(width)} × ${Math.round(height)} CM`;
        }


        if (statGrid) {

            statGrid.textContent =
                `${grid.width} × ${grid.height}`;
        }


        if (statLoops) {

            statLoops.textContent =
                currentDetailData
                    ? (
                        currentDetailData.width *
                        currentDetailData.height
                    ).toLocaleString()
                    : "0";
        }
    }


    /* =========================================================
       GENERATION SCHEDULER
       ========================================================= */

    function scheduleGeneration(
        delay = 80
    ) {

        clearTimeout(
            generationTimer
        );


        generationTimer =
            setTimeout(
                generateRug,
                delay
            );
    }


    /* =========================================================
       GENERATE
       ========================================================= */

    function generateRug() {

        if (
            !sourceImage ||
            isGenerating
        ) {
            return;
        }


        isGenerating =
            true;


        if (previewStatus) {

            previewStatus.textContent =
                "PROCESSING…";
        }


        /*
           Keep source image visible while processing.

           This is especially important when DETAIL
           is high and processing takes some time.
        */

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
                       Generate palette only if
                       user has not manually edited it.
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
                       DETAIL
                    */

                    const detailGrid =
                        calculateDetailGrid();


                    const detailData =
                        createDetailImage(
                            processed,
                            detailGrid
                        );


                    /*
                       PHYSICAL GRID
                    */

                    currentGrid =
                        calculatePhysicalGrid();


                    currentGridData =
                        detailData;


                    currentDetailData =
                        detailGrid;


                    drawDetailPreview(
                        detailData,
                        detailGrid
                    );


                    renderGridLabels(
                        currentGrid
                    );


                    renderColorLegend(
                        detailData,

                        customPalette.length
                            ? customPalette
                            : generatedPalette
                    );


                    updateStats();


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
       PREVIEW RESIZE
       ========================================================= */

    let resizeTimer = null;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    () => {

                        if (
                            currentPreviewMode ===
                            "source"
                        ) {

                            showSourceImage();

                        } else if (
                            currentDetailData
                        ) {

                            /*
                               Keep the current zoom
                               if user intentionally zoomed.

                               Otherwise fit automatically.
                            */

                            if (
                                zoomLevel <= 1
                            ) {

                                zoomLevel =
                                    calculateFitZoom();
                            }


                            updateZoom();
                        }

                    },
                    100
                );
        }
    );


    /* =========================================================
       MOUSE WHEEL ZOOM
       ========================================================= */

    if (rugCanvasWrap) {

        rugCanvasWrap.addEventListener(
            "wheel",
            event => {

                if (
                    currentPreviewMode !==
                    "rug"
                ) {
                    return;
                }


                /*
                   CTRL / CMD + wheel:
                   browser-style zoom.

                   Plain wheel:
                   zoom too, because this is the
                   rug workspace.
                */

                event.preventDefault();


                const direction =
                    event.deltaY < 0
                        ? 1
                        : -1;


                zoomLevel =
                    clamp(
                        zoomLevel +
                        direction *
                        ZOOM_STEP,

                        MIN_ZOOM,

                        MAX_ZOOM
                    );


                updateZoom();
            },
            {
                passive: false
            }
        );
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

                resetZoomToFit();
            }
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
            document.createElement(
                "div"
            );


        container.id =
            "rugExportControls";


        container.style.cssText = `
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:8px;
            margin-top:12px;
        `;


        const downloadButton =
            document.createElement(
                "button"
            );


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
            document.createElement(
                "button"
            );


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
            !currentGridData ||
            !currentGrid
        ) {

            alert(
                "Generate the rug first."
            );

            return;
        }


        const CELL = 40;

        const LABEL = 55;

        const HEADER = 90;

        const LEGEND = 150;


        const width =
            Math.round(
                Number(
                    widthInput?.value
                ) || 100
            );


        const height =
            Math.round(
                Number(
                    heightInput?.value
                ) || 75
            );


        const colors =
            customPalette.length ||
            numberOfColors;


        const imageWidth =
            currentDetailData.width *
            CELL;


        const imageHeight =
            currentDetailData.height *
            CELL;


        const exportWidth =
            LABEL +
            imageWidth +
            40;


        const exportHeight =
            HEADER +
            imageHeight +
            LEGEND;


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


        exportCtx.fillStyle =
            "#11110f";


        exportCtx.fillRect(
            0,
            0,
            exportWidth,
            exportHeight
        );


        /*
           HEADER
        */

        exportCtx.fillStyle =
            "#f2f0ea";


        exportCtx.font =
            "bold 22px Arial";


        exportCtx.fillText(
            "DOCH / RUG GRID",
            25,
            32
        );


        exportCtx.fillStyle =
            "#77746d";


        exportCtx.font =
            "12px Arial";


        exportCtx.fillText(
            `${width} × ${height} CM · ${currentGrid.width} × ${currentGrid.height} GRID · ${GRID_CELL_CM} CM CELL · ${colors} COLORS · DETAIL ${detailLevel}%`,
            25,
            58
        );


        const gridX =
            LABEL;


        const gridY =
            HEADER;


        /*
           DETAIL IMAGE
        */

        for (
            let y = 0;
            y < currentDetailData.height;
            y++
        ) {

            for (
                let x = 0;
                x < currentDetailData.width;
                x++
            ) {

                exportCtx.fillStyle =
                    currentGridData[y][x] ||
                    "#11110f";


                exportCtx.fillRect(
                    gridX +
                    x * CELL,

                    gridY +
                    y * CELL,

                    CELL,
                    CELL
                );
            }
        }


        /*
           PHYSICAL GRID
        */

        const physicalCellWidth =
            imageWidth /
            currentGrid.width;


        const physicalCellHeight =
            imageHeight /
            currentGrid.height;


        exportCtx.strokeStyle =
            "rgba(255,255,255,.32)";


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
                physicalCellWidth +
                0.5;


            exportCtx.beginPath();


            exportCtx.moveTo(
                px,
                gridY
            );


            exportCtx.lineTo(
                px,
                gridY +
                imageHeight
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
                physicalCellHeight +
                0.5;


            exportCtx.beginPath();


            exportCtx.moveTo(
                gridX,
                py
            );


            exportCtx.lineTo(
                gridX +
                imageWidth,
                py
            );


            exportCtx.stroke();
        }


        /*
           BORDER
        */

        exportCtx.strokeStyle =
            "#f2f0ea";


        exportCtx.lineWidth =
            2;


        exportCtx.strokeRect(
            gridX,
            gridY,
            imageWidth,
            imageHeight
        );


        /*
           TOP LABELS
        */

        exportCtx.fillStyle =
            "#aaa79f";


        exportCtx.font =
            "10px Arial";


        exportCtx.textAlign =
            "center";


        for (
            let x = 0;
            x < currentGrid.width;
            x++
        ) {

            const center =
                gridX +
                x *
                physicalCellWidth +
                physicalCellWidth / 2;


            exportCtx.fillText(
                columnLabel(x),
                center,
                gridY - 10
            );
        }


        /*
           LEFT LABELS
        */

        exportCtx.textAlign =
            "right";


        for (
            let y = 0;
            y < currentGrid.height;
            y++
        ) {

            const center =
                gridY +
                y *
                physicalCellHeight +
                physicalCellHeight / 2;


            exportCtx.fillText(
                String(y + 1),
                gridX - 8,
                center + 3
            );
        }


        /*
           LEGEND
        */

        const legendY =
            gridY +
            imageHeight +
            30;


        exportCtx.textAlign =
            "left";


        exportCtx.fillStyle =
            "#f2f0ea";


        exportCtx.font =
            "bold 12px Arial";


        exportCtx.fillText(
            "COLOR LEGEND",
            25,
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
                                counts.get(
                                    color
                                ) || 0
                            ) + 1
                        );
                    }
                );
            }
        );


        const palette =
            customPalette.length
                ? customPalette
                : generatedPalette;


        palette.forEach(
            (hex, index) => {

                const normalized =
                    normalizeHex(hex);


                const itemX =
                    25 +
                    (
                        index % 4
                    ) *
                    190;


                const itemY =
                    legendY +
                    25 +
                    Math.floor(
                        index / 4
                    ) *
                    30;


                exportCtx.fillStyle =
                    normalized;


                exportCtx.fillRect(
                    itemX,
                    itemY - 11,
                    18,
                    18
                );


                exportCtx.strokeStyle =
                    "#77746d";


                exportCtx.strokeRect(
                    itemX,
                    itemY - 11,
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
                    `${normalized} · ${(counts.get(normalized) || 0).toLocaleString()}`,
                    itemX + 27,
                    itemY + 14
                );
            }
        );


        const link =
            document.createElement(
                "a"
            );


        link.download =
            `doch-rug-${width}x${height}cm-${currentGrid.width}x${currentGrid.height}-grid-detail-${detailLevel}.png`;


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
                    widthInput?.value
                ) || 100
            );


        const height =
            Math.round(
                Number(
                    heightInput?.value
                ) || 75
            );


        const ratio =
            width /
            height;


        const workspace =
            document.createElement(
                "div"
            );


        workspace.style.cssText = `
            position:relative;
            width:min(90vw,80vh * ${ratio});
            height:min(80vh,90vw / ${ratio});
        `;


        const projectorCanvas =
            document.createElement(
                "canvas"
            );


        projectorCanvas.width =
            currentDetailData.width;


        projectorCanvas.height =
            currentDetailData.height;


        projectorCanvas.style.cssText = `
            position:absolute;
            inset:0;
            width:100%;
            height:100%;
            image-rendering:pixelated;
        `;


        const projectorCtx =
            projectorCanvas.getContext(
                "2d"
            );


        projectorCtx.imageSmoothingEnabled =
            false;


        for (
            let y = 0;
            y < currentDetailData.height;
            y++
        ) {

            for (
                let x = 0;
                x < currentDetailData.width;
                x++
            ) {

                projectorCtx.fillStyle =
                    currentGridData[y][x] ||
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


        /*
           PHYSICAL GRID
        */

        const gridOverlay =
            document.createElement(
                "div"
            );


        gridOverlay.style.cssText = `
            position:absolute;
            inset:0;
            pointer-events:none;
            background-image:
                linear-gradient(
                    to right,
                    rgba(255,255,255,.28) 1px,
                    transparent 1px
                ),
                linear-gradient(
                    to bottom,
                    rgba(255,255,255,.28) 1px,
                    transparent 1px
                );
            background-size:
                ${100 / currentGrid.width}%
                ${100 / currentGrid.height}%;
            border:2px solid rgba(255,255,255,.8);
            box-sizing:border-box;
        `;


        workspace.appendChild(
            gridOverlay
        );


        /*
           GRID LABELS
        */

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


            label.style.cssText = `
                position:absolute;
                top:-18px;
                left:${(
                    x +
                    0.5
                ) * (
                    100 /
                    currentGrid.width
                )}%;
                transform:translateX(-50%);
                color:#aaa79f;
                font:9px Arial;
                pointer-events:none;
            `;


            workspace.appendChild(
                label
            );
        }


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
                String(y + 1);


            label.style.cssText = `
                position:absolute;
                left:-22px;
                top:${(
                    y +
                    0.5
                ) * (
                    100 /
                    currentGrid.height
                )}%;
                transform:translateY(-50%);
                color:#aaa79f;
                font:9px Arial;
                pointer-events:none;
            `;


            workspace.appendChild(
                label
            );
        }


        overlay.appendChild(
            workspace
        );


        /*
           INFO
        */

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
            color:#77746d;
            font:10px Arial,sans-serif;
        `;


        info.innerHTML = `
            <span>
                DOCH / PROJECTOR MODE
            </span>

            <span>
                ${width} × ${height} CM
                · ${currentGrid.width} × ${currentGrid.height} GRID
                · ${GRID_CELL_CM} CM CELL
                · DETAIL ${detailLevel}%
            </span>
        `;


        overlay.appendChild(
            info
        );


        /*
           EXIT
        */

        const close =
            document.createElement(
                "button"
            );


        close.textContent =
            "EXIT PROJECTOR";


        close.style.cssText = `
            position:absolute;
            right:22px;
            bottom:20px;
            min-height:44px;
            padding:0 16px;
            border:1px solid #77746d;
            background:#11110f;
            color:#f2f0ea;
            cursor:pointer;
            font:10px Arial;
        `;


        close.onclick =
            () => {

                if (
                    document.fullscreenElement
                ) {

                    document
                        .exitFullscreen()
                        .catch(() => {});
                }


                overlay.remove();
            };


        overlay.appendChild(
            close
        );


        document.body.appendChild(
            overlay
        );


        if (
            overlay.requestFullscreen
        ) {

            overlay
                .requestFullscreen()
                .catch(() => {});
        }
    }


    /* =========================================================
       GENERATE BUTTON
       ========================================================= */

    if (generateButton) {

        generateButton.addEventListener(
            "click",
            () => {

                if (!sourceImage) {

                    imageInput?.click();

                    return;
                }


                scheduleGeneration(0);
            }
        );
    }


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


    if (
        contrastValue &&
        contrastInput
    ) {

        contrastValue.textContent =
            contrastInput.value;
    }


    if (
        brightnessValue &&
        brightnessInput
    ) {

        brightnessValue.textContent =
            brightnessInput.value;
    }


    /*
       Default background button state.
    */

    if (keepBackground) {
        keepBackground.classList.add(
            "active"
        );
    }


    /*
       Default zoom.
    */

    if (zoomValue) {
        zoomValue.textContent =
            "100%";
    }

})();
