import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module geneFamilyTable
 * @description Module for rendering and handling gene family tables with search and highlighting
 */
function renderGeneFamilyTable(data, tableSelector) {
    const tableContainer = document.querySelector(tableSelector);
    if (!tableContainer) throw new Error(`Container element not found: ${tableSelector}`);

    tableContainer.innerHTML = "";

    if (!tableContainer.id) {
        tableContainer.id = tableSelector.replace(/[^a-zA-Z0-9]/g, '');
    }

    PhylogeneticTree.ui.visualization.SearchBar.renderSearchBar(tableSelector, `${tableSelector} table`);

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("gene-family-table-container", "h-[400px]", "overflow-y-auto", "pr-2");

    const familyTable = document.createElement("table");
    familyTable.classList.add("w-full", "text-sm", "text-left", "border-collapse");

    const tableHeader = familyTable.createTHead();
    const headerRow = tableHeader.insertRow();
    headerRow.classList.add("bg-gray-100");

    const familyHeaderCell = headerRow.insertCell();
    familyHeaderCell.textContent = "Gene Family";
    familyHeaderCell.classList.add("px-3", "py-2", "font-semibold", "border-b");

    const countHeaderCell = headerRow.insertCell();
    countHeaderCell.textContent = "N";
    countHeaderCell.classList.add("px-3", "py-2", "font-semibold", "border-b");

    const diffusivityHeaderCell = headerRow.insertCell();
    diffusivityHeaderCell.textContent = "D";
    diffusivityHeaderCell.classList.add("px-3", "py-2", "font-semibold", "border-b");

    tableWrapper.appendChild(familyTable);
    tableContainer.appendChild(tableWrapper);

    const familyMap = extractFamilies(data);
    const sortedFamilies = Object.entries(familyMap).sort(([, a], [, b]) => b.length - a.length);

    function renderFamilyPage(pageFamilies) {
        const oldTbody = familyTable.tBodies[0];
        if (oldTbody) familyTable.removeChild(oldTbody);

        const tableBody = familyTable.createTBody();

        pageFamilies.forEach(([familyId, genes]) => {
            const tableRow = tableBody.insertRow();
            tableRow.classList.add("clickable-row", "cursor-pointer", "odd:bg-gray-50", "hover:bg-blue-50", "transition-colors");
            tableRow.dataset.family = familyId;

            const familyCell = tableRow.insertCell();
            familyCell.textContent = familyId;
            familyCell.classList.add("px-3", "py-2", "border-b");

            const countCell = tableRow.insertCell();
            countCell.textContent = genes.length;
            countCell.classList.add("px-3", "py-2", "border-b");

            const diffusivity = PhylogeneticTree.core.utilities.GeneFamilyStats.getFamilyDiffusivity(familyId, data);
            const diffusivityCell = tableRow.insertCell();
            diffusivityCell.textContent = diffusivity;
            diffusivityCell.classList.add("px-3", "py-2", "border-b");

            tableRow.addEventListener("click", function () {
                document.querySelectorAll(".clickable-row").forEach(row => {
                    row.classList.toggle("bg-yellow-100", row === this);
                });

                PhylogeneticTree.ui.interactions.highlighting.highlightGeneFamily(data, familyId);

                const detailsSection = document.getElementById("gene-details-section");
                const detailsContent = document.getElementById("gene-details-content");

                detailsContent.innerHTML = "";

                PhylogeneticTree.ui.visualization.GeneRenderer.renderGenesForFamily(data, familyId, detailsContent);

                detailsSection.classList.remove("hidden");
                // detailsSection.scrollIntoView({ behavior: "smooth" });
            });
        });
    }

    PhylogeneticTree.ui.components.Pagination.applyPagination(
        sortedFamilies,
        tableContainer.id,
        renderFamilyPage,
        { itemsPerPage: 25 }
    );
}

function extractFamilies(data) {
    const families = {};

    Object.entries(data).forEach(([familyId, genes]) => {
        if (!families[familyId]) {
            families[familyId] = new Set();
        }
        genes.forEach(gene => families[familyId].add(gene));
    });
    const result = {};
    Object.keys(families).forEach(familyId => {
        result[familyId] = Array.from(families[familyId]);
    });

    return result;
}

PhylogeneticTree.ui.components.GeneFamilyTable = {
    renderGeneFamilyTable
};
