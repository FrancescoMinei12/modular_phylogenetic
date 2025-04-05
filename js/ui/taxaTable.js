import { highlightPathAndLabel } from "./highlightning.js";
import { renderSearchBar } from "../visualization/searchBarRenderer.js";

/**
 * @module taxaTable
 * @description Module for rendering taxonomic data in tabular format
 */

/**
 * @function renderTaxaTable
 * @description Renders a table of taxonomic data with search functionality
 * @param {Object} treeData - The hierarchical tree data containing taxonomic information
 * @param {string} tableSelector - CSS selector for the container element
 */
export function renderTaxaTable(treeData, tableSelector) {
    try {
        const tableContainer = document.querySelector(tableSelector);
        if (!tableContainer) {
            throw new Error(`Container element not found: ${tableSelector}`);
        }

        tableContainer.innerHTML = "";

        const tableWrapper = document.createElement("div");
        tableWrapper.classList.add("taxa-table-container");

        try {
            renderSearchBar(tableSelector, `${tableSelector} table`);
        } catch (error) {
            console.error("Error rendering search bar:", error);
        }

        const table = document.createElement("table");
        table.classList.add("taxa-table");

        const header = table.createTHead();
        const headerRow = header.insertRow();
        const headerCell = document.createElement("th");
        headerCell.textContent = "Taxon";
        headerRow.appendChild(headerCell);

        const taxa = extractTaxa(treeData);

        taxa.forEach(taxon => {
            try {
                const row = table.insertRow();
                row.classList.add("clickable-row");
                row.style.cursor = "pointer";
                row.dataset.taxon = taxon.originalName;

                const nameCell = row.insertCell();
                nameCell.textContent = taxon.name;

                row.addEventListener("click", function () {
                    try {
                        const isHighlighted = this.classList.toggle("highlighted");

                        if (!isHighlighted) {
                            highlightPathAndLabel(taxon.originalName);
                        } else {
                            highlightPathAndLabel(taxon.originalName);
                        }
                    } catch (error) {
                        console.error(`Error handling click for taxon "${taxon.name}":`, error);
                    }
                });
            } catch (error) {
                console.error(`Error creating row for taxon "${taxon.name}":`, error);
            }
        });

        tableWrapper.appendChild(table);
        tableContainer.appendChild(tableWrapper);
    } catch (error) {
        console.error("Critical error in taxa table rendering:", error);
    }
}

/**
 * @function extractTaxa
 * @description Extracts taxonomic data from the tree structure and sorts it alphabetically
 * @param {Object} treeData - The hierarchical tree data containing taxonomic information
 * @returns {Array} An array of taxa objects with name and originalName properties
 * @private
 */
function extractTaxa(treeData) {
    try {
        const taxa = [];

        function traverse(node) {
            try {
                if (node.name && node.name.startsWith("GCA")) {
                    taxa.push({
                        name: node.name.replace(/_/g, " "),
                        originalName: node.name
                    });
                }

                if (node.branchset && node.branchset.length > 0) {
                    node.branchset.forEach(child => traverse(child));
                }
            } catch (error) {
                console.error(`Error traversing node "${node?.name || 'unknown'}":`, error);
            }
        }

        traverse(treeData);
        taxa.sort((a, b) => a.name.localeCompare(b.name));
        return taxa;
    } catch (error) {
        console.error("Error extracting taxa from tree data:", error);
        return [];
    }
}
