/* DOCH — CUSTOM RUG
   IMAGE → YARN → RUG
   Physical grid: always 5 × 5 CM.
   Detail changes visual pixels only.
*/

(() => {
    "use strict";

    /* =========================================================
       ELEMENTS
       ========================================================= */

    const $ = id => document.getElementById(id);

    const imageInput = $("imageInput");
    const fileName = $("fileName");
    const keepBackground = $("keepBackground");
    const removeBackground = $("removeBackground");
    const colorCounts = $("colorCounts");
    const paletteElement = $("palette");
    const resetPalette = $("resetPalette");

    const widthInput = $("widthInput");
    const heightInput = $("heightInput");
    const lockRatio = $("lockRatio");

    const contrastInput = $("contrastInput");
    const brightnessInput = $("brightnessInput");
    const contrastValue = $("contrastValue");
    const brightnessValue = $("brightnessValue");

    const generateButton = $("generateButton");
    const canvas = $("rugCanvas");
    const emptyPreview = $("emptyPreview");
    const previewStatus = $("previewStatus");

    const statColors = $("statColors");
    const statSize = $("statSize");
    const statGrid = $("statGrid");
    const statLoops = $("statLoops");

    const rugWorkspace = $("rugWorkspace");
    const rugCanvasWrap = $("rugCanvasWrap");
    const gridTopLabels = $("gridTopLabels");
    const gridLeftLabels = $("gridLeftLabels");
    const colorLegend = $("colorLegend");

    const zoomIn = $("zoomIn");
    const zoomOut = $("zoomOut");
    const zoomReset = $("zoomReset");
    const zoomValue = $("zoomValue");


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
    let colorSmoothing = 0;

    let rawDetailData = null;
    let currentDetailData = null;
    let currentGrid = null;

    let zoomLevel = 1;
    let isGenerating = false;
    let renderQueued = false;
    let resizeTimer = null;


    /* =========================================================
       HELPERS
       ========================================================= */

    const clamp = (v, min, max) =>
        Math.max(min, Math.min(max, v));

    const num = (value, fallback = 0) =>
        Number(value) || fallback;

    const normalizeHex = value => {
        value = String(value || "").trim();
        if (!value.startsWith("#")) value = "#" + value;

        if (/^#[0-9a-fA-F]{3}$/.test(value)) {
            return (
                "#" +
                value[1] + value[1] +
                value[2] + value[2] +
                value[3] + value[3]
            ).toUpperCase();
        }

        return /^#[0-9a-fA-F]{6}$/.test(value)
            ? value.toUpperCase()
            : "#000000";
    };

    function hexToRgb(hex) {
        hex = normalizeHex(hex).slice(1);

        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16)
        };
    }

    function rgbToHex(r, g, b) {
        return "#" + [r, g, b]
            .map(v =>
                clamp(v, 0, 255)
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")
            .toUpperCase();
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

        while (n) {
            const r = (n - 1) % 26;
            result = String.fromCharCode(65 + r) + result;
            n = Math.floor((n - 1) / 26);
        }

        return result;
    }

    function copyMap(map) {
        return map?.map(row => row.slice()) || [];
    }

    function styleSlider(input) {
        if (!input) return;
        input.style.width = "100%";
        input.style.boxSizing = "border-box";
        input.style.cursor = "pointer";
    }

    function getPalette() {
        return customPalette.length
            ? customPalette
            : generatedPalette;
    }


    /* =========================================================
       GRID
       ========================================================= */

    function getSize() {
        return {
            width: Math.max(1, num(widthInput?.value, 100)),
            height: Math.max(1, num(heightInput?.value, 75))
        };
    }

    function calculatePhysicalGrid() {
        const { width, height } = getSize();

        return {
            width: Math.max(1, Math.round(width / GRID_CELL_CM)),
            height: Math.max(1, Math.round(height / GRID_CELL_CM))
        };
    }

    function calculateDetailGrid() {
        const { width, height } = getSize();

        const detailWidth = clamp(
            Math.round(detailLevel),
            MIN_DETAIL,
            MAX_DETAIL
        );

        return {
            width: detailWidth,
            height: Math.max(
                1,
                Math.round(detailWidth * height / width)
            )
        };
    }


    /* =========================================================
       WORKSPACE
       ========================================================= */

function setupWorkspace() {
    if (!rugWorkspace) return;

    Object.assign(rugWorkspace.style, {
        position: "relative",
        width: "100%",
        minWidth: "0",
        minHeight: "280px",
        height: "clamp(280px, 65vw, 600px)",
        overflow: "hidden",
        boxSizing: "border-box"
    });

    if (rugCanvasWrap) {
        Object.assign(rugCanvasWrap.style, {
            position: "absolute",
            inset: "0",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            minWidth: "0",
            minHeight: "0",
            boxSizing: "border-box"
        });
    }

    if (canvas) {
        Object.assign(canvas.style, {
            position: "absolute",
            display: "none",
            maxWidth: "none",
            maxHeight: "none",
            margin: "0",
            padding: "0"
        });
    }
}

function getAvailableFrame() {
    if (!rugWorkspace) {
        return {
            width: 600,
            height: 450
        };
    }

    const rect = rugWorkspace.getBoundingClientRect();

    let width = rect.width;
    let height = rect.height;

    // Mobile fallback:
    // percentage height can collapse when parent has no explicit height
    if (width <= 1) {
        width = rugWorkspace.clientWidth || window.innerWidth || 600;
    }

    if (height <= 1) {
        height = Math.max(
            280,
            Math.min(
                600,
                width * 0.75
            )
        );
    }

    return {
        width: Math.max(1, width),
        height: Math.max(1, height)
    };
}


    /* =========================================================
       IMAGE PREVIEW
       ========================================================= */

    function showLoadedImage() {
        if (!sourceImage || !canvas || !rugCanvasWrap) return;

        const frame = getAvailableFrame();
        if (frame.width <= 0 || frame.height <= 0) return;

        const ratio =
            sourceImage.naturalWidth /
            sourceImage.naturalHeight;

        let width = frame.width;
        let height = width / ratio;

        if (height > frame.height) {
            height = frame.height;
            width = height * ratio;
        }

        const x = (frame.width - width) / 2;
        const y = (frame.height - height) / 2;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));

        Object.assign(canvas.style, {
            width: `${width}px`,
            height: `${height}px`,
            left: `${x}px`,
            top: `${y}px`,
            display: "block"
        });

        const ctx = canvas.getContext("2d");

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(sourceImage, 0, 0, width, height);

        if (emptyPreview) emptyPreview.style.display = "none";
        if (previewStatus) previewStatus.textContent = "IMAGE LOADED";
    }


    /* =========================================================
       IMAGE PROCESSING
       ========================================================= */

    function processSourceImage() {
        if (!sourceImage) return null;

        const maxSize = 900;

        let width = sourceImage.naturalWidth;
        let height = sourceImage.naturalHeight;

        const scale = Math.min(
            maxSize / width,
            maxSize / height,
            1
        );

        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));

        const temp = document.createElement("canvas");
        temp.width = width;
        temp.height = height;

        const ctx = temp.getContext("2d", {
            willReadFrequently: true
        });

        ctx.drawImage(sourceImage, 0, 0, width, height);

        const imageData = ctx.getImageData(
            0,
            0,
            width,
            height
        );

        applyImageAdjustments(imageData);

        if (backgroundMode === "remove") {
            removeBackgroundPixels(imageData);
        }

        ctx.putImageData(imageData, 0, 0);

        return {
            canvas: temp,
            imageData
        };
    }

    function applyImageAdjustments(imageData) {
        const data = imageData.data;

        const brightness = num(brightnessInput?.value);
        const contrast = num(contrastInput?.value);

        const brightnessAmount = brightness * 2.55;

        const factor =
            259 * (contrast + 255) /
            (255 * (259 - contrast));

        for (let i = 0; i < data.length; i += 4) {
            data[i] = adjustChannel(
                data[i],
                brightnessAmount,
                factor
            );

            data[i + 1] = adjustChannel(
                data[i + 1],
                brightnessAmount,
                factor
            );

            data[i + 2] = adjustChannel(
                data[i + 2],
                brightnessAmount,
                factor
            );
        }
    }

    function adjustChannel(value, brightness, factor) {
        return clamp(
            factor * (value + brightness - 128) + 128,
            0,
            255
        );
    }

    function removeBackgroundPixels(imageData) {
        const { data, width, height } = imageData;

        const points = [
            0,
            (width - 1) * 4,
            (height - 1) * width * 4,
            ((height - 1) * width + width - 1) * 4
        ];

        const bg = { r: 0, g: 0, b: 0 };

        for (const i of points) {
            bg.r += data[i];
            bg.g += data[i + 1];
            bg.b += data[i + 2];
        }

        bg.r /= 4;
        bg.g /= 4;
        bg.b /= 4;

        const threshold = 55;

        for (let i = 0; i < data.length; i += 4) {
            const color = {
                r: data[i],
                g: data[i + 1],
                b: data[i + 2]
            };

            if (colorDistance(color, bg) < threshold) {
                data[i + 3] = 0;
            }
        }
    }


    /* =========================================================
       PALETTE
       ========================================================= */

    function extractPalette(imageData, count) {
        const data = imageData.data;
        const buckets = new Map();

        for (let i = 0; i < data.length; i += 80) {
            if (data[i + 3] < 30) continue;

            const r = Math.floor(data[i] / 16) * 16;
            const g = Math.floor(data[i + 1] / 16) * 16;
            const b = Math.floor(data[i + 2] / 16) * 16;

            const key = `${r},${g},${b}`;
            buckets.set(key, (buckets.get(key) || 0) + 1);
        }

        const sorted = [...buckets.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 80)
            .map(([key, weight]) => {
                const [r, g, b] = key.split(",").map(Number);
                return { r, g, b, weight };
            });

        if (!sorted.length) {
            return DEFAULT_PALETTE.slice(0, count);
        }

        const result = [sorted[0]];

        while (
            result.length < count &&
            result.length < sorted.length
        ) {
            let best = null;
            let bestScore = -Infinity;

            for (const candidate of sorted) {
                if (
                    result.some(
                        selected =>
                            colorDistance(selected, candidate) < 12
                    )
                ) continue;

                let minimum = Infinity;

                for (const selected of result) {
                    minimum = Math.min(
                        minimum,
                        colorDistance(selected, candidate)
                    );
                }

                const score =
                    minimum +
                    Math.log(candidate.weight + 1) * 3;

                if (score > bestScore) {
                    bestScore = score;
                    best = candidate;
                }
            }

            if (!best) break;
            result.push(best);
        }

        return result.map(c =>
            rgbToHex(c.r, c.g, c.b)
        );
    }


    /* =========================================================
       DETAIL MAP
       ========================================================= */

    function createDetailMap(processed, grid, palette) {
        const sourceCanvas = processed.canvas;

        const ctx = sourceCanvas.getContext("2d", {
            willReadFrequently: true
        });

        const sourceData = ctx.getImageData(
            0,
            0,
            sourceCanvas.width,
            sourceCanvas.height
        );

        const rgbPalette = palette.map(hexToRgb);

        return Array.from(
            { length: grid.height },
            (_, y) => {
                const row = new Array(grid.width);

                const sy = Math.floor(
                    y / grid.height * sourceCanvas.height
                );

                const ey = Math.max(
                    sy + 1,
                    Math.floor(
                        (y + 1) /
                        grid.height *
                        sourceCanvas.height
                    )
                );

                for (let x = 0; x < grid.width; x++) {
                    const sx = Math.floor(
                        x / grid.width *
                        sourceCanvas.width
                    );

                    const ex = Math.max(
                        sx + 1,
                        Math.floor(
                            (x + 1) /
                            grid.width *
                            sourceCanvas.width
                        )
                    );

                    let r = 0;
                    let g = 0;
                    let b = 0;
                    let count = 0;

                    for (let py = sy; py < ey; py++) {
                        for (let px = sx; px < ex; px++) {
                            const i =
                                (py * sourceCanvas.width + px) * 4;

                            if (sourceData.data[i + 3] < 30) continue;

                            r += sourceData.data[i];
                            g += sourceData.data[i + 1];
                            b += sourceData.data[i + 2];
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

                    let nearest = rgbPalette[0];
                    let nearestDistance = Infinity;

                    for (const color of rgbPalette) {
                        const distance =
                            colorDistance(average, color);

                        if (distance < nearestDistance) {
                            nearestDistance = distance;
                            nearest = color;
                        }
                    }

                    row[x] = rgbToHex(
                        nearest.r,
                        nearest.g,
                        nearest.b
                    );
                }

                return row;
            }
        );
    }


    /* =========================================================
       SMOOTHING
       ========================================================= */

    function smoothColorMap(map, amount) {
        if (!map?.length || amount <= 0) return map;

        const height = map.length;
        const width = map[0]?.length || 0;

        if (!width || !height) return map;

        const threshold = 8 + amount / 100 * 52;
        const passes = Math.max(
            1,
            Math.round(1 + amount / 25)
        );

        let result = copyMap(map);

        for (let pass = 0; pass < passes; pass++) {
            const next = copyMap(result);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const current = result[y][x];
                    if (!current) continue;

                    const neighbors = getMapNeighbors(
                        result,
                        x,
                        y
                    );

                    const counts = new Map();

                    for (const color of neighbors) {
                        if (color) {
                            counts.set(
                                color,
                                (counts.get(color) || 0) + 1
                            );
                        }
                    }

                    let bestColor = null;
                    let bestCount = 0;

                    for (const [color, count] of counts) {
                        if (color === current) continue;

                        if (
                            colorDistance(
                                hexToRgb(current),
                                hexToRgb(color)
                            ) > threshold
                        ) continue;

                        if (count > bestCount) {
                            bestCount = count;
                            bestColor = color;
                        }
                    }

                    const required =
                        amount < 25 ? 3 : 2;

                    if (
                        bestColor &&
                        bestCount >= required
                    ) {
                        next[y][x] = bestColor;
                    }
                }
            }

            result = next;
        }

        return amount >= 20
            ? removeSmallColorIslands(
                result,
                threshold,
                amount
            )
            : result;
    }

    function getMapNeighbors(map, x, y) {
        const height = map.length;
        const width = map[0]?.length || 0;
        const result = [];

        if (x > 0) result.push(map[y][x - 1]);
        if (x < width - 1) result.push(map[y][x + 1]);
        if (y > 0) result.push(map[y - 1][x]);
        if (y < height - 1) result.push(map[y + 1][x]);

        return result;
    }

    function removeSmallColorIslands(
        map,
        colorThreshold,
        amount
    ) {
        const height = map.length;
        const width = map[0]?.length || 0;

        if (!width || !height) return map;

        const result = copyMap(map);

        const maxIslandSize = Math.round(
            1 + amount / 100 * 14
        );

        const visited = Array.from(
            { length: height },
            () => Array(width).fill(false)
        );

        const neighbors = (x, y) => {
            const list = [];

            if (x > 0) list.push([x - 1, y]);
            if (x < width - 1) list.push([x + 1, y]);
            if (y > 0) list.push([x, y - 1]);
            if (y < height - 1) list.push([x, y + 1]);

            return list;
        };

        for (let startY = 0; startY < height; startY++) {
            for (let startX = 0; startX < width; startX++) {
                if (visited[startY][startX]) continue;

                const color = result[startY][startX];

                if (!color) {
                    visited[startY][startX] = true;
                    continue;
                }

                const component = [];
                const queue = [[startX, startY]];

                visited[startY][startX] = true;

                while (queue.length) {
                    const [x, y] = queue.shift();

                    component.push([x, y]);

                    if (component.length > maxIslandSize) {
                        break;
                    }

                    for (const [nx, ny] of neighbors(x, y)) {
                        if (visited[ny][nx]) continue;
                        if (result[ny][nx] !== color) continue;

                        visited[ny][nx] = true;
                        queue.push([nx, ny]);
                    }
                }

                if (component.length > maxIslandSize) {
                    continue;
                }

                let replacement = null;
                let replacementScore = Infinity;

                for (const [x, y] of component) {
                    for (const [nx, ny] of neighbors(x, y)) {
                        const neighborColor = result[ny][nx];

                        if (
                            !neighborColor ||
                            neighborColor === color
                        ) continue;

                        const distance = colorDistance(
                            hexToRgb(color),
                            hexToRgb(neighborColor)
                        );

                        if (
                            distance <= colorThreshold &&
                            distance < replacementScore
                        ) {
                            replacementScore = distance;
                            replacement = neighborColor;
                        }
                    }
                }

                if (replacement) {
                    for (const [x, y] of component) {
                        result[y][x] = replacement;
                    }
                }
            }
        }

        return result;
    }


    /* =========================================================
       CELL / CANVAS
       ========================================================= */

    function drawCell(ctx, x, y, width, height, color) {
        if (!color) return;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }

    function getPhysicalFrame() {
        const frame = getAvailableFrame();

        const ratio =
            currentGrid.width /
            currentGrid.height;

        let width = frame.width;
        let height = width / ratio;

        if (height > frame.height) {
            height = frame.height;
            width = height * ratio;
        }

        return {
            frame,
            width: Math.max(10, width - 4),
            height: Math.max(10, height - 4)
        };
    }


    /* =========================================================
       RENDER PREVIEW
       ========================================================= */

    function renderPreview() {
        if (!canvas || !currentDetailData || !currentGrid) {
            return;
        }

        const { frame, width, height } = getPhysicalFrame();

        if (frame.width <= 5 || frame.height <= 5) return;

        const visualWidth = width * zoomLevel;
         const visualHeight = height * zoomLevel;
         
         const left = Math.max(
             0,
             (frame.width - visualWidth) / 2
         );
         
         const top = Math.max(
             0,
             (frame.height === visualHeight
                 ? 0
                 : (frame.height - visualHeight) / 2) +
             (frame.frameOffsetY || 0)
         );

        const dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        canvas.width = Math.max(
            1,
            Math.round(visualWidth * dpr)
        );

        canvas.height = Math.max(
            1,
            Math.round(visualHeight * dpr)
        );

        Object.assign(canvas.style, {
            width: `${visualWidth}px`,
            height: `${visualHeight}px`,
            left: `${left}px`,
            top: `${top}px`,
            display: "block"
        });

        const ctx = canvas.getContext("2d");

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, visualWidth, visualHeight);

        ctx.fillStyle = "#11110f";
        ctx.fillRect(0, 0, visualWidth, visualHeight);

        const data = currentDetailData.data;
        const cellWidth =
            visualWidth / currentDetailData.width;
        const cellHeight =
            visualHeight / currentDetailData.height;

        for (let y = 0; y < currentDetailData.height; y++) {
            for (let x = 0; x < currentDetailData.width; x++) {
                drawCell(
                    ctx,
                    x * cellWidth,
                    y * cellHeight,
                    cellWidth,
                    cellHeight,
                    data[y][x]
                );
            }
        }

        drawPhysicalGrid(
            ctx,
            visualWidth,
            visualHeight
        );

        ctx.strokeStyle = "rgba(255,255,255,.8)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
            0.75,
            0.75,
            visualWidth - 1.5,
            visualHeight - 1.5
        );

        if (zoomValue) {
            zoomValue.textContent =
                `${Math.round(zoomLevel * 100)}%`;
        }

        renderGridLabels();
        updateStats();
    }

    function drawPhysicalGrid(ctx, width, height) {
        if (!currentGrid) return;

        const cellWidth = width / currentGrid.width;
        const cellHeight = height / currentGrid.height;

        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,.32)";
        ctx.lineWidth = 1;

        for (let x = 1; x < currentGrid.width; x++) {
            const px = Math.round(x * cellWidth) + 0.5;

            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, height);
            ctx.stroke();
        }

        for (let y = 1; y < currentGrid.height; y++) {
            const py = Math.round(y * cellHeight) + 0.5;

            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(width, py);
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
        ) return;

        gridTopLabels.innerHTML = "";
        gridLeftLabels.innerHTML = "";

        const { frame, width, height } = getPhysicalFrame();

        const left = (frame.width - width) / 2;
        const top = (frame.height - height) / 2;

        Object.assign(gridTopLabels.style, {
            position: "absolute",
            left: `${left}px`,
            top: `${Math.max(0, top - 18)}px`,
            width: `${width}px`,
            height: "16px",
            display: "flex",
            justifyContent: "space-around",
            pointerEvents: "none"
        });

        Object.assign(gridLeftLabels.style, {
            position: "absolute",
            left: `${Math.max(0, left - 22)}px`,
            top: `${top}px`,
            width: "20px",
            height: `${height}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            pointerEvents: "none"
        });

        for (let x = 0; x < currentGrid.width; x++) {
            const span = document.createElement("span");
            span.textContent = columnLabel(x);
            span.style.textAlign = "center";
            gridTopLabels.appendChild(span);
        }

        for (let y = 0; y < currentGrid.height; y++) {
            const span = document.createElement("span");
            span.textContent = y + 1;
            span.style.textAlign = "center";
            gridLeftLabels.appendChild(span);
        }
    }


    /* =========================================================
       PALETTE UI
       ========================================================= */

    function renderPalette(palette) {
        if (!paletteElement) return;

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
                >×</button>
            `;

            paletteElement.appendChild(row);
        });
    }

    if (paletteElement) {
        paletteElement.addEventListener("input", e => {
            const index = e.target.dataset.paletteIndex;
            if (index === undefined) return;

            if (e.target.type === "color") {
                const value = normalizeHex(e.target.value);
                customPalette[Number(index)] = value;

                const text = paletteElement.querySelector(
                    `.palette-hex[data-palette-index="${index}"]`
                );

                if (text) text.value = value;

                queueGenerate();
            }
        });

        paletteElement.addEventListener("change", e => {
            const index = e.target.dataset.paletteIndex;
            if (index === undefined) return;

            if (e.target.classList.contains("palette-hex")) {
                const value = normalizeHex(e.target.value);

                customPalette[Number(index)] = value;
                e.target.value = value;

                const color = paletteElement.querySelector(
                    `.palette-color[data-palette-index="${index}"]`
                );

                if (color) color.value = value;

                queueGenerate();
            }
        });

        paletteElement.addEventListener("click", e => {
            const button = e.target.closest(
                "[data-palette-delete]"
            );

            if (!button) return;

            const index = Number(button.dataset.paletteDelete);

            if (!customPalette.length) {
                customPalette = [...generatedPalette];
            }

            customPalette.splice(index, 1);

            if (!customPalette.length) {
                customPalette = ["#000000"];
            }

            generatedPalette = [...customPalette];
            renderPalette(generatedPalette);
            queueGenerate();
        });
    }


    /* =========================================================
       EXTRA CONTROLS
       ========================================================= */

    function createExtraControls() {
        $("rugSmoothingControl")?.remove();
        $("rugDetailControl")?.remove();

        if (!paletteElement) return;

        const paletteSection =
            paletteElement.closest(".control-section");

        const smoothing = document.createElement("div");

        smoothing.id = "rugSmoothingControl";
        smoothing.className = "control-section";

        smoothing.innerHTML = `
            <div class="section-label">
                <span>04A</span> COLOR SMOOTHING
            </div>

            <div style="
                display:grid;
                grid-template-columns:1fr auto;
                gap:10px;
                align-items:center;
            ">
                <input
                    id="rugSmoothingInput"
                    type="range"
                    min="0"
                    max="100"
                    value="${colorSmoothing}"
                    step="1"
                >

                <output
                    id="rugSmoothingValue"
                    style="
                        min-width:90px;
                        text-align:right;
                        font-family:'DM Mono',monospace;
                        font-size:10px;
                    "
                >NONE</output>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                margin-top:6px;
                font-family:'DM Mono',monospace;
                font-size:8px;
                opacity:.5;
            ">
                <span>NONE</span>
                <span>STRONG</span>
            </div>

            <p class="control-note">
                Merges nearby colors and removes small
                color noise. Pixel shape stays square.
            </p>
        `;

        if (paletteSection) {
            paletteSection.after(smoothing);
        } else {
            paletteElement.after(smoothing);
        }

        const smoothingInput = $("rugSmoothingInput");
        const smoothingValue = $("rugSmoothingValue");

        styleSlider(smoothingInput);

        const updateSmoothingLabel = () => {
            smoothingValue.textContent =
                colorSmoothing <= 5 ? "NONE" :
                colorSmoothing < 30 ? "LIGHT" :
                colorSmoothing < 60 ? "MEDIUM" :
                colorSmoothing < 85 ? "STRONG" :
                "MAXIMUM";
        };

        updateSmoothingLabel();

        smoothingInput.addEventListener("input", () => {
            colorSmoothing = clamp(
                num(smoothingInput.value),
                0,
                100
            );

            updateSmoothingLabel();

            if (!rawDetailData) return;

            currentDetailData = {
                width: rawDetailData.width,
                height: rawDetailData.height,
                data: colorSmoothing
                    ? smoothColorMap(
                        rawDetailData.data,
                        colorSmoothing
                    )
                    : copyMap(rawDetailData.data)
            };

            renderPreview();
            renderColorLegend(
                currentDetailData.data,
                getPalette()
            );
            updateStats();
        });

        const detail = document.createElement("div");

        detail.id = "rugDetailControl";
        detail.className = "control-section";

        detail.innerHTML = `
            <div class="section-label">
                <span>04B</span> DETAIL
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
                >${detailLevel}</output>
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

        smoothing.after(detail);

        const detailInput = $("rugDetailInput");
        const detailValue = $("rugDetailValue");

        styleSlider(detailInput);

        detailInput.addEventListener("input", () => {
            detailLevel = clamp(
                num(detailInput.value, DEFAULT_DETAIL),
                MIN_DETAIL,
                MAX_DETAIL
            );

            detailValue.textContent = detailLevel;
            queueGenerate();
        });
    }


    /* =========================================================
       COLOR LEGEND
       ========================================================= */

    function getColorCounts(data) {
        const counts = new Map();

        data.forEach(row => {
            row.forEach(color => {
                if (!color) return;
                counts.set(
                    color,
                    (counts.get(color) || 0) + 1
                );
            });
        });

        return counts;
    }

    function renderColorLegend(data, palette) {
        if (!colorLegend) return;

        colorLegend.innerHTML = "";

        const counts = getColorCounts(data);

        palette.forEach((hex, index) => {
            const normalized = normalizeHex(hex);
            const item = document.createElement("div");

            item.className = "legend-item";

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
                    ${(counts.get(normalized) || 0).toLocaleString()}
                    CELLS
                </div>
            `;

            colorLegend.appendChild(item);
        });
    }


    /* =========================================================
       STATS
       ========================================================= */

    function updateStats() {
        const { width, height } = getSize();

        if (statColors) {
            statColors.textContent =
                customPalette.length || numberOfColors;
        }

        if (statSize) {
            statSize.textContent =
                `${width} × ${height} CM`;
        }

        if (statGrid && currentGrid) {
            statGrid.textContent =
                `${currentGrid.width} × ${currentGrid.height}`;
        }

        if (statLoops && currentDetailData) {
            statLoops.textContent =
                (
                    currentDetailData.width *
                    currentDetailData.height
                ).toLocaleString();
        }
    }


    /* =========================================================
       GENERATION
       ========================================================= */

    function queueGenerate() {
        if (!sourceImage || renderQueued) return;

        renderQueued = true;

        requestAnimationFrame(() => {
            renderQueued = false;
            generateRug();
        });
    }

    function generateRug() {
        if (!sourceImage || isGenerating) return;

        isGenerating = true;

        if (previewStatus) {
            previewStatus.textContent = "PROCESSING…";
        }

        setTimeout(() => {
            try {
                const processed = processSourceImage();

                if (!processed) return;

                if (!customPalette.length) {
                    generatedPalette = extractPalette(
                        processed.imageData,
                        numberOfColors
                    );

                    renderPalette(generatedPalette);
                }

                const palette = getPalette();

                if (!palette.length) {
                    throw new Error("Palette is empty.");
                }

                const detailGrid = calculateDetailGrid();

                const detailData = createDetailMap(
                    processed,
                    detailGrid,
                    palette
                );

                rawDetailData = {
                    width: detailGrid.width,
                    height: detailGrid.height,
                    data: copyMap(detailData)
                };

                currentDetailData = {
                    width: detailGrid.width,
                    height: detailGrid.height,
                    data: colorSmoothing
                        ? smoothColorMap(
                            rawDetailData.data,
                            colorSmoothing
                        )
                        : copyMap(rawDetailData.data)
                };

                currentGrid = calculatePhysicalGrid();

                renderPreview();

                renderColorLegend(
                    currentDetailData.data,
                    palette
                );

                updateStats();

                if (emptyPreview) {
                    emptyPreview.style.display = "none";
                }

                if (previewStatus) {
                    previewStatus.textContent = "RUG READY";
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
                isGenerating = false;
            }
        }, 10);
    }


    /* =========================================================
       PALETTE RESET
       ========================================================= */

    if (resetPalette) {
        resetPalette.addEventListener("click", () => {
            customPalette = [];

            if (sourceImage) {
                generateRug();
            } else {
                generatedPalette =
                    DEFAULT_PALETTE.slice(
                        0,
                        numberOfColors
                    );

                renderPalette(generatedPalette);
            }
        });
    }


    /* =========================================================
       IMAGE UPLOAD
       ========================================================= */

    if (imageInput) {
        imageInput.addEventListener("change", e => {
            const file = e.target.files?.[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select an image.");
                return;
            }

            if (fileName) {
                fileName.textContent = file.name;
            }

            const url = URL.createObjectURL(file);
            const img = new Image();

            img.onload = () => {
                sourceImage = img;

                originalRatio =
                    img.naturalWidth /
                    img.naturalHeight;

                if (lockRatio?.checked) {
                    updateHeightFromWidth();
                }

                showLoadedImage();

                if (previewStatus) {
                    previewStatus.textContent =
                        "IMAGE LOADED";
                }

                requestAnimationFrame(generateRug);

                URL.revokeObjectURL(url);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                alert("Could not load this image.");
            };

            img.src = url;
        });
    }


    /* =========================================================
       BACKGROUND
       ========================================================= */

    function setBackgroundMode(mode) {
        backgroundMode = mode;

        keepBackground?.classList.toggle(
            "active",
            mode === "keep"
        );

        removeBackground?.classList.toggle(
            "active",
            mode === "remove"
        );

        queueGenerate();
    }

    keepBackground?.addEventListener(
        "click",
        () => setBackgroundMode("keep")
    );

    removeBackground?.addEventListener(
        "click",
        () => setBackgroundMode("remove")
    );


    /* =========================================================
       COLORS
       ========================================================= */

    if (colorCounts) {
        colorCounts.addEventListener("click", e => {
            const button = e.target.closest("[data-colors]");
            if (!button) return;

            numberOfColors =
                Number(button.dataset.colors);

            colorCounts
                .querySelectorAll("button")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            customPalette = [];

            if (sourceImage) {
                generateRug();
            } else {
                generatedPalette =
                    DEFAULT_PALETTE.slice(
                        0,
                        numberOfColors
                    );

                renderPalette(generatedPalette);
            }
        });
    }


    /* =========================================================
       SIZE
       ========================================================= */

    function updateHeightFromWidth() {
        if (!lockRatio?.checked) return;

        const width = num(widthInput?.value);

        if (!width || !originalRatio) return;

        heightInput.value = Math.max(
            1,
            Math.round(width / originalRatio)
        );
    }

    widthInput?.addEventListener("input", () => {
        updateHeightFromWidth();
        queueGenerate();
    });

    heightInput?.addEventListener(
        "input",
        queueGenerate
    );

    lockRatio?.addEventListener("change", () => {
        if (lockRatio.checked) {
            updateHeightFromWidth();
        }

        queueGenerate();
    });


    /* =========================================================
       IMAGE ADJUSTMENTS
       ========================================================= */

    contrastInput?.addEventListener("input", () => {
        if (contrastValue) {
            contrastValue.textContent =
                contrastInput.value;
        }

        queueGenerate();
    });

    brightnessInput?.addEventListener("input", () => {
        if (brightnessValue) {
            brightnessValue.textContent =
                brightnessInput.value;
        }

        queueGenerate();
    });


    /* =========================================================
       ZOOM
       ========================================================= */

    function applyZoom() {
        if (currentDetailData) {
            renderPreview();
        }
    }

    zoomIn?.addEventListener("click", () => {
        zoomLevel = clamp(
            zoomLevel + ZOOM_STEP,
            MIN_ZOOM,
            MAX_ZOOM
        );

        applyZoom();
    });

    zoomOut?.addEventListener("click", () => {
        zoomLevel = clamp(
            zoomLevel - ZOOM_STEP,
            MIN_ZOOM,
            MAX_ZOOM
        );

        applyZoom();
    });

    zoomReset?.addEventListener("click", () => {
        zoomLevel = 1;
        applyZoom();
    });


    /* =========================================================
       GENERATE BUTTON
       ========================================================= */

    generateButton?.addEventListener("click", () => {
        if (!sourceImage) {
            imageInput?.click();
            return;
        }

        generateRug();
    });


    /* =========================================================
       RESIZE
       ========================================================= */

    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            if (currentDetailData) {
                renderPreview();
            } else if (sourceImage) {
                showLoadedImage();
            }
        }, 100);
    });


    /* =========================================================
       EXPORT CONTROLS
       ========================================================= */

    function createExportControls() {
        if ($("rugExportControls")) return;

        const container = document.createElement("div");

        container.id = "rugExportControls";

        container.style.cssText = `
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:8px;
            margin-top:12px;
        `;

        const download = document.createElement("button");
        const projector = document.createElement("button");

        download.type = "button";
        download.textContent = "DOWNLOAD PNG";

        projector.type = "button";
        projector.textContent = "PROJECTOR MODE";

        download.style.cssText = `
            min-height:52px;
            border:1px solid #292925;
            background:transparent;
            color:#f2f0ea;
            cursor:pointer;
            font:10px "DM Mono",monospace;
        `;

        projector.style.cssText = `
            min-height:52px;
            border:1px solid #292925;
            background:#f2f0ea;
            color:#0b0b0a;
            cursor:pointer;
            font:10px "DM Mono",monospace;
        `;

        download.addEventListener(
            "click",
            downloadRugPNG
        );

        projector.addEventListener(
            "click",
            openProjectorMode
        );

        container.append(download, projector);

        document
            .querySelector(".preview-panel")
            ?.appendChild(container);
    }


    /* =========================================================
       PNG EXPORT
       ========================================================= */

    function downloadRugPNG() {
        if (!currentDetailData || !currentGrid) {
            alert("Generate the rug first.");
            return;
        }

        const { width, height } = getSize();

        const CELL = 20;
        const LABEL = 55;
        const HEADER = 90;
        const LEGEND = 150;

        const imageWidth =
            currentDetailData.width * CELL;

        const imageHeight =
            currentDetailData.height * CELL;

        const exportWidth =
            LABEL + imageWidth + 40;

        const exportHeight =
            HEADER + imageHeight + LEGEND;

        const out = document.createElement("canvas");

        out.width = exportWidth;
        out.height = exportHeight;

        const ctx = out.getContext("2d");

        ctx.fillStyle = "#11110f";
        ctx.fillRect(
            0,
            0,
            exportWidth,
            exportHeight
        );

        ctx.fillStyle = "#f2f0ea";
        ctx.font = "bold 22px Arial";
        ctx.fillText(
            "DOCH / RUG GRID",
            25,
            32
        );

        ctx.fillStyle = "#77746d";
        ctx.font = "12px Arial";

        ctx.fillText(
            `${width} × ${height} CM · ` +
            `${currentGrid.width} × ${currentGrid.height} GRID · ` +
            `${GRID_CELL_CM} CM CELL · ` +
            `${numberOfColors} COLORS · ` +
            `DETAIL ${detailLevel} · ` +
            `SMOOTHING ${colorSmoothing}`,
            25,
            58
        );

        const imageX = LABEL;
        const imageY = HEADER;
        const data = currentDetailData.data;

        /* Detail */

        for (let y = 0; y < currentDetailData.height; y++) {
            for (let x = 0; x < currentDetailData.width; x++) {
                drawCell(
                    ctx,
                    imageX + x * CELL,
                    imageY + y * CELL,
                    CELL,
                    CELL,
                    data[y][x]
                );
            }
        }

        /* Physical grid */

        const gridWidth =
            imageWidth / currentGrid.width;

        const gridHeight =
            imageHeight / currentGrid.height;

        ctx.strokeStyle =
            "rgba(255,255,255,.35)";

        ctx.lineWidth = 1;

        for (let x = 0; x <= currentGrid.width; x++) {
            const px =
                imageX +
                x * gridWidth +
                0.5;

            ctx.beginPath();
            ctx.moveTo(px, imageY);
            ctx.lineTo(
                px,
                imageY + imageHeight
            );
            ctx.stroke();
        }

        for (let y = 0; y <= currentGrid.height; y++) {
            const py =
                imageY +
                y * gridHeight +
                0.5;

            ctx.beginPath();
            ctx.moveTo(imageX, py);
            ctx.lineTo(
                imageX + imageWidth,
                py
            );
            ctx.stroke();
        }

        /* Border */

        ctx.strokeStyle = "#f2f0ea";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            imageX,
            imageY,
            imageWidth,
            imageHeight
        );

        /* Labels */

        ctx.fillStyle = "#aaa79f";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";

        for (let x = 0; x < currentGrid.width; x++) {
            ctx.fillText(
                columnLabel(x),
                imageX +
                    x * gridWidth +
                    gridWidth / 2,
                imageY - 10
            );
        }

        ctx.textAlign = "right";

        for (let y = 0; y < currentGrid.height; y++) {
            ctx.fillText(
                String(y + 1),
                imageX - 8,
                imageY +
                    y * gridHeight +
                    gridHeight / 2 +
                    3
            );
        }

        /* Legend */

        const legendY =
            imageY +
            imageHeight +
            30;

        ctx.textAlign = "left";
        ctx.fillStyle = "#f2f0ea";
        ctx.font = "bold 12px Arial";

        ctx.fillText(
            "COLOR LEGEND",
            25,
            legendY
        );

        const counts = getColorCounts(data);
        const palette = getPalette();

        palette.forEach((hex, index) => {
            const normalized = normalizeHex(hex);

            const itemX =
                25 +
                (index % 4) * 190;

            const itemY =
                legendY +
                25 +
                Math.floor(index / 4) * 30;

            ctx.fillStyle = normalized;

            ctx.fillRect(
                itemX,
                itemY - 11,
                18,
                18
            );

            ctx.strokeStyle = "#77746d";
            ctx.strokeRect(
                itemX,
                itemY - 11,
                18,
                18
            );

            ctx.fillStyle = "#f2f0ea";
            ctx.font = "11px Arial";

            ctx.fillText(
                `COLOR ${index + 1}`,
                itemX + 27,
                itemY
            );

            ctx.fillStyle = "#77746d";

            ctx.fillText(
                `${normalized} · ` +
                `${(
                    counts.get(normalized) || 0
                ).toLocaleString()}`,
                itemX + 27,
                itemY + 14
            );
        });

        const link = document.createElement("a");

        link.download =
            `doch-rug-${width}x${height}cm-` +
            `${currentGrid.width}x${currentGrid.height}-` +
            `detail-${detailLevel}-` +
            `smoothing-${colorSmoothing}.png`;

        link.href = out.toDataURL("image/png");
        link.click();
    }


    /* =========================================================
       PROJECTOR MODE
       ========================================================= */

    function openProjectorMode() {
        if (!currentDetailData || !currentGrid) {
            alert("Generate the rug first.");
            return;
        }

        const overlay = document.createElement("div");

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

        const { width, height } = getSize();
        const ratio = width / height;

        const workspace = document.createElement("div");

        workspace.style.cssText = `
            position:relative;
            width:min(90vw,82vh * ${ratio});
            aspect-ratio:${ratio};
        `;

        const projectorCanvas =
            document.createElement("canvas");

        const renderWidth = 1200;
        const renderHeight =
            Math.round(renderWidth / ratio);

        projectorCanvas.width = renderWidth;
        projectorCanvas.height = renderHeight;

        projectorCanvas.style.cssText = `
            position:absolute;
            inset:0;
            width:100%;
            height:100%;
        `;

        const ctx =
            projectorCanvas.getContext("2d");

        ctx.fillStyle = "#11110f";
        ctx.fillRect(
            0,
            0,
            renderWidth,
            renderHeight
        );

        /* Detail */

        const detailWidth =
            currentDetailData.width;

        const detailHeight =
            currentDetailData.height;

        const cellWidth =
            renderWidth / detailWidth;

        const cellHeight =
            renderHeight / detailHeight;

        for (let y = 0; y < detailHeight; y++) {
            for (let x = 0; x < detailWidth; x++) {
                drawCell(
                    ctx,
                    x * cellWidth,
                    y * cellHeight,
                    cellWidth,
                    cellHeight,
                    currentDetailData.data[y][x]
                );
            }
        }

        /* Physical grid */

        const gridCellWidth =
            renderWidth / currentGrid.width;

        const gridCellHeight =
            renderHeight / currentGrid.height;

        ctx.strokeStyle =
            "rgba(255,255,255,.35)";

        ctx.lineWidth = 1;

        for (let x = 1; x < currentGrid.width; x++) {
            const px =
                x * gridCellWidth + 0.5;

            ctx.beginPath();
            ctx.moveTo(px, 0);
            ctx.lineTo(px, renderHeight);
            ctx.stroke();
        }

        for (let y = 1; y < currentGrid.height; y++) {
            const py =
                y * gridCellHeight + 0.5;

            ctx.beginPath();
            ctx.moveTo(0, py);
            ctx.lineTo(renderWidth, py);
            ctx.stroke();
        }

        ctx.strokeStyle =
            "rgba(255,255,255,.8)";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            1,
            1,
            renderWidth - 2,
            renderHeight - 2
        );

        workspace.appendChild(projectorCanvas);
        overlay.appendChild(workspace);

        /* Info */

        const info = document.createElement("div");

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
                · SMOOTHING ${colorSmoothing}
            </span>
        `;

        overlay.appendChild(info);

        /* Close */

        const close = document.createElement("button");

        close.type = "button";
        close.textContent = "EXIT PROJECTOR";

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

        close.onclick = () => {
            if (document.fullscreenElement) {
                document
                    .exitFullscreen()
                    .catch(() => {});
            }

            overlay.remove();
        };

        overlay.appendChild(close);
        document.body.appendChild(overlay);

        overlay.requestFullscreen?.().catch(() => {});
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

    renderPalette(generatedPalette);

    if (contrastValue && contrastInput) {
        contrastValue.textContent =
            contrastInput.value;
    }

    if (brightnessValue && brightnessInput) {
        brightnessValue.textContent =
            brightnessInput.value;
    }

    currentGrid = calculatePhysicalGrid();
    updateStats();

    if (rugCanvasWrap) {
        rugCanvasWrap.scrollLeft = 0;
        rugCanvasWrap.scrollTop = 0;
    }

    requestAnimationFrame(() => {
        if (sourceImage) {
            showLoadedImage();
        }
    });

})();
