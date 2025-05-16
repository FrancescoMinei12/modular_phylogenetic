import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module productTable
 * @description Module for rendering and managing the products table with search and highlighting functionality
 */
function renderProductTable(data, tableSelector) {
    const tableContainer = document.querySelector(tableSelector);
    if (!tableContainer) throw new Error(`Container element not found: ${tableSelector}`);

    tableContainer.innerHTML = "";

    if (!tableContainer.id) {
        tableContainer.id = tableSelector.replace(/[^a-zA-Z0-9]/g, '');
    }

    PhylogeneticTree.ui.visualization.SearchBar.renderSearchBar(tableSelector, `${tableSelector} table`);

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("product-table-container", "h-[400px]", "overflow-y-auto", "pr-2");

    const productTable = document.createElement("table");
    productTable.classList.add("w-full", "text-sm", "text-left", "border-collapse");

    const tableHeader = productTable.createTHead();
    const headerRow = tableHeader.insertRow();
    headerRow.classList.add("bg-gray-100");

    const sortState = {
        column: "count",
        direction: "desc",
    };

    const columns = [
        { id: "productName", label: "Product", title: "Product name" },
        { id: "count", label: "N", title: "N: Number of occurrences of the product across all genes." },
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

            const sortedProducts = getSortedProducts();

            PhylogeneticTree.ui.components.Pagination.applyPagination(
                sortedProducts,
                tableContainer.id,
                renderProductPage,
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

    tableWrapper.appendChild(productTable);
    tableContainer.appendChild(tableWrapper);

    const productCounts = countProducts(data);

    function getSortedProducts() {
        return [...productCounts].sort((a, b) => {
            const valueA = a[sortState.column];
            const valueB = b[sortState.column];

            if (typeof valueA === 'string') {
                return sortState.direction === "asc"
                    ? valueA.localeCompare(valueB)
                    : valueB.localeCompare(valueA);
            } else {
                return sortState.direction === "asc"
                    ? valueA - valueB
                    : valueB - valueA;
            }
        });
    }

    function renderProductPage(pageProducts) {
        const oldTbody = productTable.tBodies[0];
        if (oldTbody) productTable.removeChild(oldTbody);

        const tableBody = productTable.createTBody();

        pageProducts.forEach(({ productName, count, diffusivity }) => {
            const tableRow = tableBody.insertRow();
            tableRow.classList.add("clickable-row", "cursor-pointer", "odd:bg-gray-50", "hover:bg-blue-50", "transition-colors");
            tableRow.dataset.product = productName;

            const productCell = tableRow.insertCell();
            productCell.textContent = productName;
            productCell.classList.add("px-3", "py-2", "border-b");

            const countCell = tableRow.insertCell();
            countCell.textContent = count;
            countCell.classList.add("px-3", "py-2", "border-b");

            const diffusivityCell = tableRow.insertCell();
            diffusivityCell.textContent = diffusivity;
            diffusivityCell.classList.add("px-3", "py-2", "border-b");

            tableRow.addEventListener("click", function () {
                document.querySelectorAll(".clickable-row").forEach(row => {
                    row.classList.toggle("bg-yellow-100", row === this);
                });

                PhylogeneticTree.ui.interactions.highlighting.highlightProduct(data, productName);

                const detailsSection = document.getElementById("gene-details-section");
                const detailsTitle = document.getElementById("gene-details-title");
                const detailsContent = document.getElementById("gene-details-content");

                detailsTitle.textContent = `Genes with product: ${productName}`;
                detailsContent.innerHTML = "";

                PhylogeneticTree.ui.visualization.GeneRenderer.renderGenesForProduct(data, productName, detailsContent);

                detailsSection.classList.remove("hidden");
            });
        });
    }

    updateSortIndicators();

    const existingPaginationControls = tableContainer.querySelectorAll(".pagination-controls");
    existingPaginationControls.forEach(control => control.remove());

    const initialSortedProducts = getSortedProducts();

    PhylogeneticTree.ui.components.Pagination.applyPagination(
        initialSortedProducts,
        tableContainer.id,
        renderProductPage,
        { itemsPerPage: 25 }
    );
}

function countProducts(data) {
    const productMap = new Map();

    Object.keys(data).forEach(familyKey => {
        const genes = data[familyKey];
        genes.forEach(gene => {
            const productName = gene.product;
            const genomeName = gene["genome-name"];

            if (!productMap.has(productName)) {
                productMap.set(productName, { count: 0, genomes: new Set() });
            }

            const productData = productMap.get(productName);
            productData.count += 1;
            productData.genomes.add(genomeName);
        });
    });

    return Array.from(productMap.entries()).map(([productName, { count, genomes }]) => ({
        productName,
        count,
        diffusivity: genomes.size
    })).sort((a, b) => b.count - a.count);
}

PhylogeneticTree.ui.components.ProductTable = {
    renderProductTable
};
