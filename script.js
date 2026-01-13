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

// Fabric.js canvases
const canvases = {};
const animationFrames = {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeCanvases();
    initializeStep1();
    initializeStep2();
    initializeStep3();
    initializeStep4();
    initializeStepTabs();
    initializePreviewControls();
    updateAllPreviews();
});

// Initialize Fabric.js canvases
function initializeCanvases() {
    for (let i = 1; i <= 4; i++) {
        const canvasId = i === 1 ? 'neonCanvas' : `neonCanvas${i}`;
        const canvasElement = document.getElementById(canvasId);
        
        if (canvasElement) {
            canvases[canvasId] = new fabric.Canvas(canvasId, {
                width: 800,
                height: 600,
                backgroundColor: 'transparent',
                selection: false,
                renderOnAddRemove: true
            });
            
            // Enable retina scaling for crisp rendering
            const pixelRatio = window.devicePixelRatio || 1;
            canvases[canvasId].setDimensions({
                width: 800,
                height: 600
            }, {
                cssOnly: false,
                backstoreOnly: false
            });
        }
    }
}

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
    // Stop all animations before switching
    Object.keys(animationFrames).forEach(key => {
        if (animationFrames[key]) {
            cancelAnimationFrame(animationFrames[key]);
            animationFrames[key] = null;
        }
    });
    
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
    
    // Font library collapsible
    const fontLibraryTrigger = document.getElementById('fontLibraryTrigger');
    const fontLibraryContent = document.getElementById('fontLibraryContent');
    
    if (fontLibraryTrigger && fontLibraryContent) {
        fontLibraryTrigger.addEventListener('click', function() {
            const isOpen = fontLibraryContent.classList.contains('open');
            if (isOpen) {
                fontLibraryContent.classList.remove('open');
                this.classList.remove('open');
            } else {
                fontLibraryContent.classList.add('open');
                this.classList.add('open');
            }
        });
        
        // Font list items
        fontLibraryContent.querySelectorAll('.font-list-item').forEach(item => {
            item.addEventListener('click', function() {
                state.font = this.getAttribute('data-font');
                state.fontFamily = this.getAttribute('data-family');
                
                // Close collapsible
                fontLibraryContent.classList.remove('open');
                fontLibraryTrigger.classList.remove('open');
                
                updateAllPreviews();
            });
        });
    }
    
    // Font cards
    document.querySelectorAll('.font-card').forEach(card => {
        card.addEventListener('click', function() {
            state.font = this.getAttribute('data-font');
            state.fontFamily = this.getAttribute('data-family');
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
                state.characterColors[state.selectedCharIndex] = selectedColor;
            } else {
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
                state.characterColors = {};
                state.selectedCharIndex = null;
            }

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
                if (sizeGrid) sizeGrid.classList.add('hidden');
                if (customSizeInputs) customSizeInputs.classList.remove('hidden');
                if (sizeModeTitle) sizeModeTitle.textContent = 'Enter custom size';

                const customWidth = document.getElementById('customWidth');
                const customHeight = document.getElementById('customHeight');
                if (customWidth) customWidth.value = state.sizeWidth;
                if (customHeight) customHeight.value = state.sizeHeight || Math.round(state.sizeWidth * 0.45);
            } else {
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

            const area = state.sizeWidth * state.sizeHeight;
            state.sizePrice = Math.round((area / 230) * 438.99 * 100) / 100;

            updateAllPreviews();
            updatePricing();
        });
    }

    if (customHeight) {
        customHeight.addEventListener('input', function() {
            const height = parseInt(this.value) || 17;
            state.sizeHeight = height;

            const area = state.sizeWidth * state.sizeHeight;
            state.sizePrice = Math.round((area / 230) * 438.99 * 100) / 100;

            updateAllPreviews();
            updatePricing();
        });
    }

    // Size cards
    document.querySelectorAll('#step2 .size-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('#step2 .size-card').forEach(c => {
                c.classList.remove('active');
                const existingCheckmark = c.querySelector('.checkmark');
                if (existingCheckmark) {
                    existingCheckmark.remove();
                }
            });

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

            updateAllPreviews();
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
                updateAllPreviews();
            });
        });
        
        // Save preview button
        const saveBtn = document.getElementById(`saveBtn${i}`);
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                exportCanvasAsImage(i);
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

// Export canvas as image
function exportCanvasAsImage(stepNumber) {
    const canvasId = stepNumber === 1 ? 'neonCanvas' : `neonCanvas${stepNumber}`;
    const canvas = canvases[canvasId];
    
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

// Draw measurement scales on canvas
function drawMeasurementScales(canvas, textWidth, textHeight) {
    const scaleColor = state.themeMode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.5)';
    const textColor = state.themeMode === 'dark' ? '#FFFFFF' : '#000000';
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const padding = 80;
    const tickSize = 10;
    
    // Horizontal scale (width)
    const hScaleY = centerY + textHeight / 2 + padding;
    const hStartX = centerX - textWidth / 2 - 20;
    const hEndX = centerX + textWidth / 2 + 20;
    
    // Horizontal main line
    const hLine = new fabric.Line([hStartX, hScaleY, hEndX, hScaleY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false,
        evented: false
    });
    canvas.add(hLine);
    
    // Horizontal ticks
    const hTickLeft = new fabric.Line([hStartX, hScaleY - tickSize, hStartX, hScaleY + tickSize], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false,
        evented: false
    });
    const hTickRight = new fabric.Line([hEndX, hScaleY - tickSize, hEndX, hScaleY + tickSize], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false,
        evented: false
    });
    canvas.add(hTickLeft, hTickRight);
    
    // Horizontal label
    const hLabel = new fabric.Text(`${state.sizeWidth}"`, {
        left: centerX,
        top: hScaleY + 20,
        originX: 'center',
        originY: 'top',
        fontSize: 16,
        fill: textColor,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        selectable: false,
        evented: false
    });
    canvas.add(hLabel);
    
    // Vertical scale (height)
    const vScaleX = centerX + textWidth / 2 + padding;
    const vStartY = centerY - textHeight / 2 - 20;
    const vEndY = centerY + textHeight / 2 + 20;
    
    // Vertical main line
    const vLine = new fabric.Line([vScaleX, vStartY, vScaleX, vEndY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false,
        evented: false
    });
    canvas.add(vLine);
    
    // Vertical ticks
    const vTickTop = new fabric.Line([vScaleX - tickSize, vStartY, vScaleX + tickSize, vStartY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false,
        evented: false
    });
    const vTickBottom = new fabric.Line([vScaleX - tickSize, vEndY, vScaleX + tickSize, vEndY], {
        stroke: scaleColor,
        strokeWidth: 2,
        selectable: false,
        evented: false
    });
    canvas.add(vTickTop, vTickBottom);
    
    // Vertical label
    const vLabel = new fabric.Text(`${state.sizeHeight}"`, {
        left: vScaleX + 20,
        top: centerY,
        originX: 'left',
        originY: 'center',
        fontSize: 16,
        fill: textColor,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        selectable: false,
        evented: false,
        angle: 0
    });
    canvas.add(vLabel);
}

// Render neon text on canvas using Fabric.js
function renderNeonText(canvas, text, fontFamily, color, multicolor, characterColors, neonOn) {
    if (!canvas) return;
    
    // Stop any existing animation
    const canvasId = Object.keys(canvases).find(key => canvases[key] === canvas);
    if (canvasId && animationFrames[canvasId]) {
        cancelAnimationFrame(animationFrames[canvasId]);
        animationFrames[canvasId] = null;
    }
    
    canvas.clear();
    
    const centerY = canvas.height / 2;
    let textWidth = 0;
    let textHeight = 0;
    
    if (multicolor) {
        // Render each character individually
        const chars = text.split('');
        const charWidths = [];
        let totalWidth = 0;
        
        // Calculate widths
        chars.forEach((char, index) => {
            const charColor = characterColors[index] || color;
            const tempText = new fabric.Text(char, {
                fontFamily: fontFamily.replace(/['"]/g, ''),
                fontSize: 80,
                fill: charColor,
                fontWeight: 400
            });
            charWidths.push(tempText.width);
            totalWidth += tempText.width;
            textHeight = Math.max(textHeight, tempText.height);
        });
        
        textWidth = totalWidth;
        let currentX = (canvas.width - totalWidth) / 2;
        
        // Render characters
        chars.forEach((char, index) => {
            const charColor = characterColors[index] || color;
            
            const textObj = new fabric.Text(char, {
                left: currentX,
                top: centerY,
                originX: 'left',
                originY: 'center',
                fontFamily: fontFamily.replace(/['"]/g, ''),
                fontSize: 80,
                fill: charColor,
                fontWeight: 400,
                selectable: true,
                hasControls: false,
                hasBorders: false,
                lockMovementX: true,
                lockMovementY: true
            });
            
            if (neonOn) {
                textObj.set({
                    shadow: {
                        color: charColor,
                        blur: 45,
                        offsetX: 0,
                        offsetY: 0
                    }
                });
            } else {
                textObj.set({
                    opacity: 0.3
                });
            }
            
            textObj.charIndex = index;
            
            textObj.on('mousedown', function() {
                if (state.multicolor) {
                    state.selectedCharIndex = this.charIndex;
                    
                    canvas.getObjects().forEach(obj => {
                        if (obj.stroke && obj.type === 'text') {
                            obj.set({ stroke: null, strokeWidth: 0 });
                        }
                    });
                    
                    this.set({
                        stroke: charColor,
                        strokeWidth: 2
                    });
                    
                    canvas.renderAll();
                }
            });
            
            canvas.add(textObj);
            currentX += charWidths[index];
        });
        
    } else {
        // Render entire text as one object
        const textObj = new fabric.Text(text, {
            left: canvas.width / 2,
            top: centerY,
            originX: 'center',
            originY: 'center',
            fontFamily: fontFamily.replace(/['"]/g, ''),
            fontSize: 80,
            fill: color,
            fontWeight: 400,
            selectable: false
        });
        
        textWidth = textObj.width;
        textHeight = textObj.height;
        
        if (neonOn) {
            textObj.set({
                shadow: {
                    color: color,
                    blur: 45,
                    offsetX: 0,
                    offsetY: 0
                }
            });
        } else {
            textObj.set({
                opacity: 0.3
            });
        }
        
        canvas.add(textObj);
    }
    
    // Draw measurement scales
    drawMeasurementScales(canvas, textWidth, textHeight);
    
    // Start animation
    if (neonOn) {
        animateNeonPulse(canvas, canvasId);
    }
    
    canvas.renderAll();
}

// Render logo on canvas with neon glow
function renderNeonLogo(canvas, imageUrl, color, neonOn) {
    if (!canvas || !imageUrl) return;
    
    // Stop any existing animation
    const canvasId = Object.keys(canvases).find(key => canvases[key] === canvas);
    if (canvasId && animationFrames[canvasId]) {
        cancelAnimationFrame(animationFrames[canvasId]);
        animationFrames[canvasId] = null;
    }
    
    canvas.clear();
    
    fabric.Image.fromURL(imageUrl, function(img) {
        const maxWidth = 400;
        const maxHeight = 400;
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        
        img.scale(scale);
        img.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            selectable: false
        });
        
        if (neonOn) {
            img.set({
                shadow: {
                    color: color,
                    blur: 50,
                    offsetX: 0,
                    offsetY: 0
                }
            });
        } else {
            img.set({
                opacity: 0.3
            });
        }
        
        canvas.add(img);
        
        // Draw measurement scales
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        drawMeasurementScales(canvas, imgWidth, imgHeight);
        
        if (neonOn) {
            animateNeonPulse(canvas, canvasId);
        }
        
        canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
}

// Animate neon pulse effect
function animateNeonPulse(canvas, canvasId) {
    let opacity = 0.96;
    let increasing = true;
    
    function pulse() {
        if (increasing) {
            opacity += 0.004;
            if (opacity >= 1) {
                increasing = false;
            }
        } else {
            opacity -= 0.004;
            if (opacity <= 0.96) {
                increasing = true;
            }
        }
        
        canvas.getObjects().forEach(obj => {
            if (state.neonOn && obj.shadow && (obj.type === 'text' || obj.type === 'image')) {
                obj.set({ opacity: opacity });
            }
        });
        
        canvas.renderAll();
        
        if (state.neonOn) {
            animationFrames[canvasId] = requestAnimationFrame(pulse);
        }
    }
    
    animationFrames[canvasId] = requestAnimationFrame(pulse);
}

// Update all canvas previews
function updateAllPreviews() {
    for (let i = 1; i <= 4; i++) {
        const canvasId = i === 1 ? 'neonCanvas' : `neonCanvas${i}`;
        const canvas = canvases[canvasId];
        
        if (canvas) {
            if (state.inputType === 'text') {
                renderNeonText(
                    canvas,
                    state.text,
                    state.fontFamily,
                    state.color,
                    state.multicolor,
                    state.characterColors,
                    state.neonOn
                );
            } else if (state.inputType === 'logo' && state.logoDataUrl) {
                renderNeonLogo(
                    canvas,
                    state.logoDataUrl,
                    state.color,
                    state.neonOn
                );
            }
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
    const discount = subtotal * 0.20;
    const total = subtotal - discount;
    
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
    const discount = subtotal * 0.20;
    return subtotal - discount;
}

// Initialize pricing
updatePricing();
