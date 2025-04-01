export function getColorForTaxa(taxaName) {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#A833FF"];
    return colors[taxaName.length % colors.length];
}
