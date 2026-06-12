const managedProducts = [
  { name: "K4 幸運卡", status: "收單中", note: "目前前台主商品" },
  { name: "Drama POP-UP 小卡", status: "收單中", note: "待補品項價格" },
  { name: "Armageddon 展場特典", status: "已截止", note: "保留查詢" },
];

let activeManagedIndex = 0;

function bindEntry() {
  document.querySelector("#enterSite").addEventListener("click", () => {
    document.body.classList.add("entered");
    location.hash = "products";
  });
}

function renderManagedProducts() {
  const list = document.querySelector("#managedProducts");
  list.innerHTML = managedProducts.map((item, index) => `
    <article class="managed-product ${index === activeManagedIndex ? "active" : ""}">
      <label>商品名稱
        <input value="${item.name}" data-product-name="${index}" />
      </label>
      <span class="tag">${item.status}</span>
      <span>${item.note}</span>
      <button class="ghost-button" data-product-index="${index}">編輯此項目</button>
    </article>
  `).join("");

  document.querySelectorAll("[data-product-name]").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.productName);
      managedProducts[index].name = input.value;
      products[index][0] = input.value;
      if (index === activeManagedIndex) updateActiveProductTitle();
      renderProducts();
      renderStockAccordions();
    });
  });

  document.querySelectorAll("[data-product-index]").forEach((button) => {
    button.addEventListener("click", () => {
      activeManagedIndex = Number(button.dataset.productIndex);
      updateActiveProductTitle();
      renderManagedProducts();
    });
  });
}

function updateActiveProductTitle() {
  document.querySelector("#editorTitle").textContent = `編輯：${managedProducts[activeManagedIndex].name}`;
}

function bindAddProduct() {
  document.querySelector("#addProduct").addEventListener("click", () => {
    const nextNumber = managedProducts.length + 1;
    managedProducts.push({
      name: `新小卡項目 ${nextNumber}`,
      status: "草稿",
      note: "尚未同步到前台",
    });
    products.push([`新小卡項目 ${nextNumber}`, "草稿", "待設定品項", "前台不顯示"]);
    activeManagedIndex = managedProducts.length - 1;
    renderManagedProducts();
    renderProducts();
    renderStockAccordions();
  });
}

function renderStockAccordions() {
  const remaining = remainingByMember();
  const stockRows = Object.entries(remaining).map(([key, amount]) => `
    <div class="table-row">
      <strong>${members[key]}</strong>
      <span>總 ${product.totalSets}</span>
      <span>自留 ${product.reserved[key]}</span>
      <span>可售 ${product.totalSets - product.reserved[key]}</span>
      <span>已售 ${product.sold[key]}</span>
      <span class="tag ${amount <= 0 ? "warn" : "ok"}">剩 ${amount}</span>
    </div>
  `).join("");

  document.querySelector("#stockTable").innerHTML = `
    <article class="stock-accordion open">
      <button class="stock-toggle" data-stock-toggle>
        <strong>${managedProducts[0].name}庫存管理</strong>
        <span>點擊收合／展開</span>
      </button>
      <div class="stock-body">${stockRows}</div>
    </article>
    <article class="stock-accordion">
      <button class="stock-toggle" data-stock-toggle>
        <strong>${managedProducts[1]?.name || "第二筆商品"}庫存管理</strong>
        <span>待設定</span>
      </button>
      <div class="stock-body">
        <div class="table-row"><strong>尚未建立庫存</strong><span>請先完成商品設定</span></div>
      </div>
    </article>
  `;

  document.querySelectorAll("[data-stock-toggle]").forEach((button) => {
    button.addEventListener("click", () => button.closest(".stock-accordion").classList.toggle("open"));
  });
}

bindEntry();
renderManagedProducts();
bindAddProduct();
renderStockAccordions();
