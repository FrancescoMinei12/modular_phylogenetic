import { PhylogeneticTree } from "../../namespace-init.js";
/**
 * @function renderGenesForProduct
 * @description Renders a table with genes associated with a specific product
 * @param {Object} data - Gene data
 * @param {string} productName - Product name to filter
 * @param {HTMLElement} container - Element where the table will be inserted
 */
function renderGenesForProduct(data, productName, container) {
    const genesTable = document.createElement("table");
    genesTable.classList.add("w-full", "border-collapse");

    const thead = genesTable.createTHead();
    const headerRow = thead.insertRow();

    const familyHeader = headerRow.insertCell();
    familyHeader.textContent = "Gene Family";
    familyHeader.classList.add("text-left", "font-medium", "p-2", "border-b");

    const geneHeader = headerRow.insertCell();
    geneHeader.textContent = "Gene ID";
    geneHeader.classList.add("text-left", "font-medium", "p-2", "border-b");

    const tbody = genesTable.createTBody();
    let genesFound = false;

    Object.entries(data).forEach(([familyId, genes]) => {
        genes.forEach(gene => {
            if (gene.product === productName) {
                genesFound = true;
                const row = tbody.insertRow();

                const familyCell = row.insertCell();
                familyCell.textContent = familyId;
                familyCell.classList.add("p-2", "border-b");

                const geneCell = row.insertCell();
                geneCell.textContent = gene['locus-tag'];
                geneCell.classList.add("p-2", "border-b");
            }
        });
    });

    if (!genesFound) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = "No genes found for this product";
        cell.classList.add("text-center", "p-4", "text-gray-500");
    }

    container.appendChild(genesTable);
}

PhylogeneticTree.ui.visualization.ProductGenesRenderer = {
    renderGenesForProduct
};