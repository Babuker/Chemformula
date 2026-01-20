document.getElementById("formulaForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const aiName = document.getElementById("aiName").value;
  const aiMg = parseFloat(document.getElementById("aiMg").value);

  const excipients = [
    { name: "Diluent", mg: aiMg * 1.2 },
    { name: "Binder", mg: aiMg * 0.3 },
    { name: "Disintegrant", mg: aiMg * 0.2 },
    { name: "Lubricant", mg: aiMg * 0.05 }
  ];

  const total = aiMg + excipients.reduce((s, e) => s + e.mg, 0);
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  const components = [{ name: aiName, mg: aiMg }, ...excipients];

  components.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.name}</td>
      <td>${c.mg.toFixed(2)}</td>
      <td>${((c.mg / total) * 100).toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("results").style.display = "block";

  new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
      labels: components.map(c => c.name),
      datasets: [{
        data: components.map(c => c.mg)
      }]
    }
  });
});
