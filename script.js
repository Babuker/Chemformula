// ترجمة نصوص بسيطة بين اللغتين
const translations = {
  en: {
    activeIngredient: "Active Ingredient Name",
    amountMg: "Amount (mg)",
    referenceStandard: "Reference Standard",
    dosageForm: "Dosage Form",
    formulationGoal: "Formulation Goal",
    releaseMechanism: "Release Mechanism",
    excipientsMode: "Excipients Selection Mode",
    manualExcipientsInput: "Manual Excipients Input",
    batchSize: "Batch Size (units)",
    calculateBtn: "Calculate Formulation",
    step1: "Step 1: Active Ingredient & Amount",
    step2: "Step 2: Reference Standard",
    step3: "Step 3: Dosage Form",
    step4: "Step 4: Formulation Goal",
    step5: "Step 5: Release Mechanism",
    step6: "Step 6: Excipients Selection Mode",
    step7: "Step 7: Batch Size",
    langLabel: "Language:",
    recommendationsTitle: "Recommendations",
    storage: "Optimal Storage Conditions",
    manufacturing: "Optimal Manufacturing Method",
    packaging: "Optimal Packaging Form",
    other: "Other Recommendations",
    batchInfo: "Batch Information",
  },
  ar: {
    activeIngredient: "اسم المادة الفعالة",
    amountMg: "الكمية (ملجم)",
    referenceStandard: "المرجع",
    dosageForm: "شكل الدواء",
    formulationGoal: "هدف التركيبة",
    releaseMechanism: "طريقة تحرير المادة الفعالة",
    excipientsMode: "اختيار المواد المضافة",
    manualExcipientsInput: "إدخال المواد المضافة يدوياً",
    batchSize: "حجم التشغيلة (عدد الوحدات)",
    calculateBtn: "احسب التركيبة",
    step1: "الخطوة 1: المادة الفعالة وكمية التركيز",
    step2: "الخطوة 2: المرجع",
    step3: "الخطوة 3: شكل الدواء",
    step4: "الخطوة 4: هدف التركيبة",
    step5: "الخطوة 5: طريقة تحرير المادة الفعالة",
    step6: "الخطوة 6: اختيار المواد المضافة",
    step7: "الخطوة 7: حجم التشغيلة",
    langLabel: "اللغة:",
    recommendationsTitle: "التوصيات",
    storage: "شروط التخزين المثلى",
    manufacturing: "طريقة التصنيع المثلى",
    packaging: "شكل التغليف المثالي",
    other: "توصيات أخرى",
    batchInfo: "معلومات التشغيلة",
  }
};

let currentLang = 'en';

// عناصر الواجهة
const langSelect = document.getElementById('langSelect');
const apiNameInput = document.getElementById('apiName');
const apiAmountInput = document.getElementById('apiAmount');
const referenceSelect = document.getElementById('referenceStandard');
const dosageFormSelect = document.getElementById('dosageForm');
const formulationGoalSelect = document.getElementById('formulationGoal');
const releaseMechanismSelect = document.getElementById('releaseMechanism');
const excipientsModeSelect = document.getElementById('excipientsMode');
const manualExcipientsContainer = document.getElementById('manualExcipientsContainer');
const manualExcipientsInput = document.getElementById('manualExcipients');
const batchSizeInput = document.getElementById('batchSize');
const calculateBtn = document.getElementById('calculateBtn');

const resultsSection = document.getElementById('results');
const batchInfoDiv = document.getElementById('batchInfo');
const resultTableBody = document.querySelector('#resultTable tbody');
const recommendationsDiv = document.getElementById('recommendations');
const pieChartCanvas = document.getElementById('pieChart');
const barcodeSvg = document.getElementById('barcode');

let pieChart;

// تغيير اللغة وتحديث النصوص
function updateLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.body.dir = (lang === 'ar') ? 'rtl' : 'ltr';

  document.querySelector('header h1').textContent = (lang === 'ar') ? "ChemFormula® - أداة تحسين التركيبات الكيميائية" : "ChemFormula® - Chemical Formulation Optimizer";

  // تحديث نصوص الفقرات والحقول
  document.querySelector('#inputs h2:nth-of-type(1)').textContent = translations[lang].step1;
  apiNameInput.placeholder = translations[lang].activeIngredient;
  apiAmountInput.placeholder = translations[lang].amountMg;

  document.querySelector('#inputs h2:nth-of-type(2)').textContent = translations[lang].step2;
  document.querySelector('#inputs h2:nth-of-type(3)').textContent = translations[lang].step3;
  document.querySelector('#inputs h2:nth-of-type(4)').textContent = translations[lang].step4;
  document.querySelector('#inputs h2:nth-of-type(5)').textContent = translations[lang].step5;
  document.querySelector('#inputs h2:nth-of-type(6)').textContent = translations[lang].step6;
  document.querySelector('#inputs h2:nth-of-type(7)').textContent = translations[lang].step7;

  document.querySelector('#manualExcipientsContainer h3').textContent = translations[lang].manualExcipientsInput;
  calculateBtn.textContent = translations[lang].calculateBtn;
  document.querySelector('#langSwitch label').textContent = translations[lang].langLabel;

  // تحديث الجدول
  document.querySelector('#resultTable thead tr').innerHTML =
    `<th>${(lang==='ar') ? 'الاسم' : 'Name'}</th>
     <th>${(lang==='ar') ? 'الوظيفة' : 'Function'}</th>
     <th>${(lang==='ar') ? 'الكمية (ملجم)' : 'Quantity (mg)'}</th>
     <th>${(lang==='ar') ? 'النسبة (%)' : 'Percentage (%)'}</th>
     <th>${(lang==='ar') ? 'التكلفة لكل كيلو ($)' : 'Cost per Kg ($)'}</th>`;
  
  // تحديث نتائج اذا موجودة
  if(resultsSection.style.display !== 'none') {
    calculateFormulation();
  }
}

// اظهار او اخفاء ادخال المواد المضافة يدوياً
excipientsModeSelect.addEventListener('change', () => {
  manualExcipientsContainer.style.display = excipientsModeSelect.value === 'manual' ? 'block' : 'none';
});

// زر الحساب
calculateBtn.addEventListener('click', calculateFormulation);

// دالة التحقق من توافق المدخلات
function validateInputs(){
  if(!apiNameInput.value.trim()) {
    alert(currentLang === 'ar' ? "يرجى إدخال اسم المادة الفعالة" : "Please enter active ingredient name");
    return false;
  }
  if(apiAmountInput.value <= 0) {
    alert(currentLang === 'ar' ? "يرجى إدخال كمية صحيحة للمادة الفعالة" : "Please enter valid amount");
    return false;
  }
  if(batchSizeInput.value <= 0) {
    alert(currentLang === 'ar' ? "يرجى إدخال حجم التشغيلة الصحيح" : "Please enter valid batch size");
    return false;
  }
  if(excipientsModeSelect.value === 'manual') {
    if(!manualExcipientsInput.value.trim()) {
      alert(currentLang === 'ar' ? "يرجى إدخال المواد المضافة يدوياً" : "Please enter manual excipients");
      return false;
    }
  }
  return true;
}

// توليد صيغة المواد المضافة تلقائياً حسب شكل الدواء والهدف
function generateAutoExcipients(dosageForm, formulationGoal) {
  // عين المواد الافتراضية مع النسب (مثال مبسط)
  // المواد: الاسم, الوظيفة, التكلفة لكل كيلو, النسبة الدنيا %, النسبة العليا %
  const excipientsDB = {
    "Tablet": [
      {name:"Microcrystalline Cellulose", role:"Filler", cost:5, min:10, max:20},
      {name:"Lactose", role:"Filler", cost:4, min:5, max:15},
      {name:"Magnesium Stearate", role:"Lubricant", cost:8, min:0.5, max:2},
      {name:"Povidone", role:"Binder", cost:7, min:2, max:6},
      {name:"Croscarmellose Sodium", role:"Disintegrant", cost:6, min:2, max:5},
    ],
    "Coated Tablet": [
      {name:"Microcrystalline Cellulose", role:"Filler", cost:5, min:10, max:18},
      {name:"Lactose", role:"Filler", cost:4, min:5, max:12},
      {name:"Magnesium Stearate", role:"Lubricant", cost:8, min:0.5, max:2},
      {name:"Povidone", role:"Binder", cost:7, min:2, max:5},
      {name:"Croscarmellose Sodium", role:"Disintegrant", cost:6, min:2, max:5},
      {name:"Film Coating", role:"Coating", cost:12, min:2, max:4}
    ],
    "Liquid Syrup": [
      {name:"Sucrose", role:"Sweetener", cost:3, min:50, max:70},
      {name:"Citric Acid", role:"Buffer", cost:4, min:0.1, max:0.5},
      {name:"Preservative", role:"Preservative", cost:10, min:0.2, max:0.5}
    ],
    "Dry Syrup": [
      {name:"Mannitol", role:"Sweetener", cost:4, min:30, max:50},
      {name:"Citric Acid", role:"Buffer", cost:4, min:0.1, max:0.5},
      {name:"Preservative", role:"Preservative", cost:10, min:0.2, max:0.5}
    ],
    "Capsule": [
      {name:"Microcrystalline Cellulose", role:"Filler", cost:5, min:15, max:25},
      {name:"Magnesium Stearate", role:"Lubricant", cost:8, min:0.5, max:2},
      {name:"Gelatin", role:"Capsule Shell", cost:15, min:30, max:40}
    ],
  };

  let excips = excipientsDB[dosageForm] || [];
  // تعديل حسب هدف التركيبة (مثال: لو فقط جودة، نزيد النسب العليا)
  if(formulationGoal === "Quality Only") {
    excips = excips.map(e => {
      return {...e, max: e.max + 5};
    });
  } else if(formulationGoal === "Cost Only") {
    excips = excips.map(e => {
      return {...e, max: Math.min(e.max - 2, e.max)};
    });
  }

  return excips;
}

// حساب التركيبة المثالية
function calculateFormulation() {
  if(!validateInputs()) return;

  // اجمع بيانات المستخدم
  const apiName = apiNameInput.value.trim();
  const apiAmount = parseFloat(apiAmountInput.value);
  const referenceStandard = referenceSelect.value;
  const dosageForm = dosageFormSelect.value;
  const formulationGoal = formulationGoalSelect.value;
  const releaseMechanism = releaseMechanismSelect.value;
  const excipientsMode = excipientsModeSelect.value;
  const batchSize = parseInt(batchSizeInput.value);

  // اجلب المواد المضافة يدويا أو تلقائيا
  let excipients = [];
  if(excipientsMode === 'manual') {
    // تحليل المدخلات يدوياً
    const lines = manualExcipientsInput.value.trim().split('\n');
    for(const line of lines) {
      const parts = line.split(',');
      if(parts.length !== 5) {
        alert(currentLang==='ar' ? "تنسيق المواد المضافة غير صحيح" : "Manual excipients format incorrect");
        return;
      }
      const [name, role, costStr, minStr, maxStr] = parts.map(p=>p.trim());
      const cost = parseFloat(costStr);
      const min = parseFloat(minStr);
      const max = parseFloat(maxStr);
      if(isNaN(cost) || isNaN(min) || isNaN(max)) {
        alert(currentLang==='ar' ? "البيانات الرقمية في المواد المضافة غير صحيحة" : "Manual excipients numeric data invalid");
        return;
      }
      excipients.push({name, role, cost, min, max});
    }
  } else {
    excipients = generateAutoExcipients(dosageForm, formulationGoal);
  }

  // تحقق من ان الكميات للنسب ممكنة و غير متساوية
  // اذا وجدت نسب متساوية لكل المواد (نفس min = max = متساوية), اعطي تحذير
  let allEqualPercent = excipients.every(e => e.min === e.max);
  if(allEqualPercent && excipients.length > 1) {
    alert(currentLang==='ar' ? "لا يمكن أن تكون نسب المواد المضافة متساوية لكل المواد" : "Excipients percentages cannot all be equal");
    return;
  }

  // احسب الوزن الكلي للوحدة: الوزن = المادة الفعالة + متوسط المواد المضافة
  const avgExcipientPercentSum = excipients.reduce((sum,e) => sum + (e.min + e.max)/2, 0);
  const totalWeightPerUnit = apiAmount / (1 - avgExcipientPercentSum/100);

  // احسب كميات المواد المضافة لكل وحدة بناء على المتوسط
  const excipientsQuantities = excipients.map(e => {
    const percent = (e.min + e.max)/2;
    const quantityMg = (percent / 100) * totalWeightPerUnit;
    return {...e, percent, quantityMg};
  });

  // احسب تكلفة الوحدة
  const costApiPerKg = 100; // مثال: تكلفة المادة الفعالة $100/kg - يمكن تعديل لاحقاً
  const apiWeightKg = apiAmount / 1_000_000;
  const apiCostPerUnit = apiWeightKg * costApiPerKg;

  const excipientsCostPerUnit = excipientsQuantities.reduce((sum,e) => {
    const wKg = e.quantityMg / 1_000_000;
    return sum + wKg * e.cost;
  },0);

  const costPerUnit = apiCostPerUnit + excipientsCostPerUnit;
  const batchWeightKg = (totalWeightPerUnit * batchSize) / 1_000_000;
  const batchCost = costPerUnit * batchSize;

  // مساحة التخزين (م3) - افتراض حجم الوحدة = الوزن بالجرام * معامل حجم (مثلاً 1 ملجم = 0.001 غرام، وحجم 1غرام= 1 سم3)
  // لذلك الحجم لكل وحدة = totalWeightPerUnit (ملجم) * 0.001 (جم/ملجم) * 1 سم3/جم = الحجم سم3 = 1سم3=1e-6 م3
  // نفرض كثافة 1غ/سم3 (ماء)
  const volumePerUnitM3 = totalWeightPerUnit * 0.001 * 1e-6; // بالمتر المكعب
  const totalVolumeM3 = volumePerUnitM3 * batchSize;

  // عدد البليتات (كل بليت يحوي 10000 وحدة افتراضياً)
  const unitsPerPallet = 10000;
  const palletsCount = Math.ceil(batchSize / unitsPerPallet);

  // بناء جدول النتائج
  resultTableBody.innerHTML = '';
  // اضافة المادة الفعالة أولاً
  resultTableBody.insertAdjacentHTML('beforeend', `
    <tr>
      <td>${apiName}</td>
      <td>${currentLang==='ar' ? 'مادة فعالة' : 'Active Ingredient'}</td>
      <td>${apiAmount.toFixed(2)}</td>
      <td>${((apiAmount/totalWeightPerUnit)*100).toFixed(2)}</td>
      <td>${costApiPerKg.toFixed(2)}</td>
    </tr>
  `);

  excipientsQuantities.forEach(e => {
    resultTableBody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${e.name}</td>
        <td>${e.role}</td>
        <td>${e.quantityMg.toFixed(2)}</td>
        <td>${e.percent.toFixed(2)}</td>
        <td>${e.cost.toFixed(2)}</td>
      </tr>
    `);
  });

  // عرض معلومات التشغيلة
  batchInfoDiv.textContent = `${translations[currentLang].batchInfo}: ${batchSize} ${currentLang==='ar' ? 'وحدة' : 'units'}, ${totalWeightPerUnit.toFixed(2)} mg/unit, ${batchCost.toFixed(2)} $ total cost, ${totalVolumeM3.toExponential(3)} m³ volume, ${palletsCount} ${currentLang==='ar' ? 'بليت' : 'pallet(s)'}`;

  // التوصيات بناء على الدواء
  let recs = `<h3>${translations[currentLang].recommendationsTitle}</h3>`;
  recs += `<ul>`;
  recs += `<li><strong>${translations[currentLang].storage}:</strong> ${currentLang==='ar' ? 'احفظ في مكان بارد وجاف بعيداً عن الرطوبة والضوء المباشر.' : 'Store in cool dry place away from moisture and direct light.'}</li>`;
  recs += `<li><strong>${translations[currentLang].manufacturing}:</strong> ${dosageForm==='Tablet' || dosageForm==='Coated Tablet' ? (currentLang==='ar' ? 'الخلط الجاف أو الحبيبات الرطبة مع الضغط المباشر.' : 'Wet granulation or direct compression.') : (currentLang==='ar' ? 'التحضير السائل مع الخلط المتجانس.' : 'Liquid preparation with uniform mixing.')}</li>`;
  recs += `<li><strong>${translations[currentLang].packaging}:</strong> ${dosageForm==='Tablet' || dosageForm==='Coated Tablet' ? (currentLang==='ar' ? 'التغليف في بليت أو شرائط.' : 'Blister or strip packaging.') : (currentLang==='ar' ? 'تعبئة في زجاجات محكمة الإغلاق.' : 'Bottle packaging.')}</li>`;
  recs += `<li><strong>${translations[currentLang].other}:</strong> ${currentLang==='ar' ? 'تحقق من توافق المواد المضافة مع المادة الفعالة كيميائياً وفيزيائياً.' : 'Ensure excipients compatibility with active ingredient chemically and physically.'}</li>`;
  recs += `</ul>`;
  recommendationsDiv.innerHTML = recs;

  // رسم مخطط دائري
  const chartLabels = [apiName, ...excipientsQuantities.map(e => e.name)];
  const chartData = [apiAmount, ...excipientsQuantities.map(e => e.quantityMg)];
  const chartColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8', '#fd7e14'];

  if(pieChart) pieChart.destroy();
  pieChart = new Chart(pieChartCanvas, {
    type: 'pie',
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        backgroundColor: chartColors,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });

  // توليد باركود للتشغيلة (batchSize + timestamp)
  JsBarcode(barcodeSvg, `${batchSize}-${Date.now()}`, {
    format: "CODE128",
    displayValue: true,
    fontSize: 14,
    height: 50,
  });

  // إظهار قسم النتائج
  resultsSection.style.display = 'block';
}

// تغيير اللغة من السلكت
langSelect.addEventListener('change', (e) => {
  updateLanguage(e.target.value);
});

// تحميل الصفحة - ضبط اللغة افتراضياً
document.addEventListener('DOMContentLoaded', () => {
  updateLanguage(currentLang);
});
