import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module treeRendererHorizontal
 * @description Module for rendering a left-to-right phylogenetic tree using D3.js.
 */

let geneData = {};

/**
 * Sets the gene data for the renderer
 * @param {Object} data - The extracted gene data containing prevalence information in genomes
 */
function setGeneData(data) {
    geneData = data;
}

function renderTree(treeData, container) {
    const width = PhylogeneticTree.ui.config.Tree.TreeConfig.width;
    const height = PhylogeneticTree.ui.config.Tree.TreeConfig.height;
    const margin = PhylogeneticTree.ui.config.Tree.TreeConfig.margin;

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "0 auto")
        .style("overflow", "visible");

    const root = d3.hierarchy(treeData, d => d.branchset)
        .each(d => { if (d.data.name) d.data.originalName = d.data.name; })
        .sum(d => d.branchset ? 0 : 1)
        .sort((a, b) => (a.value - b.value) || d3.ascending(a.data.length, b.data.length));

    const chart = svg.append("g")
        .attr("class", "tree-chart")
        .datum(root)
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const treeLayout = d3.tree()
        .nodeSize([PhylogeneticTree.ui.config.Tree.TreeConfig.horizontal.nodeSpacing, 0])
        .size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

    treeLayout(root);

    /** @param {Object} d - A link object */
    function linkHorizontal(d) {
        const sourceX = d.source.x, sourceY = d.source.y;
        const targetX = d.target.x, targetY = d.target.y;
        const midY = sourceY + (targetY - sourceY) / 2;
        return `M${sourceY},${sourceX}L${midY},${sourceX}L${midY},${targetX}L${targetY},${targetX}`;
    }

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

    const node = chart.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(root.descendants())
        .enter().append("g")
        .each(function (d) { d.nodeElement = this; })
        .attr("class", "node")
        .attr("id", d => `node-${(d.data?.name || "").replace(/[^a-zA-Z0-9]/g, "_")}`)
        .attr("transform", d => `translate(${d.y},${d.x})`)
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

    node.append("text")
        .attr("dx", "1.5em")
        .attr("dy", "0.32em")
        .attr("data-taxon", d => d.data?.originalName || d.data?.name || "")
        .text(d => {
            return !d.children ? ((d.data?.name || "").replace(/_/g, " ")) : "";
        })
        .style("font-size", "10.5px")
        .style("letter-spacing", "0.4px")
        .style("fill", "#333")
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

PhylogeneticTree.ui.visualization.TreeRendererHorizontal = {
    renderTree,
    setGeneData
};
