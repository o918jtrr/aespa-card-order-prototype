const members = {
  karina: "柚 Karina",
  giselle: "吉 Giselle",
  winter: "冬 Winter",
  ningning: "寧 Ningning",
};

const product = {
  name: "",
  totalSets: 5,
  reserved: { karina: 0, giselle: 0, winter: 2, ningning: 0 },
  sold: { karina: 0, giselle: 0, winter: 0, ningning: 0 },
  prices: {},
};

const optionNeeds = {
  "柚": ["karina"],
  "吉": ["giselle"],
  "冬": ["winter"],
  "寧": ["ningning"],
  "柚吉": ["karina", "giselle"],
  "柚寧": ["karina", "ningning"],
  "冬吉": ["winter", "giselle"],
  "冬寧": ["winter", "ningning"],
  "吉寧": ["giselle", "ningning"],
  "套收": ["karina", "giselle", "winter", "ningning"],
};

const products = [];

let itemDrafts = [
  ["柚", "Karina", "Karina"],
  ["吉", "Giselle", "Giselle"],
  ["冬", "Winter", "Winter"],
  ["寧", "Ningning", "Ningning"],
  ["柚吉", "Karina + Giselle", "Karina + Giselle"],
  ["柚寧", "Karina + Ningning", "Karina + Ningning"],
  ["冬吉", "Winter + Giselle", "Winter + Giselle"],
  ["冬寧", "Winter + Ningning", "Winter + Ningning"],
  ["吉寧", "Giselle + Ningning", "Giselle + Ningning"],
  ["套收", "四人套收", "四人套收"],
];

const orders = [];

const emails = [];

let selected = null;
let mainPreviewUrl = "";

function todayPaymentDeadline() {
  const now = new Date();
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} 23:59`;
}

// CRITICAL: 這段計算每位成員剩餘可售庫存，若刪除或改錯會造成前台誤判庫存並可能超賣。所在檔案：app.js
function remainingByMember() {
  return Object.fromEntries(
    Object.keys(members).map((key) => [
      key,
      product.totalSets - product.reserved[key] - product.sold[key],
    ]),
  );
}

// CRITICAL: 品項是否可下單必須檢查所有會扣到的成員，套收也依四位成員最小庫存判斷。所在檔案：app.js
function optionStock(option) {
  const remaining = remainingByMember();
  return Math.min(...optionNeeds[option].map((member) => remaining[member]));
}

function renderProducts() {
  const grid = document.querySelector("#productGrid");
  updateStorefrontAvailability();
  if (products.length === 0) {
    grid.innerHTML = `<article class="empty-state">目前尚未開放小卡，請等待版主更新。</article>`;
    return;
  }

  grid.innerHTML = products.map(([name, status, options, stock], index) => `
    <article class="product-card">
      <div class="product-art" ${index === 0 && mainPreviewUrl ? `style="background-image:url('${mainPreviewUrl}')"` : ""}>
        <span class="status-pill">${status}</span>
      </div>
      <div class="product-card-body">
        <strong>${name}</strong>
        <p>非現貨代購皆需要等 30 至 60 天。</p>
        <div class="product-meta"><span>${options}</span><span>${index === 0 ? "可下單品項依庫存顯示" : stock}</span></div>
      </div>
    </article>
  `).join("");
  updateStorefrontAvailability();
}

function updateStorefrontAvailability() {
  const hasProducts = products.length > 0;
  document.querySelector("#productDetail").classList.toggle("hidden", !hasProducts);
  document.querySelector("#order").classList.toggle("hidden", !hasProducts);
  if (!hasProducts) return;

  const currentName = products[0][0];
  document.querySelector("#productDetail h2").textContent = currentName;
  document.querySelector("#order .summary-card strong").textContent = currentName;
}

function renderOptions() {
  const grid = document.querySelector("#optionGrid");
  grid.innerHTML = Object.keys(optionNeeds).map((option) => {
    const stock = optionStock(option);
    const disabled = stock <= 0;
    const price = product.prices[option] ? `NT$${product.prices[option]}` : "未定價";
    return `
      <button class="option-button" data-option="${option}" ${disabled ? "disabled" : ""}>
        ${option}<small>${disabled ? "售完" : `${price} · 剩 ${stock}`}</small>
      </button>
    `;
  }).join("");

  document.querySelectorAll(".option-button").forEach((button) => {
    button.addEventListener("click", () => selectOption(button.dataset.option));
  });
}

function selectOption(option) {
  selected = option;
  document.querySelectorAll(".option-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.option === option);
  });
  document.querySelector("#selectedOption").textContent = option;
  document.querySelector("#selectedPrice").textContent = product.prices[option] ? `NT$${product.prices[option]}` : "未定價";
  document.querySelector("#checkoutOption").textContent = option;
  document.querySelector("#checkoutPrice").textContent = product.prices[option] ? `NT$${product.prices[option]}` : "未定價";
}

function renderStock() {
  const rows = Object.entries(remainingByMember()).map(([key, remaining]) => {
    const sellable = product.totalSets - product.reserved[key];
    return `
      <div class="table-row">
        <strong>${members[key]}</strong>
        <span>總 ${product.totalSets}</span>
        <span>自留 ${product.reserved[key]}</span>
        <span>可售 ${sellable}</span>
        <span>已售 ${product.sold[key]}</span>
        <span class="tag ${remaining <= 0 ? "warn" : "ok"}">剩 ${remaining}</span>
      </div>
    `;
  }).join("");
  document.querySelector("#stockTable").innerHTML = rows;
}

function renderItemEditor() {
  const editor = document.querySelector("#itemEditor");
  editor.innerHTML = itemDrafts.map(([code, name, title], index) => `
    <article class="item-row">
      <button class="remove-item" data-remove-index="${index}" aria-label="刪除 ${code}">×</button>
      <div class="item-preview" id="itemPreview${index}">
        ${itemPreviewLabel(code, name)}
      </div>
      <label>品項標題<input value="${title}" /></label>
      <label>品項單價<input value="${product.prices[code] || ""}" placeholder="NT$" /></label>
      <div class="image-field">
        <label>品項圖片<input type="file" accept="image/*" data-preview-input="itemPreview${index}" /></label>
        <button class="ghost-button clear-image" data-clear-preview="itemPreview${index}" data-code="${code}" data-name="${name}">
          移除圖片
        </button>
      </div>
    </article>
  `).join("");
  bindItemDeletes();
  bindImagePreviews();
  bindImageClears();
}

function itemPreviewLabel(code, name) {
  return `<span>${code}</span><strong>${name}</strong>`;
}

function bindItemDeletes() {
  document.querySelectorAll("[data-remove-index]").forEach((button) => {
    button.addEventListener("click", () => {
      itemDrafts = itemDrafts.filter((_, index) => index !== Number(button.dataset.removeIndex));
      renderItemEditor();
    });
  });
}

function bindImagePreviews() {
  document.querySelectorAll("[data-preview-input]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files[0];
      const preview = document.querySelector(`#${input.dataset.previewInput}`);
      if (!file || !preview) return;

      const image = document.createElement("img");
      image.src = URL.createObjectURL(file);
      image.alt = file.name;
      preview.replaceChildren(image);
      if (input.dataset.previewInput === "mainPreview") updateFrontPreview(image.src);
    });
  });
}

function updateFrontPreview(imageUrl) {
  mainPreviewUrl = imageUrl;
  const detail = document.querySelector(".album-visual");
  const thumb = document.querySelector(".thumb");
  const firstCard = document.querySelector(".product-card .product-art");

  if (detail) detail.innerHTML = `<img src="${imageUrl}" alt="商品預覽圖" />`;
  if (thumb) thumb.style.backgroundImage = `url('${imageUrl}')`;
  if (firstCard) firstCard.style.backgroundImage = `url('${imageUrl}')`;
}

function bindImageClears() {
  document.querySelectorAll("[data-clear-preview]").forEach((button) => {
    button.addEventListener("click", () => {
      const previewId = button.dataset.clearPreview;
      const preview = document.querySelector(`#${previewId}`);
      const input = document.querySelector(`[data-preview-input="${previewId}"]`);
      if (input) input.value = "";
      if (preview) preview.innerHTML = itemPreviewLabel(button.dataset.code, button.dataset.name);
    });
  });
}

function bindModeTabs() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-mode]").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".mode-panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`#${button.dataset.mode}`).classList.add("active");
    });
  });
}

function bindSubmit() {
  document.querySelector("#submitOrder").addEventListener("click", () => {
    const toast = document.querySelector("#toast");
    toast.textContent = selected
      ? `下單資料已送出，請於 ${todayPaymentDeadline()} 前完成確認`
      : "請先在商品詳情選擇可下單品項";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2600);
  });
}

function renderPaymentDeadline() {
  document.querySelector("#paymentDeadline").textContent = todayPaymentDeadline();
}

renderProducts();
renderOptions();
renderStock();
renderItemEditor();
renderPaymentDeadline();
bindModeTabs();
bindSubmit();
bindImagePreviews();
