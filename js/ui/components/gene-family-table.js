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

    const sortState = {
        column: "genes",
        direction: "desc"
    };

    const columns = [
        { id: "familyId", label: "Gene Family", title: "Gene Family" },
        { id: "genes", label: "N", title: "N: Number of occurrences of the product across all genes." },
        { id: "diffusivity", label: "D", title: "D: Diffusivity, the number of unique genomes where the product appears." }
    ];

    columns.forEach(column => {
        const headerCell = headerRow.insertCell();
        headerCell.classList.add("px-3", "py-2", "font-semibold", "border-b", "cursor-pointer");
        headerCell.title = column.title;

        const headerContent = document.createElement("div");
        headerContent.classList.add("flex", "items-center", "gap-1");

        const headerText = document.createElement("span");
        headerText.textContent = column.label;
        headerContent.appendChild(headerText);

        const sortIndicator = document.createElement("span");
        sortIndicator.classList.add("sort-indicator", "ml-1");
        sortIndicator.innerHTML = `<svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"></svg>`;
        headerContent.appendChild(sortIndicator);

        headerCell.appendChild(headerContent);

        headerCell.addEventListener("click", () => {
            if (sortState.column === column.id) {
                sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
            } else {
                sortState.column = column.id;
                sortState.direction = "desc";
            }

            updateSortIndicators();

            const existingPaginationControls = tableContainer.querySelectorAll(".pagination-controls");
            existingPaginationControls.forEach(control => control.remove());

            const sortedFamilies = getSortedFamilies();

            PhylogeneticTree.ui.components.Pagination.applyPagination(
                sortedFamilies,
                tableContainer.id,
                renderFamilyPage,
                { itemsPerPage: 25 }
            );
        });
    });

    function updateSortIndicators() {
        columns.forEach((column, index) => {
            const headerCell = headerRow.cells[index];
            const svgElement = headerCell.querySelector("svg");

            if (sortState.column === column.id) {
                svgElement.classList.remove("text-gray-300");
                svgElement.classList.add("text-gray-700");

                if (sortState.direction === "asc") {
                    svgElement.innerHTML = `
                        <path d="M8 12l4-4 4 4m0 0l-4 4-4-4"/>
                    `;
                } else {
                    svgElement.innerHTML = `
                        <path d="M8 16l4-4 4 4m0 0l-4-4-4 4"/>
                    `;
                }
            } else {
                svgElement.classList.remove("text-gray-700");
                svgElement.classList.add("text-gray-300");
                svgElement.innerHTML = `
                    <path d="M8 16l4-4 4 4m0 0l-4-4-4 4"/>
                `;
            }
        });
    }

    tableWrapper.appendChild(familyTable);
    tableContainer.appendChild(tableWrapper);

    const familyMap = extractFamilies(data);
    const familyArray = prepareDataForSorting(familyMap, data);

    function prepareDataForSorting(familyMap, data) {
        return Object.entries(familyMap).map(([familyId, genes]) => {
            const diffusivity = PhylogeneticTree.core.utilities.GeneFamilyStats.getFamilyDiffusivity(familyId, data);
            return {
                familyId,
                genes,
                diffusivity
            };
        });
    }

    function getSortedFamilies() {
        return [...familyArray].sort((a, b) => {
            let valueA, valueB;

            if (sortState.column === 'familyId') {
                valueA = a.familyId;
                valueB = b.familyId;
                return sortState.direction === "asc"
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            } else if (sortState.column === 'genes') {
                valueA = a.genes.length;
                valueB = b.genes.length;
            } else if (sortState.column === 'diffusivity') {
                valueA = a.diffusivity;
                valueB = b.diffusivity;
            }

            return sortState.direction === "asc"
                ? valueA - valueB
                : valueB - valueA;
        });
    }

    function renderFamilyPage(pageFamilies) {
        const oldTbody = familyTable.tBodies[0];
        if (oldTbody) familyTable.removeChild(oldTbody);

        const tableBody = familyTable.createTBody();

        pageFamilies.forEach((family) => {
            const tableRow = tableBody.insertRow();
            tableRow.classList.add("clickable-row", "cursor-pointer", "odd:bg-gray-50", "hover:bg-blue-50", "transition-colors");
            tableRow.dataset.family = family.familyId;

            const familyCell = tableRow.insertCell();
            familyCell.textContent = family.familyId;
            familyCell.classList.add("px-3", "py-2", "border-b");

            const countCell = tableRow.insertCell();
            countCell.textContent = family.genes.length;
            countCell.classList.add("px-3", "py-2", "border-b");

            const diffusivityCell = tableRow.insertCell();
            diffusivityCell.textContent = family.diffusivity;
            diffusivityCell.classList.add("px-3", "py-2", "border-b");

            tableRow.addEventListener("click", function () {
                document.querySelectorAll(".clickable-row").forEach(row => {
                    row.classList.toggle("bg-yellow-100", row === this);
                });

                PhylogeneticTree.ui.interactions.highlighting.highlightGeneFamily(data, family.familyId);

                const detailsSection = document.getElementById("gene-details-section");
                const detailsContent = document.getElementById("gene-details-content");

                detailsContent.innerHTML = "";

                PhylogeneticTree.ui.visualization.GeneRenderer.renderGenesForFamily(data, family.familyId, detailsContent);

                detailsSection.classList.remove("hidden");
            });
        });
    }

    updateSortIndicators();

    const existingPaginationControls = tableContainer.querySelectorAll(".pagination-controls");
    existingPaginationControls.forEach(control => control.remove());

    const initialSortedFamilies = getSortedFamilies();

    PhylogeneticTree.ui.components.Pagination.applyPagination(
        initialSortedFamilies,
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
