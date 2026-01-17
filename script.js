document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chemForm');
  const ingredientsContainer = document.getElementById('ingredientsContainer');
  const addIngredientBtn = document.getElementById('addIngredientBtn');
  const totalPercentageEl = document.getElementById('totalPercentage');
  const ctx = document.getElementById('formulationChart').getContext('2d');
  let chart = null;

  // Add new ingredient row
  addIngredientBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
      <input type="text" name="ingredientName" placeholder="Ingredient Name" required/>
      <input type="number" name="ingredientWeight" placeholder="Weight" min="0" step="any" required/>
      <button type="button" class="removeIngredientBtn">Remove</button>
    `;
    ingredientsContainer.appendChild(row);
  });

  // Remove ingredient row
  ingredientsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('removeIngredientBtn')) {
      e.target.parentElement.remove();
    }
  });

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const totalWeight = parseFloat(form.totalWeight.value);
    if (isNaN(totalWeight) || totalWeight <= 0) {
      alert('Please enter a valid total weight.');
      return;
    }

    const weightInputType = form.weightInputType.value;
    const ingredients = [];

    // Collect ingredients
    const ingredientNames = form.querySelectorAll('input[name="ingredientName"]');
    const ingredientWeights = form.querySelectorAll('input[name="ingredientWeight"]');

    for (let i = 0; i < ingredientNames.length; i++) {
      const name = ingredientNames[i].value.trim();
      const weight = parseFloat(ingredientWeights[i].value);

      if (!name) {
        alert('Please enter all ingredient names.');
        return;
      }
      if (isNaN(weight) || weight < 0) {
        alert('Please enter valid weights.');
        return;
      }
      ingredients.push({ name, weight });
    }

    // Calculate total ingredient weight sum
    let totalIngredientWeight = ingredients.reduce((acc, ing) => acc + ing.weight, 0);

    // Auto adjust total weight if needed
    let finalTotalWeight = totalWeight;
    if (weightInputType === 'auto') {
      finalTotalWeight = totalIngredientWeight;
    }

    // Calculate percentages and verify sum
    let totalPercent = 0;
    const labels = [];
    const data = [];

    ingredients.forEach((ing) => {
      const percent = (ing.weight / finalTotalWeight) * 100;
      totalPercent += percent;
      labels.push(ing.name);
      data.push(parseFloat(percent.toFixed(2)));
    });

    // Display total percent sum (should be close to 100)
    totalPercentageEl.textContent = `Total Percentage: ${totalPercent.toFixed(2)}%`;

    // Render pie chart
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
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          }
        }
      },
    });
  });
});
