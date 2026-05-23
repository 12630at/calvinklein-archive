# Selezione multipla per la colonna "model"

## Cosa è cambiato
Ho rilassato la validazione della colonna **L (model)** nel file `archive_index.xlsx`: il menu a tendina continua a mostrare i suggerimenti, ma ora puoi anche digitare liberamente. Excel non blocca più i valori che non sono nella lista.

## Soluzione rapida (funziona subito, niente macro)
Digita direttamente i nomi separati da virgola nella cella:
```
Kate Moss, Christy Turlington
```
Il dropdown rimane disponibile come riferimento, ma puoi aggiungere quanti modelli vuoi.

L'app web gestisce già correttamente questo formato — la ricerca per "Kate Moss" trova le campagne dove appare assieme ad altri modelli.

## Soluzione completa (vero multi-select via macro)
Se vuoi che cliccando sui nomi dal dropdown vengano aggiunti uno dopo l'altro automaticamente, segui questi passaggi una sola volta:

1. Apri `archive_index.xlsx` in Excel
2. Premi `Alt+F11` per aprire l'editor VBA
3. Nel pannello a sinistra ("Project Explorer"), fai doppio click su `Foglio "Archive"` (sotto "Microsoft Excel Objects")
4. Apri il file `multi_select_macro.bas` con un editor di testo e copia tutto il contenuto
5. Incolla nella finestra di codice del foglio Archive
6. Chiudi l'editor VBA (`Alt+Q`)
7. Salva il file scegliendo `Excel Macro-Enabled Workbook (*.xlsm)` come formato
   - Excel ti avviserà che le macro non possono essere salvate nel formato `.xlsx`
8. Da ora in poi, quando clicchi su una cella della colonna L e selezioni un modello dal dropdown, viene **aggiunto** al contenuto esistente invece di sostituirlo

## Come verificare
- Apri `archive_index.xlsm` (con macro abilitate)
- Clicca su una cella vuota di L (es. L2), seleziona "Kate Moss" dal dropdown
- Clicca di nuovo la stessa cella, seleziona "Christy Turlington"
- Il valore della cella deve diventare `Kate Moss, Christy Turlington`
- Selezionando lo stesso modello una seconda volta non viene duplicato
