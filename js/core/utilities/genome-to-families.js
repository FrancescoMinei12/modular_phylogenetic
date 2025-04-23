import { PhylogeneticTree } from "../../namespace-init.js";
/**
 * @file genome-to-families.js
 * @brief Maps genomes to their associated gene families
 * @description Utility module that processes gene data to create a reverse mapping
 *              from genome identifiers to the gene families they contain.
 */

/**
 * @function mapGenomesToFamilies
 * @brief Creates a mapping between genomes and their associated gene families
 * @description Processes gene data to generate a dictionary where keys are genome
 *              identifiers and values are arrays of gene family IDs present in that genome.
 *              This function reverses the standard gene family-to-genome relationship and
 *              creates a genome-centric view of the data.
 * 
 * @param {Object} geneData - An object where keys are gene family identifiers and 
 *                            values are arrays of genes belonging to that family.
 *                            Each gene object must contain a "genome-name" property.
 * 
 * @returns {Object} A mapping object where:
 *                   - Keys: Genome identifiers
 *                   - Values: Arrays of gene family IDs present in that genome
 *
 */
function mapGenomesToFamilies(geneData) {
    const genomeMap = {};

    Object.entries(geneData).forEach(([familyId, genes]) => {
        genes.forEach(gene => {
            const rawGenome = gene["genome-name"];
            if (!rawGenome) return;

            const genomeId = rawGenome;

            if (!genomeMap[genomeId]) {
                genomeMap[genomeId] = new Set();
            }

            genomeMap[genomeId].add(familyId);
        });
    });

    const result = {};
    for (const genome in genomeMap) {
        result[genome] = Array.from(genomeMap[genome]);
    }

    return result;
}

PhylogeneticTree.core.utilities.Genome = {
    mapGenomesToFamilies
}