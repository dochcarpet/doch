/* =========================================================
   DOCH — CUSTOM RUG
   IMAGE → YARN PROTOTYPE
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


    /*
       Maximum grid dimension.

       This is deliberately limited because we don't want
       a 4000 × 3000 image to become a 12 million cell rug.

       Later this can be tied to the actual rug manufacturing
       resolution.
    */
    const MAX_GRID_WIDTH = 140;
    const MAX_GRID_HEIGHT = 140;


    /*
       Default fallback palette.

       Used when the image has not been uploaded yet or when
       palette extraction fails.
    */
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
       BASIC HELPERS
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

        /*
           Weighted RGB distance.

           Human eyes are more sensitive to green,
           so green gets slightly more weight.
        */
        return Math.sqrt(
            dr * dr * 0.299 +
            dg * dg * 0.587 +
            db * db * 0.114
        );
    }


    function hexToRgbArray(palette) {
        return palette.map(hexToRgb);
    }


    /* ---------------------------------------------------------
       IMAGE UPLOAD
    --------------------------------------------------------- */

    imageInput.addEventListener("change", event => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select an image.");
            return;
        }

        fileName.textContent = file.name;

        const reader = new FileReader();

        reader.onload = event => {
            const img = new Image();

            img.onload = () => {
                sourceImage = img;

                originalRatio =
                    img.naturalWidth / img.naturalHeight;

                /*
                   If ratio is locked, update height based
                   on the original image.
                */
                if (lockRatio.checked) {
                    updateHeightFromWidth();
                }

                previewStatus.textContent = "IMAGE LOADED";

                emptyPreview.style.display = "none";
                canvas.style.display = "block";

                /*
                   Generate automatically after upload.
                */
                generateRug();
            };

            img.onerror = () => {
                alert("Could not load this image.");
            };

            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
    });


    /* ---------------------------------------------------------
       BACKGROUND MODE
    --------------------------------------------------------- */

    keepBackground.addEventListener("click", () => {
        backgroundMode = "keep";

        keepBackground.classList.add("active");
        removeBackground.classList.remove("active");

        generateRug();
    });


    removeBackground.addEventListener("click", () => {
        backgroundMode = "remove";

        removeBackground.classList.add("active");
        keepBackground.classList.remove("active");

        generateRug();
    });


    /* ---------------------------------------------------------
       COLOR COUNT
    --------------------------------------------------------- */

    colorCounts.addEventListener("click", event => {
        const button = event.target.closest("[data-colors]");

        if (!button) {
            return;
        }

        numberOfColors = Number(button.dataset.colors);

        document
            .querySelectorAll("#colorCounts button")
            .forEach(item => item.classList.remove("active"));

        button.classList.add("active");

        /*
           When changing the number of colors we generate
           a completely new palette from the image.
        */
        customPalette = [];

        if (sourceImage) {
            generateRug();
        } else {
            generatedPalette = DEFAULT_PALETTE.slice(
                0,
                numberOfColors
            );

            renderPalette(generatedPalette);
        }
    });


    /* ---------------------------------------------------------
       PALETTE
    --------------------------------------------------------- */

    function renderPalette(palette) {
        paletteElement.innerHTML = "";

        palette.forEach((hex, index) => {
            const row = document.createElement("div");

            row.className = "palette-row";

            row.innerHTML = `
                <input
                    class="palette-color"
                    type="color"
                    value="${normalizeHex(hex)}"
                    data-palette-index="${index}"
                    aria-label="Palette color ${index + 1}"
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
                    aria-label="Delete color"
                >
                    ×
                </button>
            `;

            paletteElement.appendChild(row);
        });
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


    paletteElement.addEventListener("input", event => {
        const index = event.target.dataset.paletteIndex;

        if (index === undefined) {
            return;
        }

        const value = event.target.value;

        if (event.target.type === "color") {
            customPalette[index] = value.toUpperCase();

            const textInput =
                paletteElement.querySelector(
                    `.palette-hex[data-palette-index="${index}"]`
                );

            if (textInput) {
                textInput.value = value.toUpperCase();
            }

            generateRug();
        }
    });


    paletteElement.addEventListener("change", event => {
        const index = event.target.dataset.paletteIndex;

        if (index === undefined) {
            return;
        }

        if (event.target.classList.contains("palette-hex")) {
            const value = normalizeHex(event.target.value);

            customPalette[index] = value;

            event.target.value = value;

            const colorInput =
                paletteElement.querySelector(
                    `.palette-color[data-palette-index="${index}"]`
                );

            if (colorInput) {
                colorInput.value = value;
            }

            generateRug();
        }
    });


    paletteElement.addEventListener("click", event => {
        const deleteButton =
            event.target.closest("[data-palette-delete]");

        if (!deleteButton) {
            return;
        }

        const index = Number(
            deleteButton.dataset.paletteDelete
        );

        if (customPalette.length === 0) {
            customPalette = [...generatedPalette];
        }

        customPalette.splice(index, 1);

        if (customPalette.length < 1) {
            customPalette = ["#000000"];
        }

        numberOfColors = customPalette.length;

        generatedPalette = [...customPalette];

        renderPalette(generatedPalette);

        generateRug();
    });


    resetPalette.addEventListener("click", () => {
        customPalette = [];

        if (sourceImage) {
            generateRug();
        } else {
            generatedPalette = DEFAULT_PALETTE.slice(
                0,
                numberOfColors
            );

            renderPalette(generatedPalette);
        }
    });


    /* ---------------------------------------------------------
       SIZE
    --------------------------------------------------------- */

    function updateHeightFromWidth() {
        if (!lockRatio.checked) {
            return;
        }

        const width = Number(widthInput.value);

        if (!width || !originalRatio) {
            return;
        }

        const height = width / originalRatio;

        heightInput.value = Math.max(
            1,
            Math.round(height)
        );
    }


    widthInput.addEventListener("input", () => {
        updateHeightFromWidth();

        if (sourceImage) {
            generateRug();
        }
    });


    heightInput.addEventListener("input", () => {
        if (sourceImage && !lockRatio.checked) {
            generateRug();
        }
    });


    lockRatio.addEventListener("change", () => {
        if (lockRatio.checked) {
            updateHeightFromWidth();
        }

        if (sourceImage) {
            generateRug();
        }
    });


    /* ---------------------------------------------------------
       BRIGHTNESS / CONTRAST
    --------------------------------------------------------- */

    contrastInput.addEventListener("input", () => {
        contrastValue.textContent =
            contrastInput.value;

        generateRug();
    });


    brightnessInput.addEventListener("input", () => {
        brightnessValue.textContent =
            brightnessInput.value;

        generateRug();
    });


    /* ---------------------------------------------------------
       IMAGE PROCESSING
    --------------------------------------------------------- */

    function processImage() {
        if (!sourceImage) {
            return null;
        }

        const maxSize = 500;

        let width = sourceImage.naturalWidth;
        let height = sourceImage.naturalHeight;

        const ratio = Math.min(
            maxSize / width,
            maxSize / height,
            1
        );

        width = Math.max(1, Math.round(width * ratio));
        height = Math.max(1, Math.round(height * ratio));

        const tempCanvas =
            document.createElement("canvas");

        tempCanvas.width = width;
        tempCanvas.height = height;

        const tempCtx =
            tempCanvas.getContext("2d", {
                willReadFrequently: true
            });

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

        const data = imageData.data;

        const brightness =
            Number(brightnessInput.value);

        const contrast =
            Number(contrastInput.value);

        /*
           Standard contrast formula.
        */
        const factor =
            (259 * (contrast + 255)) /
            (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {

            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            /*
               Brightness.
            */
            r += brightness * 2.55;
            g += brightness * 2.55;
            b += brightness * 2.55;

            /*
               Contrast.
            */
            r = factor * (r - 128) + 128;
            g = factor * (g - 128) + 128;
            b = factor * (b - 128) + 128;

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
       BACKGROUND REMOVAL
       --------------------------------------------------------- */

    function applyBackgroundRemoval(imageData) {
        if (backgroundMode !== "remove") {
            return;
        }

        const data = imageData.data;

        /*
           Prototype logic:
           use the average of the four corner pixels
           as the background color.

           This works surprisingly well for:
           - white backgrounds
           - black backgrounds
           - simple product photos
           - logos

           Later this can be replaced by a real segmentation
           model / remove.bg / local ML model.
        */

        const width = imageData.width;
        const height = imageData.height;

        const cornerPositions = [
            0,
            (width - 1) * 4,
            (height - 1) * width * 4,
            ((height - 1) * width + width - 1) * 4
        ];

        let background = {
            r: 0,
            g: 0,
            b: 0
        };

        cornerPositions.forEach(position => {
            background.r += data[position];
            background.g += data[position + 1];
            background.b += data[position + 2];
        });

        background.r /= 4;
        background.g /= 4;
        background.b /= 4;

        /*
           Higher = more aggressive removal.
        */
        const threshold = 55;

        for (let i = 0; i < data.length; i += 4) {

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

            if (distance < threshold) {
                /*
                   Make background transparent.
                */
                data[i + 3] = 0;
            }
        }
    }


    /* ---------------------------------------------------------
       COLOR QUANTIZATION
       --------------------------------------------------------- */

    function extractPalette(imageData, count) {

        const data = imageData.data;

        const buckets = new Map();

        /*
           Sample every few pixels instead of every pixel.
           This makes the browser much faster on phones.
        */

        const step = 12;

        for (
            let i = 0;
            i < data.length;
            i += 4 * step
        ) {

            const alpha = data[i + 3];

            if (alpha < 30) {
                continue;
            }

            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            /*
               Bucket colors to reduce near-identical colors.
            */
            r = Math.floor(r / 16) * 16;
            g = Math.floor(g / 16) * 16;
            b = Math.floor(b / 16) * 16;

            const key =
                `${r},${g},${b}`;

            buckets.set(
                key,
                (buckets.get(key) || 0) + 1
            );
        }

        const sorted =
            [...buckets.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 60)
                .map(([key, weight]) => {
                    const [r, g, b] =
                        key.split(",").map(Number);

                    return {
                        r,
                        g,
                        b,
                        weight
                    };
                });

        if (!sorted.length) {
            return DEFAULT_PALETTE
                .slice(0, count);
        }

        /*
           First color = most common.

           Additional colors are selected using a simplified
           "farthest color" strategy so we don't get 4 almost
           identical shades.
        */

        const result = [
            sorted[0]
        ];

        while (
            result.length < count &&
            result.length < sorted.length
        ) {

            let bestCandidate = null;
            let bestScore = -Infinity;

            for (const candidate of sorted) {

                const alreadySelected =
                    result.some(selected =>
                        colorDistance(
                            selected,
                            candidate
                        ) < 12
                    );

                if (alreadySelected) {
                    continue;
                }

                let minDistance = Infinity;

                result.forEach(selected => {
                    minDistance = Math.min(
                        minDistance,
                        colorDistance(
                            selected,
                            candidate
                        )
                    );
                });

                /*
                   Weight slightly by frequency.
                */
                const score =
                    minDistance +
                    Math.log(candidate.weight + 1) * 3;

                if (score > bestScore) {
                    bestScore = score;
                    bestCandidate = candidate;
                }
            }

            if (!bestCandidate) {
                break;
            }

            result.push(bestCandidate);
        }

        return result.map(color =>
            rgbToHex(
                color.r,
                color.g,
                color.b
            )
        );
    }


    /* ---------------------------------------------------------
       GRID SIZE
       --------------------------------------------------------- */

    function calculateGrid() {

        const rugWidth =
            Number(widthInput.value) || 100;

        const rugHeight =
            Number(heightInput.value) || 75;

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

        if (gridWidth > MAX_GRID_WIDTH) {
            gridWidth = MAX_GRID_WIDTH;
            gridHeight =
                Math.round(
                    gridWidth / ratio
                );
        }

        if (gridHeight > MAX_GRID_HEIGHT) {
            gridHeight = MAX_GRID_HEIGHT;
            gridWidth =
                Math.round(
                    gridHeight * ratio
                );
        }

        gridWidth =
            clamp(gridWidth, 20, MAX_GRID_WIDTH);

        gridHeight =
            clamp(gridHeight, 20, MAX_GRID_HEIGHT);

        return {
            width: gridWidth,
            height: gridHeight
        };
    }


    /* ---------------------------------------------------------
       RESIZE IMAGE INTO RUG GRID
       --------------------------------------------------------- */

    function createGridImage(processed, grid) {

        const sourceCanvas =
            processed.canvas;

        const sourceCtx =
            sourceCanvas.getContext("2d", {
                willReadFrequently: true
            });

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

        for (let gy = 0; gy < grid.height; gy++) {

            const row = [];

            for (let gx = 0; gx < grid.width; gx++) {

                /*
                   Determine the source pixel area represented
                   by this rug cell.
                */

                const sx =
                    Math.floor(
                        gx / grid.width *
                        sourceCanvas.width
                    );

                const sy =
                    Math.floor(
                        gy / grid.height *
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

                /*
                   Average source pixels inside this rug cell.
                */

                for (let y = sy; y < ey; y++) {

                    for (let x = sx; x < ex; x++) {

                        const index =
                            (y * sourceCanvas.width + x) * 4;

                        const a =
                            sourceData.data[index + 3];

                        if (a < 20) {
                            continue;
                        }

                        r +=
                            sourceData.data[index];

                        g +=
                            sourceData.data[index + 1];

                        b +=
                            sourceData.data[index + 2];

                        alpha += a;

                        pixels++;
                    }
                }

                if (!pixels || alpha === 0) {
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

                palette.forEach(color => {

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
                });

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


    /* ---------------------------------------------------------
       DRAW RUG
       --------------------------------------------------------- */

    function drawRug(gridData, grid) {

        canvas.width =
            grid.width;

        canvas.height =
            grid.height;

        /*
           Use CSS scaling rather than a giant canvas.
        */

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
                    /*
                       Transparent / removed background.
                    */
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

                ctx.fillStyle = color;

                ctx.fillRect(
                    x,
                    y,
                    1,
                    1
                );
            }
        }

        /*
           Pixelated is important for the rug preview.
        */
        ctx.imageSmoothingEnabled = false;

        canvas.style.imageRendering =
            "pixelated";
    }


    /* ---------------------------------------------------------
       STATS
       --------------------------------------------------------- */

    function updateStats(grid) {

        const width =
            Number(widthInput.value) || 100;

        const height =
            Number(heightInput.value) || 75;

        const totalCells =
            grid.width *
            grid.height;

        statColors.textContent =
            numberOfColors;

        statSize.textContent =
            `${Math.round(width)} × ${Math.round(height)} CM`;

        statGrid.textContent =
            `${grid.width} × ${grid.height}`;

        /*
           One grid cell ≈ one loop.

           This is only a prototype estimate.
           Later we'll calculate this based on actual tufting
           density / yarn thickness / machine settings.
        */

        statLoops.textContent =
            totalCells.toLocaleString();
    }


    /* ---------------------------------------------------------
       GENERATE RUG
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

        /*
           setTimeout lets the browser update the UI before
           doing the heavier canvas work.
        */

        setTimeout(() => {

            try {

                const processed =
                    processImage();

                if (!processed) {
                    return;
                }

                /*
                   Background removal modifies imageData.
                */
                applyBackgroundRemoval(
                    processed.imageData
                );

                /*
                   Put modified pixels back into canvas.
                */
                const tempCtx =
                    processed.canvas.getContext("2d");

                tempCtx.putImageData(
                    processed.imageData,
                    0,
                    0
                );


                /*
                   Generate palette only when user has not
                   manually edited it.
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


                /*
                   If custom palette exists but its size differs
                   from requested colors, normalize it.
                */
                if (
                    customPalette.length &&
                    customPalette.length !== numberOfColors
                ) {
                    generatedPalette =
                        customPalette.slice();

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

            } catch (error) {

                console.error(
                    "Rug generation error:",
                    error
                );

                previewStatus.textContent =
                    "PROCESSING ERROR";

            } finally {

                isGenerating = false;
            }

        }, 20);
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

    /*
       Small convenience:
       clicking the empty preview also opens upload.
    */
    emptyPreview.addEventListener(
        "click",
        () => imageInput.click()
    );

})();
