/**
 * Banking Dashboard - script.js
 * Gọi Flask API, vẽ Chart.js, bộ lọc bang
 */

const API = "http://127.0.0.1:8000";

// Bảng màu
const COLORS = [
  "#1565c0","#43a047","#fb8c00","#00acc1","#8e24aa",
  "#e53935","#00897b","#f9a825","#5e35b1","#d81b60",
  "#0288d1","#558b2f","#ef6c00","#00838f","#6a1b9a",
];

// ── Số tiền format ──
const fmtMoney = (n) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(2)}B`
  : n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M`
  : `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtNum = (n) => n.toLocaleString("vi-VN");

// ── Tạo biểu đồ Bar ngang ──
function makeHBar(id, labels, data, colors) {
  return new Chart(document.getElementById(id).getContext("2d"), {
    type: "bar",
    data: { labels, datasets: [{ data, backgroundColor: colors || COLORS.slice(0, labels.length), borderRadius: 5, borderWidth: 0 }] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      animation: { duration: 700 },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${fmtNum(c.parsed.x)}` } } },
      scales: {
        x: { beginAtZero: true, ticks: { font: { family: "Poppins", size: 10 } }, grid: { color: "#f0f4f8" } },
        y: { ticks: { font: { family: "Poppins", size: 10 } }, grid: { display: false } },
      },
    },
  });
}

// ── Tạo biểu đồ Bar đứng ──
function makeVBar(id, labels, data, colors) {
  return new Chart(document.getElementById(id).getContext("2d"), {
    type: "bar",
    data: { labels, datasets: [{ data, backgroundColor: colors || COLORS.slice(0, labels.length), borderRadius: 5, borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, animation: { duration: 700 },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${fmtNum(c.parsed.y)}` } } },
      scales: {
        x: { ticks: { font: { family: "Poppins", size: 10 } }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { font: { family: "Poppins", size: 10 } }, grid: { color: "#f0f4f8" } },
      },
    },
  });
}

// ── Tạo biểu đồ Doughnut ──
function makeDoughnut(id, labels, data, colors) {
  return new Chart(document.getElementById(id).getContext("2d"), {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: colors || COLORS.slice(0, labels.length), borderWidth: 2, hoverOffset: 8 }] },
    options: {
      responsive: true, maintainAspectRatio: false, animation: { duration: 700 },
      plugins: {
        legend: { position: "bottom", labels: { font: { family: "Poppins", size: 10 }, padding: 10, boxWidth: 12 } },
        tooltip: { callbacks: { label: (c) => ` ${c.label}: ${fmtNum(c.parsed)}` } },
      },
    },
  });
}

// ════════════════════════════════════════
// 1. KPI OVERVIEW
// ════════════════════════════════════════
async function loadOverview() {
  const res  = await fetch(`${API}/api/overview`);
  const data = await res.json();

  document.getElementById("kpi-customers").textContent    = fmtNum(data.total_customers);
  document.getElementById("kpi-accounts").textContent     = fmtNum(data.total_accounts);
  document.getElementById("kpi-branches").textContent     = fmtNum(data.total_branches);
  document.getElementById("kpi-cards").textContent        = fmtNum(data.total_cards);
  document.getElementById("kpi-transactions").textContent = fmtNum(data.total_transactions);
  document.getElementById("kpi-balance").textContent      = fmtMoney(data.total_balance);
  document.getElementById("kpi-fraud").textContent        = fmtNum(data.fraud_count);
  document.getElementById("kpi-credit").textContent       = data.avg_credit_score;
}

// ════════════════════════════════════════
// 2. ACCOUNTS BY TYPE - Doughnut
// ════════════════════════════════════════
async function loadAccountType() {
  const res  = await fetch(`${API}/api/accounts-by-type`);
  const data = await res.json();
  makeDoughnut("chartAccountType", data.map(d => d.account_type), data.map(d => d.count));
}

// ════════════════════════════════════════
// 3. TRANSACTIONS BY TYPE - Bar đứng
// ════════════════════════════════════════
async function loadTxnType() {
  const res  = await fetch(`${API}/api/transactions-by-type`);
  const data = await res.json();
  makeVBar("chartTxnType", data.map(d => d.txn_type), data.map(d => d.count));
}

// ════════════════════════════════════════
// 4. TRANSACTIONS BY CHANNEL - Doughnut
// ════════════════════════════════════════
async function loadChannel() {
  const res  = await fetch(`${API}/api/transactions-by-channel`);
  const data = await res.json();
  makeDoughnut("chartChannel", data.map(d => d.channel), data.map(d => d.count));
}

// ════════════════════════════════════════
// 5. CARDS BY TYPE - Doughnut
// ════════════════════════════════════════
async function loadCardType() {
  const res  = await fetch(`${API}/api/cards-by-type`);
  const data = await res.json();
  makeDoughnut("chartCardType", data.map(d => d.card_type), data.map(d => d.count));
}

// ════════════════════════════════════════
// 6. OCCUPATION - Bar ngang
// ════════════════════════════════════════
async function loadOccupation() {
  const res  = await fetch(`${API}/api/customers-by-occupation`);
  const data = await res.json();
  makeHBar("chartOccupation", data.map(d => d.occupation), data.map(d => d.count));
}

// ════════════════════════════════════════
// 7. CUSTOMERS BY STATE - Bar đứng + bộ lọc
// ════════════════════════════════════════
let allStateData = [];
let stateChart   = null;

async function loadCustomersByState() {
  const res  = await fetch(`${API}/api/customers-by-state`);
  allStateData = await res.json();

  // Điền dropdown
  const sel = document.getElementById("state-filter");
  [...allStateData].sort((a, b) => a.state.localeCompare(b.state)).forEach(({ state, total }) => {
    const opt = document.createElement("option");
    opt.value = state;
    opt.textContent = `${state} (${fmtNum(total)})`;
    sel.appendChild(opt);
  });

  renderStateChart(allStateData);
}

function renderStateChart(data) {
  if (stateChart) stateChart.destroy();
  document.getElementById("badge-state").textContent =
    data.length === allStateData.length ? "Tất cả bang" : `Bang ${data[0]?.state}`;

  stateChart = new Chart(document.getElementById("chartStateBar").getContext("2d"), {
    type: "bar",
    data: {
      labels: data.map(d => d.state),
      datasets: [{
        label: "Khách hàng",
        data: data.map(d => d.total),
        backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 5, borderWidth: 0,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: { duration: 700 },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${fmtNum(c.parsed.y)} KH` } } },
      scales: {
        x: { ticks: { font: { family: "Poppins", size: 9 }, maxRotation: 45 }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { font: { family: "Poppins", size: 10 } }, grid: { color: "#f0f4f8" } },
      },
    },
  });
}

// Sự kiện bộ lọc bang
document.getElementById("state-filter").addEventListener("change", (e) => {
  const val = e.target.value;
  const filtered = val === "ALL" ? allStateData : allStateData.filter(d => d.state === val);
  renderStateChart(filtered);
});

document.getElementById("btn-reset-state").addEventListener("click", () => {
  document.getElementById("state-filter").value = "ALL";
  renderStateChart(allStateData);
});

// ════════════════════════════════════════
// 8. CARD TRANSACTIONS BY CATEGORY - Bar ngang + fraud overlay
// ════════════════════════════════════════
async function loadCardCategory() {
  const res  = await fetch(`${API}/api/card-txns-by-category`);
  const data = await res.json();

  new Chart(document.getElementById("chartCardCategory").getContext("2d"), {
    type: "bar",
    data: {
      labels: data.map(d => d.merchant_category),
      datasets: [
        { label: "Tổng GD", data: data.map(d => d.count), backgroundColor: "#1565c0", borderRadius: 4, borderWidth: 0 },
        { label: "Gian lận", data: data.map(d => d.fraud_count), backgroundColor: "#e53935", borderRadius: 4, borderWidth: 0 },
      ],
    },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false, animation: { duration: 700 },
      plugins: {
        legend: { position: "top", labels: { font: { family: "Poppins", size: 10 }, padding: 10, boxWidth: 12 } },
        tooltip: { callbacks: { label: (c) => ` ${c.dataset.label}: ${fmtNum(c.parsed.x)}` } },
      },
      scales: {
        x: { beginAtZero: true, ticks: { font: { family: "Poppins", size: 10 } }, grid: { color: "#f0f4f8" } },
        y: { ticks: { font: { family: "Poppins", size: 10 } }, grid: { display: false } },
      },
    },
  });
}

// ════════════════════════════════════════
// 9. TOP BRANCHES TABLE
// ════════════════════════════════════════
async function loadTopBranches() {
  const res  = await fetch(`${API}/api/top-branches`);
  const data = await res.json();
  const tbody = document.getElementById("branch-tbody");

  tbody.innerHTML = data.map(({ branch_name, city, state, account_count, total_balance }, i) => {
    const rankClass = i === 0 ? "r1" : i === 1 ? "r2" : i === 2 ? "r3" : "";
    const maxCount  = data[0].account_count;
    const pct       = ((account_count / maxCount) * 100).toFixed(1);
    return `
      <tr>
        <td class="rank ${rankClass}">${i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
        <td><strong>${branch_name}</strong></td>
        <td>${city}</td>
        <td>${state}</td>
        <td>
          <div class="bar-cell">
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
            <span class="bar-pct">${fmtNum(account_count)}</span>
          </div>
        </td>
        <td>${fmtMoney(total_balance)}</td>
      </tr>`;
  }).join("");
}

// ════════════════════════════════════════
// KHỞI TẠO - gọi tất cả API song song
// ════════════════════════════════════════
async function init() {
  // Gọi từng API riêng để lỗi 1 API không block cái khác
  await Promise.allSettled([
    loadOverview(),
    loadAccountType(),
    loadTxnType(),
    loadChannel(),
    loadCardType(),
    loadOccupation(),
    loadCustomersByState(),
    loadCardCategory(),
    loadTopBranches(),
  ]);
}

document.addEventListener("DOMContentLoaded", init);
