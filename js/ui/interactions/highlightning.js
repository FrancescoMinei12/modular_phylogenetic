/**
 * @module highlightning
 * @description Module for handling highlighting functionality in the phylogenetic tree and related tables
 */

/** @type {string|null} Current highlighted taxon name */
let currentTaxonHighlight = null;
/** @type {string|null} Current highlighted gene family ID */
let currentFamilyHighlight = null;
/** @type {string|null} Current highlighted product name */
let currentProductHighlight = null;

/**
 * @function highlightPathAndLabel
 * @description Highlights a path in the phylogenetic tree based on taxon name
 * @param {string} taxonName - Name of the taxon to highlight
 */
export function highlightPathAndLabel(taxonName) {
    if (typeof d3 === 'undefined') {
        return;
    }

    const chart = d3.select(".tree-chart");
    const root = chart.datum();

    if (!root) {
        return;
    }

    if (currentTaxonHighlight === taxonName) {
        resetHighlights();
        currentTaxonHighlight = null;
        return;
    }

    resetHighlights();

    let targetNode = findNode(root, taxonName);

    if (!targetNode) {
        handleNotFound(taxonName);
        return;
    }

    highlightPath(targetNode);

    d3.select(`.taxa-table tr[data-taxon="${taxonName}"]`)
        .classed("highlighted", true);

    currentTaxonHighlight = taxonName;
}

/**
 * @function highlightGeneFamily
 * @description Highlights all genomes belonging to a gene family
 * @param {Object} data - The gene family data
 * @param {string} familyId - ID of the gene family to highlight
 */
export function highlightGeneFamily(data, familyId) {
    if (typeof d3 === 'undefined') {
        return;
    }

    if (currentFamilyHighlight === familyId) {
        resetHighlights();
        currentFamilyHighlight = null;
        return;
    }

    resetHighlights();

    const genomes = new Set();
    if (data[familyId] && Array.isArray(data[familyId])) {
        data[familyId].forEach(gene => {
            if (gene["genome-name"]) {
                genomes.add(gene["genome-name"]);
            }
        });
    }

    let foundAny = false;
    const chart = d3.select(".tree-chart");
    const root = chart.datum();

    if (!root) {
        return;
    }

    genomes.forEach(genome => {
        const targetNode = findNode(root, genome);

        if (targetNode) {
            foundAny = true;
            highlightPath(targetNode);

            try {
                d3.select(`.taxa-table tr[data-taxon="${genome}"]`)
                    .classed("highlighted", true);
            } catch (e) {
                console.error(`Error highlighting taxon table row for genome "${genome}":`, e);
            }
        }
    });

    try {
        d3.select(`.gene-family-table tr[data-family="${familyId}"]`)
            .classed("highlighted", true);
    } catch (e) {
        console.error(`Error highlighting gene family table row for family "${familyId}":`, e);
    }

    currentFamilyHighlight = familyId;
}

/**
 * @function highlightProduct
 * @description Highlights all genomes containing a specific product
 * @param {Object} data - The gene data
 * @param {string} productName - Name of the product to highlight
 */
export function highlightProduct(data, productName) {
    if (typeof d3 === 'undefined') {
        return;
    }

    if (currentProductHighlight === productName) {
        resetHighlights();
        currentProductHighlight = null;
        return;
    }

    resetHighlights();

    const genomes = new Set();

    Object.keys(data).forEach(familyKey => {
        const genes = data[familyKey];

        genes.forEach(gene => {
            if (gene.product === productName && gene["genome-name"]) {
                genomes.add(gene["genome-name"]);
            }
        });
    });

    let foundAny = false;
    const chart = d3.select(".tree-chart");
    const root = chart.datum();

    if (!root) {
        return;
    }

    genomes.forEach(genome => {
        const targetNode = findNode(root, genome);

        if (targetNode) {
            foundAny = true;
            highlightPath(targetNode);

            try {
                d3.select(`.taxa-table tr[data-taxon="${genome}"]`)
                    .classed("highlighted", true);
            } catch (e) {
                console.error(`Error highlighting taxon table row for genome "${genome}":`, e);
            }
        }
    });

    try {
        d3.select(`.product-table tr[data-product="${productName}"]`)
            .classed("highlighted", true);
    } catch (e) {
        console.error(`Error highlighting product table row for product "${productName}":`, e);
    }

    currentProductHighlight = productName;
}

/**
 * @function resetHighlights
 * @description Removes all highlights from the tree and tables
 * @private
 */
function resetHighlights() {
    if (typeof d3 === 'undefined') {
        return;
    }

    try {
        d3.selectAll(".link--active, .label--active, .node--active")
            .classed("link--active", false)
            .classed("label--active", false)
            .classed("node--active", false);

        d3.selectAll(".taxa-table tr.highlighted, .gene-family-table tr.highlighted, .product-table tr.highlighted")
            .classed("highlighted", false);
    } catch (e) {
        console.error("Error resetting highlights:", e);
    }
}

/**
 * @function findNode
 * @description Finds a node in the tree by taxon name
 * @param {Object} node - Root node to search from
 * @param {string} taxonName - Name of the taxon to find
 * @returns {Object|null} The found node or null if not found
 * @private
 */
function findNode(node, taxonName) {
    let targetNode = null;

    try {
        node.each(d => {
            if (d.data && d.data.name === taxonName) {
                targetNode = d;
            }
        });
    } catch (e) {
        console.error(`Error finding node for taxon "${taxonName}":`, e);
    }

    return targetNode;
}

/**
 * @function handleNotFound
 * @description Handles the case when a taxon is not found
 * @param {string} taxonName - Name of the taxon that was not found
 * @private
 */
function handleNotFound(taxonName) {
    console.warn(`Taxon not found: "${taxonName}"`);
}

/**
 * @function highlightPath
 * @description Highlights a path from a node to the root in the tree
 * @param {Object} targetNode - Node to start highlighting from
 * @private
 */
function highlightPath(targetNode) {
    if (typeof d3 === 'undefined') {
        return;
    }

    let currentNode = targetNode;
    while (currentNode) {
        try {
            if (currentNode.linkNode) {
                d3.select(currentNode.linkNode)
                    .classed("link--active", true)
                    .raise();
            }
            if (currentNode.labelNode) {
                d3.select(currentNode.labelNode)
                    .classed("label--active", true)
                    .raise();
            }
            if (currentNode.nodeElement) {
                d3.select(currentNode.nodeElement)
                    .classed("node--active", true)
                    .raise();
            }
        } catch (e) {
            console.error("Error highlighting path element:", e);
        }

        currentNode = currentNode.parent;
    }
}