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

export const TreeConfig = {
    width: Math.min(800, window.innerWidth * 0.85),
    height: 800,

    margin: {
        top: 55,
        right: 90,
        bottom: 55,
        left: 90
    },

    radial: {
        outerRadiusRatio: 0.45,
    },
    horizontal: {
        nodeSpacing: 30,
    }
};