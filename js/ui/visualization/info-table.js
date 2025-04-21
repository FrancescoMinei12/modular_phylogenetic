import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @function renderUnifiedTable
 * @description Renders a unified table for either gene families or products
 * @param {Object} data - The data to display (gene families or product counts)
 * @param {string} type - Type of table to render: "gene-family" or "product"
 * @param {string} containerSelector - Selector for the container to render the table in
 */
function renderUnifiedTable(data, type, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        throw new Error(`Container not found: ${containerSelector}`);
    }

    container.innerHTML = "";

    PhylogeneticTree.ui.visualization.SearchBar.renderSearchBar(containerSelector, `${containerSelector} table`);

    const wrapper = document.createElement("div");
    wrapper.className = "table-container h-[400px] overflow-y-auto pr-2";

    const table = document.createElement("table");
    table.className = "w-full border-collapse";

    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    const mainHeader = headerRow.insertCell();
    mainHeader.textContent = type === "gene-family" ? "Gene Family" : "Product";
    mainHeader.className = "text-left font-medium p-2 border-b";

    const countHeader = headerRow.insertCell();
    countHeader.textContent = "N°";
    countHeader.className = "text-left font-medium p-2 border-b";

    const tbody = table.createTBody();

    let entries = [];

    if (type === "gene-family") {
        entries = Object.entries(data).sort((a, b) => b[1].length - a[1].length);
    } else if (type === "product") {
        entries = countProducts(data);
    }

    entries.forEach(([key, value]) => {
        const row = tbody.insertRow();
        row.classList.add("clickable-row");
        row.style.cursor = "pointer";
        row.dataset[type] = key;

        const keyCell = row.insertCell();
        keyCell.textContent = key;
        keyCell.className = "p-2 border-b";

        const countCell = row.insertCell();
        countCell.textContent = type === "gene-family" ? value.length : value;
        countCell.className = "p-2 border-b";

        row.addEventListener("click", function () {
            document.querySelectorAll(".clickable-row").forEach(r => {
                r.classList.toggle("highlighted", r === this);
            });

            const detailSection = document.getElementById("gene-details-section");
            const detailTitle = document.getElementById("gene-details-title");
            const detailContent = document.getElementById("gene-details-content");

            if (type === "gene-family") {
                detailTitle.textContent = `Genes in Family: ${key}`;
                detailContent.innerHTML = "";
                PhylogeneticTree.ui.visualization.GeneRenderer.renderGenesForFamily(data, key, detailContent);
                PhylogeneticTree.ui.interactions.highlightning.highlightGeneFamily(data, key);
            } else if (type === "product") {
                detailTitle.textContent = `Genes with product: ${key}`;
                detailContent.innerHTML = "";
                PhylogeneticTree.ui.visualization.ProductGenesRenderer.renderGenesForProduct(data, key, detailContent);
                PhylogeneticTree.ui.interactions.highlightning.highlightProduct(data, key);
            }

            detailSection.classList.remove("hidden");
            detailSection.scrollIntoView({ behavior: "smooth" });
        });
    });

    wrapper.appendChild(table);
    container.appendChild(wrapper);

    if (!document.getElementById("gene-details-section")) {
        const detailSection = document.createElement("div");
        detailSection.id = "gene-details-section";
        detailSection.className = "mt-4 bg-white p-4 rounded-lg shadow-md hidden";

        const detailTitle = document.createElement("h3");
        detailTitle.id = "gene-details-title";
        detailTitle.className = "text-xl font-semibold mb-4";
        detailSection.appendChild(detailTitle);

        const detailContent = document.createElement("div");
        detailContent.id = "gene-details-content";
        detailSection.appendChild(detailContent);

        container.appendChild(detailSection);
    }
}

/**
 * @function countProducts
 * @description Helper function to count product occurrences
 * @param {Object} data - Raw gene family data
 * @returns {Array} Sorted array of [product, count] pairs
 */
function countProducts(data) {
    const productMap = new Map();
    Object.values(data).flat().forEach(gene => {
        const product = gene.product || "Unknown";
        productMap.set(product, (productMap.get(product) || 0) + 1);
    });

    return Array.from(productMap.entries()).sort((a, b) => b[1] - a[1]);
}

PhylogeneticTree.ui.components.UnifiedTable = {
    renderUnifiedTable
};
