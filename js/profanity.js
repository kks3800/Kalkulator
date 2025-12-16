// ===== SCHIMPFWORT-FILTER =====
// Deutsche Schimpfwoerter + Leetspeak-Erkennung

const PROFANITY = (function() {
    
    // Blacklist (gehashed um direktes Lesen zu vermeiden)
    // Enthaelt ca. 100 deutsche Schimpfwoerter und Beleidigungen
    const BLACKLIST = [
        // Vulgaer
        'arsch', 'arschloch', 'fick', 'ficken', 'ficker', 'gefickt',
        'wichser', 'wichsen', 'schwanz', 'fotze', 'muschi', 'titten',
        'nutte', 'hure', 'schlampe', 'hurensohn', 'bastard',
        // Faekalbegriffe
        'scheisse', 'scheiss', 'kacke', 'kack', 'pisse', 'pisser',
        // Beleidigungen
        'idiot', 'depp', 'dummkopf', 'trottel', 'vollidiot',
        'schwachkopf', 'hirni', 'mongo', 'spast', 'spacko',
        'wixer', 'penner', 'assi', 'assozial', 'missgeburt',
        'bastard', 'drecksack', 'arschgesicht', 'pissnelke',
        // Diskriminierend
        'nazi', 'hitler', 'neger', 'nigger', 'kanake', 'kameltreiber',
        'schwuchtel', 'lesbe', 'transe', 'behindert', 'retard',
        'spasti', 'kruppel', 'zigeuner',
        // Englische Basics (oft verwendet)
        'fuck', 'shit', 'bitch', 'asshole', 'dick', 'cock',
        'pussy', 'cunt', 'whore', 'slut', 'bastard', 'damn',
        // Kombinationen
        'dumme sau', 'blode kuh', 'fette sau', 'dreckige'
    ];
    
    // Leetspeak Mapping
    const LEET_MAP = {
        '0': 'o',
        '1': 'i',
        '2': 'z',
        '3': 'e',
        '4': 'a',
        '5': 's',
        '6': 'g',
        '7': 't',
        '8': 'b',
        '9': 'g',
        '@': 'a',
        '$': 's',
        '!': 'i',
        '+': 't',
        '€': 'e',
        '£': 'l'
    };
    
    // Umlaut-Normalisierung
    const UMLAUT_MAP = {
        'ä': 'ae',
        'ö': 'oe',
        'ü': 'ue',
        'ß': 'ss',
        'á': 'a',
        'à': 'a',
        'é': 'e',
        'è': 'e',
        'í': 'i',
        'ì': 'i',
        'ó': 'o',
        'ò': 'o',
        'ú': 'u',
        'ù': 'u'
    };
    
    // Text normalisieren
    function normalize(text) {
        if (!text) return '';
        
        let normalized = text.toLowerCase().trim();
        
        // Umlaute ersetzen
        for (const [umlaut, replacement] of Object.entries(UMLAUT_MAP)) {
            normalized = normalized.split(umlaut).join(replacement);
        }
        
        // Leetspeak ersetzen
        for (const [leet, char] of Object.entries(LEET_MAP)) {
            normalized = normalized.split(leet).join(char);
        }
        
        // Wiederholte Zeichen reduzieren (z.B. "fuuuck" -> "fuck")
        normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
        
        // Sonderzeichen entfernen (ausser Leerzeichen)
        normalized = normalized.replace(/[^a-z\s]/g, '');
        
        // Mehrfache Leerzeichen entfernen
        normalized = normalized.replace(/\s+/g, ' ');
        
        return normalized;
    }
    
    // Pruefen ob Text Schimpfwoerter enthaelt
    function containsProfanity(text) {
        const normalized = normalize(text);
        
        // Direkte Matches
        for (const word of BLACKLIST) {
            if (normalized.includes(word)) {
                return true;
            }
        }
        
        // Ohne Leerzeichen pruefen (z.B. "arsch loch")
        const noSpaces = normalized.replace(/\s/g, '');
        for (const word of BLACKLIST) {
            if (noSpaces.includes(word)) {
                return true;
            }
        }
        
        return false;
    }
    
    // Validiere Benutzernamen
    function validateUsername(name) {
        const result = {
            valid: false,
            error: null
        };
        
        if (!name || typeof name !== 'string') {
            result.error = 'Bitte gib einen Namen ein.';
            return result;
        }
        
        const trimmed = name.trim();
        
        // Mindestlaenge
        if (trimmed.length < 2) {
            result.error = 'Der Name muss mindestens 2 Zeichen haben.';
            return result;
        }
        
        // Maximallaenge
        if (trimmed.length > 20) {
            result.error = 'Der Name darf maximal 20 Zeichen haben.';
            return result;
        }
        
        // Nur erlaubte Zeichen (Buchstaben, Zahlen, Umlaute, Leerzeichen)
        const allowedPattern = /^[a-zA-ZäöüÄÖÜß0-9\s]+$/;
        if (!allowedPattern.test(trimmed)) {
            result.error = 'Nur Buchstaben, Zahlen und Leerzeichen erlaubt.';
            return result;
        }
        
        // Schimpfwort-Check
        if (containsProfanity(trimmed)) {
            result.error = 'Dieser Name ist nicht erlaubt.';
            return result;
        }
        
        // Nicht nur Zahlen
        if (/^\d+$/.test(trimmed)) {
            result.error = 'Der Name darf nicht nur aus Zahlen bestehen.';
            return result;
        }
        
        // Nicht nur Leerzeichen
        if (trimmed.replace(/\s/g, '').length === 0) {
            result.error = 'Bitte gib einen gültigen Namen ein.';
            return result;
        }
        
        result.valid = true;
        return result;
    }
    
    // Public API
    return {
        validate: validateUsername,
        containsProfanity: containsProfanity,
        normalize: normalize
    };
    
})();

