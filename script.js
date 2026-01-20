// Global excipients data example (could be expanded or loaded dynamically)
const excipientsData = [
  { name: "Microcrystalline Cellulose", role: "Filler", cost: 5 },
  { name: "Magnesium Stearate", role: "Lubricant", cost: 10 },
  { name: "Povidone", role: "Binder", cost: 7 },
  { name: "Sodium Starch Glycolate", role: "Disintegrant", cost: 8 },
  { name: "Colloidal Silicon Dioxide", role: "Glidant", cost: 6 },
  { name: "Flavor", role: "Flavoring Agent", cost: 12 },
  { name: "Sweetener", role: "Sweetener", cost: 9 },
];

// Utility: format number nicely
function formatNumber(num, decimals = 2) {
  return parseFloat(num).toFixed(decimals);
}

// Show/hide manual excipient selection
const excipientModeSelect = document.getElementById("excipientMode");
const excipientCheckboxesDiv = document.getElementById("excipientCheckboxes");
const step7Section = document.getElementById("step7");

function populateExcipientCheckboxes() {
  excipientCheckboxesDiv.innerHTML = "";
  excipientsData.forEach((ex, idx) => {
    const div = document.createElement("div");
    div.style.marginBottom = "8px";
    div.innerHTML = `
      <input type="checkbox" id="excipient_${idx}" name="excipients" value="${ex.name}" />
      <label for="excipient_${idx}">${ex.name} (${ex.role})</label>
    `;
    excipientCheckboxesDiv.appendChild(div);
  });
}

excipientModeSelect.addEventListener("change", () => {
  if (excipientModeSelect.value === "manual") {
    step7Section.style.display = "block";
    populateExcipientCheckboxes();
  } else {
    step7Section.style.display = "none";
    excipientCheckboxesDiv.innerHTML = "";
  }
});

// Main generate button event
document.getElementById("generateBtn").addEventListener("click", () => {
  // Get inputs
  const apiName = document.getElementById("apiName").value.trim();
  const apiAmount = parseFloat(document.getElementById("apiAmount").value);
  const reference = document.getElementById("reference").value;
  const dosageForm = document.getElementById("dosageForm").value;
  const formulationGoal = document.getElementById("formulationGoal").value;
  const releaseMethod = document.getElementById("releaseMethod").value;
  const excipientMode = excipientModeSelect.value;
  const batchSize = parseInt(document.getElementById("batchSize").value);

  if (
    !apiName ||
    isNaN(apiAmount) || apiAmount <= 0 ||
    !reference ||
    !dosageForm ||
    !formulationGoal ||
    !releaseMethod ||
    isNaN(batchSize) || batchSize <= 0
  ) {
    alert("Please fill all fields with valid values.");
    return;
  }

  // Determine excipients to use
  let selectedExcipients = [];

  if (excipientMode === "manual") {
    const checkedBoxes = document.querySelectorAll('input[name="excipients"]:checked');
    if (checkedBoxes.length === 0) {
      alert("Please select at least one excipient in manual mode.");
      return;
    }
    selectedExcipients = Array.from(checkedBoxes).map(cb => {
      return excipientsData.find(ex => ex.name === cb.value);
    });
  } else {
    // Automatic selection based on formulation goal and dosage form (simplified example)
    // In real world, this should be replaced by a more scientific decision algorithm.
    if (formulationGoal === "Quality") {
      selectedExcipients = excipientsData.filter(ex => ex.role !== "Flavor" && ex.role !== "Sweetener");
    } else if (formulationGoal === "Cost") {
      selectedExcipients = excipientsData.filter(ex => ex.role === "Filler" || ex.role === "Binder");
    } else { // Balanced
      selectedExcipients = excipientsData.filter(ex => ex.role !== "Flavor");
    }
  }

  // Calculate total excipient amount (simplified model)
  // Total weight per unit is active ingredient + excipients
  // Weight optimization based on reference and dosage form (simplified constants)

  const weightMultipliers = {
    USP: 1.15,
    BP: 1.12,
    EUP: 1.10,
  };

  // Base total unit weight
  let totalUnitWeight = apiAmount * (weightMultipliers[reference] || 1.15);

  // Adjust total weight based on dosage form
  if (dosageForm === "Tablet") totalUnitWeight *= 1.0;
  else if (dosageForm === "Liquid") totalUnitWeight *= 3.0; // liquid more volume
  else if (dosageForm === "Powder") totalUnitWeight *= 1.3;

  // Total excipients weight
  let excipientsTotalWeight = totalUnitWeight - apiAmount;
  if (excipientsTotalWeight < 0) excipientsTotalWeight = apiAmount * 0.1;

  // Assign percentages to excipients based on role priority and formulation goal
  // Make sure excipient amounts are not equal

  // Roles priority ordering for percentage (example)
  const rolePriority = ["Filler", "Binder", "Disintegrant", "Lubricant", "Glidant", "Flavoring Agent", "Sweetener"];

  // Filter excipients roles present in selection
  let rolesInSelected = [];
  selectedExcipients.forEach(ex => {
    if (!rolesInSelected.includes(ex.role)) rolesInSelected.push(ex.role);
  });

  // Sort selected excipients by role priority
  selectedExcipients.sort((a, b) => {
    return rolePriority.indexOf(a.role) - rolePriority.indexOf(b.role);
  });

  // Generate percentage distribution (sum 100%)
  // Start with equal but offset slightly by index to avoid equal quantities
  let percentages = [];
  const n = selectedExcipients.length;
  let totalPercentage = 0;
  for (let i = 0; i < n; i++) {
    let base = (100 / n);
    // Offset by small decreasing values
    let offset = (n - i) * 0.5; 
    let pct = base - offset;
    if (pct < 0) pct = 0.1;
    percentages.push(pct);
    totalPercentage += pct;
  }
  // Normalize percentages so sum=100
  percentages = percentages.map(p => p * (100 / totalPercentage));

  // Calculate quantities in mg for excipients
  let excipientQuantities = percentages.map(pct => (excipientsTotalWeight * pct) / 100);

  // Build results data
  const results = [];

  // Add active ingredient
  results.push({
    name: apiName,
    role: "Active Ingredient",
    quantity: apiAmount,
    percentage: (apiAmount / totalUnitWeight) * 100,
    cost: 0, // Active ingredient cost omitted
  });

  // Add excipients
  selectedExcipients.forEach((ex, idx) => {
    results.push({
      name: ex.name,
      role: ex.role,
      quantity: excipientQuantities[idx],
      percentage: percentages[idx],
      cost: ex.cost,
    });
  });

  // Total batch weight in kg
  const totalBatchWeightKg = (totalUnitWeight * batchSize) / 1e6; // mg to kg

  // Cost calculation
  // Cost per ingredient = (quantity mg * batch size) * (cost $/kg) / 1,000,000
  let totalCost = 0;
  results.forEach(r => {
    if (r.cost > 0) {
      totalCost += (r.quantity * batchSize * r.cost) / 1e6;
    }
  });

  // Storage volume estimation (m3) - rough
  // Tablets assumed 0.7 cm3 each, liquids and powders more
  let unitVolumeCm3 = 0.7;
  if (dosageForm === "Liquid") unitVolumeCm3 = 1.8;
  else if (dosageForm === "Powder") unitVolumeCm3 = 1.0;

  const batchVolumeM3 = (unitVolumeCm3 * batchSize) / 1e6; // cm3 to m3

  // Pallets required (standard pallet ~1.2 m3 volume)
  const palletVolumeM3 = 1.2;
  const palletsNeeded = Math.ceil(batchVolumeM3 / palletVolumeM3);

  // Display batch info
  const batchInfoDiv = document.getElementById("batchInfo");
  batchInfoDiv.innerHTML = `
    <p><strong>Batch Size:</strong> ${batchSize.toLocaleString()} units</p>
    <p><strong>Total Batch Weight:</strong> ${formatNumber(totalBatchWeightKg, 3)} kg</p>
    <p><strong>Estimated Storage Volume:</strong> ${formatNumber(batchVolumeM3, 4)} m³</p>
    <p><strong>Pallets Required for Shipping:</strong> ${palletsNeeded}</p>
    <p><strong>Estimated Batch Cost:</strong> $${formatNumber(totalCost, 2)}</p>
  `;

  // Fill results table
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";
  results.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.name}</td>
      <td>${r.role}</td>
      <td>${formatNumber(r.quantity)}</td>
      <td>${formatNumber(r.percentage)}</td>
      <td>${r.cost > 0 ? "$" + formatNumber(r.cost) : "-"}</td>
    `;
    tbody.appendChild(tr);
  });

  // Draw Pie Chart
  const ctx = document.getElementById("pieChart").getContext("2d");
  if (window.pieChartInstance) window.pieChartInstance.destroy();

  window.pieChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: results.map(r => r.name),
      datasets: [{
        data: results.map(r => r.percentage),
        backgroundColor: [
          "#007bff",
          "#28a745",
          "#ffc107",
          "#dc3545",
          "#6f42c1",
          "#fd7e14",
          "#20c997",
          "#6610f2"
        ],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { enabled: true }
      }
    }
  });

  // Generate barcode (batch ID)
  JsBarcode("#barcode", `BATCH-${Date.now()}`, {
    format: "CODE128",
    width: 2,
    height: 60,
    displayValue: true
  });

  // Recommendations section
  const recommendationsDiv = document.getElementById("recommendations");
  recommendationsDiv.innerHTML = `
    <h3>Recommendations</h3>
    <ul>
      <li><strong>Storage Conditions:</strong> Store in a cool, dry place away from direct sunlight.</li>
      <li><strong>Manufacturing Method:</strong> Follow Good Manufacturing Practices (GMP) with precise blending and compression controls.</li>
      <li><strong>Packaging:</strong> Use moisture-resistant blister packs or sealed bottles depending on dosage form.</li>
      <li><strong>Other:</strong> Regular quality checks and stability testing recommended.</li>
    </ul>
  `;

  // Show results section
  document.getElementById("results").style.display = "block";
});
