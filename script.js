// ===========================
// CONFIGURATION (Customizable)
// ===========================
const CONFIG = {
    // Mobile settings
    mobileBreakpoint: 768,
    maxMobileLinesCount: 3,
    maxDesktopLinesCount: 4,
    
    // Text rendering
    defaultPlaceholderText: 'Your Text',
    baseFontSize: 80,
    minFontSize: 20,
    textBoundingRatioMobile: { width: 0.8, height: 0.7 },
    textBoundingRatioDesktop: { width: 0.85, height: 0.75 },
    
    // RGB animation
    rgbCycleSpeed: 500,
    rgbColorSequence: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
    
    // Pricing
    rgbSurcharge: 50,
    outdoorSurcharge: 65,
    basePromotionPercentage: 0.20,
    costPerInch: 1.9,
    shippingPerInch: 0.4,
    localShippingConstant: 15,
    minProfitPercentage: 0.25,
    fixedMinProfit: 100,
    currencyConversion: 1.0,
    minimumPriceFloor: 438.99,
    
    // Premium fonts (multiplier applied to price)
    premiumFonts: {
        'abril-fatface': 1.15,
        'playfair-display': 1.1
    },
    
    // Plan generation
    planScalingFactor: 1.3,
    planNames: ['Mini', 'Small', 'Medium', 'Large', 'XL', 'XXL', 'XXXL', '4XL']
};

// ===========================
// GLOBAL STATE OBJECT
// ===========================
const appState = {
    // Text content
    text: '',
    userHasEnteredText: false,
    
    // Font
    fontFamily: "'Pacifico', cursive",
    fontKey: 'pacifico',
    fontSizePx: CONFIG.baseFontSize,
    lineHeightPx: CONFIG.baseFontSize * 1.2,
    
    // Color
    colorValue: '#FFFFFF',
    colorName: 'White',
    rgbSurcharge: 0,
    rgbMode: false,
    rgbAnimationTimer: null,
    
    // Type (indoor/outdoor)
    type: 'indoor',
    outdoorSurcharge: 0,
    
    // Backboard & cut options
    backboard: 'clear',
    cutTo: 'cut-to-letter',
    cutToPrice: 15,
    
    // Extras
    extras: [],
    
    // Selected plan
    plan: {
        id: 'mini',
        name: 'Mini',
        widthIn: 23,
        heightIn: 10,
        price: 438.99
    },
    
    // Pricing
    totalPrice: 438.99,
    discountPrice: 351.19,
    originalDiscountPrice: 351.19,
    discountApplied: false,
    activeDiscount: null,
    discountCode: null,
    
    // Preview/export
    svgMarkup: '',
    svgWidthPx: 800,
    svgHeightPx: 600,
    
    // Measured dimensions from canvas
    measuredWidthIn: 23,
    measuredHeightIn: 10,
    
    // UI state
    currentStep: 1,
    inputType: 'text',
    logoFile: null,
    logoDataUrl: null,
    multicolor: false,
    characterColors: {},
    selectedCharIndex: null,
    themeMode: 'dark',
    neonGlowEnabled: true,
    generatedPlans: []
};

// ===========================
// CANVAS MANAGEMENT
// ===========================
const canvasInstances = {};
const animationHandles = {};

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    setupCanvases();
    attachEventListeners();
    generateInitialPlans();
    renderAllPreviews();
    recalculateTotalPrice();
});

function setupCanvases() {
    for (let step = 1; step <= 4; step++) {
        const canvasId = step === 1 ? 'neonCanvas' : `neonCanvas${step}`;
        const elem = document.getElementById(canvasId);
        
        if (elem) {
            canvasInstances[canvasId] = new fabric.Canvas(canvasId, {
                width: 800,
                height: 600,
                backgroundColor: 'transparent',
                selection: false
            });
        }
    }
}

// ===========================
// EVENT LISTENERS
// ===========================
function attachEventListeners() {
    // Text input (debounced)
    const textInput = document.getElementById('neonText');
    if (textInput) {
        textInput.addEventListener('input', debounce(handleTextInput, 300));
    }
    
    // Font selection
    attachFontListeners();
    
    // Color selection
    attachColorListeners();
    
    // Size/plan selection
    attachPlanListeners();
    
    // Indoor/outdoor toggle
    attachLocationListeners();
    
    // Shape/backboard selection
    attachShapeListeners();
    
    // Extras (hanging, waterproof, etc.)
    attachExtrasListeners();
    
    // Step navigation
    attachStepNavigationListeners();
    
    // Preview controls
    attachPreviewControlListeners();
    
    // Discount handling
    attachDiscountListeners();
    
    // Checkout
    attachCheckoutListener();
}

// ===========================
// TEXT INPUT HANDLER (Debounced)
// ===========================
function handleTextInput(event) {
    let inputText = event.target.value.trim();
    
    // Apply line limit based on viewport
    const isMobile = window.innerWidth < CONFIG.mobileBreakpoint;
    const maxLines = isMobile ? CONFIG.maxMobileLinesCount : CONFIG.maxDesktopLinesCount;
    const lines = inputText.split('\n');
    
    if (lines.length > maxLines) {
        inputText = lines.slice(0, maxLines).join('\n');
        event.target.value = inputText;
    }
    
    // Update state
    appState.text = inputText || CONFIG.defaultPlaceholderText;
    appState.userHasEnteredText = inputText.length > 0;
    
    // Render preview
    renderAllPreviews();
    
    // Read measured dimensions (simulated - real implementation would measure from canvas)
    const measurements = getMeasuredDimensions();
    appState.measuredWidthIn = measurements.widthIn;
    appState.measuredHeightIn = measurements.heightIn;
    
    // Regenerate plans
    generatePlansFromMeasurements();
    
    // Recalculate pricing
    recalculateTotalPrice();
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===========================
// FONT SELECTION
// ===========================
function attachFontListeners() {
    // Font cards
    document.querySelectorAll('.font-card').forEach(card => {
        card.addEventListener('click', () => {
            const fontKey = card.getAttribute('data-font');
            const fontFamily = card.getAttribute('data-family');
            selectFont(fontKey, fontFamily);
        });
    });
    
    // Font library items
    document.querySelectorAll('.font-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const fontKey = item.getAttribute('data-font');
            const fontFamily = item.getAttribute('data-family');
            selectFont(fontKey, fontFamily);
            
            // Close collapsible
            const content = document.getElementById('fontLibraryContent');
            const trigger = document.getElementById('fontLibraryTrigger');
            if (content) content.classList.remove('open');
            if (trigger) trigger.classList.remove('open');
        });
    });
    
    // Font library toggle
    const trigger = document.getElementById('fontLibraryTrigger');
    const content = document.getElementById('fontLibraryContent');
    if (trigger && content) {
        trigger.addEventListener('click', () => {
            content.classList.toggle('open');
            trigger.classList.toggle('open');
        });
    }
}

function selectFont(fontKey, fontFamily) {
    appState.fontKey = fontKey;
    appState.fontFamily = fontFamily;
    
    renderAllPreviews();
    
    const measurements = getMeasuredDimensions();
    appState.measuredWidthIn = measurements.widthIn;
    appState.measuredHeightIn = measurements.heightIn;
    
    generatePlansFromMeasurements();
    recalculateTotalPrice();
}

// ===========================
// COLOR SELECTION
// ===========================
function attachColorListeners() {
    // Standard colors
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const colorValue = option.getAttribute('data-color');
            const colorName = option.getAttribute('data-name');

            if (appState.multicolor && appState.selectedCharIndex !== null) {
                appState.characterColors[appState.selectedCharIndex] = colorValue;
                renderAllPreviews();
            } else {
                // Update active state
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                selectColor(colorValue, colorName);
            }
        });
    });
    
    // Custom color picker
    const customBtn = document.getElementById('customColorBtn');
    const customPicker = document.getElementById('customColorPicker');
    
    if (customBtn && customPicker) {
        customBtn.addEventListener('click', () => customPicker.click());
        
        customPicker.addEventListener('input', (e) => {
            const colorValue = e.target.value;
            
            if (appState.multicolor && appState.selectedCharIndex !== null) {
                appState.characterColors[appState.selectedCharIndex] = colorValue;
            } else {
                selectColor(colorValue, 'Custom');
            }
            
            renderAllPreviews();
        });
    }
    
    // Multicolor toggle
    const multiToggle = document.getElementById('multicolorToggle');
    const multiHelp = document.getElementById('multicolorHelp');
    
    if (multiToggle) {
        multiToggle.addEventListener('change', () => {
            appState.multicolor = multiToggle.checked;
            
            if (!multiToggle.checked) {
                appState.characterColors = {};
                appState.selectedCharIndex = null;
            }
            
            if (multiHelp) {
                multiHelp.classList.toggle('hidden', !multiToggle.checked);
            }
            
            renderAllPreviews();
        });
    }
}

function selectColor(colorValue, colorName) {
    // Check if this is RGB mode
    if (colorName === 'RGB Color Changing' || colorValue === 'rgb') {
        startRgbMode();
    } else {
        // Stop RGB mode if active
        if (appState.rgbMode) {
            stopRgbMode();
        }

        appState.colorValue = colorValue;
        appState.colorName = colorName;
        appState.rgbSurcharge = 0;
    }

    renderAllPreviews();
    recalculateTotalPrice();
}

function startRgbMode() {
    appState.rgbMode = true;
    appState.colorName = 'RGB Color Changing';
    appState.rgbSurcharge = CONFIG.rgbSurcharge;
    
    let colorIndex = 0;
    
    appState.rgbAnimationTimer = setInterval(() => {
        appState.colorValue = CONFIG.rgbColorSequence[colorIndex];
        colorIndex = (colorIndex + 1) % CONFIG.rgbColorSequence.length;
        renderAllPreviews();
    }, CONFIG.rgbCycleSpeed);
    
    recalculateTotalPrice();
}

function stopRgbMode() {
    appState.rgbMode = false;
    appState.rgbSurcharge = 0;
    
    if (appState.rgbAnimationTimer) {
        clearInterval(appState.rgbAnimationTimer);
        appState.rgbAnimationTimer = null;
    }
}

// ===========================
// PLAN/SIZE SELECTION
// ===========================
function attachPlanListeners() {
    // Size mode toggle
    document.querySelectorAll('.size-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const mode = btn.getAttribute('data-mode');
            toggleSizeMode(mode);
        });
    });
    
    // Custom size inputs
    const customWidth = document.getElementById('customWidth');
    const customHeight = document.getElementById('customHeight');
    
    if (customWidth) {
        customWidth.addEventListener('input', debounce(() => {
            const width = parseInt(customWidth.value) || 38;
            const height = parseInt(customHeight.value) || Math.round(width * 0.45);
            
            appState.plan.widthIn = width;
            appState.plan.heightIn = height;
            appState.plan.name = 'Custom';
            appState.plan.id = 'custom';
            
            recalculatePlanPrice();
            recalculateTotalPrice();
        }, 300));
    }
    
    if (customHeight) {
        customHeight.addEventListener('input', debounce(() => {
            const height = parseInt(customHeight.value) || 17;
            appState.plan.heightIn = height;
            
            recalculatePlanPrice();
            recalculateTotalPrice();
        }, 300));
    }
    
    // Pre-defined size cards (delegated event handling)
    document.addEventListener('click', (e) => {
        const sizeCard = e.target.closest('.size-card');
        if (sizeCard) {
            selectPlan(sizeCard);
        }
    });
}

function toggleSizeMode(mode) {
    const sizeGrid = document.getElementById('sizeGrid');
    const customInputs = document.getElementById('customSizeInputs');
    const title = document.getElementById('sizeModeTitle');
    
    if (mode === 'custom') {
        sizeGrid?.classList.add('hidden');
        customInputs?.classList.remove('hidden');
        if (title) title.textContent = 'Enter custom size';
    } else {
        sizeGrid?.classList.remove('hidden');
        customInputs?.classList.add('hidden');
        if (title) title.textContent = 'Select size';
    }
}

function selectPlan(cardElement) {
    // Remove active state from all cards
    document.querySelectorAll('.size-card').forEach(c => c.classList.remove('active'));
    cardElement.classList.add('active');
    
    // Update state
    appState.plan.id = cardElement.getAttribute('data-size');
    appState.plan.name = cardElement.querySelector('.size-name')?.textContent || 'Mini';
    appState.plan.widthIn = parseInt(cardElement.getAttribute('data-width')) || 23;
    appState.plan.heightIn = parseInt(cardElement.getAttribute('data-height')) || 10;
    appState.plan.price = parseFloat(cardElement.getAttribute('data-price')) || 438.99;
    
    recalculateTotalPrice();
}

function generatePlansFromMeasurements() {
    const baseWidth = appState.measuredWidthIn;
    const baseHeight = appState.measuredHeightIn;
    
    appState.generatedPlans = [];
    
    for (let i = 0; i < CONFIG.planNames.length; i++) {
        const scaleFactor = Math.pow(CONFIG.planScalingFactor, i);
        const scaledWidth = Math.round(baseWidth * scaleFactor);
        const scaledHeight = Math.round(baseHeight * scaleFactor);
        
        const planPrice = calculatePlanPrice(scaledWidth, scaledHeight);
        
        appState.generatedPlans.push({
            id: CONFIG.planNames[i].toLowerCase().replace(/\s/g, '-'),
            name: CONFIG.planNames[i],
            widthIn: scaledWidth,
            heightIn: scaledHeight,
            price: planPrice
        });
    }
    
    // Update UI with generated plans
    updatePlanCardsInUI();
    
    // Select first plan by default if none selected
    if (!appState.plan.id || appState.plan.id === 'custom') {
        appState.plan = { ...appState.generatedPlans[0] };
    }
}

function generateInitialPlans() {
    // Use default measurements for initial load
    appState.measuredWidthIn = 23;
    appState.measuredHeightIn = 10;
    generatePlansFromMeasurements();
}

function updatePlanCardsInUI() {
    const sizeGrid = document.getElementById('sizeGrid');
    if (!sizeGrid) return;
    
    // Note: In a full implementation, you would dynamically generate HTML here
    // For now, we'll update existing cards with calculated prices
    const cards = sizeGrid.querySelectorAll('.size-card');
    
    appState.generatedPlans.forEach((plan, index) => {
        if (cards[index]) {
            cards[index].setAttribute('data-width', plan.widthIn);
            cards[index].setAttribute('data-height', plan.heightIn);
            cards[index].setAttribute('data-price', plan.price);
            
            const dimensions = cards[index].querySelector('.size-dimensions');
            if (dimensions) dimensions.textContent = `${plan.widthIn}"x${plan.heightIn}"`;
            
            const priceElem = cards[index].querySelector('.sale-price');
            if (priceElem) priceElem.textContent = `$${plan.price.toFixed(2)}`;
        }
    });
}

// ===========================
// PRICING CALCULATIONS
// ===========================
function calculatePlanPrice(widthIn, heightIn) {
    const area = widthIn * heightIn;
    
    // Base product cost
    const costPerInchAdjusted = appState.rgbMode 
        ? CONFIG.costPerInch * 1.2 
        : CONFIG.costPerInch;
    
    const productCost = area * costPerInchAdjusted;
    const shippingCost = (area * CONFIG.shippingPerInch) + CONFIG.localShippingConstant;
    const totalCosts = productCost + shippingCost;
    
    // Profit calculation
    const percentageProfit = totalCosts * CONFIG.minProfitPercentage;
    const profit = Math.max(percentageProfit, CONFIG.fixedMinProfit);
    
    // Base price
    let basePrice = (totalCosts + profit) * CONFIG.currencyConversion;
    
    // Premium font multiplier
    if (CONFIG.premiumFonts[appState.fontKey]) {
        basePrice *= CONFIG.premiumFonts[appState.fontKey];
    }
    
    // Apply minimum floor
    basePrice = Math.max(basePrice, CONFIG.minimumPriceFloor);
    
    // Round to .99
    return Math.floor(basePrice) + 0.99;
}

function recalculatePlanPrice() {
    appState.plan.price = calculatePlanPrice(appState.plan.widthIn, appState.plan.heightIn);
}

function recalculateTotalPrice() {
    // Start with plan price
    let total = appState.plan.price;
    
    // Add extras
    appState.extras.forEach(extra => {
        total += extra.price;
    });
    
    // Add surcharges
    total += appState.outdoorSurcharge;
    total += appState.rgbSurcharge;
    total += appState.cutToPrice;
    
    // Round to .99
    total = Math.floor(total) + 0.99;
    
    appState.totalPrice = total;
    
    // Apply base promotion
    let discounted = total * (1 - CONFIG.basePromotionPercentage);
    
    // Apply additional discount if exists
    if (appState.discountApplied && appState.activeDiscount) {
        if (appState.activeDiscount.type === 'percentage') {
            discounted *= (1 - appState.activeDiscount.value);
        } else if (appState.activeDiscount.type === 'amount') {
            discounted -= appState.activeDiscount.value;
        }
    }
    
    discounted = Math.max(discounted, 0);
    discounted = Math.floor(discounted) + 0.99;
    
    appState.discountPrice = discounted;
    
    if (!appState.activeDiscount) {
        appState.originalDiscountPrice = discounted;
    }
    
    // Update UI
    updatePricingUI();
}

function updatePricingUI() {
    const originalElem = document.querySelector('.original-total');
    const finalElem = document.querySelector('.final-price');
    
    if (originalElem) {
        originalElem.textContent = `$${appState.totalPrice.toFixed(2)}`;
    }
    
    if (finalElem) {
        finalElem.textContent = `$${appState.discountPrice.toFixed(2)}`;
    }
}

// ===========================
// LOCATION (Indoor/Outdoor)
// ===========================
function attachLocationListeners() {
    document.querySelectorAll('input[name="location"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const parent = e.target.closest('.radio-option');
            document.querySelectorAll('.radio-group .radio-option').forEach(opt => 
                opt.classList.remove('active')
            );
            parent?.classList.add('active');
            
            appState.type = e.target.value;
            appState.outdoorSurcharge = e.target.value === 'outdoor' 
                ? CONFIG.outdoorSurcharge 
                : 0;
            
            recalculateTotalPrice();
        });
    });
}

// ===========================
// SHAPE & BACKBOARD
// ===========================
function attachShapeListeners() {
    // Shape cards
    document.querySelectorAll('.shape-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.shape-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            appState.cutTo = card.getAttribute('data-shape');
            appState.cutToPrice = parseFloat(card.getAttribute('data-price')) || 0;
            
            recalculateTotalPrice();
        });
    });
    
    // Backboard selection
    document.querySelectorAll('input[name="backboard"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            appState.backboard = e.target.value;
        });
    });
}

// ===========================
// EXTRAS (Hanging, Waterproof, etc.)
// ===========================
function attachExtrasListeners() {
    // Hanging options
    document.querySelectorAll('input[name="hanging"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const parent = e.target.closest('.radio-option');
            document.querySelectorAll('#step4 .radio-group .radio-option').forEach(opt => 
                opt.classList.remove('active')
            );
            parent?.classList.add('active');
            
            const hangingType = e.target.value;
            const hangingPrice = (hangingType === 'wall' || hangingType === 'sign') ? 15 : 0;
            
            // Remove old hanging extra
            appState.extras = appState.extras.filter(ex => ex.id !== 'hanging');
            
            // Add new hanging extra if applicable
            if (hangingPrice > 0) {
                appState.extras.push({
                    id: 'hanging',
                    description: `${hangingType} hanging`,
                    price: hangingPrice
                });
            }
            
            recalculateTotalPrice();
        });
    });
    
    // Waterproof checkbox
    const waterproofCheck = document.getElementById('waterProof');
    if (waterproofCheck) {
        waterproofCheck.addEventListener('change', (e) => {
            appState.extras = appState.extras.filter(ex => ex.id !== 'waterproof');
            
            if (e.target.checked) {
                appState.extras.push({
                    id: 'waterproof',
                    description: 'Waterproof protection',
                    price: 30
                });
            }
            
            recalculateTotalPrice();
        });
    }
    
    // Remote & dimmer checkbox
    const remoteDimmerCheck = document.getElementById('remoteDimmer');
    if (remoteDimmerCheck) {
        remoteDimmerCheck.addEventListener('change', (e) => {
            // Free feature, just for tracking
            appState.extras = appState.extras.filter(ex => ex.id !== 'remote');
            
            if (e.target.checked) {
                appState.extras.push({
                    id: 'remote',
                    description: 'Remote and Dimmer',
                    price: 0
                });
            }
        });
    }
    
    // Power adapter
    document.querySelectorAll('input[name="power"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Store for checkout payload
            appState.powerAdapter = e.target.value;
        });
    });
}

// ===========================
// DISCOUNT HANDLING
// ===========================
function attachDiscountListeners() {
    const applyBtn = document.querySelector('.apply-btn');
    const discountInput = document.getElementById('discountCode');
    
    if (applyBtn && discountInput) {
        applyBtn.addEventListener('click', () => {
            const code = discountInput.value.trim();
            
            if (!code) {
                alert('Please enter a discount code');
                return;
            }
            
            if (appState.discountApplied) {
                // Remove discount
                removeDiscount();
                applyBtn.textContent = 'Apply';
            } else {
                // Apply discount (validate via API)
                validateAndApplyDiscount(code);
            }
        });
    }
}

function validateAndApplyDiscount(code) {
    // BACKEND DEPENDENCY: This would call the API
    // POST https://apiv2.easyneonsigns.ca/apply-discount
    // Headers: Content-Type, X-API-Key, X-Idempotency-Key
    // Body: { discount_code: code }
    
    console.log('BACKEND CALL REQUIRED: Validate discount code:', code);
    
    // Simulated response for demo
    alert('Backend integration required for discount validation.\n\nEndpoint: POST https://apiv2.easyneonsigns.ca/apply-discount');
    
    // Example if valid:
    // appState.discountApplied = true;
    // appState.activeDiscount = { type: 'percentage', value: 0.10 }; // 10% off
    // appState.discountCode = code;
    // recalculateTotalPrice();
    // document.querySelector('.apply-btn').textContent = 'Remove';
}

function removeDiscount() {
    appState.discountApplied = false;
    appState.activeDiscount = null;
    appState.discountCode = null;
    
    recalculateTotalPrice();
}

// ===========================
// CHECKOUT / ADD TO CART
// ===========================
function attachCheckoutListener() {
    const checkoutBtn = document.querySelector('.btn-final');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            handleCheckout();
        });
    }
}

function handleCheckout() {
    // Lock UI (prevent double submission)
    const btn = document.querySelector('.btn-final');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Processing...';
    }
    
    // Capture SVG markup
    captureSvgMarkup();
    
    // Prepare payload
    const payload = {
        text: appState.text,
        font: appState.fontKey,
        fontFamily: appState.fontFamily,
        color: appState.colorName,
        colorValue: appState.colorValue,
        plan: appState.plan,
        extras: appState.extras,
        type: appState.type,
        outdoorSurcharge: appState.outdoorSurcharge,
        rgbSurcharge: appState.rgbSurcharge,
        backboard: appState.backboard,
        cutTo: appState.cutTo,
        cutToPrice: appState.cutToPrice,
        powerAdapter: appState.powerAdapter,
        totalPrice: appState.totalPrice,
        discountPrice: appState.discountPrice,
        discountCode: appState.discountCode,
        svgMarkup: appState.svgMarkup,
        svgWidthPx: appState.svgWidthPx,
        svgHeightPx: appState.svgHeightPx
    };
    
    // BACKEND DEPENDENCY: Create checkout
    // POST https://apiv2.easyneonsigns.ca/create-draft-order
    // Headers: Content-Type, X-API-Key, X-Idempotency-Key
    // Body: payload
    
    console.log('BACKEND CALL REQUIRED: Create checkout', payload);
    
    alert('Backend integration required for checkout.\n\nEndpoint: POST https://apiv2.easyneonsigns.ca/create-draft-order\n\nCheck console for payload.');
    
    // On success, redirect to checkout_url
    // window.location.href = response.checkout_url;
    
    // On failure, unlock UI
    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Preview & Buy';
    }
}

function captureSvgMarkup() {
    // In a real implementation, export canvas to SVG with embedded fonts
    const canvas = canvasInstances['neonCanvas4'] || canvasInstances['neonCanvas'];
    
    if (canvas) {
        appState.svgMarkup = canvas.toSVG();
        appState.svgWidthPx = canvas.width;
        appState.svgHeightPx = canvas.height;
    }
}

// ===========================
// STEP NAVIGATION
// ===========================
function attachStepNavigationListeners() {
    document.querySelectorAll('.step-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const step = parseInt(tab.getAttribute('data-step'));
            navigateToStep(step);
        });
    });
    
    // Attach to global scope for inline onclick handlers
    window.goToStep = navigateToStep;
}

function navigateToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.step-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    appState.currentStep = stepNumber;
    updateStepTabsUI();
    renderAllPreviews();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepTabsUI() {
    document.querySelectorAll('.step-tab').forEach(tab => {
        const step = parseInt(tab.getAttribute('data-step'));
        tab.classList.remove('active', 'completed');
        
        if (step < appState.currentStep) {
            tab.classList.add('completed');
        } else if (step === appState.currentStep) {
            tab.classList.add('active');
        }
    });
}

// ===========================
// PREVIEW CONTROLS
// ===========================
function attachPreviewControlListeners() {
    for (let step = 1; step <= 4; step++) {
        const container = document.getElementById(`step${step}`);
        if (!container) continue;
        
        // Neon ON/OFF toggle
        const neonToggle = container.querySelector(`#neonToggle${step === 1 ? '' : step}`);
        if (neonToggle) {
            neonToggle.addEventListener('change', (e) => {
                appState.neonGlowEnabled = e.target.checked;
                renderAllPreviews();
            });
        }
        
        // Theme mode (light/dark)
        const modeBtns = container.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const parent = btn.closest('.theme-mode-toggle');
                parent.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                appState.themeMode = btn.getAttribute('data-mode');
                updateBackgroundTheme();
                renderAllPreviews();
            });
        });
        
        // Save preview button
        const saveBtn = document.getElementById(`saveBtn${step}`);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                exportPreviewImage(step);
            });
        }
    }
}

function updateBackgroundTheme() {
    for (let i = 1; i <= 4; i++) {
        const wrapper = document.getElementById(`bgImageWrapper${i === 1 ? '' : i}`);
        if (wrapper) {
            wrapper.classList.remove('light-mode', 'dark-mode');
            wrapper.classList.add(`${appState.themeMode}-mode`);
        }
    }
}

function exportPreviewImage(stepNumber) {
    const canvasId = stepNumber === 1 ? 'neonCanvas' : `neonCanvas${stepNumber}`;
    const canvas = canvasInstances[canvasId];
    
    if (!canvas) {
        alert('Canvas not found');
        return;
    }
    
    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2
    });
    
    const link = document.createElement('a');
    link.download = `neon-sign-preview-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
}

// ===========================
// CANVAS RENDERING
// ===========================
function renderAllPreviews() {
    Object.keys(canvasInstances).forEach(canvasId => {
        const canvas = canvasInstances[canvasId];
        if (canvas) {
            renderCanvasPreview(canvas);
        }
    });
}

function renderCanvasPreview(canvas) {
    if (!canvas) return;
    
    canvas.clear();
    
    const displayText = appState.text || CONFIG.defaultPlaceholderText;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Render text with auto-fit logic
    const textConfig = {
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        fontFamily: appState.fontFamily.replace(/['"]/g, ''),
        fontSize: appState.fontSizePx,
        fill: appState.colorValue,
        selectable: false
    };
    
    // Apply glow if enabled
    if (appState.neonGlowEnabled) {
        textConfig.shadow = {
            color: appState.colorValue,
            blur: 45,
            offsetX: 0,
            offsetY: 0
        };
    } else {
        textConfig.opacity = 0.3;
    }
    
    const textObject = new fabric.Text(displayText, textConfig);
    canvas.add(textObject);
    
    // Draw measurement overlays
    drawMeasurementOverlays(canvas, textObject);
    
    canvas.renderAll();
}

function drawMeasurementOverlays(canvas, textObject) {
    const scaleColor = appState.themeMode === 'dark' 
        ? 'rgba(255, 255, 255, 0.5)' 
        : 'rgba(0, 0, 0, 0.6)';
    
    const textColor = appState.themeMode === 'dark' ? '#FFFFFF' : '#000000';
    
    const bounds = textObject.getBoundingRect();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const padding = 80;
    const tickLength = 10;
    
    // Horizontal dimension line
    const hLineY = bounds.top + bounds.height + padding;
    const hStartX = bounds.left - 20;
    const hEndX = bounds.left + bounds.width + 20;
    
    const horizLine = new fabric.Line([hStartX, hLineY, hEndX, hLineY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false
    });
    canvas.add(horizLine);
    
    // Horizontal ticks
    canvas.add(new fabric.Line([hStartX, hLineY - tickLength, hStartX, hLineY + tickLength], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false
    }));
    
    canvas.add(new fabric.Line([hEndX, hLineY - tickLength, hEndX, hLineY + tickLength], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false
    }));
    
    // Horizontal label
    const widthLabel = new fabric.Text(`${appState.plan.widthIn}"`, {
        left: centerX,
        top: hLineY + 18,
        originX: 'center',
        originY: 'top',
        fontSize: 16,
        fill: textColor,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        selectable: false
    });
    canvas.add(widthLabel);
    
    // Vertical dimension line
    const vLineX = bounds.left + bounds.width + padding;
    const vStartY = bounds.top - 20;
    const vEndY = bounds.top + bounds.height + 20;
    
    const vertLine = new fabric.Line([vLineX, vStartY, vLineX, vEndY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false
    });
    canvas.add(vertLine);
    
    // Vertical ticks
    canvas.add(new fabric.Line([vLineX - tickLength, vStartY, vLineX + tickLength, vStartY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false
    }));
    
    canvas.add(new fabric.Line([vLineX - tickLength, vEndY, vLineX + tickLength, vEndY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false
    }));
    
    // Vertical label
    const heightLabel = new fabric.Text(`${appState.plan.heightIn}"`, {
        left: vLineX + 18,
        top: centerY,
        originX: 'left',
        originY: 'center',
        fontSize: 16,
        fill: textColor,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        selectable: false
    });
    canvas.add(heightLabel);
}

// ===========================
// MEASUREMENT SIMULATION
// ===========================
function getMeasuredDimensions() {
    // In real implementation, this would measure the actual rendered text
    // For now, we estimate based on text length and font
    
    const textLength = appState.text.length || CONFIG.defaultPlaceholderText.length;
    const baseWidth = 15 + (textLength * 2.5);
    const baseHeight = Math.round(baseWidth * 0.43);
    
    return {
        widthIn: Math.round(baseWidth),
        heightIn: Math.round(baseHeight)
    };
}

// ===========================
// WINDOW RESIZE HANDLER
// ===========================
window.addEventListener('resize', debounce(() => {
    renderAllPreviews();
}, 250));
