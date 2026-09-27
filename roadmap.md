# DOCH Rug Converter — Roadmap

## PHASE 0 — PROTOTYPE

Status: CURRENT

Goal:

Prove that an arbitrary image can be converted into a limited-color rug map.

### Tasks

* [x] Image upload
* [x] Drag & drop
* [x] Background presets
* [x] Color reduction
* [x] 2–12 colors
* [x] Grid preview
* [x] Palette display
* [x] Manual HEX editing
* [x] PNG export

---

# PHASE 1 — IMAGE PREPARATION

Goal:

Give the user control over the image before color conversion.

### Tasks

* [ ] Crop image
* [ ] Rotate
* [ ] Scale
* [ ] Move image
* [ ] Add margins
* [ ] Change aspect ratio
* [ ] Automatic background removal
* [ ] Manual background eraser
* [ ] Background color picker
* [ ] Background as separate palette color
* [ ] Preview transparency

Priority: HIGH

---

# PHASE 2 — SMART COLOR REDUCTION

Goal:

Make the generated rug design actually look good.

### Tasks

* [ ] Better color quantization
* [ ] Remove tiny color fragments
* [ ] Merge similar colors
* [ ] Minimum area threshold
* [ ] Edge cleanup
* [ ] Noise reduction
* [ ] Shape simplification
* [ ] Preserve important details
* [ ] Lock specific colors
* [ ] Replace individual colors
* [ ] Undo / redo

Priority: HIGH

---

# PHASE 3 — REAL YARN PALETTE

Goal:

Replace arbitrary HEX colors with real yarn.

### Tasks

* [ ] Create yarn color database
* [ ] Add yarn name
* [ ] Add manufacturer
* [ ] Add manufacturer color code
* [ ] Add HEX
* [ ] Add RGB
* [ ] Add availability
* [ ] Add stock
* [ ] Add yarn price
* [ ] Upload yarn photo

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

* [ ] Width input
* [ ] Height input
* [ ] Aspect ratio lock
* [ ] Grid density
* [ ] Cell size
* [ ] Border / margin
* [ ] Production area
* [ ] Calculate cell count
* [ ] Estimate yarn usage
* [ ] Estimate production time

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

* [ ] Color-coded grid
* [ ] Grid coordinates
* [ ] Color legend
* [ ] Cell count per color
* [ ] Percentage per color
* [ ] Yarn quantity estimate
* [ ] Printable production sheet
* [ ] PDF export
* [ ] SVG export
* [ ] PNG export

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

* [ ] Open converter from custom order
* [ ] Upload customer image
* [ ] Save source image
* [ ] Save processed image
* [ ] Save palette
* [ ] Save rug dimensions
* [ ] Save production map
* [ ] Version designs
* [ ] Reopen previous designs
* [ ] Duplicate design
* [ ] Delete design

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

* Width
* Height
* Area
* Number of colors
* Design complexity
* Yarn cost
* Estimated production time
* Artist margin
* Shipping

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

and provide information about:

* visual quality
* complexity
* estimated cost
* production difficulty

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

# PHASE 11 — SITE VERSIONING & RELEASES

Goal:

Track versions of the DOCH website and keep a simple release history.

### Site version

* [ ] Create central `SITE_VERSION`
* [ ] Display current version in footer / About
* [ ] Increment version on meaningful releases
* [ ] Use semantic versioning

Example:

```text
DOCH
v1.4.0
```

Version meaning:

```text
MAJOR.MINOR.PATCH

1.4.0

MAJOR — major redesign / breaking changes
MINOR — new functionality
PATCH — fixes / small changes
```

### Changelog

* [ ] Create `CHANGELOG.md`
* [ ] Record each public release
* [ ] Keep entries short
* [ ] Group changes into Added / Changed / Fixed / Removed

Example:

```text
# Changelog

## [1.4.0] — 2026-09-27

### Added
- Checkout
- Payment method selection
- Crypto payment flow

### Changed
- Updated cart interface

### Fixed
- Checkout modal closing
- Desktop checkout scrolling
```

Priority: MEDIUM

---

# PHASE 12 — ORDER, PAYMENT & CUSTOMER COMMUNICATION

Goal:

Make the sales flow production-ready.

### Order

* [ ] Generate unique order number
* [ ] Save creation timestamp
* [ ] Save customer data
* [ ] Save price
* [ ] Save currency
* [ ] Save payment method
* [ ] Save payment amount/currency
* [ ] Save shipping address
* [ ] Save order status
* [ ] Save payment status
* [ ] Save status history

### Payment

* [ ] Payment method selection
* [ ] SBP
* [ ] Card
* [ ] Crypto
* [ ] YooKassa
* [ ] Stripe
* [ ] Crypto wallet confirmation
* [ ] Payment webhook
* [ ] Payment transaction ID
* [ ] Payment provider ID
* [ ] Refund handling

### Telegram

* [ ] New order notification
* [ ] Payment notification
* [ ] Payment confirmed
* [ ] Production started
* [ ] Shipped
* [ ] Completed
* [ ] Cancelled
* [ ] Admin status buttons

### Email

* [ ] Order received
* [ ] Payment instructions
* [ ] Payment confirmed
* [ ] Order in production
* [ ] Order shipped
* [ ] Order completed
* [ ] Order cancelled / refunded
* [ ] Receipt / payment document

### Customer order page

* [ ] Public order status page
* [ ] Order number
* [ ] Current status
* [ ] Payment status
* [ ] Order timeline
* [ ] Shipping information
* [ ] Receipt link
* [ ] Last updated

Priority: CRITICAL

---

# PHASE 13 — LEGAL & DOCUMENTS

Goal:

Make the online sales process legally structured.

### Documents

* [ ] Public offer / Terms of Sale
* [ ] Privacy Policy
* [ ] Personal data processing notice
* [ ] Payment terms
* [ ] Delivery terms
* [ ] Returns / refunds policy
* [ ] Custom-made product conditions
* [ ] Intellectual property / uploaded images

### Checkout consent

* [ ] Terms acceptance checkbox
* [ ] Privacy acceptance
* [ ] Link to current documents
* [ ] Store accepted document version
* [ ] Store acceptance timestamp

Example:

```text
Terms v1.0
Privacy v1.0
Accepted:
2026-09-27 14:32
```

### Payment documents

* [ ] Official payment receipt / fiscal document where required
* [ ] Receipt delivery
* [ ] Transaction ID
* [ ] Refund document where required

Priority: CRITICAL

---

# IMPORTANT TECHNICAL PRINCIPLES

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
11. Site versioning
12. Payment integration
13. Telegram
14. Email
15. Customer status page
16. Legal / documents

The converter should become reliable before connecting it deeply to production.

The website should have one visible site version.

The converter should have its own version independently from the website.

Legal documents should have their own versions independently from both.
