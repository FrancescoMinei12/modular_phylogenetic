import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module GeneFamilyStats
 * @description Provides utilities for calculating gene family statistics
 */

/**
 * @function getFamiliesForTaxon
 * @description Get all gene families for a specific taxon
 * @param {string} taxonName - The name of the taxon
 * @param {Object} geneData - The gene data object
 * @returns {Array} Array of gene family IDs
 */
function getFamiliesForTaxon(taxonName, geneData) {
    const genomeToFamilies = PhylogeneticTree.core.utilities.Genome.mapGenomesToFamilies(geneData);
    return genomeToFamilies[taxonName] || [];
}

/**
 * @function getFamilyDiffusivity
 * @description Calculate diffusivity for a gene family
 * @param {string} familyId - The gene family ID
 * @param {Object} geneData - The gene data object
 * @returns {number} Diffusivity value
 */
function getFamilyDiffusivity(familyId, geneData) {
    const familyGenes = geneData[familyId] || [];
    const distinctGenomes = new Set();

    familyGenes.forEach(gene => {
        if (gene["genome-name"]) {
            distinctGenomes.add(gene["genome-name"]);
        }
    });

    return distinctGenomes.size;
}

/**
 * @function calculateTaxonStats
 * @description Calculate statistics for a taxon
 * @param {string} taxonName - The name of the taxon
 * @param {Object} geneData - The gene data object
 * @returns {Object} Statistics object
 */

function calculateTaxonStats(taxonName, geneData, singletonThreshold = 1, coreThreshold) {
    try {
        const taxonFamilies = getFamiliesForTaxon(taxonName, geneData);
        const totalGenomes = Object.keys(
            PhylogeneticTree.core.utilities.Genome.mapGenomesToFamilies(geneData)
        ).length;

        let singleton = 0, dispensable = 0, core = 0;

        taxonFamilies.forEach(familyId => {
            const diffusivity = getFamilyDiffusivity(familyId, geneData);

            if (diffusivity <= singletonThreshold) singleton++;
            else if (diffusivity >= coreThreshold) core++;
            else dispensable++;
        });

        return {
            singleton, dispensable, core, total: taxonFamilies.length
        };
    } catch (error) {
        console.error(`Error calculating stats for ${taxonName}:`, error);
        return { singleton: 0, dispensable: 0, core: 0, total: 0, totalGenomes };
    }
}

function calculateTotalGenomes(geneData) {
    return Object.keys(PhylogeneticTree.core.utilities.Genome.mapGenomesToFamilies(geneData)).length;
}

PhylogeneticTree.core.utilities.GeneFamilyStats = {
    getFamiliesForTaxon,
    getFamilyDiffusivity,
    calculateTaxonStats,
    calculateTotalGenomes
};