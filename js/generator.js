// ===== AUFGABEN-GENERATOR =====
// Zufallszahlen fuer Aufgaben + automatische Loesungsberechnung

const GENERATOR = (function() {
    
    // Zufallszahl im Bereich (gerundet auf step)
    function randomInRange(min, max, step) {
        step = step || 0.01;
        const range = (max - min) / step;
        const randomSteps = Math.floor(Math.random() * (range + 1));
        const value = min + (randomSteps * step);
        return Math.round(value * 100) / 100;
    }
    
    // Runden auf 2 Dezimalstellen
    function round2(n) {
        return Math.round((n + Number.EPSILON) * 100) / 100;
    }
    
    // Vorwaertskalkulation berechnen
    function calculateForward(params) {
        const mekTotal = round2((params.mek || 0) + (params.porto || 0));
        const mgkVal = round2(mekTotal * (params.mgk || 0) / 100);
        const mges = round2(mekTotal + mgkVal);
        
        const fert1 = round2(((params.min1 || 0) / 60) * (params.rate1 || 0));
        const fert2 = round2(((params.min2 || 0) / 60) * (params.rate2 || 0));
        const fertTotal = round2(fert1 + fert2 + (params.pausch || 0));
        
        const sk = round2(mges + fertTotal);
        const gewinnVal = round2(sk * (params.gewinn || 0) / 100);
        const nvp = round2(sk + gewinnVal);
        
        const mwst = round2(nvp * 0.19);
        const bvp = round2(nvp + mwst);
        
        return {
            mekTotal, mgkVal, mges,
            fert1, fert2, fertTotal,
            sk, gewinnVal, nvp,
            mwst, bvp
        };
    }
    
    // Aufgaben-Templates mit Zufallsbereichen
    const TASK_TEMPLATES = {
        3: {
            name: "Hörgerätereparatur",
            type: "forward",
            textTemplate: "Für Material und Ersatzteile entstehen MEK von {mek} €. Der Gewinn soll {gewinn}% betragen, {min1} Minuten Arbeitszeit (Werkstatt). Für die Gerätereinigung werden pauschal {pausch} € einkalkuliert.",
            ranges: {
                mek: { min: 50, max: 90, step: 0.50 },
                porto: { fixed: 0 },
                mgk: { fixed: 35.4 },
                min1: { min: 25, max: 50, step: 5 },
                rate1: { fixed: 58.90 },
                min2: { fixed: 0 },
                rate2: { fixed: 0 },
                pausch: { min: 5, max: 10, step: 0.95 },
                gewinn: { min: 6, max: 12, step: 1 }
            },
            badge: "Vorwärtskalkulation",
            help: {
                gegeben: "MEK, Gewinn%, Arbeitszeit, Pauschale",
                gesucht: "Bruttoverkaufspreis (BVP)",
                formel: "MEK → +MGK → Mges → +Fert → +Pauschale → Sk → +Gewinn → NVP → +MwSt → BVP",
                tipp: "Die Reinigungspauschale gehört zu den Fertigungskosten!",
                mgkTyp: "Ersatzteile/Material → 35,4%"
            }
        },
        4: {
            name: "Wecksystem (Handelswaren!)",
            type: "forward",
            textTemplate: "Ein Wecksystem wird für {mek} € eingekauft. Berechnen Sie den BVP bei einem Gewinn von {gewinn}%.",
            ranges: {
                mek: { min: 25, max: 60, step: 0.99 },
                porto: { fixed: 0 },
                mgk: { fixed: 108 },
                min1: { fixed: 0 },
                rate1: { fixed: 0 },
                min2: { fixed: 0 },
                rate2: { fixed: 0 },
                pausch: { fixed: 0 },
                gewinn: { min: 12, max: 22, step: 1 }
            },
            badge: "⚠️ Handelswaren 108%",
            help: {
                gegeben: "Einkaufspreis, Gewinn%",
                gesucht: "Bruttoverkaufspreis (BVP)",
                formel: "MEK → +MGK (108%!) → Mges → Sk → +Gewinn → NVP → +MwSt → BVP",
                tipp: "ACHTUNG: Wecksysteme sind HANDELSWAREN! MGK-Zuschlag von 108%!",
                mgkTyp: "Handelswaren → 108%"
            }
        },
        6: {
            name: "Paar Hörgeräte (komplex)",
            type: "forward",
            textTemplate: "BVP für ein Paar Hörgeräte: Einkauf {mek} € + {porto} € Porto. Gewinn {gewinn}%. Audiometrie: {min1_h} Std {min1_m} Min. Anpassung: {min2_h} Std {min2_m} Min.",
            ranges: {
                mek: { min: 900, max: 1500, step: 50 },
                porto: { min: 3, max: 8, step: 0.10 },
                mgk: { fixed: 32.8 },
                min1: { min: 180, max: 270, step: 15 }, // Audiometrie
                rate1: { fixed: 63.40 },
                min2: { min: 420, max: 560, step: 20 }, // Anpassung
                rate2: { fixed: 60.50 },
                pausch: { fixed: 0 },
                gewinn: { min: 6, max: 12, step: 1 }
            },
            showFert2: true,
            badge: "2 Arbeitszeiten",
            help: {
                gegeben: "Einkauf, Porto, Gewinn%, Audiometrie, Anpassung",
                gesucht: "Bruttoverkaufspreis (BVP)",
                formel: "MEK = Einkauf + Porto\nFert1 + Fert2 berechnen\nDann normal weiter...",
                tipp: "ZWEI verschiedene Arbeitszeitarten mit verschiedenen Stundensätzen!",
                mgkTyp: "Hörgeräte → 32,8%"
            }
        },
        9: {
            name: "Otoplastik (Porto-Falle!)",
            type: "forward",
            textTemplate: "Der Laborpreis für eine fremdgefertigte Otoplastik beläuft sich auf {mek} € zuzüglich {porto} € Transportkosten. Für Abformung pauschal {pausch} €. Gewinn {gewinn}%. BVP berechnen.",
            ranges: {
                mek: { min: 28, max: 45, step: 1 },
                porto: { min: 3, max: 7, step: 0.95 },
                mgk: { fixed: 35.4 },
                min1: { fixed: 0 },
                rate1: { fixed: 58.90 },
                min2: { fixed: 0 },
                rate2: { fixed: 0 },
                pausch: { min: 15, max: 28, step: 1 },
                gewinn: { min: 6, max: 12, step: 1 }
            },
            badge: "⚠️ Porto zu MEK!",
            help: {
                gegeben: "Laborpreis, Transportkosten, Pauschale, Gewinn%",
                gesucht: "Bruttoverkaufspreis (BVP)",
                formel: "MEK = Laborpreis + Transportkosten (WICHTIG!)\nDann: +MGK → Mges → +Pauschale → Sk → +Gewinn → +MwSt → BVP",
                tipp: "FALLE: Die Transportkosten ZUERST zu den MEK addieren! Erst dann der MGK-Zuschlag!",
                mgkTyp: "Otoplastik → 35,4%"
            }
        },
        11: {
            name: "Gehörschutz-Paar",
            type: "forward",
            textTemplate: "Für ein Paar Gehörschutzotoplastiken entstehen im Einkauf Materialkosten von {material} €, die Filter kosten {filter} € pro Stück (= 2×{filter} = {filterTotal} €). Gewinn {gewinn}%. {min1} Minuten Arbeitszeit. BVP?",
            ranges: {
                material: { min: 8, max: 18, step: 1 },
                filter: { min: 20, max: 35, step: 5 },
                mgk: { fixed: 35.4 },
                min1: { min: 60, max: 100, step: 5 },
                rate1: { fixed: 58.90 },
                min2: { fixed: 0 },
                rate2: { fixed: 0 },
                pausch: { fixed: 0 },
                gewinn: { min: 7, max: 14, step: 1 }
            },
            badge: "Vorwärtskalkulation",
            help: {
                gegeben: "Material, 2 Filter, Gewinn%, Arbeitszeit",
                gesucht: "Bruttoverkaufspreis (BVP)",
                formel: "MEK = Material + 2 × Filterpreis\nDann normal weiter mit MGK, Fertigung, Gewinn, MwSt",
                tipp: "Gesamtmaterialkosten = Material + 2×Filter!",
                mgkTyp: "Otoplastik → 35,4%"
            }
        }
    };
    
    // Original-Aufgaben (unveraendert)
    const ORIGINAL_TASKS = {
        1: {
            name: "Wecksystem mit Rabatt",
            text: "Ein Wecksystem wird zum BVP von 149,00 € angeboten. Ein langjähriger Kunde handelt 15% Rabatt heraus. a) Welchen Preis zahlt der Kunde? b) Berechnen Sie die enthaltene MwSt.",
            type: "reverse",
            solution: "a) 126,65 €  b) 20,22 €",
            badge: "Rückrechnung",
            help: {
                gegeben: "BVP, Rabatt%",
                gesucht: "a) Kundenpreis, b) MwSt",
                formel: "Kundenpreis = BVP × (1 - Rabatt%)\nMwSt = Kundenpreis ÷ 1,19 × 0,19",
                tipp: "Die MwSt ist im Bruttopreis enthalten!",
                mgkTyp: "Nicht relevant"
            }
        },
        2: {
            name: "HG-Reparatur rückwärts",
            text: "Eine HG-Reparatur mit Ersatzteileinbau kostet 195,00 € brutto. Dabei wurden 12% Gewinn und 25 Minuten Arbeitszeit einkalkuliert. Berechnen Sie die Materialeinzelkosten.",
            type: "reverse",
            solution: "89,93 €",
            badge: "Rückrechnung",
            help: {
                gegeben: "BVP, Gewinn%, Arbeitszeit",
                gesucht: "Materialeinzelkosten (MEK)",
                formel: "NVP = BVP ÷ 1,19\nSk = NVP ÷ 1,12\nFert abziehen\nMEK = Mges ÷ 1,354",
                tipp: "Rückwärts rechnen! Vom Brutto schrittweise zurück.",
                mgkTyp: "Ersatzteile → 35,4%"
            }
        },
        5: {
            name: "Rabatt + Skonto",
            text: "Eine Stammkundin erhält 5% Rabatt auf den EVP von 189,90 € sowie 2% Skonto bei Barzahlung. a) Skontobetrag? b) Verkaufspreis bei Barzahlung? c) MwSt im Barzahlungspreis?",
            type: "reverse",
            solution: "a) 3,61 €  b) 176,80 €  c) 28,23 €",
            badge: "Rabatt/Skonto",
            help: {
                gegeben: "EVP, Rabatt%, Skonto%",
                gesucht: "a) Skontobetrag, b) Barpreis, c) MwSt",
                formel: "Rabattpreis = EVP × 0,95\nSkonto = Rabattpreis × 0,02\nBarpreis = Rabattpreis - Skonto",
                tipp: "Erst Rabatt, DANN Skonto vom rabattierten Preis!",
                mgkTyp: "Nicht relevant"
            }
        },
        7: {
            name: "GKV Zuzahlung",
            text: "Ausgehend vom Preis in Aufgabe 6 (2.705,22 €): Berechnen Sie die Zuzahlung eines GKV-Versicherten bei binauraler Versorgung (KK-Vertrag: 741,00 € für HG1, Abschlag 156,00 € für HG2).",
            type: "reverse",
            solution: "1.399,22 €",
            badge: "Zuzahlung",
            help: {
                gegeben: "BVP, KK-Vertrag HG1, Abschlag HG2",
                gesucht: "Zuzahlung",
                formel: "KK-Zahlung = 741 + (741 - 156) = 1.326 €\nZuzahlung = BVP - KK-Zahlung",
                tipp: "Für HG2 gibt es einen Abschlag!",
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
                gegeben: "EVP bei 12% Gewinn, neuer Gewinn 5%",
                gesucht: "Neuer EVP",
                formel: "NVP alt = EVP ÷ 1,19\nSk = NVP ÷ 1,12\nNVP neu = Sk × 1,05\nEVP neu = NVP × 1,19",
                tipp: "Alten Gewinn raus, neuen Gewinn drauf!",
                mgkTyp: "Nicht relevant"
            }
        },
        10: {
            name: "Batterien (Gewinn ändern)",
            text: "Der Nettoverkaufspreis für eine Packung Batterien beträgt 3,75 €. Dabei sind 10% Gewinn eingerechnet. Berechnen Sie den BVP, wenn der Gewinn nur bei 4% liegen soll.",
            type: "reverse",
            solution: "4,22 €",
            badge: "Rückrechnung",
            help: {
                gegeben: "NVP bei 10% Gewinn, neuer Gewinn 4%",
                gesucht: "Neuer BVP",
                formel: "Sk = NVP ÷ 1,10\nNVP neu = Sk × 1,04\nBVP = NVP × 1,19",
                tipp: "NVP ist gegeben, nicht BVP!",
                mgkTyp: "Nicht relevant"
            }
        }
    };
    
    // Aufgabe mit Zufallszahlen generieren
    function generate(taskId) {
        const template = TASK_TEMPLATES[taskId];
        
        if (!template) {
            // Originalaufgabe ohne Zufallszahlen
            const original = ORIGINAL_TASKS[taskId];
            if (original) {
                return {
                    id: taskId,
                    isRandom: false,
                    ...original
                };
            }
            return null;
        }
        
        // Zufallswerte generieren
        const values = {};
        
        for (const [key, range] of Object.entries(template.ranges)) {
            if (range.fixed !== undefined) {
                values[key] = range.fixed;
            } else {
                values[key] = randomInRange(range.min, range.max, range.step);
            }
        }
        
        // Spezialfall Aufgabe 11: MEK aus Material + 2*Filter
        if (taskId === 11) {
            values.filterTotal = values.filter * 2;
            values.mek = values.material + values.filterTotal;
            values.porto = 0;
        }
        
        // Spezialfall Aufgabe 6: Minuten in Stunden/Minuten umrechnen
        if (taskId === 6) {
            values.min1_h = Math.floor(values.min1 / 60);
            values.min1_m = values.min1 % 60;
            values.min2_h = Math.floor(values.min2 / 60);
            values.min2_m = values.min2 % 60;
        }
        
        // Text mit Werten fuellen
        let text = template.textTemplate;
        for (const [key, value] of Object.entries(values)) {
            const formatted = typeof value === 'number' 
                ? value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(',00', '')
                : value;
            text = text.replace(new RegExp('\\{' + key + '\\}', 'g'), formatted);
        }
        
        // Loesung berechnen
        const result = calculateForward(values);
        
        return {
            id: taskId,
            isRandom: true,
            name: template.name,
            text: text,
            type: template.type,
            data: values,
            solution: result.bvp,
            result: result,
            showFert2: template.showFert2 || false,
            badge: template.badge + " (Zufallswerte)",
            help: template.help
        };
    }
    
    // Originalaufgabe laden
    function getOriginal(taskId) {
        // Erst in Templates schauen
        const template = TASK_TEMPLATES[taskId];
        if (template) {
            // Originalwerte aus dem ersten Plan verwenden
            const originalData = getOriginalData(taskId);
            return {
                id: taskId,
                isRandom: false,
                name: template.name,
                text: generateOriginalText(taskId),
                type: template.type,
                data: originalData,
                solution: calculateForward(originalData).bvp,
                showFert2: template.showFert2 || false,
                badge: template.badge,
                help: template.help
            };
        }
        
        // In Originalaufgaben schauen
        const original = ORIGINAL_TASKS[taskId];
        if (original) {
            return {
                id: taskId,
                isRandom: false,
                ...original
            };
        }
        
        return null;
    }
    
    // Original-Daten fuer Vorwaertskalkulationen
    function getOriginalData(taskId) {
        const originals = {
            3: { mek: 65.50, porto: 0, mgk: 35.4, min1: 35, rate1: 58.90, min2: 0, rate2: 0, pausch: 6.95, gewinn: 9 },
            4: { mek: 39.99, porto: 0, mgk: 108, min1: 0, rate1: 0, min2: 0, rate2: 0, pausch: 0, gewinn: 18 },
            6: { mek: 1200, porto: 4.10, mgk: 32.8, min1: 225, rate1: 63.40, min2: 500, rate2: 60.50, pausch: 0, gewinn: 8 },
            9: { mek: 35.00, porto: 4.95, mgk: 35.4, min1: 0, rate1: 58.90, min2: 0, rate2: 0, pausch: 20.00, gewinn: 8 },
            11: { mek: 62.00, porto: 0, mgk: 35.4, min1: 75, rate1: 58.90, min2: 0, rate2: 0, pausch: 0, gewinn: 9 }
        };
        return originals[taskId] || {};
    }
    
    // Original-Text fuer Vorwaertskalkulationen
    function generateOriginalText(taskId) {
        const texts = {
            3: "Für Material und Ersatzteile entstehen MEK von 65,50 €. Der Gewinn soll 9% betragen, 35 Minuten Arbeitszeit (Werkstatt). Für die Gerätereinigung werden pauschal 6,95 € einkalkuliert.",
            4: "Ein Wecksystem wird für 39,99 € eingekauft. Berechnen Sie den BVP bei einem Gewinn von 18%.",
            6: "BVP für ein Paar Hörgeräte: Einkauf 1.200,00 € + 4,10 € Porto. Gewinn 8%. Audiometrie: 3 Std 45 Min. Anpassung: 8 Std 20 Min.",
            9: "Der Laborpreis für eine fremdgefertigte Otoplastik beläuft sich auf 35,00 € zuzüglich 4,95 € Transportkosten. Für Abformung pauschal 20,00 €. Gewinn 8%. BVP berechnen.",
            11: "Für ein Paar Gehörschutzotoplastiken entstehen im Einkauf Materialkosten von 12,00 €, die Filter kosten 25,00 € pro Stück (= 2×25 = 50 €). Gewinn 9%. 75 Minuten Arbeitszeit. BVP?"
        };
        return texts[taskId] || "";
    }
    
    // Alle verfuegbaren Aufgaben-IDs
    function getAllTaskIds() {
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
    
    // Pruefen ob Aufgabe Zufallszahlen unterstuetzt
    function supportsRandom(taskId) {
        return TASK_TEMPLATES.hasOwnProperty(taskId);
    }
    
    // Public API
    return {
        generate: generate,
        getOriginal: getOriginal,
        calculate: calculateForward,
        getAllTaskIds: getAllTaskIds,
        supportsRandom: supportsRandom,
        round2: round2
    };
    
})();

