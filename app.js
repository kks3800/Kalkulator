/* ===== KALKULATIONS-TRAINER - APP.JS ===== */

// ===== AUFGABEN MIT HILFE-TEXTEN =====
var TASKS = {
    1: {
        name: "Wecksystem mit Rabatt",
        text: "Ein Wecksystem wird zum BVP von 149,00 € angeboten. Ein langjähriger Kunde handelt 15% Rabatt heraus. a) Welchen Preis zahlt der Kunde? b) Berechnen Sie die enthaltene MwSt.",
        type: "reverse",
        solution: "a) 126,65 €  b) 20,22 €",
        badge: "Rückrechnung",
        help: {
            gegeben: "Bruttoverkaufspreis (BVP), Rabatt in %",
            gesucht: "a) Kundenpreis nach Rabatt, b) MwSt im reduzierten Preis",
            formel: "Kundenpreis = BVP × (1 - Rabatt%)\nMwSt = Kundenpreis ÷ 1,19 × 0,19",
            tipp: "Denke daran: Die MwSt ist im Bruttopreis bereits enthalten! Um sie herauszurechnen: Preis ÷ 1,19 × 0,19",
            mgkTyp: "Nicht relevant (Rückrechnung)"
        }
    },
    2: {
        name: "HG-Reparatur rückwärts",
        text: "Eine HG-Reparatur mit Ersatzteileinbau kostet 195,00 € brutto. Dabei wurden 12% Gewinn und 25 Minuten Arbeitszeit einkalkuliert. Berechnen Sie die Materialeinzelkosten.",
        type: "reverse",
        solution: "89,93 €",
        badge: "Rückrechnung",
        help: {
            gegeben: "BVP (195€), Gewinn (12%), Arbeitszeit (25min), Stundensatz Werkstatt (58,90€)",
            gesucht: "Materialeinzelkosten (MEK)",
            formel: "1. NVP = BVP ÷ 1,19\n2. Sk = NVP ÷ 1,12\n3. Fert = 25÷60 × 58,90\n4. Mges = Sk - Fert\n5. MEK = Mges ÷ 1,354",
            tipp: "Rückwärts rechnen! Vom Brutto zum Netto, dann Gewinn raus, dann Fertigung raus, dann MGK raus.",
            mgkTyp: "Ersatzteile/Material → 35,4%"
        }
    },
    3: {
        name: "Hörgerätereparatur",
        text: "Für Material und Ersatzteile entstehen MEK von 65,50 €. Der Gewinn soll 9% betragen, 35 Minuten Arbeitszeit (Werkstatt). Für die Gerätereinigung werden pauschal 6,95 € einkalkuliert.",
        type: "forward",
        data: { mek: 65.50, porto: 0, mgk: 35.4, min1: 35, rate1: 58.90, min2: 0, rate2: 60.50, pausch: 6.95, gewinn: 9 },
        solution: 168.62,
        badge: "Vorwärtskalkulation",
        help: {
            gegeben: "MEK (65,50€), Gewinn (9%), Arbeitszeit (35min Werkstatt), Pauschale (6,95€)",
            gesucht: "Bruttoverkaufspreis (BVP)",
            formel: "MEK → +MGK → Mges → +Fert → +Pauschale → Sk → +Gewinn → NVP → +MwSt → BVP",
            tipp: "Die Reinigungspauschale (6,95€) gehört zu den Fertigungskosten, nicht zu den Materialkosten!",
            mgkTyp: "Ersatzteile/Material → 35,4%"
        }
    },
    4: {
        name: "Wecksystem (Handelswaren!)",
        text: "Ein Wecksystem wird für 39,99 € eingekauft. Berechnen Sie den BVP bei einem Gewinn von 18%.",
        type: "forward",
        data: { mek: 39.99, porto: 0, mgk: 108, min1: 0, rate1: 0, min2: 0, rate2: 0, pausch: 0, gewinn: 18 },
        solution: 116.80,
        badge: "⚠️ Handelswaren 108%",
        help: {
            gegeben: "Einkaufspreis (39,99€), Gewinn (18%)",
            gesucht: "Bruttoverkaufspreis (BVP)",
            formel: "MEK → +MGK (108%!) → Mges → Sk → +Gewinn → NVP → +MwSt → BVP",
            tipp: "ACHTUNG: Wecksysteme sind HANDELSWAREN! Deshalb MGK-Zuschlag von 108%, nicht 35,4%!",
            mgkTyp: "Handelswaren → 108%"
        }
    },
    5: {
        name: "Rabatt + Skonto",
        text: "Eine Stammkundin erhält 5% Rabatt auf den EVP von 189,90 € sowie 2% Skonto bei Barzahlung. a) Skontobetrag? b) Verkaufspreis bei Barzahlung? c) MwSt im Barzahlungspreis?",
        type: "reverse",
        solution: "a) 3,61 €  b) 176,80 €  c) 28,23 €",
        badge: "Rabatt/Skonto",
        help: {
            gegeben: "EVP (189,90€), Rabatt (5%), Skonto (2%)",
            gesucht: "a) Skontobetrag, b) Endpreis bei Barzahlung, c) enthaltene MwSt",
            formel: "1. Rabattpreis = EVP × 0,95\n2. Skonto = Rabattpreis × 0,02\n3. Barpreis = Rabattpreis - Skonto\n4. MwSt = Barpreis ÷ 1,19 × 0,19",
            tipp: "Erst Rabatt abziehen, DANN Skonto vom rabattierten Preis berechnen! Skonto bezieht sich auf den bereits reduzierten Preis.",
            mgkTyp: "Nicht relevant (Rückrechnung)"
        }
    },
    6: {
        name: "Paar Hörgeräte (komplex)",
        text: "BVP für ein Paar Hörgeräte: Einkauf 1.200,00 € + 4,10 € Porto. Gewinn 8%. Audiometrie: 3 Std 45 Min (63,40 €/h). Anpassung: 8 Std 20 Min (60,50 €/h).",
        type: "forward",
        data: { mek: 1200, porto: 4.10, mgk: 32.8, min1: 225, rate1: 63.40, min2: 500, rate2: 60.50, pausch: 0, gewinn: 8, showFert2: true },
        solution: 2705.22,
        badge: "2 Arbeitszeiten",
        help: {
            gegeben: "Einkauf (1.200€), Porto (4,10€), Gewinn (8%), Audiometrie (3h45min), Anpassung (8h20min)",
            gesucht: "Bruttoverkaufspreis (BVP)",
            formel: "MEK = 1200 + 4,10\nFert1 = 225min ÷ 60 × 63,40\nFert2 = 500min ÷ 60 × 60,50\nDann normal weiter...",
            tipp: "ZWEI verschiedene Arbeitszeitarten mit verschiedenen Stundensätzen! 3h45min = 225 Minuten. 8h20min = 500 Minuten.",
            mgkTyp: "Hörgeräte → 32,8%"
        }
    },
    7: {
        name: "GKV Zuzahlung",
        text: "Ausgehend vom Preis in Aufgabe 6: Berechnen Sie die Zuzahlung eines GKV-Versicherten bei binauraler Versorgung (KK-Vertrag: 741,00 € für HG1, Abschlag 156,00 € für HG2).",
        type: "reverse",
        solution: "1.399,22 €",
        badge: "Zuzahlung",
        help: {
            gegeben: "BVP aus Aufgabe 6 (2.705,22€), KK-Vertrag HG1 (741€), Abschlag HG2 (156€)",
            gesucht: "Zuzahlung des Versicherten",
            formel: "Zuzahlung = BVP - (KK-Zahlung HG1 + KK-Zahlung HG2)\nKK-Zahlung HG2 = 741€ - 156€ = 585€",
            tipp: "Die Krankenkasse zahlt für das zweite HG weniger (Abschlag). HG1: 741€, HG2: 741€ - 156€ = 585€. Gesamt KK: 1.326€",
            mgkTyp: "Nicht relevant"
        }
    },
    8: {
        name: "EVP Rückrechnung",
        text: "Der Endverkaufspreis für ein Hörgerät beträgt 2.800,00 € bei einem Gewinnzuschlag von 12%. Berechnen Sie den EVP, wenn der Gewinn nur noch 5% betragen soll.",
        type: "reverse",
        solution: "2.625,00 €",
        badge: "Rückrechnung",
        help: {
            gegeben: "EVP bei 12% Gewinn (2.800€), neuer Gewinn (5%)",
            gesucht: "Neuer EVP",
            formel: "1. NVP alt = 2800 ÷ 1,19\n2. Sk = NVP ÷ 1,12\n3. NVP neu = Sk × 1,05\n4. EVP neu = NVP × 1,19",
            tipp: "Erst den alten Gewinn rausrechnen, um die Selbstkosten zu bekommen. Dann mit neuem Gewinn wieder draufrechnen.",
            mgkTyp: "Nicht relevant"
        }
    },
    9: {
        name: "Otoplastik (Porto-Falle!)",
        text: "Der Laborpreis für eine fremdgefertigte Otoplastik beläuft sich auf 35,00 € zuzüglich 4,95 € Transportkosten. Für Abformung pauschal 20,00 €. Gewinn 8%. BVP berechnen.",
        type: "forward",
        data: { mek: 35.00, porto: 4.95, mgk: 35.4, min1: 0, rate1: 58.90, min2: 0, rate2: 0, pausch: 20.00, gewinn: 8 },
        solution: 95.22,
        badge: "⚠️ Porto zu MEK!",
        help: {
            gegeben: "Laborpreis (35€), Transportkosten (4,95€), Pauschale (20€), Gewinn (8%)",
            gesucht: "Bruttoverkaufspreis (BVP)",
            formel: "MEK = 35,00 + 4,95 = 39,95€ (WICHTIG!)\nDann normal: +MGK → Mges → +Pauschale → Sk → +Gewinn → +MwSt → BVP",
            tipp: "FALLE: Die 4,95€ Transportkosten gehören ZUERST zu den MEK addiert! Erst dann kommt der MGK-Zuschlag auf die Summe!",
            mgkTyp: "Otoplastik → 35,4%"
        }
    },
    10: {
        name: "Batterien (Gewinn ändern)",
        text: "Der Nettoverkaufspreis für eine Packung Batterien beträgt 3,75 €. Dabei sind 10% Gewinn eingerechnet. Berechnen Sie den BVP, wenn der Gewinn nur bei 4% liegen soll.",
        type: "reverse",
        solution: "4,22 €",
        badge: "Rückrechnung",
        help: {
            gegeben: "NVP bei 10% Gewinn (3,75€), neuer Gewinn (4%)",
            gesucht: "Neuer BVP",
            formel: "1. Sk = NVP ÷ 1,10 = 3,41€\n2. NVP neu = Sk × 1,04 = 3,55€\n3. BVP = NVP × 1,19 = 4,22€",
            tipp: "Ähnlich wie Aufgabe 8, aber hier ist der NVP gegeben (nicht BVP). Also erst Gewinn raus, dann neuen Gewinn drauf, dann MwSt.",
            mgkTyp: "Nicht relevant"
        }
    },
    11: {
        name: "Gehörschutz-Paar",
        text: "Für ein Paar Gehörschutzotoplastiken entstehen im Einkauf Materialkosten von 12,00 €, die Filter kosten 25,00 € pro Stück (= 2×25 = 50€). Gewinn 9%. 75 Minuten Arbeitszeit. BVP?",
        type: "forward",
        data: { mek: 62.00, porto: 0, mgk: 35.4, min1: 75, rate1: 58.90, min2: 0, rate2: 0, pausch: 0, gewinn: 9 },
        solution: 204.39,
        badge: "Vorwärtskalkulation",
        help: {
            gegeben: "Material (12€), 2 Filter à 25€ (= 50€), Gewinn (9%), Arbeitszeit (75min Werkstatt)",
            gesucht: "Bruttoverkaufspreis (BVP)",
            formel: "MEK = 12 + 50 = 62€\nDann normal weiter mit MGK, Fertigung, Gewinn, MwSt",
            tipp: "Die Gesamtmaterialkosten sind 12€ + 2×25€ = 62€. Das sind die MEK!",
            mgkTyp: "Otoplastik → 35,4%"
        }
    }
};

// ===== HILFE-TEXTE FÜR BERECHNUNGSSCHRITTE =====
var HILFE = {
    mek: {
        titel: "Materialeinzelkosten (MEK)",
        text: "Die MEK sind der Einkaufspreis des Materials PLUS alle Bezugskosten (Porto, Transport, Verpackung).",
        details: [
            "Erst alle Kosten zusammenrechnen",
            "DANN kommt der MGK-Zuschlag",
            "Häufiger Fehler: Porto vergessen!"
        ]
    },
    mgk: {
        titel: "Materialgemeinkosten (MGK)",
        text: "Der MGK-Zuschlag deckt alle Gemeinkosten ab, die nicht direkt einem Produkt zugeordnet werden können (Lagerkosten, Verwaltung, etc.).",
        details: [
            "Hörgeräte: 32,8%",
            "Otoplastik/Material/Ersatzteile: 35,4%",
            "Handelswaren (z.B. Wecker): 108%"
        ]
    },
    mges: {
        titel: "Materialgesamtkosten (Mges)",
        text: "Die Summe aus Materialeinzelkosten und Materialgemeinkosten.",
        details: [
            "Mges = MEK + MGK",
            "Basis für die weiteren Berechnungen"
        ]
    },
    fert: {
        titel: "Fertigungskosten",
        text: "Die Kosten für die Arbeitszeit, umgerechnet von Minuten in Euro.",
        details: [
            "Formel: (Minuten ÷ 60) × Stundensatz",
            "HG-Anpassung: 60,50 €/Std",
            "Audiometrie: 63,40 €/Std",
            "Werkstatt/Labor: 58,90 €/Std"
        ]
    },
    pausch: {
        titel: "Pauschalen",
        text: "Feste Beträge für bestimmte Leistungen wie Reinigung, Abformung, etc.",
        details: [
            "Werden direkt in Euro angegeben",
            "Zu den Fertigungskosten addieren",
            "Beispiel: Reinigung 6,95€"
        ]
    },
    sk: {
        titel: "Selbstkosten (Sk)",
        text: "Alle Kosten, die für Herstellung/Beschaffung anfallen – ohne Gewinn!",
        details: [
            "Sk = Mges + Fertigungskosten",
            "Grundlage für die Gewinnberechnung",
            "= 100% bei der Gewinnkalkulation"
        ]
    },
    gewinn: {
        titel: "Gewinn",
        text: "Der Aufschlag auf die Selbstkosten, der als Ertrag übrig bleibt.",
        details: [
            "Wird in Prozent angegeben",
            "Berechnung: Sk × Gewinn%",
            "Typische Werte: 5% - 18%"
        ]
    },
    nvp: {
        titel: "Nettoverkaufspreis (NVP)",
        text: "Der Preis ohne Mehrwertsteuer – was der Händler nach Steuern erhält.",
        details: [
            "NVP = Sk + Gewinn",
            "= 100% für die MwSt-Berechnung",
            "Grundlage für die Steuer"
        ]
    },
    mwst: {
        titel: "Mehrwertsteuer (MwSt)",
        text: "Die gesetzliche Steuer von 19%, die auf den Nettopreis aufgeschlagen wird.",
        details: [
            "Immer 19% auf NVP",
            "Wird an das Finanzamt abgeführt",
            "Berechnung: NVP × 0,19"
        ]
    },
    bvp: {
        titel: "Bruttoverkaufspreis (BVP)",
        text: "Der Endpreis inklusive MwSt – was der Kunde tatsächlich bezahlt.",
        details: [
            "BVP = NVP × 1,19",
            "= NVP + MwSt",
            "Das ist der Preis auf dem Preisschild!"
        ]
    }
};

// ===== LOCALSTORAGE FUNKTIONEN =====
var STORAGE_KEY = 'kalkulationstrainer';

function loadStats() {
    try {
        var data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.log('localStorage nicht verfügbar');
    }
    return {
        totalSolved: 0,
        bestStreak: 0,
        currentStreak: 0,
        solvedTasks: [],
        lastSession: null,
        sessions: []
    };
}

function saveStats(stats) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
        console.log('Konnte nicht speichern');
    }
}

function resetStats() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
}

// ===== SESSION MANAGEMENT =====
var currentSession = {
    started: new Date(),
    attempted: [],
    correct: [],
    wrong: []
};

function startNewSession() {
    currentSession = {
        started: new Date(),
        attempted: [],
        correct: [],
        wrong: []
    };
}

function markTaskAttempted(taskId, isCorrect) {
    if (currentSession.attempted.indexOf(taskId) === -1) {
        currentSession.attempted.push(taskId);
    }
    
    if (isCorrect) {
        if (currentSession.correct.indexOf(taskId) === -1) {
            currentSession.correct.push(taskId);
        }
        // Aus wrong entfernen falls vorher falsch
        var wrongIdx = currentSession.wrong.indexOf(taskId);
        if (wrongIdx > -1) {
            currentSession.wrong.splice(wrongIdx, 1);
        }
    } else {
        if (currentSession.wrong.indexOf(taskId) === -1 && currentSession.correct.indexOf(taskId) === -1) {
            currentSession.wrong.push(taskId);
        }
    }
}

function endSession() {
    var stats = loadStats();
    
    // Session speichern
    stats.sessions.push({
        date: currentSession.started.toISOString(),
        attempted: currentSession.attempted.length,
        correct: currentSession.correct.length
    });
    
    // Nur die letzten 10 Sessions behalten
    if (stats.sessions.length > 10) {
        stats.sessions = stats.sessions.slice(-10);
    }
    
    stats.lastSession = new Date().toISOString();
    
    saveStats(stats);
    
    // Session-Daten für Ergebnisseite speichern
    try {
        sessionStorage.setItem('lastSession', JSON.stringify(currentSession));
    } catch (e) {}
}

// ===== BERECHNUNGS-FUNKTIONEN =====
function eur(n) {
    return n.toLocaleString('de-DE', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }) + ' €';
}

function round(n) {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

function calculate(values) {
    var mek = values.mek || 0;
    var porto = values.porto || 0;
    var mgkP = values.mgk || 0;
    var min1 = values.min1 || 0;
    var rate1 = values.rate1 || 0;
    var min2 = values.min2 || 0;
    var rate2 = values.rate2 || 0;
    var pausch = values.pausch || 0;
    var gewinnP = values.gewinn || 0;

    var mekTotal = round(mek + porto);
    var mgkVal = round(mekTotal * mgkP / 100);
    var mges = round(mekTotal + mgkVal);
    
    var fert1 = round((min1 / 60) * rate1);
    var fert2 = round((min2 / 60) * rate2);
    var fertTotal = round(fert1 + fert2 + pausch);
    
    var sk = round(mges + fertTotal);
    var gewinnVal = round(sk * gewinnP / 100);
    var nvp = round(sk + gewinnVal);
    
    var mwst = round(nvp * 0.19);
    var bvp = round(nvp + mwst);

    return {
        mekTotal: mekTotal,
        mgkVal: mgkVal,
        mges: mges,
        fert1: fert1,
        fert2: fert2,
        fertTotal: fertTotal,
        sk: sk,
        gewinnVal: gewinnVal,
        nvp: nvp,
        mwst: mwst,
        bvp: bvp
    };
}

// ===== MODAL FUNKTIONEN =====
function showModal(title, content) {
    var overlay = document.getElementById('modalOverlay');
    var modalTitle = document.getElementById('modalTitle');
    var modalBody = document.getElementById('modalBody');
    
    if (!overlay) return;
    
    modalTitle.innerHTML = title;
    modalBody.innerHTML = content;
    overlay.classList.add('show');
    
    // Body scroll verhindern
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    var overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function showStepHelp(stepKey) {
    var help = HILFE[stepKey];
    if (!help) return;
    
    var content = '<p>' + help.text + '</p>';
    content += '<ul>';
    for (var i = 0; i < help.details.length; i++) {
        content += '<li>' + help.details[i] + '</li>';
    }
    content += '</ul>';
    
    showModal('ℹ️ ' + help.titel, content);
}

function showTaskHelp(taskId) {
    var task = TASKS[taskId];
    if (!task || !task.help) return;
    
    var h = task.help;
    var content = '<p><strong>Gegeben:</strong> ' + h.gegeben + '</p>';
    content += '<p><strong>Gesucht:</strong> ' + h.gesucht + '</p>';
    content += '<p><strong>Lösungsweg:</strong><br><code style="background:#f1f5f9;padding:8px;display:block;border-radius:8px;font-size:0.85rem;white-space:pre-wrap;">' + h.formel + '</code></p>';
    content += '<p><strong>💡 Tipp:</strong> ' + h.tipp + '</p>';
    content += '<p><strong>MGK-Satz:</strong> ' + h.mgkTyp + '</p>';
    
    showModal('📝 Hilfe: Aufgabe ' + taskId, content);
}

// ===== INITIALISIERUNG =====
document.addEventListener('DOMContentLoaded', function() {
    // Modal-Overlay Click zum Schließen
    var overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }
    
    // Modal-Close-Button
    var closeBtn = document.getElementById('modalClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Modal-Verstanden-Button
    var okBtn = document.getElementById('modalOk');
    if (okBtn) {
        okBtn.addEventListener('click', closeModal);
    }
});

