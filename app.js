const productList = document.querySelector("#product-list");
const reviewList = document.querySelector("#review-list");

document.querySelector("#year").textContent = new Date().getFullYear();

function formatPrice(price) {
  return `${new Intl.NumberFormat("fr-FR").format(price)} GNF`;
}

function whatsappLink(product) {
  const message = `Bonjour Channel shop, je souhaite commander : ${product.name} (${formatPrice(product.price)}).`;
  return `https://wa.me/+224660527599?text=${encodeURIComponent(message)}`;
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

const store = window.CHANNEL_SHOP_DATA;
if (!store || !Array.isArray(store.products) || !Array.isArray(store.reviews)) {
  productList.textContent = "Impossible de charger les produits. Veuillez réessayer plus tard.";
  reviewList.replaceChildren();
} else {
  showEntries(
    productList,
    store.products,
    "Les nouveaux produits seront bientôt disponibles. Revenez nous voir !",
    productCard
  );
  showEntries(
    reviewList,
    store.reviews,
    "Aucun avis publié pour le moment. Envoyez-nous le vôtre sur WhatsApp !",
    reviewCard
  );
}

document.querySelector("#review-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get("name")).trim();
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment")).trim();
  const message = `Bonjour Channel shop, voici mon avis :\nNom : ${name}\nNote : ${rating}/5\nAvis : ${comment}`;
  window.open(`https://wa.me/660527599?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});
