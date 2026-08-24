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

// Existing images that user removes while editing
let removedImages = [];



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

  showLoginMessage("Входим...");

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
    `<div class="message">Загрузка товаров...</div>`;

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
        Пока нет ковров. Добавьте первый.
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
    "Ковер без названия";

  const price =
    product.price != null
      ? `${product.price} ${product.currency || ""}`
      : "Цена не указана";

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
                 НЕТ ФОТО
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
    РЕДАКТИРОВАТЬ
  </button>

  <button
    onclick="toggleVisibility('${product.id}', '${product.status}')"
  >
    ${
      product.status === "hidden"
        ? "ОПУБЛИКОВАТЬ"
        : "СКРЫТЬ"
    }
  </button>

  <button
    class="delete-product"
    onclick="deleteProduct('${product.id}')"
  >
    УДАЛИТЬ
  </button>

</div>

      </div>

    </article>
  `;
}



function formatStatus(status) {

  const labels = {
    available: "Доступен",
    made_to_order: "Под заказ",
    sold: "Продан",
    hidden: "Скрыт"
  };

  return labels[status] || status || "Неизвестно";

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
  removedImages = [];

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
    "Добавить ковер";

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
  removedImages = [];

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



  // COVER

  if (product.cover_image) {

    coverPreview.innerHTML =
      existingThumbnail(
        product.cover_image,
        "cover"
      );

  }



  // INTERIOR

  if (product.interior_image) {

    interiorPreview.innerHTML =
      existingThumbnail(
        product.interior_image,
        "interior"
      );

  }



  // GALLERY

  if (Array.isArray(product.gallery)) {

    galleryPreview.innerHTML =
      product.gallery
        .map((url, index) =>
          existingThumbnail(
            url,
            "gallery",
            index
          )
        )
        .join("");

  }



  document.getElementById("modal-title").textContent =
    "Редактировать ковер";

  hideFormMessage();

}



function closeModal() {

  modal.classList.add("hidden");

}



function resetUploads() {

  coverFile = null;
  galleryFiles = [];
  interiorFile = null;

  removedImages = [];

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
      newFileThumbnail(
        coverFile,
        "cover"
      );

  }

});



galleryInput.addEventListener("change", () => {

  const newFiles =
    [...galleryInput.files];

  if (!newFiles.length) {
    return;
  }

  /*
   * IMPORTANT:
   * Do not replace galleryFiles.
   * Add newly selected files to existing ones.
   */
  galleryFiles = [
    ...galleryFiles,
    ...newFiles
  ];

  renderGalleryPreviews();

  // Reset input so selecting the same file again works.
  galleryInput.value = "";

});



interiorInput.addEventListener("change", () => {

  interiorFile =
    interiorInput.files[0] || null;

  if (interiorFile) {

    interiorPreview.innerHTML =
      newFileThumbnail(
        interiorFile,
        "interior"
      );

  }

});



// =====================================================
// EXISTING IMAGE DELETE
// =====================================================

function removeExistingImage(url, type, index = null) {

  if (!url) {
    return;
  }

  removedImages.push(url);



  if (type === "cover") {

    coverPreview.innerHTML = "";

    /*
     * If user deletes the existing cover,
     * do not accidentally upload the old one again.
     */
    if (
      editingProduct &&
      editingProduct.cover_image === url
    ) {
      editingProduct.cover_image = null;
    }

  }



  if (type === "interior") {

    interiorPreview.innerHTML = "";

    if (
      editingProduct &&
      editingProduct.interior_image === url
    ) {
      editingProduct.interior_image = null;
    }

  }



  if (type === "gallery") {

    const currentGallery =
      Array.isArray(editingProduct?.gallery)
        ? [...editingProduct.gallery]
        : [];

    const newGallery =
      currentGallery.filter(
        galleryUrl => galleryUrl !== url
      );

    if (editingProduct) {
      editingProduct.gallery = newGallery;
    }

    renderGalleryPreviews();

  }

}



function removeNewGalleryFile(index) {

  galleryFiles.splice(index, 1);

  renderGalleryPreviews();

}



function removeNewCoverFile() {

  coverFile = null;

  coverInput.value = "";

  coverPreview.innerHTML = "";

}



function removeNewInteriorFile() {

  interiorFile = null;

  interiorInput.value = "";

  interiorPreview.innerHTML = "";

}



// =====================================================
// IMAGE PREVIEWS
// =====================================================

function existingThumbnail(url, type, index = null) {

  let removeAction = "";

  if (type === "cover") {

    removeAction =
      `onclick="removeExistingImage(
        '${escapeJs(url)}',
        'cover'
      )"`;

  }

  if (type === "interior") {

    removeAction =
      `onclick="removeExistingImage(
        '${escapeJs(url)}',
        'interior'
      )"`;

  }

  if (type === "gallery") {

    removeAction =
      `onclick="removeExistingImage(
        '${escapeJs(url)}',
        'gallery',
        ${index}
      )"`;

  }

  return `
    <div class="thumb">
      <img src="${escapeAttribute(url)}">

      <button
        type="button"
        class="thumb-delete"
        ${removeAction}
        title="Удалить"
      >
        ×
      </button>
    </div>
  `;

}



function newFileThumbnail(file, type, index = null) {

  const url =
    URL.createObjectURL(file);

  let removeAction = "";

  if (type === "cover") {

    removeAction =
      `onclick="removeNewCoverFile()"`;

  }

  if (type === "interior") {

    removeAction =
      `onclick="removeNewInteriorFile()"`;

  }

  if (type === "gallery") {

    removeAction =
      `onclick="removeNewGalleryFile(${index})"`;

  }

  return `
    <div class="thumb">
      <img src="${escapeAttribute(url)}">

      <button
        type="button"
        class="thumb-delete"
        ${removeAction}
        title="Удалить"
      >
        ×
      </button>
    </div>
  `;

}



function renderGalleryPreviews() {

  let html = "";



  // Existing gallery images

  if (
    editingProduct &&
    Array.isArray(editingProduct.gallery)
  ) {

    html +=
      editingProduct.gallery
        .map((url, index) =>
          existingThumbnail(
            url,
            "gallery",
            index
          )
        )
        .join("");

  }



  // Newly selected gallery images

  html +=
    galleryFiles
      .map((file, index) =>
        newFileThumbnail(
          file,
          "gallery",
          index
        )
      )
      .join("");



  galleryPreview.innerHTML = html;

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
    throw new Error("Не удалось оптимизировать изображение.");
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
// STORAGE DELETE
// =====================================================

function getStoragePath(publicUrl) {

  if (!publicUrl) {
    return null;
  }

  const marker =
    "/storage/v1/object/public/rugs/";

  const index =
    publicUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    publicUrl.substring(
      index + marker.length
    )
  );

}



async function deleteStorageImage(publicUrl) {

  const path =
    getStoragePath(publicUrl);

  if (!path) {
    return;
  }

  const {
    error
  } = await db
    .storage
    .from("rugs")
    .remove([path]);

  /*
   * Do not break saving if the DB record can be
   * successfully updated but the old file cannot
   * be removed from Storage.
   */
  if (error) {

    console.warn(
      "Could not delete storage file:",
      error.message
    );

  }

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
  saveButton.textContent = "СОХРАНЕНИЕ...";



  try {

    showFormMessage("Подготавливаем товар...");



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



    // Remove images that user deleted

    galleryUrls =
      galleryUrls.filter(
        url => !removedImages.includes(url)
      );

    if (
      coverUrl &&
      removedImages.includes(coverUrl)
    ) {
      coverUrl = null;
    }

    if (
      interiorUrl &&
      removedImages.includes(interiorUrl)
    ) {
      interiorUrl = null;
    }



    // COVER

    if (coverFile) {

      showFormMessage(
        "Оптимизируем обложку..."
      );

      const oldCoverUrl =
        coverUrl;

      coverUrl =
        await uploadImage(
          coverFile,
          "cover"
        );

      /*
       * New cover replaces old cover.
       */
      if (
        oldCoverUrl &&
        oldCoverUrl !== coverUrl
      ) {

        removedImages.push(
          oldCoverUrl
        );

      }

    }



    // INTERIOR

    if (interiorFile) {

      showFormMessage(
        "Оптимизируем фото интерьера..."
      );

      const oldInteriorUrl =
        interiorUrl;

      interiorUrl =
        await uploadImage(
          interiorFile,
          "interior"
        );

      /*
       * New interior replaces old interior.
       */
      if (
        oldInteriorUrl &&
        oldInteriorUrl !== interiorUrl
      ) {

        removedImages.push(
          oldInteriorUrl
        );

      }

    }



    // GALLERY

    if (galleryFiles.length) {

      showFormMessage(
        `Оптимизируем ${galleryFiles.length} новых фото...`
      );

      const newGallery = [];

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

      /*
       * IMPORTANT:
       * Append new photos instead of replacing
       * the existing gallery.
       */
      galleryUrls = [
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
      "Сохраняем товар..."
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



    /*
     * DB is saved first.
     * Now safely remove deleted/replaced files
     * from Supabase Storage.
     */

    if (removedImages.length) {

      showFormMessage(
        "Удаляем старые фотографии..."
      );

      const uniqueRemovedImages =
        [...new Set(removedImages)];

      for (
        const imageUrl
        of uniqueRemovedImages
      ) {

        await deleteStorageImage(
          imageUrl
        );

      }

    }



    closeModal();

    await loadProducts();



  } catch (error) {

    console.error(error);

    showFormMessage(
      error.message ||
      "Что-то пошло не так."
    );

  } finally {

    saveButton.disabled = false;

    saveButton.textContent =
      "СОХРАНИТЬ КОВЕР";

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
// DELETE PRODUCT
// =====================================================

async function deleteProduct(id) {

  const confirmed =
    confirm(
      "Удалить этот ковер?\n\n" +
      "Будет удален сам товар и все его фотографии.\n" +
      "Это действие нельзя отменить."
    );

  if (!confirmed) {
    return;
  }



  try {

    // Get product first so we know which images
    // belong to it.

    const {
      data: product,
      error: fetchError
    } = await db
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }



    // Collect all images

    const images = [];

    if (product.cover_image) {
      images.push(product.cover_image);
    }

    if (product.interior_image) {
      images.push(product.interior_image);
    }

    if (Array.isArray(product.gallery)) {
      images.push(...product.gallery);
    }



    // Remove duplicates

    const uniqueImages =
      [...new Set(images)];



    // Delete database record first

    const {
      error: deleteError
    } = await db
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }



    // Delete images from Storage

    for (const imageUrl of uniqueImages) {

      await deleteStorageImage(imageUrl);

    }



    // Refresh products

    await loadProducts();



  } catch (error) {

    console.error(
      "Could not delete product:",
      error
    );

    alert(
      error.message ||
      "Не удалось удалить ковер."
    );

  }

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



function escapeJs(value) {

  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r");

}



// =====================================================
// START
// =====================================================

init();
