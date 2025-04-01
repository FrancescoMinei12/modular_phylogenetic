import { mouseOvered } from "../ui/hoverFunctions.js";
import { getColorForTaxa } from "../core/colorManager.js";

export function renderTree(treeData, container) {
    console.log("[DEBUG] Inizio rendering albero con dati:", treeData); // Aggiunto

    const outerRadius = Math.min(800, window.innerWidth * 0.6) / 2;
    const innerRadius = outerRadius - 100;
    console.log(`[DEBUG] Raggio calcolato - Esterno: ${outerRadius}, Interno: ${innerRadius}`); // Aggiunto

    const root = d3.hierarchy(treeData, function (d) {
        console.log(`[DEBUG] Processo nodo: ${d?.name || 'senza nome'}`); // Aggiunto
        return d.branchset;
    }).sum(function (d) {
        console.log(`[DEBUG] Assegnazione peso a: ${d?.name} - ${d.branchset ? 'nodo interno' : 'foglia'}`); // Aggiunto
        return d.branchset ? 0 : 1;
    }).sort(function (a, b) {
        console.log(`[DEBUG] Ordina: ${a.data.name} vs ${b.data.name}`); // Aggiunto
        return (a.value - b.value) || d3.ascending(a.data.length, b.data.length);
    });

    const cluster = d3.cluster()
        .size([360, innerRadius])
        .separation(function (a, b) { return 1; });

    const svg = d3.select(container).append("svg")
        .attr("width", outerRadius * 2)
        .attr("height", outerRadius * 2)
        .style("display", "block");

    const chart = svg.append("g")
        .attr("class", "tree-chart") // Aggiungi una classe identificativa
        .datum(root) // Allega i dati direttamente al gruppo <g>
        .attr("transform", `translate(${outerRadius},${outerRadius})`)
        .each(() => console.log("[DEBUG] Gruppo principale creato")); // Aggiunto

    cluster(root);
    console.log("[DEBUG] Layout cluster applicato:", root); // Aggiunto

    function maxLength(d) {
        const result = d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
        console.log(`[DEBUG] maxLength per ${d.data.name}: ${result}`); // Aggiunto
        return result;
    }

    function setRadius(d, y0, k) {
        d.radius = (y0 += d.data.length) * k;
        console.log(`[DEBUG] Imposta raggio ${d.data.name}: ${d.radius}`); // Aggiunto
        if (d.children) d.children.forEach(function (d) { setRadius(d, y0, k); });
    }

    function setColor(d) {
        d.color = d.children ? "#4F46E5" : "#10B981";
        console.log(`[DEBUG] Imposta colore ${d.data.name}: ${d.color}`); // Aggiunto
        if (d.children) d.children.forEach(setColor);
    }

    function linkConstant(d) {
        console.log(`[DEBUG] Genera link da ${d.source.data.name} a ${d.target.data.name}`); // Aggiunto
        return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
    }

    function linkStep(startAngle, startRadius, endAngle, endRadius) {
        console.log(`[DEBUG] Calcola percorso: ${startAngle}°, ${startRadius}px -> ${endAngle}°, ${endRadius}px`); // Aggiunto
        const c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
            s0 = Math.sin(startAngle),
            c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
            s1 = Math.sin(endAngle);
        return "M" + startRadius * c0 + "," + startRadius * s0
            + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
            + "L" + endRadius * c1 + "," + endRadius * s1;
    }

    // Funzione per creare l'extension del link
    function linkExtensionConstant(d) {
        console.log(`[DEBUG] Estensione link per ${d.target.data.name}`); // Aggiunto
        return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
    }

    // Carichiamo e visualizziamo l'albero
    root.data.length = 0;
    setRadius(root, 0, innerRadius / maxLength(root));
    console.log("[DEBUG] Raggi impostati:", root); // Aggiunto

    getColorForTaxa(root);
    console.log("[DEBUG] Colori assegnati"); // Aggiunto

    const linkExtension = chart.append("g")
        .attr("class", "link-extensions")
        .selectAll("path")
        .data(root.links().filter(d => {
            // Filtra solo i nodi foglia (senza children/branchset)
            const isLeaf = !(d.target.children || d.target.branchset);
            console.log(`[RENDER] Link extension per ${d.target.data.name} (${isLeaf ? 'foglia' : 'nodo interno'})`);
            return isLeaf;
        }))
        .enter().append("path")
        .each(function (d) {
            // Salva riferimento DOM nel nodo target
            console.log(`[REF] Collega linkExtensionNode a ${d.target.data.name}`);
            d.target.linkExtensionNode = this;
            d.target.linkExtensionData = d; // Salva i dati del link
        })
        .attr("d", linkExtensionConstant)
        .style("pointer-events", "none"); // Disabilita interazioni

    const link = chart.append("g")
        .attr("class", "links")
        .selectAll("path")
        .data(root.links())
        .enter().append("path")
        .each(function (d) {
            console.log(`[REF] Collegamento principale: ${d.source.data.name} -> ${d.target.data.name}`);
            d.target.linkNode = this;
            d.source.linkNodes = d.source.linkNodes || [];
            d.source.linkNodes.push({
                element: this,
                target: d.target
            });
        })
        .attr("d", linkConstant)
        .attr("stroke", d => {
            console.log(`[STYLE] Colore link ${d.target.data.name}: ${d.target.color}`);
            return d.target.color;
        })
        .attr("stroke-width", 1.5)
        .style("stroke-linecap", "round");

    const labels = chart.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(root.leaves())
        .enter().append("text")
        .each(function (d) {
            console.log(`[REF] Etichetta creata per ${d.data.name}`);
            d.labelNode = this; // Riferimento diretto al DOM
        })
        .attr("dy", ".31em")
        .attr("font-size", "10px")
        .attr("transform", d => {
            const rotation = d.x - 90;
            const translateX = innerRadius + 4;
            const flip = d.x >= 180 ? "rotate(180)" : "";
            console.log(`[POS] Etichetta ${d.data.name}: rotazione ${rotation}°, translateX ${translateX}px ${flip}`);
            return `rotate(${rotation})translate(${translateX},0)${flip}`;
        })
        .attr("text-anchor", d => {
            const anchor = d.x < 180 ? "start" : "end";
            console.log(`[ALIGN] Allineamento ${d.data.name}: ${anchor}`);
            return anchor;
        })
        .text(d => {
            const cleanedName = d.data.name.replace(/_/g, " ");
            console.log(`[TEXT] Testo etichetta: ${cleanedName}`);
            return cleanedName;
        })
        .on("mouseover", function (event, d) {
            console.log(`[EVENT] Mouseover su ${d.data.name}`);
            d3.select(this).transition().attr("font-size", "12px");
            mouseOvered(true).call(this, d);
        })
        .on("mouseout", function (event, d) {
            console.log(`[EVENT] Mouseout da ${d.data.name}`);
            d3.select(this).transition().attr("font-size", "10px");
            mouseOvered(false).call(this, d);
        });

    console.log("[DEBUG] Renderizzazione albero completata");
}