import json


def extract_gene_info(json_data):
    extracted_data = {}
    for family in json_data:
        family_name = family["family-name"]
        extracted_data[family_name] = []
        for gene in family["genes"]:
            extracted_data[family_name].append(
                {
                    "complete-identifier": gene["complete-identifier"],
                    "genome-name": gene["genome-name"],
                    "locus-tag": gene["locus-tag"],
                    "product": gene["product"],
                }
            )
    return extracted_data


def main():
    file_path = "./custom_mycoplasma.json"
    output_file = "extracted_data.json"

    with open(file_path, "r", encoding="utf-8") as file:
        json_data = json.load(file)

    extracted_data = extract_gene_info(json_data)

    with open(output_file, "w", encoding="utf-8") as outfile:
        json.dump(extracted_data, outfile, indent=4)

    print(f"Dati estratti salvati in {output_file}")


if __name__ == "__main__":
    main()
