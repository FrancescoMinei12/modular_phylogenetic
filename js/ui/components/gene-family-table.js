import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module geneFamilyTable
 * @description Module for rendering and handling gene family tables with search and highlighting
 */

/**
 * @function renderGeneFamilyTable
 * @description Renders a table displaying gene families and their gene counts, sorted by the number of genes
 * @param {Object} data - The gene family data to render
 * @param {string} tableSelector - CSS selector for the container element
 */
function renderGeneFamilyTable(data, tableSelector) {
    const tableContainer = document.querySelector(tableSelector);
    if (!tableContainer) {
        throw new Error(`Container element not found: ${tableSelector}`);
    }

    tableContainer.innerHTML = "";

    PhylogeneticTree.ui.visualization.SearchBar.renderSearchBar(tableSelector, `${tableSelector} table`);

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("gene-family-table-container", "h-[400px]", "overflow-y-auto", "pr-2");

    const familyTable = document.createElement("table");
    familyTable.classList.add("gene-family-table");

    const tableHeader = familyTable.createTHead();
    const headerRow = tableHeader.insertRow();

    const familyHeaderCell = headerRow.insertCell();
    familyHeaderCell.textContent = "Gene Family";

    const countHeaderCell = headerRow.insertCell();
    countHeaderCell.textContent = "N°";

    const familyMap = extractFamilies(data);
    const sortedFamilies = Object.entries(familyMap).sort(([, genesA], [, genesB]) => genesB.length - genesA.length);

    const tableBody = familyTable.createTBody();

    sortedFamilies.forEach(([familyId, genes]) => {
        const tableRow = tableBody.insertRow();
        tableRow.classList.add("clickable-row");
        tableRow.style.cursor = "pointer";

        tableRow.dataset.family = familyId;

        const familyCell = tableRow.insertCell();
        familyCell.textContent = familyId;

        const countCell = tableRow.insertCell();
        countCell.textContent = genes.length;

        /**
         * @event click
         * @description Highlights the selected gene family and renders its genes
         */
        tableRow.addEventListener("click", function () {
            document.querySelectorAll(".clickable-row").forEach(row => {
                row.classList.toggle("highlighted", row === this);
            });

            PhylogeneticTree.ui.interactions.highlightning.highlightGeneFamily(data, familyId);

            const detailsSection = document.getElementById("gene-details-section");
            const detailsTitle = document.getElementById("gene-details-title");
            const detailsContent = document.getElementById("gene-details-content");

            detailsTitle.textContent = `Genes in family product: ${familyId}`;
            detailsContent.innerHTML = "";

            PhylogeneticTree.ui.visualization.GeneRenderer.renderGenesForFamily(data, familyId, detailsContent);

            detailsSection.classList.remove("hidden");
            detailsSection.scrollIntoView({ behavior: "smooth" });
        });
    });

    tableWrapper.appendChild(familyTable);
    tableContainer.appendChild(tableWrapper);
}

/**
 * @function extractFamilies
 * @description Extracts gene families and maps them to their associated genes
 * @param {Object} data - The gene family data
 * @returns {Object} An object where keys are family IDs and values are arrays of genes
 * @private
 */
function extractFamilies(data) {
    const families = {};

    Object.entries(data).forEach(([familyId, genes]) => {
        const familyKey = familyId;

        if (!families[familyKey]) {
            families[familyKey] = [];
        }

        families[familyKey].push(...genes);
    });

    return families;
}

PhylogeneticTree.ui.components.GeneFamilyTable = {
    renderGeneFamilyTable
};