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
    'families': {
        render: (data) => PhylogeneticTree.ui.components.GeneFamilyTable.renderGeneFamilyTable(data, "#families-tab"),
        dataType: 'gene'
    },
    'custom': {
        render: (data) => renderCustomTab(data, "#custom-tab"),
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
    if (activeTab === 'custom') {
        PhylogeneticTree.ui.components.CustomTable.saveOnTabChange();
    }

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    const targetContent = document.getElementById(`${tabName}-tab`);
    if (targetContent) {
        targetContent.classList.remove('hidden');
    }

    const targetButton = document.querySelector(`[data-tab="${tabName}"]`) ||
        document.querySelector(`button[onclick*="${tabName}"]`);
    if (targetButton) {
        targetButton.classList.remove('border-transparent', 'text-gray-500');
        targetButton.classList.add('border-blue-500', 'text-blue-600');
    }

    activeTab = tabName;

    if (TAB_CONFIG[tabName]) {
        const config = TAB_CONFIG[tabName];
        const data = config.dataType === 'gene' ? geneData : taxonomyData;
        if (data) {
            config.render(data);
        }
    }

    resetHighlights();
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

function renderCustomTab(data, selector) {
    const customData = PhylogeneticTree.ui.components.CustomTable.getCustomData();
    PhylogeneticTree.ui.components.CustomTable.renderCustomTable(customData, selector);
}