// Global variables
let lang = 'en';
const texts = {
  en: {
    activeIngredient: 'Active Ingredient',
    activeIngredientName: 'Active Ingredient Name',
    activeIngredientMg: 'Amount per Unit (mg)',
    referenceStandard: 'Reference Standard',
    dosageForm: 'Dosage Form',
    formulationStrategy: 'Formulation Strategy',
    batchSize: 'Batch Size (units)',
    additivesSelection: 'Additives Quantity Mode',
    auto: 'Automatic',
    manual: 'Manual',
    generate: 'Generate Optimal Formulation',
    results: 'Formulation Results',
    batchSummary: 'Batch Summary',
    recommendations: 'Recommendations',
    pieChart: 'Composition Pie Chart',
    exportPDF: 'Export Results as PDF',
    noResults: 'No results yet.',
    errorInputs: 'Please fill in all required fields correctly.',
    equalAdditivesError: 'Additive quantities cannot be all equal.',
    storageVolume: 'Storage Volume (m³)',
    palletsCount: 'Number of Pallets for Shipment',
    batchCost: 'Batch Cost ($)',
    unitCost: 'Unit Cost ($)',
    optimalPackaging: 'Optimal Packaging',
    optimalManufacturing: 'Optimal Manufacturing Method',
    optimalStorageConditions: 'Optimal Storage Conditions',
    otherRecommendations: 'Other Recommendations',
    coatedTablet: 'Coated Tablet',
    tablet: 'Tablet',
    capsule: 'Capsule',
    liquid: 'Liquid Syrup',
    drySyrup: 'Dry Syrup',
    balanced: 'Balance Quality & Cost',
    quality: 'Quality Only',
    cost: 'Cost Only',
    // ...add more if needed
  },
  ar: {
    activeIngredient: 'المادة الفعالة',
    activeIngredientName: 'اسم المادة الفعالة',
    activeIngredientMg: 'كمية المادة الفعالة (ملغم / وحدة)',
    referenceStandard: 'المرجع الدستوري',
    dosageForm: 'الشكل الصيدلاني',
    formulationStrategy: 'استراتيجية بناء التركيبة',
    batchSize: 'حجم التشغيلة (عدد الوحدات)',
    additivesSelection: 'طريقة تحديد كميات المواد المضافة',
    auto: 'آلي',
    manual: 'يدوي',
    generate: 'إنشاء التركيبة المثالية',
    results: 'نتائج التركيبة',
    batchSummary: 'ملخص التشغيلة',
    recommendations: 'التوصيات',
    pieChart: 'مخطط التوزيع الدائري',
    exportPDF: 'تصدير النتائج إلى PDF',
    noResults: 'لم يتم إنشاء نتائج بعد.',
    errorInputs: 'يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.',
    equalAdditivesError: 'لا يمكن أن تكون كميات المواد المضافة متساوية تمامًا.',
    storageVolume: 'مساحة التخزين (م³)',
    palletsCount: 'عدد البليتات للشحن',
    batchCost: 'تكلفة التشغيلة ($)',
    unitCost: 'تكلفة الوحدة ($)',
    optimalPackaging: 'شكل التغليف الأمثل',
    optimalManufacturing: 'طريقة التصنيع الأمثل',
    optimalStorageConditions: 'شروط التخزين المثلى',
    otherRecommendations: 'توصيات أخرى',
    coatedTablet: 'قرص مغلف',
    tablet: 'قرص',
    capsule: 'كابسول',
    liquid: 'شراب سائل',
    drySyrup: 'شراب جاف',
    balanced: 'توازن الجودة والتكلفة',
    quality: 'الجودة فقط',
    cost: 'التكلفة فقط',
  }
};

// Helper to translate UI texts
function t(key) {
  return texts[lang][key] || key;
}

function switchLang() {
  const select = document.getElementById('langSelect');
  lang = select.value;

  // Reload page with the chosen language file if index-ar.html or index.html
  if(lang === 'ar' && !location.pathname.includes('index-ar.html')){
    location.href = 'index-ar.html';
  }
  if(lang === 'en' && !location.pathname.includes('index.html')){
    location.href = 'index.html';
  }
}

// Function to calculate the formula and display results
function calculateFormula() {
  // Get inputs
  const apiName = document.getElementById('apiName').value.trim();
  const apiMg = parseFloat(document.getElementById('apiMg').value);
  const reference = document.getElementById('reference').value;
  const dosageForm = document.getElementById('dosageForm').value;
  const strategy = document.getElementById('strategy').value;
  const batchSize = parseInt(document.getElementById('batchSize').value);
  const additiveMode = document.getElementById('additiveMode').value;

  // Validate inputs
  if (!apiName || isNaN(apiMg) || apiMg <= 0 || !reference || !dosageForm || !strategy || isNaN(batchSize) || batchSize <= 0) {
    alert(t('errorInputs'));
    return;
  }

  // Define additives based on dosage form (with example typical additives & ranges)
  // Quantities in mg per unit; total weight = 1000mg (example)
  // active ingredient is apiMg, so additives sum to (1000 - apiMg) mg
  // For simplicity: assume unit weight fixed 1000mg (1g) - can be improved for economy

  const unitWeight = 1000; // mg per unit
  const additivesWeight = unitWeight - apiMg;

  if (additivesWeight <= 0) {
    alert('Active ingredient mg exceeds or equals unit weight (1000mg).');
    return;
  }

  // Additives database sample (adjust per dosage form)
  // Each additive: {name, function, min%, max%, costPerMg}
  const additivesDB = {
    tablet: [
      {name: 'Microcrystalline Cellulose', func: 'Filler', min: 10, max: 30, cost: 0.001},
      {name: 'Povidone', func: 'Binder', min: 2, max: 5, cost: 0.003},
      {name: 'Magnesium Stearate', func: 'Lubricant', min: 0.5, max: 2, cost: 0.002},
    ],
    coatedTablet: [
      {name: 'Microcrystalline Cellulose', func: 'Filler', min: 8, max: 25, cost: 0.001},
      {name: 'Povidone', func: 'Binder', min: 1, max: 4, cost: 0.003},
      {name: 'Magnesium Stearate', func: 'Lubricant', min: 0.5, max: 2, cost: 0.002},
      {name: 'Film Coating', func: 'Coating', min: 2, max: 6, cost: 0.005},
    ],
    capsule: [
      {name: 'Lactose', func: 'Filler', min: 20, max: 50, cost: 0.001},
      {name: 'Magnesium Stearate', func: 'Lubricant', min: 0.5, max: 1.5, cost: 0.002},
    ],
    liquid: [
      {name: 'Sucrose', func: 'Sweetener', min: 50, max: 80, cost: 0.001},
      {name: 'Preservative', func: 'Preservative', min: 0.2, max: 0.5, cost: 0.004},
      {name: 'Water', func: 'Solvent', min: 10, max: 40, cost: 0},
    ],
    drySyrup: [
      {name: 'Sucrose', func: 'Sweetener', min: 30, max: 70, cost: 0.001},
      {name: 'Preservative', func: 'Preservative', min: 0.1, max: 0.4, cost: 0.004},
      {name: 'Flavor', func: 'Flavoring', min: 0.1, max: 0.3, cost: 0.006},
      {name: 'Diluents', func: 'Filler', min: 15, max: 40, cost: 0.001},
    ]
  };

  // Select additives set based on dosage form
  const additivesSet = additivesDB[dosageForm];

  // Strategy affects weight allocation - simplify:
  // balanced: average between min and max %
  // quality: max %
  // cost: min %
  let additivesAllocation = additivesSet.map(a => {
    let pct = 0;
    if (strategy === 'balanced') pct = (a.min + a.max) / 2;
    else if (strategy === 'quality') pct = a.max;
    else pct = a.min;
    return {...a, pct};
  });

  // Normalize % to 100% - active ingredient % = apiMg/unitWeight * 100
  const apiPct = (apiMg / unitWeight) * 100;
  const totalAdditivesPct = 100 - apiPct;
  // Sum additivesAllocation pct
  const sumAdditivesPct = additivesAllocation.reduce((sum, a) => sum + a.pct, 0);

  // Scale additives % proportionally to fit totalAdditivesPct
  additivesAllocation = additivesAllocation.map(a => ({
    ...a,
    pct: (a.pct / sumAdditivesPct) * totalAdditivesPct,
    weightMg: ((a.pct / sumAdditivesPct) * totalAdditivesPct / 100) * unitWeight
  }));

  // For manual mode, user could input additive quantities (not implemented here, placeholder)
  // For now ignore manual mode input details

  // Calculate costs per unit
  const apiCostPerMg = 0.01; // example cost $0.01 per mg active ingredient
  const apiCost = apiMg * apiCostPerMg;

  // Calculate additives cost
  const additivesCost = additivesAllocation.reduce((sum, a) => sum + a.weightMg * a.cost, 0);

  const unitCost = apiCost + additivesCost;

  // Batch cost
  const batchCost = unitCost * batchSize;

  // Storage volume: assume 0.001 m3 per unit (example)
  const storageVolume = batchSize * 0.001; // cubic meters

  // Pallets (assume 1000 units per pallet)
  const palletsCount = Math.ceil(batchSize / 1000);

  // Validation: additive weights sum + active ingredient = unitWeight
  const sumWeights = additivesAllocation.reduce((sum, a) => sum + a.weightMg, 0) + apiMg;
  if (Math.abs(sumWeights - unitWeight) > 1) {
    alert('Weights do not sum up correctly!');
    return;
  }

  // Show results section
  document.getElementById('resultsSection').style.display = 'block';
  document.getElementById('batchSummarySection').style.display = 'block';
  document.getElementById('recommendationsSection').style.display = 'block';
  document.getElementById('chartSection').style.display = 'block';
  document.getElementById('exportSection').style.display = 'block';

  // Results Table
  let resultsHTML = `<table>
    <thead><tr>
      <th>${t('activeIngredientName')}</th>
      <th>Function</th>
      <th>Weight (mg)</th>
      <th>Percentage (%)</th>
      <th>Cost ($)</th>
    </tr></thead><tbody>`;

  // Active Ingredient row
  resultsHTML += `<tr>
    <td>${apiName}</td>
    <td>Active Ingredient</td>
    <td>${apiMg.toFixed(2)}</td>
    <td>${apiPct.toFixed(2)}</td>
    <td>${apiCost.toFixed(4)}</td>
  </tr>`;

  // Additives rows
  additivesAllocation.forEach(a => {
    resultsHTML += `<tr>
      <td>${a.name}</td>
      <td>${a.func}</td>
      <td>${a.weightMg.toFixed(2)}</td>
      <td>${a.pct.toFixed(2)}</td>
      <td>${(a.weightMg * a.cost).toFixed(4)}</td>
    </tr>`;
  });

  resultsHTML += '</tbody></table>';
  document.getElementById('resultsTable').innerHTML = resultsHTML;

  // Batch Summary
  let batchSummaryHTML = `
    <p><strong>${t('batchSize')}:</strong> ${batchSize} units</p>
    <p><strong>${t('storageVolume')}:</strong> ${storageVolume.toFixed(2)} m³</p>
    <p><strong>${t('palletsCount')}:</strong> ${palletsCount} pallets</p>
    <p><strong>${t('batchCost')}:</strong> $${batchCost.toFixed(2)}</p>
    <p><strong>${t('unitCost')}:</strong> $${unitCost.toFixed(4)}</p>
  `;
  document.getElementById('batchSummary').innerHTML = batchSummaryHTML;

  // Recommendations - dynamic based on dosage form and strategy
  let recHTML = `<ul>`;

  if (dosageForm === 'tablet' || dosageForm === 'coatedTablet') {
    recHTML += `<li><strong>${t('optimalPackaging')}:</strong> Blister packs preferred.</li>`;
    recHTML += `<li><strong>${t('optimalManufacturing')}:</strong> Direct compression or wet granulation depending on binder content.</li>`;
  } else if (dosageForm === 'capsule') {
    recHTML += `<li><strong>${t('optimalPackaging')}:</strong> Bottles or strips.</li>`;
    recHTML += `<li><strong>${t('optimalManufacturing')}:</strong> Powder filling into capsules.</li>`;
  } else if (dosageForm === 'liquid' || dosageForm === 'drySyrup') {
    recHTML += `<li><strong>${t('optimalPackaging')}:</strong> Bottles with child-proof caps.</li>`;
    recHTML += `<li><strong>${t('optimalManufacturing')}:</strong> Solution or dry-mix preparation techniques.</li>`;
  }

  recHTML += `<li><strong>${t('optimalStorageConditions')}:</strong> Store in cool, dry place, away from light.</li>`;
  recHTML += `<li><strong>${t('otherRecommendations')}:</strong> Ensure compatibility of active and additives based on reference standards.</li>`;

  recHTML += `</ul>`;

  document.getElementById('recommendations').innerHTML = recHTML;

  // Pie Chart - composition
  const ctx = document.getElementById('compositionChart').getContext('2d');
  if(window.pieChart) window.pieChart.destroy();
  window.pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [apiName].concat(additivesAllocation.map(a => a.name)),
      datasets: [{
        data: [apiMg].concat(additivesAllocation.map(a => a.weightMg)),
        backgroundColor: [
          '#007bff',
          '#6c757d',
          '#28a745',
          '#ffc107',
          '#dc3545',
          '#17a2b8',
          '#6610f2'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

}
