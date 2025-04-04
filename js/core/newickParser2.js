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
                // Inizia un nuovo clade
                const newNode = { branchset: [] };
                if (!current.branchset) {
                    current.branchset = [];
                }
                current.branchset.push(newNode);
                stack.push(current);
                current = newNode;
                break;

            case ',':
                // Nuovo ramo nello stesso clade
                current = { branchset: [] };
                if (stack.length === 0) {
                    console.error('Errore di sintassi: virgola senza parentesi aperta');
                    return null;
                }
                stack[stack.length - 1].branchset.push(current);
                break;

            case ')':
                // Fine clade
                if (stack.length === 0) {
                    console.error('Errore di sintassi: parentesi chiusa senza apertura');
                    return null;
                }
                current = stack.pop();
                break;

            case ':':
                // Ignora le lunghezze dei rami per ora
                break;

            case ';':
                // Fine dell'albero
                break;

            default:
                if (prevToken === '(' || prevToken === ',' || prevToken === ')') {
                    // È un nome di nodo
                    current.name = token;
                } else if (prevToken === ':') {
                    // È una lunghezza di ramo
                    current.length = parseFloat(token);
                }
                break;
        }
    }

    return root;
}