import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module taxaTable
 * @description Module for rendering taxonomic data in tabular format with search and highlighting
 */

/**
 * @function renderTaxaTable
 * @description Renders a table of taxonomic data with search functionality
 * @param {Object} treeData - The hierarchical tree data containing taxonomic information
 * @param {string} tableSelector - CSS selector for the container element
 */
function renderTaxaTable(treeData, tableSelector) {
    const tableContainer = document.querySelector(tableSelector);
    if (!tableContainer) {
        throw new Error(`Container element not found: ${tableSelector}`);
    }

    PhylogeneticTree.core.io.file.loadCustomNamesFromFile(treeData, tableSelector);
    tableContainer.innerHTML = "";

    if (!tableContainer.id) {
        tableContainer.id = tableSelector.replace(/[^a-zA-Z0-9]/g, '');
    }

    PhylogeneticTree.ui.visualization.SearchBar.renderSearchBar(tableSelector, `${tableSelector} table`);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("mb-3", "flex", "justify-between", "items-center", "w-full");

    const leftButtonGroup = document.createElement("div");
    leftButtonGroup.classList.add("flex", "gap-2");

    const importButton = document.createElement("button");
    importButton.textContent = "Import custom names";
    importButton.classList.add("px-3", "py-1", "bg-blue-500", "text-white", "rounded", "text-sm", "hover:bg-blue-600");
    importButton.addEventListener("click", () => PhylogeneticTree.core.io.file.importCustomNames(treeData, tableSelector));

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save names to file";
    saveButton.classList.add("px-3", "py-1", "bg-purple-500", "text-white", "rounded", "text-sm", "hover:bg-purple-600");
    saveButton.addEventListener("click", () => PhylogeneticTree.core.io.file.saveCustomNamesToFile(treeData));

    leftButtonGroup.appendChild(importButton);
    leftButtonGroup.appendChild(saveButton);

    const rightButtonGroup = document.createElement("div");
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset names";
    resetButton.classList.add("px-3", "py-1", "bg-red-500", "text-white", "rounded", "text-sm", "hover:bg-red-600");
    resetButton.addEventListener("click", () => resetCustomNames(treeData, tableSelector));
    rightButtonGroup.appendChild(resetButton);

    buttonContainer.appendChild(leftButtonGroup);
    buttonContainer.appendChild(rightButtonGroup);
    tableContainer.appendChild(buttonContainer);

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("taxa-table-container", "h-[400px]", "overflow-y-auto", "pr-2");

    const taxaTable = document.createElement("table");
    taxaTable.classList.add("w-full", "text-sm", "text-left", "border-collapse");

    const tableHeader = taxaTable.createTHead();
    const headerRow = tableHeader.insertRow();
    headerRow.classList.add("bg-gray-100");

    const nameHeaderCell = headerRow.insertCell();
    nameHeaderCell.textContent = "Taxon";
    nameHeaderCell.classList.add("px-3", "py-2", "font-semibold", "border-b");

    const editHeaderCell = headerRow.insertCell();
    editHeaderCell.textContent = "Nome personalizzato";
    editHeaderCell.classList.add("px-3", "py-2", "font-semibold", "border-b");

    tableWrapper.appendChild(taxaTable);
    tableContainer.appendChild(tableWrapper);

    const allTaxa = PhylogeneticTree.core.taxonomy.TaxonExtractor.extractTaxa(treeData);

    function renderTaxaPage(pageTaxa) {
        const oldTbody = taxaTable.tBodies[0];
        if (oldTbody) {
            taxaTable.removeChild(oldTbody);
        }

        const tableBody = taxaTable.createTBody();

        pageTaxa.forEach(taxon => {
            const tableRow = tableBody.insertRow();
            tableRow.classList.add("clickable-row", "cursor-pointer", "odd:bg-gray-50", "hover:bg-blue-50", "transition-colors");
            tableRow.dataset.taxon = taxon.originalName;

            const nameCell = tableRow.insertCell();
            nameCell.textContent = taxon.name;
            nameCell.classList.add("px-3", "py-2", "border-b");

            const editCell = tableRow.insertCell();
            editCell.classList.add("px-3", "py-2", "border-b");

            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.value = taxon.name;
            editInput.placeholder = "Enter custom name";
            editInput.classList.add(
                "border",
                "border-gray-300",
                "rounded",
                "px-2",
                "py-1",
                "w-full",
                "text-sm",
                "focus:outline-none",
                "focus:ring-2",
                "focus:ring-blue-300"
            );

            editInput.id = `custom-name-${taxon.originalName.replace(/[^a-zA-Z0-9]/g, '-')}`;
            editInput.name = `custom-name-${taxon.originalName.replace(/[^a-zA-Z0-9]/g, '-')}`;

            editInput.addEventListener("change", function () {
                const newName = this.value.trim();
                if (newName) {
                    nameCell.textContent = newName;
                    tableRow.dataset.customName = newName;
                    PhylogeneticTree.core.taxonomy.CustomNameManager.updateTaxonDisplayName(taxon.originalName, newName);
                } else {
                    this.value = taxon.name;
                }
            });

            editInput.addEventListener("click", function (event) {
                event.stopPropagation();
            });

            editCell.appendChild(editInput);

            tableRow.addEventListener("click", function () {
                const existingChart = document.querySelector('.diffusivity-chart');
                if (existingChart) existingChart.remove();

                document.querySelectorAll(`${tableSelector} tr`).forEach(r => {
                    r.classList.toggle("bg-yellow-100", r === this);
                });
                PhylogeneticTree.ui.interactions.highlighting.highlightPathAndLabel(taxon.originalName);

                const geneData = PhylogeneticTree.core.data.getGeneData();
                const stats = PhylogeneticTree.core.utilities.GeneFamilyStats.calculateTaxonStats(
                    taxon.originalName,
                    geneData
                );

                const chart = PhylogeneticTree.ui.components.DiffusivityChart.createChart(
                    stats.singleton,
                    stats.dispensable,
                    stats.core,
                    stats.total
                );

                if (chart) {
                    const rect = this.getBoundingClientRect();
                    chart.style.left = `${rect.right + window.scrollX + 5}px`;
                    chart.style.top = `${rect.top + window.scrollY}px`;
                    document.body.appendChild(chart);

                    setTimeout(() => {
                        document.addEventListener('click', function closeChart(e) {
                            if (!chart.contains(e.target)) {
                                chart.remove();
                                document.removeEventListener('click', closeChart);
                            }
                        });
                    }, 100);
                }
            });
        });
    }

    PhylogeneticTree.ui.components.Pagination.applyPagination(
        allTaxa,
        tableContainer.id,
        renderTaxaPage,
        { itemsPerPage: 25 }
    );
}

/**
 * @function resetCustomNames
 * @description Resets all custom taxon names to their original values
 * @param {Object} treeData - The hierarchical tree data
 * @param {string} tableSelector - CSS selector for the table container
 */
function resetCustomNames(treeData) {
    try {
        localStorage.removeItem('customTaxonNames');

        const taxa = PhylogeneticTree.core.taxonomy.TaxonExtractor.extractTaxa(treeData);

        taxa.forEach(taxon => {
            const row = document.querySelector(`tr[data-taxon="${taxon.originalName}"]`);
            if (row) {
                const nameCell = row.cells[0];
                nameCell.textContent = taxon.originalName;

                const inputId = `custom-name-${taxon.originalName.replace(/[^a-zA-Z0-9]/g, '-')}`;
                const inputField = document.getElementById(inputId);
                if (inputField) {
                    inputField.value = taxon.originalName;
                }
            }
        });

        const treeLabels = d3.selectAll(".labels text");
        treeLabels.each(function (d) {
            if (d.data && d.data.name) {
                d3.select(this).text(d.data.name);
            }
        });

        alert('All custom names have been reset to original values.');
    } catch (error) {
        console.error('Error resetting custom names:', error);
        alert('Error resetting custom names');
    }
}

PhylogeneticTree.ui.components.TaxaTable = {
    renderTaxaTable,
    resetCustomNames
};
