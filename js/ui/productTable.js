import { renderSearchBar } from "../visualization/searchBarRenderer.js";
import { highlightProduct } from "./highlightning.js";

/**
 * @module productTable
 * @description Module for rendering and managing the products table with search and highlighting functionality
 */

/**
 * @function renderProductTable
 * @description Renders a table displaying products and their occurrences from gene data
 * @param {Object} data - The extracted gene data containing product information
 * @param {string} tableSelector - CSS selector for the container where the table will be rendered
 */
export function renderProductTable(data, tableSelector) {
    const tableContainer = document.querySelector(tableSelector);
    tableContainer.innerHTML = "";

    renderSearchBar(tableSelector, `${tableSelector} table`);

    const tableWrapper = document.createElement("div");
    tableWrapper.classList.add("product-table-container");
    tableWrapper.classList.add("h-[400px]");
    tableWrapper.classList.add("overflow-y-auto");
    tableWrapper.classList.add("pr-2");

    const productTable = document.createElement("table");
    productTable.classList.add("product-table");

    const tableHeader = productTable.createTHead();
    const headerRow = tableHeader.insertRow();
    const productHeaderCell = document.createElement("th");
    productHeaderCell.textContent = "Prodotto";
    headerRow.appendChild(productHeaderCell);

    const countHeaderCell = document.createElement("th");
    countHeaderCell.textContent = "Occorrenze";
    headerRow.appendChild(countHeaderCell);

    const productCounts = countProducts(data);
    const tableBody = productTable.createTBody();

    productCounts.forEach(([productName, occurrenceCount]) => {
        const tableRow = tableBody.insertRow();
        tableRow.classList.add("clickable-row");
        tableRow.style.cursor = "pointer";

        tableRow.dataset.product = productName;

        const productCell = tableRow.insertCell();
        productCell.textContent = productName;

        const countCell = tableRow.insertCell();
        countCell.textContent = occurrenceCount;

        /**
         * @event click
         * @description Handles row click to toggle highlighting and visualize connected elements
         */
        tableRow.addEventListener("click", function () {
            this.classList.toggle("highlighted");
            highlightProduct(data, productName);
        });
    });

    tableWrapper.appendChild(productTable);
    tableContainer.appendChild(tableWrapper);
}

/**
 * @function countProducts
 * @description Counts occurrences of each product across all gene families and sorts them by count
 * @param {Object} data - The extracted gene data containing product information
 * @returns {Array} Array of [product, count] pairs sorted in descending order by count
 * @private
 */
function countProducts(data) {
    const productMap = new Map();

    Object.keys(data).forEach(familyKey => {
        const genes = data[familyKey];

        genes.forEach(gene => {
            const productName = gene.product;

            if (productMap.has(productName)) {
                productMap.set(productName, productMap.get(productName) + 1);
            } else {
                productMap.set(productName, 1);
            }
        });
    });

    return Array.from(productMap.entries())
        .sort((a, b) => b[1] - a[1]);
}