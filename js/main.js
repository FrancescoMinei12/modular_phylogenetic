import { PhylogeneticTree } from "./namespace-init.js";

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const newickText = await fetch("../assets/albero_nj.newick").then(res => res.text());
        const treeData = PhylogeneticTree.core.parser.parseNewick2(newickText);

        PhylogeneticTree.ui.visualization.TreeRenderer.renderTree(treeData, "#tree-container");

        const taxonomyData = await fetch("../assets/albero_nj.json").then(res => res.json());
        PhylogeneticTree.ui.components.TaxaTable.renderTaxaTable(taxonomyData, "#taxa-tab");

        const geneData = await fetch("../assets/extracted_data.json").then(res => res.json());

        PhylogeneticTree.ui.components.Tabs.setGeneData(geneData);
    } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
    }
});