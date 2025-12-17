// ===== PROFIL-SYSTEM =====
// Verwaltet Benutzerprofile mit localStorage

const PROFILES = (function() {
    
    const STORAGE_KEY = 'kalktrainer_profiles';
    const CURRENT_KEY = 'kalktrainer_current';
    
    // Storage-Verfügbarkeit prüfen
    let storageAvailable = false;
    let storageError = null;
    
    function checkStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            storageAvailable = true;
            return true;
        } catch (e) {
            storageAvailable = false;
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                storageError = 'Speicher voll! Bitte Browser-Daten löschen.';
            } else if (e.name === 'SecurityError') {
                storageError = 'Speichern blockiert! Bitte privaten Modus deaktivieren.';
            } else {
                storageError = 'Speichern nicht möglich. Versuche den Browser zu wechseln oder den privaten Modus zu deaktivieren.';
            }
            console.error('Storage nicht verfügbar:', e);
            return false;
        }
    }
    
    // Initial check
    checkStorage();
    
    // Alle Profile laden
    function loadAll() {
        if (!storageAvailable) {
            // Fallback zu sessionStorage
            try {
                const data = sessionStorage.getItem(STORAGE_KEY);
                if (data) return JSON.parse(data);
            } catch (e) {}
            return {};
        }
        
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Fehler beim Laden der Profile:', e);
        }
        return {};
    }
    
    // Alle Profile speichern
    function saveAll(profiles) {
        const jsonData = JSON.stringify(profiles);
        
        // Versuche localStorage
        try {
            localStorage.setItem(STORAGE_KEY, jsonData);
            storageAvailable = true;
            return { success: true };
        } catch (e) {
            console.warn('localStorage fehlgeschlagen, versuche sessionStorage:', e);
        }
        
        // Fallback: sessionStorage (Daten bleiben bis Browser geschlossen wird)
        try {
            sessionStorage.setItem(STORAGE_KEY, jsonData);
            return { 
                success: true, 
                warning: 'Daten werden nur bis zum Schließen des Browsers gespeichert (Privater Modus).'
            };
        } catch (e2) {
            console.error('Auch sessionStorage fehlgeschlagen:', e2);
        }
        
        return { 
            success: false, 
            error: storageError || 'Speichern nicht möglich. Bitte deaktiviere den privaten Modus oder wechsle den Browser.'
        };
    }
    
    // Storage-Status abfragen
    function getStorageStatus() {
        checkStorage();
        return {
            available: storageAvailable,
            error: storageError,
            type: storageAvailable ? 'localStorage' : 'sessionStorage'
        };
    }
    
    // Aktuelles Profil laden
    function getCurrent() {
        try {
            const name = localStorage.getItem(CURRENT_KEY);
            if (name) {
                const profiles = loadAll();
                if (profiles[name]) {
                    return { name: name, data: profiles[name] };
                }
            }
        } catch (e) {
            console.error('Fehler beim Laden des aktuellen Profils:', e);
        }
        return null;
    }
    
    // Aktuelles Profil setzen
    function setCurrent(name) {
        try {
            localStorage.setItem(CURRENT_KEY, name);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Pruefen ob Name existiert
    function exists(name) {
        const profiles = loadAll();
        const normalizedName = name.trim().toLowerCase();
        
        for (const existingName of Object.keys(profiles)) {
            if (existingName.toLowerCase() === normalizedName) {
                return existingName; // Gibt den exakten Namen zurueck
            }
        }
        return false;
    }
    
    // Neues Profil erstellen
    function create(name) {
        const validation = PROFANITY.validate(name);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        
        const trimmedName = name.trim();
        const existingName = exists(trimmedName);
        
        if (existingName) {
            return { 
                success: false, 
                error: 'Dieses Profil existiert bereits.',
                existingName: existingName
            };
        }
        
        const profiles = loadAll();
        profiles[trimmedName] = {
            created: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            solvedTasks: [],
            totalCorrect: 0,
            totalAttempts: 0,
            bestStreak: 0,
            currentStreak: 0,
            sessions: []
        };
        
        const saveResult = saveAll(profiles);
        
        if (saveResult.success) {
            setCurrent(trimmedName);
            return { 
                success: true, 
                name: trimmedName,
                warning: saveResult.warning // Falls sessionStorage als Fallback
            };
        }
        
        return { success: false, error: saveResult.error };
    }
    
    // Profil laden/anmelden
    function login(name) {
        const trimmedName = name.trim();
        const existingName = exists(trimmedName);
        
        if (!existingName) {
            return { success: false, error: 'Profil nicht gefunden.' };
        }
        
        const profiles = loadAll();
        profiles[existingName].lastActive = new Date().toISOString();
        saveAll(profiles);
        setCurrent(existingName);
        
        return { success: true, name: existingName, data: profiles[existingName] };
    }
    
    // Profil-Daten aktualisieren
    function update(data) {
        const current = getCurrent();
        if (!current) {
            return false;
        }
        
        const profiles = loadAll();
        profiles[current.name] = { ...profiles[current.name], ...data };
        profiles[current.name].lastActive = new Date().toISOString();
        
        return saveAll(profiles).success;
    }
    
    // Aufgabe als geloest markieren
    function markSolved(taskId) {
        const current = getCurrent();
        if (!current) return false;
        
        const profiles = loadAll();
        const profile = profiles[current.name];
        
        if (!profile.solvedTasks.includes(taskId)) {
            profile.solvedTasks.push(taskId);
        }
        
        profile.totalCorrect++;
        profile.totalAttempts++;
        profile.currentStreak++;
        
        if (profile.currentStreak > profile.bestStreak) {
            profile.bestStreak = profile.currentStreak;
        }
        
        return saveAll(profiles).success;
    }
    
    // Falschen Versuch markieren
    function markWrong() {
        const current = getCurrent();
        if (!current) return false;
        
        const profiles = loadAll();
        const profile = profiles[current.name];
        
        profile.totalAttempts++;
        profile.currentStreak = 0;
        
        return saveAll(profiles).success;
    }
    
    // Session hinzufuegen
    function addSession(sessionData) {
        const current = getCurrent();
        if (!current) return false;
        
        const profiles = loadAll();
        const profile = profiles[current.name];
        
        profile.sessions.push({
            date: new Date().toISOString(),
            ...sessionData
        });
        
        // Nur die letzten 20 Sessions behalten
        if (profile.sessions.length > 20) {
            profile.sessions = profile.sessions.slice(-20);
        }
        
        return saveAll(profiles).success;
    }
    
    // Profil loeschen
    function remove(name) {
        const profiles = loadAll();
        const existingName = exists(name);
        
        if (!existingName) {
            return false;
        }
        
        delete profiles[existingName];
        saveAll(profiles);
        
        // Wenn aktuelles Profil geloescht wurde
        const current = getCurrent();
        if (current && current.name === existingName) {
            localStorage.removeItem(CURRENT_KEY);
        }
        
        return true;
    }
    
    // Ausloggen
    function logout() {
        localStorage.removeItem(CURRENT_KEY);
    }
    
    // Alle Profile auflisten
    function list() {
        const profiles = loadAll();
        return Object.keys(profiles).map(name => ({
            name: name,
            created: profiles[name].created,
            lastActive: profiles[name].lastActive,
            solved: profiles[name].solvedTasks.length,
            bestStreak: profiles[name].bestStreak
        })).sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
    }
    
    // Statistiken des aktuellen Profils
    function getStats() {
        const current = getCurrent();
        if (!current) {
            return null;
        }
        
        const data = current.data;
        return {
            name: current.name,
            solved: data.solvedTasks.length,
            totalCorrect: data.totalCorrect,
            totalAttempts: data.totalAttempts,
            accuracy: data.totalAttempts > 0 
                ? Math.round((data.totalCorrect / data.totalAttempts) * 100) 
                : 0,
            bestStreak: data.bestStreak,
            currentStreak: data.currentStreak,
            sessionsCount: data.sessions.length,
            solvedTasks: data.solvedTasks
        };
    }
    
    // Public API
    return {
        loadAll: loadAll,
        getCurrent: getCurrent,
        exists: exists,
        create: create,
        login: login,
        update: update,
        markSolved: markSolved,
        markWrong: markWrong,
        addSession: addSession,
        remove: remove,
        logout: logout,
        list: list,
        getStats: getStats,
        getStorageStatus: getStorageStatus
    };
    
})();

