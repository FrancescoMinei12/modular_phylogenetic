import re
import csv

# Carica il file FASTA
with open("cds_from_genomic.fna", "r") as file:
    fasta_data = file.read()

# Split su ogni sequenza
entries = fasta_data.strip().split(">")[1:]

parsed_data = []

for entry in entries:
    header, *sequence_lines = entry.strip().split("\n")
    sequence = "".join(sequence_lines)

    # Estrai informazioni dal titolo con regex
    id_match = re.search(r"^lcl\|([^ ]+)", header)
    gene = re.search(r"\[gene=([^\]]+)", header)
    locus_tag = re.search(r"\[locus_tag=([^\]]+)", header)
    protein = re.search(r"\[protein=([^\]]+)", header)
    protein_id = re.search(r"\[protein_id=([^\]]+)", header)
    location = re.search(r"\[location=([^\]]+)", header)

    parsed_data.append(
        {
            "ID": id_match.group(1) if id_match else "",
            "Gene": gene.group(1) if gene else "",
            "Locus Tag": locus_tag.group(1) if locus_tag else "",
            "Protein": protein.group(1) if protein else "",
            "Protein ID": protein_id.group(1) if protein_id else "",
            "Location": location.group(1) if location else "",
            "Sequence": sequence,
        }
    )

# Scrivi il file CSV
with open("output.csv", "w", newline="") as csvfile:
    fieldnames = [
        "ID",
        "Gene",
        "Locus Tag",
        "Protein",
        "Protein ID",
        "Location",
        "Sequence",
    ]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(parsed_data)
