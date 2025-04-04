import json


def extract_family_locus_tags(input_path, output_path=None):
    """
    Extracts family names and their corresponding locus tags from a JSON file.

    @param input_path: Path to the input JSON file.
    @param output_path: (Optional) Path to the output JSON file. If not specified, results are printed to the console.
    """
    with open(input_path, "r") as file:
        data = json.load(file)

    family_data = {}

    for family in data:
        family_name = family["family-name"]
        locus_tags = [gene["locus-tag"] for gene in family["genes"]]
        family_data[family_name] = locus_tags

    if output_path:
        with open(output_path, "w") as file:
            json.dump(family_data, file, indent=2)
        print(f"Results saved to {output_path}")
    else:
        print("Family names and locus tags:")
        for family_name, tags in family_data.items():
            print(f"\n{family_name}:")
            print(", ".join(tags))


if __name__ == "__main__":
    input_path = "../PanDelos-plus.json"
    extract_family_locus_tags(input_path, "geneFamily.json")
