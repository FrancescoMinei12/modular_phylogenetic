import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @function renderGenesForFamily
 * @description Renders a table displaying all genes of a specific family
 * @param {Object} data - The gene family data
 * @param {string} familyId - The ID of the selected gene family
 * @param {HTMLElement} container - Element where the table will be inserted
 */
function renderGenesForFamily(data, familyId, container) {
    if (!container) {
        console.error("Invalid container:", container);
        return;
    }

    container.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = `Genes in Family: ${familyId}`;
    title.classList.add("text-xl", "font-semibold", "mb-3");

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("table-wrapper", "max-h-[400px]", "overflow-y-auto", "border", "rounded", "shadow");

    const genesTable = document.createElement("table");
    genesTable.classList.add("w-full", "border-collapse", "table-auto");

    const thead = genesTable.createTHead();
    thead.classList.add("bg-gray-100", "sticky", "top-0");
    const headerRow = thead.insertRow();
    ["Gene ID", "Product"].forEach((text) => {
        const th = headerRow.insertCell();
        th.textContent = text;
        th.classList.add("p-3", "border-b", "font-semibold", "text-gray-700", "text-left");
    });

    const tbody = genesTable.createTBody();
    tableWrapper.appendChild(genesTable);
    container.appendChild(title);
    container.appendChild(tableWrapper);

    const genes = data[familyId] || [];

    function renderPage(genesPage) {
        tbody.innerHTML = "";
        genesPage.forEach((gene, index) => {
            const row = tbody.insertRow();
            row.classList.add(
                index % 2 === 0 ? "bg-white" : "bg-gray-50",
                "hover:bg-blue-50",
                "transition-colors"
            );

            const geneCell = row.insertCell();
            geneCell.textContent = gene["locus-tag"] || "Unknown";
            geneCell.classList.add("p-3", "border-b");

            const productCell = row.insertCell();
            productCell.textContent = gene.product || "Unknown";
            productCell.classList.add("p-3", "border-b");

            row.addEventListener("click", () => {
                tbody.querySelectorAll("tr").forEach(r => r.classList.remove("bg-blue-100", "selected-gene"));
                row.classList.add("bg-blue-100", "selected-gene");
            });
        });
    }

    if (genes.length > 0) {
        PhylogeneticTree.ui.components.Pagination.applyPagination(
            genes,
            container.id || `genes-family-${familyId}`,
            renderPage,
            { itemsPerPage: 20 }
        );

        const info = document.createElement("div");
        info.textContent = `${genes.length} gene${genes.length === 1 ? "" : "s"} found in family: ${familyId}`;
        info.classList.add("text-sm", "text-gray-500", "mt-2", "italic");
        container.appendChild(info);
    } else {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = "No genes found for this family";
        cell.classList.add("text-center", "p-4", "text-gray-500");
    }
}


/**
 * @function renderGenesForProduct
 * @description Renders a table with genes associated with a specific product
 * @param {Object} data - Gene data
 * @param {string} productName - Product name to filter
 * @param {HTMLElement} container - Element where the table will be inserted
 */
function renderGenesForProduct(data, productName, container) {
    if (!container) {
        console.error("Invalid container:", container);
        return;
    }

    container.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = `Genes with product: ${productName}`;
    title.classList.add("text-xl", "font-semibold", "mb-3");

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("table-wrapper", "max-h-[400px]", "overflow-y-auto", "border", "rounded", "shadow");

    const genesTable = document.createElement("table");
    genesTable.classList.add("w-full", "border-collapse", "table-auto");

    const thead = genesTable.createTHead();
    thead.classList.add("bg-gray-100", "sticky", "top-0");
    const headerRow = thead.insertRow();
    ["Gene Family", "Gene ID"].forEach((text) => {
        const th = headerRow.insertCell();
        th.textContent = text;
        th.classList.add("p-3", "border-b", "font-semibold", "text-gray-700", "text-left");
    });

    const tbody = genesTable.createTBody();
    tableWrapper.appendChild(genesTable);
    container.appendChild(tableWrapper);

    const matchingGenes = [];
    Object.entries(data).forEach(([familyId, genes]) => {
        genes.forEach(gene => {
            if (gene.product === productName) {
                matchingGenes.push({ familyId, ...gene });
            }
        });
    });

    function renderPage(genesPage) {
        tbody.innerHTML = "";
        genesPage.forEach((gene, index) => {
            const row = tbody.insertRow();
            row.classList.add(
                index % 2 === 0 ? "bg-white" : "bg-gray-50",
                "hover:bg-blue-50",
                "transition-colors"
            );

            const familyCell = row.insertCell();
            familyCell.textContent = gene.familyId;
            familyCell.classList.add("p-3", "border-b");

            const geneCell = row.insertCell();
            geneCell.textContent = gene["locus-tag"] || "Unknown";
            geneCell.classList.add("p-3", "border-b");

            row.addEventListener("click", () => {
                tbody.querySelectorAll("tr").forEach(r => r.classList.remove("bg-blue-100", "selected-gene"));
                row.classList.add("bg-blue-100", "selected-gene");
            });
        });
    }

    if (matchingGenes.length > 0) {
        PhylogeneticTree.ui.components.Pagination.applyPagination(
            matchingGenes,
            container.id || `genes-product-${productName.replace(/\s+/g, '-')}`,
            renderPage,
            { itemsPerPage: 20 }
        );

        const info = document.createElement("div");
        info.textContent = `${matchingGenes.length} gene${matchingGenes.length === 1 ? "" : "s"} found with product: ${productName}`;
        info.classList.add("text-sm", "text-gray-500", "mt-2", "italic");
        container.appendChild(info);
    } else {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = "No genes found for this product";
        cell.classList.add("text-center", "p-4", "text-gray-500");
    }
}

PhylogeneticTree.ui.visualization.GeneRenderer = {
    renderGenesForFamily,
    renderGenesForProduct
};
