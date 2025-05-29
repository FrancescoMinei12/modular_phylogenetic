import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module CustomTable
 * @description Module for rendering custom genome data table with import/export functionality
 */

let customData = {};
let genomeNames = [];
const STORAGE_KEY = 'phylogenetic_custom_data';

/**
 * Save custom data to localStorage
 */
function saveCustomDataToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customData));
    } catch (error) {
        console.error('Error saving custom data to localStorage:', error);
    }
}

/**
 * Load custom data from localStorage
 */
function loadCustomDataFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            customData = JSON.parse(stored);
            return customData;
        }
    } catch (error) {
        console.error('Error loading custom data from localStorage:', error);
    }
    return {};
}

/**
 * Initialize the custom table with genome names from taxonomy data
 */
function initializeGenomeNames(taxonomyData) {
    genomeNames = [];
    if (taxonomyData && taxonomyData.children) {
        extractGenomeNames(taxonomyData);
    }

    // Load existing custom data from localStorage
    customData = loadCustomDataFromStorage();
}

function extractGenomeNames(node) {
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => extractGenomeNames(child));
    } else {
        if (node.name) {
            genomeNames.push(node.name);
        }
    }
}

/**
 * Generate template JSON with all genomes
 */
function generateTemplate() {
    const template = {};
    genomeNames.forEach(genome => {
        template[genome] = [];
    });
    return template;
}

/**
 * Download template JSON file
 */
function downloadTemplate() {
    const template = generateTemplate();
    const blob = new Blob([JSON.stringify(template, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_genome_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Handle file import
 */
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            customData = importedData;

            // Save to localStorage
            saveCustomDataToStorage();

            // Re-render the table
            renderCustomTable(customData, "#custom-tab");
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

/**
 * Clear custom data
 */
function clearCustomData() {
    if (confirm('Are you sure you want to clear all custom data?')) {
        customData = {};
        saveCustomDataToStorage();
        renderCustomTable(customData, "#custom-tab");
    }
}

/**
 * Render the custom table
 */
function renderCustomTable(data, selector) {
    const container = document.querySelector(selector);
    if (!container) return;

    container.innerHTML = '';

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("mb-3", "flex", "justify-between", "items-center", "w-full");

    const leftButtonGroup = document.createElement("div");
    leftButtonGroup.classList.add("flex", "gap-2");

    const downloadButton = document.createElement("button");
    downloadButton.id = "download-template";
    downloadButton.textContent = "Download Template";
    downloadButton.classList.add("px-3", "py-1", "bg-blue-500", "text-white", "rounded", "text-sm", "hover:bg-blue-600");

    const importLabel = document.createElement("label");
    importLabel.classList.add("px-3", "py-1", "bg-green-500", "text-white", "rounded", "text-sm", "hover:bg-green-600", "cursor-pointer");
    importLabel.textContent = "Import JSON";

    const importInput = document.createElement("input");
    importInput.type = "file";
    importInput.id = "import-file";
    importInput.accept = ".json";
    importInput.classList.add("hidden");

    importLabel.appendChild(importInput);

    // Add clear button
    const clearButton = document.createElement("button");
    clearButton.id = "clear-data";
    clearButton.textContent = "Clear Data";
    clearButton.classList.add("px-3", "py-1", "bg-red-500", "text-white", "rounded", "text-sm", "hover:bg-red-600");

    leftButtonGroup.appendChild(downloadButton);
    leftButtonGroup.appendChild(importLabel);
    leftButtonGroup.appendChild(clearButton);
    buttonContainer.appendChild(leftButtonGroup);

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("custom-table-container", "h-[250px]", "overflow-y-auto", "pr-2");

    const table = document.createElement("table");
    table.classList.add("w-full", "text-sm", "text-left", "border-collapse");

    const tableHeader = table.createTHead();
    const headerRow = tableHeader.insertRow();
    headerRow.classList.add("bg-gray-100");

    const headers = ['Genome', 'Custom attributes'];
    headers.forEach(headerText => {
        const headerCell = headerRow.insertCell();
        headerCell.textContent = headerText;
        headerCell.classList.add("px-3", "py-2", "font-semibold", "border-b");
    });

    const tbody = document.createElement('tbody');

    if (Object.keys(data).length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 2;
        emptyCell.classList.add("px-3", "py-8", "text-center", "text-gray-500", "border-b");
        emptyCell.textContent = 'No custom data loaded. Download template and import your data.';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
    } else {
        const sortedGenomes = Object.keys(data).sort();

        sortedGenomes.forEach(genome => {
            const genomeAttributes = data[genome];

            if (Array.isArray(genomeAttributes)) {
                if (genomeAttributes.length === 0) {
                    const row = document.createElement('tr');
                    row.classList.add("clickable-row", "cursor-pointer", "odd:bg-gray-50", "hover:bg-blue-50", "transition-colors");
                    row.dataset.taxon = genome;

                    const genomeCell = document.createElement('td');
                    genomeCell.classList.add("px-3", "py-2", "border-b");
                    genomeCell.textContent = genome;
                    row.appendChild(genomeCell);

                    const attributeCell = document.createElement('td');
                    attributeCell.classList.add("px-3", "py-2", "border-b", "text-gray-400", "italic");
                    attributeCell.textContent = 'No attributes';
                    row.appendChild(attributeCell);

                    row.addEventListener("click", function () {
                        document.querySelectorAll(`${selector} tr`).forEach(r => {
                            r.classList.toggle("bg-yellow-100", r === this);
                        });
                        PhylogeneticTree.ui.interactions.highlighting.highlightPathAndLabel(genome);
                    });

                    tbody.appendChild(row);
                } else {
                    genomeAttributes.forEach((attribute, index) => {
                        const row = document.createElement('tr');
                        row.classList.add("clickable-row", "cursor-pointer", "odd:bg-gray-50", "hover:bg-blue-50", "transition-colors");
                        row.dataset.taxon = genome;

                        const genomeCell = document.createElement('td');
                        genomeCell.classList.add("px-3", "py-2", "border-b");
                        if (index === 0) {
                            genomeCell.textContent = genome;
                            genomeCell.rowSpan = genomeAttributes.length;
                        } else {
                            genomeCell.style.display = 'none';
                        }
                        row.appendChild(genomeCell);

                        const attributeCell = document.createElement('td');
                        attributeCell.classList.add("px-3", "py-2", "border-b");
                        attributeCell.textContent = attribute;
                        row.appendChild(attributeCell);

                        row.addEventListener("click", function () {
                            document.querySelectorAll(`${selector} tr`).forEach(r => {
                                r.classList.toggle("bg-yellow-100", r === this);
                            });
                            PhylogeneticTree.ui.interactions.highlighting.highlightPathAndLabel(genome);
                        });

                        tbody.appendChild(row);
                    });
                }
            }
        });
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);

    container.appendChild(buttonContainer);
    container.appendChild(tableWrapper);

    // Add event listeners
    downloadButton.addEventListener('click', downloadTemplate);
    importInput.addEventListener('change', handleFileImport);
    clearButton.addEventListener('click', clearCustomData);
}

/**
 * Get current custom data (for use by other modules)
 */
function getCustomData() {
    return customData;
}

PhylogeneticTree.ui.components.CustomTable = {
    renderCustomTable,
    initializeGenomeNames,
    getCustomData,
    loadCustomDataFromStorage
};