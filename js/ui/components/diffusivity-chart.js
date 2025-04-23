import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @module DiffusivityChart
 * @description Provides visualization components for gene family diffusivity
 */

/**
 * @function createChart
 * @description Creates a mini chart showing gene family distribution
 * @param {number} singleton - Singleton count
 * @param {number} dispensable - Dispensable count
 * @param {number} core - Core count
 * @param {number} total - Total families count
 * @returns {HTMLElement} The chart element
 */
function createChart(singleton, dispensable, core, total) {
    const container = document.createElement('div');
    container.className = 'diffusivity-chart p-3 bg-white rounded-lg shadow-lg border border-gray-300';
    container.style.width = '220px';
    container.style.position = 'absolute';
    container.style.zIndex = '1000';
    container.style.animation = 'fadeIn 0.2s ease-out';

    const title = document.createElement('div');
    title.className = 'text-sm font-semibold mb-2 text-center';
    title.textContent = `Gene Families: ${total}`;
    container.appendChild(title);

    const chartBar = document.createElement('div');
    chartBar.className = 'h-6 w-full bg-gray-200 rounded overflow-hidden flex mb-2';

    const addBar = (value, color, label) => {
        if (value === 0) return;

        const bar = document.createElement('div');
        bar.className = `h-full ${color} flex items-center justify-center`;
        bar.style.width = `${(value / total) * 100}%`;
        bar.style.minWidth = '20px';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'text-xs font-bold text-white';
        labelSpan.textContent = value;
        bar.appendChild(labelSpan);

        bar.title = `${label}: ${value} (${Math.round((value / total) * 100)}%)`;
        chartBar.appendChild(bar);
    };

    addBar(singleton, 'chart-singleton', 'Singleton');
    addBar(dispensable, 'chart-dispensable', 'Dispensable');
    addBar(core, 'chart-core', 'Core');

    container.appendChild(chartBar);

    const legend = document.createElement('div');
    legend.className = 'grid grid-cols-3 gap-1 text-xs text-center';

    const addLegendItem = (value, colorClass, label) => {
        const item = document.createElement('div');
        item.className = 'flex flex-col items-center p-1';

        const colorBox = document.createElement('div');
        colorBox.className = `w-4 h-4 ${colorClass} rounded mb-1`;

        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'font-semibold';
        valueSpan.textContent = value;

        item.appendChild(colorBox);
        item.appendChild(valueSpan);
        item.appendChild(labelSpan);
        legend.appendChild(item);
    };

    addLegendItem(singleton, 'chart-singleton', 'Singleton');
    addLegendItem(dispensable, 'chart-dispensable', 'Dispensable');
    addLegendItem(core, 'chart-core', 'Core');

    container.appendChild(legend);

    return container;
}

/**
 * @function addChartStyles
 * @description Adds required styles to the document
 */
function addChartStyles() {
    const style = document.createElement('style');
    style.textContent = `
    .diffusivity-chart {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .chart-singleton { background-color: #ef4444; }
    .chart-dispensable { background-color: #3b82f6; }
    .chart-core { background-color: #10b981; }
    `;
    document.head.appendChild(style);
}

PhylogeneticTree.ui.components.DiffusivityChart = {
    createChart,
    addChartStyles
};

PhylogeneticTree.ui.components.DiffusivityChart.addChartStyles();