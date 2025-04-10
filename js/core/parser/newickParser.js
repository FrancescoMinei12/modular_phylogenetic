// https://github.com/jasondavies/newick.js/blob/master/src/newick.js

/**
 * @file newick_parser.js
 * @brief Newick format tree parser
 */

/**
 * @brief Parses Newick format string into a JS tree object
 * @param {string} newick_str Input string in Newick format
 * @return {object|null} Tree structure or null if error
 * @details
 * Converts Newick strings (e.g., "(A:0.1,B:0.2)C:0.3;") to objects with:
 * - name: node name
 * - length: branch length
 * - branchset: child nodes array (for internal nodes)
 * Uses stack-based parsing of parentheses, commas and colons.
 */
export function parseNewick(a) {
    if (typeof a !== 'string') {
        console.error('Errore: i dati passati non sono una stringa');
        return null;  // Gestisci l'errore
    }
    for (var e = [], r = {}, s = a.split(/\s*(;|\(|\)|,|:)\s*/), t = 0; t < s.length; t++) {
        var n = s[t];
        switch (n) {
            case "(": var c = {}; r.branchset = [c], e.push(r), r = c; break;
            case ",": var c = {}; e[e.length - 1].branchset.push(c), r = c; break;
            case ")": r = e.pop(); break;
            case ":": break;
            default: var h = s[t - 1]; ")" == h || "(" == h || "," == h ? r.name = n : ":" == h && (r.length = parseFloat(n))
        }
    }
    return r;
}