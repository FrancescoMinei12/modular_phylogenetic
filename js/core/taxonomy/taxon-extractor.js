import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @function extractTaxa
 * @description Extracts and alphabetically sorts taxa from tree data
 * @param {Object} treeData - The hierarchical tree data containing taxonomic information
 * @returns {Array} Array of { name, originalName } objects
 * @private
 */
function extractTaxa(treeData) {
    const taxa = [];
    function traverse(node) {
        const isLeaf = !node.children || node.children.length === 0;
        if (isLeaf) {
            taxa.push({
                name: node.name.replace(/_/g, " "),
                originalName: node.name
            });
        }

        node.children?.forEach(child => traverse(child));
    }

    try {
        traverse(treeData);
        taxa.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Error extracting taxa from tree:", error);
    }
    return taxa;
}

PhylogeneticTree.core.taxonomy.TaxonExtractor = {
    extractTaxa
}