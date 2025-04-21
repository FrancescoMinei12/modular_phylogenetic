import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module pagination
 * @description Component for managing pagination in tables
 */

/**
 * @function applyPagination
 * @description Applies pagination to a dataset and renders the controls
 * @param {Array} data - The complete dataset to paginate
 * @param {string} containerId - ID of the container where pagination controls will be inserted
 * @param {Function} renderCallback - Function to call for rendering paginated data
 * @param {Object} [options={}] - Configuration options
 * @param {number} [options.itemsPerPage=20] - Number of items to display per page
 * @param {number} [options.pageButtonCount=5] - Maximum number of page buttons to display
 * @returns {Object} Object with methods to control pagination
 */
function applyPagination(data, containerId, renderCallback, options = {}) {
    const config = {
        itemsPerPage: options.itemsPerPage || 20,
        pageButtonCount: options.pageButtonCount || 5
    };

    const state = {
        currentPage: 1,
        totalPages: Math.ceil(data.length / config.itemsPerPage),
        totalItems: data.length
    };

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }

    const paginationControls = document.createElement('div');
    paginationControls.id = `${containerId}-pagination`;
    paginationControls.classList.add(
        'pagination-controls',
        'mt-4',
        'flex',
        'justify-between',
        'items-center'
    );

    /**
     * @function updateView
     * @description Updates the current view with paginated data and refreshes controls
     * @private
     */
    function updateView() {
        const startIndex = (state.currentPage - 1) * config.itemsPerPage;
        const endIndex = Math.min(startIndex + config.itemsPerPage, data.length);
        const pageData = data.slice(startIndex, endIndex);
        renderCallback(pageData);
        renderPaginationControls();
    }

    /**
     * @function renderPaginationControls
     * @description Renders the pagination controls UI
     * @private
     */
    function renderPaginationControls() {
        paginationControls.innerHTML = '';

        const pageInfo = document.createElement('div');
        pageInfo.classList.add('text-sm', 'text-gray-600');
        pageInfo.innerText = `Pagina ${state.currentPage} di ${state.totalPages} (${state.totalItems} elementi)`;

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('flex', 'gap-1');

        const firstPageButton = createButton('First', function () {
            if (state.currentPage > 1) {
                state.currentPage = 1;
                updateView();
            }
        });
        firstPageButton.disabled = state.currentPage === 1;
        buttonsContainer.appendChild(firstPageButton);

        const prevButton = createButton('«', function () {
            if (state.currentPage > 1) {
                state.currentPage--;
                updateView();
            }
        });
        prevButton.disabled = state.currentPage === 1;
        buttonsContainer.appendChild(prevButton);

        const pageButtonCount = 3;
        const halfButtons = Math.floor(pageButtonCount / 2);

        let startPage = state.currentPage - halfButtons;
        let endPage = state.currentPage + halfButtons;

        if (startPage < 1) {
            startPage = 1;
            endPage = Math.min(state.totalPages, 3);
        }

        if (endPage > state.totalPages) {
            endPage = state.totalPages;
            startPage = Math.max(1, state.totalPages - 2);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = createButton(i.toString(), function () {
                state.currentPage = i;
                updateView();
            });

            if (i === state.currentPage) {
                pageButton.classList.add('bg-blue-600', 'text-white');
            }

            buttonsContainer.appendChild(pageButton);
        }

        const nextButton = createButton('»', function () {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                updateView();
            }
        });
        nextButton.disabled = state.currentPage === state.totalPages;
        buttonsContainer.appendChild(nextButton);

        const lastPageButton = createButton('Last', function () {
            if (state.currentPage < state.totalPages) {
                state.currentPage = state.totalPages;
                updateView();
            }
        });
        lastPageButton.disabled = state.currentPage === state.totalPages;
        buttonsContainer.appendChild(lastPageButton);

        paginationControls.appendChild(pageInfo);
        paginationControls.appendChild(buttonsContainer);

        if (!container.contains(paginationControls)) {
            container.appendChild(paginationControls);
        }
    }

    /**
     * @function createButton
     * @description Creates a styled button for pagination controls
     * @param {string} text - Text to display on the button
     * @param {Function} onClick - Event handler for button click
     * @returns {HTMLButtonElement} Configured button element
     * @private
     */
    function createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add(
            'px-3',
            'py-1',
            'border',
            'rounded',
            'hover:bg-gray-100',
            'focus:outline-none',
            'disabled:opacity-50',
            'disabled:cursor-not-allowed'
        );
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * @function goToPage
     * @description Navigate to a specific page number
     * @param {number} page - Page number to navigate to
     */
    function goToPage(page) {
        if (page >= 1 && page <= state.totalPages) {
            state.currentPage = page;
            updateView();
        }
    }

    /**
     * @function nextPage
     * @description Navigate to the next page if available
     */
    function nextPage() {
        if (state.currentPage < state.totalPages) {
            state.currentPage++;
            updateView();
        }
    }

    /**
     * @function prevPage
     * @description Navigate to the previous page if available
     */
    function prevPage() {
        if (state.currentPage > 1) {
            state.currentPage--;
            updateView();
        }
    }

    /**
     * @function refresh
     * @description Refresh the current pagination view
     */
    function refresh() {
        updateView();
    }

    /**
     * @function setItemsPerPage
     * @description Change the number of items displayed per page
     * @param {number} count - Number of items to show per page
     */
    function setItemsPerPage(count) {
        config.itemsPerPage = count;
        state.totalPages = Math.ceil(data.length / config.itemsPerPage);
        state.currentPage = 1;
        updateView();
    }

    /**
     * @function getCurrentPage
     * @description Get the current page number
     * @returns {number} Current page number
     */
    function getCurrentPage() {
        return state.currentPage;
    }

    /**
     * @function getTotalPages
     * @description Get the total number of pages
     * @returns {number} Total number of pages
     */
    function getTotalPages() {
        return state.totalPages;
    }

    updateView();

    return {
        goToPage,
        nextPage,
        prevPage,
        refresh,
        setItemsPerPage,
        getCurrentPage,
        getTotalPages
    };
}

PhylogeneticTree.ui.components.Pagination = {
    applyPagination: applyPagination
};