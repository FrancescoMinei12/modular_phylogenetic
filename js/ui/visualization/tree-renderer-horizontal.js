import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module treeRendererHorizontal
 * @description Module for rendering a left-to-right phylogenetic tree using D3.js.
 * It builds the tree layout, draws nodes and links, and enables interactivity through event listeners.
 */

/**
 * Renders an horizontal phylogenetic tree visualization using D3.
 *
 * @param {Object} treeData - The hierarchical tree data (from Newick parser).
 * @param {HTMLElement} container - The DOM element where the SVG tree should be rendered.
 */
function renderTree(treeData, container) {
    const width = PhylogeneticTree.ui.config.Tree.TreeConfig.width;
    const height = PhylogeneticTree.ui.config.Tree.TreeConfig.height;
    const margin = PhylogeneticTree.ui.config.Tree.TreeConfig.margin;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "0 auto");

    const root = d3.hierarchy(treeData, function (d) {
        return d.branchset;
    }).sum(function (d) {
        return d.branchset ? 0 : 1;
    }).sort(function (a, b) {
        return (a.value - b.value) || d3.ascending(a.data.length, b.data.length);
    });

    const chart = svg.append("g")
        .attr("class", "tree-chart")
        .datum(root)
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeLayout = d3.tree()
        .nodeSize([PhylogeneticTree.ui.config.Tree.TreeConfig.horizontal.nodeSpacing, 0])
        .size([
            height - margin.top - margin.bottom,
            width - margin.left - margin.right
        ]);

    treeLayout(root);

    root.descendants().forEach(d => {
        d.x = d.x * 1.1;
        d.y = d.y;
    });

    /**
     * Returns the SVG path for a horizontal link between nodes.
     *
     * @param {Object} d - A link object.
     * @returns {string} - The SVG path string.
     */
    function linkHorizontal(d) {
        return d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x)(d);
    }

    const link = chart.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(root.links())
        .enter().append("path")
        .each(function (d) {
            d.target.linkNode = this;
            d.source.linkNodes = d.source.linkNodes || [];
            d.source.linkNodes.push({
                element: this,
                target: d.target
            });
        })
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5)
        .attr("d", linkHorizontal);

    const node = chart.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(root.descendants())
        .enter().append("g")
        .each(function (d) {
            d.nodeElement = this;
            d.data.originalName = d.data.name;
        })
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
        .attr("r", 4.5)
        .attr("fill", "#4A90E2");

    const labels = node.append("text")
        .attr("dx", "1.5em")
        .attr("dy", "0.32em")
        .attr("text-anchor", "start")
        .text(d => d.data.name?.replace(/_/g, " ") || "")
        .style("font-size", "10.5px")
        .style("letter-spacing", "0.4px")
        .each(function (d) {
            d.labelNode = this;
        })
        .on("mouseover", function (event, d) {
            d3.select(this)
                .transition()
                .style("font-size", "12px")
                .style("letter-spacing", "0.6px");
            PhylogeneticTree.ui.interactions.hoverFunctions
                .mouseOvered(true)
                .call(this, d);
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .transition()
                .style("font-size", "10.5px")
                .style("letter-spacing", "0.4px");
            PhylogeneticTree.ui.interactions.hoverFunctions
                .mouseOvered(false)
                .call(this, d);
        });
}

/**
 * @namespace TreeRendererHorizontal
 * @description Namespace for horizontal tree rendering functionality
 * @memberof PhylogeneticTree.ui.visualization
 */
PhylogeneticTree.ui.visualization.TreeRendererHorizontal = {
    renderTree
};