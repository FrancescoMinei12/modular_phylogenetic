import { parseNewick } from "./core/newickParser2.js";
import { dataStore } from "./core/dataStore.js";
import { renderTree } from "./visualization/treeRenderer.js";
import { renderTaxaTable } from "./ui/taxaTable.js";
import { renderGeneFamilyTable } from "./ui/GeneFamilyTable.js";
import { renderProductTable } from "./ui/productTable.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const newickText = await fetch("../albero_nj.newick").then(res => res.text());
        const treeData = parseNewick(newickText);
        dataStore.setTreeData(treeData);
        renderTree(treeData, "#tree-container");

        const taxonomyData = await fetch("../albero_nj.json").then(res => res.json());
        renderTaxaTable(taxonomyData, "#taxa-tab");

        const geneData = await fetch("../extracted_data.json").then(res => res.json());
        dataStore.extractedData = geneData; // Salviamo per uso futuro (es. tab switching)
        renderGeneFamilyTable(geneData, "#famiglie-tab");
        renderProductTable(geneData, "#product-tab");

    } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
    }
});

function showTab(tabName) {
    const geneData = dataStore.extractedData;
    if (!geneData) return;

    if (tabName === 'product') {
        renderProductTable(geneData, "#product-tab-content");
    } else if (tabName === 'famiglie') {
        renderGeneFamilyTable(geneData, "#famiglie-tab-content");
    }
}
