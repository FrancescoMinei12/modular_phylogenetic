import { highlightPathAndLabel, highlightGeneFamily } from "./highlightning.js";
import { renderSearchBar } from "../visualization/searchBarRenderer.js";

export function renderGeneFamilyTable(data, container) {
    console.log("Inizio rendering della tabella delle famiglie geniche...");
    const tableContainer = document.querySelector(container);
    tableContainer.innerHTML = "";

    // Crea un contenitore per la barra di ricerca e la tabella
    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("taxa-table-container");

    // Aggiungi la barra di ricerca
    renderSearchBar(container, `${container} table`);

    // Crea la tabella
    const table = document.createElement("table");
    table.classList.add("gene-family-table");

    // Crea l'header della tabella - solo colonna Famiglia
    const header = table.createTHead();
    const headerRow = header.insertRow();
    const th = document.createElement("th");
    th.textContent = "Famiglia";
    headerRow.appendChild(th);

    // Crea il corpo della tabella
    const tbody = table.createTBody();

    // Estrai le famiglie geniche
    console.log("Estrazione delle famiglie geniche...");
    const families = extractFamilies(data);
    console.log("Famiglie estratte:", families.length);

    // Popola la tabella con le famiglie
    families.forEach(familyId => {
        console.log("Aggiunta riga per la famiglia:", familyId);

        const row = tbody.insertRow();
        row.classList.add("clickable-row");
        row.style.cursor = "pointer";

        row.dataset.family = familyId;

        const familyCell = row.insertCell();
        familyCell.textContent = familyId;

        row.addEventListener("click", function () {
            // Usa la nuova funzione per evidenziare l'intera famiglia genica
            try {
                highlightGeneFamily(data, familyId);
            } catch (e) {
                console.log("Errore nell'highlighting della famiglia genica:", e);
            }
        });
    });

    console.log("Aggiunta della tabella al contenitore...");
    tableWrapper.appendChild(table);
    tableContainer.appendChild(tableWrapper);
    console.log("Rendering della tabella completato.");
}

function extractFamilies(data) {
    console.log("[DEBUG] Dati delle famiglie in input:", Object.keys(data).length);

    // Estrai le chiavi e ordinale alfabeticamente
    const families = Object.keys(data);
    families.sort((a, b) => a.localeCompare(b));

    console.log("[DEBUG] Famiglie estratte:", families.length);
    return families;
}