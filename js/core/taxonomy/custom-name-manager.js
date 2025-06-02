import { PhylogeneticTree } from '../../namespace-init.js';

/**
 * @function updateTaxonDisplayName
 * @description Updates the display name for a taxon throughout the system
 * @param {string} originalName - The original taxon name
 * @param {string} newName - The new display name
 */
function updateTaxonDisplayName(originalName, newName) {
    try {
        const treeLabels = d3.selectAll(".taxon-name");

        treeLabels.each(function (d) {
            if (d.data && d.data.originalName === originalName) {
                d3.select(this).text(newName);
            }
        });

        const customNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');
        customNames[originalName] = newName;
        localStorage.setItem('customTaxonNames', JSON.stringify(customNames));

        if (PhylogeneticTree.ui.visualization.TreeRenderer.updateTaxonStats) {
            PhylogeneticTree.ui.visualization.TreeRenderer.updateTaxonStats();
        }

        if (PhylogeneticTree.ui.visualization.TreeRendererHorizontal.updateTaxonStats) {
            PhylogeneticTree.ui.visualization.TreeRendererHorizontal.updateTaxonStats();
        }
    } catch (e) {
        console.error(`Error updating taxon name:`, e);
    }
}

/**
 * @function applyCustomNames
 * @description Applies custom names to the table and tree
 * @param {Object} customNames - Mapping between original and custom names
 * @param {Object} treeData - Phylogenetic tree data
 * @param {string} tableSelector - CSS selector for the table container
 */
function applyCustomNames(customNames, treeData, tableSelector) {
    for (const [originalName, customName] of Object.entries(customNames)) {
        updateTaxonDisplayName(originalName, customName);
    }

    const table = document.querySelector(`${tableSelector} table`);
    if (table) {
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach(row => {
            const originalName = row.dataset.taxon;
            if (customNames[originalName]) {
                const nameCell = row.cells[0];
                const inputElement = row.cells[1].querySelector("input");

                nameCell.textContent = customNames[originalName];
                if (inputElement) {
                    inputElement.value = customNames[originalName];
                }
                row.dataset.customName = customNames[originalName];
            }
        });
    }
}

/**
 * @function reapplyCustomNamesAfterRender
 * @description Riapplica i nomi personalizzati dopo che l'albero è stato renderizzato
 * @param {Object} treeData - Dati dell'albero filogenetico
 * @param {string} tableSelector - Selettore CSS per la tabella dei taxa
 */
function reapplyCustomNamesAfterRender(treeData, tableSelector) {
    requestAnimationFrame(() => {
        const customNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');

        if (Object.keys(customNames).length === 0) {
            return;
        }

        const treeLabels = d3.selectAll(".taxon-name");

        treeLabels.each(function (d) {
            if (d.data && d.data.originalName && customNames[d.data.originalName]) {
                d3.select(this).text(customNames[d.data.originalName]);
            }
        });

        if (PhylogeneticTree.ui.visualization.TreeRenderer.updateTaxonStats) {
            PhylogeneticTree.ui.visualization.TreeRenderer.updateTaxonStats();
        }

        if (PhylogeneticTree.ui.visualization.TreeRendererHorizontal.updateTaxonStats) {
            PhylogeneticTree.ui.visualization.TreeRendererHorizontal.updateTaxonStats();
        }
    });
}

PhylogeneticTree.core.taxonomy.CustomNameManager = {
    updateTaxonDisplayName,
    applyCustomNames,
    reapplyCustomNamesAfterRender
}