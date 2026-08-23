/* =========================================================
   DOCH — CUSTOM RUG
   IMAGE → YARN → RUG
   ========================================================= */

(() => {
    "use strict";

    /* ---------------------------------------------------------
       ELEMENTS
    --------------------------------------------------------- */

    const imageInput = document.getElementById("imageInput");
    const fileName = document.getElementById("fileName");

    const keepBackground = document.getElementById("keepBackground");
    const removeBackground = document.getElementById("removeBackground");

    const colorCounts = document.getElementById("colorCounts");
    const paletteElement = document.getElementById("palette");
    const resetPalette = document.getElementById("resetPalette");

    const widthInput = document.getElementById("widthInput");
    const heightInput = document.getElementById("heightInput");
    const lockRatio = document.getElementById("lockRatio");

    const contrastInput = document.getElementById("contrastInput");
    const brightnessInput = document.getElementById("brightnessInput");

    const contrastValue = document.getElementById("contrastValue");
    const brightnessValue = document.getElementById("brightnessValue");

    const generateButton = document.getElementById("generateButton");

    const canvas = document.getElementById("rugCanvas");
    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });

    const emptyPreview = document.getElementById("emptyPreview");
    const previewStatus = document.getElementById("previewStatus");

    const statColors = document.getElementById("statColors");
    const statSize = document.getElementById("statSize");
    const statGrid = document.getElementById("statGrid");
    const statLoops = document.getElementById("statLoops");


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


    /*
       Maximum number of rug cells.

       This controls the manufacturing preview resolution.
    */

    const MAX_GRID_WIDTH = 140;
    const MAX_GRID_HEIGHT = 140;


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

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }


    function hexToRgb(hex) {
        hex = hex.replace("#", "").trim();

        if (hex.length === 3) {
            hex = hex
                .split("")
                .map(char => char + char)
                .join("");
        }

        const value = parseInt(hex, 16);

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
                    clamp(Math.round(value), 0, 255)
                        .toString(16)
                        .padStart(2, "0")
                        .toUpperCase()
                )
                .join("")
        );
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


    /* ---------------------------------------------------------
       CREATE EXPORT CONTROLS
       --------------------------------------------------------- */

    function createExportControls() {

        /*
           Don't create them twice.
        */

        if (document.getElementById("rugExportControls")) {
            return;
        }

        const container =
            document.createElement("div");

        container.id =
            "rugExportControls";

        container.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 12px;
        `;


        const downloadButton =
            document.createElement("button");

        downloadButton.type = "button";
        downloadButton.textContent =
            "DOWNLOAD PNG";

        downloadButton.style.cssText = `
            min-height: 52px;
            border: 1px solid #292925;
            background: transparent;
            color: #f2f0ea;
            cursor: pointer;
            font: 10px "DM Mono", monospace;
            transition: .2s ease;
        `;


        const projectorButton =
            document.createElement("button");

        projectorButton.type = "button";
        projectorButton.textContent =
            "PROJECTOR MODE";

        projectorButton.style.cssText = `
            min-height: 52px;
            border: 1px solid #292925;
            background: #f2f0ea;
            color: #0b0b0a;
            cursor: pointer;
            font: 10px "DM Mono", monospace;
            transition: .2s ease;
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


        container.appendChild(downloadButton);
        container.appendChild(projectorButton);


        /*
           Put controls directly below preview.
        */

        const previewPanel =
            document.querySelector(".preview-panel");

        if (previewPanel) {
            previewPanel.appendChild(container);
        }
    }


    /* ---------------------------------------------------------
       IMAGE UPLOAD
    --------------------------------------------------------- */

    imageInput.addEventListener("change", event => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select an image.");
            return;
        }

        fileName.textContent =
            file.name;

        const reader =
            new FileReader();

        reader.onload = event => {

            const img =
                new Image();

            img.onload = () => {

                sourceImage = img;

                originalRatio =
                    img.naturalWidth /
                    img.naturalHeight;


                if (lockRatio.checked) {
                    updateHeightFromWidth();
                }


                previewStatus.textContent =
                    "IMAGE LOADED";


                emptyPreview.style.display =
                    "none";

                canvas.style.display =
                    "block";


                generateRug();
            };


            img.onerror = () => {
                alert("Could not load this image.");
            };


            img.src =
                event.target.result;
        };


        reader.readAsDataURL(file);
    });


    /* ---------------------------------------------------------
       BACKGROUND
    --------------------------------------------------------- */

    keepBackground.addEventListener(
        "click",
        () => {

            backgroundMode =
                "keep";

            keepBackground.classList.add("active");
            removeBackground.classList.remove("active");

            generateRug();
        }
    );


    removeBackground.addEventListener(
        "click",
        () => {

            backgroundMode =
                "remove";

            removeBackground.classList.add("active");
            keepBackground.classList.remove("active");

            generateRug();
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
                Number(button.dataset.colors);


            document
                .querySelectorAll(
                    "#colorCounts button"
                )
                .forEach(item =>
                    item.classList.remove("active")
                );


            button.classList.add("active");


            /*
               Reset manually modified palette when changing
               number of colors.
            */

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

    function renderPalette(palette) {

        paletteElement.innerHTML = "";

        palette.forEach((hex, index) => {

            const row =
                document.createElement("div");

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


            paletteElement.appendChild(row);
        });
    }


    paletteElement.addEventListener(
        "input",
        event => {

            const index =
                event.target.dataset.paletteIndex;

            if (index === undefined) {
                return;
            }


            if (
                event.target.type === "color"
            ) {

                customPalette[index] =
                    event.target.value.toUpperCase();


                const textInput =
                    paletteElement.querySelector(
                        `.palette-hex[data-palette-index="${index}"]`
                    );


                if (textInput) {
                    textInput.value =
                        event.target.value.toUpperCase();
                }


                generateRug();
            }
        }
    );


    paletteElement.addEventListener(
        "change",
        event => {

            const index =
                event.target.dataset.paletteIndex;

            if (index === undefined) {
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


                generateRug();
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
                    deleteButton.dataset.paletteDelete
                );


            if (!customPalette.length) {
                customPalette =
                    [...generatedPalette];
            }


            customPalette.splice(
                index,
                1
            );


            if (!customPalette.length) {
                customPalette =
                    ["#000000"];
            }


            numberOfColors =
                customPalette.length;

            generatedPalette =
                [...customPalette];


            renderPalette(
                generatedPalette
            );

            generateRug();
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

        if (!lockRatio.checked) {
            return;
        }


        const width =
            Number(widthInput.value);


        if (!width || !originalRatio) {
            return;
        }


        const height =
            width / originalRatio;


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

            if (lockRatio.checked) {
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

            generateRug();
        }
    );


    brightnessInput.addEventListener(
        "input",
        () => {

            brightnessValue.textContent =
                brightnessInput.value;

            generateRug();
        }
    );


    /* ---------------------------------------------------------
       PROCESS IMAGE
       --------------------------------------------------------- */

    function processImage() {

        if (!sourceImage) {
            return null;
        }


        const maxSize = 500;

        let width =
            sourceImage.naturalWidth;

        let height =
            sourceImage.naturalHeight;


        const ratio =
            Math.min(
                maxSize / width,
                maxSize / height,
                1
            );


        width =
            Math.max(
                1,
                Math.round(width * ratio)
            );


        height =
            Math.max(
                1,
                Math.round(height * ratio)
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
            (259 * (contrast + 255)) /
            (255 * (259 - contrast));


        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];


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
            backgroundMode !== "remove"
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
                distance < threshold
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


            if (alpha < 30) {
                continue;
            }


            let r =
                data[i];

            let g =
                data[i + 1];

            let b =
                data[i + 2];


            r =
                Math.floor(r / 16) *
                16;

            g =
                Math.floor(g / 16) *
                16;

            b =
                Math.floor(b / 16) *
                16;


            const key =
                `${r},${g},${b}`;


            buckets.set(
                key,
                (buckets.get(key) || 0) + 1
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

            let bestCandidate = null;
            let bestScore = -Infinity;


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


                if (alreadySelected) {
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
                    score > bestScore
                ) {

                    bestScore =
                        score;

                    bestCandidate =
                        candidate;
                }
            }


            if (!bestCandidate) {
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
            Number(widthInput.value) ||
            100;


        const rugHeight =
            Number(heightInput.value) ||
            75;


        const ratio =
            rugWidth / rugHeight;


        let gridWidth =
            Math.round(
                Math.sqrt(
                    MAX_GRID_WIDTH *
                    MAX_GRID_HEIGHT *
                    ratio
                )
            );


        let gridHeight =
            Math.round(
                gridWidth / ratio
            );


        if (
            gridWidth >
            MAX_GRID_WIDTH
        ) {

            gridWidth =
                MAX_GRID_WIDTH;

            gridHeight =
                Math.round(
                    gridWidth / ratio
                );
        }


        if (
            gridHeight >
            MAX_GRID_HEIGHT
        ) {

            gridHeight =
                MAX_GRID_HEIGHT;

            gridWidth =
                Math.round(
                    gridHeight * ratio
                );
        }


        gridWidth =
            clamp(
                gridWidth,
                20,
                MAX_GRID_WIDTH
            );


        gridHeight =
            clamp(
                gridHeight,
                20,
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


                        if (a < 20) {
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

                        alpha += a;

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


            output.push(row);
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


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


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


        ctx.imageSmoothingEnabled =
            false;


        canvas.style.imageRendering =
            "pixelated";
    }


    /* ---------------------------------------------------------
       STATS
       --------------------------------------------------------- */

    function updateStats(
        grid
    ) {

        const width =
            Number(widthInput.value) ||
            100;


        const height =
            Number(heightInput.value) ||
            75;


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


        isGenerating = true;


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
                            .getContext("2d");


                    tempCtx.putImageData(
                        processed.imageData,
                        0,
                        0
                    );


                    /*
                       Generate palette only when
                       user hasn't manually edited it.
                    */

                    if (!customPalette.length) {

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


                    /*
                       Save the current design.
                    */

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


                    emptyPreview.style.display =
                        "none";

                    canvas.style.display =
                        "block";


                    previewStatus.textContent =
                        "RUG READY";


                    /*
                       Make export controls visible.
                    */

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


    /* ---------------------------------------------------------
       DOWNLOAD PNG
       --------------------------------------------------------- */

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


        /*
           Export at a much higher resolution than
           the preview canvas.

           This makes the PNG useful for projection
           and printing.
        */

        const EXPORT_CELL_SIZE = 40;


        const exportCanvas =
            document.createElement(
                "canvas"
            );


        exportCanvas.width =
            currentGrid.width *
            EXPORT_CELL_SIZE;


        exportCanvas.height =
            currentGrid.height *
            EXPORT_CELL_SIZE;


        const exportCtx =
            exportCanvas.getContext(
                "2d"
            );


        exportCtx.imageSmoothingEnabled =
            false;


        /*
           Background.
        */

        exportCtx.fillStyle =
            "#0e0e0c";


        exportCtx.fillRect(
            0,
            0,
            exportCanvas.width,
            exportCanvas.height
        );


        /*
           Draw every rug cell.
        */

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


                if (!color) {
                    continue;
                }


                exportCtx.fillStyle =
                    color;


                exportCtx.fillRect(
                    x * EXPORT_CELL_SIZE,
                    y * EXPORT_CELL_SIZE,
                    EXPORT_CELL_SIZE,
                    EXPORT_CELL_SIZE
                );
            }
        }


        /*
           Download.
        */

        const link =
            document.createElement(
                "a"
            );


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


        link.download =
            `doch-rug-${width}x${height}cm-${colors}-colors.png`;


        link.href =
            exportCanvas.toDataURL(
                "image/png"
            );


        link.click();
    }


    /* ---------------------------------------------------------
       PROJECTOR MODE
       --------------------------------------------------------- */

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
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: #11110f;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        `;


        /*
           Create projector canvas.
        */

        const projectorCanvas =
            document.createElement(
                "canvas"
            );


        projectorCanvas.width =
            currentGrid.width;

        projectorCanvas.height =
            currentGrid.height;


        projectorCanvas.style.cssText = `
            width: min(96vw, 96vh * ${currentGrid.width / currentGrid.height});
            height: min(96vh, 96vw / ${currentGrid.width / currentGrid.height});
            max-width: 96vw;
            max-height: 96vh;
            image-rendering: pixelated;
            object-fit: contain;
        `;


        const projectorCtx =
            projectorCanvas.getContext(
                "2d"
            );


        projectorCtx.imageSmoothingEnabled =
            false;


        /*
           Draw the rug.
        */

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


        overlay.appendChild(
            projectorCanvas
        );


        /*
           Top information bar.
        */

        const info =
            document.createElement(
                "div"
            );


        info.style.cssText = `
            position: absolute;
            top: 18px;
            left: 22px;
            right: 22px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            pointer-events: none;
            font: 10px "DM Mono", monospace;
            color: #77746d;
            letter-spacing: .05em;
        `;


        info.innerHTML = `
            <span>DOCH / PROJECTOR MODE</span>
            <span>
                ${widthInput.value} × ${heightInput.value} CM
                / ${customPalette.length || numberOfColors} COLORS
            </span>
        `;


        overlay.appendChild(info);


        /*
           Exit button.
        */

        const closeButton =
            document.createElement(
                "button"
            );


        closeButton.type =
            "button";

        closeButton.textContent =
            "EXIT PROJECTOR";


        closeButton.style.cssText = `
            position: absolute;
            right: 22px;
            bottom: 20px;
            min-height: 44px;
            padding: 0 16px;
            border: 1px solid #77746d;
            background: #11110f;
            color: #f2f0ea;
            cursor: pointer;
            font: 10px "DM Mono", monospace;
            letter-spacing: .04em;
        `;


        closeButton.addEventListener(
            "click",
            () => overlay.remove()
        );


        overlay.appendChild(
            closeButton
        );


        /*
           ESC closes projector.
        */

        function escapeHandler(event) {

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


    createExportControls();

})();
