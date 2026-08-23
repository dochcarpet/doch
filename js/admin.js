
const SUPABASE_URL = "https://kixsnkhmxyytecvvwnse.supabase.co";
const SUPABASE_KEY = "sb_publishable_NeFuQSbmP2VLBEdDLnIi5Q_5iUyMHNF";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);


// =====================================================
// ELEMENTS
// =====================================================

const loginScreen = document.getElementById("login-screen");
const adminScreen = document.getElementById("admin-screen");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const userEmail = document.getElementById("user-email");
const logoutButton = document.getElementById("logout");

const productsContainer = document.getElementById("products");
const addProductButton = document.getElementById("add-product");

const modal = document.getElementById("modal");
const closeModalButton = document.getElementById("close-modal");
const cancelButton = document.getElementById("cancel");

const productForm = document.getElementById("product-form");
const formMessage = document.getElementById("form-message");

const coverInput = document.getElementById("cover-input");
const galleryInput = document.getElementById("gallery-input");
const interiorInput = document.getElementById("interior-input");

const coverPreview = document.getElementById("cover-preview");
const galleryPreview = document.getElementById("gallery-preview");
const interiorPreview = document.getElementById("interior-preview");


// =====================================================
// STATE
// =====================================================

let currentUser = null;
let editingProduct = null;

let coverFile = null;
let galleryFiles = [];
let interiorFile = null;


// =====================================================
// AUTH
// =====================================================

async function init() {

  const {
    data: { session }
  } = await db.auth.getSession();

  if (session) {
    currentUser = session.user;
    showAdmin();
  } else {
    showLogin();
  }

}


db.auth.onAuthStateChange((_event, session) => {

  if (session) {
    currentUser = session.user;
    showAdmin();
  } else {
    currentUser = null;
    showLogin();
  }

});


loginForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const email =
    document.getElementById("login-email").value.trim();

  const password =
    document.getElementById("login-password").value;

  showLoginMessage("Logging in...");

  const { error } =
    await db.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    showLoginMessage(error.message);
    return;
  }

  hideLoginMessage();

});


logoutButton.addEventListener("click", async () => {

  await db.auth.signOut();

});


function showLogin() {

  loginScreen.classList.remove("hidden");
  adminScreen.classList.add("hidden");

}


function showAdmin() {

  loginScreen.classList.add("hidden");
  adminScreen.classList.remove("hidden");

  if (currentUser) {
    userEmail.textContent = currentUser.email;
  }

  loadProducts();

}


function showLoginMessage(text) {

  loginMessage.textContent = text;
  loginMessage.classList.remove("hidden");

}


function hideLoginMessage() {

  loginMessage.classList.add("hidden");

}


// =====================================================
// PRODUCTS
// =====================================================

async function loadProducts() {

  productsContainer.innerHTML =
    `<div class="message">Loading products...</div>`;

  const {
    data,
    error
  } = await db
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {

    productsContainer.innerHTML =
      `<div class="message">${escapeHtml(error.message)}</div>`;

    return;
  }

  if (!data.length) {

    productsContainer.innerHTML =
      `<div class="message">
        No rugs yet. Add your first one.
      </div>`;

    return;
  }

  productsContainer.innerHTML =
    data.map(renderProduct).join("");

}


function renderProduct(product) {

  const image =
    product.cover_image ||
    "";

  const title =
    product.title_en ||
    product.title_ru ||
    "Untitled rug";

  const price =
    product.price != null
      ? `${product.price} ${product.currency || ""}`
      : "No price";

  const statusClass =
    product.status === "hidden"
      ? "hidden-status"
      : product.status;

  return `
    <article class="product">

      <div class="product-image">

        ${
          image
            ? `<img
                 src="${escapeAttribute(image)}"
                 alt="${escapeAttribute(title)}"
               >`
            : `<div
                 style="
                   height:100%;
                   display:flex;
                   align-items:center;
                   justify-content:center;
                   color:#777;
                 "
               >
                 NO IMAGE
               </div>`
        }

      </div>

      <div class="product-info">

        <div class="product-title">
          ${escapeHtml(title)}
        </div>

        <div class="product-meta">
          ${escapeHtml(price)}
        </div>

        <span class="status ${statusClass}">
          ${escapeHtml(formatStatus(product.status))}
        </span>

        <div class="product-actions">

          <button
            onclick="editProduct('${product.id}')"
          >
            EDIT
          </button>

          <button
            onclick="toggleVisibility('${product.id}', '${product.status}')"
          >
            ${
              product.status === "hidden"
                ? "PUBLISH"
                : "HIDE"
            }
          </button>

        </div>

      </div>

    </article>
  `;
}


function formatStatus(status) {

  const labels = {
    available: "Available",
    made_to_order: "Made to order",
    sold: "Sold",
    hidden: "Hidden"
  };

  return labels[status] || status || "Unknown";

}


// =====================================================
// ADD / EDIT MODAL
// =====================================================

addProductButton.addEventListener("click", () => {

  openNewProduct();

});


closeModalButton.addEventListener("click", closeModal);
cancelButton.addEventListener("click", closeModal);


function openNewProduct() {

  editingProduct = null;

  productForm.reset();

  document.getElementById("product-id").value = "";

  document.getElementById("status").value =
    "made_to_order";

  document.getElementById("currency").value =
    "EUR";

  document.getElementById("sort-order").value =
    "0";

  document.getElementById("featured").checked =
    false;

  resetUploads();

  document.getElementById("modal-title").textContent =
    "Add Rug";

  hideFormMessage();

  modal.classList.remove("hidden");

}


async function editProduct(id) {

  const {
    data,
    error
  } = await db
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {

    alert(error.message);
    return;

  }

  editingProduct = data;

  fillProductForm(data);

  modal.classList.remove("hidden");

}


function fillProductForm(product) {

  document.getElementById("product-id").value =
    product.id;

  document.getElementById("title-ru").value =
    product.title_ru || "";

  document.getElementById("title-en").value =
    product.title_en || "";

  document.getElementById("description-ru").value =
    product.description_ru || "";

  document.getElementById("description-en").value =
    product.description_en || "";

  document.getElementById("price").value =
    product.price ?? "";

  document.getElementById("currency").value =
    product.currency || "EUR";

  document.getElementById("width").value =
    product.width_cm ?? "";

  document.getElementById("height").value =
    product.height_cm ?? "";

  document.getElementById("status").value =
    product.status || "made_to_order";

  document.getElementById("sort-order").value =
    product.sort_order ?? 0;

  document.getElementById("featured").checked =
    Boolean(product.featured);

  resetUploads();

  if (product.cover_image) {

    coverPreview.innerHTML =
      thumbnail(product.cover_image);

  }

  if (product.interior_image) {

    interiorPreview.innerHTML =
      thumbnail(product.interior_image);

  }

  if (Array.isArray(product.gallery)) {

    galleryPreview.innerHTML =
      product.gallery
        .map(url => thumbnail(url))
        .join("");

  }

  document.getElementById("modal-title").textContent =
    "Edit Rug";

  hideFormMessage();

}


function closeModal() {

  modal.classList.add("hidden");

}


function resetUploads() {

  coverFile = null;
  galleryFiles = [];
  interiorFile = null;

  coverInput.value = "";
  galleryInput.value = "";
  interiorInput.value = "";

  coverPreview.innerHTML = "";
  galleryPreview.innerHTML = "";
  interiorPreview.innerHTML = "";

}


// =====================================================
// IMAGE UPLOADS
// =====================================================

coverInput.addEventListener("change", () => {

  coverFile =
    coverInput.files[0] || null;

  if (coverFile) {

    coverPreview.innerHTML =
      thumbnailFromFile(coverFile);

  }

});


galleryInput.addEventListener("change", () => {

  galleryFiles =
    [...galleryInput.files];

  galleryPreview.innerHTML =
    galleryFiles
      .map(file => thumbnailFromFile(file))
      .join("");

});


interiorInput.addEventListener("change", () => {

  interiorFile =
    interiorInput.files[0] || null;

  if (interiorFile) {

    interiorPreview.innerHTML =
      thumbnailFromFile(interiorFile);

  }

});


function thumbnail(url) {

  return `
    <div class="thumb">
      <img src="${escapeAttribute(url)}">
    </div>
  `;

}


function thumbnailFromFile(file) {

  const url =
    URL.createObjectURL(file);

  return thumbnail(url);

}


// =====================================================
// IMAGE OPTIMIZATION
// =====================================================

async function optimizeImage(file) {

  const bitmap =
    await createImageBitmap(file);

  const maxSize = 1800;

  const ratio =
    Math.min(
      1,
      maxSize /
      Math.max(bitmap.width, bitmap.height)
    );

  const width =
    Math.round(bitmap.width * ratio);

  const height =
    Math.round(bitmap.height * ratio);

  const canvas =
    document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext("2d");

  ctx.drawImage(
    bitmap,
    0,
    0,
    width,
    height
  );

  const blob =
    await new Promise(resolve => {

      canvas.toBlob(
        resolve,
        "image/webp",
        0.80
      );

    });

  if (!blob) {
    throw new Error("Image optimization failed.");
  }

  return blob;

}


// =====================================================
// STORAGE
// =====================================================

async function uploadImage(file, type) {

  const optimized =
    await optimizeImage(file);

  const id =
    crypto.randomUUID();

  const filename =
    `${id}-${type}.webp`;

  const path =
    filename;

  const {
    error
  } = await db
    .storage
    .from("rugs")
    .upload(path, optimized, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false
    });

  if (error) {
    throw error;
  }

  const {
    data
  } = db
    .storage
    .from("rugs")
    .getPublicUrl(path);

  return data.publicUrl;

}


// =====================================================
// SAVE PRODUCT
// =====================================================

productForm.addEventListener("submit", async (event) => {

  event.preventDefault();

  const saveButton =
    productForm.querySelector(
      'button[type="submit"]'
    );

  saveButton.disabled = true;
  saveButton.textContent = "SAVING...";

  try {

    showFormMessage("Preparing product...");

    const titleRu =
      document.getElementById("title-ru").value.trim();

    const titleEn =
      document.getElementById("title-en").value.trim();

    const slug =
      createSlug(
        titleEn ||
        titleRu
      );

    let coverUrl =
      editingProduct?.cover_image ||
      null;

    let interiorUrl =
      editingProduct?.interior_image ||
      null;

    let galleryUrls =
      Array.isArray(editingProduct?.gallery)
        ? [...editingProduct.gallery]
        : [];


    // COVER

    if (coverFile) {

      showFormMessage(
        "Optimizing cover image..."
      );

      coverUrl =
        await uploadImage(
          coverFile,
          "cover"
        );

    }


    // INTERIOR

    if (interiorFile) {

      showFormMessage(
        "Optimizing interior image..."
      );

      interiorUrl =
        await uploadImage(
          interiorFile,
          "interior"
        );

    }


    // GALLERY

    if (galleryFiles.length) {

      showFormMessage(
        `Optimizing ${galleryFiles.length} gallery image(s)...`
      );

      const newGallery =
        [];

      for (
        let i = 0;
        i < galleryFiles.length;
        i++
      ) {

        const url =
          await uploadImage(
            galleryFiles[i],
            `gallery-${i + 1}`
          );

        newGallery.push(url);

      }

      galleryUrls =
        [
          ...galleryUrls,
          ...newGallery
        ];

    }


    const product = {

      slug,

      title_ru:
        titleRu,

      title_en:
        titleEn || null,

      description_ru:
        document
          .getElementById("description-ru")
          .value
          .trim() || null,

      description_en:
        document
          .getElementById("description-en")
          .value
          .trim() || null,

      price:
        Number(
          document.getElementById("price").value
        ) || null,

      currency:
        document.getElementById("currency").value,

      width_cm:
        Number(
          document.getElementById("width").value
        ) || null,

      height_cm:
        Number(
          document.getElementById("height").value
        ) || null,

      status:
        document.getElementById("status").value,

      featured:
        document.getElementById("featured").checked,

      cover_image:
        coverUrl,

      gallery:
        galleryUrls,

      interior_image:
        interiorUrl,

      sort_order:
        Number(
          document.getElementById("sort-order").value
        ) || 0

    };


    showFormMessage(
      "Saving product..."
    );


    let result;

    if (editingProduct) {

      result =
        await db
          .from("products")
          .update(product)
          .eq(
            "id",
            editingProduct.id
          );

    } else {

      result =
        await db
          .from("products")
          .insert(product);

    }


    if (result.error) {
      throw result.error;
    }


    closeModal();

    await loadProducts();


  } catch (error) {

    console.error(error);

    showFormMessage(
      error.message ||
      "Something went wrong."
    );

  } finally {

    saveButton.disabled = false;
    saveButton.textContent =
      "SAVE PRODUCT";

  }

});


// =====================================================
// VISIBILITY
// =====================================================

async function toggleVisibility(id, currentStatus) {

  const newStatus =
    currentStatus === "hidden"
      ? "made_to_order"
      : "hidden";

  const {
    error
  } = await db
    .from("products")
    .update({
      status: newStatus
    })
    .eq("id", id);

  if (error) {

    alert(error.message);
    return;

  }

  loadProducts();

}


// =====================================================
// HELPERS
// =====================================================

function createSlug(text) {

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80)
    + "-" +
    Math.random()
      .toString(36)
      .substring(2, 7);

}


function showFormMessage(text) {

  formMessage.textContent =
    text;

  formMessage.classList.remove(
    "hidden"
  );

}


function hideFormMessage() {

  formMessage.classList.add(
    "hidden"
  );

}


function escapeHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

  return escapeHtml(value);

}


// =====================================================
// START
// =====================================================

init();
