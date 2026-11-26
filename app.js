const productList = document.querySelector("#product-list");
const reviewList = document.querySelector("#review-list");
const ownerDialog = document.querySelector("#owner-dialog");
const ownerStatus = document.querySelector("#owner-status");
const ownerLogin = document.querySelector("#owner-login");
const ownerPanel = document.querySelector("#owner-panel");
const loginMessage = document.querySelector("#login-message");
const productForm = document.querySelector("#product-form");
const reviewAdminForm = document.querySelector("#review-admin-form");
const ownerProducts = document.querySelector("#owner-products");
const ownerReviews = document.querySelector("#owner-reviews");
const cancelProductEdit = document.querySelector("#cancel-product-edit");
const cancelReviewEdit = document.querySelector("#cancel-review-edit");

document.querySelector("#year").textContent = new Date().getFullYear();

const staticStore = window.CHANNEL_SHOP_DATA;
const config = window.CHANNEL_SHOP_SUPABASE;
const hasSupabaseSettings = Boolean(config && (config.url || config.anonKey));
const hasSupabaseSdk = Boolean(window.supabase && typeof window.supabase.createClient === "function");
const supabaseReady = Boolean(
  config &&
  config.url &&
  config.anonKey &&
  hasSupabaseSdk
);
const supabaseSetupError = !hasSupabaseSettings
  ? "L’espace propriétaire n’est pas configuré. Suivez les étapes Supabase du README pour l’activer."
  : !config.url || !config.anonKey
    ? "La configuration Supabase est incomplète. Vérifiez l’URL et la clé publique dans supabase-config.js."
    : "La bibliothèque Supabase n’a pas pu être chargée. Vérifiez votre connexion Internet et réessayez.";
const supabaseClient = supabaseReady
  ? window.supabase.createClient(config.url, config.anonKey)
  : null;

let products = [];
let reviews = [];

function formatPrice(price) {
  return `${new Intl.NumberFormat("fr-FR").format(price)} FCFA`;
}

function whatsappLink(product) {
  const message = `Bonjour Channel shop, je souhaite commander : ${product.name} (${formatPrice(product.price)}).`;
  return `https://wa.me/660527599?text=${encodeURIComponent(message)}`;
}

function productCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  const image = document.createElement("div");
  image.className = "product-image";
  if (product.image) {
    const img = document.createElement("img");
    img.src = product.image;
    img.alt = product.name;
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", () => {
      image.replaceChildren();
      const placeholder = document.createElement("span");
      placeholder.className = "product-placeholder";
      placeholder.textContent = "CS";
      image.append(placeholder);
    }, { once: true });
    image.append(img);
  } else {
    const placeholder = document.createElement("span");
    placeholder.className = "product-placeholder";
    placeholder.textContent = "CS";
    image.append(placeholder);
  }
  const details = document.createElement("div");
  details.className = "product-details";
  const name = document.createElement("h3");
  name.textContent = product.name;
  const description = document.createElement("p");
  description.textContent = product.description;
  const bottom = document.createElement("div");
  bottom.className = "product-bottom";
  const price = document.createElement("span");
  price.className = "product-price";
  price.textContent = formatPrice(product.price);
  const order = document.createElement("a");
  order.className = "order-link";
  order.href = whatsappLink(product);
  order.target = "_blank";
  order.rel = "noopener noreferrer";
  order.textContent = "Commander ↗";
  bottom.append(price, order);
  details.append(name, description, bottom);
  card.append(image, details);
  return card;
}

function reviewCard(review) {
  const card = document.createElement("article");
  card.className = "review-card";
  const top = document.createElement("div");
  top.className = "review-card-top";
  const name = document.createElement("span");
  name.className = "reviewer-name";
  name.textContent = review.name;
  const date = document.createElement("time");
  date.className = "review-date";
  date.dateTime = review.date;
  date.textContent = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(`${review.date}T12:00:00`));
  const stars = document.createElement("div");
  stars.className = "review-stars";
  stars.setAttribute("aria-label", `Note : ${review.rating} sur 5`);
  stars.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;
  const comment = document.createElement("p");
  comment.textContent = review.comment;
  top.append(name, date);
  card.append(top, stars, comment);
  return card;
}

function showEntries(container, entries, emptyMessage, renderCard) {
  container.replaceChildren();
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = emptyMessage;
    container.append(empty);
    return;
  }
  container.append(...entries.map(renderCard));
}

function renderStore() {
  showEntries(
    productList,
    products,
    "Les nouveaux produits seront bientôt disponibles. Revenez nous voir !",
    productCard
  );
  showEntries(
    reviewList,
    reviews,
    "Aucun avis publié pour le moment. Envoyez-nous le vôtre sur WhatsApp !",
    reviewCard
  );
}

async function loadStore() {
  if (hasSupabaseSettings && !supabaseClient) {
    throw new Error(supabaseSetupError);
  }
  if (!supabaseClient) {
    if (!staticStore || !Array.isArray(staticStore.products) || !Array.isArray(staticStore.reviews)) {
      throw new Error("Les données de la boutique ne sont pas disponibles.");
    }
    products = staticStore.products;
    reviews = staticStore.reviews;
    renderStore();
    return;
  }

  const [productResult, reviewResult] = await Promise.all([
    supabaseClient.from("products").select("id,name,description,price,image").order("name"),
    supabaseClient.from("reviews").select("id,name,rating,comment,date").order("date", { ascending: false })
  ]);
  if (productResult.error) throw productResult.error;
  if (reviewResult.error) throw reviewResult.error;
  products = productResult.data;
  reviews = reviewResult.data;
  renderStore();
}

function showStoreError(error) {
  console.error("Erreur de chargement de la boutique :", error);
  productList.textContent = "Impossible de charger les produits. Veuillez réessayer plus tard.";
  reviewList.textContent = "Impossible de charger les avis. Veuillez réessayer plus tard.";
}

function setOwnerStatus(message, isError) {
  ownerStatus.textContent = message;
  ownerStatus.classList.toggle("error", Boolean(isError));
}

function setLoginMessage(message, isError) {
  loginMessage.textContent = message;
  loginMessage.classList.toggle("success", !isError && Boolean(message));
}

function todayAsDateInput() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function addManagerRow(container, titleText, descriptionText, onEdit, onDelete) {
  const row = document.createElement("article");
  row.className = "manager-row";
  const details = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = titleText;
  const description = document.createElement("p");
  description.textContent = descriptionText;
  const actions = document.createElement("div");
  actions.className = "manager-row-actions";
  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "text-button";
  edit.textContent = "Modifier";
  edit.addEventListener("click", onEdit);
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "text-button danger-button";
  remove.textContent = "Supprimer";
  remove.addEventListener("click", onDelete);
  details.append(title, description);
  actions.append(edit, remove);
  row.append(details, actions);
  container.append(row);
}

function renderManagerLists() {
  ownerProducts.replaceChildren();
  if (products.length === 0) {
    showEntries(ownerProducts, [], "Aucun produit enregistré.", () => document.createElement("div"));
  } else {
    for (const product of products) {
      addManagerRow(
        ownerProducts,
        product.name,
        `${formatPrice(product.price)} · ${product.description}`,
        () => {
          productForm.elements.namedItem("id").value = product.id;
          productForm.elements.namedItem("name").value = product.name;
          productForm.elements.namedItem("description").value = product.description;
          productForm.elements.namedItem("price").value = product.price;
          productForm.elements.namedItem("image").value = product.image || "";
          cancelProductEdit.hidden = false;
          productForm.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        () => runOwnerAction(async () => {
          if (!window.confirm(`Supprimer le produit « ${product.name} » ?`)) return;
          const { error } = await supabaseClient.from("products").delete().eq("id", product.id);
          if (error) throw error;
          await refreshOwnerData("Produit supprimé.");
        })
      );
    }
  }

  ownerReviews.replaceChildren();
  if (reviews.length === 0) {
    showEntries(ownerReviews, [], "Aucun avis publié.", () => document.createElement("div"));
  } else {
    for (const review of reviews) {
      addManagerRow(
        ownerReviews,
        `${review.name} · ${review.rating}/5`,
        `${review.date} · ${review.comment}`,
        () => {
          reviewAdminForm.elements.namedItem("id").value = review.id;
          reviewAdminForm.elements.namedItem("name").value = review.name;
          reviewAdminForm.elements.namedItem("rating").value = review.rating;
          reviewAdminForm.elements.namedItem("comment").value = review.comment;
          reviewAdminForm.elements.namedItem("date").value = review.date;
          cancelReviewEdit.hidden = false;
          reviewAdminForm.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        () => runOwnerAction(async () => {
          if (!window.confirm(`Supprimer l’avis de « ${review.name} » ?`)) return;
          const { error } = await supabaseClient.from("reviews").delete().eq("id", review.id);
          if (error) throw error;
          await refreshOwnerData("Avis supprimé.");
        })
      );
    }
  }
}

async function refreshOwnerData(successMessage) {
  await loadStore();
  renderManagerLists();
  if (successMessage) setOwnerStatus(successMessage, false);
}

async function runOwnerAction(action) {
  try {
    setOwnerStatus("Enregistrement…", false);
    await action();
  } catch (error) {
    console.error("Erreur dans l’espace propriétaire :", error);
    setOwnerStatus(`Échec de l’opération : ${error.message || "erreur inconnue"}`, true);
  }
}

async function showOwnerPanel() {
  const { data, error } = await supabaseClient.rpc("is_store_owner");
  if (error) throw error;
  if (data !== true) {
    await supabaseClient.auth.signOut();
    ownerPanel.hidden = true;
    ownerLogin.hidden = false;
    setOwnerStatus("Ce compte n’est pas autorisé à gérer la boutique.", true);
    return;
  }

  ownerLogin.hidden = true;
  ownerPanel.hidden = false;
  setOwnerStatus("Vous êtes connectée. Les modifications seront publiées en ligne.", false);
  await refreshOwnerData();
}

async function restoreOwnerSession() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    setOwnerStatus(`Impossible de vérifier la session : ${error.message}`, true);
    return;
  }
  if (data.session) {
    try {
      await showOwnerPanel();
    } catch (sessionError) {
      setOwnerStatus(`Impossible de vérifier le compte propriétaire : ${sessionError.message}`, true);
    }
  }
}

function resetProductForm() {
  productForm.reset();
  productForm.elements.namedItem("id").value = "";
  cancelProductEdit.hidden = true;
}

function resetReviewForm() {
  reviewAdminForm.reset();
  reviewAdminForm.elements.namedItem("id").value = "";
  reviewAdminForm.elements.namedItem("date").value = todayAsDateInput();
  cancelReviewEdit.hidden = true;
}

document.querySelector("#open-owner").addEventListener("click", () => {
  ownerDialog.showModal();
  if (!supabaseClient) {
    ownerLogin.hidden = true;
    setOwnerStatus(supabaseSetupError, true);
    return;
  }
  if (ownerLogin.hidden && ownerPanel.hidden) ownerLogin.hidden = false;
  restoreOwnerSession();
});

ownerLogin.addEventListener("submit", (event) => {
  event.preventDefault();
  runOwnerAction(async () => {
    setLoginMessage("", false);
    const formData = new FormData(ownerLogin);
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: String(formData.get("email")).trim(),
      password: String(formData.get("password"))
    });
    if (error) {
      setLoginMessage(`Connexion impossible : ${error.message}`, true);
      throw error;
    }
    ownerLogin.elements.namedItem("password").value = "";
    await showOwnerPanel();
  });
});

document.querySelector("#owner-logout").addEventListener("click", () => {
  runOwnerAction(async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    ownerPanel.hidden = true;
    ownerLogin.hidden = false;
    ownerLogin.reset();
    resetProductForm();
    resetReviewForm();
    setOwnerStatus("Vous êtes déconnectée.", false);
  });
});

productForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runOwnerAction(async () => {
    const formData = new FormData(productForm);
    const price = Number(formData.get("price"));
    if (!Number.isSafeInteger(price) || price < 0) {
      throw new Error("Le prix doit être un nombre entier positif.");
    }
    const product = {
      name: String(formData.get("name")).trim(),
      description: String(formData.get("description")).trim(),
      price,
      image: String(formData.get("image")).trim()
    };
    const id = String(formData.get("id"));
    const result = id
      ? await supabaseClient.from("products").update(product).eq("id", id)
      : await supabaseClient.from("products").insert(product);
    if (result.error) throw result.error;
    resetProductForm();
    await refreshOwnerData("Produit enregistré.");
  });
});

reviewAdminForm.addEventListener("submit", (event) => {
  event.preventDefault();
  runOwnerAction(async () => {
    const formData = new FormData(reviewAdminForm);
    const review = {
      name: String(formData.get("name")).trim(),
      rating: Number(formData.get("rating")),
      comment: String(formData.get("comment")).trim(),
      date: String(formData.get("date"))
    };
    const id = String(formData.get("id"));
    const result = id
      ? await supabaseClient.from("reviews").update(review).eq("id", id)
      : await supabaseClient.from("reviews").insert(review);
    if (result.error) throw result.error;
    resetReviewForm();
    await refreshOwnerData("Avis enregistré.");
  });
});

cancelProductEdit.addEventListener("click", resetProductForm);
cancelReviewEdit.addEventListener("click", resetReviewForm);
reviewAdminForm.elements.namedItem("date").value = todayAsDateInput();

document.querySelector("#review-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get("name")).trim();
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment")).trim();
  const message = `Bonjour Channel shop, voici mon avis :\nNom : ${name}\nNote : ${rating}/5\nAvis : ${comment}`;
  window.open(`https://wa.me/660527599?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

loadStore().catch(showStoreError);
restoreOwnerSession();
