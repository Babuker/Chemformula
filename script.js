let chart;

const excipients = {
  tablet: [
    { name: "MCC", function: "Diluent", min: 20 },
    { name: "PVP", function: "Binder", min: 3 },
    { name: "Croscarmellose", function: "Disintegrant", min: 2 },
    { name: "Magnesium Stearate", function: "Lubricant", min: 0.5 }
  ],
  capsule: [
    { name: "Lactose", function: "Filler", min: 30 },
    { name: "Talc", function: "Glidant", min: 1 }
  ],
  liquid: [
    { name: "Purified Water", function: "Solvent", min: 70 },
    { name: "Sodium Benzoate", function: "Preservative", min: 0.1 }
  ],
  dry_syrup: [
    { name: "Sucrose", function: "Diluent", min: 60 },
    { name: "Flavor", function: "Flavoring", min: 0.2 }
  ]
};

function runFormulation() {

  const apiDose = Number(apiDoseInput().value);
  const form = dosageFormInput().value;
  const batchSize = Number(batchSizeInput().value);

  if (apiDose <= 0 || apiDose >= 100) {
    alert("API dose must be between 0 and 100%");
    return;
  }

  const excList = excipients[form];
  let remaining = 100 - apiDose;

  let tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";

  let labels = ["API"];
  let data = [apiDose];

  excList.forEach((e, i) => {

    let percent;

    if (i === excList.length - 1) {
      percent = remaining;
    } else {
      percent = e.min;
      remaining -= percent;
    }

    if (percent < 0) percent = 0;

    tbody.innerHTML += `
      <tr>
        <td>${e.name}</td>
        <td>${e.function}</td>
        <td>${percent.toFixed(2)}%</td>
      </tr>
    `;

    labels.push(e.name);
    data.push(percent);
  });

  tbody.innerHTML += `
    <tr>
      <td><b>API</b></td>
      <td>Active</td>
      <td>${apiDose.toFixed(2)}%</td>
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
    <p>Estimated storage volume: ${(batchSize * 0.000001).toFixed(3)} m³</p>
    <p>Pallets required: ${Math.ceil(batchSize / 50000)}</p>
  `;

  document.getElementById("recommendations").innerHTML = `
    <h3>Recommendations</h3>
    <ul>
      <li>Storage temperature: below 25°C</li>
      <li>Relative humidity: below 60%</li>
      <li>Manufacturing method: ${form === "tablet" ? "Direct Compression" : "Standard Mixing"}</li>
      <li>Packaging: ${form === "liquid" ? "HDPE Bottle" : "Blister"}</li>
    </ul>
  `;
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text("ChemFormula® – Formulation Report", 10, 10);
  doc.text(document.getElementById("results").innerText, 10, 20);

  doc.save("ChemFormula_Report.pdf");
}

function apiDoseInput(){ return document.getElementById("apiDose"); }
function dosageFormInput(){ return document.getElementById("dosageForm"); }
function batchSizeInput(){ return document.getElementById("batchSize"); }
