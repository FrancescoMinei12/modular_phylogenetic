export function renderSearchBar(containerSelector, tableSelector) {
    const container = document.querySelector(containerSelector);

    // Crea la barra di ricerca
    const searchBar = document.createElement("input");
    searchBar.type = "text";
    searchBar.placeholder = "Cerca...";
    searchBar.classList.add("search-bar");

    // Aggiungi un evento per la ricerca
    searchBar.addEventListener("input", function () {
        const query = searchBar.value;
        filterTable(query, tableSelector);
    });

    // Aggiungi la barra di ricerca al contenitore
    container.appendChild(searchBar);
}

function filterTable(query, tableSelector) {
    const table = document.querySelector(tableSelector);
    const rows = table.querySelectorAll("tr");

    let hasResults = false;

    rows.forEach((row, index) => {
        if (index === 0) return; // Salta l'intestazione della tabella

        const cells = Array.from(row.querySelectorAll("td"));
        const rowText = cells.map(cell => cell.textContent.toLowerCase()).join(" ");

        if (rowText.includes(query.toLowerCase())) {
            row.style.display = ""; // Mostra la riga
            hasResults = true;
        } else {
            row.style.display = "none"; // Nascondi la riga
        }
    });

    // Mostra un messaggio se non ci sono risultati
    const noResultsRow = table.querySelector(".no-results");
    if (!hasResults) {
        if (!noResultsRow) {
            const noResults = table.insertRow();
            noResults.classList.add("no-results");
            const cell = noResults.insertCell();
            cell.colSpan = table.rows[0].cells.length; // Occupa tutte le colonne
            cell.textContent = "Nessun risultato trovato.";
            cell.style.textAlign = "center";
        }
    } else if (noResultsRow) {
        noResultsRow.remove();
    }
}