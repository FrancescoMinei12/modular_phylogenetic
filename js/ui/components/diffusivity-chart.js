/**
 * @module TaxaDistributionChart
 * @description Component for rendering the taxa distribution pie chart using Chart.js
 */

import { PhylogeneticTree } from "../../namespace-init.js";

let chartInstance = null;

function createContainer() {
    const container = document.createElement("div");
    container.id = "taxa-distribution-chart";
    container.classList.add(
        "mb-4", "p-4", "bg-white", "rounded", "shadow",
        "flex", "flex-col", "items-center"
    );
    container.style.height = "300px";

    const title = document.createElement("h3");
    title.textContent = "Gene Family Distribution";
    title.classList.add("text-lg", "font-semibold", "mb-2");

    const canvas = document.createElement("canvas");
    canvas.id = "taxa-pie-chart";
    canvas.style.maxHeight = "250px";

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset chart to global view";
    resetBtn.classList.add("px-3", "py-1", "bg-blue-500", "text-white", "rounded", "text-sm", "hover:bg-blue-600", "mt-2");
    resetBtn.addEventListener("click", () => initialize());

    container.appendChild(title);
    container.appendChild(canvas);
    container.appendChild(resetBtn);

    return container;
}

function createChart(data, title) {
    const canvas = document.getElementById("taxa-pie-chart");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(canvas, {
        type: "pie",
        data: {
            labels: ["Singleton", "Dispensable", "Core"],
            datasets: [{
                data: [data.singleton, data.dispensable, data.core],
                backgroundColor: ["#FF5733", "#FFC300", "#33FF57"],
                borderColor: "#ffffff",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "right" },
                title: {
                    display: true,
                    text: `Gene Families for ${title}`
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || "";
                            const value = context.raw || 0;
                            const total = data.singleton + data.dispensable + data.core;
                            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
}

function initialize() {
    const geneData = PhylogeneticTree.core.data.getGeneData();
    if (!geneData) return;

    const { singletonThreshold, coreThreshold } = PhylogeneticTree.ui.components.TreeControls.getThresholds();

    let totalSingleton = 0, totalDispensable = 0, totalCore = 0;

    Object.keys(geneData).forEach(familyId => {
        const diffusivity = PhylogeneticTree.core.utilities.GeneFamilyStats.getFamilyDiffusivity(familyId, geneData);
        if (diffusivity <= singletonThreshold) totalSingleton++;
        else if (diffusivity >= coreThreshold) totalCore++;
        else totalDispensable++;
    });

    createChart({ singleton: totalSingleton, dispensable: totalDispensable, core: totalCore }, "All Genomes");
}

function update(stats, taxonName) {
    createChart({
        singleton: stats.singleton,
        dispensable: stats.dispensable,
        core: stats.core
    }, taxonName);
}

PhylogeneticTree.ui.components.TaxaDistributionChart = {
    createContainer,
    initialize,
    update
};
