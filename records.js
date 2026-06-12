function renderOrders() {
  if (orders.length === 0) {
    document.querySelector("#orderList").innerHTML =
      `<article class="empty-state">目前尚未有訂單。</article>`;
    return;
  }

  document.querySelector("#orderList").innerHTML = orders.map(([id, name, item, status, price]) => `
    <article class="order-row">
      <div><strong>${id}</strong><div class="row-meta">${name} · ${item}</div></div>
      <span>${price}</span>
      <span class="tag">${status}</span>
      <button class="ghost-button">查看</button>
    </article>
  `).join("");
}

function renderEmails() {
  if (emails.length === 0) {
    document.querySelector("#emailLog").innerHTML =
      `<article class="empty-state">目前尚未有 Email 發送紀錄。</article>`;
    return;
  }

  document.querySelector("#emailLog").innerHTML = emails.map(([id, type, status, time]) => `
    <article class="email-row">
      <div><strong>${id}</strong><div class="row-meta">${type}</div></div>
      <span class="tag ${status.includes("失敗") ? "warn" : "ok"}">${status}</span>
      <span>${time}</span>
    </article>
  `).join("");
}

renderOrders();
renderEmails();
