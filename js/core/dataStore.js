export const dataStore = {
    treeData: null,
    setTreeData(data) {
        this.treeData = data;
    },
    getTreeData() {
        return this.treeData;
    }
};
