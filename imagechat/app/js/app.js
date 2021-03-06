// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'App' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('App', ['ionic', 'btford.socket-io', 'ngAnimate', 'monospaced.elastic', 'angularMoment', 'pascalprecht.translate'])
.run(['$ionicPlatform',
      function($ionicPlatform,$httpProvider) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}])
//
.constant('BaseURL', window.location.origin+'/')
.config(['$stateProvider',
         '$urlRouterProvider',
         '$ionicConfigProvider',
         '$compileProvider',
         '$httpProvider',
         '$translateProvider',
         function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider,$httpProvider,$translateProvider) {
           $ionicConfigProvider.scrolling.jsScrolling(ionic.Platform.platform() != 'win32' && ionic.Platform.platform() != "linux" && ionic.Platform.platform() != "macintel");
           $translateProvider.preferredLanguage('it');
           $translateProvider.translations('it', {
    WELCOME_MSG: 'Congratulazioni, la tua lista è pronta! I contributi effettuati da amici e parenti sui tuoi desideri sono tenuti al sicuro da un istituto di pagamento Europeo su un borsellino elettronico di tua proprietà. Potrai prelevare le cifre raccolte ogni volta che vorrai, senza nessun costo, indicando direttamente il tuo IBAN Italiano nella sezione "Incassa sul tuo conto corrente".',
    WEDDING_LIST_SECTION_TITLE: 'LA TUA LISTA NOZZE',
    BANK_ACCOUNT_OWNER_NAME: 'Intestatario del Conto bancario',
    BANK_ACCOUNT_OWNER_ADDRESS: 'Indirizzo di residenza dell\'intestatario',
    BANK_ACCOUNT_IBAN: 'IBAN del conto bancario',
    AMOUNT: 'Importo',
    TOTAL_AMOUNT: 'Importo totale',
    TOTAL_AMOUNT_CAPS: 'IMPORTO TOTALE',
    TOTAL: 'Totale',
    CONFIRM: 'Conferma',
    ADD:'Aggiungi',
    ADD_CAPS: 'AGGIUNGI',
    LOST_PASSWORD: 'Hai dimenticato la password?',
    ADD_GUEST: 'Aggiungi Invitati',
    ADD_GUEST_CAPS: 'AGGIUNGI INVITATI',
    NEW_ITEM_MODAL_TITLE: 'NUOVA VOCE',
    ADD_DATE: 'Aggiungi data',
    CANCEL_BUTTON: 'Annulla',
    CHOOSE_CATEGORY: 'Scegli Categoria',
    RESTORE_PASSWORD: 'Reimposta Password',
    LOGIN_BUTTON_TEXT: 'LOGIN',
    EMAIL: 'EMAIL',
    EDIT: 'Modifica',
    PASSWORD: 'PASSWORD',
    DECLINED: 'Declinati',
    CONFIRMED: 'Confermati',
    NORSVP: 'RSVP non inviato',
    WAITING_TO_ANSWER: 'In attesa di risposta',
    GUEST: 'Invitati',
    NAME: 'Nome',
    NAME_CAPS: 'NOME',
    RSVP: 'Rsvp',
    PAYMENTS_CAPS: 'VERSAMENTI',
    PAYMENTS: 'Versamenti',
    TABLE: 'Tavolo',
    TABLES_CAPS: 'TAVOLI',
    LOWERCASE_EMAIL: 'Email',
    OPTIONS:'Opzioni',
    GUEST_AND_PAYMENTS_CAPS: 'INVITATI E PARTECIPANTI',
    GUEST_AND_PAYMENTS: 'Invitati e partecipanti',
    ADD_ITEM: 'Aggiungi Voce',
    ITEM: 'Voce',
    FILTER_TO_CATEGORY: "Filtra per categoria",
    FILTER_TO_STATE: "Filtra per stato",
    ALL_STATE: 'Tutti gli stati',
    ALL_CATEGORY: "Tutte le categorie",
    SEARCH: "Cerca",
    ADD_WISH: "Aggiungi desiderio",
    EDIT_WISH: "Aggiorna desiderio",
    ENVELOPE_FREE_CONTRIBUTION: 'BUSTA O CONTRIBUTO LIBERO',
    TRAVEL_OR_STEP: 'VIAGGIO O TAPPA',
    PRODUCT_SERVICE: 'PRODOTTO O SERVIZIO',
    CHOOSE_ONLUS: 'SCEGLI UNA ONLUS',
    ADD_WISH_CAPS:'AGGIUNGI UN DESIDERIO',
    SAVE: 'Salva',
    LAST_NAME_CAPS: 'COGNOME',
    LAST_NAME: 'Cognome',
    DATE: 'DATA',
    TAXCODE_CAPS: 'CODICE FISCALE',
    TAXCODE: 'Codice Fiscale',
    OLD_PASSWORD_CAPS: 'VECCHIA PASSWORD',
    OLD_PASSWORD: 'Vecchia password',
    NEW_PASSWORD_CAPS: 'NUOVA PASSWORD',
    NEW_PASSWORD: 'Nuova password',
    REPEAT_PASSWORD_CAPS: 'CONFERMA PASSWORD',
    REPEAT_PASSWORD: 'Conferma password',
    DATE_BIRTHDAY: 'Data di nascita',
    EDIT_YOUR_PROFILE_CAPS: 'MODIFICA IL TUO PROFILO',
    TYPE_WISH_CAPS: 'TIPO DI DESIDERIO',
    DESCRIPTION_CAPS: 'DESCRIZIONE',
    DESCRIPTION: 'Descrizione',
    ADD_PHOTO: 'Aggiungi Fotografia',
    PARTY_FAVOR: 'Bomboniere',
    BUREAUCRACY: 'Burocrazia',
    BEAUTY_WELLNESS: 'Bellezza e benessere',
    CEREMONY: 'Cerimonia',
    CEREMONY_CAPS: 'CERIMONIA',
    AFTER_PARTY: 'Ricevimento',
    ANNOUNCEMENT: 'Partecipazioni',
    DECORATIONS: 'Decorazioni',
    PHOTOGRAPHER: 'Fotografo',
    TRANSPORTS: 'Trasporti',
    PLANNING: 'Organizzazione',
    MUSIC: 'Musica',
    HONEYMOON: 'Luna di miele',
    WEDDING_LIST: 'Lista nozze',
    OTHER: 'Altro',
    COMPLETED: 'Completato',
    ADD_TABLE: 'AGGIUNGI TAVOLO',
    CLOSE: 'Chiudi',
    ADDRESS_CAPS: 'INDIRIZZO',
    ADDRESS: 'Indirizzo',
    EDIT_TABLE_CAPS: 'MODIFICA TAVOLO',
    DATE_BIRTHDAY_CAPS: 'DATA DI NASCITA',
    PREMIUM_SERVICES_SECTION_TITLE: 'SERVIZI PREMIUM',
    PREMIUM_SERVICES: 'Servizi premium',
    THEME: 'Tema',
    TEMPLATE: 'Template',
    PREVIEW: 'Anteprima',
    ORDER: 'Ordina',
    ACTIVATION_YOUR_LIST: 'ATTIVA LA TUA LISTA',
    PHONE_NUMBER: 'Numero di cellulare',
    ACTIVATION_LIST: 'Attiva',
    FREE_FOR_YOU_CAPS: 'GRATUITO PER TE',
    FREE_FOR_GUESTS_CAPS: 'GRATUITO PER I PARTECIPANTI',
    PARTICIPANTS: 'Partecipanti',
    BRIDE_GROOM: 'Sposi',
    ROUND_TABLE: 'Tavolo tondo',
    RECTANGLE: 'rettangolare',
    NUMBER_SEATS: 'Numero posti',
    CHOOSE_TABLE: 'Scegli tavolo',
    SEND: 'Invia',
    INCLUDE_MOTIVATION: 'Inserisci la motivazione',
    URL: 'Url',
    TABLE_DELETE: 'Elimina tavolo',
    EDIT_YOUR_WALLPAPER_CAPS: 'MODIFICA LA TUA IMMAGINE DI COPERTINA',
    LOAD_NEW_WALLPAPER: 'Carica una nuova immagine di copertina',
    DOUBTS_OR_QUESTION: 'DUBBI O DOMANDE?',
    NUMBER_CAPS: 'NUMERO',
    YOUR_NUMBER_PHONE: 'Il tuo numero di telefono',
    NOW: 'Adesso',
    MORNING: 'Al mattino',
    AFTERNOON: 'Al pomeriggio',
    RESERVE: 'Prenota',
    YOUR_WEDDING_LISTS: 'LE TUE LISTE NOZZE',
    THANK: 'RINGRAZIA',
    MESSAGE_CAPS: 'MESSAGGIO',
    THANKS: 'Grazie!',
    SEND_YOUR_THANKS_MESSAGE: 'Invia il tuo messaggio di ringraziamento a',
    SEND_YOUR_GENERIC_MESSAGE: 'Invia il tuo messaggio a',
    INCLUDE_YOUR_MESSAGE: 'Inserisci il tuo Messaggio (max 500 battute)',
    CART_CAPS: 'CARRELLO',
    ADD_TO_CART_LATER_CONFIG: 'Aggiungi al carrello e configura dopo l\'acquisto',
    ADD_TO_CART: 'Aggiungi al carrello',
    CONFIG_PRODUCT: 'Configura prima di ordinare',
    ARTICLES: 'Articoli',
    SHIPPING: 'Spedizione',
    ITALY_SHIPPING_ADDRESS: 'Indirizzo di spedizione in Italia',
    STREET_CAP_CITY_PROVINCE: 'Nome, Via, CAP, Città, Provincia',
    YOUR_AMOUNT_LIST: 'Il tuo Saldo lista è',
    YOUR_AMOUNT_AGENCY: 'Il tuo Saldo agenzia è',
    PAY_WITH: 'Paga con',
    CREDIT_CARD: 'Carta di credito',
    CREDIT_LIST: 'Credito lista',
    CREDIT_AGENCY: 'Credito agenzia',
    MOVEMENTS: 'Movimenti',
    CHANGE_LIST: 'Cambia lista',
    LOGOUT: 'Logout',
    REQUEST_WIRE_TRANSFER_CAPS: 'RICHIEDI UN BONIFICO',
    ECOMMERCE_CATALOG: 'CATALOGO PRODOTTI',
    ECOMMERCE_CATALOG_PARAGRAPH: 'Scegli e seleziona tra i nostri cataloghi i tuoi prodotti preferiti per aggiungerli alla tua lista nozze online. Tutti i tuoi desideri potranno essere acquistati alla fine della raccolta di denaro da parte dei tuoi invitati.',
    GO_TO_CATALOG: 'Vai al catalogo',
    FREE_CONTRIBUTION: 'Contributo Libero',
    FIXED_QUOTE: 'Quota Fissa',
    N_QUOTE: 'N° QUOTE',
    TOTAL_QUOTE: 'IMPORTO QUOTA',
    IMPORT_FILE: 'Importa File',
    DOWNLOAD_MODEL: 'Scarica il modello',
    IGNORE: 'Ignora',
    IGNORE_FIRST_LINE: 'Ignora prima riga',
    FILTER_TO: 'Filtra per',
    RSVP_CAPS: 'RSVP',
    ALL: 'Tutti',
    NOT_SITTING: 'Non seduto',
    DATE_BUYING: 'DATA DI ACQUISTO',
    PREMIUM_PRODUCT_CATALOG: 'CATALOGO PRODOTTI PREMIUM',
    SEE_PRODUCT: 'Vedi prodotto',
    PURCHASED_PRODUCTS: 'PRODOTTI ACQUISTATI',
    AVAILABLE_AMOUNT: 'SALDO DISPONIBILE',
    COLLECTED_AMOUNT: 'TOTALE RACCOLTO',
    EDIT_YOUR_LIST: 'Modifica il tuo sito',
    EDIT_YOUR_WEDDING_LIST: 'MODIFICA IL TUO SITO',
    ACTIVE_CAPS: 'ATTIVA',
    COPY_CAPS: 'COPIA',
    YOUR_WISH: 'I TUOI DESIDERI',
    SHARE: 'Share',
    WEDDING: 'IL MATRIMONIO',
    FIRST_SECOND_NAME_BRIDE: 'Nome e cognome della Sposa',
    FIRST_SECOND_NAME_GROOM: 'Nome e cognome dello Sposo',
    DATE_OF_MARRIGE: 'Data del matrimonio',
    WALLPAPER_CAPS: 'COPERTINA',
    EDIT_WALLPAPER: 'Modifica sfondo',
    WELCOME_MESSAGE: 'Messaggio di benvenuto',
    WELCOME_MESSAGE_FOR_GUEST: 'Messaggio di benvenuto per i tuoi invitati (max 300 battute)',
    UP: 'In alto',
    CENTER: 'In centro',
    DOWN: 'In basso',
    NAME_PLACE: 'Nome del luogo',
    NOTE_TO_GUESTS: 'Note per i tuoi invitati',
    NOTE_TO_GUESTS_PLACEHOLDER: 'Note per invitati (es: indicazioni stradali, note particolari ecc.)',
    EVENT_CAPS: 'RICEVIMENTO',
    NOTIFICATIONS_CAPS: 'NOTIFICHE',
    EMAIL_EXTRA: 'Email extra',
    EXTRA_CAPS: 'EXTRA',
    PAYMENTS_PUBLIC_CAPS: 'VERSAMENTI PUBBLICI',
    SEARCHABLE_CAPS: 'RICERCABILE',
    REQUEST_DELETE_LIST_CAPS: 'RICHIESTA CANCELLAZIONE LISTA',
    IMPORT_GUESTS_CAPS: 'IMPORTA INVITATI',
    WEDDING_LIST_CAPS: 'LISTA NOZZE',
    PEOPLE_CAPS: 'PERSONE',
    COMMITMENT_CAPS: 'IMPEGNI',
    SERVICES_PLUS_CAPS: 'SERVIZI+',
    TABLES_MANAGEMENT_CAPS: 'GESTIONE TAVOLI',
    TABLES_MANAGEMENT: 'Gestione tavoli',
    YOUR_COMMITMENT_CAPS: 'I TUOI IMPEGNI',
    YOUR_COMMITMENT: 'I tuoi impegni',
    CHARITY_CAPS: 'BENEFICENZA',
    ACTIVATE_LIST_TITLE: 'Per attivare la tua lista ti chiediamo di:',
    ACTIVATE_LIST_ITEM1: 'Modificare la URL della tua lista a tuo piacimento, una volta attivata non si potrà più cambiare.',
    ACTIVATE_LIST_ITEM2: 'Indicare un numero di cellulare per ricevere il PIN di sicurezza ad ogni richiesta di bonifico sul tuo conto e per ricevere le notifiche di versamento.',
    ACTIVATE_LIST_ITEM3: 'Scegliere a chi addebitare i costi del servizio.',
    ACTIVATE_LIST_TITLE2: 'Costi del servizio:',
    ACTIVATE_LIST_ITEM4: 'Se non registri ora il tuo IBAN, non preoccuparti, ti verra richiesto al primo incasso ',
    ACTIVATE_LIST_GUESTS: 'Ogni partecipante pagherà una commissione sul servizio di 1€ + 1,85% per ogni versamento.',
    ACTIVATE_LIST_BRIDE_GROOM: 'Prendi in carico tu le commissioni: per ogni versamento verrà detratto 1€ + 1,85% dall’importo che riceverai.',
    ACTIVATE_LIST_INFO: 'Dopo l\'attivazione puoi sempre aggiungere altri desideri',
    HELP_MODAL_TITLE: 'Prenota una telefonata con un nostro consulente.',
    HELP_MODAL_TITLE1: 'Quando vuoi essere contattato?',
    HELP_MODAL_PARAGRAPH: 'Il servizio è gratuito Il tuo numero di telefono viene cancellato dopo il primo contatto.',
    LIST_SELECTOR_WEDDING: 'Matrimonio il',
    RSVP_MODAL_PARAGRAPH: 'Sono lieti di annunciare il loro matrimonio e saranno felici di avervi ospiti. E\' gradita gentile conferma.',
    SEND_RSVP: 'Invia Rsvp',
    SHOPPING_CART_MODAL_PARAGRAPH: 'I prezzi sono da considerarsi IVA compresa.',
    AGENCY_SHIPPING_ADDRESS: 'Spedizione in Agenzia',
    STATEMENT_TITLE_CAPS: 'SITUAZIONE FINANZIARIA',
    STATEMENT_ITEM1: 'Importo Viaggio in Lista',
    STATEMENT_ITEM2: 'Raccolto versamenti Online',
    STATEMENT_ITEM3: 'Raccolto presso Agenzia',
    STATEMENT_ITEM4: 'Importo Viaggio da saldare',
    STATEMENT_ITEM5: 'Credito da Agenzia',
    EMPTY_STATEMENT_PARAGRAPH: 'Non ci sono ancora movimenti',
    CONTRIBUTIONS_TITLE: 'Contribuzioni di {{username}} sulla tua lista',
    EMPTY_CONTRIBUTIONS_PARAGRAPH: 'Non ci sono contribuzioni da questa persona',
    EMPTY_MESSAGES_PARAGRAPH: 'Non ci sono messaggi ancora',
    EMPTY_CONTRIBUTIONS_IN_PRODUCT_PARAGRAPH: 'Non ci sono contribuzioni su questo desiderio',
    WITHDRAWAL_PARAGRAPH: 'Per una garanzia aggiuntiva, i bonifici in uscita dovranno essere confermati da un PIN che ti invieremo sul tuo numero di cellulare.',
    PRODUCT_SERVICE_PARAGRAPH1: 'i partecipanti possono versare liberamente.',
    PRODUCT_SERVICE_PARAGRAPH2: 'i partecipanti devono versare quote predefinite.',
    IMPORT_GUESTS_PARAGRAPH1: 'Scarica il modello di excel che abbiamo preparato per te.',
    IMPORT_GUESTS_PARAGRAPH2: 'Compila il file con i dati dei tuoi invitati.',
    IMPORT_GUESTS_PARAGRAPH3: 'E\' importante che il file sia in formato',
    IMPORT_GUESTS_PARAGRAPH4: 'Importa il file, potrai visualizzarlo prima di salvare le modifiche.',
    WEDDING_LIST_ACTIVATE: 'Attiva la lista per renderla visibile agli invitati ed incassare gli importi raccolti. Nessun costo di attivazione. Potrai aggiungere ulteriori desideri anche dopo l’attivazione.',
    WEDDING_LIST_AGENCY_ACTIVATE: 'Per attivare la tua lista nozze, devi accettare i Termini e le Condizioni del Contratto e caricare un tuo Documento di Identità, se non hai ancora provveduto al momento della creazione della lista presso l\'Agenzia.',
    YOUR_TRAVEL: 'Il tuo viaggio',
    WEDDING_LIST_PARAGRAPH1: 'Non ci sono ancora desideri :(',
    WEDDING_LIST_PARAGRAPH2: 'Prova ad aggiungere uno!',
    PREMIUM_STATE1: 'Configura e ordina!',
    PREMIUM_STATE2: 'Configurato',
    PREMIUM_STATE3: 'Ordinato',
    RSVP_SEND_CAPS: 'INVIA RSVP',
    WEDDING_LIST_EDITOR_PARAGRAPH1: 'Posizione del benvenuto sulla copertina:',
    WEDDING_LIST_EDITOR_HELP_TIP: '(puoi trascinare il puntatore per aggiustare la posizione)',
    WEDDING_LIST_EDITOR_PARAGRAPH2: 'I nuovi versamenti, promesse e messaggi dai tuoi invitati vengono notificati su',
    WEDDING_LIST_EDITOR_PARAGRAPH3: 'Il pin di sicurezza per i tuoi bonifici verso il tuo conto corrente bancario viene inviato al telefono. Se vuoi modificare il numero contatta l\'assistenza clienti',
    WEDDING_LIST_EDITOR_PARAGRAPH4: 'Puoi aggiungenere un indirizzo email extra per ricevere una copia delle notifiche:',
    WEDDING_LIST_EDITOR_RSVP: 'Scegli se rendere visibile agli invitati il form per la conferma di presenza alla cerimonia.',
    WEDDING_LIST_EDITOR_PAYMENTS: 'Scegli se rendere visibile agli inviati i nomi dei partecipanti che hanno gia versato.',
    WEDDING_LIST_EDITOR_SEARCHABLE: 'Rende la lista ricercabile dalla homepage di ListaNozzeOnline',
    CHARITY_ACTIONAID: 'ACTIONAID',
    CHARITY_ACTIONAID_DESCRIPTION: 'Collaboriamo con più di 8.000 partner tra organizzazioni, associazioni e ONG locali e coinvolgiamo nei nostri programmi di sviluppo 27 milioni di persone. ActionAid Italia da oltre 25 anni è al fianco delle comunità nel Sud del mondo, Africa, Asia e America Latina, ed in Italia per garantire loro migliori condizioni di vita e il rispetto dei diritti fondamentali. Sviluppiamo i nostri progetti tenendo conto delle esigenze e priorità delle comunità locali e promuoviamo lo sviluppo sostenibile e duraturo nel tempo. Rappresentiamo la loro voce presso i governi e le istituzioni per chiedere un cambiamento delle politiche sociali ed economiche, affinché siano rimosse le cause profonde della povertà. Principali ambiti di intervento: diritto al cibo, diritti delle donne, educazione, emergenze, accountability e accesso alle risorse.',
    CHARITY_AMREF: 'AMREF',
    CHARITY_AMREF_DESCRIPTION: 'Amref Health Africa è la principale organizzazione sanitaria no profit del continente africano. Fondata in Africa nel 1957 per iniziativa di tre chirurghi, contribuisce allo sviluppo socio-sanitario del Paese, in particolare nelle aree più remote e marginalizzate e in oltre mezzo secolo di attività ha soccorso, curato e istruito milioni di persone. Lavoriamo con le comunità affinché apprendano le conoscenze, le capacità e i mezzi per proteggere la propria salute e rompere il ciclo della malattia e della povertà, coinvolgendole direttamente nei progetti di sviluppo sanitario, assistenza medica e formazione di personale sanitario.',
    CHARITY_EMERGENCY: 'EMERGENCY',
    CHARITY_EMERGENCY_DESCRIPTION: 'EMERGENCY è un\'associazione italiana nata nel 1994 per offrire cure medico-chirurgiche gratuite e di elevata qualità alle vittime delle guerre, delle mine antiuomo e della povertà; fin dalla sua fondazione, inoltre, è impegnata nella promozione di una cultura di pace, solidarietà e rispetto dei diritti umani. EMERGENCY è oggi presente in 7 Paesi; in Afghanistan offre cure negli ospedali di Kabul, Lashkar-gah, Anabah e nella sua rete di Centri Sanitari e Posti di primo soccorso. Sempre ad Anabah, nella Valle del Panshir, EMERGENCY offre inoltre dal 2003 assistenza ginecologica, ostetrica e neonatale alle donne dell\'area nel suo Centro di maternità. Si tratta dell\'unica struttura specializzata e gratuita di questo tipo nella regione. Presso il Centro è attivo anche un programma di assistenza prenatale, e il nostro staff effettua regolarmente missioni di controllo delle donne in gravidanza e di follow-up di puerpere e neonati presso i Posti di primo soccorso e i Centri sanitari dell\'associazione nella valle del Panshir.',
    NEW_PRODUCT_SPLITPOPUP_MSG: 'Desiderio salvato!',
    NEW_PRODUCT_SPLITPOPUP_BTNTXT1: 'Aggiungere un altro',
    NEW_PRODUCT_SPLITPOPUP_BTNTXT2: 'Ho finito per ora',
    NEW_PRODUCT_UPDATED: 'Desiderio aggiornato!',
    PRODUCT_WEDDING: 'Matrimonio',
    PRODUCT_ART: 'Arte',
    PRODUCT_BEAUTY: 'Bellezza',
    PRODUCT_KITCHEN: 'Cucina',
    PRODUCT_DECORATION: 'Decorazione',
    PRODUCT_APPLIANCES: 'Elettrodomestici',
    PRODUCT_FURNITURE: 'Mobili',
    PRODUCT_GIFT_SOLIDARITY: 'Regalo solidale',
    PRODUCT_DINING_ROOM: 'Sala da Pranzo',
    PRODUCT_TECH: 'Tecnologia',
    PRODUCT_HOBBY: 'Tempo Libero',
    TRAVEL: 'Viaggio intero',
    TRAVEL_STEP: 'Tappa di un viaggio',
    TRAVEL_STEP_HOTEL: 'Tappa di un viaggio: Hotel',
    TRAVEL_STEP_FLIGHT: 'Tappa di un viaggio: Volo',
    TRAVEL_STEP_EXCURSION: 'Tappa di un viaggio: Escursione',
    TRAVEL_STEP_RESTAURANT: 'Tappa di un viaggio: Ristorante',
    ACTIVATE_LIST_ALERT: 'Ci sono errori nel formulario, ricontrolla i dati per favore',
    RESET_YOUR_PASSWORD: 'Reimposta Password',
    LOGIN_POPUP_SUBTITLE: 'Inserisci l\'email con cui ti sei registrato, nel giro di poco riceverai un messaggio nella tua casella di posta con le istruzioni da seguire.',
    PEOPLE_ACTION_SHEET1: 'Aggiungi singolo Invitato',
    PEOPLE_ACTION_SHEET2: 'Importa lista di invitati',
    SHOPPING_CART_DELETE_CONFIRM_MSG: 'Sicuro di voler cancellare questo prodotto dal carrello?',
    DELETE: 'Cancella',
    SHOPPING_CART_CONFIRM_MSG: 'Sei sicuro di voler procedere?',
    PROCEED: 'Procedi',
    SHOPPING_CART_CONFIRM_TO_CONTINUE: 'Acquisto completato con successo',
    TABLES_DELETE_CONFIRM: 'Sei sicuro di voler cancellare questo tavolo? I tuoi invitati non verranno cancellati.',
    TODO_WAITING: 'In attesa',
    WISH_TYPES_PRODUCT: 'Prodotto o Servizio',
    WISH_TYPES_PRODUCT_DESCRIPTION: 'Aggiungi un tuo prodotto personalizzato.',
    WISH_TYPES_FREE_CONTRIBUTION: 'Busta o Contributo Libero' ,
    WISH_TYPES_FREE_CONTRIBUTION_DESCRIPTION: 'Raccogli il denaro in completa libertà.' ,
    WISH_TYPES_TRAVEL: 'Viaggio Intero o Tappa',
    WISH_TYPES_TRAVEL_DESCRIPTION: 'Il tuo viaggio di Nozze completo o in tappe.',
    WISH_TYPES_ECOMMERCE: 'Catalogo prodotti',
    WISH_TYPES_ECOMMERCE_DESCRIPTION: 'Meravigliosi cataloghi online, pieni di prodotti per le tue nozze.',
    WISH_TYPES_PROVIDERS: 'Catalogo fornitori',
    WISH_TYPES_PROVIDERS_DESCRIPTION: 'Esplora il nostro catalogo di fornitori di servizi per rendere indimenticabili le tue nozze.',
    WISH_TYPES_CHARITY: 'Beneficenza',
    WISH_TYPES_CHARITY_DESCRIPTION: 'Destina il denaro alla causa che più ti sta a cuore.',
    WEDDING_LIST_ACTION_SHEET_TITLE: 'Il tuo desiderio',
    WEDDING_LIST_ALERT1: 'I desideri con contributi o promesse non possono essere modificati o eliminati',
    WEDDING_LIST_ALERT2: 'Non hai saldo disponibile per richiedere un bonifico in questo momento.',
    NEW_IBAN: 'Nuovo IBAN',
    WEDDING_LIST_ALERT3: 'Bonifico registrato correttamente, ti abbiamo inviato un email di conferma',
    WEDDING_LIST_PIN_MODAL1: 'Conferma la transazione con il PIN SMS che ti abbiamo appena mandato',
    WEDDING_LIST_PIN_MODAL2: 'Il pin inserito non è valido o è scaduto, riprova adesso o aspetta 2 minuti per richiedere uno nuovo.',
    WEDDING_LIST_ALERT4: 'Messaggio inviato',
    WEDDING_LIST_EDITOR_CONFIRM_MSG:'Ci sono delle modifiche non salvate, sei sicuro di voler continuare?',
    IGNORE_EDIT: 'Ignora modifiche',
    STAY_HERE: 'Rimani qui',
    WEDDING_LIST_EDITOR_ALERT1: 'La tua lista è stata correttamente aggiornata',
    WEDDING_LIST_EDITOR_ALERT2: 'Ci sono errori nel formulario, ricontrolla i dati per favore',
    WEDDING_LIST_EDITOR_ALERT3: 'Buone notizie! La tua richiesta è stata inviata al personale di ListaNozzeOnline, a breve la tua lista verrà cancellata',
    WITHDRAWAL_ALERT1: 'Bonifico registrato correttamente, ti abbiamo inviato un email di conferma',
    WITHDRAWAL_PIN_MODAL: 'Conferma la transazione con il PIN SMS che ti abbiamo appena mandato',
    CONTRIBUTORS_CAPS: 'VERSATORI',
    PRODUCT_PLACEHOLDER: 'Importo totale (senza decimali o simboli)',
    TABLES_TITLE_MOBILE: 'Per il momento, questa sezione è disponibile solo da computer.',
    WEDDING_LIST_BUTTON1: 'Incassa sul tuo conto corrente',
    WEDDING_LIST_BUTTON2: 'Come vedono la mia lista',
    WEDDING_LIST_BUTTON3: 'Estratto conto',
    MODIFY_RSVP_TITLE: 'Modifica RSVP',
    RSVP_CONFIRM_ALERT: 'Verrà inviata una richiesta di RSVP al indirizzo',
    LOOK_CONTRIBUTORS: 'Vedi partecipanti',
    CONTROL: 'Verifica disponibilità',
    ALREADY_MARRIED: 'vi siete gia sposati',
    YOUR_WEBSITE: 'MINISITO',
    PAPER: 'Carta',
    PAPER_COLOR: 'Colore Carta',
    ASSISTANCE_MODAL:'Assistenza',
    ASSISTANCE:'ASSISTENZA',
    SEE_YOUR_WEBSITE1: 'GUARDA IL MINISITO',
    ASSISTANCE_TITLE: 'TI CONTATTIAMO NOI',
    ASSISTANCE_PARAGRAPH1: 'Preferisci parlare direttamente con un nostro operatore?',
    ASSISTANCE_TITLE2: 'LINK UTILI',
    ASSISTANCE_OPTION: 'COME FUNZIONA',
    ASSISTANCE_OPTION1: 'TERMINI E CONDIZIONI',
    ASSISTANCE_OPTION2: 'SICUREZZA',
    ASSISTANCE_OPTION3: 'TARIFFE',
    ASSISTANCE_OPTION4: 'FAQ',
    COLLECTED: 'Raccolto',
    AVAILABLE: 'Disponibile',
    CASHOUT: 'Uscite',
    MENU_STATEMENT: 'Estratto conto',
    DOMAIN_AVAILABLE: 'Dominio disponibile',
    ALERT_IMAGE: 'La larghezza e l\'altezza dell\'immagine devono essere di 2500px con una dimensione massima di 5MB.',
    CONTRIBUTORS_MESSAGES_TITLE: 'MESSAGGI DAI TUOI INVITATI',
    COUPLE_FEE: "commissioni a tuo carico",
    PARTICIPANTS_FEE: "commissioni a carico dei partecipanti",
    MISSING_TAXCODE: "Prima di procedere è necessario inserire il tuo codice fiscale nel tuo profilo utente"
});
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content|ms-appx|x-wmapp0):|data:image\/|img\//);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);
    $ionicConfigProvider.scrolling.jsScrolling(ionic.Platform.isIOS());
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('AuthErrInterceptor');

    $stateProvider
    .state('chat', {
        url: "/:list/chat",
        cache: false,
        templateUrl: "templates/chat.html",
        controller: 'ChatController',
        resolve: {
          userData: ['StorageService', '$location', '$stateParams', function (StorageService, $location, $stateParams) {
            var user = StorageService.getAuthData();

            if(user.token) {
              return user;
            } else {
              if($stateParams.list){
                //console.log('setRoom',$stateParams.list)
                StorageService.setRoom($stateParams.list)
                $location.path('login');

              }
            }
          }]
        }
    })
    .state('login', {
        url: "/login",
        cache: false,
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl',
        resolve: {
          userData: ['StorageService', function (StorageService) {
            return StorageService.getAuthData()
          }]
        }
    });

    $urlRouterProvider.otherwise('chat');
}])

.factory('AuthInterceptor', function(StorageService,$q,$location) {
  return {
    request: function(config) {
      var data = StorageService.getAuthData();
      //  console.log(data);

      config.headers['X-App-Key'] = '1234567890';
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';

      if(data.hasOwnProperty('token')) {
        config.headers['X-Auth-Token'] = data.token;
      }

      return config;
    }
  }
})
.factory('AuthErrInterceptor', function(StorageService,$q,$location) {
  return {
    responseError: function(response) {
      if (response.status === 401) {
        console.log('sadfaskfkasdjfklajslf');
        $location.path('/login');
        StorageService.setAuthData('');
        return $q.reject(response);
      } else {
        return $q.reject(response);
      }

      return config;
    }
  }
});
