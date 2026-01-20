// Dummy database of excipients with roles, costs and typical ranges (as percentages)
const excipientsDB = [
  { name: "Binder", function: "Binder", cost: 15, min: 2, max: 6 },
  { name: "Disintegrant", function: "Disintegrant", cost: 20, min: 1, max: 4 },
  { name: "Lubricant", function: "Lubricant", cost: 10, min: 0.5, max: 2 },
  { name: "Flavor", function: "Flavor", cost: 25, min: 0.2, max: 1 },
  { name: "Preservative", function: "Preservative", cost: 18, min: 0.5, max: 1.5 },
  { name: "Filler", function: "Filler", cost: 8, min: 10, max: 30 },
];

// Utility function to parse manual excipients input
function parseManualExcipients(text) {
  // Expect lines: Name, Role, Cost per Kg, Min %, Max %
  const lines = text.trim().split('\n');
  const result = [];
  for (const line of lines) {
    const parts = line.split(',').map(s => s.trim());
    if (parts.length === 5) {
      const [name, func, cost, minP, maxP] = parts;
      result.push({
        name,
        function: func,
        cost: parseFloat(cost),
        min: parseFloat(minP),
        max: parseFloat(maxP),
      });
    }
  }
  return result;
}

// Calculate total excipients percentage based on goal
function calculateExcipientsTotalPercent(goal) {
  if (goal === "Quality Only") return 10; // lower excipient content for quality focus
  if (goal === "Cost Only") return 30;    // higher excipient content for cost focus (more fillers)
  return 20;                             // balance
}

function calculateFormulation() {
  // Clear previous results
  const resultsDiv = document.getElementById('results');
  const batchInfoDiv = document.getElementById('batchInfo');
  const recommendationsDiv = document.getElementById('recommendations');
  const tbody = document.querySelector('#resultTable tbody');
  tbody.innerHTML = "";
  recommendationsDiv.innerHTML = "";
  batchInfoDiv.innerHTML = "";

  // Inputs
  const apiName = document.getElementById('apiName').value.trim();
  const apiAmount = parseFloat(document.getElementById('apiAmount').value);
  const referenceStandard = document.getElementById('referenceStandard').value;
  const dosageForm = document.getElementById('dosageForm').value;
  const formulationGoal = document.getElementById('formulationGoal').value;
  const releaseMechanism = document.getElementById('releaseMechanism').value;
  const excipientsMode = document.getElementById('excipientsMode').value;
  const batchSize = parseInt(document.getElementById('batchSize').value);

  if (!apiName || isNaN(apiAmount) || apiAmount <= 0 || isNaN(batchSize) || batchSize <= 0) {
    alert("Please enter valid values for Active Ingredient, Amount, and Batch Size.");
    return;
  }

  // Select excipients list
  let excipientsList = [];
  if (excipientsMode === "manual") {
    const manualText = document.getElementById('manualExcipients').value;
    excipientsList = parseManualExcipients(manualText);
    if (excipientsList.length === 0) {
      alert("Please enter valid manual excipients data.");
      return;
    }
  } else {
    excipientsList = excipientsDB;
  }

  // Total excipients % based on formulation goal
  const totalExcipientsPercent = calculateExcipientsTotalPercent(formulationGoal);

  // Check if manual excipients quantities (min and max) are valid and not all equal
  let equalMinMax = excipientsList.every(e => e.min === e.max);
  if (equalMinMax) {
    alert("Excipients min and max percentages cannot all be equal.");
    return;
  }

  // Distribute excipients % proportionally between min and max (simple average)
  const excipientsPercentages = excipientsList.map(e => (e.min + e.max) / 2);
  const sumPercentages = excipientsPercentages.reduce((a,b) => a+b, 0);
  // Normalize so sum equals totalExcipientsPercent
  const normalizedPercentages = excipientsPercentages.map(p => p * totalExcipientsPercent / sumPercentages);

  // Calculate total unit weight = API + excipients
  const totalUnitWeightMg = apiAmount / (1 - totalExcipientsPercent / 100);

  // Prepare results data rows
  const rows = [];

  // Active Ingredient row
  rows.push({
    name: apiName,
    function: "Active Ingredient",
    quantity: apiAmount,
    percentage: (apiAmount / totalUnitWeightMg) * 100,
    cost: 0, // Assume API cost not included here
  });

  // Excipients rows
  excipientsList.forEach((ex, i) => {
    const pct = normalizedPercentages[i];
    const qtyMg = totalUnitWeightMg * (pct / 100);
    rows.push({
      name: ex.name,
      function: ex.function,
      quantity: qtyMg,
      percentage: pct,
      cost: ex.cost,
    });
  });

  // Fill table rows
  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.function}</td>
      <td>${row.quantity.toFixed(2)}</td>
      <td>${row.percentage.toFixed(2)}</td>
      <td>${row.cost.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Batch info calculations
  // Assume unit volume based on dosage form (rough estimations in cm3)
  const volumePerUnitCm3 = {
    "Tablet": 1,
    "Coated Tablet": 1.1,
    "Liquid Syrup": 5,
    "Dry Syrup": 3,
    "Capsule": 1.2,
  };
  const volumeUnit = volumePerUnitCm3[dosageForm] || 1;
  const batchVolumeCm3 = volumeUnit * batchSize; // cm3
  const batchVolumeM3 = batchVolumeCm3 / 1e6; // m3

  // Assume pallet volume 1.2 m3 each
  const pallets = Math.ceil(batchVolumeM3 / 1.2);

  // Cost calculation: sum (qty in kg * cost per kg)
  let totalCost = 0;
  rows.forEach(row => {
    if (row.name !== apiName) {
      totalCost += (row.quantity / 1e3) * row.cost;
    }
  });

  batchInfoDiv.innerHTML = `
    <p><strong>Batch Size:</strong> ${batchSize} units</p>
    <p><strong>Batch Volume:</strong> ${batchVolumeM3.toFixed(6)} m³</p>
    <p><strong>Number of Pallets:</strong> ${pallets}</p>
    <p><strong>Estimated Batch Cost:</strong> $${totalCost.toFixed(2)}</p>
  `;

  // Generate pie chart
  const ctx = document.getElementById('pieChart').getContext('2d');
  if (window.pieChartInstance) {
    window.pieChartInstance.destroy();
  }
  window.pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: rows.map(r => r.name),
      datasets: [{
        data: rows.map(r => r.percentage),
        backgroundColor: [
          '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d', '#6610f2'
        ],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Formulation Composition (%)' },
      }
    }
  });

  // Generate barcode for batch (using API name + batch size)
  JsBarcode("#barcode", apiName + "-" + batchSize, {
    format: "CODE128",
    lineColor: "#000",
    width: 2,
    height: 50,
    displayValue: true,
  });

  // Recommendations
  recommendationsDiv.innerHTML = `
    <h3>Recommendations</h3>
    <ul>
      <li><strong>Storage Conditions:</strong> Store in a cool, dry place away from direct sunlight.</li>
      <li><strong>Manufacturing Method:</strong> ${determineManufacturingMethod(dosageForm)}</li>
      <li><strong>Optimal Packaging:</strong> ${determinePackagingType(dosageForm)}</li>
      <li><strong>Other:</strong> Ensure excipients compatibility with API chemically and physically.</li>
    </ul>
  `;

  resultsDiv.style.display = 'block';
}

function determineManufacturingMethod(dosageForm) {
  switch (dosageForm) {
    case "Tablet":
    case "Coated Tablet":
      return "Wet granulation or direct compression depending on excipients";
    case "Capsule":
      return "Fill capsules using powder blend";
    case "Liquid Syrup":
      return "Mixing and homogenization";
    case "Dry Syrup":
      return "Mixing dry powders with proper blending";
    default:
      return "Standard manufacturing process";
  }
}

function determinePackagingType(dosageForm) {
  switch (dosageForm) {
    case "Tablet":
      return "Blister packs or strips";
    case "Coated Tablet":
      return "Blister packs";
    case "Capsule":
      return "Bottles or blister packs";
    case "Liquid Syrup":
      return "Bottles with child-resistant caps";
    case "Dry Syrup":
      return "Powder sachets or bottles";
    default:
      return "Standard pharmaceutical packaging";
  }
}

// Show/hide manual excipients input
document.getElementById('excipientsMode').addEventListener('change', (e) => {
  const manualContainer = document.getElementById('manualExcipientsContainer');
  if (e.target.value === 'manual') {
    manualContainer.style.display = 'block';
  } else {
    manualContainer.style.display = 'none';
  }
});

document.getElementById('calculateBtn').addEventListener('click', calculateFormulation);
