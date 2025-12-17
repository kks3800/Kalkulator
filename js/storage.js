// ===== UNIVERSELLER STORAGE =====
// Funktioniert auf Safari iOS, Chrome, Firefox - überall!
// Priorität: localStorage → IndexedDB → sessionStorage → Memory

const STORAGE = (function() {
    
    const DB_NAME = 'KalkTrainerDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'data';
    
    let storageType = 'memory';
    let memoryStorage = {};
    let db = null;
    let isReady = false;
    let readyCallbacks = [];
    
    // ===== LocalStorage Test =====
    function testLocalStorage() {
        try {
            const test = '__ls_test__';
            localStorage.setItem(test, test);
            const result = localStorage.getItem(test);
            localStorage.removeItem(test);
            return result === test;
        } catch (e) {
            return false;
        }
    }
    
    // ===== SessionStorage Test =====
    function testSessionStorage() {
        try {
            const test = '__ss_test__';
            sessionStorage.setItem(test, test);
            const result = sessionStorage.getItem(test);
            sessionStorage.removeItem(test);
            return result === test;
        } catch (e) {
            return false;
        }
    }
    
    // ===== IndexedDB Setup =====
    function initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB nicht verfügbar'));
                return;
            }
            
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };
            
            request.onupgradeneeded = (event) => {
                const database = event.target.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME);
                }
            };
        });
    }
    
    // ===== IndexedDB Operations =====
    function idbGet(key) {
        return new Promise((resolve, reject) => {
            if (!db) {
                resolve(null);
                return;
            }
            
            try {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const request = store.get(key);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } catch (e) {
                resolve(null);
            }
        });
    }
    
    function idbSet(key, value) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('DB nicht initialisiert'));
                return;
            }
            
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const request = store.put(value, key);
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            } catch (e) {
                reject(e);
            }
        });
    }
    
    function idbRemove(key) {
        return new Promise((resolve, reject) => {
            if (!db) {
                resolve(false);
                return;
            }
            
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const request = store.delete(key);
                
                request.onsuccess = () => resolve(true);
                request.onerror = () => reject(request.error);
            } catch (e) {
                resolve(false);
            }
        });
    }
    
    // ===== Unified API =====
    async function init() {
        // Test localStorage first (fastest)
        if (testLocalStorage()) {
            storageType = 'localStorage';
            console.log('✅ Storage: localStorage');
            setReady();
            return;
        }
        
        // Try IndexedDB (works on Safari when localStorage fails)
        try {
            await initIndexedDB();
            storageType = 'indexedDB';
            console.log('✅ Storage: IndexedDB');
            setReady();
            return;
        } catch (e) {
            console.warn('IndexedDB failed:', e);
        }
        
        // Fallback to sessionStorage
        if (testSessionStorage()) {
            storageType = 'sessionStorage';
            console.log('⚠️ Storage: sessionStorage (temporär)');
            setReady();
            return;
        }
        
        // Last resort: memory (won't persist)
        storageType = 'memory';
        console.warn('⚠️ Storage: memory (keine Persistenz)');
        setReady();
    }
    
    function setReady() {
        isReady = true;
        readyCallbacks.forEach(cb => cb());
        readyCallbacks = [];
    }
    
    function onReady(callback) {
        if (isReady) {
            callback();
        } else {
            readyCallbacks.push(callback);
        }
    }
    
    // ===== Public API =====
    async function get(key) {
        switch (storageType) {
            case 'localStorage':
                try {
                    const data = localStorage.getItem(key);
                    return data ? JSON.parse(data) : null;
                } catch (e) {
                    return null;
                }
                
            case 'indexedDB':
                return await idbGet(key);
                
            case 'sessionStorage':
                try {
                    const data = sessionStorage.getItem(key);
                    return data ? JSON.parse(data) : null;
                } catch (e) {
                    return null;
                }
                
            case 'memory':
            default:
                return memoryStorage[key] || null;
        }
    }
    
    async function set(key, value) {
        switch (storageType) {
            case 'localStorage':
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return { success: true };
                } catch (e) {
                    return { success: false, error: 'localStorage Fehler: ' + e.message };
                }
                
            case 'indexedDB':
                try {
                    await idbSet(key, value);
                    return { success: true };
                } catch (e) {
                    return { success: false, error: 'IndexedDB Fehler: ' + e.message };
                }
                
            case 'sessionStorage':
                try {
                    sessionStorage.setItem(key, JSON.stringify(value));
                    return { success: true, warning: 'Daten nur bis Browser geschlossen wird gespeichert.' };
                } catch (e) {
                    return { success: false, error: 'sessionStorage Fehler: ' + e.message };
                }
                
            case 'memory':
            default:
                memoryStorage[key] = value;
                return { success: true, warning: 'Daten werden NICHT dauerhaft gespeichert!' };
        }
    }
    
    async function remove(key) {
        switch (storageType) {
            case 'localStorage':
                try { localStorage.removeItem(key); } catch (e) {}
                break;
            case 'indexedDB':
                await idbRemove(key);
                break;
            case 'sessionStorage':
                try { sessionStorage.removeItem(key); } catch (e) {}
                break;
            case 'memory':
                delete memoryStorage[key];
                break;
        }
    }
    
    function getType() {
        return storageType;
    }
    
    function getStatus() {
        return {
            type: storageType,
            persistent: storageType === 'localStorage' || storageType === 'indexedDB',
            ready: isReady
        };
    }
    
    // Initialize on load
    init();
    
    return {
        get: get,
        set: set,
        remove: remove,
        getType: getType,
        getStatus: getStatus,
        onReady: onReady,
        init: init
    };
    
})();

