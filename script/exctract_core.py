import json
from collections import defaultdict

with open("../files/PanDelos-plus.json", "r") as f:
    data = json.load(f)

all_genomes = set()
for family in data:
    for gene in family["genes"]:
        all_genomes.add(gene["genome-name"])

genome_count = len(all_genomes)

core_genes = []
singleton_genes = []

for family in data:
    genomes_in_family = set(gene["genome-name"] for gene in family["genes"])
    if len(genomes_in_family) == 1:
        singleton_genes.append(family["family-name"])
    elif len(genomes_in_family) == genome_count:
        core_genes.append(family["family-name"])

print(f"Totale genomi: {genome_count}")
print(f"Geni core: {len(core_genes)}")
print(f"Geni singleton: {len(singleton_genes)}\n")

print("Esempi di geni core:")
print(core_genes[:5])

print("\nEsempi di geni singleton:")
print(singleton_genes[:5])
