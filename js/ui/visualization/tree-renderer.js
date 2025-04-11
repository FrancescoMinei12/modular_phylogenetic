import { PhylogeneticTree } from "../../namespace-init.js";
/**
 * @module treeRenderer
 * @description Module responsible for rendering a radial phylogenetic tree using D3.js.
 * It builds the tree layout, draws nodes and links, applies color styles, 
 * and enables interactivity through event listeners.
 */

/**
 * Renders a circular clustered tree visualization using D3.
 *
 * @param {Object} treeData - The hierarchical tree data (from Newick parser).
 * @param {string} container - The CSS selector where the SVG tree should be rendered.
 */
function renderTree(treeData, container) {
    const outerRadius = Math.min(750, window.innerWidth * 0.6) / 2;
    const innerRadius = outerRadius - 100;

    const root = d3.hierarchy(treeData, function (d) {
        return d.branchset;
    }).sum(function (d) {
        return d.branchset ? 0 : 1;
    }).sort(function (a, b) {
        return (a.value - b.value) || d3.ascending(a.data.length, b.data.length);
    });

    const cluster = d3.cluster()
        .size([360, innerRadius])
        .separation(function (a, b) { return 1; });

    const svg = d3.select(container).append("svg")
        .attr("width", outerRadius * 2)
        .attr("height", outerRadius * 2)
        .style("display", "block")
        .style("margin", "0 auto");

    const chart = svg.append("g")
        .attr("class", "tree-chart")
        .datum(root)
        .attr("transform", `translate(${outerRadius},${outerRadius})`);

    cluster(root);

    /**
     * Recursively computes the maximum path length of the tree.
     *
     * @param {Object} d - A node in the tree.
     * @returns {number} - The accumulated maximum length.
     */
    function maxLength(d) {
        const result = d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
        return result;
    }

    /**
     * Recursively sets the radius for each node.
     *
     * @param {Object} d - A node in the tree.
     * @param {number} y0 - Accumulated branch length.
     * @param {number} k - Scale factor.
     */
    function setRadius(d, y0, k) {
        d.radius = (y0 += d.data.length) * k;
        if (d.children) d.children.forEach(function (d) { setRadius(d, y0, k); });
    }

    /**
     * Returns the SVG path for a curved link between nodes.
     *
     * @param {Object} d - A link object.
     * @returns {string} - The SVG path string.
     */
    function linkConstant(d) {
        return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
    }

    /**
     * Returns an SVG path string for a radial step arc.
     *
     * @param {number} startAngle - Angle in degrees for the source node.
     * @param {number} startRadius - Radius for the source node.
     * @param {number} endAngle - Angle in degrees for the target node.
     * @param {number} endRadius - Radius for the target node.
     * @returns {string} - The SVG path string.
     */
    function linkStep(startAngle, startRadius, endAngle, endRadius) {
        const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
            s0 = Math.sin(startAngle),
            c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
            s1 = Math.sin(endAngle);
        return "M" + startRadius * c0 + "," + startRadius * s0
            + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
            + "L" + endRadius * c1 + "," + endRadius * s1;
    }

    /**
     * Returns an SVG path string extending the link from target to the outer radius.
     *
     * @param {Object} d - A link object.
     * @returns {string} - The SVG path string.
     */
    function linkExtensionConstant(d) {
        return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
    }

    root.data.length = 0;
    setRadius(root, 0, innerRadius / maxLength(root));
    PhylogeneticTree.ui.visualization.ColorManager.getColorForTaxa(root);

    const linkExtension = chart.append("g")
        .attr("class", "link-extensions")
        .selectAll("path")
        .data(root.links().filter(d => {
            const isLeaf = !(d.target.children || d.target.branchset);
            return isLeaf;
        }))
        .enter().append("path")
        .each(function (d) {
            d.target.linkExtensionNode = this;
            d.target.linkExtensionData = d;
        })
        .attr("d", linkExtensionConstant)
        .style("pointer-events", "none");

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
        .attr("d", linkConstant)
        .attr("stroke", d => d.target.color)
        .attr("stroke-width", 1.5)
        .style("stroke-linecap", "round");

    const labels = chart.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(root.leaves())
        .enter().append("text")
        .each(function (d) {
            d.labelNode = this;
        })
        .attr("dy", ".31em")
        .attr("font-size", "10px")
        .attr("transform", d => {
            const rotation = d.x - 90;
            const translateX = innerRadius + 4;
            const flip = d.x >= 180 ? "rotate(180)" : "";
            return `rotate(${rotation})translate(${translateX},0)${flip}`;
        })
        .attr("text-anchor", d => {
            return d.x < 180 ? "start" : "end";
        })
        .text(d => d.data.name.replace(/_/g, " "))
        .on("mouseover", function (event, d) {
            d3.select(this).transition().attr("font-size", "12px");
            PhylogeneticTree.ui.interactions.hoverFunctions.mouseOvered(true).call(this, d);
        })
        .on("mouseout", function (event, d) {
            d3.select(this).transition().attr("font-size", "10px");
            PhylogeneticTree.ui.interactions.hoverFunctions.mouseOvered(false).call(this, d);
        });
}

PhylogeneticTree.ui.visualization.TreeRenderer = {
    renderTree
};