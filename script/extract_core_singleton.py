import json


def parse_fasta(file_path):
    """
    @brief Parse a FASTA file and return a dictionary of sequences

    @param file_path Path to the FASTA file
    @return Dictionary with sequence IDs as keys and sequences as values
    """
    sequences = {}
    current_id = None
    current_seq = []

    with open(file_path, "r") as file:
        for line in file:
            line = line.strip()
            if not line:
                continue

            if line.startswith(">"):
                if current_id:
                    sequences[current_id] = "".join(current_seq)

                current_id = line[1:]
                current_seq = []
            else:
                current_seq.append(line)

        if current_id:
            sequences[current_id] = "".join(current_seq)

    return sequences


def extract_gene_info(sequence_id):
    """
    @brief Extract genome, contig and gene information from a sequence ID

    @param sequence_id Sequence identifier in format "genome_id:contig_id:gene_id:version"
    @return Dictionary containing extracted information
    """
    parts = sequence_id.split(":")
    if len(parts) >= 3:
        genome_id = parts[0]
        contig_id = parts[1]
        gene_id = parts[2]
        return {"genome_id": genome_id, "contig_id": contig_id, "gene_id": gene_id}
    return {"id": sequence_id}


def main():
    """
    @brief Main function that processes core and singleton genes from FASTA files

    Reads singleton.fasta and core.fasta files, processes their contents,
    and exports the results to gene_classification.json
    """
    singleton_genes = parse_fasta("singleton.fasta")
    core_genes = parse_fasta("core.fasta")

    gene_data = {"core": [], "singleton": []}

    for seq_id, sequence in singleton_genes.items():
        gene_info = extract_gene_info(seq_id)
        gene_info["sequence"] = sequence
        gene_data["singleton"].append(gene_info)

    for seq_id, sequence in core_genes.items():
        gene_info = extract_gene_info(seq_id)
        gene_info["sequence"] = sequence
        gene_data["core"].append(gene_info)

    with open("gene_classification.json", "w") as json_file:
        json.dump(gene_data, json_file, indent=2)

    print(
        f"Exported {len(gene_data['core'])} core genes and {len(gene_data['singleton'])} singleton genes to gene_classification.json"
    )


if __name__ == "__main__":
    main()
