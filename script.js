document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formulationForm');
  const excipientModeRadios = form.elements['excipientMode'];
  const excipientNamesSection = document.getElementById('excipientNamesSection');
  const excipientContainer = document.getElementById('excipientContainer');
  const addExcipientBtn = document.getElementById('addExcipientBtn');
  const resultsSection = document.getElementById('results');
  const resultsTableBody = document.querySelector('#resultsTable tbody');
  const ctx = document.getElementById('formulationChart').getContext('2d');
  let chart = null;

  // Show/hide excipients input based on mode
  excipientModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'manual' && radio.checked) {
        excipientNamesSection.style.display = 'block';
      } else {
        excipientNamesSection.style.display = 'none';
      }
    });
  });

  // Add excipient row
  addExcipientBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'excipient-row';
    row.innerHTML = `
      <input type="text" name="excipientName" placeholder="Excipient name" required />
      <input type="number" name="excipientWeight" placeholder="Weight (mg)" min="0" step="any" required />
      <button type="button" class="removeExcipientBtn">Remove</button>
    `;
    excipientContainer.appendChild(row);
  });

  // Remove excipient row
  excipientContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('removeExcipientBtn')) {
      e.target.parentElement.remove();
    }
  });

  // Main form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous results
    resultsTableBody.innerHTML = '';
    resultsSection.style.display = 'none';
    if (chart) {
      chart.destroy();
      chart = null;
    }

    // Read active ingredient
    const activeName = form.activeName.value.trim();
    const activeConcentration = parseFloat(form.activeConcentration.value);
    if (!activeName) {
      alert('Please enter the active ingredient name.');
      return;
    }
    if (isNaN(activeConcentration) || activeConcentration <= 0) {
      alert('Please enter a valid active ingredient concentration.');
      return;
    }

    // Other inputs (just to check they're selected)
    if (!form.standardType.value) {
      alert('Please select the reference standard.');
      return;
    }
    if (!form.dosageForm.value) {
      alert('Please select the dosage form.');
      return;
    }
    if (!form.formulationBasis.value) {
      alert('Please select the formulation basis.');
      return;
    }
    if (!form.releaseMechanism.value) {
      alert('Please select the release mechanism.');
      return;
    }
    if (!form.excipientMode.value) {
      alert('Please select excipient selection mode.');
      return;
    }

    // Collect excipients
    let excipients = [];
    if (form.excipientMode.value === 'manual') {
      const excipientNames = excipientContainer.querySelectorAll('input[name="excipientName"]');
      const excipientWeights = excipientContainer.querySelectorAll('input[name="excipientWeight"]');
      if (excipientNames.length === 0) {
        alert('Please add at least one excipient.');
        return;
      }
      for (let i = 0; i < excipientNames.length; i++) {
        const name = excipientNames[i].value.trim();
        const weight = parseFloat(excipientWeights[i].value);
        if (!name) {
          alert('Please enter all excipient names.');
          return;
        }
        if (isNaN(weight) || weight < 0) {
          alert('Please enter valid excipient weights.');
          return;
        }
        excipients.push({ name, weight });
      }
    } else {
      // Automatic excipients - example logic: choose 3 default excipients with weights based on active concentration
      excipients = [
        { name: 'Excipient A', weight: activeConcentration * 0.2 },
        { name: 'Excipient B', weight: activeConcentration * 0.15 },
        { name: 'Excipient C', weight: activeConcentration * 0.1 }
      ];
    }

    // Calculate total weight = active + excipients weights
    const totalWeight = activeConcentration + excipients.reduce((acc, e) => acc + e.weight, 0);

    // Prepare data for results and chart
    const results = [];
    results.push({
      name: activeName,
      weight: activeConcentration,
      percentage: (activeConcentration / totalWeight) * 100
    });

    excipients.forEach(e => {
      results.push({
        name: e.name,
        weight: e.weight,
        percentage: (e.weight / totalWeight) * 100
      });
    });

    // Render results table
    results.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.weight.toFixed(2)}</td>
        <td>${item.percentage.toFixed(2)}</td>
      `;
      resultsTableBody.appendChild(tr);
    });

    // Show results section
    resultsSection.style.display = 'block';

    // Render pie chart
    const labels = results.map(r => r.name);
    const data = results.map(r => r.percentage);

    chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#007BFF', '#28A745', '#FFC107', '#DC3545', '#6F42C1',
            '#17A2B8', '#FD7E14', '#20C997', '#6610F2', '#E83E8C'
          ],
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
        },
      }
    });

  });
});
