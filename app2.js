/**
 * PENICILLIUM SP. VIRTUAL BIOTECH LAB - ENGINE VERSION 2.2
 * Author: Antigravity AI
 * Year: 2026
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // 1. DATA MODELS & SCIENTIFIC CONSTANTS
    // ----------------------------------------------------
    const SPECIES_DATA = {
        chrysogenum: {
            name: "Penicillium sp. Cepa Y-1",
            pigmentName: "Crisogina (Amarillo)",
            colorHex: "#fbbf24", // Gold
            haloColor: "rgba(251, 191, 36, 0.4)",
            myceliumBg: "radial-gradient(circle, #f8fafc 15%, #cbd5e1 45%, #64748b 80%)",
            exudateBg: "#fbbf24",
            peakWavelength: 390,
            secondaryPeak: 275,
            family: "Alcaloides (Derivado Quinazolínico)",
            rf: {
                HexEtOAc: 0.55,
                ChlMeOH: 0.72,
                Agua: 0.0
            }
        },
        purpurogenum: {
            name: "Penicillium sp. Cepa R-5",
            pigmentName: "Purpurogenona (Rojo carmesí)",
            colorHex: "#ef4444", // Crimson Red
            haloColor: "rgba(239, 68, 68, 0.45)",
            myceliumBg: "radial-gradient(circle, #f8fafc 10%, #94a3b8 35%, #334155 70%)",
            exudateBg: "#ef4444",
            peakWavelength: 505,
            secondaryPeak: 280,
            family: "Azafilonas (Policétidos)",
            rf: {
                HexEtOAc: 0.42,
                ChlMeOH: 0.65,
                Agua: 0.0
            }
        },
        strain_orange: {
            name: "Penicillium sp. Cepa GBPI_P155",
            pigmentName: "Mitorubrinol (Naranja)",
            colorHex: "#f97316", // Orange
            haloColor: "rgba(249, 115, 22, 0.4)",
            myceliumBg: "radial-gradient(circle, #fafaf9 15%, #d6d3d1 50%, #78716c 85%)",
            exudateBg: "#f97316",
            peakWavelength: 475,
            secondaryPeak: 270,
            family: "Azafilonas (Mitorubrinas)",
            rf: {
                HexEtOAc: 0.68,
                ChlMeOH: 0.81,
                Agua: 0.0
            }
        }
    };

    const MEDIA_PROFILES = {
        SDA: { name: "Agar Sabouraud (Sólido)", type: "solid", growthCoeff: 1.0, pigmentCoeff: 1.0 },
        YES: { name: "Agar YES (Sólido)", type: "solid", growthCoeff: 0.90, pigmentCoeff: 1.35 },
        PDA: { name: "Agar Papa Dextrosa (Sólido)", type: "solid", growthCoeff: 0.85, pigmentCoeff: 0.80 },
        NA:  { name: "Agar Nutritivo (Sólido)", type: "solid", growthCoeff: 0.25, pigmentCoeff: 0.10 },
        MIN: { name: "Agar Mínimo (Sólido)", type: "solid", growthCoeff: 0.15, pigmentCoeff: 0.10 },
        SDB: { name: "Caldo Sabouraud (Líquido)", type: "liquid", growthCoeff: 0.90, pigmentCoeff: 0.90 },
        NB:  { name: "Caldo Nutritivo (Líquido)", type: "liquid", growthCoeff: 0.20, pigmentCoeff: 0.05 }
    };

    const SOLVENT_EFFICACY = {
        EtOAc: { name: "Acetato de Etilo", coefficient: 0.95, colorLoss: 1.0 },
        MeOH: { name: "Metanol", coefficient: 0.90, colorLoss: 1.0 },
        H2O: { name: "Agua Destilada", coefficient: 0.15, colorLoss: 0.3 },
        Hex: { name: "n-Hexano", coefficient: 0.05, colorLoss: 0.1 }
    };

    // ----------------------------------------------------
    // 2. STATE MANAGER
    // ----------------------------------------------------
    let state = {
        selectedCepa: 'chrysogenum',
        agarMedio: 'SDA',
        mediumType: 'solid',
        temperatura: 25,
        dias: 7,
        
        // Cultivation Yields
        crecimientoMicelial: 0,
        densidadPigmento: 0,
        biomasaCosechada: 0,
        turbidezMedida: 0.0,
        turbidezRealizada: false,
        
        // Extraction
        selectedSolvente: 'EtOAc',
        rendimientoExtraccion: 0,
        extractoColorHex: null,
        
        // TLC
        faseMovilTLC: 'HexEtOAc',
        tlcSiembraRealizada: false,
        tlcCorridaRealizada: false,
        selectedTlcBand: null,
        
        // Spectroscopy
        specBlankCalibrated: false,
        specCuvetteLoaded: false,
        specScanPerformed: false,

        // Microscope
        microZoom: 100, // 100, 400, 1000
        microFocus: 15, // sharp at 50
        selectedMicroSample: 'penicillium_active',
        microLoopId: null,
        
        // Databases
        cuadernoEnsayos: [],
        
        // Questionnaire Responses Database
        cuestionarioRespuestas: {
            1: { texto: '', imagen: '' },
            2: { texto: '', imagen: '' },
            3: { texto: '', imagen: '' },
            4: { texto: '', imagen: '' },
            5: { texto: '', imagen: '' }
        },
        // Temp questionnaire file base64 data holders
        tempQFile: {
            1: '', 2: '', 3: '', 4: '', 5: ''
        }
    };

    // ----------------------------------------------------
    // 3. DOM ELEMENT BINDINGS
    // ----------------------------------------------------
    // Stepper Navigation
    const stepTabs = document.querySelectorAll('.step-tab');
    const panelSections = document.querySelectorAll('.panel-section');

    // Step 1: Cultivo
    const cepaSelect = document.getElementById('cepa-select');
    const tempSlider = document.getElementById('temp-slider');
    const tempVal = document.getElementById('temp-val');
    const diasSlider = document.getElementById('dias-slider');
    const diasVal = document.getElementById('dias-val');
    const btnIncubación = document.getElementById('btn-incubación');
    const btnCosechar = document.getElementById('btn-cosechar');
    const petriAgar = document.getElementById('petri-agar');
    const moldInoculum = document.getElementById('mold-inoculum');
    const pigmentHalo = document.getElementById('pigment-halo');
    
    // Toggles solid vs liquid
    const solidVisualizer = document.getElementById('solid-growth-visualizer');
    const liquidVisualizer = document.getElementById('liquid-growth-visualizer');
    const flaskLiquidLayer = document.getElementById('flask-liquid-layer');
    const pelletsContainer = document.getElementById('mycelium-pellets-container');
    
    // Step 1: Turbidity elements
    const turbidityModuleContainer = document.getElementById('turbidity-module-container');
    const turbidezVal = document.getElementById('turbidez-val');
    const btnMedirTurbidez = document.getElementById('btn-medir-turbidez');
    
    // Step 1: Stats, curve and Console
    const statCrecimiento = document.getElementById('stat-crecimiento');
    const statPigmento = document.getElementById('stat-pigmento');
    const barCrecimiento = document.getElementById('bar-crecimiento');
    const barPigmento = document.getElementById('bar-pigmento');
    const cultivoStatusDot = document.getElementById('cultivo-status-dot');
    const cultivoStatusText = document.getElementById('cultivo-status-text');
    const cultivoConsole = document.getElementById('cultivo-console');

    // Step 2: Extracción
    const extSummaryCepa = document.getElementById('ext-summary-cepa');
    const extSummaryCrecimiento = document.getElementById('ext-summary-crecimiento');
    const extSummaryBiomasa = document.getElementById('ext-summary-biomasa');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const btnProcederTlc = document.getElementById('btn-proceder-tlc');
    const extStatusDot = document.getElementById('ext-status-dot');
    const extStatusText = document.getElementById('ext-status-text');
    const extConsole = document.getElementById('ext-console');
    const vortexShaker = document.getElementById('vortex-shaker');
    const tubeUpperPhase = document.getElementById('tube-upper-phase');
    const tubeLowerPhase = document.getElementById('tube-lower-phase');
    const labelUpper = document.getElementById('label-upper');
    const extValRendimiento = document.getElementById('ext-val-rendimiento');
    const extColorIndicator = document.getElementById('ext-color-indicator');
    const extColorHex = document.getElementById('ext-color-hex');
    const tabExtraccion = document.getElementById('tab-extraccion');

    // Step 3: Cromatografía
    const tlcSummaryExtracto = document.getElementById('tlc-summary-extracto');
    const tlcSummarySolvente = document.getElementById('tlc-summary-solvente');
    const tlcSummaryConcentracion = document.getElementById('tlc-summary-concentracion');
    const btnSembrarTlc = document.getElementById('btn-sembrar-tlc');
    const btnCorrerTlc = document.getElementById('btn-correr-tlc');
    const btnProcederEspectro = document.getElementById('btn-proceder-espectro');
    const tlcStatusDot = document.getElementById('tlc-status-dot');
    const tlcStatusText = document.getElementById('tlc-status-text');
    const tlcConsole = document.getElementById('tlc-console');
    const solFront = document.getElementById('sol-front');
    const tlcSpotInitial = document.getElementById('tlc-spot-initial');
    const tlcPlateDiv = document.getElementById('tlc-plate-div');
    const chamberPool = document.getElementById('chamber-pool');
    
    // Step 3: Bands & calculations
    const bandYellow = document.getElementById('band-yellow');
    const bandOrange = document.getElementById('band-orange');
    const bandRed = document.getElementById('band-red');
    const rfActiveBand = document.getElementById('rf-active-band');
    const rfSolutoDist = document.getElementById('rf-soluto-dist');
    const rfFinalVal = document.getElementById('rf-final-val');
    const tabCromatografia = document.getElementById('tab-cromatografia');

    // Step 4: Espectroscopía
    const specSummaryPigmento = document.getElementById('spec-summary-pigmento');
    const specSummarySolvente = document.getElementById('spec-summary-solvente');
    const specSummaryPureza = document.getElementById('spec-summary-pureza');
    const btnSpecBlanco = document.getElementById('btn-spec-blanco');
    const btnSpecMuestra = document.getElementById('btn-spec-muestra');
    const btnSpecScan = document.getElementById('btn-spec-scan');
    const btnProcederMicroscopio = document.getElementById('btn-proceder-microscopio');
    const specStatusDot = document.getElementById('spec-status-dot');
    const specStatusText = document.getElementById('spec-status-text');
    const specConsole = document.getElementById('spec-console');
    const cuvetteLiquid = document.getElementById('cuvette-liquid');
    const cuvetteInner = document.getElementById('cuvette-inner');
    const laserBeamIndicator = document.getElementById('laser-beam-indicator');
    const laserBeamAttenuated = document.getElementById('laser-beam-attenuated');
    const specResWavelength = document.getElementById('spec-res-wavelength');
    const specResAbsorbance = document.getElementById('spec-res-absorbance');
    const specResFamily = document.getElementById('spec-res-family');
    const specResultsBox = document.getElementById('spec-results-box');
    const tabEspectroscopia = document.getElementById('tab-espectroscopia');

    // Step 5: Microscopía
    const zoomButtons = document.querySelectorAll('.zoom-btn');
    const microSampleSelect = document.getElementById('micro-sample-select');
    const focusSlider = document.getElementById('focus-slider');
    const focusVal = document.getElementById('focus-val');
    const microGuideText = document.getElementById('microscope-guide-text');
    const ocularViewElement = document.getElementById('ocular-view-element');
    const focusAlert = document.getElementById('focus-alert');
    const btnProcederBitacora = document.getElementById('btn-proceder-bitacora');
    const microUploadZone = document.getElementById('micro-upload-zone');
    const microUploadInput = document.getElementById('micro-upload-input');
    const tabMicroscopia = document.getElementById('tab-microscopia');

    // Step 6: Bitácora & Cuestionario
    const tableLogsBody = document.getElementById('table-logs-body');
    const btnBorrarBitacora = document.getElementById('btn-borrar-bitacora');
    const uploadZone = document.getElementById('upload-zone');
    const imageUploadInput = document.getElementById('image-upload-input');
    const galleryGrid = document.getElementById('gallery-grid');
    
    // Contaminations DOM
    const contamUploadZone = document.getElementById('contam-upload-zone');
    const contamUploadInput = document.getElementById('contam-upload-input');
    const contamGalleryGrid = document.getElementById('contam-gallery-grid');

    // ----------------------------------------------------
    // 4. STEPPER NAVIGATION LOCKS
    // ----------------------------------------------------
    stepTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            
            // Lock logic
            if (targetId === 'panel-extraccion' && state.biomasaCosechada === 0) {
                alert("🔒 Primero debes cultivar tu Penicillium sp. (Paso 1).");
                return;
            }
            if (targetId === 'panel-cromatografia' && state.rendimientoExtraccion === 0) {
                alert("🔒 Primero debes extraer tus pigmentos fúngicos (Paso 2).");
                return;
            }
            if (targetId === 'panel-espectroscopia' && !state.tlcCorridaRealizada) {
                alert("🔒 Primero debes purificar tus pigmentos en placa TLC (Paso 3).");
                return;
            }
            if (targetId === 'panel-microscopia' && state.crecimientoMicelial === 0) {
                alert("🔒 Primero debes iniciar el cultivo biológico para tener muestras micro (Paso 1).");
                return;
            }

            // Switch tabs
            stepTabs.forEach(t => t.classList.remove('active'));
            panelSections.forEach(panel => panel.classList.remove('active'));

            tab.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                
                // Triggers
                if (targetId === 'panel-bitacora') {
                    initGalleryCanvases();
                    renderQuestionnaire(); // Refresh questionnaire inputs from local storage
                }
                if (targetId === 'panel-espectroscopia' && state.specScanPerformed) {
                    drawSpectroscopyChart();
                }
                if (targetId === 'panel-microscopia') {
                    startMicroscopeLoop();
                } else {
                    stopMicroscopeLoop();
                }
            }
        });
    });

    // ----------------------------------------------------
    // 5. CULTIVATION MODULE (STEP 1) WITH GROWTH KINETICS
    // ----------------------------------------------------
    // Listen for medium choices to toggle solid agar vs liquid broth
    const bindMediumToggleListeners = () => {
        const agarRadios = document.querySelectorAll('input[name="agar-medio"]');
        agarRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const med = e.target.value;
                state.agarMedio = med;
                state.mediumType = MEDIA_PROFILES[med].type;

                // Hide turbidity on solid, show when liquid
                if (state.mediumType === 'liquid') {
                    solidVisualizer.style.display = "none";
                    liquidVisualizer.style.display = "flex";
                } else {
                    solidVisualizer.style.display = "flex";
                    liquidVisualizer.style.display = "none";
                    turbidityModuleContainer.style.display = "none";
                }
                
                // Reset turbidity states
                state.turbidezMedida = 0.0;
                state.turbidezRealizada = false;
                turbidezVal.innerText = "0.000 OD";
                
                // Redraw empty curve chart with baseline values
                drawGrowthCurveChart();
            });
        });
    };

    tempSlider.addEventListener('input', (e) => {
        tempVal.innerText = `${e.target.value} °C`;
    });

    diasSlider.addEventListener('input', (e) => {
        diasVal.innerText = `${e.target.value} días`;
    });

    btnIncubación.addEventListener('click', () => {
        state.selectedCepa = cepaSelect.value;
        state.temperatura = parseInt(tempSlider.value);
        state.dias = parseInt(diasSlider.value);
        
        const agarRadio = document.querySelector('input[name="agar-medio"]:checked');
        state.agarMedio = agarRadio ? agarRadio.value : 'SDA';
        state.mediumType = MEDIA_PROFILES[state.agarMedio].type;

        // 1. Biological Calculations (Ratkowsky + Nutritional constraints)
        let tempFactor = 0;
        const T = state.temperatura;
        if (T > 5 && T < 37) {
            tempFactor = Math.sin((T - 5) / (32) * Math.PI); 
        } else {
            tempFactor = 0; // thermal death or inactivity
        }

        const medProfile = MEDIA_PROFILES[state.agarMedio];
        const maxTime = state.dias;
        
        // Sigmoidal Logistic growth equation
        const k = 0.85 * tempFactor * medProfile.growthCoeff;
        const t0 = 3.5; // midpoint day
        const Bmax = 100 * tempFactor * medProfile.growthCoeff;
        
        let finalGrowth = 0;
        let finalPigment = 0;

        if (T > 5 && T < 37) {
            const lagFactor = 1 / (1 + Math.exp(-k * (maxTime - t0)));
            finalGrowth = Bmax * lagFactor;
            
            if (maxTime > 8) {
                const autolysisCoeff = 1.0 - (maxTime - 8) * 0.15;
                finalGrowth = finalGrowth * autolysisCoeff;
            }
            
            const pigmentLag = 1 / (1 + Math.exp(-k * (maxTime - (t0 + 1))));
            finalPigment = 95 * tempFactor * medProfile.pigmentCoeff * pigmentLag;
        }

        state.crecimientoMicelial = Math.round(Math.min(Math.max(finalGrowth, 0), 100));
        state.densidadPigmento = Math.round(Math.min(Math.max(finalPigment, 0), 100));
        
        const scaleGrams = state.mediumType === 'liquid' ? 6.5 : 4.5;
        state.biomasaCosechada = parseFloat(((state.crecimientoMicelial / 100) * scaleGrams).toFixed(2));

        // 2. Lock UI controls
        btnIncubación.disabled = true;
        cepaSelect.disabled = true;
        tempSlider.disabled = true;
        diasSlider.disabled = true;
        document.querySelectorAll('input[name="agar-medio"]').forEach(el => el.disabled = true);
        
        cultivoStatusDot.className = "pulse-dot yellow";
        cultivoStatusText.innerText = "Incubando...";
        
        const phaseName = state.mediumType === 'liquid' ? 'Fase líquida en agitación' : 'Placa sólida estéril';
        cultivoConsole.innerText = `[INCUBADOR]: Calentando cámara a ${state.temperatura}°C. Medio inoculado con inóculo de ${SPECIES_DATA[state.selectedCepa].name} (${phaseName})...`;

        // Solid petriagar layer coloring
        if (state.mediumType === 'solid') {
            let agarColor = "radial-gradient(circle, #eab308 0%, #ca8a04 100%)";
            if (state.agarMedio === 'YES') {
                agarColor = "radial-gradient(circle, #fef08a 0%, #ca8a04 100%)";
            } else if (state.agarMedio === 'PDA') {
                agarColor = "radial-gradient(circle, #fcd34d 0%, #b45309 100%)";
            } else if (state.agarMedio === 'NA') {
                agarColor = "radial-gradient(circle, #cbd5e1 0%, #94a3b8 100%)";
            } else if (state.agarMedio === 'MIN') {
                agarColor = "radial-gradient(circle, #fafaf9 0%, #cbd5e1 100%)";
            }
            petriAgar.style.background = agarColor;
        } else {
            // Liquid broth color
            flaskLiquidLayer.style.height = "20%";
            flaskLiquidLayer.style.background = "rgba(251, 191, 36, 0.15)";
            pelletsContainer.innerHTML = '';
        }

        // Animate Growth & Halos over a 2.5 second virtual incubation period
        const maxColonySize = (state.crecimientoMicelial / 100) * 165;
        const maxHaloSize = (state.densidadPigmento / 100) * 215;

        // 3. Animate Growth Curve point by point and dynamic visualizers
        drawGrowthCurveChart(true, k, t0, Bmax);

        setTimeout(() => {
            cultivoConsole.innerText += `\n[FISIOLOGÍA]: Esporas germinando. Germinación y elongación de hifas activada.`;
            
            if (state.mediumType === 'solid') {
                moldInoculum.style.width = `${maxColonySize}px`;
                moldInoculum.style.height = `${maxColonySize}px`;
                moldInoculum.style.background = SPECIES_DATA[state.selectedCepa].myceliumBg;

                if (state.densidadPigmento > 5) {
                    pigmentHalo.style.width = `${maxHaloSize}px`;
                    pigmentHalo.style.height = `${maxHaloSize}px`;
                    pigmentHalo.style.background = SPECIES_DATA[state.selectedCepa].haloColor;
                }
            } else {
                flaskLiquidLayer.style.height = `${30 + (state.crecimientoMicelial / 100) * 15}%`;
                
                if (state.densidadPigmento > 5) {
                    const tintColor = hexToRGBA(SPECIES_DATA[state.selectedCepa].colorHex, (state.densidadPigmento / 100) * 0.45);
                    flaskLiquidLayer.style.background = tintColor;
                }

                const pelletCount = Math.round((state.crecimientoMicelial / 100) * 12);
                spawnFlaskPellets(pelletCount, SPECIES_DATA[state.selectedCepa].colorHex);
            }
        }, 300);

        setTimeout(() => {
            // Update stats
            statCrecimiento.innerText = `${state.crecimientoMicelial}%`;
            barCrecimiento.style.width = `${state.crecimientoMicelial}%`;
            statPigmento.innerText = `${state.densidadPigmento}%`;
            barPigmento.style.width = `${state.densidadPigmento}%`;

            if (state.crecimientoMicelial === 0) {
                cultivoStatusDot.className = "pulse-dot red";
                cultivoStatusText.innerText = "Inhibido";
                cultivoConsole.innerText += `\n[ADVERTENCIA]: El estrés térmico o la carencia nutricional detuvieron el crecimiento celular (Biomasa viable = 0g).`;
            } else {
                cultivoStatusDot.className = "pulse-dot green";
                cultivoStatusText.innerText = "Crecimiento Exitoso";
                cultivoConsole.innerText += `\n[SISTEMA]: Ciclo de ${state.dias} días finalizado. Cosecha: ${state.biomasaCosechada} g.`;
                
                // Show turbidity analyzer if liquid medium SDB/NB
                if (state.mediumType === 'liquid') {
                    turbidityModuleContainer.style.display = "block";
                    btnMedirTurbidez.disabled = false;
                } else {
                    btnCosechar.disabled = false;
                }
            }
        }, 2500);
    });

    const spawnFlaskPellets = (count, color) => {
        pelletsContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const pellet = document.createElement('div');
            pellet.className = "pellet-spore";
            
            const size = 5 + Math.random() * 8;
            pellet.style.width = `${size}px`;
            pellet.style.height = `${size}px`;
            pellet.style.background = `radial-gradient(circle, #cbd5e1 30%, ${color} 90%)`;
            pellet.style.left = `${10 + Math.random() * 80}%`;
            pellet.style.bottom = `${10 + Math.random() * 70}%`;
            pellet.style.animationDelay = `${Math.random() * 2}s`;
            pellet.style.animationDuration = `${2.5 + Math.random() * 2}s`;
            
            pelletsContainer.appendChild(pellet);
        }
    };

    // Turbidity measurement logic SDB/NB
    btnMedirTurbidez.addEventListener('click', () => {
        btnMedirTurbidez.disabled = true;
        cultivoStatusText.innerText = "Midiendo Turbidez...";
        
        setTimeout(() => {
            let odVal = 0.0;
            const growthRatio = state.crecimientoMicelial / 100.0;
            
            if (state.agarMedio === 'SDB') {
                odVal = growthRatio * (1.35 + Math.random() * 0.25);
            } else if (state.agarMedio === 'NB') {
                odVal = growthRatio * (0.16 + Math.random() * 0.08);
            }
            
            state.turbidezMedida = parseFloat(odVal.toFixed(3));
            state.turbidezRealizada = true;
            
            turbidezVal.innerText = `${state.turbidezMedida.toFixed(3)} OD`;
            
            cultivoStatusDot.className = "pulse-dot green";
            cultivoStatusText.innerText = "Turbidez Registrada";
            
            cultivoConsole.innerText += `\n[ESPECTROFOTÓMETRO 600nm]: Lectura óptica de densidad celular = ${state.turbidezMedida.toFixed(3)} OD. `;
            
            if (state.agarMedio === 'SDB') {
                cultivoConsole.innerText += `Indica una alta concentración y dispersión de biomasa de Penicillium suspendida en forma de pellets fúngicos densos e higroscópicos.`;
            } else {
                cultivoConsole.innerText += `Indica crecimiento fúngico crítico o nulo debido al desajuste nutricional proteico y pH del Caldo Nutritivo estándar.`;
            }
            
            btnCosechar.disabled = false;
        }, 1200);
    });

    btnCosechar.addEventListener('click', () => {
        extSummaryCepa.innerText = SPECIES_DATA[state.selectedCepa].name;
        
        let mediumInfo = MEDIA_PROFILES[state.agarMedio].name;
        if (state.turbidezRealizada) {
            mediumInfo += ` (Turbidez: ${state.turbidezMedida.toFixed(3)} OD)`;
        }
        extSummaryCrecimiento.innerText = `Biomasa: ${state.crecimientoMicelial}%, ${mediumInfo}`;
        extSummaryBiomasa.innerText = `${state.biomasaCosechada} g`;
        
        tabExtraccion.classList.add('unlocked');
        tabMicroscopia.classList.add('unlocked');
        document.getElementById('tab-extraccion').click();
    });

    // ----------------------------------------------------
    // Growth kinetics curves solver (Petri dish canvas plot)
    // ----------------------------------------------------
    const drawGrowthCurveChart = (animate = false, k = 0.5, t0 = 3.5, Bmax = 90) => {
        const canvas = document.getElementById('canvas-curva-crecimiento');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const w = rect.width;
        const h = rect.height;

        ctx.clearRect(0,0,w,h);

        const padLeft = 30;
        const padRight = 10;
        const padTop = 10;
        const padBottom = 20;

        const cw = w - padLeft - padRight;
        const ch = h - padTop - padBottom;

        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        
        for (let day = 0; day <= 10; day += 2) {
            const x = padLeft + (day / 10) * cw;
            ctx.beginPath();
            ctx.moveTo(x, padTop);
            ctx.lineTo(x, padTop + ch);
            ctx.stroke();

            ctx.fillStyle = "#64748b";
            ctx.font = "8px 'JetBrains Mono', monospace";
            ctx.textAlign = "center";
            ctx.fillText(`${day}d`, x, padTop + ch + 10);
        }

        const ticks = [0, 50, 100];
        ticks.forEach(pct => {
            const y = padTop + ch - (pct / 100) * ch;
            ctx.beginPath();
            ctx.moveTo(padLeft, y);
            ctx.lineTo(padLeft + cw, y);
            ctx.stroke();

            ctx.fillStyle = "#64748b";
            ctx.font = "8px 'JetBrains Mono', monospace";
            ctx.textAlign = "right";
            ctx.fillText(pct, padLeft - 6, y + 3);
        });

        const getBiomass = (t) => {
            if (Bmax < 5) return 0;
            let B = Bmax / (1 + Math.exp(-k * (t - t0)));
            if (t > 8) {
                const autolysis = 1.0 - (t - 8) * 0.15;
                B = B * autolysis;
            }
            return Math.min(Math.max(B, 0), 100);
        };

        const points = [];
        for (let t = 0; t <= 10; t += 0.1) {
            const x = padLeft + (t / 10) * cw;
            const B = getBiomass(t);
            const y = padTop + ch - (B / 100) * ch;
            points.push({ x, y, t, B });
        }

        if (animate) {
            let limit = 0;
            const animInterval = setInterval(() => {
                if (limit < points.length) {
                    const slice = points.slice(0, limit + 1);
                    
                    ctx.clearRect(padLeft, padTop, cw, ch);
                    
                    ctx.strokeStyle = "rgba(255,255,255,0.04)";
                    for (let day = 0; day <= 10; day += 2) {
                        const x = padLeft + (day / 10) * cw;
                        ctx.beginPath();
                        ctx.moveTo(x, padTop);
                        ctx.lineTo(x, padTop + ch);
                        ctx.stroke();
                    }
                    ticks.forEach(pct => {
                        const y = padTop + ch - (pct / 100) * ch;
                        ctx.beginPath();
                        ctx.moveTo(padLeft, y);
                        ctx.lineTo(padLeft + cw, y);
                        ctx.stroke();
                    });

                    ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
                    ctx.lineWidth = 2;
                    ctx.shadowColor = "rgba(16, 185, 129, 0.3)";
                    ctx.shadowBlur = 4;
                    ctx.beginPath();
                    ctx.moveTo(slice[0].x, slice[0].y);
                    for (let i = 1; i < slice.length; i++) {
                        ctx.lineTo(slice[i].x, slice[i].y);
                    }
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    const head = slice[slice.length - 1];
                    ctx.fillStyle = "#10b981";
                    ctx.beginPath();
                    ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
                    ctx.fill();

                    // Console updates during growth animation
                    let odString = "";
                    if (state.mediumType === 'liquid') {
                        // calculate real-time OD curve display in console
                        const currentOd = (head.B / 100) * (state.agarMedio === 'SDB' ? 1.45 : 0.20);
                        odString = ` | Turbidez OD: ${currentOd.toFixed(3)}`;
                    }
                    cultivoConsole.innerText = `[INCUBADOR]: Día virtual ${head.t.toFixed(1)} de 10. Biomasa medida: ${head.B.toFixed(1)}%${odString}.`;

                    limit += 1;
                } else {
                    clearInterval(animInterval);
                    ctx.fillStyle = "rgba(255,255,255,0.25)";
                    ctx.font = "italic 7px 'Outfit', sans-serif";
                    ctx.fillText("Lag", padLeft + 0.1 * cw, padTop + ch - 8);
                    ctx.fillText("Log (Exp)", padLeft + 0.35 * cw, padTop + ch / 2);
                    ctx.fillText("Estac.", padLeft + 0.65 * cw, padTop + 14);
                    if (state.dias > 8) {
                        ctx.fillText("Muerte", padLeft + 0.88 * cw, padTop + ch - 12);
                    }
                }
            }, 25);
        } else {
            ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();
        }
    };

    // ----------------------------------------------------
    // 6. EXTRACTION PROTOCOL (STEP 2)
    // ----------------------------------------------------
    btnFiltrar.addEventListener('click', () => {
        const solventRadio = document.querySelector('input[name="solvente-select"]:checked');
        state.selectedSolvente = solventRadio ? solventRadio.value : 'EtOAc';

        vortexShaker.classList.add('vortex-shaking');
        btnFiltrar.disabled = true;
        document.querySelectorAll('input[name="solvente-select"]').forEach(el => el.disabled = true);
        
        extStatusDot.className = "pulse-dot yellow";
        extStatusText.innerText = "Mezclando solventes...";
        extConsole.innerText = `[EXTRACTOR]: Licuando micelio septado. Adicionando solvente extractor: ${SOLVENT_EFFICACY[state.selectedSolvente].name}...`;

        setTimeout(() => {
            extConsole.innerText += `\n[CENTRIFUGA]: Agitando a 4000 rpm durante 10 minutos. Separando pellets residuales...`;
        }, 1000);

        setTimeout(() => {
            vortexShaker.classList.remove('vortex-shaking');
            
            const solData = SOLVENT_EFFICACY[state.selectedSolvente];
            const rawYield = (state.densidadPigmento / 100) * solData.coefficient * 100;
            state.rendimientoExtraccion = parseFloat(rawYield.toFixed(2));

            let solventColor = "rgba(255, 255, 255, 0.05)";
            let finalColorHex = "#Ninguno";
            
            if (state.rendimientoExtraccion > 5) {
                const pigmentHex = SPECIES_DATA[state.selectedCepa].colorHex;
                finalColorHex = pigmentHex;
                const transparency = (state.rendimientoExtraccion / 100) * solData.colorLoss;
                solventColor = hexToRGBA(pigmentHex, Math.max(transparency, 0.15));
            }
            
            state.extractoColorHex = finalColorHex;

            tubeUpperPhase.style.height = "50%";
            tubeUpperPhase.style.background = solventColor;
            labelUpper.innerText = `Fase Orgánica: ${state.selectedSolvente}`;
            labelUpper.style.color = "#ffffff";
            
            tubeLowerPhase.style.height = "25%";
            tubeLowerPhase.style.background = "#334155";

            extValRendimiento.innerText = `${state.rendimientoExtraccion} %`;
            extColorIndicator.style.background = finalColorHex === "#Ninguno" ? "transparent" : finalColorHex;
            extColorHex.innerText = finalColorHex;

            extStatusDot.className = "pulse-dot green";
            extStatusText.innerText = "Extracción finalizada";
            extConsole.innerText += `\n[ANALIZADOR]: Rendimiento del extracto orgánico: ${state.rendimientoExtraccion}%.`;
            
            if (state.selectedSolvente === 'H2O' || state.selectedSolvente === 'Hex') {
                extConsole.innerText += `\n[FISICOQUÍMICA]: Se observa muy baja extracción por desajuste de polaridad molar (${solData.name}). Las azafilonas son hidrófobas.`;
            } else {
                extConsole.innerText += `\n[FISICOQUÍMICA]: Extracción óptima mella de enlaces. Pigmento recuperado solubilizado en fase líquida superior.`;
            }

            btnProcederTlc.disabled = false;
        }, 2500);
    });

    btnProcederTlc.addEventListener('click', () => {
        tlcSummaryExtracto.innerText = SPECIES_DATA[state.selectedCepa].pigmentName;
        tlcSummarySolvente.innerText = SOLVENT_EFFICACY[state.selectedSolvente].name;
        
        const conc = (state.rendimientoExtraccion / 100) * 1.5;
        tlcSummaryConcentracion.innerText = `${conc.toFixed(2)} mg/mL`;

        tabCromatografia.classList.add('unlocked');
        document.getElementById('tab-cromatografia').click();
    });

    // ----------------------------------------------------
    // 7. CHROMATOGRAPHY (TLC) WITH CORRECT R_F SUB notation
    // ----------------------------------------------------
    btnSembrarTlc.addEventListener('click', () => {
        state.tlcSiembraRealizada = true;
        tlcSpotInitial.style.display = "block";
        
        const spotColor = state.extractoColorHex === "#Ninguno" ? "#94a3b8" : state.extractoColorHex;
        tlcSpotInitial.style.background = spotColor;
        
        btnSembrarTlc.disabled = true;
        btnCorrerTlc.disabled = false;
        
        tlcStatusDot.className = "pulse-dot yellow";
        tlcStatusText.innerText = "Muestra sembrada";
        tlcConsole.innerText = `[TLC]: Muestra depositada en la línea de origen mediante capilar de cuarzo. Solvente evaporado. Colocar placa en cámara de corrida...`;
    });

    btnCorrerTlc.addEventListener('click', () => {
        const fmRadio = document.querySelector('input[name="fase-movil"]:checked');
        state.faseMovilTLC = fmRadio ? fmRadio.value : 'HexEtOAc';

        btnCorrerTlc.disabled = true;
        document.querySelectorAll('input[name="fase-movil"]').forEach(el => el.disabled = true);

        tlcStatusDot.className = "pulse-dot cyan";
        tlcStatusText.innerText = "Elución en curso...";
        tlcConsole.innerText = `[TLC]: Placa sumergida. Fase móvil eluyendo hacia arriba por capilaridad...`;

        chamberPool.style.height = "24px";
        solFront.style.display = "block";
        let heightPercent = 12; 
        const maxFrontPercent = 88; 
        
        const cepa = state.selectedCepa;
        const fm = state.faseMovilTLC;
        const targetRf = SPECIES_DATA[cepa].rf[fm];

        const runTlcAnimation = () => {
            if (heightPercent < maxFrontPercent) {
                heightPercent += 0.8;
                solFront.style.bottom = `${heightPercent}%`;
                
                if (targetRf > 0.05 && state.rendimientoExtraccion > 5) {
                    const currentRfHeight = 12 + (heightPercent - 12) * targetRf;
                    
                    if (cepa === 'chrysogenum') {
                        bandYellow.style.display = "block";
                        bandYellow.style.bottom = `${currentRfHeight}%`;
                    } else if (cepa === 'purpurogenum') {
                        bandRed.style.display = "block";
                        bandRed.style.bottom = `${currentRfHeight}%`;
                        
                        if (heightPercent > 35) {
                            bandYellow.style.display = "block";
                            bandYellow.style.bottom = `${12 + (heightPercent - 12) * (targetRf * 1.25)}%`;
                        }
                    } else if (cepa === 'strain_orange') {
                        bandOrange.style.display = "block";
                        bandOrange.style.bottom = `${currentRfHeight}%`;
                        
                        if (heightPercent > 40) {
                            bandYellow.style.display = "block";
                            bandYellow.style.bottom = `${12 + (heightPercent - 12) * (targetRf * 1.15)}%`;
                        }
                    }
                }
                
                requestAnimationFrame(runTlcAnimation);
            } else {
                state.tlcCorridaRealizada = true;
                tlcStatusDot.className = "pulse-dot green";
                tlcStatusText.innerText = "Corrida finalizada";
                tlcConsole.innerText += `\n[TLC]: Frente del solvente completado a 8.00 cm. Retirar placa y revelar.`;
                
                if (targetRf > 0.05 && state.rendimientoExtraccion > 5) {
                    tlcSpotInitial.style.opacity = "0.2";
                }

                btnProcederEspectro.disabled = false;
                
                if (cepa === 'chrysogenum') {
                    selectTlcBand(bandYellow, "Banda Amarilla (Crisogina)", targetRf);
                } else if (cepa === 'purpurogenum') {
                    selectTlcBand(bandRed, "Banda Roja Principal (Purpurogenona)", targetRf);
                } else {
                    selectTlcBand(bandOrange, "Banda Naranja Principal (Mitorubrina)", targetRf);
                }
            }
        };

        setTimeout(runTlcAnimation, 500);
    });

    const selectTlcBand = (bandElement, name, rf) => {
        document.querySelectorAll('.tlc-spot-band').forEach(el => el.classList.remove('selected'));
        
        state.selectedTlcBand = name;
        bandElement.classList.add('selected');

        const solFrontDist = 8.00; 
        const solutoDist = solFrontDist * rf;

        rfActiveBand.innerHTML = name;
        rfSolutoDist.innerText = `${solutoDist.toFixed(2)} cm`;
        rfFinalVal.innerText = rf.toFixed(2);
        
        tlcConsole.innerHTML = `[TLC CALCULADOR]: Banda seleccionada: "${name}". Distancia recorrida: ${solutoDist.toFixed(2)} cm. Factor R<sub>f</sub> = ${rf.toFixed(2)}.`;
    };

    bandYellow.addEventListener('click', () => {
        const rf = SPECIES_DATA[state.selectedCepa].rf[state.faseMovilTLC];
        const adjustedRf = state.selectedCepa === 'chrysogenum' ? rf : rf * 1.25;
        selectTlcBand(bandYellow, "Banda Amarilla (Crisogina)", Math.min(adjustedRf, 0.98));
    });
    bandOrange.addEventListener('click', () => {
        const rf = SPECIES_DATA[state.selectedCepa].rf[state.faseMovilTLC];
        selectTlcBand(bandOrange, "Banda Naranja (Mitorubrinol)", rf);
    });
    bandRed.addEventListener('click', () => {
        const rf = SPECIES_DATA[state.selectedCepa].rf[state.faseMovilTLC];
        selectTlcBand(bandRed, "Banda Roja (Purpurogenona R)", rf);
    });

    btnProcederEspectro.addEventListener('click', () => {
        specSummaryPigmento.innerText = state.selectedTlcBand || "Extracto Purificado de Penicillium";
        specSummarySolvente.innerText = SOLVENT_EFFICACY[state.selectedSolvente].name;
        
        let purity = 95;
        if (state.faseMovilTLC === 'Agua') {
            purity = 20;
        } else if (state.faseMovilTLC === 'ChlMeOH') {
            purity = 75;
        }
        specSummaryPureza.innerText = `${purity}% (Fase TLC: ${state.faseMovilTLC})`;

        tabEspectroscopia.classList.add('unlocked');
        document.getElementById('tab-espectroscopia').click();
    });

    // ----------------------------------------------------
    // 8. SPECTROSCOPY (STEP 4)
    // ----------------------------------------------------
    btnSpecBlanco.addEventListener('click', () => {
        state.specBlankCalibrated = true;
        btnSpecBlanco.disabled = true;
        btnSpecMuestra.disabled = false;
        
        specStatusDot.className = "pulse-dot yellow";
        specStatusText.innerText = "Calibrado Blanco";
        specConsole.innerText = `[ESPECTRÓMETRO]: Blanco de disolvente calibrado. Transmitancia fijada a 100.0%. Coloca la muestra de Penicillium.`;
    });

    btnSpecMuestra.addEventListener('click', () => {
        state.specCuvetteLoaded = true;
        btnSpecMuestra.disabled = true;
        btnSpecScan.disabled = false;

        cuvetteInner.style.display = "flex";
        
        const specColor = state.extractoColorHex === "#Ninguno" ? "transparent" : state.extractoColorHex;
        cuvetteLiquid.style.background = hexToRGBA(specColor, 0.7);

        specStatusDot.className = "pulse-dot purple";
        specStatusText.innerText = "Muestra Cargada";
        specConsole.innerText = `[ESPECTRÓMETRO]: Cubeta de cuarzo de 1 cm insertada en el paso óptico. Iniciar escaneo espectral visible.`;
    });

    btnSpecScan.addEventListener('click', () => {
        btnSpecScan.disabled = true;
        
        specStatusDot.className = "pulse-dot cyan";
        specStatusText.innerText = "Escaneando...";

        laserBeamIndicator.classList.add('sweeping');
        laserBeamAttenuated.classList.add('sweeping');

        state.specScanPerformed = true;
        drawSpectroscopyChart(true); 
    });

    btnProcederMicroscopio.addEventListener('click', () => {
        tabMicroscopia.classList.add('unlocked');
        document.getElementById('tab-microscopia').click();
    });

    // ----------------------------------------------------
    // 9. VIRTUAL MICROSCOPE SIMULATOR (STEP 5)
    // ----------------------------------------------------
    zoomButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            zoomButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.microZoom = parseInt(btn.getAttribute('data-zoom'));
            updateMicroscopeOcularDrawing();
        });
    });

    microSampleSelect.addEventListener('change', (e) => {
        state.selectedMicroSample = e.target.value;
        
        if (state.selectedMicroSample === 'penicillium_active') {
            microGuideText.innerHTML = `<strong>Observación: Penicillium sp.</strong><br>Hifas vegetativas tabicadas (septadas). Se aprecian cabezas conidiógenas en forma de cepillo o escobilla (penicilo) con fiálides y cadenas de esporas circulares.`;
        } else if (state.selectedMicroSample === 'contam_aspergillus') {
            microGuideText.innerHTML = `<strong>Observación: Aspergillus sp. (Contaminante)</strong><br>Conidióforo cilíndrico simple no ramificado que termina en una gran vesícula globosa (cabeza conidial radial) cubierta completamente de fiálides y esporas.`;
        } else if (state.selectedMicroSample === 'contam_rhizopus') {
            microGuideText.innerHTML = `<strong>Observación: Rhizopus sp. (Contaminante)</strong><br>Hifas no septadas (cenocíticas) anchas. Esporangióforos marrones largos sostenidos por rizoides basales, rematados por esporangios esféricos oscuros.`;
        } else {
            microGuideText.innerHTML = `<strong>Observación: Contaminación Bacteriana</strong><br>Numerosos microorganismos unicelulares (bacilos cortos y cocos pequeños) dispersos y vibrando intensamente debido al choque térmico molecular (movimiento browniano).`;
        }

        updateMicroscopeOcularDrawing();
    });

    focusSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.microFocus = val;
        focusVal.innerText = `${val}%`;

        const blurAmt = Math.abs(val - 50) / 4.0; 
        
        ocularViewElement.style.filter = `blur(${blurAmt}px)`;

        if (blurAmt > 1.3) {
            focusAlert.style.display = "block";
        } else {
            focusAlert.style.display = "none";
        }
    });

    btnProcederBitacora.addEventListener('click', () => {
        // Automatically save simulation run to log table upon completion of loop
        const cepaName = SPECIES_DATA[state.selectedCepa].name;
        const medName = MEDIA_PROFILES[state.agarMedio].name + (state.turbidezRealizada ? ` (${state.turbidezMedida.toFixed(3)} OD)` : "");
        const solventName = SOLVENT_EFFICACY[state.selectedSolvente].name;
        const rfString = state.selectedTlcBand ? `R<sub>f</sub> = ${rfFinalVal.innerText}` : "N/A";
        const peakString = state.specScanPerformed ? `${specResWavelength.innerText}` : "N/A";
        
        const timestamp = new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'}) + " " + new Date().toLocaleDateString('es-ES');
        
        state.cuadernoEnsayos.push({
            timestamp,
            cepa: cepaName,
            medio: medName,
            solvente: solventName,
            rf: rfString,
            peak: peakString
        });
        
        saveLogsToLocalStorage();
        renderLogTable();
        
        document.querySelector('[data-target="panel-bitacora"]').click();
    });

    // Virtual Microscope render engine on Canvas 2D
    const updateMicroscopeOcularDrawing = () => {
        const canvas = document.getElementById('canvas-microscopio');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const w = rect.width;
        const h = rect.height;

        ctx.clearRect(0, 0, w, h);

        const sample = state.selectedMicroSample;
        let baseTint = "#0f172a";
        let innerGlow = "#1e3a8a"; 
        
        if (sample === 'contam_bacterias') {
            baseTint = "#111827";
            innerGlow = "#2e1065"; 
        }

        const lensGrad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, 120);
        lensGrad.addColorStop(0, innerGlow);
        lensGrad.addColorStop(1, baseTint);
        ctx.fillStyle = lensGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.lineCap = "round";
        
        if (sample === 'penicillium_active') {
            ctx.strokeStyle = "#38bdf8"; 
            
            if (state.microZoom === 100) {
                ctx.lineWidth = 1.5;
                for (let i = 0; i < 18; i++) {
                    ctx.beginPath();
                    ctx.moveTo(Math.random() * w, 0);
                    ctx.bezierCurveTo(Math.random() * w, h*0.3, Math.random() * w, h*0.7, Math.random() * w, h);
                    ctx.stroke();
                }
                ctx.fillStyle = "#e0f2fe";
                for (let i = 0; i < 25; i++) {
                    ctx.beginPath();
                    ctx.arc(40 + Math.random() * (w - 80), 40 + Math.random() * (h - 80), 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (state.microZoom === 400) {
                ctx.lineWidth = 3;
                drawConidiophoreBrush(ctx, w/2 - 40, h, h - 80, 0.95);
                drawConidiophoreBrush(ctx, w/2 + 35, h, h - 100, 0.85);

                ctx.lineWidth = 1;
                ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
                ctx.beginPath();
                ctx.moveTo(0, h * 0.7); ctx.lineTo(w, h * 0.85);
                ctx.moveTo(w * 0.2, h); ctx.lineTo(w * 0.8, 0);
                ctx.stroke();
            } else {
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(w/2, h);
                ctx.lineTo(w/2, h - 60);
                ctx.stroke();

                ctx.lineWidth = 4.5;
                ctx.beginPath();
                ctx.moveTo(w/2, h - 60);
                ctx.lineTo(w/2 - 25, h - 95);
                ctx.moveTo(w/2, h - 60);
                ctx.lineTo(w/2 + 25, h - 95);
                ctx.stroke();

                ctx.fillStyle = "#38bdf8";
                drawPhialideBody(ctx, w/2 - 25, h - 95, -20);
                drawPhialideBody(ctx, w/2, h - 98, 0);
                drawPhialideBody(ctx, w/2 + 25, h - 95, 20);

                ctx.fillStyle = "#e0f2fe";
                drawSporeChain(ctx, w/2 - 32, h - 120, 8);
                drawSporeChain(ctx, w/2, h - 130, 9);
                drawSporeChain(ctx, w/2 + 32, h - 120, 8);
            }
        } else if (sample === 'contam_aspergillus') {
            ctx.strokeStyle = "#4ade80"; 
            
            if (state.microZoom === 100) {
                ctx.lineWidth = 1.5;
                for (let i = 0; i < 12; i++) {
                    ctx.beginPath();
                    ctx.moveTo(0, Math.random() * h);
                    ctx.lineTo(w, Math.random() * h);
                    ctx.stroke();
                }
                ctx.fillStyle = "#4ade80";
                for (let i = 0; i < 8; i++) {
                    ctx.beginPath();
                    ctx.arc(30 + Math.random() * (w - 60), 30 + Math.random() * (h - 60), 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (state.microZoom === 400 || state.microZoom === 1000) {
                const scale = state.microZoom === 1000 ? 1.8 : 1.0;
                
                ctx.lineWidth = 4 * scale;
                ctx.beginPath();
                ctx.moveTo(w/2, h);
                ctx.lineTo(w/2, h - 80 * scale);
                ctx.stroke();

                ctx.fillStyle = "#4ade80";
                ctx.beginPath();
                ctx.arc(w/2, h - 80 * scale, 24 * scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "#22c55e";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(w/2, h - 80 * scale, 24 * scale, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = "#86efac";
                const phialideCount = 28;
                const radius = 24 * scale;
                
                for (let i = 0; i < phialideCount; i++) {
                    const angle = (i / phialideCount) * Math.PI * 2;
                    const px = w/2 + Math.cos(angle) * radius;
                    const py = h - 80 * scale + Math.sin(angle) * radius;
                    
                    const ex = w/2 + Math.cos(angle) * (radius + 8 * scale);
                    const ey = h - 80 * scale + Math.sin(angle) * (radius + 8 * scale);
                    
                    ctx.strokeStyle = "#86efac";
                    ctx.lineWidth = 2 * scale;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();

                    ctx.fillStyle = "#bbf7d0";
                    let sx = ex;
                    let sy = ey;
                    for (let j = 0; j < 3; j++) {
                        ctx.beginPath();
                        ctx.arc(sx, sy, 2 * scale, 0, Math.PI * 2);
                        ctx.fill();
                        sx += Math.cos(angle) * (5 * scale);
                        sy += Math.sin(angle) * (5 * scale);
                    }
                }
            }
        } else if (sample === 'contam_rhizopus') {
            ctx.strokeStyle = "#a1a1aa"; 
            
            if (state.microZoom === 100) {
                ctx.lineWidth = 2.5; 
                for (let i = 0; i < 7; i++) {
                    ctx.beginPath();
                    ctx.moveTo(Math.random() * w, 0);
                    ctx.lineTo(Math.random() * w, h);
                    ctx.stroke();
                }
                ctx.fillStyle = "#27272a"; 
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.arc(40 + Math.random() * (w - 80), 40 + Math.random() * (h - 80), 10, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                const scale = state.microZoom === 1000 ? 1.6 : 1.0;
                
                ctx.lineWidth = 3.5 * scale;
                ctx.strokeStyle = "#71717a";
                ctx.beginPath();
                ctx.moveTo(w/2 - 25, h);
                ctx.quadraticCurveTo(w/2 - 40, h - 15, w/2 - 50, h);
                ctx.moveTo(w/2 - 25, h);
                ctx.quadraticCurveTo(w/2 - 15, h - 25, w/2 - 10, h);
                ctx.stroke();

                ctx.lineWidth = 5 * scale;
                ctx.beginPath();
                ctx.moveTo(w/2 - 25, h);
                ctx.lineTo(w/2 - 10, h - 90 * scale);
                ctx.stroke();

                ctx.fillStyle = "rgba(39, 39, 42, 0.95)";
                ctx.beginPath();
                ctx.arc(w/2 - 10, h - 90 * scale, 34 * scale, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "#18181b";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(w/2 - 10, h - 90 * scale, 34 * scale, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = "#3f3f46";
                for (let i = 0; i < 20; i++) {
                    ctx.beginPath();
                    ctx.arc(w/2 - 40 + Math.random() * 80, h - 130 * scale + Math.random() * 60, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        } else {
            ctx.fillStyle = "#c084fc"; 
            
            const cellCount = state.microZoom === 1000 ? 120 : 35;
            const size = state.microZoom === 1000 ? 3.5 : 1.5;
            
            for (let i = 0; i < cellCount; i++) {
                const baseSeedX = (i * 37) % w;
                const baseSeedY = (i * 59) % h;
                
                const jitterX = (Math.random() - 0.5) * 3;
                const jitterY = (Math.random() - 0.5) * 3;

                ctx.beginPath();
                if (i % 2 === 0) {
                    ctx.ellipse(baseSeedX + jitterX, baseSeedY + jitterY, size * 2.2, size, Math.PI/4, 0, Math.PI * 2);
                } else {
                    ctx.arc(baseSeedX + jitterX, baseSeedY + jitterY, size, 0, Math.PI * 2);
                }
                ctx.fill();
            }
        }
    };

    const drawConidiophoreBrush = (ctx, bx, by, stemHeight, scale = 1.0) => {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3 * scale;

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + 10, stemHeight);
        ctx.stroke();

        ctx.lineWidth = 2.2 * scale;
        ctx.beginPath();
        ctx.moveTo(bx + 10, stemHeight);
        ctx.lineTo(bx - 10, stemHeight - 25 * scale);
        ctx.moveTo(bx + 10, stemHeight);
        ctx.lineTo(bx + 25, stemHeight - 28 * scale);
        ctx.moveTo(bx + 10, stemHeight);
        ctx.lineTo(bx + 8, stemHeight - 32 * scale);
        ctx.stroke();

        const branches = [
            {x: bx - 10, y: stemHeight - 25 * scale, angle: -15},
            {x: bx + 8, y: stemHeight - 32 * scale, angle: 0},
            {x: bx + 25, y: stemHeight - 28 * scale, angle: 15}
        ];

        branches.forEach(b => {
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(b.x, b.y - 6 * scale, 3 * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#e0f2fe";
            let sx = b.x;
            let sy = b.y - 12 * scale;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(sx, sy, 2.5 * scale, 0, Math.PI * 2);
                ctx.fill();
                sy -= 6 * scale;
                sx += Math.sin(b.angle) * 1.5;
            }
        });
    };

    const drawPhialideBody = (ctx, x, y, angleDeg) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((angleDeg * Math.PI) / 180);
        
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.bezierCurveTo(-8, -12, -4, -20, 0, -25);
        ctx.bezierCurveTo(4, -20, 8, -12, 6, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    };

    const drawSporeChain = (ctx, x, y, count) => {
        let cy = y;
        let cx = x;
        for (let i = 0; i < count; i++) {
            ctx.beginPath();
            ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
            ctx.fill();
            cy -= 9;
            cx += (Math.random() - 0.5) * 1.5;
        }
    };

    const startMicroscopeLoop = () => {
        stopMicroscopeLoop();
        updateMicroscopeOcularDrawing();
        
        state.microLoopId = setInterval(() => {
            if (state.selectedMicroSample === 'contam_bacterias') {
                updateMicroscopeOcularDrawing();
            }
        }, 150);
    };

    const stopMicroscopeLoop = () => {
        if (state.microLoopId) {
            clearInterval(state.microLoopId);
            state.microLoopId = null;
        }
    };

    // ----------------------------------------------------
    // 10. PRE-RENDERED PLACAS & TLC CANVASES DRAWING
    // ----------------------------------------------------
    const initGalleryCanvases = () => {
        const canvasA = document.getElementById('pre-img-culture');
        if (canvasA) {
            const ctx = canvasA.getContext('2d');
            const w = canvasA.width; const h = canvasA.height;
            ctx.clearRect(0,0,w,h);
            ctx.fillStyle = "#0c0f13"; ctx.fillRect(0, 0, w, h);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.12)"; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(w/2, h/2, 90, 0, Math.PI * 2); ctx.stroke();

            ctx.fillStyle = "#ca8a04"; ctx.beginPath(); ctx.arc(w/2, h/2, 86, 0, Math.PI * 2); ctx.fill();

            const haloGrad = ctx.createRadialGradient(w/2, h/2, 5, w/2, h/2, 80);
            haloGrad.addColorStop(0, "rgba(239, 68, 68, 0.6)");
            haloGrad.addColorStop(0.5, "rgba(249, 115, 22, 0.4)");
            haloGrad.addColorStop(1, "rgba(202, 138, 4, 0)");
            ctx.fillStyle = haloGrad; ctx.beginPath(); ctx.arc(w/2, h/2, 80, 0, Math.PI * 2); ctx.fill();

            const colonyGrad = ctx.createRadialGradient(w/2, h/2, 2, w/2, h/2, 45);
            colonyGrad.addColorStop(0, "#f8fafc");
            colonyGrad.addColorStop(0.3, "#cbd5e1");
            colonyGrad.addColorStop(0.7, "#1e3a8a");
            colonyGrad.addColorStop(1, "#172554");
            ctx.fillStyle = colonyGrad; ctx.beginPath(); ctx.arc(w/2, h/2, 45, 0, Math.PI * 2); ctx.fill();
        }

        const canvasB = document.getElementById('pre-img-microscope');
        if (canvasB) {
            const ctx = canvasB.getContext('2d');
            const w = canvasB.width; const h = canvasB.height;
            ctx.clearRect(0,0,w,h);
            ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, w, h);
            const lightGrad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, 120);
            lightGrad.addColorStop(0, "#1e3a8a"); lightGrad.addColorStop(1, "#020617");
            ctx.fillStyle = lightGrad; ctx.fillRect(0,0,w,h);

            ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 3; ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(w/2 - 20, h); ctx.lineTo(w/2 - 10, h - 80); ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(w/2 - 10, h - 80); ctx.lineTo(w/2 - 30, h - 110);
            ctx.moveTo(w/2 - 10, h - 80); ctx.lineTo(w/2 + 10, h - 115);
            ctx.moveTo(w/2 - 10, h - 80); ctx.lineTo(w/2 - 5, h - 120);
            ctx.stroke();

            ctx.lineWidth = 2;
            const phialides = [
                {x1: w/2 - 30, y1: h - 110, x2: w/2 - 40, y2: h - 130},
                {x1: w/2 - 30, y1: h - 110, x2: w/2 - 28, y2: h - 132},
                {x1: w/2 - 5, y1: h - 120, x2: w/2 - 10, y2: h - 145},
                {x1: w/2 - 5, y1: h - 120, x2: w/2 + 2, y2: h - 146},
                {x1: w/2 + 10, y1: h - 115, x2: w/2 + 5, y2: h - 138},
                {x1: w/2 + 10, y1: h - 115, x2: w/2 + 22, y2: h - 136}
            ];
            phialides.forEach(p => {
                ctx.beginPath(); ctx.moveTo(p.x1, p.y1); ctx.lineTo(p.x2, p.y2); ctx.stroke();
                ctx.fillStyle = "#e0f2fe";
                let cx = p.x2; let cy = p.y2;
                for (let i = 0; i < 6; i++) {
                    ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
                    cy -= 8; cx += (Math.random() - 0.5) * 2;
                }
            });
        }

        const canvasC = document.getElementById('pre-img-tlc-scan');
        if (canvasC) {
            const ctx = canvasC.getContext('2d');
            const w = canvasC.width; const h = canvasC.height;
            ctx.clearRect(0,0,w,h);
            ctx.fillStyle = "#1e1b4b"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#e2e8f0"; ctx.fillRect(w/2 - 30, 20, 60, h - 40);
            ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
            ctx.beginPath(); ctx.moveTo(w/2 - 30, h - 45); ctx.lineTo(w/2 + 30, h - 45); ctx.stroke();
            ctx.setLineDash([]); 

            ctx.strokeStyle = "#38bdf8"; ctx.beginPath(); ctx.moveTo(w/2 - 30, 40); ctx.lineTo(w/2 + 30, 40); ctx.stroke();

            const redGrad = ctx.createRadialGradient(w/2, h - 75, 2, w/2, h - 75, 12);
            redGrad.addColorStop(0, "rgba(239, 68, 68, 1.0)"); redGrad.addColorStop(1, "rgba(239, 68, 68, 0.0)");
            ctx.fillStyle = redGrad; ctx.beginPath(); ctx.arc(w/2, h - 75, 12, 0, Math.PI * 2); ctx.fill();

            const orangeGrad = ctx.createRadialGradient(w/2, h - 110, 2, w/2, h - 110, 10);
            orangeGrad.addColorStop(0, "rgba(249, 115, 22, 1.0)"); orangeGrad.addColorStop(1, "rgba(249, 115, 22, 0.0)");
            ctx.fillStyle = orangeGrad; ctx.beginPath(); ctx.arc(w/2, h - 110, 10, 0, Math.PI * 2); ctx.fill();

            const yellowGrad = ctx.createRadialGradient(w/2, h - 145, 2, w/2, h - 145, 11);
            yellowGrad.addColorStop(0, "rgba(234, 179, 8, 1.0)"); yellowGrad.addColorStop(1, "rgba(234, 179, 8, 0.0)");
            ctx.fillStyle = yellowGrad; ctx.beginPath(); ctx.arc(w/2, h - 145, 11, 0, Math.PI * 2); ctx.fill();
        }

        const drawContamPreDrawing = (canvasId, drawType) => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const w = canvas.width; const h = canvas.height;
            ctx.clearRect(0,0,w,h);

            if (drawType === 'aspergillus') {
                ctx.fillStyle = "#111827"; ctx.fillRect(0,0,w,h);
                ctx.strokeStyle = "#4ade80"; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(w/2, h); ctx.lineTo(w/2, h - 45); ctx.stroke();
                ctx.fillStyle = "#22c55e"; ctx.beginPath(); ctx.arc(w/2, h - 45, 14, 0, Math.PI * 2); ctx.fill();
                
                ctx.fillStyle = "#86efac";
                const phialides = 18;
                for (let i = 0; i < phialides; i++) {
                    const angle = (i / phialides) * Math.PI * 2;
                    const px = w/2 + Math.cos(angle) * 14;
                    const py = h - 45 + Math.sin(angle) * 14;
                    const ex = w/2 + Math.cos(angle) * 20;
                    const ey = h - 45 + Math.sin(angle) * 20;
                    
                    ctx.strokeStyle = "#86efac"; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();

                    ctx.fillStyle = "#bbf7d0";
                    ctx.beginPath(); ctx.arc(ex + Math.cos(angle)*4, ey + Math.sin(angle)*4, 1.5, 0, Math.PI*2); ctx.fill();
                }
            } else if (drawType === 'rhizopus') {
                ctx.fillStyle = "#0c0a09"; ctx.fillRect(0,0,w,h);
                ctx.strokeStyle = "#78716c"; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(w/2 - 20, h); ctx.quadraticCurveTo(w/2 - 30, h-10, w/2 - 35, h); ctx.stroke();

                ctx.beginPath(); ctx.moveTo(w/2 - 20, h); ctx.lineTo(w/2 - 10, h - 50); ctx.stroke();
                
                ctx.fillStyle = "rgba(41, 37, 36, 0.95)";
                ctx.beginPath(); ctx.arc(w/2 - 10, h - 50, 18, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#1c1917"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(w/2 - 10, h - 50, 18, 0, Math.PI * 2); ctx.stroke();

                ctx.fillStyle = "#57534e";
                for (let i = 0; i < 12; i++) {
                    ctx.beginPath(); ctx.arc(w/2 - 30 + Math.random()*40, h - 70 + Math.random()*25, 2, 0, Math.PI*2); ctx.fill();
                }
            } else {
                ctx.fillStyle = "#090514"; ctx.fillRect(0,0,w,h);
                const colors = ["#a855f7", "#c084fc", "#d8b4fe"];
                for (let i = 0; i < 6; i++) {
                    ctx.fillStyle = colors[i % 3];
                    ctx.beginPath();
                    ctx.arc(30 + Math.random() * (w - 60), 20 + Math.random() * (h - 40), 10 + Math.random() * 15, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = "#e879f9";
                for (let i = 0; i < 20; i++) {
                    ctx.beginPath();
                    ctx.ellipse(20 + Math.random() * (w - 40), 20 + Math.random() * (h - 40), 3, 1, Math.PI/4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        drawContamPreDrawing('canvas-contam-aspergillus-pre', 'aspergillus');
        drawContamPreDrawing('canvas-contam-rhizopus-pre', 'rhizopus');
        drawContamPreDrawing('canvas-contam-bact-pre', 'bacteriana');
    };

    const hexToRGBA = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // ----------------------------------------------------
    // 11. GENERAL LOCAL STORAGE GALLERY & FILE UPLOADERS
    // ----------------------------------------------------
    const saveLogsToLocalStorage = () => {
        localStorage.setItem('penicillium_lab_logs_v2', JSON.stringify(state.cuadernoEnsayos));
    };

    const loadLogsFromLocalStorage = () => {
        const data = localStorage.getItem('penicillium_lab_logs_v2');
        if (data) {
            state.cuadernoEnsayos = JSON.parse(data);
        }
    };

    const renderLogTable = () => {
        if (state.cuadernoEnsayos.length === 0) {
            tableLogsBody.innerHTML = `
                <tr class="empty-row-placeholder">
                    <td colspan="7"><i class="fa-solid fa-folder-open"></i> Aún no has registrado ensayos. Completa una simulación y haz clic en "Registrar Resultados".</td>
                </tr>
            `;
            return;
        }

        tableLogsBody.innerHTML = '';
        state.cuadernoEnsayos.forEach((log, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="font-mono">${log.timestamp}</td>
                <td><strong>${log.cepa}</strong></td>
                <td><span class="badge-scientific" style="padding:2px 8px; font-size:10px;">${log.medio}</span></td>
                <td>${log.solvente}</td>
                <td class="font-mono text-cyan">${log.rf}</td>
                <td class="font-mono text-pink">${log.peak}</td>
                <td>
                    <button class="btn-row-action btn-descargar" data-index="${index}">
                        <i class="fa-solid fa-file-arrow-down"></i> Informe
                    </button>
                </td>
            `;
            tableLogsBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-descargar').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.getAttribute('data-index');
                downloadTextReport(state.cuadernoEnsayos[idx]);
            });
        });
    };

    const downloadTextReport = (log) => {
        const text = `==========================================================
REPORTE VIRTUAL DE ENSAYO CIENTÍFICO - PENICILLIUM SP. LAB
==========================================================
Fecha del Ensayo      : ${log.timestamp}
Cepa de Estudio       : ${log.cepa}
Medio de Cultivo      : ${log.medio}
Solvente de Extracción : ${log.solvente}
Cromatografía R_f     : ${log.rf.replace(/<sub>/g, '').replace(/<\/sub>/g, '')}
Pico Espectral (UV-Vis): ${log.peak}

Fundamento y Conclusión:
La separación cromatográfica en placa de sílice reveló la elución
con factor de retención (R_f) característico. El escaneo óptico
espectroscópico UV-Vis verificó la absorción cuántica molecular con
máxima absorbancia en ${log.peak}, correspondiente a los enlaces conjugados
carbono-carbono policétidos producidos biológicamente.

Simulador de Fisiología Fúngica Virtual. Criterio Científico Basado
en Sardaryan et al. (2004) & Mapari et al. (2009).
==========================================================`;
        
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Reporte_${log.cepa.replace(/\s+/g, '_')}_Rf_${log.rf.replace(/<[^>]*>/g, '')}.txt`;
        link.click();
    };

    btnBorrarBitacora.addEventListener('click', () => {
        if (confirm("⚠️ ¿Estás seguro de que deseas eliminar todo el historial de la bitácora de ensayos?")) {
            state.cuadernoEnsayos = [];
            saveLogsToLocalStorage();
            renderLogTable();
        }
    });

    // ----------------------------------------------------
    // QUESTIONNAIRE PERSISTENCE AND RENDERING (CRUD)
    // ----------------------------------------------------
    const saveQuestionnaireAnswers = () => {
        localStorage.setItem('penicillium_answers_v2', JSON.stringify(state.cuestionarioRespuestas));
    };

    const loadQuestionnaireAnswers = () => {
        const data = localStorage.getItem('penicillium_answers_v2');
        if (data) {
            state.cuestionarioRespuestas = JSON.parse(data);
        }
    };

    const renderQuestionnaire = () => {
        loadQuestionnaireAnswers();
        
        for (let q = 1; q <= 5; q++) {
            const container = document.getElementById(`qcard-${q}`);
            if (!container) continue;
            
            const savedAnsBox = document.getElementById(`saved-ans-${q}`);
            const attachedImgBox = document.getElementById(`attached-img-${q}`);
            const editForm = document.getElementById(`edit-form-${q}`);
            const textInput = document.getElementById(`q-input-${q}`);
            const fileStatus = document.getElementById(`q-file-status-${q}`);
            
            const btnSave = container.querySelector('.btn-save-answer');
            const btnEdit = container.querySelector('.btn-edit-answer');
            const btnDelete = container.querySelector('.btn-delete-answer');
            
            const qData = state.cuestionarioRespuestas[q] || { texto: '', imagen: '' };
            
            // Reset forms and display view mode by default
            editForm.style.display = "none";
            btnSave.style.display = "none";
            btnEdit.style.display = "inline-flex";
            btnEdit.innerText = qData.texto ? "Editar Respuesta" : "Responder";
            
            // Set text box value
            textInput.value = qData.texto;
            
            // Render view box
            if (qData.texto) {
                savedAnsBox.innerHTML = `<p class="ans-paragraph">${escapeHTML(qData.texto)}</p>`;
            } else {
                savedAnsBox.innerHTML = `<p class="answer-placeholder"><em>Aún no has guardado una respuesta para esta pregunta. Haz clic en "Responder" abajo para redactar.</em></p>`;
            }
            
            // Render attached image in view box if exists
            if (qData.imagen) {
                attachedImgBox.innerHTML = `
                    <img src="${qData.imagen}" alt="Muestra pregunta ${q}">
                    <button class="btn-remove-q-photo" data-q="${q}" title="Eliminar Imagen"><i class="fa-solid fa-trash-can"></i></button>
                `;
                attachedImgBox.style.display = "block";
                
                // Bind delete inside view photo
                attachedImgBox.querySelector('.btn-remove-q-photo').addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm("🗑️ ¿Deseas eliminar la foto adjunta a esta pregunta?")) {
                        state.cuestionarioRespuestas[q].imagen = '';
                        saveQuestionnaireAnswers();
                        renderQuestionnaire();
                    }
                });
            } else {
                attachedImgBox.style.display = "none";
                attachedImgBox.innerHTML = '';
            }
        }
    };

    const bindQuestionnaireHandlers = () => {
        // Trigger file input uploaders
        document.querySelectorAll('.btn-trigger-file').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetInputId = btn.getAttribute('data-target-input');
                document.getElementById(targetInputId).click();
            });
        });

        // Handle file change selection
        document.querySelectorAll('.q-file-uploader').forEach(input => {
            input.addEventListener('change', (e) => {
                const qIndex = parseInt(input.getAttribute('data-q-index'));
                const file = e.target.files[0];
                const statusSpan = document.getElementById(`q-file-status-${qIndex}`);
                
                if (file) {
                    if (file.size > 3 * 1024 * 1024) {
                        alert("❌ La imagen supera el límite de 3MB.");
                        input.value = '';
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        state.tempQFile[qIndex] = event.target.result; // Temporarily hold Base64 data
                        statusSpan.innerText = `Cargado: ${file.name.substring(0, 15)}...`;
                        statusSpan.style.color = "#10b981";
                    };
                    reader.readAsDataURL(file);
                }
            });
        });

        // Handle Edit toggle click
        document.querySelectorAll('.btn-edit-answer').forEach(btn => {
            btn.addEventListener('click', () => {
                const qIndex = parseInt(btn.getAttribute('data-q'));
                const container = document.getElementById(`qcard-${qIndex}`);
                
                const editForm = document.getElementById(`edit-form-${qIndex}`);
                const btnSave = container.querySelector('.btn-save-answer');
                const fileStatus = document.getElementById(`q-file-status-${qIndex}`);
                
                editForm.style.display = "block";
                btnSave.style.display = "inline-flex";
                btn.style.display = "none";
                
                // Reset temp image upload holders
                state.tempQFile[qIndex] = '';
                fileStatus.innerText = "Sin imagen cargada";
                fileStatus.style.color = "var(--text-muted)";
            });
        });

        // Handle Save changes click
        document.querySelectorAll('.btn-save-answer').forEach(btn => {
            btn.addEventListener('click', () => {
                const qIndex = parseInt(btn.getAttribute('data-q'));
                const container = document.getElementById(`qcard-${qIndex}`);
                
                const textInput = document.getElementById(`q-input-${qIndex}`);
                const fileUploader = document.getElementById(`q-file-${qIndex}`);
                
                const textValue = textInput.value.trim();
                const attachedBase64 = state.tempQFile[qIndex];
                
                if (!state.cuestionarioRespuestas[qIndex]) {
                    state.cuestionarioRespuestas[qIndex] = { texto: '', imagen: '' };
                }
                
                // Save values
                state.cuestionarioRespuestas[qIndex].texto = textValue;
                if (attachedBase64) {
                    state.cuestionarioRespuestas[qIndex].imagen = attachedBase64;
                }
                
                saveQuestionnaireAnswers();
                renderQuestionnaire();
                
                // Clean input fields
                fileUploader.value = '';
                state.tempQFile[qIndex] = '';
            });
        });

        // Handle Delete/Erase question answers
        document.querySelectorAll('.btn-delete-answer').forEach(btn => {
            btn.addEventListener('click', () => {
                const qIndex = parseInt(btn.getAttribute('data-q'));
                if (confirm(`🗑️ ¿Estás seguro de que deseas borrar toda tu respuesta y foto de la Pregunta ${qIndex}?`)) {
                    state.cuestionarioRespuestas[qIndex] = { texto: '', imagen: '' };
                    state.tempQFile[qIndex] = '';
                    
                    document.getElementById(`q-input-${qIndex}`).value = '';
                    document.getElementById(`q-file-${qIndex}`).value = '';
                    
                    saveQuestionnaireAnswers();
                    renderQuestionnaire();
                }
            });
        });
    };

    const escapeHTML = (str) => {
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // ----------------------------------------------------
    // 13. GENERAL LOCAL STORAGE GALLERY & FILE UPLOADERS
    // ----------------------------------------------------
    const bindUploaderEvents = (dropZoneEl, inputEl, storageKey, gridEl, isContam = false) => {
        dropZoneEl.addEventListener('click', () => inputEl.click());

        dropZoneEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZoneEl.style.borderColor = "#fbbf24";
            dropZoneEl.style.background = "rgba(251, 191, 36, 0.08)";
        });

        dropZoneEl.addEventListener('dragleave', () => {
            dropZoneEl.style.borderColor = "rgba(255, 255, 255, 0.15)";
            dropZoneEl.style.background = "rgba(255, 255, 255, 0.02)";
        });

        dropZoneEl.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZoneEl.style.borderColor = "rgba(255, 255, 255, 0.15)";
            dropZoneEl.style.background = "rgba(255, 255, 255, 0.02)";

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFile(files[0], storageKey, gridEl, isContam);
            }
        });

        inputEl.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                processFile(e.target.files[0], storageKey, gridEl, isContam);
            }
        });
    };

    const processFile = (file, storageKey, gridEl, isContam) => {
        if (file.size > 3 * 1024 * 1024) {
            alert("❌ La imagen supera el límite de 3MB.");
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert("❌ Por favor, selecciona solo archivos de imagen.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            const id = 'img_' + Date.now();
            const filename = file.name;
            const captionTitle = filename.split('.')[0];
            const captionDesc = isContam ? "Evidencia de contaminante biológico observado en cultivo." : "Observación estructural al microscopio.";
            
            addPolaroidCardToGrid(gridEl, id, base64, captionTitle, captionDesc, false, storageKey);
            saveImageLocally(storageKey, id, base64, filename, captionTitle, captionDesc);
        };
        reader.readAsDataURL(file);
    };

    const addPolaroidCardToGrid = (gridEl, id, imgSrc, title, desc, isPreLoaded = false, storageKey = '') => {
        const polaroid = document.createElement('div');
        polaroid.className = "polaroid-card animate-slide-in";
        if (id) polaroid.setAttribute('data-id', id);

        polaroid.innerHTML = `
            <div class="polaroid-img-wrapper">
                <img src="${imgSrc}" alt="${title}">
                <span class="img-badge img-badge-user font-mono">${isPreLoaded ? 'BITÁCORA' : 'SUBIDO POR TI'}</span>
            </div>
            <div class="polaroid-caption">
                <h4 class="editable-title" contenteditable="true">${title}</h4>
                <p class="editable-desc" contenteditable="true">${desc}</p>
                <span class="polaroid-date font-mono">
                    Registro de Ensayo 
                    <button class="btn-delete-polaroid" style="background:none; border:none; color:#ef4444; float:right; cursor:pointer;" title="Eliminar">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </span>
            </div>
        `;

        gridEl.insertBefore(polaroid, gridEl.firstChild);

        polaroid.querySelector('.btn-delete-polaroid').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm("🗑️ ¿Eliminar esta foto de la galería?")) {
                polaroid.remove();
                if (id && storageKey) {
                    deleteImageLocally(storageKey, id);
                }
            }
        });

        if (id && storageKey) {
            const titleEl = polaroid.querySelector('.editable-title');
            const descEl = polaroid.querySelector('.editable-desc');
            const updateLocalTexts = () => {
                updateImageTextsLocally(storageKey, id, titleEl.innerText, descEl.innerText);
            };
            titleEl.addEventListener('blur', updateLocalTexts);
            descEl.addEventListener('blur', updateLocalTexts);
        }
    };

    const saveImageLocally = (storageKey, id, base64, filename, title, desc) => {
        const list = JSON.parse(localStorage.getItem(storageKey) || '[]');
        list.push({
            id,
            base64,
            filename,
            captionTitle: title,
            captionDesc: desc,
            date: new Date().toLocaleDateString('es-ES')
        });
        localStorage.setItem(storageKey, JSON.stringify(list));
    };

    const loadImagesLocally = (storageKey, gridEl) => {
        const list = JSON.parse(localStorage.getItem(storageKey) || '[]');
        list.forEach(img => {
            addPolaroidCardToGrid(gridEl, img.id, img.base64, img.captionTitle, img.captionDesc, true, storageKey);
        });
    };

    const deleteImageLocally = (storageKey, id) => {
        let list = JSON.parse(localStorage.getItem(storageKey) || '[]');
        list = list.filter(img => img.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(list));
    };

    const updateImageTextsLocally = (storageKey, id, title, desc) => {
        const list = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const img = list.find(i => i.id === id);
        if (img) {
            img.captionTitle = title;
            img.captionDesc = desc;
            localStorage.setItem(storageKey, JSON.stringify(list));
        }
    };

    // ----------------------------------------------------
    // 14. INITIALIZATION ROUTINES
    // ----------------------------------------------------
    const initApp = () => {
        bindMediumToggleListeners();

        loadLogsFromLocalStorage();
        renderLogTable();

        // Bind Questionnaire Events & Load saved answers
        bindQuestionnaireHandlers();
        renderQuestionnaire();

        bindUploaderEvents(uploadZone, imageUploadInput, 'penicillium_gallery_pics_v2', galleryGrid);
        loadImagesLocally('penicillium_gallery_pics_v2', galleryGrid);

        bindUploaderEvents(microUploadZone, microUploadInput, 'penicillium_micro_pics_v2', galleryGrid);
        loadImagesLocally('penicillium_micro_pics_v2', galleryGrid);

        bindUploaderEvents(contamUploadZone, contamUploadInput, 'penicillium_contam_pics_v2', contamGalleryGrid, true);
        loadImagesLocally('penicillium_contam_pics_v2', contamGalleryGrid);

        initGalleryCanvases();
        
        drawGrowthCurveChart();
        drawSpectroscopyChart();
        updateMicroscopeOcularDrawing();
    };

    initApp();
});