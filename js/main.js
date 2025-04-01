import { parseNewick } from "./core/newickParser.js";
import { dataStore } from "./core/dataStore.js";
import { renderTree } from "./visualization/treeRenderer.js";
import { renderTaxaTable } from "./ui/taxaTable.js";

document.addEventListener("DOMContentLoaded", () => {
    fetch("../albero_nj.newick")
        .then(response => response.text())
        .then(newickData => {
            const treeData = parseNewick(newickData);
            dataStore.setTreeData(treeData);
            renderTree(treeData, "#tree-container");
            fetch("../albero_nj.json")  // Modifica questo percorso in base alla posizione del tuo file JSON
                .then(response => response.json())  // Convertiamo il JSON in un oggetto JavaScript
                .then(jsonData => {
                    renderTaxaTable(jsonData, "#taxa-scrollable");  // Passa i dati JSON alla funzione che renderizzerà la tabella
                })
                .catch(error => {
                    console.error("Errore nel caricamento del file JSON: ", error);
                });
        });
});