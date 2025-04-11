import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module colorManager
 * @description Module for handling color assignments in the phylogenetic visualization
 */

/**
 * @function getColorForTaxa
 * @description Assigns a color to a taxon based on its name
 * @param {string} taxaName - Name of the taxon to assign color to
 * @returns {string} Hexadecimal color code
 */
function getColorForTaxa(taxaName) {
    try {
        if (!taxaName) {
            console.error("Invalid taxon name provided");
            return "#CCCCCC";
        }

        const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF"];
        return colors[taxaName.length % colors.length];
    } catch (error) {
        console.error(`Error generating color for taxon "${taxaName}":`, error);
        return "#CCCCCC";
    }
}

PhylogeneticTree.ui.visualization.ColorManager = {
    getColorForTaxa
};