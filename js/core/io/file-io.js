import { PhylogeneticTree } from '../../namespace-init.js';

/**
 * @function importCustomNames
 * @description Imports custom names from a JSON file
 * @param {Object} treeData - Phylogenetic tree data
 * @param {string} tableSelector - CSS selector for the table container
 */

function importCustomNames(treeData, tableSelector) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.id = "custom-names-import";
    fileInput.name = "custom-names-import";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const content = await file.text();
            const customNames = JSON.parse(content);

            PhylogeneticTree.core.taxonomy.CustomNameManager.applyCustomNames(customNames, treeData, tableSelector);

            const existingNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');
            const mergedNames = { ...existingNames, ...customNames };
            localStorage.setItem('customTaxonNames', JSON.stringify(mergedNames));

            alert(`Imported ${Object.keys(customNames).length} custom names`);
        } catch (error) {
            console.error("Import error:", error);
            alert("Error importing file. Please check the format.");
        } finally {
            document.body.removeChild(fileInput);
        }
    });

    fileInput.click();
}

/**
 * @function saveCustomNamesToFile
 * @description Saves the current custom taxa names to a downloadable file
 * @param {Object} treeData - Used to ensure all taxa are included
 */
function saveCustomNamesToFile(treeData) {
    try {
        const customNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');
        const allTaxa = PhylogeneticTree.core.taxonomy.TaxonExtractor.extractTaxa(treeData);
        allTaxa.forEach(taxon => {
            if (!customNames[taxon.originalName]) {
                customNames[taxon.originalName] = taxon.name;
            }
        });

        const jsonContent = JSON.stringify(customNames, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'customTaxaNames.json';

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);

        alert('Custom names saved successfully!');
    } catch (error) {
        console.error('Error saving custom names to file:', error);
        alert('Error saving custom names file');
    }
}

/**
 * @function loadCustomNamesFromFile
 * @description Loads custom taxon names from a file or uses localStorage values
 * @param {Object} treeData - The hierarchical tree data
 * @param {string} tableSelector - CSS selector for the table container
 */
async function loadCustomNamesFromFile(treeData, tableSelector) {
    try {
        const storedNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');

        let response;
        try {
            response = await fetch('../../../assets/customTaxaNames.json');
        } catch (fetchError) {
            console.warn("Could not fetch customTaxaNames.json:", fetchError);

            if (Object.keys(storedNames).length > 0) {
                PhylogeneticTree.core.taxonomy.CustomNameManager.applyCustomNames(storedNames, treeData, tableSelector);
            }
            return;
        }

        if (response.ok) {
            const fileNames = await response.json();

            const mergedNames = { ...fileNames, ...storedNames };
            PhylogeneticTree.core.taxonomy.CustomNameManager.applyCustomNames(mergedNames, treeData, tableSelector);
            localStorage.setItem('customTaxonNames', JSON.stringify(mergedNames));
        } else {
            if (Object.keys(storedNames).length > 0) {
                PhylogeneticTree.core.taxonomy.CustomNameManager.applyCustomNames(storedNames, treeData, tableSelector);
            }

            const allTaxa = PhylogeneticTree.core.taxonomy.TaxonExtractor.extractTaxa(treeData);
            const defaultNames = {};

            allTaxa.forEach(taxon => {
                defaultNames[taxon.originalName] = storedNames[taxon.originalName] || taxon.name;
            });

            localStorage.setItem('defaultTaxaNames', JSON.stringify(defaultNames));
        }
    } catch (error) {
        console.warn("Error in loadCustomNamesFromFile:", error);

        const storedNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');
        if (Object.keys(storedNames).length > 0) {
            PhylogeneticTree.core.taxonomy.CustomNameManager.applyCustomNames(storedNames, treeData, tableSelector);
        }
    }
}

PhylogeneticTree.core.io.file = {
    importCustomNames,
    saveCustomNamesToFile,
    loadCustomNamesFromFile
}