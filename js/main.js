import { parseNewick } from "./core/parser/newickParser2.js";
import { renderTree } from "./ui/visualization/tree-renderer.js";
import { renderTaxaTable } from "./ui/components/taxa-table.js";
import { setGeneData } from "./ui/components/tabs.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const newickText = await fetch("../assets/albero_nj.newick").then(res => res.text());
        const treeData = parseNewick(newickText);

        renderTree(treeData, "#tree-container");

        const taxonomyData = await fetch("../assets/albero_nj.json").then(res => res.json());
        renderTaxaTable(taxonomyData, "#taxa-tab");

        const geneData = await fetch("../assets/extracted_data.json").then(res => res.json());

        setGeneData(geneData);
    } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
    }
});