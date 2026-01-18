let chart = null;

document.addEventListener("DOMContentLoaded", () => {
  initWeightMode();
  document.getElementById("formulaForm")
    .addEventListener("submit", generateFormula);
  updateDate();
});

function initWeightMode() {
  document.querySelectorAll("input[name='weightMode']")
    .forEach(r => r.addEventListener("change", autoWeight));
  document.getElementById("primaryGoal")
    .addEventListener("change", autoWeight);
}

function autoWeight() {
  const mode = document.querySelector("input[name='weightMode']:checked").value;
  if (mode !== "auto") return;

  const goal = document.getElementById("primaryGoal").value;
  let w = 1000;

  if (goal === "min-cost") w = 700;
  if (goal === "balanced") w = 1000;
  if (goal === "max-performance") w = 1200;

  document.getElementById("totalWeight").value = w;
}

function generateFormula(e) {
  e.preventDefault();

  const totalWeight = +document.getElementById("totalWeight").value;

  let items = [
    { name: "API", percent: 50, func: "Active" },
    { name: "MCC", percent: 30, func: "Filler" },
    { name: "Povidone", percent: 15, func: "Binder" },
    { name: "Mg Stearate", percent: 5, func: "Lubricant" }
  ];

  normalize(items);
  renderTable(items, totalWeight);
  renderChart(items);

  document.getElementById("resultsContent").style.display = "block";
}

function normalize(list) {
  const sum = list.reduce((a,b)=>a+b.percent,0);
  list.forEach(i => i.percent = +(i.percent*100/sum).toFixed(2));
}

function renderTable(items, weight) {
  const tbody = document.querySelector("#formulaTable tbody");
  tbody.innerHTML = "";

  items.forEach(i => {
    tbody.innerHTML += `
      <tr>
        <td>${i.name}</td>
        <td>${i.percent}% (${(i.percent/100*weight).toFixed(1)})</td>
        <td>${i.func}</td>
      </tr>`;
  });
}

function renderChart(items) {
  let canvas = document.getElementById("chart");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "chart";
    document.getElementById("performanceMetrics").appendChild(canvas);
  }

  if (chart) chart.destroy();

  chart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: items.map(i=>i.name),
      datasets: [{ data: items.map(i=>i.percent) }]
    }
  });
}

function exportResults() {
  html2pdf().from(document.getElementById("resultsContent"))
    .save("formula.pdf");
}

function updateDate() {
  const d = new Date().toISOString().split("T")[0];
  const el = document.getElementById("designDate");
  if (el) el.textContent = d;
}
