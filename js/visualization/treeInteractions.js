export function addTreeInteractions(svg) {
    const zoom = d3.zoom().on("zoom", (event) => {
        svg.attr("transform", event.transform);
    });

    svg.call(zoom);
}
