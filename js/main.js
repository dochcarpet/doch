const products = {
    witness: {
        title: "Свидетель из Фрязино",
        price: 690,
        size: "180 CM",
        image: "rug-one"
    },

    cool: {
        title: "Охлади траханье",
        price: 290,
        size: "90 CM",
        image: "rug-two"
    },

    npc: {
        title: "NPC ENERGY",
        price: 240,
        size: "80 CM",
        image: "rug-three"
    },

    cat: {
        title: "CRYING CAT",
        price: 210,
        size: "70 CM",
        image: "rug-four"
    }
};

let cart = [];

const modal = document.getElementById("productModal");
const modalTitle = document.getElementById("modalTitle");
const modalPrice = document.getElementById("modalPrice");
const modalSize = document.getElementById("modalSize");
const modalImage = document.getElementById("modalImage");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");


/* ------------------------------
   PRODUCT MODAL
------------------------------ */

document.querySelectorAll(".product").forEach(product => {

    product.addEventListener("click", () => {

        const id = product.dataset.product;
        const item = products[id];

        if (!item) return;

        modalTitle.textContent = item.title;
        modalPrice.textContent = `€${item.price}`;
        modalSize.textContent = item.size;

        modalImage.className = `modal-image ${item.image}`;

        modal.dataset.product = id;

        modal.classList.add("active");
        document.body.classList.add("no-scroll");
    });
});


document.getElementById("modalClose").addEventListener("click", closeModal);

function closeModal() {
    modal.classList.remove("active");
    document.body.classList.remove("no-scroll");
}


/* ------------------------------
   ADD TO CART
------------------------------ */

document.getElementById("addCart").addEventListener("click", () => {

    const id = modal.dataset.product;
    const item = products[id];

    if (!item) return;

    cart.push(item);

    updateCart();

    closeModal();

    openCart();
});


/* ------------------------------
   CART
------------------------------ */

document.getElementById("cartButton").addEventListener("click", openCart);

document.getElementById("cartClose").addEventListener("click", closeCart);

cartOverlay.addEventListener("click", closeCart);


function openCart() {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
    document.body.classList.add("no-scroll");
}


function closeCart() {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
}


function updateCart() {

    cartCount.textContent = cart.length;

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="empty-cart">
                Nothing here yet.
            </p>
        `;

        cartTotal.textContent = "€0";

        return;
    }

    cartItems.innerHTML = "";

    let total = 0;

    cart.forEach((item, index) => {

        total += item.price;

        const element = document.createElement("div");

        element.className = "cart-item";

        element.innerHTML = `
            <div>
                <div class="cart-item-name">
                    ${item.title}
                </div>

                <button
                    class="remove-item"
                    data-index="${index}"
                    style="
                        border:0;
                        background:none;
                        padding:8px 0;
                        cursor:pointer;
                        font:9px var(--mono);
                        color:#777;
                    "
                >
                    REMOVE
                </button>
            </div>

            <div class="cart-item-price">
                €${item.price}
            </div>
        `;

        cartItems.appendChild(element);
    });

    cartTotal.textContent = `€${total}`;

    document.querySelectorAll(".remove-item").forEach(button => {

        button.addEventListener("click", () => {

            const index = Number(button.dataset.index);

            cart.splice(index, 1);

            updateCart();
        });
    });
}


/* ------------------------------
   CUSTOM BUTTON
------------------------------ */

document.getElementById("customButton").addEventListener("click", () => {

    alert(
        "CUSTOM RUG REQUEST\n\n" +
        "This will become the custom order form."
    );

});


/* ------------------------------
   ESC KEY
------------------------------ */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeModal();
        closeCart();

    }

});


/* ------------------------------
   HERO GLITCH
------------------------------ */

const heroTitle = document.querySelector(".hero-title");

setInterval(() => {

    if (Math.random() > 0.65) {

        heroTitle.style.transform =
            `translate(${Math.random() * 4 - 2}px, ${Math.random() * 3 - 1.5}px)`;

        setTimeout(() => {
            heroTitle.style.transform = "";
        }, 80);

    }

}, 1600);


/* ------------------------------
   SCROLL REVEALS
------------------------------ */

const observer = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";

            }

        });

    },
    {
        threshold: 0.08
    }
);


document
    .querySelectorAll(
        ".manifesto h2, .product, .process-card, .queue-item, .about-grid"
    )
    .forEach(element => {

        element.style.opacity = "0";
        element.style.transform = "translateY(35px)";
        element.style.transition =
            "opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1)";

        observer.observe(element);

    });


/* ------------------------------
   INITIAL CART
------------------------------ */

updateCart();
