// Variabili per il tracciamento degli elementi evidenziati
let currentHighlight = null;
let currentFamilyHighlight = null;

export function highlightPathAndLabel(taxonName) {
    // Verifica se d3 è disponibile globalmente
    if (typeof d3 === 'undefined') {
        console.error("D3 non è disponibile. Verificare che la libreria sia caricata correttamente.");
        return;
    }

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

export function highlightGeneFamily(data, familyId) {
    console.log("Inizio evidenziazione famiglia genica:", familyId);

    // Verifica se d3 è disponibile globalmente
    if (typeof d3 === 'undefined') {
        console.error("D3 non è disponibile. Verificare che la libreria sia caricata correttamente.");
        return;
    }

    // Toggle deselezione se clicchi la stessa famiglia
    if (currentFamilyHighlight === familyId) {
        console.log("Deselezionando la famiglia corrente:", familyId);
        resetHighlights();
        currentFamilyHighlight = null;
        return;
    }

    // Reset di tutte le evidenziazioni precedenti
    resetHighlights();

    // Ottieni tutti i genomi appartenenti a questa famiglia
    const genomes = new Set();
    if (data[familyId] && Array.isArray(data[familyId])) {
        data[familyId].forEach(gene => {
            if (gene["genome-name"]) {
                genomes.add(gene["genome-name"]);
            }
        });
    }

    console.log(`Trovati ${genomes.size} genomi per la famiglia ${familyId}:`, Array.from(genomes));

    // Evidenzia ogni genoma nell'albero
    let foundAny = false;

    const chart = d3.select(".tree-chart");
    const root = chart.datum();

    if (!root) {
        console.error("Dati albero non trovati. Verifica la classe .tree-chart");
        return;
    }

    genomes.forEach(genome => {
        // Trova il nodo target per questo genoma
        const targetNode = findNode(root, genome);

        if (targetNode) {
            foundAny = true;
            highlightPath(targetNode);
            console.log(`Evidenziato nodo per il genoma ${genome}`);

            // Evidenzia la riga nella tabella dei taxa
            try {
                d3.select(`.taxa-table tr[data-taxon="${genome}"]`)
                    .classed("highlighted", true);
            } catch (e) {
                console.warn(`Impossibile evidenziare la riga della tabella per ${genome}:`, e);
            }
        } else {
            console.warn(`Nodo non trovato per il genoma ${genome}`);
        }
    });

    if (!foundAny) {
        console.error(`Nessun genoma della famiglia "${familyId}" trovato nell'albero filogenetico.`);
    }

    // Evidenzia la riga nella tabella delle famiglie geniche
    try {
        d3.select(`.gene-family-table tr[data-family="${familyId}"]`)
            .classed("highlighted", true);
        console.log(`Evidenziata riga nella tabella per la famiglia ${familyId}`);
    } catch (e) {
        console.warn("Errore nell'evidenziare la riga della tabella:", e);
    }

    currentFamilyHighlight = familyId;
}

function resetHighlights() {
    if (typeof d3 === 'undefined') {
        console.error("D3 non è disponibile. Verificare che la libreria sia caricata correttamente.");
        return;
    }

    try {
        d3.selectAll(".link--active, .label--active, .node--active")
            .classed("link--active", false)
            .classed("label--active", false)
            .classed("node--active", false);

        d3.selectAll(".taxa-table tr.highlighted, .gene-family-table tr.highlighted")
            .classed("highlighted", false);
    } catch (e) {
        console.error("Errore nel reset delle evidenziazioni:", e);
    }
}

function findNode(node, taxonName) {
    let foundNode = null;

    try {
        node.each(d => {
            if (d.data && d.data.name === taxonName) {
                foundNode = d;
            }
        });
    } catch (e) {
        console.error(`Errore nella ricerca del nodo ${taxonName}:`, e);
    }

    return foundNode;
}

function handleNotFound(taxonName) {
    console.error(`Taxon "${taxonName}" non trovato. Verifica:`);
    console.error("- Il nome corrisponde esattamente");
    console.error("- La struttura dell'albero è corretta");
    console.error("- I dati nel JSON sono allineati con i nomi dell'albero");
}

function highlightPath(targetNode) {
    if (typeof d3 === 'undefined') {
        console.error("D3 non è disponibile. Verificare che la libreria sia caricata correttamente.");
        return;
    }

    let currentNode = targetNode;
    while (currentNode) {
        try {
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
        } catch (e) {
            console.warn("Errore nell'evidenziare il percorso:", e);
        }

        currentNode = currentNode.parent;
    }
}