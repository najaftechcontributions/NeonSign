// Global state
const state = {
    currentStep: 1,
    inputType: 'text',
    text: 'your text',
    logoFile: null,
    logoDataUrl: null,
    color: '#C8FF00',
    colorName: 'Lime',
    font: 'pacifico',
    fontFamily: "'Pacifico', cursive",
    size: 'mini',
    sizeWidth: 23,
    sizeHeight: 10,
    sizePrice: 438.99,
    shape: 'cut-to-letter',
    shapePrice: 15,
    location: 'indoor',
    locationPrice: 0,
    backboard: 'clear',
    powerAdapter: 'usa',
    hanging: 'none',
    hangingPrice: 0,
    remoteDimmer: false,
    waterProof: false,
    waterProofPrice: 0,
    multicolor: false,
    characterColors: {},
    selectedCharIndex: null,
    themeMode: 'dark',
    neonOn: true,
    brightness: 10
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeStep1();
    initializeStep2();
    initializeStep3();
    initializeStep4();
    initializeStepTabs();
    initializePreviewControls();
    updateAllPreviews();
});

// Step navigation
function initializeStepTabs() {
    document.querySelectorAll('.step-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const step = parseInt(this.getAttribute('data-step'));
            goToStep(step);
        });
    });
}

function goToStep(step) {
    document.querySelectorAll('.step-container').forEach(container => {
        container.classList.remove('active');
    });
    
    document.getElementById(`step${step}`).classList.add('active');
    state.currentStep = step;
    
    updateStepTabs();
    updateAllPreviews();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepTabs() {
    document.querySelectorAll('.step-tab').forEach(tab => {
        const step = parseInt(tab.getAttribute('data-step'));
        tab.classList.remove('active', 'completed');
        
        if (step < state.currentStep) {
            tab.classList.add('completed');
        } else if (step === state.currentStep) {
            tab.classList.add('active');
        }
    });
}

// Step 1: Text & Color
function initializeStep1() {
    // Text input
    const textInput = document.getElementById('neonText');
    if (textInput) {
        textInput.addEventListener('input', function() {
            const oldText = state.text;
            const newText = this.value || 'your text';
            state.text = newText;

            // If multicolor is on and text length changed, adjust character colors
            if (state.multicolor && oldText.length !== newText.length) {
                const newCharColors = {};
                for (let i = 0; i < newText.length; i++) {
                    if (state.characterColors[i]) {
                        newCharColors[i] = state.characterColors[i];
                    }
                }
                state.characterColors = newCharColors;
            }

            updateAllPreviews();
        });
    }
    
    // Logo upload
    const uploadLogoBtn = document.getElementById('uploadLogoBtn');
    const logoInput = document.getElementById('logoInput');
    
    if (uploadLogoBtn && logoInput) {
        uploadLogoBtn.addEventListener('click', () => logoInput.click());
        
        logoInput.addEventListener('change', function() {
            handleLogoUpload(this.files[0]);
        });
    }
    
    // Remove upload
    const removeUpload = document.getElementById('removeUpload');
    if (removeUpload) {
        removeUpload.addEventListener('click', function() {
            state.logoFile = null;
            state.logoDataUrl = null;
            state.inputType = 'text';
            document.getElementById('uploadedPreview').classList.add('hidden');
            if (logoInput) logoInput.value = '';
            updateAllPreviews();
        });
    }
    
    // Font dropdown
    const fontTrigger = document.getElementById('fontTrigger');
    const fontDropdownMenu = document.getElementById('fontDropdownMenu');
    
    if (fontTrigger && fontDropdownMenu) {
        fontTrigger.addEventListener('click', function() {
            fontDropdownMenu.classList.toggle('hidden');
        });
        
        document.addEventListener('click', function(e) {
            if (!fontTrigger.contains(e.target) && !fontDropdownMenu.contains(e.target)) {
                fontDropdownMenu.classList.add('hidden');
            }
        });
        
        fontDropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function() {
                state.font = this.getAttribute('data-font');
                state.fontFamily = this.getAttribute('data-family');
                document.getElementById('selectedFontName').textContent = this.textContent;
                fontDropdownMenu.classList.add('hidden');
                updateAllPreviews();
            });
        });
    }
    
    // Font cards
    document.querySelectorAll('.font-card').forEach(card => {
        card.addEventListener('click', function() {
            state.font = this.getAttribute('data-font');
            state.fontFamily = this.getAttribute('data-family');
            document.getElementById('selectedFontName').textContent = this.querySelector('.font-name').textContent;
            updateAllPreviews();
        });
    });
    
    // Color picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            const selectedColor = this.getAttribute('data-color');
            const selectedColorName = this.getAttribute('data-name');

            if (state.multicolor && state.selectedCharIndex !== null) {
                // Set color for selected character
                state.characterColors[state.selectedCharIndex] = selectedColor;
            } else {
                // Set global color
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                state.color = selectedColor;
                state.colorName = selectedColorName;
            }

            updateAllPreviews();
        });
    });
    
    // Custom color
    const customColorBtn = document.getElementById('customColorBtn');
    const customColorPicker = document.getElementById('customColorPicker');

    if (customColorBtn && customColorPicker) {
        customColorBtn.addEventListener('click', () => customColorPicker.click());

        customColorPicker.addEventListener('input', function() {
            const selectedColor = this.value;

            if (state.multicolor && state.selectedCharIndex !== null) {
                // Set color for selected character
                state.characterColors[state.selectedCharIndex] = selectedColor;
            } else {
                // Set global color
                state.color = selectedColor;
                state.colorName = 'Custom';
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            }

            updateAllPreviews();
        });
    }
    
    // Multicolor toggle
    const multicolorToggle = document.getElementById('multicolorToggle');
    const multicolorHelp = document.getElementById('multicolorHelp');
    if (multicolorToggle) {
        multicolorToggle.addEventListener('change', function() {
            state.multicolor = this.checked;
            if (!this.checked) {
                // Reset character colors when turning off multicolor
                state.characterColors = {};
                state.selectedCharIndex = null;
            }

            // Show/hide help text
            if (multicolorHelp) {
                if (this.checked) {
                    multicolorHelp.classList.remove('hidden');
                } else {
                    multicolorHelp.classList.add('hidden');
                }
            }

            updateAllPreviews();
        });
    }
}

function handleLogoUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert('Please upload a valid image file');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }
    
    state.logoFile = file;
    state.inputType = 'logo';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        state.logoDataUrl = e.target.result;
        document.getElementById('uploadedImage').src = e.target.result;
        document.getElementById('uploadedPreview').classList.remove('hidden');
        updateAllPreviews();
    };
    reader.readAsDataURL(file);
}

// Step 2: Size Selection
function initializeStep2() {
    // Size mode toggle
    document.querySelectorAll('.size-mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.size-mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const mode = this.getAttribute('data-mode');
            const sizeGrid = document.getElementById('sizeGrid');
            const customSizeInputs = document.getElementById('customSizeInputs');
            const sizeModeTitle = document.getElementById('sizeModeTitle');

            if (mode === 'custom') {
                // Show custom size inputs
                if (sizeGrid) sizeGrid.classList.add('hidden');
                if (customSizeInputs) customSizeInputs.classList.remove('hidden');
                if (sizeModeTitle) sizeModeTitle.textContent = 'Enter custom size';

                // Set initial values from current state
                const customWidth = document.getElementById('customWidth');
                const customHeight = document.getElementById('customHeight');
                if (customWidth) customWidth.value = state.sizeWidth;
                if (customHeight) customHeight.value = state.sizeHeight || Math.round(state.sizeWidth * 0.45);
            } else {
                // Show preset size grid
                if (sizeGrid) sizeGrid.classList.remove('hidden');
                if (customSizeInputs) customSizeInputs.classList.add('hidden');
                if (sizeModeTitle) sizeModeTitle.textContent = 'Select size';
            }
        });
    });

    // Custom size inputs
    const customWidth = document.getElementById('customWidth');
    const customHeight = document.getElementById('customHeight');

    if (customWidth) {
        customWidth.addEventListener('input', function() {
            const width = parseInt(this.value) || 38;
            state.sizeWidth = width;
            state.sizeHeight = parseInt(customHeight.value) || Math.round(width * 0.45);

            // Calculate price based on size (approximation)
            const area = state.sizeWidth * state.sizeHeight;
            state.sizePrice = Math.round((area / 646) * 438.99 * 100) / 100; // base price for medium is 38x17=646

            updateSizeIndicators();
            updatePricing();
        });
    }

    if (customHeight) {
        customHeight.addEventListener('input', function() {
            const height = parseInt(this.value) || 17;
            state.sizeHeight = height;

            // Calculate price based on size
            const area = state.sizeWidth * state.sizeHeight;
            state.sizePrice = Math.round((area / 646) * 438.99 * 100) / 100;

            updateSizeIndicators();
            updatePricing();
        });
    }

    // Size cards
    document.querySelectorAll('#step2 .size-card').forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class and checkmarks from all cards
            document.querySelectorAll('#step2 .size-card').forEach(c => {
                c.classList.remove('active');
                const existingCheckmark = c.querySelector('.checkmark');
                if (existingCheckmark) {
                    existingCheckmark.remove();
                }
            });

            // Add active class and checkmark to clicked card
            this.classList.add('active');
            const visual = this.querySelector('.size-visual');
            if (visual && !visual.querySelector('.checkmark')) {
                const checkmark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                checkmark.setAttribute('class', 'checkmark');
                checkmark.setAttribute('width', '20');
                checkmark.setAttribute('height', '20');
                checkmark.setAttribute('viewBox', '0 0 20 20');
                checkmark.setAttribute('fill', 'none');

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M4 10L8 14L16 6');
                path.setAttribute('stroke', 'currentColor');
                path.setAttribute('stroke-width', '2');
                path.setAttribute('stroke-linecap', 'round');
                path.setAttribute('stroke-linejoin', 'round');

                checkmark.appendChild(path);
                visual.appendChild(checkmark);
            }

            state.size = this.getAttribute('data-size');
            state.sizeWidth = parseInt(this.getAttribute('data-width'));
            state.sizeHeight = parseInt(this.getAttribute('data-height'));
            state.sizePrice = parseFloat(this.getAttribute('data-price'));

            updateSizeIndicators();
            updatePricing();
        });
    });

    // Location radio
    document.querySelectorAll('input[name="location"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const parent = this.closest('.radio-option');
            document.querySelectorAll('.radio-group .radio-option').forEach(opt => opt.classList.remove('active'));
            parent.classList.add('active');

            state.location = this.value;
            state.locationPrice = this.value === 'outdoor' ? 65 : 0;
            updatePricing();
        });
    });
}

// Step 3: Sign Shape
function initializeStep3() {
    // Shape cards
    document.querySelectorAll('.shape-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.shape-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            state.shape = this.getAttribute('data-shape');
            state.shapePrice = parseFloat(this.getAttribute('data-price'));
            updatePricing();
        });
    });
    
    // Backboard color
    document.querySelectorAll('input[name="backboard"]').forEach(radio => {
        radio.addEventListener('change', function() {
            state.backboard = this.value;
        });
    });
}

// Step 4: More Options
function initializeStep4() {
    // Power adapter
    document.querySelectorAll('input[name="power"]').forEach(radio => {
        radio.addEventListener('change', function() {
            state.powerAdapter = this.value;
        });
    });
    
    // Hanging options
    document.querySelectorAll('input[name="hanging"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const parent = this.closest('.radio-option');
            document.querySelectorAll('#step4 .radio-group .radio-option').forEach(opt => opt.classList.remove('active'));
            parent.classList.add('active');
            
            state.hanging = this.value;
            state.hangingPrice = (this.value === 'wall' || this.value === 'sign') ? 15 : 0;
            updatePricing();
        });
    });
    
    // Remote & Dimmer
    const remoteDimmer = document.getElementById('remoteDimmer');
    if (remoteDimmer) {
        remoteDimmer.addEventListener('change', function() {
            state.remoteDimmer = this.checked;
        });
    }
    
    // Water Proof
    const waterProof = document.getElementById('waterProof');
    if (waterProof) {
        waterProof.addEventListener('change', function() {
            state.waterProof = this.checked;
            state.waterProofPrice = this.checked ? 30 : 0;
            updatePricing();
        });
    }
    
    // Discount code
    const discountCode = document.getElementById('discountCode');
    const applyBtn = document.querySelector('.apply-btn');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', function() {
            const code = discountCode ? discountCode.value : '';
            if (code) {
                alert('Discount code: ' + code + '\n(Validation not implemented in demo)');
            }
        });
    }
    
    // Preview & Buy button
    const btnFinal = document.querySelector('.btn-final');
    if (btnFinal) {
        btnFinal.addEventListener('click', function() {
            const total = calculateTotal();
            const config = {
                text: state.text,
                color: state.colorName,
                font: state.font,
                size: `${state.sizeWidth}"`,
                shape: state.shape,
                location: state.location,
                backboard: state.backboard,
                powerAdapter: state.powerAdapter,
                hanging: state.hanging,
                remoteDimmer: state.remoteDimmer,
                waterProof: state.waterProof,
                total: total.toFixed(2)
            };
            
            console.log('Order Summary:', config);
            alert(`Order Summary:\n\nTotal: $${config.total}\n\nThank you for your order!`);
        });
    }
}

// Preview Controls
function initializePreviewControls() {
    // Initialize for all steps
    for (let i = 1; i <= 4; i++) {
        const container = document.getElementById(`step${i}`);
        if (!container) continue;
        
        // Neon ON/OFF toggle
        const neonToggle = container.querySelector('[id^="neonToggle"]');
        if (neonToggle) {
            neonToggle.addEventListener('change', function() {
                state.neonOn = this.checked;
                updateAllPreviews();
            });
        }
        
        // Theme mode toggle
        const modeBtns = container.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const parent = this.closest('.theme-mode-toggle');
                parent.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                state.themeMode = this.getAttribute('data-mode');
                updateBackgroundMode();
            });
        });
        
        // Save preview button
        const saveBtn = container.querySelector('.save-preview-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                alert('Screenshot feature coming soon!\n\nYou can use your device\'s screenshot tool to save the preview.');
            });
        }
        
        // Preview eye button
        const eyeBtn = container.querySelector('.preview-eye-btn');
        if (eyeBtn) {
            eyeBtn.addEventListener('click', function() {
                alert('Full screen preview feature coming soon!');
            });
        }
    }
}

// Update functions
function updateAllPreviews() {
    for (let i = 1; i <= 4; i++) {
        const textPreview = document.getElementById(`neonPreview${i === 1 ? '' : i}`);
        const logoPreview = document.getElementById(`neonLogoPreview${i === 1 ? '' : i}`);

        if (state.inputType === 'text') {
            if (textPreview) {
                textPreview.classList.remove('hidden');
                textPreview.style.fontFamily = state.fontFamily;

                if (state.multicolor) {
                    // Render each character with its own color
                    textPreview.innerHTML = '';
                    const chars = state.text.split('');
                    chars.forEach((char, index) => {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.className = 'neon-char';
                        span.style.fontFamily = state.fontFamily;

                        const charColor = state.characterColors[index] || state.color;
                        span.style.color = charColor;

                        if (state.neonOn) {
                            span.style.textShadow = `
                                0 0 10px ${charColor},
                                0 0 20px ${charColor},
                                0 0 40px ${charColor},
                                0 0 80px ${charColor}
                            `;
                        } else {
                            span.style.textShadow = 'none';
                            span.style.opacity = '0.3';
                        }

                        // Make character clickable in multicolor mode
                        span.style.cursor = 'pointer';
                        span.addEventListener('click', function() {
                            state.selectedCharIndex = index;
                            // Highlight selected character
                            document.querySelectorAll('.neon-char').forEach(c => c.style.textDecoration = 'none');
                            this.style.textDecoration = 'underline';
                        });

                        textPreview.appendChild(span);
                    });
                } else {
                    // Normal single-color rendering
                    textPreview.textContent = state.text;
                    textPreview.style.color = state.color;

                    if (state.neonOn) {
                        textPreview.classList.remove('off');
                        textPreview.style.textShadow = `
                            0 0 10px ${state.color},
                            0 0 20px ${state.color},
                            0 0 40px ${state.color},
                            0 0 80px ${state.color}
                        `;
                    } else {
                        textPreview.classList.add('off');
                    }
                }
            }
            if (logoPreview) {
                logoPreview.classList.add('hidden');
            }
        } else {
            if (textPreview) {
                textPreview.classList.add('hidden');
            }
            if (logoPreview && state.logoDataUrl) {
                logoPreview.classList.remove('hidden');
                logoPreview.src = state.logoDataUrl;

                if (state.neonOn) {
                    logoPreview.classList.remove('off');
                    logoPreview.style.filter = `
                        drop-shadow(0 0 10px ${state.color})
                        drop-shadow(0 0 20px ${state.color})
                        drop-shadow(0 0 40px ${state.color})
                        drop-shadow(0 0 80px ${state.color})
                    `;
                } else {
                    logoPreview.classList.add('off');
                }
            }
        }
    }

    updateSizeIndicators();
}

function updateSizeIndicators() {
    for (let i = 1; i <= 4; i++) {
        const sizeIndicator = document.getElementById(`sizeIndicator${i === 1 ? '' : i}`);
        if (sizeIndicator) {
            sizeIndicator.textContent = `${state.sizeWidth}"`;
        }
    }
}

function updateBackgroundMode() {
    for (let i = 1; i <= 4; i++) {
        const wrapper = document.getElementById(`bgImageWrapper${i === 1 ? '' : i}`);
        if (wrapper) {
            wrapper.classList.remove('light-mode', 'dark-mode');
            wrapper.classList.add(`${state.themeMode}-mode`);
        }
    }
}

function updatePricing() {
    const basePrice = state.sizePrice;
    const extras = state.shapePrice + state.locationPrice + state.hangingPrice + state.waterProofPrice;
    const subtotal = basePrice + extras;
    const discount = subtotal * 0.20; // 20% off
    const total = subtotal - discount;
    
    // Update in Step 4
    const originalTotal = document.querySelector('.original-total');
    const finalPrice = document.querySelector('.final-price');
    
    if (originalTotal) {
        originalTotal.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    if (finalPrice) {
        finalPrice.textContent = `$${total.toFixed(2)}`;
    }
}

function calculateTotal() {
    const basePrice = state.sizePrice;
    const extras = state.shapePrice + state.locationPrice + state.hangingPrice + state.waterProofPrice;
    const subtotal = basePrice + extras;
    const discount = subtotal * 0.20; // 20% off
    return subtotal - discount;
}

// Initialize pricing
updatePricing();
