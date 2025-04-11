import { PhylogeneticTree } from "../../namespace-init.js";
/**
 * @module hoverFunctions
 * @description Module for handling hover interactions in the phylogenetic tree visualization
 */

/**
 * @function mouseOvered
 * @description Creates a hover handler function that highlights nodes, links and paths
 * @param {boolean} active - Whether the hover state is active or not
 * @returns {Function} Handler function for mouseover/mouseout events
 */
function mouseOvered(active) {
    return function (d) {
        d3.select(this).classed("label--active", active);

        d3.select(d.linkExtensionNode)
            .classed("link-extension--active", active)
            .attr("stroke", active ? "#FF6347" : "#000")
            .attr("stroke-width", active ? "2px" : "0.5px")
            .attr("stroke-opacity", active ? 1 : 0.25)
            .each(moveToFront);

        let current = d;
        do {
            if (current.linkNode) {
                d3.select(current.linkNode)
                    .classed("link--active", active)
                    .attr("stroke", active ? "#FF6347" : "#000")
                    .attr("stroke-width", active ? "3px" : "1.5px")
                    .each(moveToFront);
            }
        } while (current = current.parent);
    };
}

/**
 * @function moveToFront
 * @description Moves the current SVG element to the front of its container
 * @private
 */
function moveToFront() {
    this.parentNode.appendChild(this);
}

PhylogeneticTree.ui.interactions.hoverFunctions = {
    mouseOvered
};