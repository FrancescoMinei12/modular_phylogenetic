from Bio import Phylo
from io import StringIO
import json


def newick_to_json_file(input_file, output_file):
    with open(input_file, "r") as f:
        newick_str = f.read().strip()

    tree = Phylo.read(StringIO(newick_str), "newick")

    inner_counter = [0]

    def clade_to_json(clade):
        if clade.name:
            node = {"name": clade.name}
        else:
            inner_counter[0] += 1
            node = {"name": f"Inner{inner_counter[0]}"}

        if clade.clades:
            node["children"] = [clade_to_json(child) for child in clade.clades]

        return node

    tree_json = clade_to_json(tree.root)
    with open(output_file, "w") as out:
        json.dump(tree_json, out, indent=4)


newick_to_json_file("tree_pandelos.newick", "albero_nj.json")
