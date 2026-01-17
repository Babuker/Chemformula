document.addEventListener('DOMContentLoaded', () => {
  const excipientModeRadios = document.querySelectorAll('input[name="excipientMode"]');
  const excipientNamesSection = document.getElementById('excipientNamesSection');
  const excipientContainer = document.getElementById('excipientContainer');
  const addExcipientBtn = document.getElementById('addExcipientBtn');
  const resultsSection = document.getElementById('results');
  const resultsTableBody = document.querySelector('#resultsTable tbody');
  const ctx = document.getElementById('formulationChart').getContext('2d');
  let chart = null;

  // Show/hide excipient names input based on mode
  excipientModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'manual' && radio.checked) {
        excipientNamesSection.style.display = 'block';
      } else {
        excipientNamesSection.style.display = 'none';
      }
    });
  });

  // Add new excipient row
  addExcipientBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'excipient-row';
    row.innerHTML = `
      <input type="text" name="excipientName" placeholder="اسم المادة المضافة" required />
      <input type="number" name="excipientWeight" placeholder="الكمية (بالملجرام)" min="0" step="any" required />
      <button type="button" class="removeExcipientBtn">حذف</button>
    `;
    excipientContainer.appendChild(row);
  });

  // Remove excipient row
  excipientContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('removeExcipientBtn')) {
      e.target.parentElement.remove();
    }
  });

  // Form submission
  document.getElementById('formulationForm').addEventListener('submit', e => {
    e.preventDefault();

    // جمع البيانات من الخطوات
    const activeName = e.target.activeName.value.trim();
    const activeConc = parseFloat(e.target.activeConcentration.value);
    const standardType = e.target.standardType.value;
    const dosageForm = e.target.dosageForm.value;
    const formulationBasis = e.target.formulationBasis.value;
    const releaseMechanism = e.target.releaseMechanism.value;
    const excipientMode = e.target.excipientMode.value;

    if (!activeName || isNaN(activeConc) || activeConc <= 0) {
      alert('الرجاء إدخال اسم وتركيز المادة الفعالة بشكل صحيح.');
      return;
    }

    // تجميع المواد المضافة
    let excipients = [];
    if (excipientMode === 'manual') {
      const excipientNames = e.target.querySelectorAll('input[name="excipientName"]');
      const excipientWeights = e.target.querySelectorAll('input[name="excipientWeight"]');

      for (let i = 0; i < excipientNames.length; i++) {
        const name = excipientNames[i].value.trim();
        const weight = parseFloat(excipientWeights[i].value);
        if (!name || isNaN(weight) || weight < 0) {
          alert('الرجاء إدخال أسماء وكمية المواد المضافة بشكل صحيح.');
          return;
        }
        excipients.push({ name, weight });
      }
    } else {
      // الوضع الآلي: نستخدم مثال مواد مضافة ثابتة (يمكن تطويره لاحقًا)
      excipients = [
        { name: 'مادة مضافة 1', weight: 10 },
        { name: 'مادة مضافة 2', weight: 5 }
      ];
    }

    // الحساب: جمع الكميات
    const totalWeight = activeConc + excipients.reduce((acc, x) => acc + x.weight, 0);

    // تحضير الجدول
    resultsTableBody.innerHTML = '';
    // المادة الفعالة
    resultsTableBody.innerHTML += `<tr>
      <td>${activeName} (Active)</td>
      <td>${activeConc.toFixed(2)}</td>
      <td>${((activeConc / totalWeight) * 100).toFixed(2)}</td>
    </tr>`;
    // المواد المضافة
    excipients.forEach(({ name, weight }) => {
      resultsTableBody.innerHTML += `<tr>
        <td>${name}</td>
        <td>${weight.toFixed(2)}</td>
        <td>${((weight / totalWeight) * 100).toFixed(2)}</td>
      </tr>`;
    });

    resultsSection.style.display = 'block';

    // رسم المخطط الدائري
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [activeName, ...excipients.map(x => x.name)],
        datasets: [{
          data: [activeConc, ...excipients.map(x => x.weight)],
          backgroundColor: [
            '#007BFF', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#fd7e14', '#20c997'
          ],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // هنا يمكن وضع منطق اختيار التركيبة المثالية مستقبلاً
  });
});
