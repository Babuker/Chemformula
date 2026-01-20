/* ================================
   ChemFormula® Core Logic
   Global – Logical – GitHub Ready
================================ */

const excipientLibrary = {
  tablet: [
    { name: "Microcrystalline Cellulose", func: "Diluent", min: 20, max: 40 },
    { name: "Lactose Monohydrate", func: "Diluent", min: 10, max: 30 },
    { name: "Povidone K30", func: "Binder", min: 2, max: 6 },
    { name: "Croscarmellose Sodium", func: "Disintegrant", min: 2, max: 5 },
    { name: "Magnesium Stearate", func: "Lubricant", min: 0.5, max: 1.5 }
  ],
  capsule: [
    { name: "Lactose Monohydrate", func: "Diluent", min: 30, max: 60 },
    { name: "Microcrystalline Cellulose", func: "Diluent", min: 10, max: 30 },
    { name: "Magnesium Stearate", func: "Lubricant", min: 0.5, max: 1.0 }
  ],
  liquid: [
    { name: "Purified Water", func: "Solvent", min: 60, max: 80 },
    { name: "Glycerin", func: "Co-solvent", min: 5, max: 15 },
    { name: "Sodium Benzoate", func: "Preservative", min: 0.1, max: 0.2 }
  ],
  drySyrup: [
    { name: "Sucrose", func: "Diluent", min: 60, max: 80 },
    { name: "Xanthan Gum", func: "Suspending Agent", min: 0.2, max: 0.5 }
  ]
};

/* ================================
   Main Calculation Engine
================================ */

function calculateFormula() {
  const apiName = document.getElementById("apiName").value;
  const apiMg = parseFloat(document.getElementById("apiMg").value);
  const dosageForm = document.getElementById("dosageForm").value;
  const batchSize = parseInt(document.getElementById("batchSize").value);

  if (!apiName || !apiMg || !batchSize) {
    alert("Please complete all required fields.");
    return;
  }

  const unitWeightMg = apiMg * 5; 
  const apiPercent = (apiMg / unitWeightMg) * 100;
  let remainingPercent = 100 - apiPercent;

  const excipients = excipientLibrary[dosageForm];
  let results = [];
  let usedPercent = 0;

  excipients.forEach((exc, index) => {
    let percent;
    if (index === excipients.length - 1) {
      percent = remainingPercent - usedPercent;
    } else {
      percent =
        Math.min(
          exc.max,
          Math.max(exc.min, remainingPercent / excipients.length)
        );
      usedPercent += percent;
    }

    results.push({
      name: exc.name,
      func: exc.func,
      percent: percent.toFixed(2),
      mg: ((percent / 100) * unitWeightMg).toFixed(2)
    });
  });

  renderResults(apiName, apiPercent, apiMg, results, unitWeightMg, batchSize, dosageForm);
}

/* ================================
   Render Output
================================ */

function renderResults(apiName, apiPercent, apiMg, excipients, unitWeightMg, batchSize, dosageForm) {
  let table = `
  <table>
    <tr>
      <th>Material</th>
      <th>Function</th>
      <th>% w/w</th>
      <th>mg / unit</th>
    </tr>
    <tr>
      <td>${apiName}</td>
      <td>Active Ingredient</td>
      <td>${apiPercent.toFixed(2)}</td>
      <td>${apiMg}</td>
    </tr>
  `;

  excipients.forEach(e => {
    table += `
      <tr>
        <td>${e.name}</td>
        <td>${e.func}</td>
        <td>${e.percent}</td>
        <td>${e.mg}</td>
      </tr>`;
  });

  table += "</table>";
  document.getElementById("results").innerHTML = table;

  renderRecommendations(dosageForm);
}

/* ================================
   Dynamic Recommendations
================================ */

function renderRecommendations(form) {
  let rec = "";

  if (form === "tablet") {
    rec = `
    <ul>
      <li>Manufacturing: Wet granulation recommended</li>
      <li>Packaging: Blister (Alu-PVC)</li>
      <li>Storage: 25°C / ≤60% RH</li>
    </ul>`;
  }

  if (form === "capsule") {
    rec = `
    <ul>
      <li>Manufacturing: Direct blending</li>
      <li>Packaging: HDPE Bottle</li>
      <li>Storage: 25°C / dry place</li>
    </ul>`;
  }

  if (form === "liquid") {
    rec = `
    <ul>
      <li>Manufacturing: Solution with controlled mixing</li>
      <li>Packaging: Amber bottle</li>
      <li>Storage: 15–25°C</li>
    </ul>`;
  }

  document.getElementById("recommendations").innerHTML = rec;
}
