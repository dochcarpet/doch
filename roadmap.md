# DOCH Rug Converter — Roadmap

## PHASE 0 — PROTOTYPE
Status: CURRENT

Goal:

Prove that an arbitrary image can be converted into a limited-color rug map.

### Tasks

- [x] Image upload
- [x] Drag & drop
- [x] Background presets
- [x] Color reduction
- [x] 2–12 colors
- [x] Grid preview
- [x] Palette display
- [x] Manual HEX editing
- [x] PNG export

---

# PHASE 1 — IMAGE PREPARATION

Goal:

Give the user control over the image before color conversion.

### Tasks

- [ ] Crop image
- [ ] Rotate
- [ ] Scale
- [ ] Move image
- [ ] Add margins
- [ ] Change aspect ratio
- [ ] Automatic background removal
- [ ] Manual background eraser
- [ ] Background color picker
- [ ] Background as separate palette color
- [ ] Preview transparency

Priority: HIGH

---

# PHASE 2 — SMART COLOR REDUCTION

Goal:

Make the generated rug design actually look good.

### Tasks

- [ ] Better color quantization
- [ ] Remove tiny color fragments
- [ ] Merge similar colors
- [ ] Minimum area threshold
- [ ] Edge cleanup
- [ ] Noise reduction
- [ ] Shape simplification
- [ ] Preserve important details
- [ ] Lock specific colors
- [ ] Replace individual colors
- [ ] Undo / redo

Priority: HIGH

---

# PHASE 3 — REAL YARN PALETTE

Goal:

Replace arbitrary HEX colors with real yarn.

### Tasks

- [ ] Create yarn color database
- [ ] Add yarn name
- [ ] Add manufacturer
- [ ] Add manufacturer color code
- [ ] Add HEX
- [ ] Add RGB
- [ ] Add availability
- [ ] Add stock
- [ ] Add yarn price
- [ ] Upload yarn photo

Algorithm:

IMAGE COLOR

↓

NEAREST AVAILABLE YARN

↓

THREAD ID

Priority: CRITICAL

---

# PHASE 4 — PHYSICAL RUG MODEL

Goal:

Connect the digital image with a real rug.

### Tasks

- [ ] Width input
- [ ] Height input
- [ ] Aspect ratio lock
- [ ] Grid density
- [ ] Cell size
- [ ] Border / margin
- [ ] Production area
- [ ] Calculate cell count
- [ ] Estimate yarn usage
- [ ] Estimate production time

Example:

80 × 80 cm
64 × 64 grid

Each cell corresponds to a physical section of the rug.

Priority: HIGH

---

# PHASE 5 — PRODUCTION MAP

Goal:

Create something the artist can actually use while tufting.

### Tasks

- [ ] Color-coded grid
- [ ] Grid coordinates
- [ ] Color legend
- [ ] Cell count per color
- [ ] Percentage per color
- [ ] Yarn quantity estimate
- [ ] Printable production sheet
- [ ] PDF export
- [ ] SVG export
- [ ] PNG export

Example:

BLUE
1,248 cells
30.5%

WHITE
1,012 cells
24.7%

BLACK
1,832 cells
44.8%

Priority: CRITICAL

---

# PHASE 6 — DOCH ADMIN

Goal:

Move converter into the existing admin system.

### Tasks

- [ ] Open converter from custom order
- [ ] Upload customer image
- [ ] Save source image
- [ ] Save processed image
- [ ] Save palette
- [ ] Save rug dimensions
- [ ] Save production map
- [ ] Version designs
- [ ] Reopen previous designs
- [ ] Duplicate design
- [ ] Delete design

Supabase integration.

Priority: HIGH

---

# PHASE 7 — CUSTOM ORDER FLOW

Goal:

Connect the converter to actual sales.

CUSTOMER

↓

CUSTOM RUG REQUEST

↓

IMAGE

↓

ADMIN

↓

DESIGN CONVERTER

↓

PRICE CALCULATION

↓

CUSTOMER APPROVAL

↓

PAYMENT

↓

PRODUCTION

↓

SHIPPING

Priority: HIGH

---

# PHASE 8 — AUTOMATIC PRICING

Goal:

Calculate a quote automatically.

Possible factors:

- Width
- Height
- Area
- Number of colors
- Design complexity
- Yarn cost
- Estimated production time
- Artist margin
- Shipping

Example:

80 × 80 cm
+
4 colors
+
medium complexity

↓

€XXX

---

# PHASE 9 — ADVANCED DESIGN ASSISTANT

Future.

The system could automatically suggest:

"Original"

"2 colors"

"3 colors"

"4 colors"

"6 colors"

and rank them by:

- visual quality
- complexity
- estimated cost
- production difficulty

The artist chooses the final version.

---

# PHASE 10 — CUSTOMER PREVIEW

Future.

Customer receives an interactive preview:

YOUR IMAGE

↓

YOUR RUG

↓

SIZE

↓

COLORS

↓

PRICE

↓

APPROVE

↓

PAY

---

# Important technical principle

Do NOT build the entire system at once.

Recommended order:

1. Image processing
2. Background handling
3. Color reduction
4. Yarn matching
5. Physical grid
6. Production export
7. Supabase persistence
8. Custom orders
9. Pricing
10. Customer checkout

The converter should become reliable before connecting it to payments and orders.
