import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module HighlightService
 * @description Centralized service for all highlighting operations in the application
 */

let currentTaxon = null;
let currentFamily = null;
let currentProduct = null;

/**
 * Apply highlight style to a tree node and its associated elements.
 *
 * @param {Object} node - The D3 node object
 * @param {boolean} active - Whether to apply or remove highlight
 */
function applyHighlight(node, active) {
    if (!node) return;

    try {
        if (node.linkNode) {
            d3.select(node.linkNode).classed("link--active", active);
        }

        if (node.labelNode) {
            d3.select(node.labelNode)
                .classed("label--active", active)
                .style("fill", active ? "#FF4500" : null)
                .style("font-weight", active ? "bold" : null)
                .style("stroke", active ? "none" : null);
        }

        if (node.nodeElement) {
            d3.select(node.nodeElement).classed("node--active", active);
        }
    } catch (e) {
        console.error("Error applying highlight:", e);
    }
}

/**
 * Reset all current highlights
 */
function resetHighlights() {
    d3.selectAll(".link--active, .label--active, .node--active")
        .classed("link--active", false)
        .classed("label--active", false)
        .classed("node--active", false);

    d3.selectAll(".tree-chart text")
        .style("fill", null)
        .style("font-weight", null)
        .style("stroke", null);

    d3.selectAll(".highlighted").classed("highlighted", false);

    d3.selectAll(".links path")
        .attr("stroke-width", 1.5)
        .attr("stroke", d => d.target.color || "#000");

    currentTaxon = null;
    currentFamily = null;
    currentProduct = null;
}

/**
 * Find a tree node by taxon name
 */
function findNodeByName(name) {
    const chart = d3.select(".tree-chart");
    const root = chart.datum();
    let found = null;
    root?.each(d => {
        if (d?.data?.name === name) found = d;
    });
    return found;
}

/**
 * Highlight a taxon path and label
 */
function highlightPathAndLabel(taxonName) {
    if (currentTaxon === taxonName) {
        resetHighlights();
        return;
    }

    resetHighlights();

    const node = findNodeByName(taxonName);
    if (!node) return;

    let curr = node;
    while (curr) {
        applyHighlight(curr, true);
        curr = curr.parent;
    }

    d3.select(`.taxa-table tr[data-taxon="${taxonName}"]`).classed("highlighted", true);
    currentTaxon = taxonName;
}

/**
 * Highlight all taxa in a gene family
 */
function highlightGeneFamily(data, familyId) {
    if (currentFamily === familyId) {
        resetHighlights();
        return;
    }

    resetHighlights();
    const genomes = new Set(data[familyId]?.map(g => g["genome-name"]) || []);
    genomes.forEach(genome => {
        const node = findNodeByName(genome);
        let curr = node;
        while (curr) {
            applyHighlight(curr, true);
            curr = curr.parent;
        }

        d3.select(`.taxa-table tr[data-taxon="${genome}"]`).classed("highlighted", true);
    });

    d3.select(`.gene-family-table tr[data-family="${familyId}"]`).classed("highlighted", true);
    currentFamily = familyId;
}

/**
 * Highlight taxa with a certain product
 */
function highlightProduct(data, productName) {
    if (currentProduct === productName) {
        resetHighlights();
        return;
    }

    resetHighlights();

    const genomes = new Set();

    for (const genes of Object.values(data)) {
        for (const gene of genes) {
            if (gene.product === productName && gene["genome-name"]) {
                genomes.add(gene["genome-name"]);
            }
        }
    }

    genomes.forEach(genome => {
        const node = findNodeByName(genome);
        let curr = node;
        while (curr) {
            applyHighlight(curr, true);
            curr = curr.parent;
        }

        d3.select(`.taxa-table tr[data-taxon="${genome}"]`).classed("highlighted", true);
    });

    d3.select(`.product-table tr[data-product="${productName}"]`).classed("highlighted", true);
    currentProduct = productName;
}

/**
 * Reset highlight when mouse leaves label
 */
function resetOnMouseLeave(name) {
    if (currentTaxon === name) {
        resetHighlights();
    }
}

function highlightGenomesWithAttribute(targetAttribute, selector, customData) {
    const matchingGenomes = new Set();

    Object.entries(customData).forEach(([genome, attributes]) => {
        if (targetAttribute === 'No attributes') {
            if (!Array.isArray(attributes) || attributes.length === 0) {
                matchingGenomes.add(genome);
            }
        } else {
            if (Array.isArray(attributes) && attributes.includes(targetAttribute)) {
                matchingGenomes.add(genome);
            }
        }
    });

    matchingGenomes.forEach(genome => {
        document.querySelectorAll(`${selector} tr[data-taxon="${genome}"]`).forEach(row => {
            row.classList.add("bg-yellow-100");
        });
    });

    matchingGenomes.forEach(genome => {
        const node = findNodeByName(genome);
        let curr = node;
        while (curr) {
            applyHighlight(curr, true);
            curr = curr.parent;
        }
    });

    matchingGenomes.forEach(genome => {
        const taxaRow = document.querySelector(`.taxa-table tr[data-taxon="${genome}"]`);
        if (taxaRow) {
            taxaRow.classList.add("highlighted");
        }
    });
}


PhylogeneticTree.ui.interactions.highlighting = {
    highlightPathAndLabel,
    highlightGeneFamily,
    highlightProduct,
    resetHighlights,
    resetOnMouseLeave,
    highlightGenomesWithAttribute
};