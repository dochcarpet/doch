# DOCH Rug Color Converter

Prototype of a tool for converting any image into a simplified rug / tufting color map.

The idea is simple:

IMAGE → BACKGROUND → COLOR REDUCTION → THREAD PALETTE → RUG MAP

The tool is intended to become part of the DOCH admin panel and eventually help convert customer images into production-ready rug designs.

---

## Current prototype

The prototype runs entirely in the browser.

### Current features

- Upload any image
- Drag & drop image
- Keep original background
- Replace background with white
- Replace background with black
- Basic transparent-background mode
- Reduce image to:
  - 2 colors
  - 3 colors
  - 4 colors
  - 6 colors
  - 8 colors
  - 12 colors
- Generate a simplified pixel/grid map
- Select grid resolution:
  - 32 × 32
  - 64 × 64
  - 96 × 96
- Display generated palette
- Show approximate percentage of each color
- Manually edit generated HEX colors
- Export the resulting rug map as PNG

---

## Important concept

This is NOT intended to be a normal image filter.

The final system should convert an image into a limited set of real yarn colors.

For example:

Original image:

BMW logo

↓

3-color design:

BLACK
WHITE
BLUE

↓

Real yarn palette:

BLACK — Thread #001
WHITE — Thread #014
BLUE — Thread #032

The final production system should work with an actual DOCH yarn inventory rather than arbitrary HEX colors.

---

# Processing pipeline

The planned processing pipeline is:

1. Upload image
2. Detect / remove background
3. Select or create background
4. Resize image
5. Simplify image
6. Reduce number of colors
7. Match colors against real yarn palette
8. Generate rug grid
9. Allow manual corrections
10. Save design
11. Export production data

---

# Background processing

Background removal is one of the most important parts of the system.

Possible modes:

- KEEP
- REMOVE
- WHITE
- BLACK
- CUSTOM COLOR

Future versions should support automatic subject/background separation.

For example:

PHOTO

↓

[ PERSON ]

[ BACKGROUND ]

↓

PERSON + CUSTOM RUG BACKGROUND

The background should be treated separately from the main subject whenever possible.

---

# Color reduction

The prototype currently uses color clustering to reduce the image to a limited number of colors.

The user can choose the number of colors.

Example:

12 colors
↓
8 colors
↓
6 colors
↓
4 colors
↓
3 colors

The goal is not photographic accuracy.

The goal is to create an image that can realistically be reproduced using yarn.

---

# Real yarn palette

Future versions should use a database table similar to:

thread_colors

id
name
manufacturer
color_code
hex
rgb
available
stock
price
image

Example:

BLACK
#111111

WHITE
#F1EEE7

BLUE
#2867A8

RED
#FF3B30

etc.

The image processing algorithm should map every generated color to the nearest available yarn color.

---

# Rug dimensions

Eventually the user should specify physical dimensions.

Example:

Width: 80 cm
Height: 80 cm

or:

Width: 120 cm
Height: 80 cm

The system should calculate the appropriate production grid.

For example:

80 × 80 cm
→ 64 × 64 cells

Each cell represents an approximate tufting area.

---

# Production map

The final result should not only be an image.

It should become a production map.

Example:

64 × 64

BBBBBBBBWWWWWW
BBBBBBBBWWWWWW
BBBBBBBBWWWWWW
...

Where:

B = BLUE
W = WHITE
K = BLACK

The system should eventually be able to generate:

- PNG preview
- SVG
- PDF production sheet
- color legend
- yarn quantities
- estimated yarn usage
- estimated production time

---

# Admin integration

The converter should eventually live inside the DOCH admin panel.

Possible workflow:

ADMIN

→ Custom Orders

→ Upload customer image

→ Open Converter

→ Remove / customize background

→ Select number of colors

→ Match yarn palette

→ Adjust design

→ Save

→ Generate quotation

→ Customer approval

→ Production

---

# Database integration

Possible future Supabase tables:

products
thread_colors
custom_orders
rug_designs
rug_design_colors
rug_design_cells

Example:

rug_designs

id
custom_order_id
width_cm
height_cm
grid_width
grid_height
background_color
created_at

rug_design_colors

id
rug_design_id
thread_id
percentage
cell_count

rug_design_cells

rug_design_id
x
y
thread_id

---

# Current limitations

This prototype is intentionally simple.

It does NOT yet provide:

- professional background removal
- AI segmentation
- real yarn matching
- physical yarn calculations
- production-ready vectorization
- SVG/PDF export
- customer approval
- Supabase storage
- saved designs
- custom color editing workflow
- image cleanup
- edge smoothing
- noise removal
- automatic composition optimization

---

# Design principle

The converter should optimize for:

PRODUCTION

not:

PIXEL PERFECT IMAGE REPRODUCTION.

A good rug design may deliberately simplify an image.

The system should prefer:

fewer colors
+
cleaner shapes
+
larger areas
+
clear edges

over photographic detail.

---

# DOCH

DOCH®
Handmade Internet Art

Prototype — 2026
