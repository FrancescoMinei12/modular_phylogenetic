import { PhylogeneticTree } from "../../namespace-init.js";
/**
 * @file Configuration for phylogenetic tree visualization
 * @module treeConfig
 */

/**
 * @constant {Object} TreeConfig
 * @description Centralized settings for tree renderers
 * @property {number} width - Visualization width (max 800px or 85% of window)
 * @property {number} height - Fixed height (800px)
 * @property {Object} margin - Margin values {top, right, bottom, left}
 * @property {Object} radial - Radial layout settings {outerRadiusRatio}
 * @property {Object} horizontal - Horizontal layout settings {nodeSpacing}
 */

const TreeConfig = {
    width: Math.min(800, window.innerWidth * 0.85),
    height: Math.min(800, window.innerHeight * 0.85),

    margin: {
        top: 35,
        right: 90,
        bottom: 35,
        left: 90
    },

    radial: {
        outerRadiusRatio: 0.45,
    },
    horizontal: {
        nodeSpacing: 30,
    }
};

PhylogeneticTree.ui.config.Tree = {
    TreeConfig
}