/* =====================================================
   ChemFormula® – Global Chemical Formulation Engine
   Version: 2.0 (Static / GitHub Pages Ready)
   ===================================================== */

/* ===================== i18n ===================== */
const I18N = {
  en: {
    totalOk: "✔ Total = 100%",
    totalErr: "Total = {x}% (Must equal 100%)",
    autoModeInfo: "Auto mode enabled: unit weight calculated.",
    manualModeInfo: "Manual mode enabled: manufacturer input.",
  },
  ar: {
    totalOk: "✔ المجموع = 100%",
    totalErr: "المجموع = {x}% (يجب أن يساوي 100%)",
    autoModeInfo: "تم تفعيل الوضع التلقائي: الوزن يُحسب آليًا.",
    manualModeInfo: "تم تفعيل الوضع اليدوي: إدخال الشركة المصنعة.",
  }
};

let CURRENT_LANG = "en";

/* ===================== State ===================== */
let components = [];
let pieChart = null;

/* ===================== Helpers ===================== */
function $(id) {
  return document.getElementById(id);
}

function t(key, vars = {}) {
  let text = I18N[CURRENT_LANG][key] || key;
  Object.keys(vars).forEach(k => {
    text = text.replace(`{${k}}`, vars[k]);
  });
  return text;
}

/* ===================== Language ===================== */
function setLanguage(lang) {
  CURRENT_LANG = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (I18N[lang] && I18N[lang][key]) {
      el.textContent = I18N[lang][key];
    }
  });
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  const langSelect = $("langSelect");
  if (langSelect) {
    langSelect.addEventListener("change", e => {
      setLanguage(e.target.value);
    });
  }

  const weightMode = $("weightMode");
  if (weightMode) {
    weightMode.addEventListener("change", handleWeightMode);
  }

  const activeWeight = $("activeWeight");
  if (activeWeight) {
    activeWeight.addEventListener("input", render);
  }

  render();
});

/* ===================== Weight Mode ===================== */
function handleWeightMode() {
  const mode = $("weightMode").value;
  const unitWeight = $("unitWeight");

  if (mode === "auto") {
    unitWeight.disabled = true;
  } else {
    unitWeight.disabled = false;
  }
}

/* ===================== Components ===================== */
function addComponent() {
  const name = $("compName").value.trim();
  const pct = parseFloat($("compPct").value);

  if (!name || isNaN(pct) || pct <= 0) return;

  components.push({ name, pct });

  $("compName").value = "";
  $("compPct").value = "";

  render();
}

function removeComponent(index) {
  components.splice(index, 1);
  render();
}

/* ===================== Rendering ===================== */
function render() {
  const tbody = $("componentsBody");
  const status = $("sumStatus");

  tbody.innerHTML = "";

  let total = 0;
  let labels = [];
  let values = [];

  /* Active Ingredient (Manual Only) */
  const activeName = $("activeName").value.trim();
  const activePct = parseFloat($("activeWeight").value) || 0;

  if (activeName && activePct > 0) {
    total += activePct;
    labels.push(activeName);
    values.push(activePct);
  }

  /* Other Components */
  components.forEach((c, i) => {
    total += c.pct;
    labels.push(c.name);
    values.push(c.pct);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${c.name}</td>
      <td>${c.pct}</td>
      <td>
        <button class="secondary" onclick="removeComponent(${i})">×</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  /* Validation */
  if (Math.abs(total - 100) < 0.0001) {
    status.textContent = t("totalOk");
    status.className = "ok";
  } else {
    status.textContent = t("totalErr", { x: total.toFixed(2) });
    status.className = "error";
  }

  drawChart(labels, values);
}

/* ===================== Chart ===================== */
function drawChart(labels, values) {
  const ctx = $("pieChart");
  if (!ctx || typeof Chart === "undefined") return;

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: values
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

/* ===================== Export (Future-ready) ===================== */
/* Placeholder hooks for PDF / Legal / Commercial modules */
window.ChemFormula = {
  version: "2.0",
  license: "Commercial Ready",
  exportPDF: () => {
    alert("PDF export module will be enabled in Pro version.");
  }
};
