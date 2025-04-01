import { highlightPathAndLabel } from "./highlightning.js";

export function renderTaxaTable(treeData, tableSelector) {
    console.log("Inizio rendering della tabella dei taxa...");
    const tableContainer = document.querySelector(tableSelector);
    tableContainer.innerHTML = "";

    const table = document.createElement("table");
    table.classList.add("taxa-table");

    console.log("Creazione intestazioni della tabella...");
    const header = table.createTHead();
    const headerRow = header.insertRow();
    headerRow.innerHTML = "<th>Taxon</th><th>Dettagli</th>";

    console.log("Estrazione dei taxa dall'albero...");
    const taxa = extractTaxa(treeData);
    console.log("Taxa estratti:", taxa);

    taxa.forEach(taxon => {
        console.log("Aggiunta riga per il taxon:", taxon);

        const row = table.insertRow();
        row.classList.add("clickable-row");
        row.dataset.taxon = taxon.originalName;

        const nameCell = row.insertCell();
        nameCell.textContent = taxon.name;

        const buttonCell = row.insertCell();
        const button = document.createElement("button");
        button.textContent = "Mostra";
        button.classList.add("btn", "btn-sm", "btn-outline-primary");

        row.addEventListener("click", function () {
            const isHighlighted = this.classList.toggle("highlighted");

            if (!isHighlighted) {
                highlightPathAndLabel(taxon.originalName);
            } else {
                highlightPathAndLabel(taxon.originalName);
            }
        });

        button.addEventListener("click", () => {
            console.log(`Cliccato sul pulsante del taxon: ${taxon.originalName}`);
            highlightPathAndLabel(taxon.originalName);
        });

        buttonCell.appendChild(button);
    });

    console.log("Aggiunta della tabella al contenitore...");
    tableContainer.appendChild(table);
    console.log("Rendering della tabella completato.");
}

function extractTaxa(treeData) {
    const taxa = [];
    console.log("[DEBUG] Albero in input:", treeData);

    function traverse(node) {
        console.log(`[DEBUG] Visitando nodo: ${node.name || 'root'}`);

        // Controlla se è un nodo foglia GCA
        if (node.name && node.name.startsWith("GCA")) {
            console.log(`[DEBUG] Trovato taxon: ${node.name}`);
            taxa.push({
                name: node.name.replace(/_/g, " "),
                originalName: node.name
            });
        }

        // Cerca nei children invece che in branchset
        if (node.children && node.children.length > 0) {
            console.log(`[DEBUG] Visitando ${node.children.length} figli di ${node.name}`);
            node.children.forEach(child => traverse(child));
        }
    }

    traverse(treeData);
    console.log("[DEBUG] Taxa estratti:", taxa);
    return taxa;
}