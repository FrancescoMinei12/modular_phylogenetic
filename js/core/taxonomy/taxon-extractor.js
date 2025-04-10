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