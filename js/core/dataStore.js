/**
 * @module dataStore
 * @description Module for storing and accessing tree data throughout the application
 */

/**
 * @constant {Object} dataStore
 * @description Central store for tree data with methods for access and modification
 */
export const dataStore = {
    /** @type {Object|null} Tree data structure */
    treeData: null,

    /**
     * @function setTreeData
     * @description Sets the tree data in the store
     * @param {Object} data - The phylogenetic tree data to store
     */
    setTreeData(data) {
        this.treeData = data;
    },

    /**
     * @function getTreeData
     * @description Retrieves the tree data from the store
     * @returns {Object|null} The stored tree data or null if none is set
     */
    getTreeData() {
        return this.treeData;
    }
};