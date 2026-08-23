/* =========================================================
   DOCH — CUSTOM RUG
   IMAGE → YARN → RUG

   IMPORTANT:
   ---------------------------------------------------------
   PHYSICAL GRID
   - ALWAYS 5 × 5 CM
   - 100 × 100 CM = 20 × 20 cells
   - 100 × 75 CM  = 20 × 15 cells
   - DOES NOT CHANGE WITH DETAIL

   DETAIL
   - controls number of visual pixels INSIDE the rug
   - does NOT change physical grid
   - does NOT enlarge the frame

   PIXEL SHAPE
   - 0   = square
   - 100 = rounded

   PREVIEW
   - entire rug fits inside preview automatically
   - no mandatory scrolling
   - zoom buttons can enlarge it manually
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
       CONSTANTS
       ========================================================= */

    const GRID_CELL_CM = 5;

    const MIN_DETAIL = 20;
    const MAX_DETAIL = 500;

    const DEFAULT_DETAIL = 80;

    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 4;
    const ZOOM_STEP = 0.25;

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
       STATE
       ========================================================= */

    let sourceImage = null;

    let originalRatio = 4 / 3;

    let numberOfColors = 4;

    let generatedPalette = [];

    let customPalette = [];

    let backgroundMode = "keep";

    let detailLevel = DEFAULT_DETAIL;

    let pixelRoundness = 0;

    let currentDetailData = null;

    let currentGrid = null;

    let zoomLevel = 1;

    let isGenerating = false;

    let renderQueued = false;

    let resizeTimer = null;


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

        hex = String(hex || "")
            .replace("#", "")
            .trim();

        if (hex.length === 3) {
            hex = hex
                .split("")
                .map(x => x + x)
                .join("");
        }

        const n = parseInt(hex, 16);

        return {
            r: (n >> 16) & 255,
            g: (n >> 8) & 255,
            b: n & 255
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
                )
                .join("")
                .toUpperCase()
        );
    }


    function normalizeHex(value) {

        value = String(value || "").trim();

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


    function columnLabel(index) {

        let result = "";
        let n = index + 1;

        while (n > 0) {

            const remainder =
                (n - 1) % 26;

            result =
                String.fromCharCode(
                    65 + remainder
                ) + result;

            n =
                Math.floor(
                    (n - 1) / 26
                );
        }

        return result;
    }


    /* =========================================================
       PHYSICAL GRID
       ========================================================= */

    function calculatePhysicalGrid() {

        const width =
            Math.max(
                1,
                Number(widthInput?.value) || 100
            );

        const height =
            Math.max(
                1,
                Number(heightInput?.value) || 75
            );

        return {
            width: Math.max(
                1,
                Math.round(
                    width / GRID_CELL_CM
                )
            ),

            height: Math.max(
                1,
                Math.round(
                    height / GRID_CELL_CM
                )
            )
        };
    }


    /* =========================================================
       DETAIL GRID
       =========================================================
       
       DETAIL is NOT physical grid.

       We use a sensible amount of visual cells and preserve
       the rug aspect ratio.

       The resulting detail image is then rendered INTO the
       fixed physical frame.
       ========================================================= */

    function calculateDetailGrid() {

        const width =
            Math.max(
                1,
                Number(widthInput?.value) || 100
            );

        const height =
            Math.max(
                1,
                Number(heightInput?.value) || 75
            );

        const detailWidth =
            clamp(
                Math.round(detailLevel),
                MIN_DETAIL,
                MAX_DETAIL
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
            width: detailWidth,
            height: detailHeight
        };
    }


    /* =========================================================
       CONTROLS
       ========================================================= */

    function styleSlider(input) {

        if (!input) {
            return;
        }

        input.style.width = "100%";
        input.style.boxSizing = "border-box";
        input.style.cursor = "pointer";
    }


    function createExtraControls() {

        /*
           Remove controls from previous version if they exist.
        */

        document
            .getElementById("rugShapeControl")
            ?.remove();

        document
            .getElementById("rugDetailControl")
            ?.remove();


        if (!paletteElement) {
            return;
        }


        /*
           -----------------------------------------------------
           PIXEL SHAPE
           -----------------------------------------------------
        */

        const shapeBlock =
            document.createElement("div");

        shapeBlock.id =
            "rugShapeControl";

        shapeBlock.className =
            "control-section";

        shapeBlock.innerHTML = `
            <div class="section-label">
                <span>04A</span>
                PIXEL SHAPE
            </div>

            <div style="
                display:grid;
                grid-template-columns:1fr auto;
                gap:10px;
                align-items:center;
            ">

                <input
                    id="rugShapeInput"
                    type="range"
                    min="0"
                    max="100"
                    value="${pixelRoundness}"
                    step="1"
                >

                <output
                    id="rugShapeValue"
                    style="
                        min-width:90px;
                        text-align:right;
                        font-family:'DM Mono',monospace;
                        font-size:10px;
                    "
                >
                    SQUARE
                </output>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                margin-top:6px;
                font-family:'DM Mono',monospace;
                font-size:8px;
                opacity:.5;
            ">
                <span>SQUARE</span>
                <span>ROUNDED</span>
            </div>
        `;


        /*
           IMPORTANT:
           Put immediately after palette block.
        */

        const paletteSection =
            paletteElement.closest(
                ".control-section"
            );


        if (paletteSection) {

            paletteSection.after(
                shapeBlock
            );

        } else {

            paletteElement.after(
                shapeBlock
            );
        }


        const shapeInput =
            document.getElementById(
                "rugShapeInput"
            );

        const shapeValue =
            document.getElementById(
                "rugShapeValue"
            );


        styleSlider(shapeInput);


        shapeInput.addEventListener(
            "input",
            () => {

                pixelRoundness =
                    Number(
                        shapeInput.value
                    ) || 0;

                updateShapeLabel(
                    shapeValue
                );

                renderPreview();
            }
        );


        /*
           -----------------------------------------------------
           DETAIL
           -----------------------------------------------------
        */

        const detailBlock =
            document.createElement("div");

        detailBlock.id =
            "rugDetailControl";

        detailBlock.className =
            "control-section";

        detailBlock.innerHTML = `
            <div class="section-label">
                <span>04B</span>
                DETAIL
            </div>

            <div style="
                display:grid;
                grid-template-columns:1fr auto;
                gap:10px;
                align-items:center;
            ">

                <input
                    id="rugDetailInput"
                    type="range"
                    min="${MIN_DETAIL}"
                    max="${MAX_DETAIL}"
                    value="${detailLevel}"
                    step="10"
                >

                <output
                    id="rugDetailValue"
                    style="
                        min-width:90px;
                        text-align:right;
                        font-family:'DM Mono',monospace;
                        font-size:10px;
                    "
                >
                    ${detailLevel}
                </output>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                margin-top:6px;
                font-family:'DM Mono',monospace;
                font-size:8px;
                opacity:.5;
            ">
                <span>COARSE</span>
                <span>FINE</span>
            </div>

            <p class="control-note">
                Changes image detail only. The physical
                5 × 5 CM grid never changes.
            </p>
        `;


        shapeBlock.after(
            detailBlock
        );


        const detailInput =
            document.getElementById(
                "rugDetailInput"
            );

        const detailValue =
            document.getElementById(
                "rugDetailValue"
            );


        styleSlider(detailInput);


        detailInput.addEventListener(
            "input",
            () => {

                detailLevel =
                    clamp(
                        Number(
                            detailInput.value
                        ) || DEFAULT_DETAIL,
                        MIN_DETAIL,
                        MAX_DETAIL
                    );

                detailValue.textContent =
                    detailLevel;

                queueGenerate();
            }
        );
    }


    function updateShapeLabel(element) {

        if (!element) {
            return;
        }

        if (pixelRoundness <= 5) {
            element.textContent = "SQUARE";
        } else if (pixelRoundness < 30) {
            element.textContent = "SLIGHT";
        } else if (pixelRoundness < 60) {
            element.textContent = "ROUNDED";
        } else if (pixelRoundness < 85) {
            element.textContent = "VERY ROUNDED";
        } else {
            element.textContent = "MAXIMUM";
        }
    }


    /* =========================================================
       WORKSPACE
       ========================================================= */

    function setupWorkspace() {

        if (!rugWorkspace) {
            return;
        }


        /*
           The workspace itself is the physical rug frame.
           It must not grow because DETAIL grows.
        */

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

        rugWorkspace.style.boxSizing =
            "border-box";


        if (rugCanvasWrap) {

            rugCanvasWrap.style.position =
                "absolute";

            rugCanvasWrap.style.left =
                "0";

            rugCanvasWrap.style.top =
                "0";

            rugCanvasWrap.style.width =
                "100%";

            rugCanvasWrap.style.height =
                "100%";

            rugCanvasWrap.style.overflow =
                "hidden";

            rugCanvasWrap.style.minWidth =
                "0";

            rugCanvasWrap.style.minHeight =
                "0";

            rugCanvasWrap.style.boxSizing =
                "border-box";
        }


        if (canvas) {

            canvas.style.position =
                "absolute";

            canvas.style.left =
                "0";

            canvas.style.top =
                "0";

            canvas.style.display =
                "none";

            canvas.style.maxWidth =
                "none";

            canvas.style.maxHeight =
                "none";
        }
    }


    /* =========================================================
       IMAGE LOAD
       ========================================================= */

    function showLoadedImage() {

        if (
            !sourceImage ||
            !canvas ||
            !rugCanvasWrap
        ) {
            return;
        }


        /*
           Before generation we show the original image.
        */

        const rect =
            getAvailableFrame();


        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return;
        }


        const imageRatio =
            sourceImage.naturalWidth /
            sourceImage.naturalHeight;


        let drawWidth =
            rect.width;

        let drawHeight =
            drawWidth /
            imageRatio;


        if (drawHeight > rect.height) {

            drawHeight =
                rect.height;

            drawWidth =
                drawHeight *
                imageRatio;
        }


        const x =
            (rect.width - drawWidth) / 2;

        const y =
            (rect.height - drawHeight) / 2;


        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        canvas.width =
            Math.max(
                1,
                Math.round(
                    drawWidth * dpr
                )
            );

        canvas.height =
            Math.max(
                1,
                Math.round(
                    drawHeight * dpr
                )
            );


        canvas.style.width =
            `${drawWidth}px`;

        canvas.style.height =
            `${drawHeight}px`;

        canvas.style.left =
            `${x}px`;

        canvas.style.top =
            `${y}px`;

        canvas.style.display =
            "block";


        const ctx =
            canvas.getContext("2d");


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        ctx.clearRect(
            0,
            0,
            drawWidth,
            drawHeight
        );


        ctx.drawImage(
            sourceImage,
            0,
            0,
            drawWidth,
            drawHeight
        );


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
       AVAILABLE FRAME
       ========================================================= */

    function getAvailableFrame() {

        if (!rugWorkspace) {

            return {
                width: 600,
                height: 450
            };
        }


        const rect =
            rugWorkspace.getBoundingClientRect();


        return {
            width: Math.max(
                1,
                rect.width
            ),

            height: Math.max(
                1,
                rect.height
            )
        };
    }


    /* =========================================================
       IMAGE PROCESSING
       ========================================================= */

    function processSourceImage() {

        if (!sourceImage) {
            return null;
        }


        const maxSize =
            900;


        let width =
            sourceImage.naturalWidth;

        let height =
            sourceImage.naturalHeight;


        const scale =
            Math.min(
                maxSize / width,
                maxSize / height,
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


        const temp =
            document.createElement(
                "canvas"
            );


        temp.width =
            width;

        temp.height =
            height;


        const tempCtx =
            temp.getContext(
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


        applyImageAdjustments(
            imageData
        );


        tempCtx.putImageData(
            imageData,
            0,
            0
        );


        if (
            backgroundMode === "remove"
        ) {

            removeBackgroundPixels(
                imageData
            );

            tempCtx.putImageData(
                imageData,
                0,
                0
            );
        }


        return {
            canvas: temp,
            imageData
        };
    }


    /* =========================================================
       IMAGE ADJUSTMENTS
       ========================================================= */

    function applyImageAdjustments(
        imageData
    ) {

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


        const brightnessAmount =
            brightness * 2.55;


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
                data[i] +
                brightnessAmount;

            let g =
                data[i + 1] +
                brightnessAmount;

            let b =
                data[i + 2] +
                brightnessAmount;


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
    }


    /* =========================================================
       BACKGROUND REMOVAL
       ========================================================= */

    function removeBackgroundPixels(
        imageData
    ) {

        const data =
            imageData.data;

        const width =
            imageData.width;

        const height =
            imageData.height;


        const points = [
            0,

            (width - 1) * 4,

            (
                (height - 1) *
                width
            ) * 4,

            (
                (
                    (height - 1) *
                    width
                ) +
                width -
                1
            ) * 4
        ];


        const bg = {
            r: 0,
            g: 0,
            b: 0
        };


        points.forEach(index => {

            bg.r += data[index];
            bg.g += data[index + 1];
            bg.b += data[index + 2];
        });


        bg.r /= 4;
        bg.g /= 4;
        bg.b /= 4;


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


            if (
                colorDistance(
                    current,
                    bg
                ) < threshold
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


        /*
           Sample every ~20th pixel.
           This is enough for palette extraction and much faster.
        */

        for (
            let i = 0;
            i < data.length;
            i += 80
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
                    buckets.get(key) || 0
                ) + 1
            );
        }


        const sorted =
            [...buckets.entries()]
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )
                .slice(0, 80)
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

            let best =
                null;

            let bestScore =
                -Infinity;


            for (
                const candidate of sorted
            ) {

                const duplicate =
                    result.some(
                        selected =>
                            colorDistance(
                                selected,
                                candidate
                            ) < 12
                    );


                if (duplicate) {
                    continue;
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
       CREATE DETAIL MAP
       ========================================================= */

    function createDetailMap(
        processed,
        detailGrid,
        palette
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


        const rgbPalette =
            palette.map(hexToRgb);


        const output =
            new Array(
                detailGrid.height
            );


        for (
            let y = 0;
            y < detailGrid.height;
            y++
        ) {

            const row =
                new Array(
                    detailGrid.width
                );


            const sy =
                Math.floor(
                    y /
                    detailGrid.height *
                    sourceCanvas.height
                );


            const ey =
                Math.max(
                    sy + 1,
                    Math.floor(
                        (y + 1) /
                        detailGrid.height *
                        sourceCanvas.height
                    )
                );


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


                const ex =
                    Math.max(
                        sx + 1,
                        Math.floor(
                            (x + 1) /
                            detailGrid.width *
                            sourceCanvas.width
                    )
                );


                let r = 0;
                let g = 0;
                let b = 0;
                let count = 0;


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
                            alpha < 30
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

                        count++;
                    }
                }


                if (!count) {

                    row[x] = null;

                    continue;
                }


                const average = {
                    r: r / count,
                    g: g / count,
                    b: b / count
                };


                let nearest =
                    rgbPalette[0];

                let nearestDistance =
                    Infinity;


                for (
                    const color of rgbPalette
                ) {

                    const distance =
                        colorDistance(
                            average,
                            color
                        );


                    if (
                        distance <
                        nearestDistance
                    ) {

                        nearestDistance =
                            distance;

                        nearest =
                            color;
                    }
                }


                row[x] =
                    rgbToHex(
                        nearest.r,
                        nearest.g,
                        nearest.b
                    );
            }


            output[y] =
                row;
        }


        return output;
    }


    /* =========================================================
       ROUNDED CELL
       ========================================================= */

    function drawCell(
        ctx,
        x,
        y,
        width,
        height,
        color,
        roundness
    ) {

        if (!color) {
            return;
        }


        ctx.fillStyle =
            color;


        const t =
            clamp(
                roundness / 100,
                0,
                1
            );


        /*
           The gap is subtle.
           At 0 cells touch.
           At 100 they look like rounded
           tuft/punch-needle pixels.
        */

        const gap =
            Math.min(
                width,
                height
            ) *
            0.22 *
            t;


        const x1 =
            x + gap / 2;

        const y1 =
            y + gap / 2;

        const w =
            Math.max(
                0.1,
                width - gap
            );

        const h =
            Math.max(
                0.1,
                height - gap
            );


        const radius =
            Math.min(
                w,
                h
            ) *
            0.5 *
            Math.pow(t, 0.72);


        ctx.beginPath();


        if (
            typeof ctx.roundRect ===
            "function"
        ) {

            ctx.roundRect(
                x1,
                y1,
                w,
                h,
                radius
            );

            ctx.fill();

            return;
        }


        /*
           Fallback for older browsers.
        */

        ctx.moveTo(
            x1 + radius,
            y1
        );

        ctx.lineTo(
            x1 + w - radius,
            y1
        );

        ctx.quadraticCurveTo(
            x1 + w,
            y1,
            x1 + w,
            y1 + radius
        );

        ctx.lineTo(
            x1 + w,
            y1 + h - radius
        );

        ctx.quadraticCurveTo(
            x1 + w,
            y1 + h,
            x1 + w - radius,
            y1 + h
        );

        ctx.lineTo(
            x1 + radius,
            y1 + h
        );

        ctx.quadraticCurveTo(
            x1,
            y1 + h,
            x1,
            y1 + h - radius
        );

        ctx.lineTo(
            x1,
            y1 + radius
        );

        ctx.quadraticCurveTo(
            x1,
            y1,
            x1 + radius,
            y1
        );

        ctx.closePath();

        ctx.fill();
    }


    /* =========================================================
       RENDER RUG
       ========================================================= */

    function renderPreview() {

        if (
            !canvas ||
            !currentDetailData ||
            !currentGrid
        ) {
            return;
        }


        const frame =
            getAvailableFrame();


        if (
            frame.width <= 5 ||
            frame.height <= 5
        ) {
            return;
        }


        /*
           -----------------------------------------------------
           IMPORTANT:
           The physical frame is based ONLY on the rug ratio.
           DETAIL never changes it.
           -----------------------------------------------------
        */

        const physicalRatio =
            currentGrid.width /
            currentGrid.height;


        let frameWidth =
            frame.width;

        let frameHeight =
            frameWidth /
            physicalRatio;


        if (
            frameHeight >
            frame.height
        ) {

            frameHeight =
                frame.height;

            frameWidth =
                frameHeight *
                physicalRatio;
        }


        /*
           Small safety margin so the border is not clipped.
        */

        frameWidth =
            Math.max(
                10,
                frameWidth - 4
            );

        frameHeight =
            Math.max(
                10,
                frameHeight - 4
            );


        /*
           Manual zoom.
           At 100% = FIT.
        */

        const visualWidth =
            frameWidth *
            zoomLevel;

        const visualHeight =
            frameHeight *
            zoomLevel;


        /*
           Center when fit.
           When zoomed, keep the image inside
           the scroll-free workspace as much as possible.
        */

        let left =
            (frame.width -
                visualWidth) / 2;

        let top =
            (frame.height -
                visualHeight) / 2;


        if (zoomLevel > 1) {

            left =
                Math.max(
                    0,
                    (frame.width -
                        visualWidth) / 2
                );

            top =
                Math.max(
                    0,
                    (frame.height -
                        visualHeight) / 2
                );
        }


        /*
           High-resolution backing canvas,
           but dimensions are based on PHYSICAL
           frame size, NOT DETAIL size.
        */

        const dpr =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        canvas.width =
            Math.max(
                1,
                Math.round(
                    visualWidth * dpr
                )
            );

        canvas.height =
            Math.max(
                1,
                Math.round(
                    visualHeight * dpr
                )
            );


        canvas.style.width =
            `${visualWidth}px`;

        canvas.style.height =
            `${visualHeight}px`;

        canvas.style.left =
            `${left}px`;

        canvas.style.top =
            `${top}px`;

        canvas.style.display =
            "block";


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        ctx.clearRect(
            0,
            0,
            visualWidth,
            visualHeight
        );


        /*
           -----------------------------------------------------
           BACKGROUND
           -----------------------------------------------------
        */

        ctx.fillStyle =
            "#11110f";

        ctx.fillRect(
            0,
            0,
            visualWidth,
            visualHeight
        );


        /*
           -----------------------------------------------------
           DETAIL CELLS
           -----------------------------------------------------

           We map the detail grid INTO the fixed physical
           rectangle.

           Therefore:
             20×20 physical grid stays 20×20.
             DETAIL 20 / 100 / 500 only changes the
             visual subdivisions.
        */

        const data =
            currentDetailData.data;


        const detailWidth =
            currentDetailData.width;

        const detailHeight =
            currentDetailData.height;


        const cellWidth =
            visualWidth /
            detailWidth;

        const cellHeight =
            visualHeight /
            detailHeight;


        for (
            let y = 0;
            y < detailHeight;
            y++
        ) {

            const row =
                data[y];


            for (
                let x = 0;
                x < detailWidth;
                x++
            ) {

                const color =
                    row[x];


                drawCell(
                    ctx,
                    x * cellWidth,
                    y * cellHeight,
                    cellWidth,
                    cellHeight,
                    color,
                    pixelRoundness
                );
            }
        }


        /*
           -----------------------------------------------------
           PHYSICAL GRID
           -----------------------------------------------------

           This is ALWAYS based on currentGrid.
           currentGrid is ALWAYS width / 5 and height / 5.
        */

        drawPhysicalGrid(
            ctx,
            visualWidth,
            visualHeight
        );


        /*
           Border.
        */

        ctx.strokeStyle =
            "rgba(255,255,255,.8)";

        ctx.lineWidth =
            1.5;

        ctx.strokeRect(
            0.75,
            0.75,
            visualWidth - 1.5,
            visualHeight - 1.5
        );


        if (zoomValue) {

            zoomValue.textContent =
                `${Math.round(
                    zoomLevel * 100
                )}%`;
        }


        renderGridLabels();


        updateStats();
    }


    /* =========================================================
       PHYSICAL GRID
       ========================================================= */

    function drawPhysicalGrid(
        ctx,
        width,
        height
    ) {

        if (!currentGrid) {
            return;
        }


        const cellWidth =
            width /
            currentGrid.width;

        const cellHeight =
            height /
            currentGrid.height;


        ctx.save();


        ctx.strokeStyle =
            "rgba(255,255,255,.32)";

        ctx.lineWidth =
            1;


        /*
           Vertical.
        */

        for (
            let x = 1;
            x < currentGrid.width;
            x++
        ) {

            const px =
                Math.round(
                    x * cellWidth
                ) + 0.5;


            ctx.beginPath();

            ctx.moveTo(
                px,
                0
            );

            ctx.lineTo(
                px,
                height
            );

            ctx.stroke();
        }


        /*
           Horizontal.
        */

        for (
            let y = 1;
            y < currentGrid.height;
            y++
        ) {

            const py =
                Math.round(
                    y * cellHeight
                ) + 0.5;


            ctx.beginPath();

            ctx.moveTo(
                0,
                py
            );

            ctx.lineTo(
                width,
                py
            );

            ctx.stroke();
        }


        ctx.restore();
    }


    /* =========================================================
       GRID LABELS
       ========================================================= */

    function renderGridLabels() {

        if (
            !gridTopLabels ||
            !gridLeftLabels ||
            !currentGrid
        ) {
            return;
        }


        gridTopLabels.innerHTML =
            "";

        gridLeftLabels.innerHTML =
            "";


        /*
           The labels are positioned relative to the
           physical frame.
        */

        const frame =
            getAvailableFrame();


        const ratio =
            currentGrid.width /
            currentGrid.height;


        let width =
            frame.width;

        let height =
            width / ratio;


        if (
            height >
            frame.height
        ) {

            height =
                frame.height;

            width =
                height * ratio;
        }


        width =
            Math.max(
                1,
                width - 4
            );

        height =
            Math.max(
                1,
                height - 4
            );


        const left =
            (frame.width -
                width) / 2;

        const top =
            (frame.height -
                height) / 2;


        /*
           Labels are only useful when they fit.
           The CSS remains responsible for their appearance.
        */

        gridTopLabels.style.position =
            "absolute";

        gridTopLabels.style.left =
            `${left}px`;

        gridTopLabels.style.top =
            `${Math.max(
                0,
                top - 18
            )}px`;

        gridTopLabels.style.width =
            `${width}px`;

        gridTopLabels.style.height =
            "16px";

        gridTopLabels.style.display =
            "flex";

        gridTopLabels.style.justifyContent =
            "space-around";

        gridTopLabels.style.pointerEvents =
            "none";


        gridLeftLabels.style.position =
            "absolute";

        gridLeftLabels.style.left =
            `${Math.max(
                0,
                left - 22
            )}px`;

        gridLeftLabels.style.top =
            `${top}px`;

        gridLeftLabels.style.width =
            "20px";

        gridLeftLabels.style.height =
            `${height}px`;

        gridLeftLabels.style.display =
            "flex";

        gridLeftLabels.style.flexDirection =
            "column";

        gridLeftLabels.style.justifyContent =
            "space-around";

        gridLeftLabels.style.pointerEvents =
            "none";


        for (
            let x = 0;
            x < currentGrid.width;
            x++
        ) {

            const span =
                document.createElement(
                    "span"
                );

            span.textContent =
                columnLabel(x);

            span.style.textAlign =
                "center";

            gridTopLabels.appendChild(
                span
            );
        }


        for (
            let y = 0;
            y < currentGrid.height;
            y++
        ) {

            const span =
                document.createElement(
                    "span"
                );

            span.textContent =
                String(y + 1);

            span.style.textAlign =
                "center";

            gridLeftLabels.appendChild(
                span
            );
        }
    }


    /* =========================================================
       PALETTE UI
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


    /* =========================================================
       PALETTE EVENTS
       ========================================================= */

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

                    customPalette[
                        Number(index)
                    ] =
                        normalizeHex(
                            event.target.value
                        );


                    const text =
                        paletteElement.querySelector(
                            `.palette-hex[data-palette-index="${index}"]`
                        );


                    if (text) {

                        text.value =
                            customPalette[
                                Number(index)
                            ];
                    }


                    queueGenerate();
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

                    const normalized =
                        normalizeHex(
                            event.target.value
                        );


                    customPalette[
                        Number(index)
                    ] =
                        normalized;


                    event.target.value =
                        normalized;


                    const color =
                        paletteElement.querySelector(
                            `.palette-color[data-palette-index="${index}"]`
                        );


                    if (color) {
                        color.value =
                            normalized;
                    }


                    queueGenerate();
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
                        [...generatedPalette];
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


                generatedPalette =
                    [...customPalette];


                renderPalette(
                    generatedPalette
                );


                queueGenerate();
            }
        );
    }


    /* =========================================================
       RESET PALETTE
       ========================================================= */

    if (resetPalette) {

        resetPalette.addEventListener(
            "click",
            () => {

                customPalette =
                    [];


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


                const objectUrl =
                    URL.createObjectURL(
                        file
                    );


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
                           THIS FIXES the "image doesn't load"
                           feeling: show it immediately.
                        */

                        showLoadedImage();


                        if (previewStatus) {

                            previewStatus.textContent =
                                "IMAGE LOADED";
                        }


                        /*
                           Generate after browser paints
                           the uploaded image.
                        */

                        requestAnimationFrame(
                            () => {

                                generateRug();
                            }
                        );


                        URL.revokeObjectURL(
                            objectUrl
                        );
                    };


                img.onerror =
                    () => {

                        URL.revokeObjectURL(
                            objectUrl
                        );


                        alert(
                            "Could not load this image."
                        );
                    };


                img.src =
                    objectUrl;
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


                removeBackground
                    ?.classList.remove(
                        "active"
                    );


                queueGenerate();
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


                keepBackground
                    ?.classList.remove(
                        "active"
                    );


                queueGenerate();
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


                customPalette =
                    [];


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

                queueGenerate();
            }
        );
    }


    if (heightInput) {

        heightInput.addEventListener(
            "input",
            () => {

                queueGenerate();
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


                queueGenerate();
            }
        );
    }


    /* =========================================================
       CONTRAST / BRIGHTNESS
       ========================================================= */

    if (contrastInput) {

        contrastInput.addEventListener(
            "input",
            () => {

                if (contrastValue) {

                    contrastValue.textContent =
                        contrastInput.value;
                }


                queueGenerate();
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


                queueGenerate();
            }
        );
    }


    /* =========================================================
       GENERATION QUEUE
       ========================================================= */

    function queueGenerate() {

        if (!sourceImage) {
            return;
        }


        if (renderQueued) {
            return;
        }


        renderQueued =
            true;


        requestAnimationFrame(
            () => {

                renderQueued =
                    false;

                generateRug();
            }
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
           Use timeout so UI can paint PROCESSING first.
        */

        setTimeout(
            () => {

                try {

                    const processed =
                        processSourceImage();


                    if (!processed) {
                        return;
                    }


                    /*
                       Palette.
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


                    const palette =
                        customPalette.length
                            ? customPalette
                            : generatedPalette;


                    /*
                       DETAIL GRID.

                       Example:
                       DETAIL = 80
                       SIZE = 100 × 100

                       => detail image roughly 80 × 80

                       But physical grid remains:
                       20 × 20
                    */

                    const detailGrid =
                        calculateDetailGrid();


                    const detailData =
                        createDetailMap(
                            processed,
                            detailGrid,
                            palette
                        );


                    currentDetailData = {
                        width:
                            detailGrid.width,

                        height:
                            detailGrid.height,

                        data:
                            detailData
                    };


                    /*
                       PHYSICAL GRID.

                       100 × 100:
                       20 × 20

                       100 × 75:
                       20 × 15

                       ALWAYS 5 CM.
                    */

                    currentGrid =
                        calculatePhysicalGrid();


                    /*
                       Render.
                    */

                    renderPreview();


                    renderColorLegend(
                        detailData,
                        palette
                    );


                    updateStats();


                    if (emptyPreview) {

                        emptyPreview.style.display =
                            "none";
                    }


                    if (previewStatus) {

                        previewStatus.textContent =
                            "RUG READY";
                    }


                    createExportControls();

                } catch (error) {

                    console.error(
                        "DOCH rug generation error:",
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
            10
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


        if (statColors) {

            statColors.textContent =
                customPalette.length ||
                numberOfColors;
        }


        if (statSize) {

            statSize.textContent =
                `${width} × ${height} CM`;
        }


        if (
            statGrid &&
            currentGrid
        ) {

            statGrid.textContent =
                `${currentGrid.width} × ${currentGrid.height}`;
        }


        if (
            statLoops &&
            currentDetailData
        ) {

            statLoops.textContent =
                (
                    currentDetailData.width *
                    currentDetailData.height
                ).toLocaleString();
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
       ZOOM
       ========================================================= */

    function applyZoom() {

        if (!currentDetailData) {
            return;
        }


        renderPreview();
    }


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


                applyZoom();
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


                applyZoom();
            }
        );
    }


    if (zoomReset) {

        zoomReset.addEventListener(
            "click",
            () => {

                /*
                   100% means FIT TO FRAME.
                */

                zoomLevel =
                    1;

                applyZoom();
            }
        );
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


                generateRug();
            }
        );
    }


    /* =========================================================
       RESIZE
       ========================================================= */

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
                            currentDetailData
                        ) {

                            renderPreview();

                        } else if (
                            sourceImage
                        ) {

                            showLoadedImage();
                        }

                    },
                    100
                );
        }
    );


    /* =========================================================
       EXPORT
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
            !currentGrid
        ) {

            alert(
                "Generate the rug first."
            );

            return;
        }


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


        /*
           Export detail resolution is intentionally
           independent from physical grid resolution.
        */

        const CELL =
            20;

        const LABEL =
            55;

        const HEADER =
            90;

        const LEGEND =
            150;


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


        const out =
            document.createElement(
                "canvas"
            );


        out.width =
            exportWidth;

        out.height =
            exportHeight;


        const ctx =
            out.getContext(
                "2d"
            );


        ctx.fillStyle =
            "#11110f";

        ctx.fillRect(
            0,
            0,
            exportWidth,
            exportHeight
        );


        /*
           Header.
        */

        ctx.fillStyle =
            "#f2f0ea";

        ctx.font =
            "bold 22px Arial";

        ctx.fillText(
            "DOCH / RUG GRID",
            25,
            32
        );


        ctx.fillStyle =
            "#77746d";

        ctx.font =
            "12px Arial";

        ctx.fillText(
            `${width} × ${height} CM · ${currentGrid.width} × ${currentGrid.height} GRID · ${GRID_CELL_CM} CM CELL · ${numberOfColors} COLORS · DETAIL ${detailLevel} · SHAPE ${pixelRoundness}`,
            25,
            58
        );


        const imageX =
            LABEL;

        const imageY =
            HEADER;


        /*
           Draw detail cells.
        */

        const data =
            currentDetailData.data;


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

                drawCell(
                    ctx,
                    imageX +
                        x * CELL,
                    imageY +
                        y * CELL,
                    CELL,
                    CELL,
                    data[y][x],
                    pixelRoundness
                );
            }
        }


        /*
           Physical grid.
        */

        const physicalCellWidth =
            imageWidth /
            currentGrid.width;

        const physicalCellHeight =
            imageHeight /
            currentGrid.height;


        ctx.strokeStyle =
            "rgba(255,255,255,.35)";

        ctx.lineWidth =
            1;


        for (
            let x = 0;
            x <= currentGrid.width;
            x++
        ) {

            const px =
                imageX +
                x *
                physicalCellWidth +
                0.5;


            ctx.beginPath();

            ctx.moveTo(
                px,
                imageY
            );

            ctx.lineTo(
                px,
                imageY +
                imageHeight
            );

            ctx.stroke();
        }


        for (
            let y = 0;
            y <= currentGrid.height;
            y++
        ) {

            const py =
                imageY +
                y *
                physicalCellHeight +
                0.5;


            ctx.beginPath();

            ctx.moveTo(
                imageX,
                py
            );

            ctx.lineTo(
                imageX +
                imageWidth,
                py
            );

            ctx.stroke();
        }


        /*
           Border.
        */

        ctx.strokeStyle =
            "#f2f0ea";

        ctx.lineWidth =
            2;

        ctx.strokeRect(
            imageX,
            imageY,
            imageWidth,
            imageHeight
        );


        /*
           Top letters.
        */

        ctx.fillStyle =
            "#aaa79f";

        ctx.font =
            "10px Arial";

        ctx.textAlign =
            "center";


        for (
            let x = 0;
            x < currentGrid.width;
            x++
        ) {

            const center =
                imageX +
                x *
                physicalCellWidth +
                physicalCellWidth / 2;


            ctx.fillText(
                columnLabel(x),
                center,
                imageY - 10
            );
        }


        /*
           Left numbers.
        */

        ctx.textAlign =
            "right";


        for (
            let y = 0;
            y < currentGrid.height;
            y++
        ) {

            const center =
                imageY +
                y *
                physicalCellHeight +
                physicalCellHeight / 2;


            ctx.fillText(
                String(y + 1),
                imageX - 8,
                center + 3
            );
        }


        /*
           Legend.
        */

        const legendY =
            imageY +
            imageHeight +
            30;


        ctx.textAlign =
            "left";

        ctx.fillStyle =
            "#f2f0ea";

        ctx.font =
            "bold 12px Arial";

        ctx.fillText(
            "COLOR LEGEND",
            25,
            legendY
        );


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
                    (index % 4) *
                    190;


                const itemY =
                    legendY +
                    25 +
                    Math.floor(
                        index / 4
                    ) *
                    30;


                ctx.fillStyle =
                    normalized;


                ctx.fillRect(
                    itemX,
                    itemY - 11,
                    18,
                    18
                );


                ctx.strokeStyle =
                    "#77746d";

                ctx.strokeRect(
                    itemX,
                    itemY - 11,
                    18,
                    18
                );


                ctx.fillStyle =
                    "#f2f0ea";

                ctx.font =
                    "11px Arial";


                ctx.fillText(
                    `COLOR ${index + 1}`,
                    itemX + 27,
                    itemY
                );


                ctx.fillStyle =
                    "#77746d";


                ctx.fillText(
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
            `doch-rug-${width}x${height}cm-${currentGrid.width}x${currentGrid.height}-detail-${detailLevel}-shape-${pixelRoundness}.png`;


        link.href =
            out.toDataURL(
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
            Number(
                widthInput?.value
            ) || 100;


        const height =
            Number(
                heightInput?.value
            ) || 75;


        const ratio =
            width / height;


        const workspace =
            document.createElement(
                "div"
            );


        workspace.style.cssText = `
            position:relative;
            width:min(90vw, 82vh * ${ratio});
            aspect-ratio:${ratio};
        `;


        const projectorCanvas =
            document.createElement(
                "canvas"
            );


        const renderWidth =
            1200;

        const renderHeight =
            Math.round(
                renderWidth /
                ratio
            );


        projectorCanvas.width =
            renderWidth;

        projectorCanvas.height =
            renderHeight;


        projectorCanvas.style.cssText = `
            position:absolute;
            inset:0;
            width:100%;
            height:100%;
        `;


        const ctx =
            projectorCanvas.getContext(
                "2d"
            );


        ctx.fillStyle =
            "#11110f";

        ctx.fillRect(
            0,
            0,
            renderWidth,
            renderHeight
        );


        /*
           Detail map into physical rug rectangle.
        */

        const detailWidth =
            currentDetailData.width;

        const detailHeight =
            currentDetailData.height;


        const cellWidth =
            renderWidth /
            detailWidth;

        const cellHeight =
            renderHeight /
            detailHeight;


        for (
            let y = 0;
            y < detailHeight;
            y++
        ) {

            for (
                let x = 0;
                x < detailWidth;
                x++
            ) {

                drawCell(
                    ctx,
                    x * cellWidth,
                    y * cellHeight,
                    cellWidth,
                    cellHeight,
                    currentDetailData.data[y][x],
                    pixelRoundness
                );
            }
        }


        /*
           Physical 5 cm grid.
        */

        const gridCellWidth =
            renderWidth /
            currentGrid.width;

        const gridCellHeight =
            renderHeight /
            currentGrid.height;


        ctx.strokeStyle =
            "rgba(255,255,255,.35)";

        ctx.lineWidth =
            1;


        for (
            let x = 1;
            x < currentGrid.width;
            x++
        ) {

            const px =
                x *
                gridCellWidth +
                0.5;


            ctx.beginPath();

            ctx.moveTo(
                px,
                0
            );

            ctx.lineTo(
                px,
                renderHeight
            );

            ctx.stroke();
        }


        for (
            let y = 1;
            y < currentGrid.height;
            y++
        ) {

            const py =
                y *
                gridCellHeight +
                0.5;


            ctx.beginPath();

            ctx.moveTo(
                0,
                py
            );

            ctx.lineTo(
                renderWidth,
                py
            );

            ctx.stroke();
        }


        ctx.strokeStyle =
            "rgba(255,255,255,.8)";

        ctx.lineWidth =
            2;


        ctx.strokeRect(
            1,
            1,
            renderWidth - 2,
            renderHeight - 2
        );


        workspace.appendChild(
            projectorCanvas
        );


        overlay.appendChild(
            workspace
        );


        /*
           Info.
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
            <span>DOCH / PROJECTOR MODE</span>

            <span>
                ${width} × ${height} CM
                · ${currentGrid.width} × ${currentGrid.height} GRID
                · ${GRID_CELL_CM} CM CELL
                · DETAIL ${detailLevel}
                · SHAPE ${pixelRoundness}
            </span>
        `;


        overlay.appendChild(
            info
        );


        /*
           Close.
        */

        const close =
            document.createElement(
                "button"
            );


        close.type =
            "button";

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
                        .catch(
                            () => {}
                        );
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
                .catch(
                    () => {}
                );
        }
    }


    /* =========================================================
       INITIALIZATION
       ========================================================= */

    setupWorkspace();


    createExtraControls();


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
       Initial physical grid.
    */

    currentGrid =
        calculatePhysicalGrid();


    updateStats();


    /*
       Make sure labels don't accidentally create
       a scrollable workspace.
    */

    if (rugCanvasWrap) {

        rugCanvasWrap.scrollLeft =
            0;

        rugCanvasWrap.scrollTop =
            0;
    }


    /*
       First resize pass.
    */

    requestAnimationFrame(
        () => {

            if (
                sourceImage
            ) {

                showLoadedImage();

            }
        }
    );

})();
