/* =========================================================
   DOCH — CUSTOM RUG
   IMAGE → COLOR REGIONS → RUG GRID
   ========================================================= */

(() => {
    "use strict";

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const imageInput = document.getElementById("imageInput");
    const fileName = document.getElementById("fileName");

    const keepBackground = document.getElementById("keepBackground");
    const removeBackground = document.getElementById("removeBackground");

    const colorCounts = document.getElementById("colorCounts");
    const palette = document.getElementById("palette");
    const resetPalette = document.getElementById("resetPalette");

    const widthInput = document.getElementById("widthInput");
    const heightInput = document.getElementById("heightInput");
    const lockRatio = document.getElementById("lockRatio");

    const contrastInput = document.getElementById("contrastInput");
    const brightnessInput = document.getElementById("brightnessInput");

    const contrastValue = document.getElementById("contrastValue");
    const brightnessValue = document.getElementById("brightnessValue");

    const generateButton = document.getElementById("generateButton");

    const emptyPreview = document.getElementById("emptyPreview");
    const rugWorkspace = document.getElementById("rugWorkspace");

    const gridTopLabels = document.getElementById("gridTopLabels");
    const gridLeftLabels = document.getElementById("gridLeftLabels");

    const rugCanvasWrap = document.getElementById("rugCanvasWrap");
    const rugCanvas = document.getElementById("rugCanvas");

    const previewStatus = document.getElementById("previewStatus");
    const previewTitle = document.getElementById("previewTitle");

    const statColors = document.getElementById("statColors");
    const statSize = document.getElementById("statSize");
    const statGrid = document.getElementById("statGrid");
    const statLoops = document.getElementById("statLoops");

    const colorLegend = document.getElementById("colorLegend");

    const zoomOut = document.getElementById("zoomOut");
    const zoomIn = document.getElementById("zoomIn");
    const zoomReset = document.getElementById("zoomReset");
    const zoomValue = document.getElementById("zoomValue");


    /* =====================================================
       STATE
       ===================================================== */

    const state = {
        image: null,

        originalWidth: 0,
        originalHeight: 0,
        ratio: 4 / 3,

        colors: 4,

        backgroundMode: "keep",

        widthCm: 100,
        heightCm: 75,

        /*
         * REAL PROJECTOR GRID.
         *
         * 5 cm or 10 cm.
         */
        gridCm: 5,

        contrast: 0,
        brightness: 0,

        zoom: 1,

        palette: [],

        originalPalette: [],

        cells: [],

        gridColumns: 0,
        gridRows: 0,

        generated: false
    };


    /* =====================================================
       CONSTANTS
       ===================================================== */

    const GRID_OPTIONS = [5, 10];

    /*
     * Detail is intentionally NOT tied to physical grid.
     *
     * It controls how strongly the image is simplified
     * before mapping it into the physical projector grid.
     */
    const REGION_SIMPLIFICATION = 0.55;

    const MIN_ZOOM = 0.5;
    const MAX_ZOOM = 3;

    const DEFAULT_PALETTE = [
        "#111111",
        "#F1E9D8",
        "#C84B31",
        "#245A45",
        "#D49A32",
        "#526C8A",
        "#7B4F69",
        "#8B806C"
    ];


    /* =====================================================
       UTILITIES
       ===================================================== */

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }


    function hexToRgb(hex) {
        const value = hex.replace("#", "");

        return {
            r: parseInt(value.substring(0, 2), 16),
            g: parseInt(value.substring(2, 4), 16),
            b: parseInt(value.substring(4, 6), 16)
        };
    }


    function rgbToHex(r, g, b) {
        return "#" + [r, g, b]
            .map(v => Math.round(v).toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();
    }


    function colorDistance(a, b) {
        const dr = a.r - b.r;
        const dg = a.g - b.g;
        const db = a.b - b.b;

        return Math.sqrt(
            dr * dr +
            dg * dg +
            db * db
        );
    }


    function mixColor(a, b, amount) {
        return {
            r: a.r + (b.r - a.r) * amount,
            g: a.g + (b.g - a.g) * amount,
            b: a.b + (b.b - a.b) * amount
        };
    }


    function letterName(index) {
        let result = "";
        let n = index + 1;

        while (n > 0) {
            n--;

            result =
                String.fromCharCode(65 + (n % 26)) +
                result;

            n = Math.floor(n / 26);
        }

        return result;
    }


    function formatNumber(value) {
        return Number(value).toLocaleString("en-US");
    }


    /* =====================================================
       IMAGE LOADING
       ===================================================== */

    imageInput.addEventListener("change", event => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const url = URL.createObjectURL(file);

        const image = new Image();

        image.onload = () => {
            state.image = image;
            state.originalWidth = image.naturalWidth;
            state.originalHeight = image.naturalHeight;
            state.ratio =
                image.naturalWidth /
                image.naturalHeight;

            fileName.textContent = file.name;

            if (lockRatio.checked) {
                updateHeightFromWidth();
            }

            previewStatus.textContent = "IMAGE LOADED";
            emptyPreview.style.display = "none";
            rugWorkspace.style.display = "block";

            generateRug();

            URL.revokeObjectURL(url);
        };

        image.onerror = () => {
            fileName.textContent = "INVALID IMAGE";
            URL.revokeObjectURL(url);
        };

        image.src = url;
    });


    /* =====================================================
       SIZE
       ===================================================== */

    widthInput.addEventListener("input", () => {

        const width = clamp(
            Number(widthInput.value) || 100,
            20,
            500
        );

        state.widthCm = width;

        if (lockRatio.checked) {
            updateHeightFromWidth();
        }

        if (state.image) {
            generateRug();
        }
    });


    heightInput.addEventListener("input", () => {

        const height = clamp(
            Number(heightInput.value) || 75,
            20,
            500
        );

        state.heightCm = height;

        if (lockRatio.checked) {
            updateWidthFromHeight();
        }

        if (state.image) {
            generateRug();
        }
    });


    function updateHeightFromWidth() {

        if (!state.ratio) {
            return;
        }

        const width =
            Number(widthInput.value) || 100;

        const height =
            width / state.ratio;

        heightInput.value =
            Math.round(height * 10) / 10;

        state.heightCm =
            Math.round(height * 10) / 10;
    }


    function updateWidthFromHeight() {

        if (!state.ratio) {
            return;
        }

        const height =
            Number(heightInput.value) || 75;

        const width =
            height * state.ratio;

        widthInput.value =
            Math.round(width * 10) / 10;

        state.widthCm =
            Math.round(width * 10) / 10;
    }


    /* =====================================================
       GRID SIZE
       ===================================================== */

    /*
     * Creates a 5 cm / 10 cm physical projector grid.
     *
     * IMPORTANT:
     *
     * There is NO hardcoded 21×21 grid.
     *
     * Example:
     *
     * 300 cm / 5 cm = 60 columns
     * 200 cm / 5 cm = 40 rows
     *
     * 300 cm / 10 cm = 30 columns
     * 200 cm / 10 cm = 20 rows
     *
     * If the size does not divide perfectly, the final
     * cell becomes a partial physical cell.
     */

    function calculateGrid() {

        const width = Math.max(
            1,
            Number(state.widthCm)
        );

        const height = Math.max(
            1,
            Number(state.heightCm)
        );

        const step = state.gridCm;

        const columns = Math.ceil(width / step);
        const rows = Math.ceil(height / step);

        return {
            columns,
            rows,

            cellWidthCm:
                width / columns,

            cellHeightCm:
                height / rows
        };
    }


    /* =====================================================
       GRID CELL SWITCH
       ===================================================== */

    /*
     * There is no grid selector in the supplied HTML.
     *
     * Add one automatically next to SIZE.
     */

    function createGridControl() {

        const sizeSection =
            widthInput.closest(".control-section");

        if (!sizeSection) {
            return;
        }

        if (document.getElementById("gridSizeControl")) {
            return;
        }

        const wrapper =
            document.createElement("div");

        wrapper.id = "gridSizeControl";

        wrapper.style.marginTop = "18px";

        wrapper.innerHTML = `
            <div class="section-label" style="margin-bottom:10px;">
                <span>GRID</span>
                PROJECTOR CELL
            </div>

            <div class="button-row">
                <button
                    type="button"
                    class="option-button active"
                    data-grid="5"
                >
                    5 CM
                </button>

                <button
                    type="button"
                    class="option-button"
                    data-grid="10"
                >
                    10 CM
                </button>
            </div>
        `;

        sizeSection.appendChild(wrapper);

        wrapper
            .querySelectorAll("[data-grid]")
            .forEach(button => {

                button.addEventListener("click", () => {

                    state.gridCm =
                        Number(button.dataset.grid);

                    wrapper
                        .querySelectorAll("[data-grid]")
                        .forEach(btn =>
                            btn.classList.remove("active")
                        );

                    button.classList.add("active");

                    if (state.image) {
                        generateRug();
                    }
                });
            });
    }


    /* =====================================================
       COLOR COUNT
       ===================================================== */

    colorCounts
        .querySelectorAll("[data-colors]")
        .forEach(button => {

            button.addEventListener("click", () => {

                state.colors =
                    Number(button.dataset.colors);

                colorCounts
                    .querySelectorAll("[data-colors]")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

                if (state.image) {
                    generateRug();
                }
            });
        });


    /* =====================================================
       BACKGROUND
       ===================================================== */

    keepBackground.addEventListener("click", () => {

        state.backgroundMode = "keep";

        keepBackground.classList.add("active");
        removeBackground.classList.remove("active");

        if (state.image) {
            generateRug();
        }
    });


    removeBackground.addEventListener("click", () => {

        state.backgroundMode = "remove";

        removeBackground.classList.add("active");
        keepBackground.classList.remove("active");

        if (state.image) {
            generateRug();
        }
    });


    /* =====================================================
       IMAGE ADJUSTMENTS
       ===================================================== */

    contrastInput.addEventListener("input", () => {

        state.contrast =
            Number(contrastInput.value);

        contrastValue.textContent =
            state.contrast;

        if (state.image) {
            generateRug();
        }
    });


    brightnessInput.addEventListener("input", () => {

        state.brightness =
            Number(brightnessInput.value);

        brightnessValue.textContent =
            state.brightness;

        if (state.image) {
            generateRug();
        }
    });


    /* =====================================================
       SOURCE IMAGE → SMALL PIXEL DATA
       ===================================================== */

    function createSourceCanvas() {

        const canvas =
            document.createElement("canvas");

        /*
         * Keep source processing reasonably small.
         *
         * The actual physical grid is created later.
         */
        const maxSize = 500;

        let width =
            state.originalWidth;

        let height =
            state.originalHeight;

        const scale =
            Math.min(
                1,
                maxSize / Math.max(width, height)
            );

        width =
            Math.max(1, Math.round(width * scale));

        height =
            Math.max(1, Math.round(height * scale));

        canvas.width = width;
        canvas.height = height;

        const ctx =
            canvas.getContext("2d", {
                willReadFrequently: true
            });

        ctx.drawImage(
            state.image,
            0,
            0,
            width,
            height
        );

        return canvas;
    }


    /* =====================================================
       PIXEL ADJUSTMENTS
       ===================================================== */

    function adjustPixel(r, g, b) {

        /*
         * Brightness
         */

        const brightness =
            state.brightness * 2.55;

        r += brightness;
        g += brightness;
        b += brightness;

        /*
         * Contrast
         */

        const contrast =
            state.contrast;

        const factor =
            (259 * (contrast + 255)) /
            (255 * (259 - contrast));

        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;

        return {
            r: clamp(r, 0, 255),
            g: clamp(g, 0, 255),
            b: clamp(b, 0, 255)
        };
    }


    /* =====================================================
       BACKGROUND REMOVAL
       ===================================================== */

    function isBackground(pixel, corner) {

        if (state.backgroundMode !== "remove") {
            return false;
        }

        return (
            colorDistance(pixel, corner) < 55
        );
    }


    /* =====================================================
       SAMPLE SOURCE INTO PHYSICAL GRID
       ===================================================== */

    function sampleGrid(sourceCanvas, grid) {

        const ctx =
            sourceCanvas.getContext("2d", {
                willReadFrequently: true
            });

        const imageData =
            ctx.getImageData(
                0,
                0,
                sourceCanvas.width,
                sourceCanvas.height
            );

        const data =
            imageData.data;

        const sourceWidth =
            sourceCanvas.width;

        const sourceHeight =
            sourceCanvas.height;

        /*
         * Corner pixel is used as the prototype
         * background color.
         */
        const corner = {
            r: data[0],
            g: data[1],
            b: data[2]
        };

        const cells = [];

        for (
            let row = 0;
            row < grid.rows;
            row++
        ) {

            const rowCells = [];

            for (
                let col = 0;
                col < grid.columns;
                col++
            ) {

                const x0 =
                    Math.floor(
                        col *
                        sourceWidth /
                        grid.columns
                    );

                const x1 =
                    Math.max(
                        x0 + 1,
                        Math.floor(
                            (col + 1) *
                            sourceWidth /
                            grid.columns
                        )
                    );

                const y0 =
                    Math.floor(
                        row *
                        sourceHeight /
                        grid.rows
                    );

                const y1 =
                    Math.max(
                        y0 + 1,
                        Math.floor(
                            (row + 1) *
                            sourceHeight /
                            grid.rows
                        )
                    );

                let r = 0;
                let g = 0;
                let b = 0;
                let count = 0;

                const sampleStep =
                    Math.max(
                        1,
                        Math.floor(
                            Math.max(
                                x1 - x0,
                                y1 - y0
                            ) / 8
                        )
                    );

                for (
                    let y = y0;
                    y < y1;
                    y += sampleStep
                ) {

                    for (
                        let x = x0;
                        x < x1;
                        x += sampleStep
                    ) {

                        const index =
                            (y * sourceWidth + x) * 4;

                        let pixel =
                            adjustPixel(
                                data[index],
                                data[index + 1],
                                data[index + 2]
                            );

                        if (
                            isBackground(
                                pixel,
                                corner
                            )
                        ) {
                            continue;
                        }

                        r += pixel.r;
                        g += pixel.g;
                        b += pixel.b;

                        count++;
                    }
                }

                if (count === 0) {

                    rowCells.push({
                        r: corner.r,
                        g: corner.g,
                        b: corner.b,
                        empty: true,
                        colorIndex: 0
                    });

                } else {

                    rowCells.push({
                        r: r / count,
                        g: g / count,
                        b: b / count,
                        empty: false,
                        colorIndex: 0
                    });
                }
            }

            cells.push(rowCells);
        }

        return cells;
    }


    /* =====================================================
       COLOR QUANTIZATION
       ===================================================== */

    function getInitialCentroids(cells, count) {

        const points = [];

        cells.forEach(row => {
            row.forEach(cell => {

                if (!cell.empty) {
                    points.push({
                        r: cell.r,
                        g: cell.g,
                        b: cell.b
                    });
                }
            });
        });

        if (!points.length) {
            return DEFAULT_PALETTE
                .slice(0, count)
                .map(hexToRgb);
        }

        /*
         * Sort by luminance to distribute initial
         * centroids across the image.
         */

        points.sort((a, b) => {

            const la =
                a.r * 0.299 +
                a.g * 0.587 +
                a.b * 0.114;

            const lb =
                b.r * 0.299 +
                b.g * 0.587 +
                b.b * 0.114;

            return la - lb;
        });

        const centroids = [];

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const index =
                Math.floor(
                    i *
                    (points.length - 1) /
                    Math.max(1, count - 1)
                );

            centroids.push({
                ...points[index]
            });
        }

        return centroids;
    }


    function quantizeCells(cells, count) {

        const centroids =
            getInitialCentroids(
                cells,
                count
            );

        /*
         * Small k-means pass.
         */

        for (
            let iteration = 0;
            iteration < 7;
            iteration++
        ) {

            const sums =
                centroids.map(() => ({
                    r: 0,
                    g: 0,
                    b: 0,
                    count: 0
                }));

            cells.forEach(row => {

                row.forEach(cell => {

                    if (cell.empty) {
                        return;
                    }

                    let best = 0;
                    let bestDistance = Infinity;

                    for (
                        let i = 0;
                        i < centroids.length;
                        i++
                    ) {

                        const distance =
                            colorDistance(
                                cell,
                                centroids[i]
                            );

                        if (
                            distance <
                            bestDistance
                        ) {

                            bestDistance =
                                distance;

                            best = i;
                        }
                    }

                    cell.colorIndex = best;

                    sums[best].r += cell.r;
                    sums[best].g += cell.g;
                    sums[best].b += cell.b;
                    sums[best].count++;
                });
            });

            for (
                let i = 0;
                i < centroids.length;
                i++
            ) {

                if (sums[i].count) {

                    centroids[i] = {
                        r:
                            sums[i].r /
                            sums[i].count,

                        g:
                            sums[i].g /
                            sums[i].count,

                        b:
                            sums[i].b /
                            sums[i].count
                    };
                }
            }
        }

        /*
         * Recalculate indexes after final centroid update.
         */

        cells.forEach(row => {

            row.forEach(cell => {

                if (cell.empty) {
                    cell.colorIndex = -1;
                    return;
                }

                let best = 0;
                let bestDistance = Infinity;

                centroids.forEach((centroid, index) => {

                    const distance =
                        colorDistance(
                            cell,
                            centroid
                        );

                    if (distance < bestDistance) {
                        bestDistance = distance;
                        best = index;
                    }
                });

                cell.colorIndex = best;
            });
        });

        return centroids;
    }


    /* =====================================================
       REGION CLEANUP
       ===================================================== */

    /*
     * THIS is the important "pixel shape" behavior.
     *
     * We do NOT round every cell.
     *
     * Instead we remove tiny isolated color islands
     * and strengthen coherent color regions.
     *
     * This makes the projected rug easier to manufacture.
     */

    function smoothColorRegions(cells, rows, columns) {

        if (!cells.length) {
            return;
        }

        const copy =
            cells.map(row =>
                row.map(cell => ({
                    ...cell
                }))
            );

        function get(indexRow, indexCol) {

            if (
                indexRow < 0 ||
                indexRow >= rows ||
                indexCol < 0 ||
                indexCol >= columns
            ) {
                return null;
            }

            return copy[indexRow][indexCol];
        }

        for (
            let row = 0;
            row < rows;
            row++
        ) {

            for (
                let col = 0;
                col < columns;
                col++
            ) {

                const current =
                    get(row, col);

                if (!current || current.empty) {
                    continue;
                }

                const neighbors = [];

                const directions = [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ];

                directions.forEach(([dr, dc]) => {

                    const neighbor =
                        get(
                            row + dr,
                            col + dc
                        );

                    if (
                        neighbor &&
                        !neighbor.empty
                    ) {
                        neighbors.push(neighbor);
                    }
                });

                if (neighbors.length < 3) {
                    continue;
                }

                const counts = {};

                neighbors.forEach(neighbor => {

                    const index =
                        neighbor.colorIndex;

                    counts[index] =
                        (counts[index] || 0) + 1;
                });

                let dominant = null;
                let dominantCount = 0;

                Object.entries(counts)
                    .forEach(([index, count]) => {

                        if (
                            count >
                            dominantCount
                        ) {

                            dominant =
                                Number(index);

                            dominantCount =
                                count;
                        }
                    });

                /*
                 * Isolated single-cell island:
                 *
                 * replace only when at least 3/4
                 * surrounding cells agree.
                 */

                if (
                    dominant !== null &&
                    dominantCount >= 3 &&
                    dominant !== current.colorIndex
                ) {

                    cells[row][col].colorIndex =
                        dominant;
                }
            }
        }
    }


    /* =====================================================
       REGION SHAPE MASK
       ===================================================== */

    /*
     * Generates a soft visual mask around COLOR REGIONS.
     *
     * This is visual only.
     *
     * The actual grid remains rectangular.
     */

    function buildRegionMask(cells, rows, columns) {

        const mask = [];

        for (
            let row = 0;
            row < rows;
            row++
        ) {

            const maskRow = [];

            for (
                let col = 0;
                col < columns;
                col++
            ) {

                const cell =
                    cells[row][col];

                if (!cell || cell.empty) {

                    maskRow.push({
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    });

                    continue;
                }

                const index =
                    cell.colorIndex;

                const top =
                    row > 0 &&
                    cells[row - 1][col] &&
                    cells[row - 1][col].colorIndex === index;

                const right =
                    col < columns - 1 &&
                    cells[row][col + 1] &&
                    cells[row][col + 1].colorIndex === index;

                const bottom =
                    row < rows - 1 &&
                    cells[row + 1][col] &&
                    cells[row + 1][col].colorIndex === index;

                const left =
                    col > 0 &&
                    cells[row][col - 1] &&
                    cells[row][col - 1].colorIndex === index;

                maskRow.push({
                    top,
                    right,
                    bottom,
                    left
                });
            }

            mask.push(maskRow);
        }

        return mask;
    }


    /* =====================================================
       PALETTE
       ===================================================== */

    function buildPalette(centroids) {

        const available =
            state.palette.length >= state.colors
                ? state.palette
                : centroids.map(
                    color =>
                        rgbToHex(
                            color.r,
                            color.g,
                            color.b
                        )
                );

        state.palette =
            available
                .slice(0, state.colors);

        while (
            state.palette.length <
            state.colors
        ) {

            state.palette.push(
                DEFAULT_PALETTE[
                    state.palette.length %
                    DEFAULT_PALETTE.length
                ]
            );
        }

        renderPalette();
    }


    function renderPalette() {

        palette.innerHTML = "";

        state.palette.forEach(
            (color, index) => {

                const item =
                    document.createElement("div");

                item.className =
                    "palette-item";

                item.innerHTML = `
                    <input
                        type="color"
                        value="${color}"
                        data-palette-index="${index}"
                        aria-label="Color ${index + 1}"
                    >
                    <span>
                        ${letterName(index)}
                    </span>
                `;

                palette.appendChild(item);
            }
        );

        palette
            .querySelectorAll("input[type=color]")
            .forEach(input => {

                input.addEventListener(
                    "input",
                    () => {

                        const index =
                            Number(
                                input.dataset.paletteIndex
                            );

                        state.palette[index] =
                            input.value;

                        if (state.generated) {
                            renderCanvas();
                            renderLegend();
                        }
                    }
                );
            });
    }


    resetPalette.addEventListener("click", () => {

        state.palette =
            DEFAULT_PALETTE
                .slice(
                    0,
                    state.colors
                );

        renderPalette();

        if (state.generated) {
            renderCanvas();
            renderLegend();
        }
    });


    /* =====================================================
       RUG CANVAS SIZE
       ===================================================== */

    function getCanvasDimensions(grid) {

        /*
         * Canvas pixel size is independent of physical size.
         *
         * We use enough pixels to draw clean grid lines
         * and region shapes.
         */

        const maxCanvas = 1800;

        const aspect =
            state.widthCm /
            state.heightCm;

        let width = maxCanvas;
        let height =
            Math.round(
                width / aspect
            );

        if (height > maxCanvas) {

            height = maxCanvas;

            width =
                Math.round(
                    height * aspect
                );
        }

        return {
            width,
            height
        };
    }


    /* =====================================================
       CANVAS RENDER
       ===================================================== */

    function renderCanvas() {

        if (!state.cells.length) {
            return;
        }

        const grid =
            calculateGrid();

        const dimensions =
            getCanvasDimensions(grid);

        rugCanvas.width =
            dimensions.width;

        rugCanvas.height =
            dimensions.height;

        const ctx =
            rugCanvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            dimensions.width,
            dimensions.height
        );

        const cellWidth =
            dimensions.width /
            grid.columns;

        const cellHeight =
            dimensions.height /
            grid.rows;

        const regionMask =
            buildRegionMask(
                state.cells,
                grid.rows,
                grid.columns
            );

        /*
         * Draw color regions.
         *
         * Adjacent cells of the same color visually
         * merge together.
         */

        for (
            let row = 0;
            row < grid.rows;
            row++
        ) {

            for (
                let col = 0;
                col < grid.columns;
                col++
            ) {

                const cell =
                    state.cells[row][col];

                if (
                    !cell ||
                    cell.colorIndex < 0
                ) {
                    continue;
                }

                const color =
                    state.palette[
                        cell.colorIndex
                    ];

                if (!color) {
                    continue;
                }

                const x =
                    col * cellWidth;

                const y =
                    row * cellHeight;

                const mask =
                    regionMask[row][col];

                /*
                 * Shape inset only at boundaries
                 * between DIFFERENT color regions.
                 *
                 * It does NOT round every cell.
                 */

                const inset =
                    Math.min(
                        cellWidth,
                        cellHeight
                    ) * 0.055;

                let left = x;
                let top = y;
                let right =
                    x + cellWidth;
                let bottom =
                    y + cellHeight;

                if (!mask.left) {
                    left += inset;
                }

                if (!mask.top) {
                    top += inset;
                }

                if (!mask.right) {
                    right -= inset;
                }

                if (!mask.bottom) {
                    bottom -= inset;
                }

                /*
                 * Slightly rounded corners ONLY where
                 * the region boundary requires it.
                 */

                const radius =
                    Math.min(
                        cellWidth,
                        cellHeight
                    ) * 0.10;

                ctx.fillStyle = color;

                ctx.beginPath();

                ctx.moveTo(
                    left + radius,
                    top
                );

                ctx.lineTo(
                    right - radius,
                    top
                );

                ctx.quadraticCurveTo(
                    right,
                    top,
                    right,
                    top + radius
                );

                ctx.lineTo(
                    right,
                    bottom - radius
                );

                ctx.quadraticCurveTo(
                    right,
                    bottom,
                    right - radius,
                    bottom
                );

                ctx.lineTo(
                    left + radius,
                    bottom
                );

                ctx.quadraticCurveTo(
                    left,
                    bottom,
                    left,
                    bottom - radius
                );

                ctx.lineTo(
                    left,
                    top + radius
                );

                ctx.quadraticCurveTo(
                    left,
                    top,
                    left + radius,
                    top
                );

                ctx.closePath();

                ctx.fill();
            }
        }

        /*
         * PROJECTOR GRID
         *
         * Thin grid lines.
         */

        ctx.save();

        ctx.strokeStyle =
            "rgba(0,0,0,0.20)";

        ctx.lineWidth = 1;

        for (
            let col = 0;
            col <= grid.columns;
            col++
        ) {

            const x =
                Math.round(
                    col * cellWidth
                ) + 0.5;

            ctx.beginPath();

            ctx.moveTo(
                x,
                0
            );

            ctx.lineTo(
                x,
                dimensions.height
            );

            ctx.stroke();
        }

        for (
            let row = 0;
            row <= grid.rows;
            row++
        ) {

            const y =
                Math.round(
                    row * cellHeight
                ) + 0.5;

            ctx.beginPath();

            ctx.moveTo(
                0,
                y
            );

            ctx.lineTo(
                dimensions.width,
                y
            );

            ctx.stroke();
        }

        ctx.restore();

        applyCanvasZoom();
    }


    /* =====================================================
       GRID LABELS
       ===================================================== */

    function renderGridLabels() {

        const grid =
            calculateGrid();

        gridTopLabels.innerHTML = "";
        gridLeftLabels.innerHTML = "";

        /*
         * Top letters
         */

        for (
            let col = 0;
            col < grid.columns;
            col++
        ) {

            const label =
                document.createElement("div");

            label.textContent =
                letterName(col);

            label.style.flex =
                "0 0 " +
                (
                    100 /
                    grid.columns
                ) +
                "%";

            gridTopLabels.appendChild(label);
        }

        /*
         * Left numbers
         */

        for (
            let row = 0;
            row < grid.rows;
            row++
        ) {

            const label =
                document.createElement("div");

            label.textContent =
                row + 1;

            label.style.flex =
                "0 0 " +
                (
                    100 /
                    grid.rows
                ) +
                "%";

            gridLeftLabels.appendChild(label);
        }
    }


    /* =====================================================
       GRID WORKSPACE DIMENSIONS
       ===================================================== */

    function renderWorkspaceDimensions() {

        const grid =
            calculateGrid();

        /*
         * The workspace itself gets the same aspect ratio
         * as the physical rug.
         */

        const ratio =
            state.widthCm /
            state.heightCm;

        rugCanvasWrap.style.aspectRatio =
            `${ratio}`;

        /*
         * CSS grid is useful here because labels need to
         * follow the exact physical grid.
         */

        gridTopLabels.style.display =
            "grid";

        gridTopLabels.style.gridTemplateColumns =
            `repeat(${grid.columns}, minmax(0, 1fr))`;

        gridLeftLabels.style.display =
            "grid";

        gridLeftLabels.style.gridTemplateRows =
            `repeat(${grid.rows}, minmax(0, 1fr))`;
    }


    /* =====================================================
       LEGEND
       ===================================================== */

    function renderLegend() {

        colorLegend.innerHTML = "";

        state.palette
            .slice(0, state.colors)
            .forEach((color, index) => {

                const item =
                    document.createElement("div");

                item.className =
                    "legend-item";

                item.innerHTML = `
                    <span
                        class="legend-swatch"
                        style="background:${color}"
                    ></span>

                    <span class="legend-code">
                        ${letterName(index)}
                    </span>

                    <span class="legend-color">
                        ${color.toUpperCase()}
                    </span>
                `;

                colorLegend.appendChild(item);
            });
    }


    /* =====================================================
       STATISTICS
       ===================================================== */

    function renderStats(grid) {

        statColors.textContent =
            state.colors;

        statSize.textContent =
            `${state.widthCm} × ${state.heightCm} CM`;

        statGrid.textContent =
            `${grid.columns} × ${grid.rows}`;

        /*
         * Approximate loops:
         *
         * Every physical cell represents an area.
         * This is intentionally only an estimate.
         */

        const area =
            state.widthCm *
            state.heightCm;

        const loops =
            Math.round(
                area * 6.5
            );

        statLoops.textContent =
            formatNumber(loops);
    }


    /* =====================================================
       STATUS
       ===================================================== */

    function updateStatus(grid) {

        previewTitle.textContent =
            "RUG DESIGN";

        previewStatus.textContent =
            `${grid.columns} × ${grid.rows} GRID / ${state.gridCm} CM CELL`;
    }


    /* =====================================================
       MAIN GENERATOR
       ===================================================== */

    function generateRug() {

        if (!state.image) {
            return;
        }

        state.widthCm =
            Number(widthInput.value) || 100;

        state.heightCm =
            Number(heightInput.value) || 75;

        const grid =
            calculateGrid();

        const sourceCanvas =
            createSourceCanvas();

        let cells =
            sampleGrid(
                sourceCanvas,
                grid
            );

        const centroids =
            quantizeCells(
                cells,
                state.colors
            );

        /*
         * Remove tiny color islands.
         *
         * This is the actual region simplification.
         */

        smoothColorRegions(
            cells,
            grid.rows,
            grid.columns
        );

        state.cells =
            cells;

        state.gridColumns =
            grid.columns;

        state.gridRows =
            grid.rows;

        buildPalette(centroids);

        state.generated = true;

        renderWorkspaceDimensions();
        renderGridLabels();
        renderCanvas();
        renderLegend();
        renderStats(grid);
        updateStatus(grid);
    }


    /* =====================================================
       GENERATE BUTTON
       ===================================================== */

    generateButton.addEventListener(
        "click",
        () => {

            if (!state.image) {

                imageInput.click();

                return;
            }

            generateRug();

            previewStatus.textContent =
                `${state.gridColumns} × ${state.gridRows} GRID READY`;
        }
    );


    /* =====================================================
       ZOOM
       ===================================================== */

    function applyCanvasZoom() {

        rugCanvas.style.transform =
            `scale(${state.zoom})`;

        rugCanvas.style.transformOrigin =
            "center center";

        zoomValue.textContent =
            `${Math.round(state.zoom * 100)}%`;
    }


    zoomIn.addEventListener("click", () => {

        state.zoom =
            clamp(
                state.zoom + 0.1,
                MIN_ZOOM,
                MAX_ZOOM
            );

        applyCanvasZoom();
    });


    zoomOut.addEventListener("click", () => {

        state.zoom =
            clamp(
                state.zoom - 0.1,
                MIN_ZOOM,
                MAX_ZOOM
            );

        applyCanvasZoom();
    });


    zoomReset.addEventListener("click", () => {

        state.zoom = 1;

        applyCanvasZoom();
    });


    /* =====================================================
       MOUSE WHEEL ZOOM
       ===================================================== */

    rugCanvasWrap.addEventListener(
        "wheel",
        event => {

            if (!state.generated) {
                return;
            }

            /*
             * CTRL / CMD + wheel = zoom.
             *
             * Normal wheel remains normal page/workspace
             * scrolling.
             */

            if (
                event.ctrlKey ||
                event.metaKey
            ) {

                event.preventDefault();

                const direction =
                    event.deltaY > 0
                        ? -0.1
                        : 0.1;

                state.zoom =
                    clamp(
                        state.zoom + direction,
                        MIN_ZOOM,
                        MAX_ZOOM
                    );

                applyCanvasZoom();
            }
        },
        {
            passive: false
        }
    );


    /* =====================================================
       DRAG CANVAS WHEN ZOOMED
       ===================================================== */

    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let scrollStartX = 0;
    let scrollStartY = 0;

    rugCanvasWrap.addEventListener(
        "mousedown",
        event => {

            if (state.zoom <= 1) {
                return;
            }

            dragging = true;

            dragStartX =
                event.clientX;

            dragStartY =
                event.clientY;

            scrollStartX =
                rugCanvasWrap.scrollLeft;

            scrollStartY =
                rugCanvasWrap.scrollTop;

            rugCanvasWrap.style.cursor =
                "grabbing";
        }
    );


    window.addEventListener(
        "mouseup",
        () => {

            dragging = false;

            rugCanvasWrap.style.cursor =
                "";
        }
    );


    window.addEventListener(
        "mousemove",
        event => {

            if (!dragging) {
                return;
            }

            rugCanvasWrap.scrollLeft =
                scrollStartX -
                (
                    event.clientX -
                    dragStartX
                );

            rugCanvasWrap.scrollTop =
                scrollStartY -
                (
                    event.clientY -
                    dragStartY
                );
        }
    );


    /* =====================================================
       INITIAL PALETTE
       ===================================================== */

    state.palette =
        DEFAULT_PALETTE.slice(
            0,
            state.colors
        );

    state.originalPalette =
        [...state.palette];

    renderPalette();

    createGridControl();


    /* =====================================================
       INITIAL UI
       ===================================================== */

    rugWorkspace.style.display =
        "none";

    zoomValue.textContent =
        "100%";

})();
