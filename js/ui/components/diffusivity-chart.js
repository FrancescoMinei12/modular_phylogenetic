/**
 * @module TaxaDistributionChart
 * @description Component for rendering the taxa distribution pie chart using Chart.js
 */

import { PhylogeneticTree } from "../../namespace-init.js";

let chartInstance = null;
let currentTaxon = null;

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

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("flex", "gap-2", "mt-2");

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset chart to global view";
    resetBtn.classList.add("px-3", "py-1", "bg-blue-500", "text-white", "rounded", "text-sm", "hover:bg-blue-600");
    resetBtn.addEventListener("click", () => {
        currentTaxon = null;
        initialize();
    });

    const exportPngBtn = document.createElement("button");
    exportPngBtn.textContent = "Export as PNG";
    exportPngBtn.classList.add("px-3", "py-1", "bg-green-500", "text-white", "rounded", "text-sm", "hover:bg-green-600");
    exportPngBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });

    buttonContainer.appendChild(resetBtn);
    buttonContainer.appendChild(exportPngBtn);

    container.appendChild(title);
    container.appendChild(canvas);
    container.appendChild(buttonContainer);

    return container;
}

function createChart(data, title) {
    const canvas = document.getElementById("taxa-pie-chart");

    if (chartInstance) {
        chartInstance.destroy();
    }

    const labels = [
        `Singleton (${data.singleton})`,
        `Dispensable (${data.dispensable})`,
        `Core (${data.core})`
    ];

    const total = data.singleton + data.dispensable + data.core;

    chartInstance = new Chart(canvas, {
        type: "pie",
        data: {
            labels: labels,
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
                legend: {
                    position: "right",
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: [`Gene Families for ${title}`, `Total: ${total}`],
                    font: {
                        size: 14
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || "";
                            const value = context.raw || 0;
                            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${value} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
}

function initialize() {
    if (currentTaxon) {
        const { singletonThreshold, coreThreshold } = PhylogeneticTree.ui.components.TreeControls.getThresholds();
        const geneData = PhylogeneticTree.core.data.getGeneData();

        const stats = PhylogeneticTree.core.utilities.GeneFamilyStats.calculateTaxonStats(
            currentTaxon.originalName || currentTaxon.name,
            geneData,
            singletonThreshold,
            coreThreshold
        );

        if (stats) {
            update(stats, currentTaxon.name || "Selected Taxon");
            return;
        }
    }
    const geneData = PhylogeneticTree.core.data.getGeneData();
    if (!geneData) return;

    let canvas = document.getElementById("taxa-pie-chart");
    const container = document.getElementById("taxa-distribution-chart");

    if (!canvas || !container || !document.body.contains(container)) {
        const targetContainer = document.querySelector(".taxa-table-container");
        if (!targetContainer) {
            console.error("Target container for chart not found");
            return;
        }

        if (container && document.body.contains(container)) {
            container.remove();
        }

        const newContainer = createContainer();
        targetContainer.appendChild(newContainer);

        canvas = document.getElementById("taxa-pie-chart");
    }

    if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0) {
        canvas.style.width = "100%";
        canvas.style.height = "250px";
    }

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

function update(stats, taxonName, originalName) {
    if (taxonName && taxonName !== "All Genomes") {
        currentTaxon = {
            name: taxonName,
            originalName: originalName || taxonName.replace(/\s/g, "_")
        };
    }

    createChart({
        singleton: stats.singleton,
        dispensable: stats.dispensable,
        core: stats.core
    }, taxonName);
}

function resetToGlobal() {
    currentTaxon = null;
    initialize();
}

PhylogeneticTree.ui.components.TaxaDistributionChart = {
    createContainer,
    initialize,
    update,
    resetToGlobal
};
