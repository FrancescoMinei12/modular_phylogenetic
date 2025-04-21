import { PhylogeneticTree } from "../../namespace-init.js";
/**
 * @function renderGenesForFamily
 * @description Renders a table displaying all genes of a specific family
 * @param {Object} data - The gene family data
 * @param {string} familyId - The ID of the selected gene family
 * @param {HTMLElement} container - Element where the table will be inserted
 */
function renderGenesForFamily(data, familyId, container) {
    console.log("Table container element:", container);
    container.innerHTML = "";

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("table-wrapper", "max-h-[400px]", "overflow-y-auto", "border", "rounded", "shadow");

    const genesTable = document.createElement("table");
    genesTable.classList.add("w-full", "border-collapse", "table-auto");

    const thead = genesTable.createTHead();
    thead.classList.add("bg-gray-100", "sticky", "top-0");
    const headerRow = thead.insertRow();

    const headers = ["Gene ID", "Product"];

    headers.forEach((headerText) => {
        const headerCell = headerRow.insertCell();
        headerCell.textContent = headerText;
        headerCell.classList.add("p-3", "border-b", "font-semibold", "text-gray-700", "text-left");
    });

    const tbody = genesTable.createTBody();
    let genesFound = false;
    let rowCount = 0;

    Object.entries(data).forEach(([currentFamilyId, genes]) => {
        if (currentFamilyId === familyId) {
            genesFound = true;
            genes.forEach(gene => {
                const row = tbody.insertRow();

                if (rowCount % 2 === 0) {
                    row.classList.add("bg-white");
                } else {
                    row.classList.add("bg-gray-50");
                }
                rowCount++;

                row.classList.add("hover:bg-blue-50", "transition-colors");

                const geneCell = row.insertCell();
                geneCell.textContent = gene["locus-tag"] || "N/A";
                geneCell.classList.add("p-3", "border-b");

                const productCell = row.insertCell();
                productCell.textContent = gene.product || "Unknown";
                productCell.classList.add("p-3", "border-b", "text-right");

                row.addEventListener("click", function () {
                    tbody.querySelectorAll("tr").forEach(r => r.classList.remove("bg-blue-100", "selected-gene"));

                    // Seleziona questa riga
                    this.classList.add("bg-blue-100", "selected-gene");

                    // Qui potresti aggiungere ulteriori azioni quando un gene viene selezionato
                    console.log("Selected gene:", gene);
                });
            });
        }
    });

    if (!genesFound) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = headers.length;
        cell.textContent = "No genes found for this family";
        cell.classList.add("text-center", "p-4", "text-gray-500");
    }

    tableWrapper.appendChild(genesTable);
    container.appendChild(tableWrapper);

    // Aggiungi note o conteggio sotto la tabella
    if (genesFound) {
        const infoText = document.createElement("div");
        infoText.classList.add("text-sm", "text-gray-500", "mt-2", "italic");
        infoText.textContent = `${rowCount} genes found in family ${familyId}`;
        container.appendChild(infoText);
    }
}

PhylogeneticTree.ui.visualization.GeneRenderer = {
    renderGenesForFamily
};
