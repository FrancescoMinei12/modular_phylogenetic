import { extractTaxa } from "../../core/taxonomy/taxon-extractor.js";
import { applyCustomNames } from "../../core/taxonomy/custom-name-manager.js";
import { loadCustomNamesFromFile } from "../../core/io/file-io.js";
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
export function renderTaxaTable(treeData, tableSelector) {
    const tableContainer = document.querySelector(tableSelector);
    if (!tableContainer) {
        throw new Error(`Container element not found: ${tableSelector}`);
    }

    loadCustomNamesFromFile(treeData, tableSelector);

    tableContainer.innerHTML = "";

    renderSearchBar(tableSelector, `${tableSelector} table`);

    const importContainer = document.createElement("div");
    importContainer.classList.add("mb-3", "flex", "justify-end", "gap-2");

    const importButton = document.createElement("button");
    importButton.textContent = "Importa nomi personalizzati";
    importButton.classList.add("px-3", "py-1", "bg-blue-500", "text-white", "rounded", "text-sm", "hover:bg-blue-600");
    importButton.addEventListener("click", () => importCustomNames(treeData, tableSelector));

    const saveButton = document.createElement("button");
    saveButton.textContent = "Salva nomi su file";
    saveButton.classList.add("px-3", "py-1", "bg-purple-500", "text-white", "rounded", "text-sm", "hover:bg-purple-600");
    saveButton.addEventListener("click", () => saveCustomNamesToFile(treeData));

    importContainer.appendChild(importButton);
    importContainer.appendChild(saveButton);
    tableContainer.appendChild(importContainer);

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("taxa-table-container", "h-[400px]", "overflow-y-auto", "pr-2");

    const taxaTable = document.createElement("table");
    taxaTable.classList.add("taxa-table", "w-full");

    const tableHeader = taxaTable.createTHead();
    const headerRow = tableHeader.insertRow();

    const nameHeaderCell = headerRow.insertCell();
    nameHeaderCell.textContent = "Taxon";

    const editHeaderCell = headerRow.insertCell();
    editHeaderCell.textContent = "Nome personalizzato";

    const taxa = extractTaxa(treeData);
    const tableBody = taxaTable.createTBody();

    taxa.forEach(taxon => {
        const tableRow = tableBody.insertRow();
        tableRow.classList.add("clickable-row");
        tableRow.style.cursor = "pointer";
        tableRow.dataset.taxon = taxon.originalName;

        const nameCell = tableRow.insertCell();
        nameCell.textContent = taxon.name;

        const editCell = tableRow.insertCell();
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = taxon.name;
        editInput.classList.add("border", "border-gray-300", "rounded", "px-2", "py-1", "w-full", "text-sm");
        editInput.placeholder = "Inserisci nome personalizzato";

        editInput.addEventListener("change", function () {
            const newName = this.value.trim();
            if (newName) {
                nameCell.textContent = newName;

                tableRow.dataset.customName = newName;

                updateTaxonDisplayName(taxon.originalName, newName);
            } else {
                this.value = taxon.name;
            }
        });

        editInput.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        editCell.appendChild(editInput);

        /**
         * @event click
         * @description Highlights the selected taxon and its path on the tree
         */
        tableRow.addEventListener("click", function () {
            this.classList.toggle("highlighted");
            highlightPathAndLabel(taxon.originalName);
        });
    });

    tableWrapper.appendChild(taxaTable);
    tableContainer.appendChild(tableWrapper);
}