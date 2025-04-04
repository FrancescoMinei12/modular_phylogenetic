import { parseNewick } from "./core/newickParser2.js";
import { dataStore } from "./core/dataStore.js";
import { renderTree } from "./visualization/treeRenderer.js";
import { renderTaxaTable } from "./ui/taxaTable.js";
import { renderGeneFamilyTable } from "./ui/GeneFamilyTable.js";

document.addEventListener("DOMContentLoaded", () => {
    fetch("../albero_nj.newick")
        .then(response => response.text())
        .then(newickData => {
            const treeData = parseNewick(newickData);
            dataStore.setTreeData(treeData);
            renderTree(treeData, "#tree-container");
            fetch("../albero_nj.json")
                .then(response => response.json())
                .then(jsonData => {
                    renderTaxaTable(jsonData, "#taxa-scrollable");

                    // Carica i dati delle famiglie geniche e passa sia i dati che il selettore
                    fetch("../extracted_data.json")
                        .then(response => response.json())
                        .then(familyData => {
                            renderGeneFamilyTable(familyData, "#famiglie-tab");
                        })
                        .catch(error => {
                            console.error("Errore nel caricamento dei dati delle famiglie geniche:", error);
                        });
                })
                .catch(error => {
                    console.error("Errore nel caricamento del file JSON: ", error);
                });
        });
});