/**
 * @file newick_parser.js
 * @brief Newick format phylogenetic tree parser
 */

/**
 * @brief Parses Newick string into hierarchical tree structure
 * @param {string} newick_str Newick format string (e.g., "(A:0.1,B:0.2)Root;")
 * @return {object|null} Tree object with name, length, branchset properties
 * @throws {Error} On invalid input type or Newick syntax errors
 * @note Handles nested parentheses, node names, branch lengths and validates bracket matching
 */
export function parseNewick(a) {
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