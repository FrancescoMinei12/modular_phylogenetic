// https://github.com/jasondavies/newick.js/blob/master/src/newick.js
import { PhylogeneticTree } from '../../namespace-init.js';

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
function parseNewick(a) {
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

/**
 * @brief Parses Newick string into hierarchical tree structure
 * @param {string} newick_str Newick format string (e.g., "(A:0.1,B:0.2)Root;")
 * @return {object|null} Tree object with name, length, branchset properties
 * @throws {Error} On invalid input type or Newick syntax errors
 * @note Handles nested parentheses, node names, branch lengths and validates bracket matching
 */
function parseNewick2(a) {
    if (typeof a !== 'string') {
        console.error('Errore: i dati passati non sono una stringa');
        return null;
    }

    const stack = [];
    let root = {};
    let current = root;
    const tokens = a.split(/([();,:])/).filter(token => token.trim());

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        if (!token) continue;

        const prevToken = i > 0 ? tokens[i - 1].trim() : null;

        switch (token) {
            case '(':
                const newNode = { branchset: [] };
                if (!current.branchset) {
                    current.branchset = [];
                }
                current.branchset.push(newNode);
                stack.push(current);
                current = newNode;
                break;

            case ',':
                current = { branchset: [] };
                if (stack.length === 0) {
                    console.error('Errore di sintassi: virgola senza parentesi aperta');
                    return null;
                }
                stack[stack.length - 1].branchset.push(current);
                break;

            case ')':
                if (stack.length === 0) {
                    console.error('Errore di sintassi: parentesi chiusa senza apertura');
                    return null;
                }
                current = stack.pop();
                break;

            case ':':
                break;

            case ';':
                break;

            default:
                if (prevToken === '(' || prevToken === ',' || prevToken === ')') {
                    current.name = token;
                } else if (prevToken === ':') {
                    current.length = parseFloat(token);
                }
                break;
        }
    }

    return root;
}

PhylogeneticTree.core.parser = {
    parseNewick,
    parseNewick2
}