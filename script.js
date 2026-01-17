// Chemical Elements Database
const elementsDB = {
    'H': { name: 'Hydrogen', mass: 1.008, state: 'Gas' },
    'He': { name: 'Helium', mass: 4.0026, state: 'Gas' },
    'Li': { name: 'Lithium', mass: 6.94, state: 'Solid' },
    'Be': { name: 'Beryllium', mass: 9.0122, state: 'Solid' },
    'B': { name: 'Boron', mass: 10.81, state: 'Solid' },
    'C': { name: 'Carbon', mass: 12.011, state: 'Solid' },
    'N': { name: 'Nitrogen', mass: 14.007, state: 'Gas' },
    'O': { name: 'Oxygen', mass: 15.999, state: 'Gas' },
    'F': { name: 'Fluorine', mass: 18.998, state: 'Gas' },
    'Ne': { name: 'Neon', mass: 20.18, state: 'Gas' },
    'Na': { name: 'Sodium', mass: 22.99, state: 'Solid' },
    'Mg': { name: 'Magnesium', mass: 24.305, state: 'Solid' },
    'Al': { name: 'Aluminum', mass: 26.982, state: 'Solid' },
    'Si': { name: 'Silicon', mass: 28.085, state: 'Solid' },
    'P': { name: 'Phosphorus', mass: 30.974, state: 'Solid' },
    'S': { name: 'Sulfur', mass: 32.06, state: 'Solid' },
    'Cl': { name: 'Chlorine', mass: 35.45, state: 'Gas' },
    'K': { name: 'Potassium', mass: 39.098, state: 'Solid' },
    'Ca': { name: 'Calcium', mass: 40.078, state: 'Solid' },
    'Fe': { name: 'Iron', mass: 55.845, state: 'Solid' },
    'Cu': { name: 'Copper', mass: 63.546, state: 'Solid' },
    'Zn': { name: 'Zinc', mass: 65.38, state: 'Solid' },
    'Ag': { name: 'Silver', mass: 107.87, state: 'Solid' },
    'Au': { name: 'Gold', mass: 196.97, state: 'Solid' },
    'Hg': { name: 'Mercury', mass: 200.59, state: 'Liquid' },
    'Pb': { name: 'Lead', mass: 207.2, state: 'Solid' }
};

// Common Compounds Database
const compoundsDB = {
    'H2O': { name: 'Water', formula: 'H₂O', type: 'Compound', state: 'Liquid' },
    'H2O2': { name: 'Hydrogen Peroxide', formula: 'H₂O₂', type: 'Compound', state: 'Liquid' },
    'CO2': { name: 'Carbon Dioxide', formula: 'CO₂', type: 'Gas', state: 'Gas' },
    'CH4': { name: 'Methane', formula: 'CH₄', type: 'Gas', state: 'Gas' },
    'NH3': { name: 'Ammonia', formula: 'NH₃', type: 'Gas', state: 'Gas' },
    'NaCl': { name: 'Sodium Chloride', formula: 'NaCl', type: 'Salt', state: 'Solid' },
    'HCl': { name: 'Hydrochloric Acid', formula: 'HCl', type: 'Acid', state: 'Liquid' },
    'H2SO4': { name: 'Sulfuric Acid', formula: 'H₂SO₄', type: 'Acid', state: 'Liquid' },
    'NaOH': { name: 'Sodium Hydroxide', formula: 'NaOH', type: 'Base', state: 'Solid' },
    'C6H12O6': { name: 'Glucose', formula: 'C₆H₁₂O₆', type: 'Sugar', state: 'Solid' },
    'C2H5OH': { name: 'Ethanol', formula: 'C₂H₅OH', type: 'Alcohol', state: 'Liquid' },
    'CH3COOH': { name: 'Acetic Acid', formula: 'CH₃COOH', type: 'Acid', state: 'Liquid' },
    'CaCO3': { name: 'Calcium Carbonate', formula: 'CaCO₃', type: 'Salt', state: 'Solid' },
    'Mg(OH)2': { name: 'Magnesium Hydroxide', formula: 'Mg(OH)₂', type: 'Base', state: 'Solid' },
    'Al2O3': { name: 'Aluminum Oxide', formula: 'Al₂O₃', type: 'Oxide', state: 'Solid' }
};

// Subscript Converter
const subscriptMap = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
};

function toSubscript(str) {
    return str.replace(/\d/g, match => subscriptMap[match] || match);
}

function parseFormula(formula) {
    const elements = {};
    let currentElement = '';
    let currentNumber = '';
    let inParenthesis = false;
    let parenthesisContent = '';
    let parenthesisMultiplier = '';
    
    for (let i = 0; i < formula.length; i++) {
        const char = formula[i];
        
        if (char === '(') {
            inParenthesis = true;
            continue;
        } else if (char === ')') {
            inParenthesis = false;
            continue;
        }
        
        if (inParenthesis) {
            parenthesisContent += char;
        } else {
            if (char.match(/[A-Z]/)) {
                if (currentElement) {
                    const count = currentNumber ? parseInt(currentNumber) : 1;
                    elements[currentElement] = (elements[currentElement] || 0) + count;
                }
                currentElement = char;
                currentNumber = '';
            } else if (char.match(/[a-z]/)) {
                currentElement += char;
            } else if (char.match(/\d/)) {
                currentNumber += char;
            }
        }
    }
    
    if (currentElement) {
        const count = currentNumber ? parseInt(currentNumber) : 1;
        elements[currentElement] = (elements[currentElement] || 0) + count;
    }
    
    return elements;
}

function calculateMolarMass(formula) {
    const elements = parseFormula(formula);
    let totalMass = 0;
    
    for (const [element, count] of Object.entries(elements)) {
        if (elementsDB[element]) {
            totalMass += elementsDB[element].mass * count;
        }
    }
    
    return totalMass;
}

function analyzeFormula() {
    const input = document.getElementById('chemical-input').value.trim();
    if (!input) {
        alert('Please enter a chemical formula');
        return;
    }
    
    // Clean input
    const cleanInput = input.replace(/[₂-₉]/g, match => 
        Object.keys(subscriptMap).find(key => subscriptMap[key] === match) || match
    );
    
    // Search in database
    let compoundData = compoundsDB[cleanInput];
    let formula = cleanInput;
    let name = '';
    let state = 'Unknown';
    
    if (compoundData) {
        name = compoundData.name;
        formula = compoundData.formula;
        state = compoundData.state;
    } else {
        // Try to identify elements
        const elements = parseFormula(cleanInput);
        const elementNames = Object.keys(elements).map(el => elementsDB[el]?.name || el);
        name = elementNames.join('-') + ' (Compound)';
        
        // Determine state based on elements
        const hasGas = Object.keys(elements).some(el => elementsDB[el]?.state === 'Gas');
        const hasLiquid = Object.keys(elements).some(el => elementsDB[el]?.state === 'Liquid');
        state = hasGas ? 'Gas' : hasLiquid ? 'Liquid' : 'Solid';
    }
    
    // Calculations
    const molarMass = calculateMolarMass(cleanInput);
    const elements = parseFormula(cleanInput);
    const atomCount = Object.values(elements).reduce((a, b) => a + b, 0);
    const elementCount = Object.keys(elements).length;
    
    // Display results
    document.getElementById('input-display').textContent = input;
    document.getElementById('corrected-formula').textContent = toSubscript(cleanInput);
    document.getElementById('chemical-name').textContent = name;
    document.getElementById('chemical-state').textContent = state;
    document.getElementById('molar-mass').textContent = molarMass.toFixed(2);
    document.getElementById('atom-count').textContent = atomCount;
    document.getElementById('element-count').textContent = elementCount;
    
    // Calculate mass percentage
    let totalMass = 0;
    const elementData = [];
    
    for (const [element, count] of Object.entries(elements)) {
        if (elementsDB[element]) {
            const elementMass = elementsDB[element].mass * count;
            totalMass += elementMass;
            elementData.push({
                symbol: element,
                name: elementsDB[element].name,
                count: count,
                mass: elementsDB[element].mass,
                totalMass: elementMass
            });
        }
    }
    
    // Update mass percentage
    document.getElementById('mass-percent').textContent = '100';
    
    // Update element table
    const tbody = document.getElementById('elements-tbody');
    tbody.innerHTML = '';
    
    elementData.forEach(data => {
        const percentage = ((data.totalMass / totalMass) * 100).toFixed(2);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.symbol}</td>
            <td>${data.count}</td>
            <td>${data.mass.toFixed(3)}</td>
            <td>${percentage}%</td>
        `;
        tbody.appendChild(row);
    });
    
    // Show results section
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Main analyze button
    document.getElementById('analyze-btn').addEventListener('click', analyzeFormula);
    
    // Example buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('chemical-input').value = this.getAttribute('data-formula');
            analyzeFormula();
        });
    });
    
    // Enter key support
    document.getElementById('chemical-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            analyzeFormula();
        }
    });
    
    // Formula Converter
    document.getElementById('convert-btn').addEventListener('click', function() {
        const input = document.getElementById('convert-input').value.trim();
        if (!input) return;
        
        let result = '';
        const cleanInput = input.replace(/[₂-₉]/g, match => 
            Object.keys(subscriptMap).find(key => subscriptMap[key] === match) || match
        );
        
        if (compoundsDB[cleanInput]) {
            result = `${cleanInput} → ${compoundsDB[cleanInput].name}`;
        } else {
            // Try reverse lookup
            const found = Object.entries(compoundsDB).find(([key, value]) => 
                value.name.toLowerCase() === input.toLowerCase()
            );
            if (found) {
                result = `${input} → ${toSubscript(found[0])}`;
            } else {
                result = '
