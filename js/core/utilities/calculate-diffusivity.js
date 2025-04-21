import { PhylogeneticTree } from "../../namespace-init.js";
/**
 * @file calculate-diffusivity.js
 * @brief Calculates gene family diffusivity from extracted data
 */

/**
 * @brief Calculates the diffusivity of gene families from extracted data
 * @details This function processes JSON data containing gene information and calculates
 *          how many unique genomes each gene family appears in (diffusivity).
 * 
 * @param {Object} extractedData - JSON object containing the extracted gene data
 * @return {Object} An object with gene families as keys and their diffusivity (unique genome count) as values
 *
 */
export function calculateDiffusivity(data) {
    const result = [];

    for (const familyKey in data) {
        const genomeSet = new Set();

        const genes = data[familyKey];

        genes.forEach(gene => {
            const genomeId = gene["genome-name"];
            genomeSet.add(genomeId);
        });

        const familyName = familyKey.split(":")[0];
        result.push({
            family: familyName,
            fullFamilyKey: familyKey,
            diffusivity: genomeSet.size,
        });
    }

    return result.sort((a, b) => b.diffusivity - a.diffusivity);
}

PhylogeneticTree.core.utilities.Diffusivity = {
    calculateDiffusivity
};