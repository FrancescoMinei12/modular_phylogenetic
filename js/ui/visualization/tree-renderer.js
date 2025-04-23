import { PhylogeneticTree } from "../../namespace-init.js";
/**
 * @module treeRenderer
 * @description Module responsible for rendering a radial phylogenetic tree using D3.js.
 * It builds the tree layout, draws nodes and links, applies color styles, 
 * and enables interactivity through event listeners.
 */

let geneData = {};

/**
 * Sets the gene data for the renderer
 * 
 * @param {Object} data - The extracted gene data containing prevalence information in genomes
 */
function setGeneData(data) {
    geneData = data;
}

function renderTree(treeData, container) {
    const { outerRadius, innerRadius } = getTreeDimensions();
    const root = buildHierarchy(treeData, innerRadius);
    const svg = createSvgContainer(container, outerRadius);
    const chart = createTreeChart(svg, root, outerRadius);

    PhylogeneticTree.ui.visualization.ColorManager.getColorForTaxa(root);

    renderLinks(chart, root, innerRadius);
    renderNodes(chart, root, innerRadius);
    renderLabels(chart, root, innerRadius);
}

function getTreeDimensions() {
    const cfg = PhylogeneticTree.ui.config.Tree.TreeConfig;
    const minDim = Math.min(cfg.width, cfg.height);
    const outerRadius = minDim * cfg.radial.outerRadiusRatio;
    const innerRadius = outerRadius - 100;
    return { outerRadius, innerRadius };
}

function buildHierarchy(treeData, innerRadius) {
    const root = d3.hierarchy(treeData, d => d.branchset)
        .each(d => {
            if (d.data.name) d.data.originalName = d.data.name;
        })
        .sum(d => d.branchset ? 0 : 1)
        .sort((a, b) => (a.value - b.value) || d3.ascending(a.data.length, b.data.length));

    const cluster = d3.cluster().size([360, innerRadius]).separation(() => 1);

    const maxLength = d => d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
    const setRadius = (d, y0, k) => {
        d.radius = (y0 += d.data.length) * k;
        if (d.children) d.children.forEach(child => setRadius(child, y0, k));
    };

    root.data.length = 0;
    setRadius(root, 0, innerRadius / maxLength(root));
    cluster(root);
    return root;
}

function createSvgContainer(container, outerRadius) {
    return d3.select(container).append("svg")
        .attr("width", outerRadius * 2)
        .attr("height", outerRadius * 2)
        .style("display", "block")
        .style("margin", "0 auto")
        .style("overflow", "visible");
}

function createTreeChart(svg, root, outerRadius) {
    return svg.append("g")
        .attr("class", "tree-chart")
        .datum(root)
        .attr("transform", `translate(${outerRadius},${outerRadius})`);
}

function renderLinks(chart, root, innerRadius) {
    const linkStep = (a, r1, b, r2) => {
        const [ca, sa] = [Math.cos((a - 90) * Math.PI / 180), Math.sin((a - 90) * Math.PI / 180)];
        const [cb, sb] = [Math.cos((b - 90) * Math.PI / 180), Math.sin((b - 90) * Math.PI / 180)];
        return `M${r1 * ca},${r1 * sa}A${r1},${r1} 0 0 ${b > a ? 1 : 0} ${r1 * cb},${r1 * sb}L${r2 * cb},${r2 * sb}`;
    };

    chart.append("g").attr("class", "link-extensions")
        .selectAll("path")
        .data(root.links().filter(d => !(d.target.children || d.target.branchset)))
        .enter().append("path")
        .attr("d", d => linkStep(d.target.x, d.target.y, d.target.x, innerRadius))
        .style("pointer-events", "none");

    chart.append("g").attr("class", "links")
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
        .attr("d", d => linkStep(d.source.x, d.source.y, d.target.x, d.target.y))
        .attr("stroke", d => d.target.color)
        .attr("stroke-width", 1.5)
        .style("stroke-linecap", "round");
}

function renderLabels(chart, root, innerRadius) {
    chart.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(root.leaves())
        .enter().append("text")
        .attr("data-taxon", d => d.data.originalName)
        .attr("data-taxon", d => d.data.name)
        .attr("dy", ".31em")
        .attr("font-size", "10px")
        .attr("transform", d => {
            const rot = d.x - 90;
            const flip = d.x >= 180 ? "rotate(180)" : "";
            return `rotate(${rot})translate(${innerRadius + 4},0)${flip}`;
        })
        .attr("text-anchor", d => d.x < 180 ? "start" : "end")
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

function renderNodes(chart, root, innerRadius) {
    const nodeGroup = chart.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("class", "node")
        .attr("id", d => `node-${d.data.name.replace(/[^a-zA-Z0-9]/g, "_")}`)
        .attr("transform", d => `rotate(${d.x - 90})translate(${d.y},0)`)
        .on("mouseover", function (event, d) {
            d3.select(this).select("circle")
                .transition().attr("r", 5);
            PhylogeneticTree.ui.interactions.hoverFunctions.mouseOvered(true).call(this, d);
        })
        .on("mouseout", function (event, d) {
            d3.select(this).select("circle")
                .transition().attr("r", 3);
            PhylogeneticTree.ui.interactions.hoverFunctions.mouseOvered(false).call(this, d);
        })
        .each(function (d) {
            if (d.data.name && !d.data.name.startsWith("Inner")) {
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

    nodeGroup.append("circle")
        .attr("r", 3)
        .attr("fill", d => d.color || "#4A90E2");
}


PhylogeneticTree.ui.visualization.TreeRenderer = {
    renderTree,
    setGeneData
};