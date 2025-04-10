import { renderSearchBar } from "../visualization/search-bar.js";
import { highlightGeneFamily } from "../interactions/highlightning.js";

/**
 * @module geneFamilyTable
 * @description Module for rendering and handling gene family tables with search and highlighting
 */

/**
 * @function renderGeneFamilyTable
 * @description Renders a table displaying gene families with search functionality
 * @param {Object} data - The gene family data to render
 * @param {string} containerSelector - CSS selector for the container element
 */
export function renderGeneFamilyTable(data, containerSelector) {
    const tableContainer = document.querySelector(containerSelector);
    if (!tableContainer) {
        throw new Error(`Container element not found: ${containerSelector}`);
    }

    tableContainer.innerHTML = "";

    renderSearchBar(containerSelector, `${containerSelector} table`);

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("gene-family-table-container", "h-[400px]", "overflow-y-auto", "pr-2");

    const familyTable = document.createElement("table");
    familyTable.classList.add("gene-family-table");

    const tableHeader = familyTable.createTHead();
    const headerRow = tableHeader.insertRow();

    const headerCell = headerRow.insertCell();
    headerCell.textContent = "Gene Family";

    const tableBody = familyTable.createTBody();
    const familyList = extractFamilies(data);

    familyList.forEach(familyId => {
        const tableRow = tableBody.insertRow();
        tableRow.classList.add("clickable-row");
        tableRow.style.cursor = "pointer";
        tableRow.dataset.family = familyId;

        const familyCell = tableRow.insertCell();
        familyCell.textContent = familyId;

        /**
         * @event click
         * @description Highlights the selected gene family
         */
        tableRow.addEventListener("click", function () {
            this.classList.toggle("highlighted");
            highlightGeneFamily(data, familyId);
        });
    });

    tableWrapper.appendChild(familyTable);
    tableContainer.appendChild(tableWrapper);
}

/**
 * @function extractFamilies
 * @description Extracts and sorts gene family IDs alphabetically
 * @param {Object} data - The gene family data
 * @returns {string[]} Sorted array of family IDs
 * @private
 */
function extractFamilies(data) {
    return Object.keys(data).sort((a, b) => a.localeCompare(b));
}
