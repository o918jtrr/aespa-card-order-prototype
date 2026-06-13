const managedProducts = [];

let activeManagedIndex = -1;

function bindEntry() {
  document.querySelector("#enterSite").addEventListener("click", () => {
    document.body.classList.add("entered");
    location.hash = "products";
  });
}

function renderManagedProducts() {
  const list = document.querySelector("#managedProducts");
  if (managedProducts.length === 0) {
    list.innerHTML = `<article class="empty-state">尚未建立商品項目，請按「新增項目」開始。</article>`;
    updateActiveProductTitle();
    return;
  }

  list.innerHTML = managedProducts.map((item, index) => `
    <article class="managed-product ${index === activeManagedIndex ? "active" : ""}">
      <button class="remove-managed" data-delete-product="${index}" aria-label="刪除 ${item.name}">×</button>
      <label>商品名稱
        <input value="${item.name}" data-product-name="${index}" />
      </label>
      <span class="tag">${item.status}</span>
      <span>${item.note}</span>
      <button class="ghost-button" data-product-index="${index}">編輯此項目</button>
      <button class="ghost-button delete-product" data-delete-product="${index}">刪除品項</button>
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

  document.querySelectorAll("[data-delete-product]").forEach((button) => {
    button.addEventListener("click", () => deleteManagedProduct(Number(button.dataset.deleteProduct)));
  });
}

function updateActiveProductTitle() {
  const title = managedProducts[activeManagedIndex]?.name;
  document.querySelector("#editorTitle").textContent = title ? `編輯：${title}` : "請先新增或選擇商品";
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

function bindInventoryInputs() {
  const totalSetsInput = document.querySelector("#totalSetsInput");
  totalSetsInput.addEventListener("input", () => {
    const nextTotal = Math.min(Number(totalSetsInput.value) || 0, 5);
    product.totalSets = nextTotal;
    renderOptions();
    renderStockAccordions();
  });
}

function deleteManagedProduct(index) {
  managedProducts.splice(index, 1);
  products.splice(index, 1);

  if (managedProducts.length === 0) {
    activeManagedIndex = -1;
  } else if (activeManagedIndex >= managedProducts.length) {
    activeManagedIndex = managedProducts.length - 1;
  }

  renderManagedProducts();
  renderProducts();
  renderStockAccordions();
}

function renderStockAccordions() {
  if (managedProducts.length === 0) {
    document.querySelector("#stockTable").innerHTML =
      `<article class="empty-state">尚未建立商品項目，因此目前沒有庫存管理資料。</article>`;
    return;
  }

  const remaining = remainingByMember();
  const stockRows = Object.entries(remaining).map(([key, amount]) => `
    <div class="table-row">
      <strong>${members[key]}</strong>
      <span>總 ${product.totalSets}</span>
      <span>自留 ${product.reserved[key]}</span>
      <span>可售 ${Math.max(0, product.totalSets - product.reserved[key])}</span>
      <span>已售 ${product.sold[key]}</span>
      <span class="tag ${amount <= 0 ? "warn" : "ok"}">剩 ${amount}</span>
    </div>
  `).join("");

  document.querySelector("#stockTable").innerHTML = managedProducts.map((item, index) => `
    <article class="stock-accordion ${index === 0 ? "open" : ""}">
      <button class="stock-toggle" data-stock-toggle>
        <strong>${item.name}庫存管理</strong>
        <span>${index === 0 ? "點擊收合／展開" : "待設定"}</span>
      </button>
      <div class="stock-body">${index === 0 ? stockRows : `<div class="table-row"><strong>尚未建立庫存</strong><span>請先完成商品設定</span></div>`}</div>
    </article>
  `).join("");

  document.querySelectorAll("[data-stock-toggle]").forEach((button) => {
    button.addEventListener("click", () => button.closest(".stock-accordion").classList.toggle("open"));
  });
}

bindEntry();
renderManagedProducts();
bindAddProduct();
bindInventoryInputs();
renderStockAccordions();
