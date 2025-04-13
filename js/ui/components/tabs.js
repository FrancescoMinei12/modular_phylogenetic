import { PhylogeneticTree } from "../../namespace-init.js";
/**
 * @module tabs
 * @description Module for managing tab navigation in the user interface
 */

let geneData;

function setGeneData(data) {
    geneData = data;
}

/**
 * @function showTab
 * @description Changes the active tab by hiding all tab content and showing only the selected one
 * @param {string} tabName - The name identifier of the tab to display
 */
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    document.getElementById(`${tabName}-tab`).classList.remove('hidden');

    document.querySelectorAll('[id^="tab-"]').forEach(tab => {
        tab.classList.remove('text-blue-600', 'border-b-2', 'border-blue-500');
        tab.classList.add('text-gray-600');
    });
    document.getElementById(`tab-${tabName}`).classList.add('text-blue-600', 'border-b-2', 'border-blue-500');

    document.getElementById("gene-details-section").classList.add("hidden");

    if (PhylogeneticTree.ui.interactions &&
        PhylogeneticTree.ui.interactions.highlightning &&
        typeof PhylogeneticTree.ui.interactions.highlightning.resetHighlights === 'function') {
        PhylogeneticTree.ui.interactions.highlightning.resetHighlights();
    }

    if (tabName === 'product') {
        PhylogeneticTree.ui.components.ProductTable.renderProductTable(geneData, "#product-tab");
    } else if (tabName === 'famiglie') {
        PhylogeneticTree.ui.components.GeneFamilyTable.renderGeneFamilyTable(geneData, "#famiglie-tab");
    }

}

window.showTab = showTab;

showTab('taxa');

PhylogeneticTree.ui.components.Tabs = {
    setGeneData
};