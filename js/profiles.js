// ===== PROFIL-SYSTEM =====
// Verwaltet Benutzerprofile mit universellem Storage (Safari iOS kompatibel)

const PROFILES = (function() {
    
    const STORAGE_KEY = 'kalktrainer_profiles';
    const CURRENT_KEY = 'kalktrainer_current';
    
    // Cache für synchrone Operationen
    let profilesCache = null;
    let currentCache = null;
    let initialized = false;
    
    // Initialisierung (lädt Daten in Cache)
    async function init() {
        try {
            profilesCache = await STORAGE.get(STORAGE_KEY) || {};
            currentCache = await STORAGE.get(CURRENT_KEY) || null;
            initialized = true;
        } catch (e) {
            console.error('Profiles init error:', e);
            profilesCache = {};
            currentCache = null;
            initialized = true;
        }
    }
    
    // Alle Profile laden (synchron aus Cache)
    function loadAll() {
        return profilesCache || {};
    }
    
    // Alle Profile speichern
    async function saveAll(profiles) {
        profilesCache = profiles;
        return await STORAGE.set(STORAGE_KEY, profiles);
    }
    
    // Aktuelles Profil aus Cache
    function getCurrent() {
        if (!currentCache) return null;
        
        const profiles = loadAll();
        if (profiles[currentCache]) {
            return { name: currentCache, data: profiles[currentCache] };
        }
        return null;
    }
    
    // Aktuelles Profil setzen
    async function setCurrent(name) {
        currentCache = name;
        return await STORAGE.set(CURRENT_KEY, name);
    }
    
    // Pruefen ob Name existiert
    function exists(name) {
        const profiles = loadAll();
        const normalizedName = name.trim().toLowerCase();
        
        for (const existingName of Object.keys(profiles)) {
            if (existingName.toLowerCase() === normalizedName) {
                return existingName;
            }
        }
        return false;
    }
    
    // Neues Profil erstellen
    async function create(name) {
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
        
        const saveResult = await saveAll(profiles);
        
        if (saveResult.success) {
            await setCurrent(trimmedName);
            return { 
                success: true, 
                name: trimmedName,
                warning: saveResult.warning
            };
        }
        
        return { success: false, error: saveResult.error || 'Speichern fehlgeschlagen.' };
    }
    
    // Profil laden/anmelden
    async function login(name) {
        const trimmedName = name.trim();
        const existingName = exists(trimmedName);
        
        if (!existingName) {
            return { success: false, error: 'Profil nicht gefunden.' };
        }
        
        const profiles = loadAll();
        profiles[existingName].lastActive = new Date().toISOString();
        await saveAll(profiles);
        await setCurrent(existingName);
        
        return { success: true, name: existingName, data: profiles[existingName] };
    }
    
    // Profil-Daten aktualisieren
    async function update(data) {
        const current = getCurrent();
        if (!current) return false;
        
        const profiles = loadAll();
        profiles[current.name] = { ...profiles[current.name], ...data };
        profiles[current.name].lastActive = new Date().toISOString();
        
        const result = await saveAll(profiles);
        return result.success;
    }
    
    // Aufgabe als geloest markieren
    async function markSolved(taskId) {
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
        
        const result = await saveAll(profiles);
        return result.success;
    }
    
    // Falschen Versuch markieren
    async function markWrong() {
        const current = getCurrent();
        if (!current) return false;
        
        const profiles = loadAll();
        const profile = profiles[current.name];
        
        profile.totalAttempts++;
        profile.currentStreak = 0;
        
        const result = await saveAll(profiles);
        return result.success;
    }
    
    // Session hinzufuegen
    async function addSession(sessionData) {
        const current = getCurrent();
        if (!current) return false;
        
        const profiles = loadAll();
        const profile = profiles[current.name];
        
        profile.sessions.push({
            date: new Date().toISOString(),
            ...sessionData
        });
        
        if (profile.sessions.length > 20) {
            profile.sessions = profile.sessions.slice(-20);
        }
        
        const result = await saveAll(profiles);
        return result.success;
    }
    
    // Profil loeschen
    async function remove(name) {
        const profiles = loadAll();
        const existingName = exists(name);
        
        if (!existingName) return false;
        
        delete profiles[existingName];
        await saveAll(profiles);
        
        const current = getCurrent();
        if (current && current.name === existingName) {
            await STORAGE.remove(CURRENT_KEY);
            currentCache = null;
        }
        
        return true;
    }
    
    // Ausloggen
    async function logout() {
        await STORAGE.remove(CURRENT_KEY);
        currentCache = null;
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
        if (!current) return null;
        
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
    
    // Storage-Status
    function getStorageStatus() {
        return STORAGE.getStatus();
    }
    
    // Public API
    return {
        init: init,
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
