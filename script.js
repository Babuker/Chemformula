document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chemForm');
  const resultsSection = document.getElementById('results-section');
  const formulationResults = document.getElementById('formulationResults');
  const ctx = document.getElementById('formulationChart').getContext('2d');
  let chart = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // جمع البيانات
    const activeName = form.activeName.value.trim();
    const activeConc = parseFloat(form.activeConcentration.value);
    const dosageForm = form.dosageForm.value;
    const inputMethod = form.inputMethod.value;
    const referenceStandard = form.referenceStandard.value;

    if (!activeName || isNaN(activeConc) || activeConc <= 0 || !dosageForm) {
      alert('Please fill all required fields correctly.');
      return;
    }

    // نموذج بسيط لتحديد المواد المضافة (excipients) بناءً على الشكل الدوائي
    const excipientsOptions = {
      tablet: [
        { name: 'Lactose', percent: 30 },
        { name: 'Microcrystalline Cellulose', percent: 40 },
        { name: 'Magnesium Stearate', percent: 5 },
        { name: 'Povidone', percent: 5 }
      ],
      syrup: [
        { name: 'Sucrose', percent: 60 },
        { name: 'Preservative', percent: 10 },
        { name: 'Flavor', percent: 10 },
        { name: 'Water', percent: 20 }
      ],
      capsule: [
        { name: 'Gelatin', percent: 50 },
        { name: 'Starch', percent: 30 },
        { name: 'Magnesium Stearate', percent: 10 },
        { name: 'Silica', percent: 10 }
      ],
      injection: [
        { name: 'Sterile Water', percent: 85 },
        { name: 'Buffer Solution', percent: 10 },
        { name: 'Preservative', percent: 5 }
      ]
    };

    const excipients = excipientsOptions[dosageForm] || [];

    // التركيبة النهائية مع المادة الفعالة
    const totalPercentExcipients = excipients.reduce((sum, e) => sum + e.percent, 0);
    const activePercent = 100 - totalPercentExcipients;

    // تحضير بيانات العرض
    const labels = [activeName, ...excipients.map(e => e.name)];
    const data = [activePercent, ...excipients.map(e => e.percent)];

    // عرض النتيجة النصية
    formulationResults.innerHTML = `
      <p>Formulation for <strong>${activeName}</strong> (${activeConc} mg per unit), Dosage Form: <strong>${dosageForm}</strong>, Reference: <strong>${referenceStandard}</strong>.</p>
      <p>Active Ingredient Percentage: <strong>${activePercent.toFixed(2)}%</strong></p>
      <p>Excipients and their percentages:</p>
      <ul>
        ${excipients.map(e => `<li>${e.name}: ${e.percent}%</li>`).join('')}
      </ul>
    `;

    // عرض الرسم البياني الدائري
    if (chart) {
      chart.destroy();
    }
    chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: [
            '#007BFF', '#28A745', '#FFC107', '#DC3545', '#6F42C1',
            '#17A2B8', '#FD7E14', '#20C997', '#6610F2', '#E83E8C'
          ],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({behavior: "smooth"});
  });
});
