export function mouseOvered(active) {
    return function (d) {
        // Evidenzia l'etichetta
        d3.select(this).classed("label--active", active);

        d3.select(d.linkExtensionNode)
            .classed("link-extension--active", active)  // Applica la classe CSS per evidenziare
            .attr("stroke", active ? "#FF6347" : "#000")  // Colore del percorso
            .attr("stroke-width", active ? "2px" : "0.5px")
            .attr("stroke-opacity", active ? 1 : 0.25)
            .each(moveToFront);

        let current = d;
        do {
            if (current.linkNode) {
                d3.select(current.linkNode)
                    .classed("link--active", active)
                    .attr("stroke", active ? "#FF6347" : "#000")
                    .attr("stroke-width", active ? "3px" : "1.5px")
                    .each(moveToFront);
            }
        } while (current = current.parent);
    };
}

function moveToFront() {
    this.parentNode.appendChild(this);
}
