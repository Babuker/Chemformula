document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulaForm");
  const manualExcipientSection = document.getElementById("manualExcipientSection");
  const excipientRadios = document.getElementsByName("excipientMode");

  // Toggle manual excipient input
  excipientRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "manual" && radio.checked) {
        manualExcipientSection.style.display = "block";
      } else {
        manualExcipientSection.style.display = "none";
      }
    });
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    generateFormula();
  });
});

function calculateOptimalUnitWeight(apiMg, reference, goal) {
  let multiplier;

  if (apiMg >= 500) multiplier = 1.6;
  else if (apiMg >= 200) multiplier = 2;
  else multiplier = 4;

  if (goal === "Quality") multiplier += 0.5;
  if (goal === "Cost") multiplier -= 0.2;

  if (reference === "USP") multiplier += 0.2;
  if (reference === "EUP") multiplier += 0.3;

  const totalWeight = apiMg * multiplier;

  return Math.round(totalWeight / 10) * 10; // rounded for manufacturability
}

function generateFormula() {
  const apiName = document.getElementById("apiName").value.trim() || "API";
  const apiMg = parseFloat(document.getElementById("apiMg").value);
  const reference = document.getElementById("reference").value;
  const dosageForm = document.getElementById("dosageForm").value;
  const goal = document.getElementById("formGoal").value;
  const releaseMethod = document.getElementById("releaseMethod").value.trim();
  const excipientMode = document.querySelector('input[name="excipientMode"]:checked').value;
  const manualExcipientsInput = document.getElementById("manualExcipients").value.trim();
  const batchSize = parseInt(document.getElementById("batchSize").value);

  if (isNaN(apiMg) || apiMg <= 0 || isNaN(batchSize) || batchSize <= 0) {
    alert("Please enter valid numbers for API amount and batch size.");
    return;
  }

  // Calculate total unit weight
  const totalWeight = calculateOptimalUnitWeight(apiMg, reference, goal);

  // Determine excipients list
  let excipients = [];

  if (excipientMode === "manual" && manualExcipientsInput.length > 0) {
    excipients = manualExcipientsInput.split(",").map(e => e.trim()).filter(e => e.length > 0);
  } else {
    // Auto selection based on dosage form
    if (dosageForm === "Tablet") {
      excipients = ["Lactose", "PVP", "Croscarmellose", "Magnesium Stearate"];
    } else if (dosageForm === "Liquid") {
      excipients = ["Water", "Sweetener", "Preservative"];
    } else if (dosageForm === "Powder") {
      excipients = ["Mannitol", "Silicon Dioxide"];
    }
  }

  // Assign approximate % to excipients to fill up 100%
  const apiPercent = (apiMg / totalWeight) * 100;
  const excipientTotalPercent = 100 - apiPercent;
  const excipientCount = excipients.length;

  // Distribute excipients % evenly for simplicity
  const perExcipientPercent = excipientCount > 0 ? excipientTotalPercent / excipientCount : 0;

  // Example costs per kg in USD (these can be customized)
  const costs = {
    "Lactose": 8,
    "PVP": 25,
    "Croscarmellose": 30,
    "Magnesium Stearate": 15,
    "Water": 0.5,
    "Sweetener": 20,
    "Preservative": 40,
    "Mannitol": 12,
    "Silicon Dioxide": 18
  };

  // Prepare components array
  let components = [
    { name: apiName, role: "API", percent: apiPercent, cost: 120 }
  ];

  excipients.forEach(excipient => {
    components.push({
      name: excipient,
      role: "Excipient",
      percent: perExcipientPercent,
      cost: costs[excipient] || 10
    });
  });

  // Build table
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  let labels = [];
  let data = [];
  let totalBatchCost = 0;

  components.forEach(c => {
    const mg = (c.percent / 100) * totalWeight;
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${c.name}</td>
      <td>${c.role}</td>
      <td>${mg.toFixed(2)}</td>
      <td>${c.percent.toFixed(2)}%</td>
      <td>${c.cost}</td>
    `;

    tbody.appendChild(row);

    labels.push(c.name);
    data.push(c.percent);

    totalBatchCost += (mg * batchSize / 1e6) * c.cost;
  });

  // Pie Chart
  const ctx = document.getElementById("pieChart");
  if (window.pie) window.pie.destroy();

  window.pie = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
          "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ac"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });

  // Batch info and recommendations
  document.getElementById("batchInfo").innerHTML = `
    <h3>Batch Information</h3>
    <p>Batch size: ${batchSize} units</p>
    <p>Total batch cost: $${totalBatchCost.toFixed(2)}</p>
    <p>Estimated storage volume: ${(batchSize * totalWeight / 1e6).toFixed(2)} kg</p>
  `;

  document.getElementById("recommendations").innerHTML = `
    <h3>Recommendations</h3>
    <ul>
      <li>Store below 25°C, dry conditions</li>
      <li>Use appropriate packaging (e.g., blister packs or bottles)</li>
      <li>Handle according to ${releaseMethod || "standard"} release profile</li>
    </ul>
  `;

  document.getElementById("results").style.display = "block";
}
