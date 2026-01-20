// ======== Data for auto excipients (example) ========
const excipientsList = [
  {name: "Lactose", role: "Filler", cost: 0.5, minPercent: 10, maxPercent: 40},
  {name: "Starch", role: "Binder", cost: 0.7, minPercent: 5, maxPercent: 20},
  {name: "Magnesium Stearate", role: "Lubricant", cost: 1.2, minPercent: 0.5, maxPercent: 2},
  {name: "Microcrystalline Cellulose", role: "Filler", cost: 0.6, minPercent: 10, maxPercent: 30},
  {name: "Silicon Dioxide", role: "Glidant", cost: 1.0, minPercent: 0.5, maxPercent: 1.5},
];

// ======== Translations ========
const translations = {
  en: {
    title: "ChemFormula® - Global Chemical Formulation Tool",
    labelApiName: "Active Ingredient Name",
    labelApiAmount: "Active Ingredient Amount (mg)",
    labelReference: "Reference Standard",
    labelDosageForm: "Dosage Form",
    labelGoal: "Formulation Goal",
    labelRelease: "Release Mechanism",
    labelExcipientsMode: "Excipients Selection Mode",
    labelManualExcipients: "Enter excipients manually (one per line):",
    labelBatchSize: "Batch Size (units)",
    calculateBtn: "Calculate Formulation",
    resultsTitle: "Results",
    thName: "Name",
    thRole: "Role",
    thQuantity: "Quantity (mg)",
    thPercent: "Percentage (%)",
    thCost: "Cost per Kg ($)",
    recommendationsTitle: "Recommendations",
    recStorage: "Optimal storage conditions: Store in a cool, dry place away from direct sunlight.",
    recManufacture: "Recommended manufacturing method: Use direct compression for tablets; wet granulation for capsules.",
    recPackaging: "Recommended packaging: Blister packs for tablets, bottles for liquids.",
    recOther: "Ensure excipients compatibility with active ingredient chemically and physically.",
    errorEqualExcipients: "Error: Excipients cannot have equal quantities.",
    errorInput: "Please fill all required fields correctly.",
    batchInfoText: (size, cost, storageM3, pallets) =>
      `Batch Size: ${size} units | Estimated Cost: $${cost.toFixed(2)} | Storage Volume: ${storageM3.toFixed(2)} m³ | Pallets for shipping: ${pallets}`,
  },
  ar: {
    title: "كيم فورمولا® - أداة تحسين التركيبة الكيميائية",
    labelApiName: "اسم المادة الفعالة",
    labelApiAmount: "كمية المادة الفعالة (ملج)",
    labelReference: "المرجع",
    labelDosageForm: "شكل الدواء",
    labelGoal: "هدف التركيبة",
    labelRelease: "طريقة تحرر المادة الفعالة",
    labelExcipientsMode: "اختيار المواد المضافة",
    labelManualExcipients: "إدخال المواد المضافة يدويًا (كل مادة في سطر منفصل):",
    labelBatchSize: "حجم التشغيلة (وحدة)",
    calculateBtn: "احسب التركيبة",
    resultsTitle: "النتائج",
    thName: "الاسم",
    thRole: "الوظيفة",
    thQuantity: "الكمية (ملج)",
    thPercent: "النسبة المئوية (%)",
    thCost: "التكلفة لكل كغ ($)",
    recommendationsTitle: "التوصيات",
    recStorage: "شروط التخزين المثلى: يحفظ في مكان بارد وجاف بعيد عن أشعة الشمس المباشرة.",
    recManufacture: "طريقة التصنيع الموصى بها: استخدام الضغط المباشر للأقراص؛ الترطيب والتجفيف للكبسولات.",
    recPackaging: "التعبئة الموصى بها: عبوات البليستر للأقراص، والعبوات الزجاجية أو البلاستيكية للسوائل.",
    recOther: "تحقق من توافق المواد المضافة مع المادة الفعالة كيميائيًا وفيزيائيًا.",
    errorEqualExcipients: "خطأ: لا يمكن أن تكون كميات المواد المضافة متساوية.",
    errorInput: "يرجى ملء جميع الحقول المطلوبة بشكل صحيح.",
    batchInfoText: (size, cost, storageM3, pallets) =>
      `حجم التشغيلة: ${size} وحدة | التكلفة المقدرة: $${cost.toFixed(2)} | حجم التخزين: ${storageM3.toFixed(2)} م³ | عدد البليتات المناسبة للشحن: ${pallets}`,
  }
};

let currentLang = "en";

// ========== Elements ==========
const langSelect = document.getElementById("langSelect");
const apiNameInput = document.getElementById("apiName");
const apiAmountInput = document.getElementById("apiAmount");
const referenceStandardSelect = document.getElementById("referenceStandard");
const dosageFormSelect = document.getElementById("dosageForm");
const formulationGoalSelect = document.getElementById("formulationGoal");
const releaseMechanismSelect = document.getElementById("releaseMechanism");
const excipientsModeSelect = document.getElementById("excipientsMode");
const manualExcipientsContainer = document.getElementById("manualExcipientsContainer");
const manualExcipientsTextarea = document.getElementById("manualExcipients");
const batchSizeInput = document.getElementById("batchSize");
const calculateBtn = document.getElementById("calculateBtn");
const resultsSection = document.getElementById("results");
const batchInfoDiv = document.getElementById("batchInfo");
const resultTableBody = document.querySelector("#resultTable tbody");
const recommendationsDiv = document.getElementById("recommendations");
const pieChartCanvas = document.getElementById("pieChart");
const barcodeSvg = document.getElementById("barcode");

let pieChart = null;

// ======= Update UI texts according to language =======
function updateTexts() {
  const t = translations[currentLang];
  document.title = t.title;
  document.getElementById("title").textContent = t.title;
  document.getElementById("labelApiName").textContent = t.labelApiName;
  document.getElementById("labelApiAmount").textContent = t.labelApiAmount;
  document.getElementById("labelReference").textContent = t.labelReference;
  document.getElementById("labelDosageForm").textContent = t.labelDosageForm;
  document.getElementById("labelGoal").textContent = t.labelGoal;
  document.getElementById("labelRelease").textContent = t.labelRelease;
  document.getElementById("labelExcipientsMode").textContent = t.labelExcipientsMode;
  document.getElementById("labelManualExcipients").textContent = t.labelManualExcipients;
  document.getElementById("labelBatchSize").textContent = t.labelBatchSize;
  calculateBtn.textContent = t.calculateBtn;
  document.getElementById("resultsTitle").textContent = t.resultsTitle;
  document.getElementById("thName").textContent = t.thName;
  document.getElementById("thRole").textContent = t.thRole;
  document.getElementById("thQuantity").textContent = t.thQuantity;
  document.getElementById("thPercent").textContent = t.thPercent;
  document.getElementById("thCost").textContent = t.thCost;
}

// ========== Show/hide manual excipients textarea ==========
excipientsModeSelect.addEventListener("change", () => {
  if (excipientsModeSelect.value === "manual") {
    manualExcipientsContainer.style.display = "block";
  } else {
    manualExcipientsContainer.style.display = "none";
  }
});

// ========== Language change ==========
langSelect.addEventListener("change", () => {
  currentLang = langSelect.value;
  if (currentLang === "ar") {
    document.body.setAttribute("dir", "rtl");
  } else {
    document.body.setAttribute("dir", "ltr");
  }
  updateTexts();
});

// ========== Initial setup ==========
window.addEventListener("DOMContentLoaded", () => {
  updateTexts();
  if (currentLang === "ar") document.body.setAttribute("dir", "rtl");
  else document.body.setAttribute("dir", "ltr");
});

// ========== Calculate formulation ==========
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();

  // Validate inputs
  const apiName = apiNameInput.value.trim();
  const apiAmount = parseFloat(apiAmountInput.value);
  const batchSize = parseInt(batchSizeInput.value);
  const excipientsMode = excipientsModeSelect.value;

  if (!apiName || isNaN(apiAmount) || apiAmount <= 0 || isNaN(batchSize) || batchSize <= 0) {
    alert(translations[currentLang].errorInput);
    return;
  }

  let excipientsUsed = [];

  if (excipientsMode === "manual") {
    const lines = manualExcipientsTextarea.value.trim().split("\n");
    for (let line of lines) {
      if (!line) continue;
      const parts = line.split(",");
      if (parts.length !== 5) {
        alert(translations[currentLang].errorInput);
        return;
      }
      const [name, role, costStr, minStr, maxStr] = parts.map(p => p.trim());
      const cost = parseFloat(costStr);
      const minPercent = parseFloat(minStr);
      const maxPercent = parseFloat(maxStr);
      if (!name || !role || isNaN(cost) || isNaN(minPercent) || isNaN(maxPercent)) {
        alert(translations[currentLang].errorInput);
        return;
      }
      excipientsUsed.push({name, role, cost, minPercent, maxPercent});
    }
  } else {
    excipientsUsed = excipientsList;
  }

  // Assign excipient percentages economically but respecting min/max
  // Simple example: assign mid-value between min and max for each excipient
  let totalPercentExcipients = 0;
  let excipientPercents = [];
  for (const exc of excipientsUsed) {
    const perc = (exc.minPercent + exc.maxPercent) / 2;
    excipientPercents.push(perc);
    totalPercentExcipients += perc;
  }

  // Normalize to 100% excluding API
  const totalPercent = totalPercentExcipients + 100;
  const scale = 100 / totalPercentExcipients;

  // If any excipients have same percent, alert error
  const percSet = new Set(excipientPercents);
  if (percSet.size !== excipientPercents.length) {
    alert(translations[currentLang].errorEqualExcipients);
    return;
  }

  // Calculate weights and costs per batch
  // API weight per unit is apiAmount (mg)
  // Total unit weight: apiAmount + excipients weights scaled to 100% (mg)
  // For batchSize, multiply by batchSize

  // Calculate excipients weights per unit (mg)
  let excipientsWeights = [];
  for (let i = 0; i < excipientsUsed.length; i++) {
    let w = (excipientPercents[i] * apiAmount) / 100;
    excipientsWeights.push(w);
  }

  // Total unit weight (API + excipients)
  const unitWeightMg = apiAmount + excipientsWeights.reduce((a,b)=>a+b,0);

  // Total batch weight in mg and convert to kg
  const batchWeightKg = (unitWeightMg * batchSize) / 1e6;

  // Calculate costs
  let totalCost = 0;
  // API cost assumed (example) 10$/kg
  const apiCostPerKg = 10;
  totalCost += (apiAmount/1e6) * batchSize * apiCostPerKg;

  let tableRows = "";
  // API row
  tableRows += `<tr><td>${apiName}</td><td>Active Ingredient</td><td>${apiAmount.toFixed(2)}</td><td>100%</td><td>$${apiCostPerKg.toFixed(2)}</td></tr>`;

  for (let i = 0; i < excipientsUsed.length; i++) {
    const exc = excipientsUsed[i];
    const weight = excipientsWeights[i];
    const cost = (weight / 1e6) * batchSize * exc.cost;
    totalCost += cost;
    const percent = excipientPercents[i].toFixed(2);
    tableRows += `<tr><td>${exc.name}</td><td>${exc.role}</td><td>${weight.toFixed(2)}</td><td>${percent}</td><td>$${exc.cost.toFixed(2)}</td></tr>`;
  }

  // Calculate storage volume (example: unit volume 0.0001 m3)
  const unitVolumeM3 = 0.0001;
  const storageVolumeM3 = batchSize * unitVolumeM3;

  // Pallets (example: each pallet holds 1000 units)
  const unitsPerPallet = 1000;
  const palletsNeeded = Math.ceil(batchSize / unitsPerPallet);

  // Show results
  batchInfoDiv.textContent = translations[currentLang].batchInfoText(batchSize, totalCost, storageVolumeM3, palletsNeeded);
  resultTableBody.innerHTML = tableRows;
  resultsSection.style.display = "block";

  // Show recommendations
  recommendationsDiv.innerHTML = `
    <h3>${translations[currentLang].recommendationsTitle}</h3>
    <ul>
      <li>${translations[currentLang].recStorage}</li>
      <li>${translations[currentLang].recManufacture}</li>
      <li>${translations[currentLang].recPackaging}</li>
      <li>${translations[currentLang].recOther}</li>
    </ul>
  `;

  // Draw pie chart
  const pieData = {
    labels: [apiName, ...excipientsUsed.map(e=>e.name)],
    datasets: [{
      data: [100, ...excipientPercents],
      backgroundColor: ['#007bff','#6c757d','#28a745','#dc3545','#ffc107','#17a2b8','#6610f2','#e83e8c','#fd7e14']
    }]
  };

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieChartCanvas, {
    type: 'pie',
    data: pieData,
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  // Generate barcode with batch info string
  const barcodeText = `Batch:${batchSize}-API:${apiName}-Qty:${apiAmount}mg`;
  JsBarcode(barcodeSvg, barcodeText, {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: true,
  });

});
