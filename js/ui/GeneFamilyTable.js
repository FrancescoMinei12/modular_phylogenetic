import { highlightGeneFamily } from "./highlightning.js";
import { renderSearchBar } from "../visualization/searchBarRenderer.js";

/**
 * @module GeneFamilyTable
 * @description Module for rendering and handling gene family tables
 */

/**
 * @function renderGeneFamilyTable
 * @description Renders a table displaying gene families with search functionality
 * @param {Object} data - The gene family data to render
 * @param {string} container - CSS selector for the container element
 */
export function renderGeneFamilyTable(data, container) {
    try {
        const tableContainer = document.querySelector(container);
        if (!tableContainer) {
            throw new Error(`Container element not found: ${container}`);
        }

        tableContainer.innerHTML = "";

        const tableWrapper = document.createElement("div");
        tableWrapper.classList.add("taxa-table-container");

        try {
            renderSearchBar(container, `${container} table`);
        } catch (error) {
            console.error("Error rendering search bar:", error);
        }

        const table = document.createElement("table");
        table.classList.add("gene-family-table");

        const header = table.createTHead();
        const headerRow = header.insertRow();
        const familyHeaderCell = document.createElement("th");
        familyHeaderCell.textContent = "Family";
        headerRow.appendChild(familyHeaderCell);

        const tbody = table.createTBody();

        const familyList = extractFamilies(data);

        familyList.forEach(familyId => {
            try {
                const row = tbody.insertRow();
                row.classList.add("clickable-row");
                row.style.cursor = "pointer";
                row.dataset.family = familyId;

                const familyCell = row.insertCell();
                familyCell.textContent = familyId;

                row.addEventListener("click", function () {
                    try {
                        highlightGeneFamily(data, familyId);
                    } catch (error) {
                        console.error(`Error highlighting gene family "${familyId}":`, error);
                    }
                });
            } catch (error) {
                console.error(`Error creating row for family "${familyId}":`, error);
            }
        });

        tableWrapper.appendChild(table);
        tableContainer.appendChild(tableWrapper);
    } catch (error) {
        console.error("Critical error in gene family table rendering:", error);
    }
}

/**
 * @function extractFamilies
 * @description Extracts family IDs from the data and sorts them alphabetically
 * @param {Object} data - The gene family data
 * @returns {string[]} Array of sorted family IDs
 * @private
 */
function extractFamilies(data) {
    try {
        const familyList = Object.keys(data);
        familyList.sort((a, b) => a.localeCompare(b));

        return familyList;
    } catch (error) {
        console.error("Error extracting families from data:", error);
        return [];
    }
}