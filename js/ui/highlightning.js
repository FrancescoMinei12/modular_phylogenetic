let currentHighlight = null;

export function highlightPathAndLabel(taxonName) {
    const chart = d3.select(".tree-chart");
    const root = chart.datum();

    if (!root) {
        console.error("Dati albero non trovati. Verifica la classe .tree-chart");
        return;
    }

    // Toggle deselezione se clicchi lo stesso elemento
    if (currentHighlight === taxonName) {
        resetHighlights();
        currentHighlight = null;
        return;
    }

    // Reset di tutte le evidenziazioni precedenti
    resetHighlights();

    // Trova il nodo target
    let targetNode = findNode(root, taxonName);

    if (!targetNode) {
        handleNotFound(taxonName);
        return;
    }

    // Evidenzia il percorso
    highlightPath(targetNode);

    // Evidenzia la riga nella tabella
    d3.select(`.taxa-table tr[data-taxon="${taxonName}"]`)
        .classed("highlighted", true);

    currentHighlight = taxonName;
}

function resetHighlights() {
    d3.selectAll(".link--active, .label--active, .node--active")
        .classed("link--active label--active node--active", false);
    d3.selectAll(".taxa-table tr.highlighted")
        .classed("highlighted", false);
}

function findNode(node, taxonName) {
    let foundNode = null;
    node.each(d => {
        if (d.data.name === taxonName) foundNode = d;
    });
    return foundNode;
}

function handleNotFound(taxonName) {
    console.error(`Taxon "${taxonName}" non trovato. Verifica:`);
    console.error("- Il nome corrisponde esattamente");
    console.error("- La struttura dell'albero è corretta");
}

function highlightPath(targetNode) {
    let currentNode = targetNode;
    while (currentNode) {
        if (currentNode.linkNode) {
            d3.select(currentNode.linkNode)
                .classed("link--active", true)
                .raise();
        }
        if (currentNode.labelNode) {
            d3.select(currentNode.labelNode)
                .classed("label--active", true)
                .raise();
        }
        if (currentNode.nodeElement) {
            d3.select(currentNode.nodeElement)
                .classed("node--active", true)
                .raise();
        }
        currentNode = currentNode.parent;
    }
}