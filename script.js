const CONFIG = {

    mobileBreakpoint: 768,
    maxMobileLinesCount: 3,
    maxDesktopLinesCount: 4,


    defaultPlaceholderText: 'Your Text',
    baseFontSize: 38,
    minFontSize: 20,
    textBoundingRatioMobile: { width: 0.8, height: 0.7 },
    textBoundingRatioDesktop: { width: 0.85, height: 0.75 },


    rgbCycleSpeed: 500,
    rgbColorSequence: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],


    // Pricing from referencejs.js
    basePrice: 90, // $90 per square inch base
    rgbSurcharge: 50,
    outdoorSurcharge: 65,

    // Base discount configuration
    enableBaseDiscount: true, // Set to false to disable default 20% discount
    basePromotionPercentage: 0.20, // 20% discount


    // Price calculation (from referencejs.js)
    productCostPerInchStandard: 0.2519,
    productCostPerInchRGB: 0.2947,
    shippingCostPerInch: 0.25,
    usdToCadMultiplier: 1.42,
    localShippingCostUSD: 45 / 1.42, // 45 CAD converted to USD
    minProfitPercentage: 0.35,
    minProfitUSD: 100 / 1.42, // 100 CAD converted to USD
    minimumPriceFloor: 90,


    // Premium fonts that double the price (from referencejs.js)
    premiumFontsDouble: ['loveneon', 'scifi', 'mayfair'],


    planScalingFactor: 1.3,
    planNames: ['Mini', 'Small', 'Medium', 'Large', 'XL', 'XXL', 'XXXL', '4XL'],

    // Local coupon codes (can be checked without API)
    localCoupons: {
        'SAVE10': { type: 'percentage', value: 10 },
        'SAVE20': { type: 'percentage', value: 20 },
        'FIFTY': { type: 'amount', value: 50 },
        'WELCOME15': { type: 'percentage', value: 15 },
        'NEWYEAR': { type: 'percentage', value: 25 }
    },

    // API endpoint for coupon validation
    couponApiEndpoint: 'https://apiv2.easyneonsigns.ca/apply-discount'
};




const appState = {

    text: '',
    userHasEnteredText: false,


    fontFamily: "Barcelona",
    fontKey: 'Barcelona',
    fontSizePx: CONFIG.baseFontSize,
    lineHeightPx: CONFIG.baseFontSize * 1.2,


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




function initializeActiveStates() {

    const defaultFontCard = document.querySelector('.font-card[data-font="Barcelona"]');
    const defaultFontItem = document.querySelector('.font-list-item[data-font="Barcelona"]');
    if (defaultFontCard) defaultFontCard.classList.add('active');
    if (defaultFontItem) defaultFontItem.classList.add('active');



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
    renderAllPreviews();
    recalculateTotalPrice();
    updateSizeCardPrices();
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


    const isMobile = window.innerWidth < CONFIG.mobileBreakpoint;
    const maxLines = isMobile ? CONFIG.maxMobileLinesCount : CONFIG.maxDesktopLinesCount;
    const lines = inputText.split('\n');

    if (lines.length > maxLines) {
        inputText = lines.slice(0, maxLines).join('\n');
        event.target.value = inputText;
    }


    appState.text = inputText || CONFIG.defaultPlaceholderText;
    appState.userHasEnteredText = inputText.length > 0;


    renderAllPreviews();


    recalculateTotalPrice();
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


    document.querySelectorAll('.font-card').forEach(card => card.classList.remove('active'));
    document.querySelectorAll('.font-list-item').forEach(item => item.classList.remove('active'));


    const selectedCard = document.querySelector(`.font-card[data-font="${fontKey}"]`);
    const selectedListItem = document.querySelector(`.font-list-item[data-font="${fontKey}"]`);

    if (selectedCard) selectedCard.classList.add('active');
    if (selectedListItem) selectedListItem.classList.add('active');



    renderAllPreviews();
    recalculateTotalPrice();
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
            // If multicolor is being enabled and RGB is active, disable RGB
            if (multiToggle.checked && appState.rgbMode) {
                stopRgbMode();
                // Uncheck RGB color option
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
    // If multicolor is enabled, disable it first
    if (appState.multicolor) {
        appState.multicolor = false;
        appState.characterColors = {};
        appState.selectedCharIndex = null;
        hideColorPopup();

        // Uncheck multicolor toggle
        const multiToggle = document.getElementById('multicolorToggle');
        if (multiToggle) {
            multiToggle.checked = false;
        }

        // Hide multicolor help
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

    if (customWidth) {
        customWidth.addEventListener('input', debounce(() => {
            const width = parseInt(customWidth.value) || 38;
            const height = parseInt(customHeight.value) || Math.round(width * 0.45);

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
            const height = parseInt(customHeight.value) || 17;
            appState.plan.heightIn = height;

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
    appState.plan.price = parseFloat(cardElement.getAttribute('data-price')) || 438.99;
    appState.fontSizePx = parseFloat(cardElement.getAttribute('data-fontsize')) || 38;

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
    // Calculate area (from referencejs.js)
    const area = widthIn * heightIn;

    // Determine if RGB
    const isRGB = appState.rgbMode || appState.rgbSurcharge > 0;

    // Cost per inch values (from referencejs.js)
    const productCostPerInch = isRGB ? CONFIG.productCostPerInchRGB : CONFIG.productCostPerInchStandard;
    const shippingCostPerInch = CONFIG.shippingCostPerInch;
    const usdToCadMultiplier = CONFIG.usdToCadMultiplier;

    // Calculate costs for shipping and product (from referencejs.js)
    const shippingCost = area * shippingCostPerInch;
    const productCost = area * productCostPerInch;
    const localShippingCostUSD = CONFIG.localShippingCostUSD;

    // Calculate profit as the greater of 35% of (product + shipping + local shipping) or 100 CAD converted to USD
    const profitUSD = Math.max(
        CONFIG.minProfitPercentage * (productCost + shippingCost + localShippingCostUSD),
        CONFIG.minProfitUSD
    );

    const totalCostUSD = productCost + shippingCost + profitUSD + localShippingCostUSD;
    const totalCostCADWithDiscount = totalCostUSD * usdToCadMultiplier;
    let totalCostCAD = totalCostCADWithDiscount * usdToCadMultiplier;

    // Double the price for specific fonts (from referencejs.js)
    if (CONFIG.premiumFontsDouble.includes(appState.fontKey.toLowerCase())) {
        totalCostCAD *= 2;
    }

    // Ensure final price is not below the base price
    const finalPrice = Math.max(totalCostCAD, CONFIG.basePrice);

    // Round to .99 (from referencejs.js adjustToNinetyNine)
    return Math.ceil(finalPrice) - 0.01;
}

function recalculatePlanPrice() {
    appState.plan.price = calculatePlanPrice(appState.plan.widthIn, appState.plan.heightIn);
    console.log(appState.plan.price);
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


    // Apply base discount only if enabled
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
    const originalElem = document.querySelector('.original-total');
    const finalElem = document.querySelector('.final-price');

    if (originalElem) {
        originalElem.textContent = `$${appState.totalPrice.toFixed(2)}`;
    }

    if (finalElem) {
        finalElem.textContent = `$${appState.discountPrice.toFixed(2)}`;
    }

    // Update next buttons to show price
    document.querySelectorAll('.btn-next, .btn-final').forEach(btn => {
        const originalText = btn.getAttribute('data-original-text') || btn.textContent.split('$')[0].trim();
        if (!btn.getAttribute('data-original-text')) {
            btn.setAttribute('data-original-text', originalText);
        }

        // Only update if the button text doesn't already have a price or if price changed
        const priceText = ` - $${appState.discountPrice.toFixed(2)}`;
        btn.innerHTML = btn.innerHTML.replace(/\s*-\s*\$[\d,.]+/, ''); // Remove old price

        const svgIcon = btn.querySelector('svg');
        if (svgIcon) {
            btn.innerHTML = `${originalText}<span class="btn-price">${priceText}</span>` + svgIcon.outerHTML;
        } else {
            btn.innerHTML = `${originalText}<span class="btn-price">${priceText}</span>`;
        }
    });
}

function updateSizeCardPrices() {
    // Update all size cards with calculated prices based on their dimensions
    document.querySelectorAll('.size-card').forEach(card => {
        const widthIn = parseInt(card.getAttribute('data-width')) || 38;
        const heightIn = parseInt(card.getAttribute('data-height')) || 17;

        // Calculate price for this size
        let basePrice = calculatePlanPrice(widthIn, heightIn);

        // Apply extras, outdoor, rgb, cutTo
        let totalPrice = basePrice;
        totalPrice += appState.outdoorSurcharge;
        totalPrice += appState.rgbSurcharge;
        totalPrice += appState.cutToPrice;
        appState.extras.forEach(extra => {
            totalPrice += extra.price;
        });

        totalPrice = Math.floor(totalPrice) + 0.99;

        // Apply base discount if enabled
        let discountedPrice = CONFIG.enableBaseDiscount ?
            totalPrice * (1 - CONFIG.basePromotionPercentage) :
            totalPrice;

        // Apply coupon if active
        if (appState.discountApplied && appState.activeDiscount) {
            if (appState.activeDiscount.type === 'percentage') {
                discountedPrice *= (1 - appState.activeDiscount.value / 100);
            } else if (appState.activeDiscount.type === 'amount') {
                discountedPrice -= appState.activeDiscount.value;
            }
        }

        discountedPrice = Math.max(discountedPrice, 0);
        discountedPrice = Math.floor(discountedPrice) + 0.99;

        // Update card prices in UI
        const originalPriceElem = card.querySelector('.original-price');
        const salePriceElem = card.querySelector('.sale-price');

        if (originalPriceElem) {
            originalPriceElem.textContent = `$${totalPrice.toFixed(2)}`;
        }

        if (salePriceElem) {
            salePriceElem.textContent = `$${discountedPrice.toFixed(2)}`;
        }

        // Update data attributes
        card.setAttribute('data-original', totalPrice.toFixed(2));
        card.setAttribute('data-price', discountedPrice.toFixed(2));
    });
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

function showPreviewModal() {

    const previewImage = capturePreviewSnapshot();


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

function capturePreviewSnapshot() {
    const canvas = canvasInstances['neonCanvas4'] || canvasInstances['neonCanvas'];

    if (canvas) {
        return canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1
        });
    }

    return '';
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
        'open-box': 'Open Box'
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
    const isMobile = () => window.innerWidth < 768;


    for (let i = 1; i <= 4; i++) {
        const toggleBtn = document.getElementById(`mobileToggle${i === 1 ? '' : i}`);
        const handle = document.getElementById(`mobilePanelHandle${i === 1 ? '' : i}`);
        const stepContainer = document.getElementById(`step${i}`);

        if (!stepContainer) continue;
        const leftPanel = stepContainer.querySelector('.left-panel');

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
    }


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


    let renderingFontSize = appState.fontSizePx;

    if (appState.multicolor) {

        renderMulticolorText(canvas, displayText, centerX, centerY, renderingFontSize);
    } else {

        const textConfig = {
            left: centerX,
            top: centerY,
            originX: 'center',
            originY: 'center',
            textAlign: 'center',
            fontFamily: appState.fontFamily,
            fontSize: renderingFontSize,
            fill: appState.colorValue,
            selectable: false
        };


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


        drawMeasurementOverlays(canvas, textObject);
    }

    canvas.renderAll();
}

function renderMulticolorText(canvas, text, centerX, centerY, renderingFontSize) {

    const useFontSize = renderingFontSize || appState.fontSizePx;


    const tempText = new fabric.Text(text, {
        fontFamily: appState.fontFamily,
        fontSize: useFontSize
    });

    const totalWidth = tempText.width;
    const totalHeight = tempText.height;


    let startX = centerX - (totalWidth / 2);
    const baseY = centerY;


    const textGroup = new fabric.Group([], {
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        selectable: false
    });


    for (let i = 0; i < text.length; i++) {
        const char = text[i];


        const charColor = appState.characterColors[i] || appState.colorValue;


        const isSelected = appState.selectedCharIndex === i;


        const charConfig = {
            fontFamily: appState.fontFamily,
            fontSize: useFontSize,
            fill: charColor,
            selectable: false,
            charSpacing: 0
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
        charObj.charIndex = i;


        const charWidth = charObj.width;


        charObj.set({
            left: startX - (totalWidth / 2) + (charWidth / 2),
            top: 0,
            originX: 'center',
            originY: 'center'
        });

        textGroup.addWithUpdate(charObj);


        startX += charWidth;
    }


    canvas.add(textGroup);


    const items = textGroup.getObjects();
    textGroup._restoreObjectsState();
    canvas.remove(textGroup);


    startX = centerX - (totalWidth / 2);
    items.forEach((item, index) => {
        const charWidth = item.width;
        item.set({
            left: startX + (charWidth / 2),
            top: centerY,
            originX: 'center',
            originY: 'center'
        });
        canvas.add(item);
        startX += charWidth;
    });


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


    const sizeFactor = bounds.width / 400;
    const padding = Math.max(60, Math.min(100, 70 * sizeFactor));
    const tickLength = Math.max(8, Math.min(15, 10 * sizeFactor));
    const labelFontSize = Math.max(14, Math.min(20, 16 * sizeFactor));


    const hLineY = bounds.top + bounds.height + padding;
    const hStartX = bounds.left - 30;
    const hEndX = bounds.left + bounds.width + 30;

    const horizLine = new fabric.Line([hStartX, hLineY, hEndX, hLineY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false
    });
    canvas.add(horizLine);


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


    const widthLabel = new fabric.Text(`${appState.plan.widthIn}"`, {
        left: centerX,
        top: hLineY + 18,
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


    const vLineX = bounds.left + bounds.width + padding;
    const vStartY = bounds.top - 30;
    const vEndY = bounds.top + bounds.height + 30;

    const vertLine = new fabric.Line([vLineX, vStartY, vLineX, vEndY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false
    });
    canvas.add(vertLine);


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


    const heightLabel = new fabric.Text(`${appState.plan.heightIn}"`, {
        left: vLineX + 18,
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



    const textLength = appState.text.length || CONFIG.defaultPlaceholderText.length;
    const baseWidth = 15 + (textLength * 2.5);
    const baseHeight = Math.round(baseWidth * 0.43);

    return {
        widthIn: Math.round(baseWidth),
        heightIn: Math.round(baseHeight)
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
    originalNavigateToStep(stepNumber);
    updateMobileFooter();


    if (window.innerWidth <= 768) {
        const activePanel = document.querySelector('.left-panel.expanded');
        const overlay = document.getElementById('mobileOverlay');
        if (activePanel && overlay) {
            collapsePanel(activePanel, overlay);
        }
    }
};


const originalRecalculateTotalPrice = recalculateTotalPrice;
recalculateTotalPrice = function () {
    originalRecalculateTotalPrice();
    updateMobileFooter();
};
