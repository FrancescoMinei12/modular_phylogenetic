export function renderLabels(svg, treeData) {
    svg.selectAll(".node")
        .data(treeData.descendants())
        .enter().append("g")
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .each(function (d) {
            d3.select(this).append("circle")
                .attr("r", 5)
                .attr("fill", "#69b3a2");

            d3.select(this).append("text")
                .attr("dy", 4)
                .attr("x", d => d.children ? -10 : 10)
                .attr("text-anchor", d => d.children ? "end" : "start")
                .text(d => d.data.name);
        });
}
