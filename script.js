// Data for excipients
const excipientsData = [
  { name: "Microcrystalline Cellulose", role: "Filler", cost: 5 },
  { name: "Magnesium Stearate", role: "Lubricant", cost: 10 },
  { name: "Povidone", role: "Binder", cost: 7 },
  { name: "Sodium Starch Glycolate", role: "Disintegrant", cost: 8 },
  { name: "Colloidal Silicon Dioxide", role: "Glidant", cost: 6 },
  { name: "Flavor", role: "Flavoring Agent", cost: 12 },
  { name: "Sweetener", role: "Sweetener", cost: 9 },
];

// Format numbers nicely
function formatNumber(num, decimals = 2) {
  return parseFloat(num).toFixed(decimals);
}

// Language switcher functionality
const langSelect = document.getElementById("langSelect");
langSelect.addEventListener("change", (e) => {
  const lang = e.target.value;
  localStorage.setItem("lang", lang);
  if (lang === "ar") window.location.href = "index-ar.html";
  else window.location.href = "index.html";
});
window.addEventListener("load", () => {
  const savedLang = localStorage.getItem("lang");
  if (savedLang && savedLang === "ar" && !window.location.href.includes("index-ar.html")) {
    window.location.href = "index-ar.html";
  } else if (savedLang === "en" && window.location.href.includes("index-ar.html")) {
    window.location.href = "index.html";
  }
});

// Excipient manual selection show/hide
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

// Main generate button
document.getElementById("generateBtn").addEventListener("click", () => {
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

  // Selected excipients
  let selectedExcipients = [];

  if (excipientMode === "manual") {
    const checkedBoxes = document.querySelectorAll('input[name="excipients"]:checked');
    if (checkedBoxes.length === 0) {
      alert("Please select at least one excipient in manual mode.");
      return;
    }
    selectedExcipients = Array.from(checkedBoxes).map(cb => excipientsData.find(ex => ex.name === cb.value));
  } else {
    if (formulationGoal === "Quality") {
      selectedExcipients = excipientsData.filter(ex => ex.role !== "Flavor" && ex.role !== "Sweetener");
    } else if (formulationGoal === "Cost") {
      selectedExcipients = excipientsData.filter(ex => ex.role === "Filler" || ex.role === "Binder");
    } else {
      selectedExcipients = excipientsData.filter(ex => ex.role !== "Flavor");
    }
  }

  // Total unit weight calculation
  const weightMultipliers = { USP: 1.15, BP: 1.12, EUP: 1.10 };
  let totalUnitWeight = apiAmount * (weightMultipliers[reference] || 1.15);

  if (dosageForm === "Tablet") totalUnitWeight *= 1.0;
  else if (dosageForm === "Liquid") totalUnitWeight *= 3.0;
  else if (dosageForm === "Powder") totalUnitWeight *= 1.3;

  let excipientsTotalWeight = totalUnitWeight - apiAmount;
  if (excipientsTotalWeight < 0) excipientsTotalWeight = apiAmount * 0.1;

  // Ensure excipient quantities are not equal - distribute percentages differently
  let percentages = [];
  const n = selectedExcipients.length;
  let totalPercentage = 0;
  for (let i = 0; i < n; i++) {
    let pct = 5 + (i * (95 / (n - 1))); // linear increasing percentage
    percentages.push(pct);
    totalPercentage += pct;
  }
  percentages = percentages.map(p => p * (100 / totalPercentage)); // normalize to 100%

  let excipientQuantities = percentages.map(pct => (pct * excipientsTotalWeight) / 100);

  // Compose full formulation list including API
  const formulation = [{
    name: apiName,
    role: "Active Ingredient",
    quantity: apiAmount,
    percentage: (apiAmount / totalUnitWeight) * 100,
    cost: 0 // Assume cost included in excipients or ignored here
  }];

  for (let i = 0; i < n; i++) {
    formulation.push({
      name: selectedExcipients[i].name,
      role: selectedExcipients[i].role,
      quantity: excipientQuantities[i],
      percentage: percentages[i],
      cost: selectedExcipients[i].cost
    });
  }

  // Calculate costs
  let totalCost = 0;
  for (const item of formulation) {
    totalCost += (item.quantity / 1000) * item.cost * batchSize; // quantity in grams * cost per kg * batch size
  }

  // Calculate batch total weight (kg)
  const totalBatchWeightKg = (totalUnitWeight * batchSize) / 1000;

  // Calculate storage volume (m³) and pallets needed
  // Assume average unit volume:
  let unitVolumeCm3 = dosageForm === "Tablet" ? 0.5 :
                      dosageForm === "Liquid" ? 5 :
                      dosageForm === "Powder" ? 0.7 : 0.5;
  const batchVolumeM3 = (unitVolumeCm3 * batchSize) / 1e6; // cm3 to m3
  const palletVolumeM3 = 1.2; // standard pallet volume in m3
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
  formulation.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.role}</td>
      <td>${formatNumber(item.quantity, 3)}</td>
      <td>${formatNumber(item.percentage, 2)}%</td>
      <td>${item.cost ? "$" + formatNumber(item.cost, 2) : "-"}</td>
    `;
    tbody.appendChild(tr);
  });

  // Show results section
  document.getElementById("results").style.display = "block";

  // Draw pie chart
  const ctx = document.getElementById("pieChart").getContext("2d");
  if(window.myPieChart) window.myPieChart.destroy();
  window.myPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: formulation.map(f => f.name),
      datasets: [{
        data: formulation.map(f => f.quantity),
        backgroundColor: [
          "#007bff", "#28a745", "#ffc107", "#dc3545", "#6f42c1", "#20c997", "#fd7e14", "#343a40"
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });

  // Generate barcode for batch ID (random for demo)
  const barcodeSVG = document.getElementById("barcode");
  barcodeSVG.innerHTML = "";
  const batchID = "CF" + Date.now();
  JsBarcode(barcodeSVG, batchID, {
    format: "CODE128",
    lineColor: "#0a72f7",
    width: 2,
    height: 50,
    displayValue: true
  });

  // Recommendations section
  const recommendationsDiv = document.getElementById("recommendations");
  recommendationsDiv.innerHTML = `
    <h3>Recommendations</h3>
    <ul>
      <li><strong>Storage Conditions:</strong> Store in a cool, dry place (15-25°C, humidity &lt; 60%).</li>
      <li><strong>Manufacturing Method:</strong> Follow GMP, ensure precise mixing and quality control.</li>
      <li><strong>Packaging:</strong> Airtight blister packs for tablets; sealed bottles for liquids; protect from moisture and light.</li>
      <li><strong>Additional:</strong> Perform stability tests regularly and monitor batch quality.</li>
    </ul>
  `;
});
