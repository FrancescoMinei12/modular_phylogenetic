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

    const nameHeaderCell = headerRow.insertCell();
    nameHeaderCell.textContent = "Product";
    nameHeaderCell.classList.add("px-3", "py-2", "font-semibold", "border-b");

    const countHeaderCell = headerRow.insertCell();
    countHeaderCell.textContent = "N°";
    countHeaderCell.classList.add("px-3", "py-2", "font-semibold", "border-b");

    tableWrapper.appendChild(productTable);
    tableContainer.appendChild(tableWrapper);

    const productCounts = countProducts(data);

    function renderProductPage(pageProducts) {
        const oldTbody = productTable.tBodies[0];
        if (oldTbody) productTable.removeChild(oldTbody);

        const tableBody = productTable.createTBody();

        pageProducts.forEach(([productName, occurrenceCount]) => {
            const tableRow = tableBody.insertRow();
            tableRow.classList.add("clickable-row", "cursor-pointer", "odd:bg-gray-50", "hover:bg-blue-50", "transition-colors");
            tableRow.dataset.product = productName;

            const productCell = tableRow.insertCell();
            productCell.textContent = productName;
            productCell.classList.add("px-3", "py-2", "border-b");

            const countCell = tableRow.insertCell();
            countCell.textContent = occurrenceCount;
            countCell.classList.add("px-3", "py-2", "border-b");

            tableRow.addEventListener("click", function () {
                document.querySelectorAll(".clickable-row").forEach(row => {
                    row.classList.toggle("bg-yellow-100", row === this);
                });

                PhylogeneticTree.ui.interactions.highlightning.highlightProduct(data, productName);

                const detailsSection = document.getElementById("gene-details-section");
                const detailsTitle = document.getElementById("gene-details-title");
                const detailsContent = document.getElementById("gene-details-content");

                detailsTitle.textContent = `Genes with product: ${productName}`;
                detailsContent.innerHTML = "";

                PhylogeneticTree.ui.visualization.GeneRenderer.renderGenesForProduct(data, productName, detailsContent);

                detailsSection.classList.remove("hidden");
                detailsSection.scrollIntoView({ behavior: "smooth" });
            });
        });
    }

    PhylogeneticTree.ui.components.Pagination.applyPagination(
        productCounts,
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
            productMap.set(productName, (productMap.get(productName) || 0) + 1);
        });
    });

    return Array.from(productMap.entries()).sort((a, b) => b[1] - a[1]);
}

PhylogeneticTree.ui.components.ProductTable = {
    renderProductTable
};
