import { renderSearchBar } from "../visualization/searchBarRenderer.js";
import { highlightPathAndLabel } from "./highlightning.js";

/**
 * @module taxaTable
 * @description Module for rendering taxonomic data in tabular format with search and highlighting
 */

/**
 * @function renderTaxaTable
 * @description Renders a table of taxonomic data with search functionality
 * @param {Object} treeData - The hierarchical tree data containing taxonomic information
 * @param {string} tableSelector - CSS selector for the container element
 */
export function renderTaxaTable(treeData, tableSelector) {
    const tableContainer = document.querySelector(tableSelector);
    if (!tableContainer) {
        throw new Error(`Container element not found: ${tableSelector}`);
    }

    tableContainer.innerHTML = "";

    renderSearchBar(tableSelector, `${tableSelector} table`);

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("taxa-table-container", "h-[400px]", "overflow-y-auto", "pr-2");

    const taxaTable = document.createElement("table");
    taxaTable.classList.add("taxa-table", "w-full");

    const tableHeader = taxaTable.createTHead();
    const headerRow = tableHeader.insertRow();

    const nameHeaderCell = headerRow.insertCell();
    nameHeaderCell.textContent = "Taxon";

    // Aggiunta header colonna per modifica nome
    const editHeaderCell = headerRow.insertCell();
    editHeaderCell.textContent = "Nome personalizzato";

    const taxa = extractTaxa(treeData);
    const tableBody = taxaTable.createTBody();

    taxa.forEach(taxon => {
        const tableRow = tableBody.insertRow();
        tableRow.classList.add("clickable-row");
        tableRow.style.cursor = "pointer";
        tableRow.dataset.taxon = taxon.originalName;

        const nameCell = tableRow.insertCell();
        nameCell.textContent = taxon.name;

        // Aggiunta campo di input per il nome personalizzato
        const editCell = tableRow.insertCell();
        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = taxon.name; // Inizializza con il nome corrente
        editInput.classList.add("border", "border-gray-300", "rounded", "px-2", "py-1", "w-full", "text-sm");
        editInput.placeholder = "Inserisci nome personalizzato";

        // Aggiungi l'evento per gestire il cambio di nome
        editInput.addEventListener("change", function () {
            const newName = this.value.trim();
            if (newName) {
                // Aggiorna il nome visualizzato nella cella
                nameCell.textContent = newName;

                // Salva il nome personalizzato in un attributo per reference
                tableRow.dataset.customName = newName;

                // Aggiorna il sistema di visualizzazione del nome (se necessario)
                updateTaxonDisplayName(taxon.originalName, newName);
            } else {
                // Se il campo è vuoto, ripristina il nome originale
                this.value = taxon.name;
            }
        });

        // Impedisci che il click sul campo di input attivi l'evento di click della riga
        editInput.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        editCell.appendChild(editInput);

        /**
         * @event click
         * @description Highlights the selected taxon and its path on the tree
         */
        tableRow.addEventListener("click", function () {
            this.classList.toggle("highlighted");
            highlightPathAndLabel(taxon.originalName);
        });
    });

    tableWrapper.appendChild(taxaTable);
    tableContainer.appendChild(tableWrapper);
}

/**
 * @function extractTaxa
 * @description Extracts and alphabetically sorts taxa from tree data
 * @param {Object} treeData - The hierarchical tree data containing taxonomic information
 * @returns {Array} Array of { name, originalName } objects
 * @private
 */
function extractTaxa(treeData) {
    const taxa = [];

    function traverse(node) {
        if (node.name?.startsWith("GCA")) {
            taxa.push({
                name: node.name.replace(/_/g, " "),
                originalName: node.name
            });
        }

        node.branchset?.forEach(child => traverse(child));
    }

    try {
        traverse(treeData);
        taxa.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error extracting taxa from tree:", error);
    }

    return taxa;
}

/**
 * @function updateTaxonDisplayName
 * @description Aggiorna il nome visualizzato per un taxon in tutto il sistema
 * @param {string} originalName - Il nome originale del taxon
 * @param {string} newName - Il nuovo nome da visualizzare
 */
function updateTaxonDisplayName(originalName, newName) {
    try {
        // 1. Trova le etichette dell'albero utilizzando D3
        const treeLabels = d3.selectAll(".labels text");

        // 2. Filtra per trovare l'etichetta corrispondente al taxon originale
        treeLabels.each(function (d) {
            if (d.data && d.data.name === originalName) {
                // 3. Aggiorna il testo dell'etichetta
                d3.select(this).text(newName);
                console.log(`Aggiornato nome taxon da "${originalName}" a "${newName}"`);
            }
        });

        // 4. Salva le modifiche in localStorage
        const customNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');
        customNames[originalName] = newName;
        localStorage.setItem('customTaxonNames', JSON.stringify(customNames));
    } catch (e) {
        console.error(`Errore nell'aggiornamento del nome del taxon:`, e);
    }
}
