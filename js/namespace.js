/**
 * @file namespace.js
 * @brief Centralized namespace system for the phylogenetic application
 * @description This file defines the main namespace structure for a phylogenetic application,
 *              organizing functionality into logical categories including core operations
 *              and user interface components.
 */

/**
 * @namespace PhylogeneticTree
 * @brief Main namespace for the phylogenetic application
 * @description The root namespace that contains all functionality for the phylogenetic application.
 *              It's organized into two main subcategories: core functionality and UI components.
 */
export const PhylogeneticTree = {
    /**
     * @namespace core
     * @brief Core functionality namespace
     * @description Contains fundamental operations and processing capabilities for phylogenetic data.
     */
    core: {
        /**
         * @namespace io
         * @brief Input/Output operations
         * @description Namespace for handling data input and output operations.
         */
        io: {},

        /**
         * @namespace parser
         * @brief Data parsing utilities
         * @description Namespace containing data parsing and transformation utilities.
         */
        parser: {},

        /**
         * @namespace taxonomy
         * @brief Taxonomic operations
         * @description Namespace for taxonomic classification and related operations.
         */
        taxonomy: {}
    },

    /**
     * @namespace ui
     * @brief User interface namespace
     * @description Contains all user interface related components and functionality.
     */
    ui: {
        /**
         * @namespace components
         * @brief UI components
         * @description Namespace for reusable UI components.
         */
        components: {},

        /**
         * @namespace interactions
         * @brief User interaction handlers
         * @description Namespace for managing user interactions and event handling.
         */
        interactions: {},

        /**
         * @namespace visualization
         * @brief Data visualization
         * @description Namespace for phylogenetic data visualization components.
         */
        visualization: {}
    }
};