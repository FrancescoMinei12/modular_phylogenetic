import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module tabs
 * @description Module for managing tab navigation in the user interface
 */

const TAB_CONFIG = {
    'taxa': {
        render: (data) => PhylogeneticTree.ui.components.TaxaTable.renderTaxaTable(data, "#taxa-tab"),
        initialActive: true,
        dataType: 'taxonomy'
    },
    'product': {
        render: (data) => PhylogeneticTree.ui.components.ProductTable.renderProductTable(data, "#product-tab"),
        dataType: 'gene'
    },
    'famiglie': {
        render: (data) => PhylogeneticTree.ui.components.GeneFamilyTable.renderGeneFamilyTable(data, "#famiglie-tab"),
        dataType: 'gene'
    }
};

let geneData;
let taxonomyData;
let activeTab = '';

function setGeneData(data) {
    geneData = data;
    if (activeTab && TAB_CONFIG[activeTab] && TAB_CONFIG[activeTab].dataType === 'gene') {
        TAB_CONFIG[activeTab].render(data);
    }
}

function setTaxonomyData(data) {
    taxonomyData = data;
    if (activeTab && TAB_CONFIG[activeTab] && TAB_CONFIG[activeTab].dataType === 'taxonomy') {
        TAB_CONFIG[activeTab].render(data);
    }
}

/**
 * @function showTab
 * @description Changes the active tab by hiding all tab content and showing only the selected one
 * @param {string} tabName - The name identifier of the tab to display
 */
function showTab(tabName) {
    if (!TAB_CONFIG[tabName]) {
        console.error(`Tab "${tabName}" not found in configuration`);
        return;
    }

    activeTab = tabName;

    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) {
        tabElement.classList.remove('hidden');
    }

    document.querySelectorAll('[id^="tab-"]').forEach(tab => {
        tab.classList.remove('text-blue-600', 'border-b-2', 'border-blue-500');
        tab.classList.add('text-gray-600');
    });

    const tabButton = document.getElementById(`tab-${tabName}`);
    if (tabButton) {
        tabButton.classList.add('text-blue-600', 'border-b-2', 'border-blue-500');
    }

    const detailsSection = document.getElementById("gene-details-section");
    if (detailsSection) {
        detailsSection.classList.add("hidden");
    }

    resetHighlights();

    if (TAB_CONFIG[tabName].render) {
        if (TAB_CONFIG[tabName].dataType === 'taxonomy' && taxonomyData) {
            TAB_CONFIG[tabName].render(taxonomyData);
        } else if (TAB_CONFIG[tabName].dataType === 'gene' && geneData) {
            TAB_CONFIG[tabName].render(geneData);
        }
    }
}

/**
 * @function resetHighlights
 * @private
 * @description Safe wrapper for highlight reset functionality
 */
function resetHighlights() {
    if (PhylogeneticTree.ui.interactions &&
        PhylogeneticTree.ui.interactions.highlighting &&
        typeof PhylogeneticTree.ui.interactions.highlighting.resetHighlights === 'function') {
        PhylogeneticTree.ui.interactions.highlighting.resetHighlights();
    }
}

/**
 * @function initTabs
 * @description Initializes tab functionality after DOM is ready
 */
function initTabs() {
    const initialTab = Object.keys(TAB_CONFIG).find(key => TAB_CONFIG[key].initialActive) || 'taxa';
    showTab(initialTab);

    window.showTab = showTab;
}

document.addEventListener('DOMContentLoaded', initTabs);

PhylogeneticTree.ui.components.Tabs = {
    setGeneData,
    setTaxonomyData,
    showTab
};