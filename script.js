let chart;

const excipientLibrary = {
  tablet: [
    { name: "MCC", function: "Diluent", min: 20, cost: 0.002 },
    { name: "PVP", function: "Binder", min: 3, cost: 0.004 },
    { name: "Croscarmellose", function: "Disintegrant", min: 2, cost: 0.005 },
    { name: "Magnesium Stearate", function: "Lubricant", min: 0.5, cost: 0.006 }
  ],
  capsule: [
    { name: "Lactose", function: "Filler", min: 30, cost: 0.002 },
    { name: "Talc", function: "Glidant", min: 1, cost: 0.003 }
  ],
  liquid: [
    { name: "Purified Water", function: "Solvent", min: 70, cost: 0.0005 },
    { name: "Sodium Benzoate", function: "Preservative", min: 0.1, cost: 0.01 }
  ],
  dry_syrup: [
    { name: "Sucrose", function: "Diluent", min: 60, cost: 0.001 },
    { name: "Flavor", function: "Flavoring", min: 0.2, cost: 0.02 }
  ]
};

function runFormulation() {

  const apiDose = Number(apiDoseInput().value);
  const apiCost = Number(apiCostInput().value);
  const batchSize = Number(batchSizeInput().value);
  const form = dosageFormInput().value;

  const excipients = excipientLibrary[form];
  let totalExcipientMg = 100 - apiDose;

  let tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  let labels = [];
  let data = [];
  let totalCost = apiCost;

  let usedMg = 0;

  excipients.forEach((e, i) => {
    let mg = (i === excipients.length - 1)
      ? totalExcipientMg - usedMg
      : e.min;

    usedMg += mg;

    let cost = mg * e.cost;
    totalCost += cost;

    tbody.innerHTML += `
      <tr>
        <td>${e.name}</td>
        <td>${e.function}</td>
        <td>${mg.toFixed(2)}</td>
        <td>${(mg).toFixed(2)}%</td>
        <td>${cost.toFixed(4)}</td>
      </tr>
    `;

    labels.push(e.name);
    data.push(mg);
  });

  tbody.innerHTML += `
    <tr>
      <td><b>API</b></td>
      <td>Active</td>
      <td>${apiDose}</td>
      <td>${apiDose}%</td>
      <td>${apiCost.toFixed(4)}</td>
    </tr>
  `;

  document.getElementById("results").classList.remove("hidden");

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: { labels, datasets: [{ data }] }
  });

  document.getElementById("batchInfo").innerHTML = `
    <h3>Batch Information</h3>
    <p>Batch size: ${batchSize} units</p>
    <p>Batch cost: ${(totalCost * batchSize).toFixed(2)} $</p>
    <p>Estimated storage volume: ${(batchSize * 0.000001).toFixed(3)} m³</p>
    <p>Pallets required: ${Math.ceil(batchSize / 50000)}</p>
  `;

  document.getElementById("recommendations").innerHTML = `
    <h3>Recommendations</h3>
    <ul>
      <li>Manufacturing: ${form === "tablet" ? "Direct compression" : "Standard mixing"}</li>
      <li>Packaging: ${form === "liquid" ? "HDPE bottle" : "Blister"}</li>
      <li>Storage: Store below 25°C, protect from moisture</li>
    </ul>
  `;
}

function apiDoseInput(){ return document.getElementById("apiDose"); }
function apiCostInput(){ return document.getElementById("apiCost"); }
function batchSizeInput(){ return document.getElementById("batchSize"); }
function dosageFormInput(){ return document.getElementById("dosageForm"); }
