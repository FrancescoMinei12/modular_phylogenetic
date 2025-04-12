/**
 * @file app-init.js
 * @brief Main application initialization script
 * @description This script handles the core initialization of the phylogenetic application,
 *              including data loading, parsing, and initial rendering of components.
 */

import { PhylogeneticTree } from "./namespace-init.js";

/**
 * @brief Main application initialization function
 * @description Executes when the DOM is fully loaded. Handles the complete startup sequence:
 *              1. Loads Newick tree data
 *              2. Parses the phylogenetic tree
 *              3. Renders the tree visualization
 *              4. Loads and displays taxonomy data
 *              5. Initializes gene data for UI components
 * @listens DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const newickText = await fetch("../assets/albero_nj.newick").then(res => res.text());
        const treeData = PhylogeneticTree.core.parser.parseNewick2(newickText);

        const container = "#tree-container";

        PhylogeneticTree.ui.visualization.TreeRenderer.renderTree(treeData, container);

        PhylogeneticTree.ui.components.layoutSwitch.createToggleSwitch("#layout-switch", (isOn) => {
            const treeContainer = document.querySelector(container);
            if (treeContainer)
                treeContainer.innerHTML = "";

            if (isOn) {
                PhylogeneticTree.ui.visualization.TreeRendererHorizontal.renderTree(treeData, container);
            } else {
                PhylogeneticTree.ui.visualization.TreeRenderer.renderTree(treeData, container);
            }

            const customNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');
            if (Object.keys(customNames).length > 0) {
                PhylogeneticTree.core.taxonomy.CustomNameManager.applyCustomNames(customNames, treeData, "#taxa-tab");
            }
        });

        const taxonomyData = await fetch("../assets/albero_nj.json").then(res => res.json());
        PhylogeneticTree.ui.components.TaxaTable.renderTaxaTable(taxonomyData, "#taxa-tab");

        const geneData = await fetch("../assets/extracted_data.json").then(res => res.json());
        PhylogeneticTree.ui.components.Tabs.setGeneData(geneData);

    } catch (error) {
        console.error("Error loading application data:", error);
    }
});
