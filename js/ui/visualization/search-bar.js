import { PhylogeneticTree } from "../../namespace-init.js";
/**
 * @file searchBarRenderer.js
 * @brief Module for rendering and handling search bar functionality for tables
 */

/**
 * @function renderSearchBar
 * @brief Creates and appends a search bar that filters table content
 * @param {string} containerSelector - CSS selector for the container element
 * @param {string} tableSelector - CSS selector for the table to be filtered
 */
function renderSearchBar(containerSelector, tableSelector) {
    const containerElement = document.querySelector(containerSelector);

    const searchBarElement = document.createElement("input");
    searchBarElement.type = "text";
    searchBarElement.placeholder = "Search...";
    searchBarElement.classList.add("search-bar");

    searchBarElement.addEventListener("input", function () {
        const queryText = searchBarElement.value;
        filterTable(queryText, tableSelector);
    });

    containerElement.appendChild(searchBarElement);
}

/**
 * @function filterTable
 * @brief Filters table rows based on search query text
 * @param {string} queryText - The search text to filter by
 * @param {string} tableSelector - CSS selector for the table to be filtered
 */
function filterTable(queryText, tableSelector) {
    const tableElement = document.querySelector(tableSelector);
    const tableRows = tableElement.querySelectorAll("tr");

    let hasResultsFlag = false;

    tableRows.forEach((rowElement, rowIndex) => {
        if (rowIndex === 0) return;

        const cellElements = Array.from(rowElement.querySelectorAll("td"));
        const rowContent = cellElements.map(cell => cell.textContent.toLowerCase()).join(" ");

        if (rowContent.includes(queryText.toLowerCase())) {
            rowElement.style.display = "";
            hasResultsFlag = true;
        } else {
            rowElement.style.display = "none";
        }
    });

    const noResultsElement = tableElement.querySelector(".no-results");
    if (!hasResultsFlag) {
        if (!noResultsElement) {
            const noResultsRow = tableElement.insertRow();
            noResultsRow.classList.add("no-results");
            const messageCell = noResultsRow.insertCell();
            messageCell.colSpan = tableElement.rows[0].cells.length;
            messageCell.textContent = "Nessun risultato trovato.";
            messageCell.style.textAlign = "center";
        }
    } else if (noResultsElement) {
        noResultsElement.remove();
    }
}

PhylogeneticTree.ui.visualization.SearchBar = {
    renderSearchBar
};