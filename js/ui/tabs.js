// Funzione per cambiare il contenuto dei tab
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const tabLinks = document.querySelectorAll('li');

    // Nascondi tutti i tab content
    tabs.forEach(tab => tab.classList.add('hidden'));

    // Rimuovi il bordo inferiore da tutte le voci dei tab
    tabLinks.forEach(link => {
        link.classList.remove('border-b-2', 'border-blue-500');
    });

    // Mostra il tab selezionato
    document.getElementById(tabName + '-tab').classList.remove('hidden');

    // Aggiungi il bordo inferiore al tab selezionato
    document.getElementById('tab-' + tabName).classList.add('border-b-2', 'border-blue-500');
}

// Inizializza il primo tab come attivo
showTab('taxa');
