/**
 * @function extractTaxa
 * @description Extracts and alphabetically sorts taxa from tree data
 * @param {Object} treeData - The hierarchical tree data containing taxonomic information
 * @returns {Array} Array of { name, originalName } objects
 * @private
 */
export function extractTaxa(treeData) {
    const taxa = [];

    function traverse(node) {
        if (node.name?.startsWith("GCA")) {
            taxa.push({
                name: node.name.replace(/_/g, " "),
                originalName: node.name
            });
        }

        node.branchset?.forEach(child => traverse(child));
    }

    try {
        traverse(treeData);
        taxa.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error extracting taxa from tree:", error);
    }

    return taxa;
}

/**
 * @function updateTaxonDisplayName
 * @description Updates the display name for a taxon throughout the system
 * @param {string} originalName - The original taxon name
 * @param {string} newName - The new display name
 */
export function updateTaxonDisplayName(originalName, newName) {
    try {
        const treeLabels = d3.selectAll(".labels text");

        treeLabels.each(function (d) {
            if (d.data && d.data.name === originalName) {
                d3.select(this).text(newName);
            }
        });

        const customNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');
        customNames[originalName] = newName;
        localStorage.setItem('customTaxonNames', JSON.stringify(customNames));
    } catch (e) {
        console.error(`Error updating taxon name:`, e);
    }
}

/**
 * @function importCustomNames
 * @description Imports custom names from a JSON or CSV file
 * @param {Object} treeData - Phylogenetic tree data
 * @param {string} tableSelector - CSS selector for the table container
 */
export function importCustomNames(treeData, tableSelector) {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,.csv";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            let customNames = {};

            if (file.name.endsWith(".json")) {
                const content = await file.text();
                customNames = JSON.parse(content);
            } else if (file.name.endsWith(".csv")) {
                const content = await file.text();
                const lines = content.split("\n");

                lines.forEach(line => {
                    if (!line.trim()) return;
                    const [originalName, customName] = line.split(",").map(item => item.trim());
                    if (originalName && customName) {
                        customNames[originalName] = customName;
                    }
                });
            }

            applyCustomNames(customNames, treeData, tableSelector);

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
 * @function applyCustomNames
 * @description Applies custom names to the table and tree
 * @param {Object} customNames - Mapping between original and custom names
 * @param {Object} treeData - Phylogenetic tree data
 * @param {string} tableSelector - CSS selector for the table container
 */
export function applyCustomNames(customNames, treeData, tableSelector) {
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
 * @function downloadCustomNamesFile
 * @description Helper function to download custom names as a JSON file
 * @param {Object} namesData - The custom names data to save
 */
export function downloadCustomNamesFile(namesData) {
    try {
        const jsonContent = JSON.stringify(namesData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'customTaxaNames.json';

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading custom names file:', error);
    }
}

/**
 * @function createCustomNamesFile
 * @description Creates a customTaxaNames.json file with the provided names
 * @param {Object} customNames - Mapping of original names to custom names
 */
export async function createCustomNamesFile(customNames) {
    try {
        const response = await fetch('/api/create-custom-names-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(customNames),
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error creating custom names file:', error);
        return false;
    }
}

/**
 * @function generateCustomNamesFile
 * @description Generates a customTaxaNames.json file with all original taxa names
 * @param {Object} treeData - The hierarchical tree data
 */
export function generateCustomNamesFile(treeData) {
    try {
        const taxa = extractTaxa(treeData);
        const customNamesTemplate = {};

        taxa.forEach(taxon => {
            const storedNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');
            customNamesTemplate[taxon.originalName] = storedNames[taxon.originalName] || taxon.name;
        });

        const jsonContent = JSON.stringify(customNamesTemplate, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'customTaxaNames.json';

        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating custom names file:', error);
        alert('Error generating custom names file');
    }
}

/**
 * @function saveCustomNamesToFile
 * @description Saves the current custom taxa names to a downloadable file
 * @param {Object} treeData - Used to ensure all taxa are included
 */
export function saveCustomNamesToFile(treeData) {
    try {
        const customNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');
        const allTaxa = extractTaxa(treeData);
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

        alert('Custom names saved successfully! Move the downloaded file to the "config" folder to load these names on next startup.');
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
export async function loadCustomNamesFromFile(treeData, tableSelector) {
    try {
        const storedNames = JSON.parse(localStorage.getItem('customTaxonNames') || '{}');

        let response;
        try {
            response = await fetch('./customTaxaNames.json');
        } catch (fetchError) {
            console.warn("Could not fetch customTaxaNames.json:", fetchError);

            if (Object.keys(storedNames).length > 0) {
                applyCustomNames(storedNames, treeData, tableSelector);
            }
            return;
        }

        if (response.ok) {
            const fileNames = await response.json();

            const mergedNames = { ...fileNames, ...storedNames };
            applyCustomNames(mergedNames, treeData, tableSelector);
            localStorage.setItem('customTaxonNames', JSON.stringify(mergedNames));
        } else {
            if (Object.keys(storedNames).length > 0) {
                applyCustomNames(storedNames, treeData, tableSelector);
            }

            const allTaxa = extractTaxa(treeData);
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
            applyCustomNames(storedNames, treeData, tableSelector);
        }
    }
}