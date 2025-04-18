import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import linkage, to_tree
from Bio import Phylo
from io import StringIO


def load_distance_matrix(file_path):
    df = pd.read_csv(file_path, index_col=0)
    return df


def neighbor_joining(distance_matrix):
    labels = list(distance_matrix.index)
    condensed_matrix = distance_matrix.to_numpy()[np.triu_indices(len(labels), k=1)]
    linkage_matrix = linkage(condensed_matrix, method="average")
    root = to_tree(linkage_matrix)
    return convert_to_newick(root, labels)


def convert_to_newick(node, labels):
    """Converte un albero di ClusterNode in una stringa in formato Newick."""
    if node.is_leaf():
        return labels[node.id]

    left = convert_to_newick(node.left, labels)
    right = convert_to_newick(node.right, labels)
    return f"({left}:{node.dist:.5f},{right}:{node.dist:.5f})"


def save_newick(newick_str, filename):
    with open(filename, "w") as f:
        f.write(newick_str + ";")


file_path = "./distance_matrix_pandelos_ai.index"
distance_matrix = load_distance_matrix(file_path)
newick_tree = neighbor_joining(distance_matrix)
save_newick(newick_tree, "tree_pandelos.newick")

print("Albero Newick generato con successo!")
