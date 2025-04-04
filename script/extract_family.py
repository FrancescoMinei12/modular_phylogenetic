import json


def find_gene_family(node_name, gene_family_data):
    """
    Finds the gene family for a given node name by matching it partially with keys in gene_family_data.

    @param node_name: Name of the node to search for.
    @param gene_family_data: Dictionary mapping node names to gene families.
    @return: List of gene families if found, otherwise the original node name.
    """
    for key, families in gene_family_data.items():
        if node_name in key:  # Partial match
            return families
    return node_name  # Return the original name if no match is found


def transform_tree(node, gene_family_data):
    """
    Recursively transforms the tree by replacing leaf node names with corresponding gene families.

    @param node: Current node in the tree (dict).
    @param gene_family_data: Dictionary mapping node names to gene families.
    @return: Transformed node.
    """
    if "children" in node:
        # Recursively process children
        node["children"] = [
            transform_tree(child, gene_family_data) for child in node["children"]
        ]
    else:
        # Replace leaf node name with gene families if available
        node["name"] = find_gene_family(node["name"], gene_family_data)
    return node


def main():
    # Paths to input files
    tree_path = "c:\\Users\\fra\\Desktop\\Code\\modular_phylogenetic\\albero_nj.json"
    gene_family_path = (
        "c:\\Users\\fra\\Desktop\\Code\\modular_phylogenetic\\geneFamily.json"
    )

    # Load the tree and gene family data
    with open(tree_path, "r") as tree_file:
        tree_data = json.load(tree_file)

    with open(gene_family_path, "r") as gene_family_file:
        gene_family_data = json.load(gene_family_file)

    # Transform the tree
    transformed_tree = transform_tree(tree_data, gene_family_data)

    # Save the transformed tree back to the same file
    with open("test_albero.json", "w") as tree_file:
        json.dump(transformed_tree, tree_file, indent=2)

    print(f"Tree successfully transformed and saved to {'test_albero.json'}")


if __name__ == "__main__":
    main()
