import { parseNewick } from "./core/parser/newickParser2.js";
import { dataStore } from "./core/dataStore.js";
import { renderTree } from "./ui/visualization/tree-renderer.js";
import { renderTaxaTable } from "./ui/components/taxa-table.js";
import { renderGeneFamilyTable } from "./ui/components/gene-family-table.js";
import { renderProductTable } from "./ui/components/product-table.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const newickText = await fetch("../assets/albero_nj.newick").then(res => res.text());
        const treeData = parseNewick(newickText);
        dataStore.setTreeData(treeData);
        renderTree(treeData, "#tree-container");

        const taxonomyData = await fetch("../assets/albero_nj.json").then(res => res.json());
        renderTaxaTable(taxonomyData, "#taxa-tab");

        const geneData = await fetch("../assets/extracted_data.json").then(res => res.json());
        dataStore.extractedData = geneData;
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
