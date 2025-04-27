import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @file treeRendererHorizontal.js
 * @brief Module for rendering left-to-right phylogenetic trees using D3.js
 * @ingroup PhylogeneticTreeUI
 */

/**
 * @module treeRendererHorizontal
 * @description Module for rendering a left-to-right phylogenetic tree using D3.js.
 * Provides functionality to create horizontal tree visualizations with nodes, links, and labels.
 */

/**
 * @var {Object} geneData
 * @description Stores gene data containing prevalence information in genomes
 * @memberof module:treeRendererHorizontal
 */
let geneData = {};

/**
 * @function setGeneData
 * @description Sets the gene data for the renderer
 * @memberof module:treeRendererHorizontal
 * @param {Object} data - Gene data with prevalence information
 */
function setGeneData(data) {
    geneData = data;
}

/**
 * @function renderTree
 * @description Main function to render the phylogenetic tree horizontally
 * @memberof module:treeRendererHorizontal
 * @param {Object} treeData - The tree data structure
 * @param {HTMLElement} container - DOM element to render the tree into
 */
function renderTree(treeData, container) {
    const { width, height, margin } = PhylogeneticTree.ui.config.Tree.TreeConfig;
    const svg = createSvgContainer(container, width, height);
    const root = buildHierarchy(treeData);

    const chart = svg.append("g")
        .attr("class", "tree-chart")
        .datum(root)
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeLayout = d3.tree()
        .nodeSize([PhylogeneticTree.ui.config.Tree.TreeConfig.horizontal.nodeSpacing, 0])
        .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    treeLayout(root);

    renderLinks(chart, root);
    renderNodes(chart, root);
    renderLabels(chart, root);
}

/**
 * @function createSvgContainer
 * @description Creates the SVG container for the tree visualization
 * @memberof module:treeRendererHorizontal
 * @param {HTMLElement} container - Container DOM element
 * @param {number} width - SVG width in pixels
 * @param {number} height - SVG height in pixels
 * @returns {Object} D3 selection of the SVG element
 */
function createSvgContainer(container, width, height) {
    return d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "0 auto")
        .style("overflow", "visible");
}

/**
 * @function buildHierarchy
 * @description Builds the tree hierarchy from input data
 * @memberof module:treeRendererHorizontal
 * @param {Object} treeData - Input tree data
 * @returns {Object} Root node of the constructed hierarchy
 */
function buildHierarchy(treeData) {
    return d3.hierarchy(treeData, d => d.branchset)
        .each(d => { if (d.data.name) d.data.originalName = d.data.name; })
        .sum(d => d.branchset ? 0 : 1)
        .sort((a, b) => (a.value - b.value) || d3.ascending(a.data.length, b.data.length));
}

/**
 * @function renderLinks
 * @description Renders the connecting links between nodes in horizontal layout
 * @memberof module:treeRendererHorizontal
 * @param {Object} chart - D3 selection of the chart group
 * @param {Object} root - Root node of the tree hierarchy
 */
function renderLinks(chart, root) {
    chart.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(root.links())
        .enter().append("path")
        .each(function (d) {
            d.target.linkNode = this;
            d.source.linkNodes = d.source.linkNodes || [];
            d.source.linkNodes.push({ element: this, target: d.target });
        })
        .attr("fill", "none")
        .attr("stroke", d => d.target.color)
        .attr("stroke-width", 1.5)
        .attr("d", linkHorizontal);
}

/**
 * @function linkHorizontal
 * @description Generates path data for horizontal elbow links
 * @memberof module:treeRendererHorizontal
 * @param {Object} d - Link data object
 * @returns {string} SVG path data string
 */

function linkHorizontal(d) {
    const sourceX = d.source.x, sourceY = d.source.y;
    const targetX = d.target.x, targetY = d.target.y;
    const midY = sourceY + (targetY - sourceY) / 2;
    return `M${sourceY},${sourceX}L${midY},${sourceX}L${midY},${targetX}L${targetY},${targetX}`;
}

/**
 * @function renderNodes
 * @description Renders the nodes of the phylogenetic tree
 * @memberof module:treeRendererHorizontal
 * @param {Object} chart - D3 selection of the chart group
 * @param {Object} root - Root node of the tree hierarchy
 */
function renderNodes(chart, root) {
    chart.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("id", d => `node-${(d.data?.name || "").replace(/[^a-zA-Z0-9]/g, "_")}`)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .each(function (d) { d.nodeElement = this; })
        .on("mouseover", function (event, d) {
            PhylogeneticTree.ui.interactions.hoverFunctions.mouseOvered(true).call(this, d);
        })
        .on("mouseout", function (event, d) {
            PhylogeneticTree.ui.interactions.hoverFunctions.mouseOvered(false).call(this, d);
        })
        .each(function (d) {
            if (d.data?.name && !d.data.name.startsWith("Inner")) {
                const count = PhylogeneticTree.ui.components.TreeControls.countGenomesForGene(d.data.name, geneData);
                d3.select(this).attr("data-value", count);
                const families = PhylogeneticTree.core.utilities.Genome.mapGenomesToFamilies(geneData);
                if (families) {
                    d3.select(this).attr("data-families", families[d.data.name]?.join(",") || "");
                }
            } else {
                d3.select(this).attr("data-value", "0");
            }
        });
}

/**
 * @function renderLabels
 * @description Renders text labels for tree nodes
 * @memberof module:treeRendererHorizontal
 * @param {Object} chart - D3 selection of the chart group
 * @param {Object} root - Root node of the tree hierarchy
 */
function renderLabels(chart, root) {
    chart.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(root.descendants())
        .enter().append("text")
        .attr("x", d => d.y + 5)
        .attr("y", d => d.x)
        .attr("dy", "0.32em")
        .attr("data-taxon", d => d.data?.originalName || d.data?.name || "")
        .text(d => (!d.children ? (d.data?.name || "").replace(/_/g, " ") : "")) // Solo se non ha figli
        .style("font-size", "10.5px")
        .style("fill", "#333")
        .style("letter-spacing", "0.4px")
        .attr("text-anchor", "start")
        .each(function (d) { d.labelNode = this; })
        .on("mouseover", function (event, d) {
            d3.select(this).transition().style("font-size", "12px").style("letter-spacing", "0.6px");
            PhylogeneticTree.ui.interactions.hoverFunctions.mouseOvered(true).call(this, d);
        })
        .on("mouseout", function (event, d) {
            d3.select(this).transition().style("font-size", "10.5px").style("letter-spacing", "0.4px");
            PhylogeneticTree.ui.interactions.hoverFunctions.mouseOvered(false).call(this, d);
        });
}


/**
 * @namespace TreeRendererHorizontal
 * @description Horizontal tree renderer namespace
 * @memberof module:PhylogeneticTree.ui.visualization
 * @property {function} renderTree - Main tree rendering function
 * @property {function} setGeneData - Function to set gene data
 */
PhylogeneticTree.ui.visualization.TreeRendererHorizontal = {
    renderTree,
    setGeneData
};
