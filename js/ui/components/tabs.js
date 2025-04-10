/**
 * @module tabs
 * @description Module for managing tab navigation in the user interface
 */

/**
 * @function showTab
 * @description Changes the active tab by hiding all tab content and showing only the selected one
 * @param {string} tabName - The name identifier of the tab to display
 * @example
 * // Show the taxa tab
 * showTab('taxa');
 */
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const tabLinks = document.querySelectorAll('li');

    tabs.forEach(tab => tab.classList.add('hidden'));

    tabLinks.forEach(link => {
        link.classList.remove('border-b-2', 'border-blue-500');
    });

    document.getElementById(tabName + '-tab').classList.remove('hidden');

    document.getElementById('tab-' + tabName).classList.add('border-b-2', 'border-blue-500');
}

showTab('taxa');