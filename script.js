const CONFIG = {
    mobileBreakpoint: 768,
    maxMobileLinesCount: 999,
    maxDesktopLinesCount: 999,

    defaultPlaceholderText: 'Your Text',
    baseFontSize: 38,
    minFontSize: 20,
    textBoundingRatioMobile: { width: 0.8, height: 0.7 },
    textBoundingRatioDesktop: { width: 0.85, height: 0.75 },

    rgbCycleSpeed: 500,
    rgbColorSequence: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],

    basePrice: 90,
    rgbSurcharge: 50,
    outdoorSurcharge: 65,

    enableBaseDiscount: false,
    basePromotionPercentage: 0.30,

    productCostPerInchStandard: 0.2519,
    productCostPerInchRGB: 0.2947,
    shippingCostPerInch: 0.25,
    usdToCadMultiplier: 1.42,
    localShippingCostUSD: 45 / 1.42,
    minProfitPercentage: 0.35,
    minProfitUSD: 100 / 1.42,
    minimumPriceFloor: 90,

    premiumFontsDouble: ['loveneon', 'scifi', 'mayfair'],

    planScalingFactor: 1.3,
    planNames: ['Mini', 'Small', 'Medium', 'Large', 'XL', 'XXL', 'XXXL', '4XL'],

    localCoupons: {
        'SAVE10': { type: 'percentage', value: 10 },
        'SAVE20': { type: 'percentage', value: 20 },
        'FIFTY': { type: 'amount', value: 50 },
        'WELCOME15': { type: 'percentage', value: 15 },
        'NEWYEAR': { type: 'percentage', value: 25 }
    },

    couponApiEndpoint: 'https://apiv2.easyneonsigns.ca/apply-discount',

    lineHeightMultipliers: {
        'Barcelona': 1.4,
        'Alexa': 0.8,
        'Bayview': 1,
        'Amsterdam': 1,
        'Greenworld': 1,
        'NewCursive': 0.9,
        'Vintage': 1,
        'Venetian': 1.2,
        'Amanda': 1.2,
        'Austin': 0.9,
        'Beachfront': 1.1,
        'Chelsea': 1.1,
        'Freehand': 1,
        'Freespirit': 1.8,
        'LoveNote': 1,
        'Neonscript': 1.2,
        'Northshore': 1.4,
        'Photogenic': 1,
        'Royalty': 1.25,
        'Rocket': 1.4,
        'Signature': 1,
        'Sorrento': 1.6,
        'WildScript': 1,
        'Avante': 1,
        'Buttercup': 1,
        'ClassicType': 1.1,
        'Typewriter': 1,
        'Melbourne': 1.1,
        'NeoTokyo': 1.1,
        'Monaco': 1,
        'Waikiki': 1.2,
        'Bellview': 1,
        'LoveNeon': 1,
        'Marquee': 1,
        'Mayfair': 1,
        'NeonGlow': 1,
        'NeonLite': 1,
        'Neontrace': 1,
        'Nevada': 1.1,
        'SciFi': 1
    }
};




const appState = {
    text: '',
    userHasEnteredText: false,

    fontFamily: "Barcelona",
    fontKey: 'Barcelona',
    fontSizePx: CONFIG.baseFontSize,
    lineHeightPx: CONFIG.lineHeightMultipliers['Barcelona'] || 1.2,

    colorValue: '#FFFFFF',
    colorName: 'White',
    rgbSurcharge: 0,
    rgbMode: false,
    rgbAnimationTimer: null,

    type: 'indoor',
    outdoorSurcharge: 0,

    backboard: 'clear',
    cutTo: 'cut-to-letter',
    cutToPrice: 15,

    extras: [],

    plan: {
        id: 'mini',
        name: 'Mini',
        widthIn: 23,
        heightIn: 10,
        price: 438.99
    },

    totalPrice: 438.99,
    discountPrice: 351.19,
    originalDiscountPrice: 351.19,
    discountApplied: false,
    activeDiscount: null,
    discountCode: null,

    svgMarkup: '',
    svgWidthPx: 800,
    svgHeightPx: 600,

    measuredWidthIn: 23,
    measuredHeightIn: 10,

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

const canvasInstances = {};
const animationHandles = {};

// Minimum dimensions for custom sizing (will be updated when cards regenerate)
let MINIMUM_WIDTH = 23;
let MINIMUM_HEIGHT = 10;

// Font loading utility - ensures fonts are loaded before rendering
async function ensureFontLoaded(fontFamily) {
    // Check if document.fonts API is available
    if (!document.fonts) {
        // Fallback: wait a bit for fonts to load
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
        // Wait for the specific font to be loaded
        await document.fonts.load(`38px ${fontFamily}`);
        // Also wait for all fonts to be ready (in case of dependencies)
        await document.fonts.ready;
        return true;
    } catch (error) {
        console.warn(`Font ${fontFamily} failed to load, using fallback:`, error);
        // Wait a bit anyway to give fonts time to load
        return new Promise(resolve => setTimeout(resolve, 500));
    }
}




function initializeActiveStates() {
    const defaultFontCard = document.querySelector('.font-card[data-font="barcelona"]');
    const defaultFontItem = document.querySelector('.font-list-item[data-font="barcelona"]');
    if (defaultFontCard) {
        defaultFontCard.classList.add('active');
    }

    if (defaultFontItem) {
        defaultFontItem.classList.add('active');
    }

    const defaultColor = document.querySelector('.color-option[data-color="#FFFFFF"]');
    if (defaultColor && !defaultColor.classList.contains('active')) {
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
        defaultColor.classList.add('active');
    }

    const defaultBackboard = document.querySelector('.backboard-color-option input[value="clear"]');
    if (defaultBackboard) {
        const parent = defaultBackboard.closest('.backboard-color-option');
        if (parent) parent.classList.add('active');
    }

    const defaultPower = document.querySelector('.radio-pill input[value="usa"]');
    if (defaultPower) {
        const parent = defaultPower.closest('.radio-pill');
        if (parent) parent.classList.add('active');
    }
}




document.addEventListener('DOMContentLoaded', () => {
    setupCanvases();
    attachEventListeners();
    generateInitialPlans();
    initializeActiveStates();

    const initialDimensions = calculateIntelligentDimensions(appState.text);
    regenerateSizeCards(initialDimensions.widthInches, initialDimensions.heightInches);

    // Ensure default font (Barcelona) is loaded before rendering
    ensureFontLoaded('Barcelona').then(() => {
        // Use requestAnimationFrame to ensure DOM is fully painted
        requestAnimationFrame(() => {
            renderAllPreviews();
            recalculateTotalPrice();
        });
    }).catch(err => {
        console.warn('Font loading failed, rendering with fallback:', err);
        // Render anyway with fallback font
        requestAnimationFrame(() => {
            renderAllPreviews();
            recalculateTotalPrice();
        });
    });
});

// Additional render on window load to ensure everything is ready after refresh
window.addEventListener('load', () => {
    // Reset all canvas viewports to ensure proper centering after refresh
    Object.keys(canvasInstances).forEach(canvasId => {
        const canvas = canvasInstances[canvasId];
        if (canvas) {
            canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
        }
    });

    // Re-render all canvases after full page load to ensure everything displays
    setTimeout(() => {
        renderAllPreviews();
    }, 100);
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
                selection: false,
                renderOnAddRemove: false,
                skipTargetFind: false,
                // Disable interactive features to prevent passive listener violations
                interactive: true,
                // Disable default zoom with mouse wheel to prevent passive listener issues
                allowTouchScrolling: true,
                stopContextMenu: true,
                fireRightClick: false,
                // Performance optimizations
                enableRetinaScaling: false,
                imageSmoothingEnabled: true
            });

            // Disable wheel zoom to prevent passive listener violations
            canvasInstances[canvasId].off('mouse:wheel');

            canvasInstances[canvasId].on('mouse:down', function (options) {
                handleCanvasClick(canvasId, options);
            });
        }
    }
}


function handleCanvasClick(canvasId, options) {
    if (!appState.multicolor) return;

    const canvas = canvasInstances[canvasId];
    if (!canvas) return;

    const pointer = canvas.getPointer(options.e);
    const characterObjects = canvas.getObjects().filter(obj => obj.charIndex !== undefined);

    for (let obj of characterObjects) {
        const bounds = obj.getBoundingRect();

        if (pointer.x >= bounds.left && pointer.x <= bounds.left + bounds.width &&
            pointer.y >= bounds.top && pointer.y <= bounds.top + bounds.height) {
            appState.selectedCharIndex = obj.charIndex;
            renderAllPreviews();
            showColorPopup(canvasId, obj);
            return;
        }
    }

    appState.selectedCharIndex = null;
    renderAllPreviews();
    hideColorPopup();
}


function showColorPopup(canvasId, charObj) {
    const canvasElement = document.getElementById(canvasId);
    if (!canvasElement) return;

    hideColorPopup();

    const wrapper = canvasElement.closest('.canvas-wrapper');
    if (!wrapper) return;

    const popup = document.createElement('div');
    popup.className = 'character-color-popup';
    popup.id = 'characterColorPopup';

    const title = document.createElement('div');
    title.className = 'popup-title';
    title.textContent = 'SELECT COLOR';
    popup.appendChild(title);

    const colorsGrid = document.createElement('div');
    colorsGrid.className = 'popup-colors';


    const colors = [
        { color: '#FFF8DC', name: 'Warm White' },
        { color: '#FFFFFF', name: 'White' },
        { color: '#FF0000', name: 'Red' },
        { color: '#FFF44F', name: 'Lemon Yellow' },
        { color: '#FFD700', name: 'Golden Yellow' },
        { color: '#FF8C00', name: 'Orange' },
        { color: '#FFC0CB', name: 'Pink' },
        { color: '#FF1493', name: 'Deep Pink' },
        { color: '#9B30FF', name: 'Purple' },
        { color: '#4169E1', name: 'Royal Blue' },
        { color: '#87CEEB', name: 'Ice Blue' },
        { color: '#98FF98', name: 'Mint' },
        { color: '#00CED1', name: 'Teal' },
        { color: '#00FF00', name: 'Green' },
        { color: '#1E90FF', name: 'Tropical Blue' }
    ];

    const currentColor = appState.characterColors[appState.selectedCharIndex] || appState.colorValue;

    colors.forEach(({ color, name }) => {
        const btn = document.createElement('button');
        btn.className = 'popup-color-btn';
        btn.setAttribute('data-color', color);
        btn.setAttribute('title', name);

        const colorSwatch = document.createElement('div');
        colorSwatch.className = 'popup-color-swatch';
        colorSwatch.style.background = color;

        const colorName = document.createElement('span');
        colorName.className = 'popup-color-name';
        colorName.textContent = name;

        btn.appendChild(colorSwatch);
        btn.appendChild(colorName);

        if (color === currentColor) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (appState.selectedCharIndex !== null) {
                appState.characterColors[appState.selectedCharIndex] = color;
                renderAllPreviews();


                popup.querySelectorAll('.popup-color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });

        colorsGrid.appendChild(btn);
    });

    popup.appendChild(colorsGrid);


    const customColorBtn = document.createElement('button');
    customColorBtn.className = 'popup-color-btn custom-color-btn';
    customColorBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-left: 8px;">
            <path d="M8 3V13M3 8H13" stroke="#00FF00" stroke-width="2" stroke-linecap="round"/>
        </svg>
    `;


    const customColorInput = document.createElement('input');
    customColorInput.type = 'color';
    customColorInput.className = 'popup-custom-color-input';
    customColorInput.value = currentColor;

    customColorBtn.appendChild(customColorInput);


    customColorBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        customColorInput.click();
    });


    customColorInput.addEventListener('input', (e) => {
        e.stopPropagation();
        const selectedColor = e.target.value;

        if (appState.selectedCharIndex !== null) {
            appState.characterColors[appState.selectedCharIndex] = selectedColor;
            renderAllPreviews();


            popup.querySelectorAll('.popup-color-btn').forEach(b => b.classList.remove('active'));
        }
    });

    colorsGrid.appendChild(customColorBtn);


    wrapper.appendChild(popup);


    const bounds = charObj.getBoundingRect();
    const canvasRect = canvasElement.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();


    const popupLeft = bounds.left + (bounds.width / 2) - (popup.offsetWidth / 2);
    const popupTop = bounds.top - popup.offsetHeight - 20;


    const finalLeft = Math.max(10, Math.min(popupLeft, canvasRect.width - popup.offsetWidth - 10));
    const finalTop = Math.max(10, popupTop);

    popup.style.left = `${finalLeft}px`;
    popup.style.top = `${finalTop}px`;


    setTimeout(() => {
        document.addEventListener('click', handlePopupOutsideClick);
    }, 100);
}

function hideColorPopup() {
    const popup = document.getElementById('characterColorPopup');
    if (popup) {
        popup.remove();
    }
    document.removeEventListener('click', handlePopupOutsideClick);
}

function handlePopupOutsideClick(e) {
    const popup = document.getElementById('characterColorPopup');
    if (popup && !popup.contains(e.target)) {
        const canvas = e.target.closest('canvas');
        if (!canvas) {
            hideColorPopup();
        }
    }
}




function attachEventListeners() {
    const textInput = document.getElementById('neonText');
    if (textInput) {
        textInput.addEventListener('input', debounce(handleTextInput, 300));
    }

    attachFontListeners();
    attachColorListeners();
    attachPlanListeners();
    attachLocationListeners();
    attachShapeListeners();
    attachExtrasListeners();
    attachStepNavigationListeners();
    attachPreviewControlListeners();
    attachDiscountListeners();
    attachCheckoutListener();
}




function handleTextInput(event) {
    let inputText = event.target.value.trim();

    appState.text = inputText || CONFIG.defaultPlaceholderText;
    appState.userHasEnteredText = inputText.length > 0;

    const dimensions = calculateIntelligentDimensions(appState.text);

    appState.plan.widthIn = dimensions.widthInches;
    appState.plan.heightIn = dimensions.heightInches;

    regenerateSizeCards(dimensions.widthInches, dimensions.heightInches);
    recalculatePlanPrice();

    renderAllPreviews();
    recalculateTotalPrice();
}

function calculateIntelligentDimensions(text) {
    // MATCHING neonText.js logic EXACTLY (lines 656-828)

    // Handle empty text - return default dimensions
    if (!text || text.trim() === '') {
        return { widthInches: 23, heightInches: 10 };
    }

    const lines = text.split('\n');
    const fontFamily = appState.fontFamily || 'Barcelona';
    const fontSize = 60; // Matching neonText.js default fontSize (line 200)

    // Create a canvas for measuring text (matching neonText.js line 657-659)
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${fontSize}px ${fontFamily}`;

    // Function to get text metrics (matching neonText.js line 662-673)
    function getTextMetrics(text) {
        context.font = `${fontSize}px ${fontFamily}`;
        const metrics = context.measureText(text);
        return {
            width: metrics.width,
            ascent: metrics.actualBoundingBoxAscent || fontSize * 0.8,
            descent: metrics.actualBoundingBoxDescent || fontSize * 0.2,
        };
    }

    const extraSpacing = 3; // Matching neonText.js line 683

    // Calculate text positions and dimensions (matching neonText.js line 686-713)
    const maxX = [];
    const minX = [];
    const maxY = [];
    const minY = [];
    let currentY = 0;

    lines.forEach((line) => {
        const { width: lineWidth, ascent, descent } = getTextMetrics(line);
        const xPos = 0; // Centered position doesn't affect width calculation
        const yPos = currentY + ascent;

        maxX.push(xPos + lineWidth);
        minX.push(xPos);
        maxY.push(yPos + descent);
        minY.push(currentY);

        currentY += ascent + descent + extraSpacing; // Matching neonText.js line 710
    });

    // Calculate pixel dimensions (matching neonText.js line 818-819)
    const maxWidth = Math.max(...maxX) - Math.min(...minX);
    const totalCalculatedHeight = Math.max(...maxY) - Math.min(...minY);

    // Calculate max characters (matching neonText.js line 821-825)
    let maxCharacters = 0;
    lines.forEach((line) => {
        maxCharacters = Math.max(maxCharacters, line.length);
    });

    // Calculate width in inches (matching neonText.js line 824)
    const maxWidthInches = maxCharacters * 2.5; // NO minimum, exactly as neonText.js

    // Calculate aspect ratio and height in inches (matching neonText.js line 827-828)
    const aspectRatio = maxWidth / totalCalculatedHeight;
    const maxHeightInches = maxWidthInches / aspectRatio; // NO minimum, exactly as neonText.js

    // Safety check for invalid values
    const finalWidth = Math.round(maxWidthInches) || 23;
    const finalHeight = Math.round(maxHeightInches) || 10;

    return {
        widthInches: isFinite(finalWidth) ? finalWidth : 23,
        heightInches: isFinite(finalHeight) ? finalHeight : 10
    };
}

function regenerateSizeCards(baseWidth, baseHeight) {
    const sizeGrid = document.getElementById('sizeGrid');
    if (!sizeGrid) return;

    const sizeConfigs = [
        { id: 'mini', name: 'Mini', scale: 1.0, fontsize: 44 },
        { id: 'small', name: 'Small', scale: 1.3, fontsize: 46 },
        { id: 'medium', name: 'Medium', scale: 1.69, fontsize: 48 },
        { id: 'large', name: 'Large', scale: 2.197, fontsize: 50 },
        { id: 'xl', name: 'XL', scale: 2.8561, fontsize: 54 },
        { id: 'xxl', name: 'XXL', scale: 3.71293, fontsize: 56 },
        { id: 'xxxl', name: 'XXXL', scale: 4.826809, fontsize: 60 },
        { id: '4xl', name: '4XL', scale: 6.274852, fontsize: 64 }
    ];

    // Update minimum dimensions based on mini size (first config)
    const miniConfig = sizeConfigs[0];
    MINIMUM_WIDTH = Math.round(baseWidth * miniConfig.scale);
    MINIMUM_HEIGHT = Math.round(baseHeight * miniConfig.scale);

    // Update custom input min attributes
    const customWidth = document.getElementById('customWidth');
    const customHeight = document.getElementById('customHeight');
    if (customWidth) {
        customWidth.min = MINIMUM_WIDTH;
        // Ensure current value is not below new minimum
        if (parseInt(customWidth.value) < MINIMUM_WIDTH) {
            customWidth.value = MINIMUM_WIDTH;
        }
    }
    if (customHeight) {
        customHeight.min = MINIMUM_HEIGHT;
        // Ensure current value is not below new minimum
        if (parseInt(customHeight.value) < MINIMUM_HEIGHT) {
            customHeight.value = MINIMUM_HEIGHT;
        }
    }

    // Update the custom size note to show current minimum width
    const customSizeNote = document.querySelector('.custom-size-note');
    if (customSizeNote) {
        customSizeNote.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5" />
                <path d="M7 3.5V7.5M7 10H7.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            Aspect ratio is locked to maintain proportions. Minimum width: ${MINIMUM_WIDTH} inches, Minimum height: ${MINIMUM_HEIGHT} inches. Custom sizes are calculated based on the LED neon required.
        `;
    }

    const currentActiveCard = document.querySelector('.size-card.active');
    const currentActiveSize = currentActiveCard ? currentActiveCard.getAttribute('data-size') : 'mini';

    sizeGrid.innerHTML = '';

    sizeConfigs.forEach((config, index) => {
        const scaledWidth = Math.round(baseWidth * config.scale);
        const scaledHeight = Math.round(baseHeight * config.scale);
        const price = calculatePlanPrice(scaledWidth, scaledHeight);

        let totalPrice = price;
        totalPrice += appState.outdoorSurcharge;
        totalPrice += appState.rgbSurcharge;
        totalPrice += appState.cutToPrice;
        appState.extras.forEach(extra => {
            totalPrice += extra.price;
        });
        totalPrice = Math.floor(totalPrice) + 0.99;

        let discountedPrice = CONFIG.enableBaseDiscount ?
            totalPrice * (1 - CONFIG.basePromotionPercentage) :
            totalPrice;

        if (appState.discountApplied && appState.activeDiscount) {
            if (appState.activeDiscount.type === 'percentage') {
                discountedPrice *= (1 - appState.activeDiscount.value / 100);
            } else if (appState.activeDiscount.type === 'amount') {
                discountedPrice -= appState.activeDiscount.value;
            }
        }

        discountedPrice = Math.max(discountedPrice, 0);
        discountedPrice = Math.floor(discountedPrice) + 0.99;

        const card = document.createElement('div');
        card.className = `size-card ${config.id === currentActiveSize ? 'active' : ''}`;
        card.setAttribute('data-size', config.id);
        card.setAttribute('data-width', scaledWidth);
        card.setAttribute('data-height', scaledHeight);
        card.setAttribute('data-fontsize', config.fontsize);
        card.setAttribute('data-original', totalPrice.toFixed(2));
        card.setAttribute('data-price', discountedPrice.toFixed(2));

        card.innerHTML = `
            <div class="size-visual">
                <div class="size-rect"></div>
                <svg class="checkmark" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10L8 14L16 6" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <div class="size-info">
                <div class="size-name">${config.name}</div>
                <div class="size-dimensions">${scaledWidth}"x${scaledHeight}"</div>
                <div class="size-pricing">
                    <span class="original-price" style="${!CONFIG.enableBaseDiscount ? 'display: none;' : ''}">$${totalPrice.toFixed(2)}</span>
                    <span class="sale-price">$${discountedPrice.toFixed(2)}</span>
                </div>
            </div>
        `;

        sizeGrid.appendChild(card);

        if (config.id === currentActiveSize) {
            appState.plan.widthIn = scaledWidth;
            appState.plan.heightIn = scaledHeight;
            appState.plan.name = config.name;
            appState.plan.id = config.id;
            appState.fontSizePx = config.fontsize;
        }
    });

    document.querySelectorAll('.size-card').forEach(card => {
        card.addEventListener('click', () => {
            selectPlan(card);
        });
    });
}


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




function attachFontListeners() {
    document.querySelectorAll('.font-card').forEach(card => {
        card.addEventListener('click', () => {
            const fontKey = card.getAttribute('data-font');
            const fontFamily = card.getAttribute('data-family');
            selectFont(fontKey, fontFamily);
        });
    });

    document.querySelectorAll('.font-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const fontKey = item.getAttribute('data-font');
            const fontFamily = item.getAttribute('data-family');
            selectFont(fontKey, fontFamily);

            const content = document.getElementById('fontLibraryContent');
            const trigger = document.getElementById('fontLibraryTrigger');
            if (content) content.classList.remove('open');
            if (trigger) trigger.classList.remove('open');
        });
    });

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

    // Update line height based on the new font family
    appState.lineHeightPx = CONFIG.lineHeightMultipliers[fontFamily] || 1.2;

    document.querySelectorAll('.font-card').forEach(card => card.classList.remove('active'));
    document.querySelectorAll('.font-list-item').forEach(item => item.classList.remove('active'));

    const selectedCard = document.querySelector(`.font-card[data-font="${fontKey}"]`);
    const selectedListItem = document.querySelector(`.font-list-item[data-font="${fontKey}"]`);

    if (selectedCard) selectedCard.classList.add('active');
    if (selectedListItem) selectedListItem.classList.add('active');

    const dimensions = calculateIntelligentDimensions(appState.text);
    appState.plan.widthIn = dimensions.widthInches;
    appState.plan.heightIn = dimensions.heightInches;

    regenerateSizeCards(dimensions.widthInches, dimensions.heightInches);
    recalculatePlanPrice();

    // Ensure the font is loaded before rendering
    ensureFontLoaded(fontFamily).then(() => {
        renderAllPreviews();
        recalculateTotalPrice();
    });
}




function attachColorListeners() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const colorValue = option.getAttribute('data-color');
            const colorName = option.getAttribute('data-name');

            if (appState.multicolor && appState.selectedCharIndex !== null) {
                appState.characterColors[appState.selectedCharIndex] = colorValue;
                renderAllPreviews();
            } else {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                selectColor(colorValue, colorName);
            }
        });
    });

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

    const multiToggle = document.getElementById('multicolorToggle');
    const multiHelp = document.getElementById('multicolorHelp');

    if (multiToggle) {
        multiToggle.addEventListener('change', () => {
            if (multiToggle.checked && appState.rgbMode) {
                stopRgbMode();
                const rgbOption = document.querySelector('.color-option[data-color="rgb"]');
                if (rgbOption) {
                    rgbOption.classList.remove('active');
                }
                recalculateTotalPrice();
            }

            appState.multicolor = multiToggle.checked;

            if (!multiToggle.checked) {
                appState.characterColors = {};
                appState.selectedCharIndex = null;
                hideColorPopup();
            }

            if (multiHelp) {
                multiHelp.classList.toggle('hidden', !multiToggle.checked);
            }

            renderAllPreviews();
        });
    }
}

function selectColor(colorValue, colorName) {
    if (colorName === 'RGB Color Changing' || colorValue === 'rgb') {
        startRgbMode();
    } else {
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
    if (appState.multicolor) {
        appState.multicolor = false;
        appState.characterColors = {};
        appState.selectedCharIndex = null;
        hideColorPopup();

        const multiToggle = document.getElementById('multicolorToggle');
        if (multiToggle) {
            multiToggle.checked = false;
        }

        const multiHelp = document.getElementById('multicolorHelp');
        if (multiHelp) {
            multiHelp.classList.add('hidden');
        }
    }

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




let customSizingAspectRatio = 23 / 10;

function updateAspectRatio() {
    if (appState.plan.widthIn && appState.plan.heightIn) {
        customSizingAspectRatio = appState.plan.widthIn / appState.plan.heightIn;
    }
}

function attachPlanListeners() {
    document.querySelectorAll('.size-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mode = btn.getAttribute('data-mode');
            toggleSizeMode(mode);
        });
    });

    const customWidth = document.getElementById('customWidth');
    const customHeight = document.getElementById('customHeight');
    const customSizeError = document.getElementById('customSizeError');
    const customSizeErrorText = document.getElementById('customSizeErrorText');

    // Initial min values will be set by regenerateSizeCards
    // Ensure current values are valid
    if (customWidth) {
        customWidth.min = MINIMUM_WIDTH;
    }
    if (customHeight) {
        customHeight.min = MINIMUM_HEIGHT;
    }

    function showSizeError(message) {
        if (customSizeError && customSizeErrorText) {
            customSizeErrorText.textContent = message;
            customSizeError.classList.remove('hidden');
        }
    }

    function hideSizeError() {
        if (customSizeError) {
            customSizeError.classList.add('hidden');
        }
    }

    if (customWidth) {
        customWidth.addEventListener('input', debounce(() => {
            let width = parseInt(customWidth.value);

            // If input is empty or NaN, use minimum width
            if (!customWidth.value || isNaN(width)) {
                width = MINIMUM_WIDTH;
                customWidth.value = MINIMUM_WIDTH;
            }

            if (width < MINIMUM_WIDTH) {
                showSizeError(`The minimum possible width is ${MINIMUM_WIDTH} inches. Please enter a larger value.`);
                customWidth.value = MINIMUM_WIDTH;
                width = MINIMUM_WIDTH;
            } else {
                hideSizeError();
            }

            const height = Math.round(width / customSizingAspectRatio);
            customHeight.value = height;

            appState.plan.widthIn = width;
            appState.plan.heightIn = height;
            appState.plan.name = 'Custom';
            appState.plan.id = 'custom';

            recalculatePlanPrice();
            renderAllPreviews();
            recalculateTotalPrice();
        }, 300));
    }

    if (customHeight) {
        customHeight.addEventListener('input', debounce(() => {
            let height = parseInt(customHeight.value);

            // If input is empty or NaN, use minimum height
            if (!customHeight.value || isNaN(height)) {
                height = MINIMUM_HEIGHT;
                customHeight.value = MINIMUM_HEIGHT;
            }

            if (height < MINIMUM_HEIGHT) {
                showSizeError(`The minimum possible height is ${MINIMUM_HEIGHT} inches. Please enter a larger value.`);
                customHeight.value = MINIMUM_HEIGHT;
                height = MINIMUM_HEIGHT;
            }

            const width = Math.round(height * customSizingAspectRatio);

            if (width < MINIMUM_WIDTH) {
                showSizeError(`The minimum possible width is ${MINIMUM_WIDTH} inches based on the aspect ratio. Please enter a larger height.`);
                const minHeight = Math.round(MINIMUM_WIDTH / customSizingAspectRatio);
                customHeight.value = minHeight;
                customWidth.value = MINIMUM_WIDTH;
                appState.plan.widthIn = MINIMUM_WIDTH;
                appState.plan.heightIn = minHeight;
            } else {
                hideSizeError();
                customWidth.value = width;
                appState.plan.widthIn = width;
                appState.plan.heightIn = height;
            }

            appState.plan.name = 'Custom';
            appState.plan.id = 'custom';

            recalculatePlanPrice();
            renderAllPreviews();
            recalculateTotalPrice();
        }, 300));
    }

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
    document.querySelectorAll('.size-card').forEach(c => c.classList.remove('active'));
    cardElement.classList.add('active');

    appState.plan.id = cardElement.getAttribute('data-size');
    appState.plan.name = cardElement.querySelector('.size-name')?.textContent || 'Medium';
    appState.plan.widthIn = parseInt(cardElement.getAttribute('data-width')) || 38;
    appState.plan.heightIn = parseInt(cardElement.getAttribute('data-height')) || 17;
    appState.fontSizePx = parseFloat(cardElement.getAttribute('data-fontsize')) || 38;

    appState.plan.price = calculatePlanPrice(appState.plan.widthIn, appState.plan.heightIn);

    if (typeof updateAspectRatio === 'function') {
        updateAspectRatio();
    }

    // Update custom size inputs to match selected card
    const customWidth = document.getElementById('customWidth');
    const customHeight = document.getElementById('customHeight');
    if (customWidth) customWidth.value = appState.plan.widthIn;
    if (customHeight) customHeight.value = appState.plan.heightIn;

    renderAllPreviews();
    recalculateTotalPrice();
}

function generatePlansFromMeasurements() {
    return;
}

function generateInitialPlans() {
    return;
}

function updatePlanCardsInUI() {
    return;
}




function calculatePlanPrice(widthIn, heightIn) {
    const area = widthIn * heightIn;
    const isRGB = appState.rgbMode || appState.rgbSurcharge > 0;

    const productCostPerInch = isRGB ? CONFIG.productCostPerInchRGB : CONFIG.productCostPerInchStandard;
    const shippingCostPerInch = CONFIG.shippingCostPerInch;
    const usdToCadMultiplier = CONFIG.usdToCadMultiplier;

    const shippingCost = area * shippingCostPerInch;
    const productCost = area * productCostPerInch;
    const localShippingCostUSD = CONFIG.localShippingCostUSD;

    const profitUSD = Math.max(
        CONFIG.minProfitPercentage * (productCost + shippingCost + localShippingCostUSD),
        CONFIG.minProfitUSD
    );

    const totalCostUSD = productCost + shippingCost + profitUSD + localShippingCostUSD;
    const totalCostCADWithDiscount = totalCostUSD * usdToCadMultiplier;
    let totalCostCAD = totalCostCADWithDiscount * usdToCadMultiplier;

    if (CONFIG.premiumFontsDouble.includes(appState.fontKey.toLowerCase())) {
        totalCostCAD *= 2;
    }

    const finalPrice = Math.max(totalCostCAD, CONFIG.basePrice);
    return Math.ceil(finalPrice) - 0.01;
}

function recalculatePlanPrice() {
    appState.plan.price = calculatePlanPrice(appState.plan.widthIn, appState.plan.heightIn);
}

function recalculateTotalPrice() {
    let total = appState.plan.price;

    appState.extras.forEach(extra => {
        total += extra.price;
    });

    total += appState.outdoorSurcharge;
    total += appState.rgbSurcharge;
    total += appState.cutToPrice;

    total = Math.floor(total) + 0.99;
    appState.totalPrice = total;

    let discounted = CONFIG.enableBaseDiscount ?
        total * (1 - CONFIG.basePromotionPercentage) :
        total;

    if (appState.discountApplied && appState.activeDiscount) {
        if (appState.activeDiscount.type === 'percentage') {
            discounted *= (1 - appState.activeDiscount.value / 100);
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

    updatePricingUI();
    updateSizeCardPrices();
}

function updatePricingUI() {
    const basePercentageSpan = document.querySelector('.base-percentage');
    const discountBadge = document.querySelector('.discount-badge');
    const originalElem = document.querySelector('.original-total');
    const finalElem = document.querySelector('.final-price');

    if (originalElem) {
        if (!CONFIG.enableBaseDiscount) {
            originalElem.style.display = 'none';
        } else {
            originalElem.textContent = `$${appState.totalPrice.toFixed(2)}`;
        }
    }
    if (discountBadge) {
        if (!CONFIG.enableBaseDiscount) {
            discountBadge.style.display = 'none';
        } else {
            basePercentageSpan.textContent = `${(CONFIG.basePromotionPercentage * 100).toFixed(0)}`;
        }
    }
    if (finalElem) {
        finalElem.textContent = `$${appState.discountPrice.toFixed(2)}`;
    }

    document.querySelectorAll('.btn-next, .btn-final').forEach(btn => {
        const originalText = btn.getAttribute('data-original-text') || btn.textContent.split('$')[0].trim();
        if (!btn.getAttribute('data-original-text')) {
            btn.setAttribute('data-original-text', originalText);
        }

        const priceText = ` - $${appState.discountPrice.toFixed(2)}`;
        btn.innerHTML = btn.innerHTML.replace(/\s*-\s*\$[\d,.]+/, '');

        const svgIcon = btn.querySelector('svg');
        if (svgIcon) {
            btn.innerHTML = `${originalText}<span class="btn-price">${priceText}</span>` + svgIcon.outerHTML;
        } else {
            btn.innerHTML = `${originalText}<span class="btn-price">${priceText}</span>`;
        }
    });
}

function updateSizeCardPrices() {
    document.querySelectorAll('.size-card').forEach(card => {
        const widthIn = parseInt(card.getAttribute('data-width')) || 38;
        const heightIn = parseInt(card.getAttribute('data-height')) || 17;

        let basePrice = calculatePlanPrice(widthIn, heightIn);

        let totalPrice = basePrice;
        totalPrice += appState.outdoorSurcharge;
        totalPrice += appState.rgbSurcharge;
        totalPrice += appState.cutToPrice;
        appState.extras.forEach(extra => {
            totalPrice += extra.price;
        });

        totalPrice = Math.floor(totalPrice) + 0.99;

        let discountedPrice = CONFIG.enableBaseDiscount ?
            totalPrice * (1 - CONFIG.basePromotionPercentage) :
            totalPrice;

        if (appState.discountApplied && appState.activeDiscount) {
            if (appState.activeDiscount.type === 'percentage') {
                discountedPrice *= (1 - appState.activeDiscount.value / 100);
            } else if (appState.activeDiscount.type === 'amount') {
                discountedPrice -= appState.activeDiscount.value;
            }
        }

        discountedPrice = Math.max(discountedPrice, 0);
        discountedPrice = Math.floor(discountedPrice) + 0.99;

        const originalPriceElem = card.querySelector('.original-price');
        const salePriceElem = card.querySelector('.sale-price');

        if (originalPriceElem) {
            if (!CONFIG.enableBaseDiscount) {
                originalPriceElem.style.display = 'none';
            } else {
                originalPriceElem.textContent = `$${totalPrice.toFixed(2)}`;
            }
        }

        if (salePriceElem) {
            salePriceElem.textContent = `$${discountedPrice.toFixed(2)}`;
        }

        card.setAttribute('data-original', totalPrice.toFixed(2));
        card.setAttribute('data-price', discountedPrice.toFixed(2));
    });
    attachPlanListeners();
}




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

function attachShapeListeners() {
    document.querySelectorAll('.shape-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.shape-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            appState.cutTo = card.getAttribute('data-shape');
            appState.cutToPrice = parseFloat(card.getAttribute('data-price')) || 0;

            recalculateTotalPrice();
        });
    });

    document.querySelectorAll('input[name="backboard"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.backboard-color-option').forEach(opt => opt.classList.remove('active'));

            const parent = e.target.closest('.backboard-color-option');
            if (parent) parent.classList.add('active');

            appState.backboard = e.target.value;
        });
    });
}




function attachExtrasListeners() {

    document.querySelectorAll('input[name="hanging"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const parent = e.target.closest('.radio-option');
            document.querySelectorAll('#step4 .radio-group .radio-option').forEach(opt =>
                opt.classList.remove('active')
            );
            parent?.classList.add('active');

            const hangingType = e.target.value;
            const hangingPrice = (hangingType === 'wall' || hangingType === 'sign') ? 15 : 0;


            appState.extras = appState.extras.filter(ex => ex.id !== 'hanging');


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


    const waterproofCheck = document.getElementById('waterProof');
    if (waterproofCheck) {
        waterproofCheck.addEventListener('change', (e) => {
            const parent = e.target.closest('.checkbox-option');

            appState.extras = appState.extras.filter(ex => ex.id !== 'waterproof');

            if (e.target.checked) {
                appState.extras.push({
                    id: 'waterproof',
                    description: 'Waterproof protection',
                    price: 30
                });
                if (parent) parent.classList.add('active');
            } else {
                if (parent) parent.classList.remove('active');
            }

            recalculateTotalPrice();
        });
    }


    const remoteDimmerCheck = document.getElementById('remoteDimmer');
    if (remoteDimmerCheck) {
        remoteDimmerCheck.addEventListener('change', (e) => {
            const parent = e.target.closest('.checkbox-option');


            appState.extras = appState.extras.filter(ex => ex.id !== 'remote');

            if (e.target.checked) {
                appState.extras.push({
                    id: 'remote',
                    description: 'Remote and Dimmer',
                    price: 0
                });
                if (parent) parent.classList.add('active');
            } else {
                if (parent) parent.classList.remove('active');
            }
        });
    }


    document.querySelectorAll('input[name="power"]').forEach(radio => {
        radio.addEventListener('change', (e) => {

            document.querySelectorAll('.radio-pill').forEach(pill => pill.classList.remove('active'));


            const parent = e.target.closest('.radio-pill');
            if (parent) parent.classList.add('active');


            appState.powerAdapter = e.target.value;
        });
    });
}




function attachDiscountListeners() {
    const applyBtn = document.querySelector('.apply-btn');
    const discountInput = document.getElementById('discountCode');

    if (applyBtn && discountInput) {
        applyBtn.addEventListener('click', () => {
            const code = discountInput.value.trim();

            if (!code) {
                return;
            }

            if (appState.discountApplied) {

                removeDiscount();
                applyBtn.textContent = 'Apply';
                discountInput.value = '';
            } else {

                validateAndApplyDiscount(code);
            }
        });

        // Allow pressing Enter to apply discount
        discountInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyBtn.click();
            }
        });
    }
}

async function validateAndApplyDiscount(code) {
    const applyBtn = document.querySelector('.apply-btn');
    const discountInput = document.getElementById('discountCode');

    // Disable button during validation
    if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.textContent = 'Validating...';
    }

    try {
        // First, check local coupon codes
        const upperCode = code.toUpperCase();
        if (CONFIG.localCoupons[upperCode]) {
            const discount = CONFIG.localCoupons[upperCode];
            applyDiscount(discount, upperCode);

            if (applyBtn) {
                applyBtn.textContent = 'Remove';
                applyBtn.disabled = false;
            }

            // Show success message
            showDiscountMessage(`Coupon "${upperCode}" applied successfully!`, 'success');
            return;
        }

        // If not found locally, try API validation
        const response = await fetch(CONFIG.couponApiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: code,
                totalAmount: appState.totalPrice
            })
        });

        if (response.ok) {
            const data = await response.json();

            if (data.valid && data.discount) {
                applyDiscount(data.discount, code);

                if (applyBtn) {
                    applyBtn.textContent = 'Remove';
                }

                showDiscountMessage(`Coupon "${code}" applied successfully!`, 'success');
            } else {
                showDiscountMessage(data.message || 'Invalid coupon code', 'error');
            }
        } else {
            showDiscountMessage('Unable to validate coupon. Please try again.', 'error');
        }
    } catch (error) {
        console.warn('API validation failed, falling back to local validation only:', error);
        showDiscountMessage('Invalid coupon code', 'error');
    } finally {
        if (applyBtn && !appState.discountApplied) {
            applyBtn.disabled = false;
            applyBtn.textContent = 'Apply';
        }
    }
}

function applyDiscount(discount, code) {
    appState.discountApplied = true;
    appState.activeDiscount = discount;
    appState.discountCode = code;
    recalculateTotalPrice();
}

function removeDiscount() {
    appState.discountApplied = false;
    appState.activeDiscount = null;
    appState.discountCode = null;

    // Hide any discount messages
    const messageEl = document.querySelector('.discount-message');
    if (messageEl) {
        messageEl.remove();
    }

    recalculateTotalPrice();
}

function showDiscountMessage(message, type = 'info') {
    // Remove existing message
    const existingMessage = document.querySelector('.discount-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const discountSection = document.querySelector('.discount-code-section');
    if (!discountSection) return;

    const messageEl = document.createElement('div');
    messageEl.className = `discount-message discount-message-${type}`;
    messageEl.textContent = message;

    discountSection.insertAdjacentElement('afterend', messageEl);
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}




function attachCheckoutListener() {
    const checkoutBtn = document.querySelector('.btn-final');

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            showPreviewModal();
        });
    }
}

async function showPreviewModal() {
    // Ensure all canvases have current content rendered
    renderAllPreviews();

    // Wait for the canvas to finish rendering including filters
    await new Promise(resolve => requestAnimationFrame(() =>
        requestAnimationFrame(() =>
            setTimeout(resolve, 100)
        )
    ));

    const previewImage = await capturePreviewSnapshot();


    const overlay = document.createElement('div');
    overlay.className = 'preview-modal-overlay';
    overlay.id = 'previewModalOverlay';


    const modal = document.createElement('div');
    modal.className = 'preview-modal';


    const featuresSummary = generateFeaturesSummary();

    modal.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">Order Summary</h2>
            <button class="modal-close-btn" onclick="closePreviewModal()">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>

        <div class="modal-body">
            <div class="preview-section">
                <img src="${previewImage}" alt="Neon Sign Preview" class="preview-snapshot" />
            </div>

            <div class="features-section">
                <h3 class="section-title">Selected Features</h3>
                <div class="features-grid">
                    ${featuresSummary}
                </div>
            </div>

            <div class="price-breakdown">
                <div class="price-row">
                    <span class="price-label">Base Price (${appState.plan.name} - ${appState.plan.widthIn}" × ${appState.plan.heightIn}")</span>
                    <span class="price-value">$${appState.plan.price.toFixed(2)}</span>
                </div>
                ${appState.cutToPrice > 0 ? `
                <div class="price-row">
                    <span class="price-label">Shape Option (${formatShapeName(appState.cutTo)})</span>
                    <span class="price-value">+$${appState.cutToPrice.toFixed(2)}</span>
                </div>
                ` : ''}
                ${appState.outdoorSurcharge > 0 ? `
                <div class="price-row">
                    <span class="price-label">Outdoor Protection</span>
                    <span class="price-value">+$${appState.outdoorSurcharge.toFixed(2)}</span>
                </div>
                ` : ''}
                ${appState.rgbSurcharge > 0 ? `
                <div class="price-row">
                    <span class="price-label">RGB Color Changing</span>
                    <span class="price-value">+$${appState.rgbSurcharge.toFixed(2)}</span>
                </div>
                ` : ''}
                ${appState.extras.filter(e => e.price > 0).map(extra => `
                <div class="price-row">
                    <span class="price-label">${extra.description}</span>
                    <span class="price-value">+$${extra.price.toFixed(2)}</span>
                </div>
                `).join('')}
                <div class="price-row subtotal">
                    <span class="price-label">Subtotal</span>
                    <span class="price-value">$${appState.totalPrice.toFixed(2)}</span>
                </div>
                ${CONFIG.enableBaseDiscount ? `
                <div class="price-row discount">
                    <span class="price-label">Base Discount (${(CONFIG.basePromotionPercentage * 100)}%)</span>
                    <span class="price-value discount-value">-$${(appState.totalPrice * CONFIG.basePromotionPercentage).toFixed(2)}</span>
                </div>
                ` : ''}
                ${appState.discountApplied && appState.activeDiscount ? `
                <div class="price-row discount">
                    <span class="price-label">Coupon (${appState.discountCode})
                        ${appState.activeDiscount.type === 'percentage' ?
                `${appState.activeDiscount.value}%` :
                `$${appState.activeDiscount.value}`} off
                    </span>
                    <span class="price-value discount-value">
                        ${appState.activeDiscount.type === 'percentage' ?
                `-$${((CONFIG.enableBaseDiscount ? appState.totalPrice * (1 - CONFIG.basePromotionPercentage) : appState.totalPrice) * appState.activeDiscount.value / 100).toFixed(2)}` :
                `-$${appState.activeDiscount.value.toFixed(2)}`}
                    </span>
                </div>
                ` : ''}
                <div class="price-row total">
                    <span class="price-label">Total</span>
                    <span class="price-value">$${appState.discountPrice.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button class="modal-btn modal-btn-secondary" onclick="closePreviewModal()">
                Continue Editing
            </button>
            <button class="modal-btn modal-btn-primary" onclick="proceedToCheckout()">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6 2L3 6V18C3 18.5304 3.21071 19.0391 3.58579 19.4142C3.96086 19.7893 4.46957 20 5 20H15C15.5304 20 16.0391 19.7893 16.4142 19.4142C16.7893 19.0391 17 18.5304 17 18V6L14 2H6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 6H17M13 10C13 11.0609 12.5786 12.0783 11.8284 12.8284C11.0783 13.5786 10.0609 14 9 14C7.93913 14 6.92172 13.5786 6.17157 12.8284C5.42143 12.0783 5 11.0609 5 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Buy Now
            </button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);


    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closePreviewModal();
        }
    });


    document.body.style.overflow = 'hidden';


    window.closePreviewModal = closePreviewModal;
    window.proceedToCheckout = proceedToCheckout;
}

function closePreviewModal() {
    const overlay = document.getElementById('previewModalOverlay');
    if (overlay) {
        overlay.remove();
    }
    document.body.style.overflow = '';
}

function proceedToCheckout() {
    // Placeholder for checkout functionality
    alert('Proceeding to checkout...');
}

// Throttle mechanism to prevent excessive render calls
let renderPending = false;
let renderTimeout = null;

// Render all previews across all steps
function renderAllPreviews() {
    // Cancel any pending render
    if (renderTimeout) {
        clearTimeout(renderTimeout);
    }

    // If a render is already scheduled, don't schedule another
    if (renderPending) {
        return;
    }

    renderPending = true;

    // Use requestAnimationFrame for optimal rendering timing
    requestAnimationFrame(() => {
        Object.keys(canvasInstances).forEach(canvasId => {
            const canvas = canvasInstances[canvasId];
            if (canvas) {
                renderCanvasPreview(canvas);
            }
        });
        renderPending = false;
    });
}



function createNeonShadow(color) {
    return new fabric.Shadow({
        color: color,
        blur: 40,
        offsetX: 0,
        offsetY: 0
    });
}

// Step navigation
function attachStepNavigationListeners() {
    // Step tabs
    document.querySelectorAll('.step-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const stepNum = parseInt(tab.getAttribute('data-step'));
            goToStep(stepNum);
        });
    });

    // Mobile toggle buttons
    document.querySelectorAll('.mobile-toggle-btn').forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            const stepContainer = btn.closest('.step-container');
            if (stepContainer) {
                stepContainer.classList.toggle('mobile-preview-open');
            }
        });
    });
}

function goToStep(stepNum) {
    // Hide all steps
    document.querySelectorAll('.step-container').forEach(container => {
        container.classList.remove('active');
    });

    // Show target step
    const targetStep = document.getElementById(`step${stepNum}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }

    // Update step tabs
    document.querySelectorAll('.step-tab').forEach(tab => {
        const tabStep = parseInt(tab.getAttribute('data-step'));
        tab.classList.remove('active', 'completed');

        if (tabStep === stepNum) {
            tab.classList.add('active');
        } else if (tabStep < stepNum) {
            tab.classList.add('completed');
        }
    });

    appState.currentStep = stepNum;
}

// Preview controls
function attachPreviewControlListeners() {
    // Neon toggle switches
    document.querySelectorAll('[id^="neonToggle"]').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            appState.neonGlowEnabled = e.target.checked;
            toggle.nextElementSibling.textContent = e.target.checked ? 'ON' : 'OFF';
            renderAllPreviews();
        });
    });

    // Theme mode toggles
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            const group = btn.closest('.theme-mode-toggle');

            group.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            appState.themeMode = mode;

            // Update background images
            document.querySelectorAll('.background-image-wrapper').forEach(wrapper => {
                if (mode === 'dark') {
                    wrapper.style.opacity = '1';
                } else {
                    wrapper.style.opacity = '0.3';
                }
            });
        });
    });

    // Save preview buttons
    document.querySelectorAll('[id^="saveBtn"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const stepNum = btn.id.replace('saveBtn', '') || '1';
            const canvasId = stepNum === '1' ? 'neonCanvas' : `neonCanvas${stepNum}`;
            const canvas = canvasInstances[canvasId];

            if (canvas) {
                const dataURL = canvas.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: 2
                });

                const link = document.createElement('a');
                link.download = `neon-preview-${Date.now()}.png`;
                link.href = dataURL;
                link.click();
            }
        });
    });

}

// Capture preview snapshot
async function capturePreviewSnapshot() {
    const canvas = canvasInstances['neonCanvas4'] || canvasInstances['neonCanvas'];
    if (!canvas) return '';

    // Force another render to ensure all filters are applied
    canvas.renderAll();

    // Wait for filters to be fully applied
    await new Promise(resolve => requestAnimationFrame(() =>
        requestAnimationFrame(() =>
            setTimeout(resolve, 50)
        )
    ));

    const objects = canvas.getObjects();
    if (objects.length === 0) {
        return canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        });
    }

    // Calculate bounding box of all objects (text + measurements)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    objects.forEach(obj => {
        const bounds = obj.getBoundingRect();
        minX = Math.min(minX, bounds.left);
        minY = Math.min(minY, bounds.top);
        maxX = Math.max(maxX, bounds.left + bounds.width);
        maxY = Math.max(maxY, bounds.top + bounds.height);
    });

    // Add padding around the content (60px on each side to accommodate blur of 40px)
    const padding = 60;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);

    const width = maxX - minX;
    const height = maxY - minY;

    // Create a temporary canvas to hold the cropped image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Set temp canvas size to the cropped dimensions (2x for better quality)
    const multiplier = 2;
    tempCanvas.width = width * multiplier;
    tempCanvas.height = height * multiplier;

    // Get the current canvas as image data
    const canvasElement = canvas.getElement();

    // Draw the cropped portion onto the temp canvas
    // Source: crop from original canvas
    // Destination: draw at 0,0 on temp canvas, scaled up by multiplier
    tempCtx.drawImage(
        canvasElement,
        minX, minY, width, height,  // Source rectangle (crop region)
        0, 0, width * multiplier, height * multiplier // Destination rectangle (scaled)
    );

    // Return the cropped image as data URL
    return tempCanvas.toDataURL('image/png', 1.0);
}
// Generate features summary for modal
function generateFeaturesSummary() {
    const features = [];

    features.push(`
        <div class="feature-item">
            <span class="feature-label">Text:</span>
            <span class="feature-value">${appState.text || 'Your Text'}</span>
        </div>
    `);

    features.push(`
        <div class="feature-item">
            <span class="feature-label">Font:</span>
            <span class="feature-value">${appState.fontFamily}</span>
        </div>
    `);

    features.push(`
        <div class="feature-item">
            <span class="feature-label">Color:</span>
            <span class="feature-value">${appState.colorName}</span>
        </div>
    `);

    features.push(`
        <div class="feature-item">
            <span class="feature-label">Size:</span>
            <span class="feature-value">${appState.plan.name} (${appState.plan.widthIn}" × ${appState.plan.heightIn}")</span>
        </div>
    `);

    features.push(`
        <div class="feature-item">
            <span class="feature-label">Location:</span>
            <span class="feature-value">${appState.type.charAt(0).toUpperCase() + appState.type.slice(1)}</span>
        </div>
    `);

    features.push(`
        <div class="feature-item">
            <span class="feature-label">Shape:</span>
            <span class="feature-value">${formatShapeName(appState.cutTo)}</span>
        </div>
    `);

    features.push(`
        <div class="feature-item">
            <span class="feature-label">Backboard:</span>
            <span class="feature-value">${formatBackboardName(appState.backboard)}</span>
        </div>
    `);

    return features.join('');
}

function formatShapeName(shape) {
    const names = {
        'cut-to-shape': 'Cut to Shape',
        'cut-to-letter': 'Cut to Letter',
        'cut-rectangle': 'Cut Rectangle',
        'cut-to-cirlce': 'Cut to Circle'
    };
    return names[shape] || shape;
}

function formatBackboardName(backboard) {
    const names = {
        'clear': 'Standard Clear Acrylic',
        'glossy-white': 'Glossy White Acrylic',
        'glossy-black': 'Glossy Black Acrylic',
        'silver': 'Silver Acrylic',
        'gold': 'Gold Acrylic'
    };
    return names[backboard] || backboard;
}

function generateFeaturesSummary() {
    const features = [
        {
            label: 'Text',
            value: appState.text || 'Your Text'
        },
        {
            label: 'Font',
            value: formatFontName(appState.fontKey)
        },
        {
            label: 'Color',
            value: appState.colorName
        },
        {
            label: 'Size',
            value: `${appState.plan.name} (${appState.plan.widthIn}" × ${appState.plan.heightIn}")`
        },
        {
            label: 'Location',
            value: appState.type === 'indoor' ? 'Indoor' : 'Outdoor'
        },
        {
            label: 'Shape',
            value: formatShapeName(appState.cutTo)
        },
        {
            label: 'Backboard',
            value: formatBackboardName(appState.backboard)
        },
        {
            label: 'Power Adapter',
            value: formatPowerAdapter(appState.powerAdapter || 'usa')
        }
    ];


    if (appState.extras.length > 0) {
        appState.extras.forEach(extra => {
            features.push({
                label: 'Extra',
                value: extra.description
            });
        });
    }

    return features.map(feature => `
        <div class="feature-item">
            <div class="feature-label">${feature.label}</div>
            <div class="feature-value">${feature.value}</div>
        </div>
    `).join('');
}

function formatFontName(fontKey) {
    return fontKey
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatShapeName(shape) {
    const shapeNames = {
        'cut-to-shape': 'Cut to Shape',
        'cut-to-letter': 'Cut to Letter',
        'cut-rectangle': 'Rectangle',
        'cut-to-cirlce': 'Open Box'
    };
    return shapeNames[shape] || shape;
}

function formatBackboardName(backboard) {
    const backboardNames = {
        'clear': 'Standard Clear Acrylic',
        'glossy-white': 'Glossy White Acrylic',
        'glossy-black': 'Glossy Black Acrylic',
        'silver': 'Silver Acrylic',
        'gold': 'Gold Acrylic'
    };
    return backboardNames[backboard] || backboard;
}

function formatPowerAdapter(adapter) {
    const adapterNames = {
        'usa': 'USA / Canada (120V)',
        'uk': 'UK / Ireland (230V)',
        'europe': 'Europe (230V)',
        'australia': 'Australia / NZ (230V)',
        'japan': 'Japan (100V)',
        'other': 'Other'
    };
    return adapterNames[adapter] || adapter;
}

function proceedToCheckout() {
    closePreviewModal();
    const btn = document.querySelector('.btn-final');
    const mobileBtn = document.getElementById('mobileNextBtn');

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Processing...';
    }

    if (mobileBtn && appState.currentStep === 4) {
        mobileBtn.disabled = true;
        mobileBtn.textContent = 'Processing...';
    }


    captureSvgMarkup();


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
        powerAdapter: appState.powerAdapter || 'usa',
        totalPrice: appState.totalPrice,
        discountPrice: appState.discountPrice,
        discountCode: appState.discountCode,
        svgMarkup: appState.svgMarkup,
        svgWidthPx: appState.svgWidthPx,
        svgHeightPx: appState.svgHeightPx
    };


    console.log('BACKEND CALL REQUIRED: Create checkout', payload);

    alert('Backend integration required for checkout.\n\nEndpoint: POST https://apiv2.easyneonsigns.ca/create-draft-order\n\nCheck console for payload.');



    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Preview & Buy';
    }

    if (mobileBtn && appState.currentStep === 4) {
        mobileBtn.disabled = false;
        mobileBtn.textContent = 'Preview & Buy';
    }
}

function captureSvgMarkup() {

    const canvas = canvasInstances['neonCanvas4'] || canvasInstances['neonCanvas'];

    if (canvas) {
        appState.svgMarkup = canvas.toSVG();
        appState.svgWidthPx = canvas.width;
        appState.svgHeightPx = canvas.height;
    }
}

function attachStepNavigationListeners() {
    document.querySelectorAll('.step-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            const step = parseInt(tab.getAttribute('data-step'));
            navigateToStep(step);
        });
    });


    window.goToStep = navigateToStep;


    setupMobilePanelToggle();


    document.querySelectorAll('.preview-eye-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showPreviewModal();
        });
    });
}

function setupMobilePanelToggle() {
    const isMobile = () => window.innerWidth < 1200;


    for (let i = 1; i <= 4; i++) {
        const toggleBtn = document.getElementById(`mobileToggle${i === 1 ? '' : i}`);
        const handle = document.getElementById(`mobilePanelHandle${i === 1 ? '' : i}`);
        const stepContainer = document.getElementById(`step${i}`);

        if (!stepContainer) continue;
        const leftPanel = stepContainer.querySelector('.left-panel');
        const contentSection = leftPanel.querySelector('.content-section');

        if (toggleBtn && leftPanel && isMobile()) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                leftPanel.classList.toggle('expanded');
            });
        }


        if (handle && leftPanel && isMobile()) {
            let startY = 0;
            let currentY = 0;
            let isDragging = false;

            handle.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                isDragging = false;
            }, { passive: true });

            handle.addEventListener('touchmove', (e) => {
                currentY = e.touches[0].clientY;
                const diff = Math.abs(currentY - startY);
                if (diff > 10) {
                    isDragging = true;
                }
            }, { passive: true });

            handle.addEventListener('touchend', (e) => {
                if (!isDragging) {

                    leftPanel.classList.toggle('expanded');
                } else {

                    const diff = currentY - startY;
                    if (Math.abs(diff) > 50) {
                        if (diff > 0) {

                            leftPanel.classList.remove('expanded');
                        } else {

                            leftPanel.classList.add('expanded');
                        }
                    }
                }
                isDragging = false;
            }, { passive: true });


            handle.addEventListener('click', () => {
                if (isMobile()) {
                    leftPanel.classList.toggle('expanded');
                }
            });
        }

        // Add swipe gesture detection on left-panel
        if (leftPanel) {
            let touchStartY = 0;
            let touchStartX = 0;
            let touchEndY = 0;
            let touchEndX = 0;
            let isSwiping = false;

            leftPanel.addEventListener('touchstart', (e) => {
                if (!isMobile()) return;
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
                isSwiping = false;
            }, { passive: true });

            leftPanel.addEventListener('touchmove', (e) => {
                if (!isMobile()) return;
                touchEndY = e.touches[0].clientY;
                touchEndX = e.touches[0].clientX;
                const diffY = Math.abs(touchEndY - touchStartY);
                const diffX = Math.abs(touchEndX - touchStartX);
                // Only consider it a swipe if vertical movement is greater than horizontal
                if (diffY > 30 && diffY > diffX) {
                    isSwiping = true;
                }
            }, { passive: true });

            leftPanel.addEventListener('touchend', (e) => {
                if (!isMobile() || !isSwiping) {
                    isSwiping = false;
                    return;
                }

                const verticalDiff = touchStartY - touchEndY;
                const isExpanded = leftPanel.classList.contains('expanded');
                const scrollTop = contentSection ? contentSection.scrollTop : 0;

                // Swipe up (vertical diff > 0) - expand when collapsed
                if (verticalDiff > 50 && !isExpanded) {
                    leftPanel.classList.add('expanded');
                }
                // Swipe down (vertical diff < 0) - collapse when expanded and at top
                else if (verticalDiff < -300 && isExpanded && scrollTop === 0) {
                    leftPanel.classList.remove('expanded');
                }

                isSwiping = false;
            }, { passive: true });
        }
    }

    // Add click listeners to step tabs to preserve expanded state
    document.querySelectorAll('.step-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (!isMobile()) return;
    
            // Expand ALL left panels immediately
            document.querySelectorAll('.left-panel').forEach(leftPanel => {
                leftPanel.classList.add('expanded');
            });
    
            const stepNum = parseInt(tab.getAttribute('data-step'));
            const stepContainer = document.getElementById(`step${stepNum}`);
            
        });
    });

    window.addEventListener('resize', () => {
        if (!isMobile()) {
            document.querySelectorAll('.left-panel').forEach(panel => {
                panel.classList.remove('expanded');
            });
        }
    });
}

function navigateToStep(stepNumber) {

    document.querySelectorAll('.step-container').forEach(container => {
        container.classList.remove('active');
    });


    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.classList.add('active');
    }

    appState.currentStep = stepNumber;
    updateStepTabsUI();
    hideColorPopup();
    renderAllPreviews();


    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        const leftPanel = targetStep.querySelector('.left-panel');
        if (leftPanel && leftPanel.classList.contains('expanded')) {

        } else if (leftPanel) {


        }
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

function attachPreviewControlListeners() {
    for (let step = 1; step <= 4; step++) {
        const container = document.getElementById(`step${step}`);
        if (!container) continue;


        const neonToggle = container.querySelector(`#neonToggle${step === 1 ? '' : step}`);
        if (neonToggle) {
            neonToggle.addEventListener('change', (e) => {
                appState.neonGlowEnabled = e.target.checked;
                renderAllPreviews();
            });
        }


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

    const objects = canvas.getObjects();
    let dataURL;

    if (objects.length === 0) {
        dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        });
    } else {
        // Calculate bounding box of all objects (text + measurements)
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        objects.forEach(obj => {
            const bounds = obj.getBoundingRect();
            minX = Math.min(minX, bounds.left);
            minY = Math.min(minY, bounds.top);
            maxX = Math.max(maxX, bounds.left + bounds.width);
            maxY = Math.max(maxY, bounds.top + bounds.height);
        });

        // Add padding around the content (60px on each side to accommodate blur of 40px)
        const padding = 60;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(canvas.width, maxX + padding);
        maxY = Math.min(canvas.height, maxY + padding);

        const width = maxX - minX;
        const height = maxY - minY;

        // Create a temporary canvas to hold the cropped image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        // Set temp canvas size to the cropped dimensions
        tempCanvas.width = width * 2; // 2x for better quality
        tempCanvas.height = height * 2;

        // Get the current canvas as image data
        const canvasElement = canvas.getElement();

        // Draw the cropped portion onto the temp canvas
        tempCtx.drawImage(
            canvasElement,
            minX, minY, width, height,  // Source rectangle
            0, 0, width * 2, height * 2 // Destination rectangle (2x size)
        );

        dataURL = tempCanvas.toDataURL('image/png', 1.0);
    }

    const link = document.createElement('a');
    link.download = `neon-sign-preview-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
}

function renderCanvasPreview(canvas) {
    if (!canvas) return;

    canvas.clear();

    // Reset viewport transform to ensure canvas is properly centered after refresh
    canvas.viewportTransform = [1, 0, 0, 1, 0, 0];

    const displayText = appState.text || CONFIG.defaultPlaceholderText;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const isMobile = window.innerWidth < CONFIG.mobileBreakpoint;

    // Calculate proportional font size based on plan dimensions
    const planWidth = appState.plan.widthIn || 23;
    const planHeight = appState.plan.heightIn || 10;
    const baseFontSize = appState.fontSizePx;

    // Scale font size proportionally with plan size (relative to MINI: 23x10)
    const sizeRatio = Math.sqrt((planWidth * planHeight) / (23 * 10));
    let renderingFontSize = baseFontSize * sizeRatio;

    if (isMobile) {
        renderingFontSize = renderingFontSize * 2.3;
    }

    // Create a temporary text object to measure dimensions
    const tempText = new fabric.Text(displayText, {
        fontFamily: appState.fontFamily,
        fontSize: renderingFontSize,
        textAlign: 'center'
    });

    // Check if text with measurements would exceed canvas bounds
    // Increase space to ensure measurements never overlap text
    const MEASUREMENT_SPACE = isMobile ? 250 : 350; // Increased space for measurement rulers and labels
    const textBounds = tempText.getBoundingRect();
    const requiredWidth = textBounds.width + MEASUREMENT_SPACE;
    const requiredHeight = textBounds.height + MEASUREMENT_SPACE;

    // Calculate scale factor to fit content within canvas
    // Use conservative scaling (0.75) to ensure everything fits with padding
    let scaleFactor = 1;
    if (requiredWidth > canvas.width * 0.75 || requiredHeight > canvas.height * 0.75) {
        const widthScale = (canvas.width * 0.75) / requiredWidth;
        const heightScale = (canvas.height * 0.75) / requiredHeight;
        scaleFactor = Math.min(widthScale, heightScale);
        renderingFontSize = renderingFontSize * scaleFactor;
    }

    if (appState.multicolor) {
        renderMulticolorText(canvas, displayText, centerX, centerY, renderingFontSize);
    } else {
        const lineHeightMultiplier = appState.lineHeightPx || 1.2;

        const textConfig = {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            textAlign: 'center',
            fontFamily: appState.fontFamily,
            fontSize: renderingFontSize,
            lineHeight: lineHeightMultiplier,
            fill: appState.colorValue,
            selectable: false,
            objectCaching: true
        };


        if (appState.neonGlowEnabled) {
            textConfig.shadow = {
                color: appState.colorValue,
                blur: 45 * scaleFactor,
                offsetX: 0,
                offsetY: 0
            };
        } else {
            textConfig.opacity = 0.3;
        }

        const textObject = new fabric.Text(displayText, textConfig);
        canvas.add(textObject);
        drawMeasurementOverlays(canvas, textObject);
    }

    // Use requestRenderAll to batch rendering and avoid forced reflow
    canvas.requestRenderAll();
}

function renderMulticolorText(canvas, text, centerX, centerY, renderingFontSize) {

    const useFontSize = renderingFontSize || appState.fontSizePx;

    // Split text into lines to preserve line breaks
    const lines = text.split('\n');

    // Create a temp text to measure overall dimensions
    const tempText = new fabric.Text(text, {
        fontFamily: appState.fontFamily,
        fontSize: useFontSize
    });

    const totalWidth = tempText.width;
    const totalHeight = tempText.height;

    // Calculate line height - multiply by font size to get actual pixel height
    const lineHeightMultiplier = appState.lineHeightPx || 1.2;
    const lineHeightPx = lineHeightMultiplier * useFontSize;

    // Calculate starting Y position to center all lines
    const totalLinesHeight = lines.length * lineHeightPx;
    let currentY = centerY - (totalLinesHeight / 2) + (lineHeightPx / 2);

    // Track character index across all lines
    let globalCharIndex = 0;

    // Collect all objects to add at once (batch operation)
    const objectsToAdd = [];

    // Process each line
    lines.forEach((line, lineIndex) => {
        // Measure the width of this line
        const tempLineText = new fabric.Text(line, {
            fontFamily: appState.fontFamily,
            fontSize: useFontSize
        });
        const lineWidth = tempLineText.width;

        // Calculate starting X position for this line
        let startX = centerX - (lineWidth / 2);

        // Render each character in this line
        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            const charColor = appState.characterColors[globalCharIndex] || appState.colorValue;
            const isSelected = appState.selectedCharIndex === globalCharIndex;

            const charConfig = {
                fontFamily: appState.fontFamily,
                fontSize: useFontSize,
                lineHeight: lineHeightMultiplier,
                fill: charColor,
                selectable: false,
                charSpacing: 0,
                objectCaching: true
            };

            if (appState.neonGlowEnabled) {
                charConfig.shadow = {
                    color: charColor,
                    blur: 45,
                    offsetX: 0,
                    offsetY: 0
                };
            } else {
                charConfig.opacity = 0.3;
            }

            if (isSelected) {
                charConfig.stroke = '#C8FF00';
                charConfig.strokeWidth = 4;
                charConfig.paintFirst = 'stroke';

                if (appState.neonGlowEnabled) {
                    charConfig.shadow = {
                        color: '#C8FF00',
                        blur: 60,
                        offsetX: 0,
                        offsetY: 0
                    };
                }
            }

            const charObj = new fabric.Text(char, charConfig);
            charObj.charIndex = globalCharIndex;

            const charWidth = charObj.width;

            charObj.set({
                left: startX + (charWidth / 2),
                top: currentY,
                originX: 'center',
                originY: 'center'
            });

            // Add to batch array instead of directly to canvas
            objectsToAdd.push(charObj);

            startX += charWidth;
            globalCharIndex++;
        }

        // Account for the newline character in the character index
        // (except for the last line)
        if (lineIndex < lines.length - 1) {
            globalCharIndex++;
        }

        // Move to next line
        currentY += lineHeightPx;
    });

    // Batch add all character objects at once for better performance
    if (objectsToAdd.length > 0) {
        canvas.add(...objectsToAdd);
    }

    // Create bounding box for measurements
    const boundingBox = {
        getBoundingRect: function () {
            return {
                left: centerX - (totalWidth / 2),
                top: centerY - (totalHeight / 2),
                width: totalWidth,
                height: totalHeight
            };
        }
    };

    drawMeasurementOverlays(canvas, boundingBox);
}

function drawMeasurementOverlays(canvas, textObject) {
    const scaleColor = appState.themeMode === 'dark'
        ? 'rgba(255, 255, 255, 0.6)'
        : 'rgba(0, 0, 0, 0.7)';

    const textColor = appState.themeMode === 'dark' ? '#000000' : '#FFFFFF';

    const bounds = textObject.getBoundingRect();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Calculate safe margins to keep rulers within canvas
    const CANVAS_MARGIN = 60; // Minimum margin from canvas edges
    const MIN_PADDING = 35; // Minimum padding from text - closer but not too close

    const sizeFactor = bounds.width / 400;
    let padding = Math.max(MIN_PADDING, Math.min(80, 50 * sizeFactor));
    const tickLength = Math.max(8, Math.min(15, 10 * sizeFactor));

    // Increase font size on mobile for better readability
    const isMobile = window.innerWidth < CONFIG.mobileBreakpoint;
    const labelFontSize = isMobile
        ? Math.max(18, Math.min(28, 20 * sizeFactor))
        : Math.max(12, Math.min(18, 14 * sizeFactor));

    // Check if text + rulers would exceed canvas bounds and scale if needed
    const textWithRulerHeight = bounds.top + bounds.height + padding + labelFontSize + 40;
    const textWithRulerWidth = bounds.left + bounds.width + padding + labelFontSize * 3 + 40;

    // If content exceeds canvas, reduce padding but ensure minimum distance
    if (textWithRulerHeight > canvas.height - CANVAS_MARGIN) {
        padding = Math.max(MIN_PADDING, canvas.height - bounds.top - bounds.height - labelFontSize - CANVAS_MARGIN - 40);
    }
    if (textWithRulerWidth > canvas.width - CANVAS_MARGIN) {
        padding = Math.max(MIN_PADDING, canvas.width - bounds.left - bounds.width - labelFontSize * 3 - CANVAS_MARGIN - 40);
    }

    // Ensure padding is never less than minimum to prevent text overlap
    padding = Math.max(MIN_PADDING, padding);

    // Horizontal measurement line (width) - positioned below text with safe distance
    // Always maintain minimum padding - never allow line to touch text
    const hLineY = bounds.top + bounds.height + padding;
    // Align measurement line closely with text bounds (minimal extension)
    const hStartX = Math.max(bounds.left, CANVAS_MARGIN);
    const hEndX = Math.min(bounds.left + bounds.width, canvas.width - CANVAS_MARGIN);

    const horizLine = new fabric.Line([hStartX, hLineY, hEndX, hLineY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false
    });
    canvas.add(horizLine);

    // Horizontal tick marks
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

    // Width label - positioned safely below the measurement line
    const widthLabelTop = Math.min(hLineY + 12, canvas.height - labelFontSize - 15);
    const widthLabel = new fabric.Text(`${appState.plan.widthIn}"`, {
        left: centerX,
        top: widthLabelTop,
        originX: 'center',
        originY: 'top',
        fontSize: labelFontSize,
        fill: textColor,
        fontFamily: "Barcelona",
        fontWeight: 700,
        selectable: false,
        backgroundColor: appState.themeMode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
        padding: 4
    });
    canvas.add(widthLabel);

    // Vertical measurement line (height) - positioned to the right of text with safe distance
    // Always maintain minimum padding - never allow line to touch text
    const vLineX = bounds.left + bounds.width + padding;
    // Align measurement line closely with text bounds (minimal extension)
    const vStartY = Math.max(bounds.top, CANVAS_MARGIN);
    const vEndY = Math.min(bounds.top + bounds.height, canvas.height - CANVAS_MARGIN);

    const vertLine = new fabric.Line([vLineX, vStartY, vLineX, vEndY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false
    });
    canvas.add(vertLine);

    // Vertical tick marks
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

    // Height label - positioned safely to the right of the measurement line
    const heightLabelLeft = Math.min(vLineX + 12, canvas.width - labelFontSize * 2.5 - 15);
    const heightLabel = new fabric.Text(`${appState.plan.heightIn}"`, {
        left: heightLabelLeft,
        top: centerY,
        originX: 'left',
        originY: 'center',
        fontSize: labelFontSize,
        fill: textColor,
        fontFamily: "Barcelona",
        fontWeight: 700,
        selectable: false,
        backgroundColor: appState.themeMode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
        padding: 4
    });
    canvas.add(heightLabel);
}

function getMeasuredDimensions() {
    // Get text and split into lines to find max line length
    const text = appState.text || CONFIG.defaultPlaceholderText;
    const lines = text.split('\n');

    // Find the longest line
    let maxCharacters = 0;
    lines.forEach(line => {
        maxCharacters = Math.max(maxCharacters, line.length);
    });

    // If no characters, use default placeholder length
    if (maxCharacters === 0) {
        maxCharacters = CONFIG.defaultPlaceholderText.length;
    }

    // Calculate base dimensions using character count (2.5 inches per character)
    // This matches the logic from referencejs.js
    const baseWidthInches = maxCharacters * 2.5;

    // Apply font size scaling factor
    // Base font size is 38px, so we scale proportionally
    const fontSizeScaleFactor = appState.fontSizePx / CONFIG.baseFontSize;
    const scaledWidth = baseWidthInches * fontSizeScaleFactor;

    // Calculate height proportionally based on aspect ratio
    // Using measured aspect ratio that considers actual text rendering
    // For multi-line text, height increases
    const lineCount = lines.length;
    const aspectRatio = 2.3; // Width to height ratio (typical for text)
    const baseHeight = scaledWidth / aspectRatio;

    // Add extra height for multi-line text
    const lineHeightFactor = lineCount > 1 ? 1 + ((lineCount - 1) * 0.15) : 1;
    const scaledHeight = baseHeight * lineHeightFactor;

    return {
        widthIn: Math.max(23, Math.round(scaledWidth)), // Minimum width of 23 inches
        heightIn: Math.max(10, Math.round(scaledHeight)) // Minimum height of 10 inches
    };
}




window.addEventListener('resize', debounce(() => {
    renderAllPreviews();
    updateMobileFooter();
}, 250));




let touchStartY = 0;
let touchCurrentY = 0;
let isDragging = false;
const DRAG_THRESHOLD = 50;

function setupMobileBottomSheet() {
    const leftPanels = document.querySelectorAll('.left-panel');
    const overlay = createMobileOverlay();
    const mobileFooter = createMobileFooter();



    overlay.addEventListener('click', () => {
        const activePanel = document.querySelector('.left-panel.expanded');
        if (activePanel) {
            collapsePanel(activePanel, overlay);
        }
    });


    updateMobileFooter();
}

function createMobileOverlay() {
    let overlay = document.getElementById('mobileOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-panel-overlay';
        overlay.id = 'mobileOverlay';
        document.body.appendChild(overlay);
    }
    return overlay;
}

function createMobileFooter() {
    let footer = document.getElementById('mobileFooter');
    if (!footer) {
        footer = document.createElement('div');
        footer.className = 'mobile-footer';
        footer.id = 'mobileFooter';
        footer.innerHTML = `
            <div class="mobile-footer-content">
                <div class="mobile-price-summary">
                    <div class="mobile-price-label">Total Price</div>
                    <div class="mobile-price-value">$${appState.discountPrice.toFixed(2)}</div>
                </div>
                <button class="mobile-action-btn" id="mobileNextBtn">
                    Next
                </button>
            </div>
        `;
        document.body.appendChild(footer);


        const mobileNextBtn = footer.querySelector('#mobileNextBtn');
        mobileNextBtn.addEventListener('click', handleMobileNavigation);
    }
    return footer;
}

function expandPanel(panel, overlay) {
    panel.classList.add('expanded');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function collapsePanel(panel, overlay) {
    panel.classList.remove('expanded');
    overlay.classList.remove('active');
    panel.style.transform = '';
    document.body.style.overflow = '';
}

function handleMobileNavigation() {
    const currentStep = appState.currentStep;
    const activePanel = document.querySelector('.left-panel.expanded');
    const overlay = document.getElementById('mobileOverlay');

    if (activePanel) {
        collapsePanel(activePanel, overlay);
    }

    if (currentStep < 4) {
        navigateToStep(currentStep + 1);
    } else {

        showPreviewModal();
    }
}

function updateMobileFooter() {
    const footer = document.getElementById('mobileFooter');
    if (!footer) return;

    const priceValue = footer.querySelector('.mobile-price-value');
    const actionBtn = footer.querySelector('#mobileNextBtn');

    if (priceValue) {
        priceValue.textContent = `$${appState.discountPrice.toFixed(2)}`;
    }

    if (actionBtn) {
        if (appState.currentStep === 4) {
            actionBtn.textContent = 'Preview & Buy';
        } else {
            actionBtn.textContent = 'Next';
        }
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMobileBottomSheet);
} else {
    setupMobileBottomSheet();
}


const originalNavigateToStep = navigateToStep;
navigateToStep = function (stepNumber) {
    // Store expanded state before navigation
    const isMobile = window.innerWidth < 1200;
    let wasExpanded = false;
    if (isMobile) {
        const currentContainer = document.querySelector('.step-container.active');
        wasExpanded = currentContainer && currentContainer.querySelector('.left-panel.expanded');
    }

    originalNavigateToStep(stepNumber);
    updateMobileFooter();

    // Preserve expanded state after navigation
    if (isMobile && wasExpanded) {
        const newActiveContainer = document.querySelector('.step-container.active');
        const newLeftPanel = newActiveContainer ? newActiveContainer.querySelector('.left-panel') : null;
        if (newLeftPanel) {
            setTimeout(() => {
                newLeftPanel.classList.add('expanded');
            }, 50);
        }
    }
};


const originalRecalculateTotalPrice = recalculateTotalPrice;
recalculateTotalPrice = function () {
    originalRecalculateTotalPrice();
    updateMobileFooter();
};
