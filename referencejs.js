// ---------------------------
// Font Families Array
// ---------------------------
// Holds the available fonts with both display name and family name.

// Font-specific line height multipliers for consistent visual spacing
const lineHeightMultipliers = {
  'Barcelona': 1.15,
  'Alexa': 1.2,
  'Bayview': 1.1,
  'Amsterdam': 1.2,
  'Greenworld': 1.2,
  'NewCursive': 1.2,
  'Vintage': 1.2,
  'Venetian': 1.2,
  'Amanda': 1.2,
  'Austin': 1.05,
  'Beachfront': 1.25,
  'Chelsea': 1.1,
  'Freehand': 1.2,
  'Freespirit': 1.25,
  'LoveNote': 1.2,
  'Neonscript': 1.2,
  'Northshore': 1.2,
  'Photogenic': 1.2,
  'Royalty': 1.25,
  'Rocket': 1.2,
  'Signature': 1.2,
  'Sorrento': 1.2,
  'WildScript': 1.2,
  'Avante': 1.2,
  'Buttercup': 1.2,
  'ClassicType': 1.3,
  'Typewriter': 1.25,
  'Melbourne': 1.25,
  'NeoTokyo': 1.25,
  'Monaco': 1.2,
  'Waikiki': 1.2,
  'Bellview': 1.1,
  'LoveNeon': 1.3,
  'Marquee': 1.2,
  'Mayfair': 1.2,
  'NeonGlow': 1.2,
  'NeonLite': 1.2,
  'Neontrace': 1.3,
  'Nevada': 1.1,
  'SciFi': 1.2
};

const fontFamilies = [
  {
    name: "Barcelona",
    family: "Barcelona",
  },
  {
    name: "Alexa",
    family: "Alexa",
  },
  {
    name: "Bayview",
    family: "Bayview",
  },
  {
    name: "Amsterdam",
    family: "Amsterdam",
  },
  {
    name: "Greenworld",
    family: "Greenworld",
  },
  {
    name: "NewCursive",
    family: "NewCursive",
  },
  {
    name: "Vintage",
    family: "Vintage",
  },
  {
    name: "Venetian",
    family: "Venetian",
  },
  {
    name: "Amanda",
    family: "Amanda",
  },
  {
    name: "Austin",
    family: "Austin",
  },
  {
    name: "Beachfront",
    family: "Beachfront",
  },
  {
    name: "Chelsea",
    family: "Chelsea",
  },
  {
    name: "Freehand",
    family: "Freehand",
  },
  {
    name: "Freespirit",
    family: "Freespirit",
  },
  {
    name: "LoveNote",
    family: "LoveNote",
  },
  {
    name: "Neonscript",
    family: "Neonscript",
  },
  {
    name: "Northshore",
    family: "Northshore",
  },
  {
    name: "Photogenic",
    family: "Photogenic",
  },
  {
    name: "Royalty",
    family: "Royalty",
  },
  {
    name: "Rocket",
    family: "Rocket",
  },
  {
    name: "Signature",
    family: "Signature",
  },
  {
    name: "Sorrento",
    family: "Sorrento",
  },
  {
    name: "WildScript",
    family: "WildScript",
  },
  {
    name: "Avante",
    family: "Avante",
  },
  {
    name: "Buttercup",
    family: "Buttercup",
  },
  {
    name: "ClassicType",
    family: "ClassicType",
  },
  {
    name: "Typewriter",
    family: "Typewriter",
  },
  {
    name: "Melbourne",
    family: "Melbourne",
  },
  {
    name: "NeoTokyo",
    family: "NeoTokyo",
  },
  {
    name: "Monaco",
    family: "Monaco",
  },
  {
    name: "Waikiki",
    family: "Waikiki",
  },
  {
    name: "Bellview",
    family: "Bellview",
  },
  {
    name: "LoveNeon",
    family: "LoveNeon",
  },
  {
    name: "Marquee",
    family: "Marquee",
  },
  {
    name: "Mayfair",
    family: "Mayfair",
  },
  {
    name: "NeonGlow",
    family: "NeonGlow",
  },
  {
    name: "NeonLite",
    family: "NeonLite",
  },
  {
    name: "Neontrace",
    family: "Neontrace",
  },
  {
    name: "Nevada",
    family: "Nevada",
  },
  {
    name: "SciFi",
    family: "SciFi",
  },
];

// ---------------------------
// Global Variables and Object Setup
// ---------------------------
const textArea = document.getElementById("text-panel");
basePrice = 90; // 90$ per square inch

// Color mapping from hex codes to color names
const colorNameMap = {
  "#F6E7D2": "Warm White",
  "#ffffff": "White",
  "#FF2A4D": "Red",
  "#FFF97C": "Lemon Yellow",
  "#FFD62E": "Golden Yellow",
  "#FF8D02": "Orange",
  "#FF90FF": "Pink",
  "#FF5CE8": "Hot Pink",
  "#8C59FF": "Purple",
  "#0274fc": "Royal Blue",
  "#90DCFF": "Ice Blue",
  "#80FFD9": "Mint",
  "#20B2AA": "Teal",
  "#0bd748": "Green",
  "#24b7de": "Tropical Blue",
  "RGB": "RGB Color Changing"
};

// neonObject holds the current state of the neon sign.
const neonObject = {
  text: document.getElementById("text-panel").value.trim() || "",
  fontFamily: "Avante",
  fontSize: "60px",
  color: "#F6E7D2", // Default color hex
  userHasEnteredText: false, // Track if user has entered any text
  colorName: "Warm White", // Default color name
  plan: {},
  lineHeight: parseInt("60px") * (lineHeightMultipliers["Avante"] || 1.2),
  variantId: "gid://shopify/ProductVariant/47595020091680",
  discountApplied: false,
  type: "indoor", // Indoor or Outdoor
  backboard: "clear", // Backboard color
  cutTo: "Cut to Shape" // Cut configuration
};

// ---------------------------
// Initialization Functions
// ---------------------------

// initFontPallate: Dynamically creates the font selection radio buttons.
// A mapping object assigns a custom preview size for each font.
function initFontPallate() {
  const fontPallate = document.getElementById("font-pallate");
  const fontSizes = {


    "Barcelona": "21px",
    "Alexa": "21px",
    "Bayview": "30px",
    "Amsterdam": "21px",
    "Greenworld": "21px",
    "NewCursive": "21px",
    "Vintage": "21px",
    "Venetian": "21px",
    "Amanda": "21px",
    "Austin": "39px",
    "Beachfront": "17px",
    "Chelsea": "29px",
    "Freehand": "21px",
    "Freespirit": "14px",
    "LoveNote": "21px",
    "Neonscript": "21px",
    "Northshore": "21px",
    "Photogenic": "21px",
    "Royalty": "17px",
    "Rocket": "18px",
    "Signature": "21px",
    "Sorrento": "21px",
    "WildScript": "21px",
    "Avante": "21px",
    "Buttercup": "21px",
    "ClassicType": "13px",
    "Typewriter": "15px",
    "Melbourne": "17px",
    "NeoTokyo": "17px",
    "Monaco": "21px",
    "Waikiki": "21px",
    "Bellview": "33px",
    "LoveNeon": "14px",
    "Marquee": "21px",
    "Mayfair": "21px",
    "NeonGlow": "19px",
    "NeonLite": "18px",
    "Neontrace": "13px",
    "Nevada": "29px",
    "SciFi": "21px"


  };

  fontFamilies.forEach((font) => {
    const size = fontSizes[font.name] || "60px";
    const label = document.createElement("label");
    label.className = "custom-radio";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "color-radio";
    input.value = font.family;
    input.setAttribute("data-name", font.name);

    const span = document.createElement("span");
    span.className = "radio-btn";
    const icon = document.createElement("i");
    icon.className = "las la-check";
    const div = document.createElement("div");
    div.className = "hobbies-icon";
    const h3 = document.createElement("h3");
    h3.className = "radio-font";
    h3.style.fontFamily = font.family;
    h3.style.fontSize = size;
    h3.textContent = font.name;

    div.appendChild(h3);
    span.appendChild(icon);
    span.appendChild(div);
    label.appendChild(input);
    label.appendChild(span);
    fontPallate.appendChild(label);
  });
}

// initFontSelection: Sets the initially selected font and triggers first drawing.
function initFontSelection() {
  const initialFontRadio =
    document.querySelector('input[name="color-radio"]:checked') ||
    document.querySelector('input[name="color-radio"]');
  if (initialFontRadio) {
    initialFontRadio.checked = true;
    const fontStyle = `${neonObject.fontSize} ${initialFontRadio.value}`; // Build font style string
    neonObject.fontFamily = initialFontRadio.value;
    // Update line height based on the selected font
    const baseFontSize = parseInt(neonObject.fontSize);
    const lineHeightMultiplier = lineHeightMultipliers[neonObject.fontFamily] || 1.2;
    neonObject.lineHeight = baseFontSize * lineHeightMultiplier;
    // Draw text with initial settings on SVG with id "mySVG"
    // Show placeholder text for visual, but don't calculate price yet
    drawTextWithMeasurement(
      "Your Text",
      fontStyle,
      neonObject.lineHeight,
      "mySVG",
      neonObject.color,
      false
    );
  }
}


//Debounce function

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}


// initEventListeners: Initializes all event listeners.
function initEventListeners() {
  // Limit textarea to 3 lines on mobile
  const isMobileDevice = window.innerWidth <= 767;
  if (isMobileDevice) {
    textArea.addEventListener("input", (e) => {
      const lines = e.target.value.split("\n");
      if (lines.length > 3) {
        e.target.value = lines.slice(0, 3).join("\n");
      }
    });
  }

  // Listen for changes in the text area
  textArea.addEventListener("keyup", debounce((e) => {
    // Update neonObject with new text
    const userText = e.target.value.trim();
    neonObject.text = userText;

    // Hide "Starting from" label and price update hint when user starts typing
    const startingFromLabel = document.querySelector('.starting-from-label');
    const priceUpdateHint = document.querySelector('.price-update-hint');

    if (e.target.value.length > 0) {
      if (startingFromLabel) {
        startingFromLabel.style.display = 'none';
      }
      if (priceUpdateHint) {
        priceUpdateHint.style.display = 'none';
      }
    }

    // Mark that user has entered text (even if they delete it later)
    if (userText.length > 0) {
      neonObject.userHasEnteredText = true;
    }
    neonObject.text = userText || "Your Text";
    const fontStyle = `${neonObject.fontSize} ${neonObject.fontFamily}`;

    // Get measurements for the new text
    const measurement = drawTextWithMeasurement(
      neonObject.text,
      fontStyle,
      neonObject.lineHeight,
      "mySVG",
      neonObject.color,
      true
    );

    if (measurement) {
      // Update dimensions
      neonObject.widthInches = measurement.widthInches;
      neonObject.heightInches = measurement.heightInches;

      // Calculate base price for the current dimensions
      const currentPrice = calculatePrice(neonObject.widthInches, neonObject.heightInches, basePrice);

      // Update the plan section with new measurements and prices
      updateOutput(neonObject.widthInches, neonObject.heightInches, basePrice);

      // Find the currently selected plan
      const selectedPlan = document.querySelector('input[name="plan"]:checked');
      if (selectedPlan) {
        const planLabel = selectedPlan.closest(".plan");
        if (planLabel) {
          // Update neonObject with current plan details
          neonObject.plan = {
            id: selectedPlan.id,
            price: planLabel.querySelector(".plan-price").textContent,
            width: planLabel.querySelector(".text-length").textContent.replace('"', ""),
            height: planLabel.querySelector(".text-height").textContent.replace('"', "")
          };
        }
      }

      // Update all price displays
      calculateTotalPriceAndUpdateUI(neonObject);

      // Update all price elements
      document.querySelectorAll('.prev-price').forEach(element => {
        element.textContent = `$${neonObject.totalPrice}`;
      });

      document.querySelectorAll('.discount-price').forEach(element => {
        element.textContent = `$${neonObject.discountPrice}`;
      });
    }
  }, 300));

  // Note: This DOMContentLoaded listener won't fire because initEventListeners() 
  // is called after DOM is already loaded. Initialization happens at bottom of file.

  // Listen for font selection changes
  document.querySelectorAll('input[name="color-radio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        neonObject.fontFamily = radio.value;
        const fontStyle = `${neonObject.fontSize} ${radio.value}`;

        // Update line height based on the selected font
        const baseFontSize = parseInt(neonObject.fontSize);
        const lineHeightMultiplier = lineHeightMultipliers[neonObject.fontFamily] || 1.2;
        neonObject.lineHeight = baseFontSize * lineHeightMultiplier;

        // ✅ Update dropdown font name and style
        const selectedFontText = radio.getAttribute("data-name");
        const selectedFontElement = document.getElementById("selectedFontName");
        if (selectedFontElement) {
          selectedFontElement.textContent = selectedFontText;
          selectedFontElement.style.fontFamily = radio.value;
        }

        // Remove .selected from all font previews
        document.querySelectorAll('.font-pallate-inside .radio-font').forEach(el => el.classList.remove('selected'));
        // Add .selected to the current font preview
        const h3 = radio.nextElementSibling;
        if (h3) h3.classList.add('selected');

        // Redraw text with the new font and update measurements
        const measurement = drawTextWithMeasurement(
          textArea.value.trim() || "Your Text",
          fontStyle,
          neonObject.lineHeight,
          "mySVG",
          neonObject.color,
          true
        );
        if (measurement) {
          neonObject.widthInches = measurement.widthInches;
          neonObject.heightInches = measurement.heightInches;
          updateOutput(neonObject.widthInches, neonObject.heightInches, basePrice);
          calculateTotalPriceAndUpdateUI(neonObject);
        }

        // Close the dropdown after selection
        const detailsElement = radio.closest('details');
        if (detailsElement) {
          // Use direct property assignment which is more reliable
          detailsElement.open = false;
        }

      }
    });
  });

  // RGB color cycling variables
  let rgbInterval = null;
  const rgbColors = [
    '#F6E7D2', '#ffffff', '#FF2A4D', '#FFF97C', '#FFD62E', '#FF8D02',
    '#FF90FF', '#FF5CE8', '#8C59FF', '#4169E1', '#90DCFF', '#80FFD9',
    '#20B2AA', '#39FF14'
  ];
  let currentRgbIndex = 0;

  // Listen for color changes
  document.querySelectorAll('input[name="color-selector"]').forEach((input) => {
    input.addEventListener("change", function (event) {
      event.preventDefault();
      if (this.checked) {
        const currentText = textArea.value.trim() || "Your Text";
        const selectedColor = this.value;
        const fontStyle = `${neonObject.fontSize} ${neonObject.fontFamily}`;

        // Stop RGB cycling if it was running
        if (rgbInterval) {
          clearInterval(rgbInterval);
          rgbInterval = null;
        }

        // Check if RGB is selected
        if (selectedColor === 'RGB') {
          // Add $50 RGB surcharge
          neonObject.rgbSurcharge = 50;
          neonObject.colorName = "RGB Color Changing";

          // Start RGB color cycling
          currentRgbIndex = 0;
          rgbInterval = setInterval(() => {
            const cycleColor = rgbColors[currentRgbIndex];
            neonObject.color = cycleColor;
            drawTextWithMeasurement(
              currentText,
              fontStyle,
              neonObject.lineHeight,
              "mySVG",
              cycleColor,
              true
            );
            currentRgbIndex = (currentRgbIndex + 1) % rgbColors.length;
          }, 500); // Change color every 500ms
        } else {
          // Remove RGB surcharge for normal colors
          neonObject.rgbSurcharge = 0;

          // Normal color selection
          neonObject.color = selectedColor;
          neonObject.colorName = colorNameMap[selectedColor] || selectedColor;
          // Redraw text with the new color
          drawTextWithMeasurement(
            currentText,
            fontStyle,
            neonObject.lineHeight,
            "mySVG",
            selectedColor,
            true
          );
        }

        // Recalculate price with RGB surcharge
        calculateTotalPriceAndUpdateUI(neonObject);
      }
    });
  });

  // Listen for window resize events to adjust SVG size and redraw text
  addEventListener("resize", (e) => {
    var svg = document.getElementById("mySVG");
    var parentElement = svg.parentElement;
    var parentWidth = parentElement.clientWidth;
    var parentHeight = parentElement.clientHeight;
    svg.setAttribute("width", parentWidth * 0.9);
    svg.setAttribute("height", parentHeight * 0.8);
    const fontStyle = `${neonObject.fontSize} ${neonObject.fontFamily}`;
    const currentText = textArea.value.trim() || "Your Text";
    drawTextWithMeasurement(
      currentText,
      fontStyle,
      neonObject.lineHeight,
      "mySVG",
      neonObject.color,
      true
    );
  });

  // Listen for "switch-rounded" toggle changes
  document.getElementById("switch-rounded").addEventListener("change", (e) => {
    const fontStyle = `${neonObject.fontSize} ${neonObject.fontFamily}`;
    drawTextWithMeasurement(
      neonObject.text,
      fontStyle,
      neonObject.lineHeight,
      "mySVG",
      neonObject.color,
      true
    );
  });
}

// ---------------------------
// Price Calculation Function
// ---------------------------
// calculatePrice: Computes the final cost based on area, product cost per inch, shipping, and profit margins.
function calculatePrice(maxWidthInches, maxHeightInches, basePrice, isRGB) {
  const area = maxWidthInches * maxHeightInches; // Calculate area in square inches
  // Define cost per inch values
  const productCostPerInch = isRGB ? 0.2947 : 0.2519;
  const shippingCostPerInch = 0.25;
  const usdToCadMultiplier = 1.42; // Multiplier for converting USD to CAD

  // Calculate costs for shipping and product
  const shippingCost = area * shippingCostPerInch;
  const productCost = area * productCostPerInch;
  const localShippingCostUSD = 45 / usdToCadMultiplier; // Local shipping cost in CAD

  // Calculate profit as the greater of 35% of (product + shipping + local shipping) or 100 CAD converted to USD
  const profitUSD = Math.max(0.35 * (productCost + shippingCost + localShippingCostUSD), 100 / usdToCadMultiplier);
  const totalCostUSD = productCost + shippingCost + profitUSD + localShippingCostUSD;
  const totalCostCADWithDiscount = totalCostUSD * usdToCadMultiplier;
  let totalCostCAD = totalCostCADWithDiscount * usdToCadMultiplier;

  // Double the price for specific fonts
  if (['LoveNeon', 'SciFi', 'Mayfair'].includes(neonObject.fontFamily)) {
    totalCostCAD *= 2;
  }
  // Ensure final price is not below the base price
  return Math.max(totalCostCAD, basePrice);
}

// ---------------------------
// Draw Text with Measurements
// ---------------------------
// drawTextWithMeasurement: Draws text on an SVG element, calculates measurements, and optionally shows measurement guides.
function drawTextWithMeasurement(
  text,
  font,
  lineHeight,
  svgId,
  HexColor,
  showMeasurement,
  width,
  height,
  update
) {



  // Get the target SVG and its parent's dimensions.
  var svg = document.getElementById(svgId);
  var parentElement = svg.parentElement;
  var parentWidth = parentElement.clientWidth;
  var parentHeight = parentElement.clientHeight;
  svg.setAttribute("width", parentWidth * 0.8);
  svg.setAttribute("height", parentHeight * 0.8);

  const svgRect = svg.getBoundingClientRect();
  // Remove any existing children from the SVG.
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  // Parse font size and family from the passed font string.
  var fontSize = parseInt(font.match(/\d+px/)[0]);
  var fontFamily = font.replace(/\d+px\s*/, "");

  // Split text into lines and limit to 3 lines on mobile
  var lines = text.split("\n");
  const isMobile = window.innerWidth <= 767;
  if (isMobile && lines.length > 3) {
    lines = lines.slice(0, 3);
  }

  var maxX = [];
  var minX = [];
  var minY = [];
  var maxY = [];
  var textXPositions = [];
  var textYPositions = [];

  // Create a canvas for measuring text.
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = `${fontSize}px ${fontFamily}`;

  // getTextMetrics: Measures text width, ascent, descent, and height.
  function getTextMetrics(text, fontSize, fontFamily) {
    context.font = `${fontSize}px ${fontFamily}`;
    const metrics = context.measureText(text);
    const width = metrics.width;
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    return {
      width,
      height,
      ascent: metrics.actualBoundingBoxAscent,
      descent: metrics.actualBoundingBoxDescent,
    };
  }

  // ---------------------------
  // Auto-adjust font size if text exceeds SVG bounds
  // Define a bounding box that text must fit within
  // ---------------------------
  const targetWidthRatio = isMobile ? 0.42 : 0.9;
  const targetHeightRatio = isMobile ? 0.14 : 0.9;
  const boundingBoxWidth = svgRect.width * targetWidthRatio;
  const boundingBoxHeight = svgRect.height * targetHeightRatio;
  const extraSpacing = 3; // Optional extra spacing between lines

  // Function to calculate text positions and dimensions
  function calculateTextLayout(testFontSize) {
    const positions = {
      textXPositions: [],
      textYPositions: [],
      maxX: [],
      minX: [],
      maxY: [],
      minY: []
    };

    let currentY = isMobile ? svgRect.height * 0.10 : svgRect.height * 0.10;

    lines.forEach((line) => {
      const { width: lineWidth, ascent, descent } = getTextMetrics(line, testFontSize, fontFamily);
      const xPos = (svgRect.width - lineWidth) / 2;
      const yPos = currentY + ascent;

      positions.textXPositions.push(xPos);
      positions.textYPositions.push(yPos);
      positions.maxX.push(xPos + lineWidth);
      positions.minX.push(xPos);
      positions.maxY.push(yPos + descent);
      positions.minY.push(currentY);

      currentY += ascent + descent + extraSpacing;
    });

    return positions;
  }

  // Find the optimal font size that fits within the bounding box
  while (fontSize > 5) {
    const layout = calculateTextLayout(fontSize);
    const textWidth = Math.max(...layout.maxX) - Math.min(...layout.minX);
    const textHeight = Math.max(...layout.maxY) - Math.min(...layout.minY);

    // Check if text fits within the bounding box
    if (textWidth <= boundingBoxWidth && textHeight <= boundingBoxHeight) {
      // Text fits! Use this layout
      textXPositions = layout.textXPositions;
      textYPositions = layout.textYPositions;
      maxX = layout.maxX;
      minX = layout.minX;
      maxY = layout.maxY;
      minY = layout.minY;
      break;
    }

    fontSize--;
    context.font = `${fontSize}px ${fontFamily}`;
  }

  // ---------------------------
  // Draw the text lines onto the SVG
  // ---------------------------
  lines.forEach((line, i) => {
    const { width: lineWidth, ascent, descent } = getTextMetrics(line, fontSize, fontFamily);
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("x", textXPositions[i]);
    textElement.setAttribute("y", textYPositions[i]);
    textElement.setAttribute("fill", "white");
    textElement.style.whiteSpace = "nowrap";
    textElement.style.fontVariantLigatures = " no-common-ligatures";
    textElement.setAttribute("font-size", fontSize);
    textElement.setAttribute("font-family", fontFamily);
    textElement.setAttribute("class", "mainText");
    textElement.textContent = line;
    svg.appendChild(textElement);
    applyNeonEffect(textElement, HexColor);
  });

  // ---------------------------
  // Neon Effect Functions
  // ---------------------------
  // applyNeonEffect: Applies a neon glow to a text element.
  function applyNeonEffect(element, color) {
    element.classList.add("text-transition");
    element.style.fill = "white";
    element.style.textShadow = `
    ${color} 0px 0px 2px,
    ${color} 0px 0px 5px,
    ${color} 0px 0px 10px,
    ${color} 0px 0px 20px,
    ${color} 0px 0px 30px,
    ${color} 0px 0px 40px,
    ${color} 0px 0px 55px,
    ${color} 0px 0px 65px,
    ${color} 0px 0px 75px,
    ${color} 0px 0px 95px,
    ${color} 0px 0px 120px
  `;
  }
  // applyNormalEffect: Applies a normal (non-neon) style to a text element.
  function applyNormalEffect(element, color) {
    function hexToRgb(hex) {
      hex = hex.replace("#", "");
      var intValue = parseInt(hex, 16);
      var r = (intValue >> 16) & 255;
      var g = (intValue >> 8) & 255;
      var b = intValue & 255;
      return `${r}, ${g}, ${b}`;
    }
    const rgbColor = hexToRgb(color);
    element.classList.add("text-transition");
    element.style.textShadow = `
    rgba(${rgbColor},0.5) 0px 1px 1px,
    rgba(${rgbColor},0.5) 0px 2px 1px,
    rgba(${rgbColor},0.6) 0px 4px 2px,
    rgba(0,0,0,0.6) 0px 5px 2px
  `;
    element.style.fill = color;
  }

  // Listen for switch-rounded change to toggle neon/normal effects
  document.getElementById("switch-rounded").addEventListener("change", (e) => {
    const textElements = document.querySelectorAll("#mySVG .mainText");
    textElements.forEach((textElement) => {
      if (e.target.checked) {
        applyNeonEffect(textElement, HexColor);
      } else {
        applyNormalEffect(textElement, HexColor);
      }
    });
  });

  // ---------------------------
  // Calculate Dimensions and Measurements
  // ---------------------------
  let charCount = text.length;
  let maxCharacters = 0;
  // Calculate the max width in inches by conversion (width per letter in inches)
  let maxWidthInches = maxCharacters * 1.8; //2.5 inches per letter
  let totalCalculatedHeight = Math.max(...maxY) - Math.min(...minY);
  let maxWidth = Math.max(...maxX) - Math.min(...minX);

  lines.forEach((line, i) => {
    charCount = line.length;
    maxCharacters = Math.max(maxCharacters, charCount);
    maxWidthInches = maxCharacters * 2.5;
  });
  // Calculate aspect ratio and derived height in inches.
  let aspectRatio = maxWidth / totalCalculatedHeight;
  let maxHeightInches = maxWidthInches / aspectRatio;

  // Optionally, draw measurement guides if showMeasurement is true.
  if (showMeasurement) {
    const oldMeasurements = document.querySelectorAll(".measurement-texts");
    oldMeasurements.forEach((element) => element.remove());

    const ascentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    ascentPath.setAttribute("d", `M ${Math.min(...minX)},${Math.min(...minY)} H ${getTextMetrics(text).width}`);
    ascentPath.setAttribute("stroke", "white");
    ascentPath.setAttribute("stroke-dasharray", "4");
    ascentPath.setAttribute("fill", "none");

    const descentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // Ensure horizontal line stays within canvas
    const horizontalLineY = Math.min(Math.max(...maxY) + 20, svgRect.height - 30);
    descentPath.setAttribute("d", `M ${Math.min(...minX)},${horizontalLineY} H ${Math.max(...maxX)}`);
    descentPath.setAttribute("stroke", "white");
    descentPath.setAttribute("stroke-dasharray", "4");
    descentPath.setAttribute("fill", "none");

    const leftVerticalPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    leftVerticalPath.setAttribute("d", `M ${Math.min(...minX)},${Math.min(...minY)} V ${Math.max(...maxY)}`);
    leftVerticalPath.setAttribute("stroke", "green");
    leftVerticalPath.setAttribute("stroke-dasharray", "4");
    leftVerticalPath.setAttribute("fill", "none");

    const rightVerticalPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // Ensure vertical line stays within canvas
    const verticalLineX = Math.min(Math.max(...maxX) + 20, svgRect.width - 50);
    rightVerticalPath.setAttribute("d", `M ${verticalLineX},${Math.min(...minY)} V ${Math.max(...maxY)}`);
    rightVerticalPath.setAttribute("stroke", "white");
    rightVerticalPath.setAttribute("stroke-dasharray", "4");
    rightVerticalPath.setAttribute("fill", "none");

    svg.appendChild(descentPath);
    svg.appendChild(rightVerticalPath);

    const horizontalText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    horizontalText.setAttribute("class", "measurement-texts");
    const verticalText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    verticalText.setAttribute("class", "measurement-texts");

    lines.forEach((line, index) => {
      const textStartX = textXPositions[index];
      const textEndX = Math.max(...maxX);
      const textY = svgRect.height * 0.3 + index * (getTextMetrics(line).descent + getTextMetrics(line).ascent + 20);

      var widthText;
      if (!update) {
        widthText = Math.round(maxWidthInches).toFixed();
      } else {
        widthText = width;
      }
      horizontalText.textContent = `${widthText}"`;
      horizontalText.setAttribute("x", svg.getBoundingClientRect().width / 2);
      // Ensure horizontal measurement stays within canvas bounds
      const horizontalTextY = Math.min(Math.max(...maxY) + 40, svgRect.height - 20);
      horizontalText.setAttribute("y", horizontalTextY);
      horizontalText.setAttribute("font-size", "14");
      horizontalText.setAttribute("fill", "white");
      horizontalText.setAttribute("text-anchor", "middle");
      svg.appendChild(horizontalText);

      var heightText;
      if (!update) {
        heightText = Math.round(maxHeightInches).toFixed();
      } else {
        heightText = height;
      }
      verticalText.textContent = `${heightText}"`;
      // Ensure vertical measurement stays within canvas bounds
      const verticalTextX = Math.min(Math.max(...maxX) + 40, svgRect.width - 30);
      verticalText.setAttribute("x", verticalTextX);
      verticalText.setAttribute("y", Math.max(...maxY) - (Math.max(...maxY) - Math.min(...minY)) / 2);
      verticalText.setAttribute("font-size", "14");
      verticalText.setAttribute("fill", "white");
      verticalText.setAttribute("text-anchor", "middle");
      svg.appendChild(verticalText);

      const horizontalLineStart = document.createElementNS("http://www.w3.org/2000/svg", "line");
      horizontalLineStart.setAttribute("d", `M ${textStartX},${Math.min(...minY)} V ${textY + getTextMetrics(line).descent} H ${textStartX + 10}`);
      horizontalLineStart.setAttribute("y1", -3);
      horizontalLineStart.setAttribute("y2", 3);
      horizontalLineStart.setAttribute("x1", 0);
      horizontalLineStart.setAttribute("x2", 0);
      horizontalLineStart.setAttribute("transform", `translate(${Math.min(...minX) - 3}, ${horizontalLineY})`);
      horizontalLineStart.setAttribute("stroke", "white");
      horizontalLineStart.setAttribute("stroke-width", "1.5");

      const horizontalEnd = document.createElementNS("http://www.w3.org/2000/svg", "line");
      horizontalEnd.setAttribute("y1", -3);
      horizontalEnd.setAttribute("y2", 3);
      horizontalEnd.setAttribute("x1", 0);
      horizontalEnd.setAttribute("x2", 0);
      horizontalEnd.setAttribute("transform", `translate(${Math.max(...maxX) + 3}, ${horizontalLineY})`);
      horizontalEnd.setAttribute("stroke", "white");
      horizontalEnd.setAttribute("stroke-width", "1.5");

      const verticalperpendicularLineStart = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const vertLineStartX = Math.min(Math.max(...maxX) + 17, svgRect.width - 40);
      verticalperpendicularLineStart.setAttribute("x1", vertLineStartX);
      verticalperpendicularLineStart.setAttribute("x2", vertLineStartX + 6);
      verticalperpendicularLineStart.setAttribute("y1", Math.min(...minY));
      verticalperpendicularLineStart.setAttribute("y2", Math.min(...minY));
      verticalperpendicularLineStart.setAttribute("stroke", "white");
      verticalperpendicularLineStart.setAttribute("stroke-width", "1.5");

      const verticalperpendicularLineEnd = document.createElementNS("http://www.w3.org/2000/svg", "line");
      verticalperpendicularLineEnd.setAttribute("x1", -3);
      verticalperpendicularLineEnd.setAttribute("x2", 3);
      verticalperpendicularLineEnd.setAttribute("y1", 0);
      verticalperpendicularLineEnd.setAttribute("y2", 0);
      verticalperpendicularLineEnd.setAttribute("stroke", "white");
      verticalperpendicularLineEnd.setAttribute("stroke-width", "1.5");
      verticalperpendicularLineEnd.setAttribute("transform", `translate(${verticalLineX}, ${Math.max(...maxY) + 2})`);

      svg.appendChild(verticalperpendicularLineStart);
      svg.appendChild(verticalperpendicularLineEnd);
      svg.appendChild(horizontalLineStart);
      svg.appendChild(horizontalEnd);
    });
  }

  // Return the calculated width and height in inches.
  return {
    widthInches: maxWidthInches,
    heightInches: maxHeightInches,
  };
}

// ---------------------------
// Price Rounding Helpers
// ---------------------------

// adjustToNinetyNine: Rounds a number so that it ends in .99.
function adjustToNinetyNine(num) {
  if (num > 0) {
    return Math.ceil(num) - 0.01;
  } else {
    return 0;
  }
}

// roundDimensions: Rounds a metric value.
function roundDimensions(metric, height) {
  const roundedMetric = Math.round(metric);
  return roundedMetric;
}

// ---------------------------
// Update Output for Plans Section
// ---------------------------
// updateOutput: Generates the HTML content for plan options and updates the UI.
function updateOutput(width, height, basePrice) {
  const outputDiv = document.getElementById("plan-section");
  let htmlContent = '<div class="plans">';

  // Price multipliers to scale prices for different sizes.
  const scale = 1.3;
  const planDetails = [
    { id: "basic", planName: "Mini", value: 86, length: 2, height: 1 },
    { id: "complete", planName: "Small", value: 112, length: 3, height: 2 },
    { id: "complete1", planName: "Medium", value: 108, length: 4, height: 2 },
    { id: "complete2", planName: "Large", value: 95, length: 5, height: 3 },
    { id: "complete3", planName: "XL", value: 80, length: 6, height: 2 },
    { id: "complete4", planName: "XXL", value: 110, length: 5, height: 1 },
    { id: "complete5", planName: "XXXL", value: 97, length: 5, height: 2 },
    { id: "complete6", planName: "4XL", value: 200, length: 8, height: 4 },
  ];

  price = calculatePrice(width, height, basePrice);

  planDetails.forEach((plan, index) => {
    const currentScale = Math.pow(scale, index);
    const scaledWidth = roundDimensions(width * currentScale);
    const scaledHeight = roundDimensions(height * currentScale);
    const scaledPriceCompute = calculatePrice(scaledWidth, scaledHeight, basePrice);
    // Round the price to the nearest .99
    const scaledPrice = adjustToNinetyNine(scaledPriceCompute);

    htmlContent += `
    <label class="plan ${plan.id === "basic" ? "basic-plan" : "complete-plan"}" for="${plan.id}">
        <input type="radio" id="${plan.id}" name="plan" value="${scaledPrice}" ${plan.id === "basic" ? "checked" : ""}>
        <div class="plan-content">
            <div class="size_tx">
                <p>${plan.planName}</p>
                <span>Length: <span class="text-length">${scaledWidth}</span>"</span>
            </div>
            <div class="size_tx">
                <p class="txb">$<small class="plan-price">${scaledPrice}</small></p>
                <span>Height: <span class="text-height">${scaledHeight}</span>"</span>
            </div>
        </div>
    </label>
  `;
  });
  htmlContent += "</div>";
  // Create plans container and populate it
  const plansContainer = document.createElement("div");
  plansContainer.className = "plans";

  // Use existing price calculation
  price = calculatePrice(width, height, basePrice);

  // Create plan elements
  planDetails.forEach((plan, index) => {
    const currentScale = Math.pow(scale, index);
    const scaledWidth = roundDimensions(width * currentScale);
    const scaledHeight = roundDimensions(height * currentScale);
    const scaledPriceCompute = calculatePrice(scaledWidth, scaledHeight, basePrice);
    const scaledPrice = adjustToNinetyNine(scaledPriceCompute);

    const label = document.createElement("label");
    label.className = `plan ${plan.id === "basic" ? "basic-plan" : "complete-plan"}`;
    label.setAttribute("for", plan.id);

    const input = document.createElement("input");
    input.type = "radio";
    input.id = plan.id;
    input.name = "plan";
    input.value = scaledPrice;
    if (plan.id === "basic") input.checked = true;

    const planContent = document.createElement("div");
    planContent.className = "plan-content";

    const sizeTx1 = document.createElement("div");
    sizeTx1.className = "size_tx";
    sizeTx1.innerHTML = `<p>${plan.planName}</p><span>Length: <span class="text-length">${scaledWidth}</span>"</span>`;

    const sizeTx2 = document.createElement("div");
    sizeTx2.className = "size_tx";
    sizeTx2.innerHTML = `<p class="txb">$<small class="plan-price">${scaledPrice}</small><p style="font-size: 20px;color: #000;"><span style="font-size: 14px; font-weight: 600;">$</span>${adjustToNinetyNine(scaledPrice * 0.80)}</p></p><span>Height: <span class="text-height">${scaledHeight}</span>"</span>`;

    planContent.appendChild(sizeTx1);
    planContent.appendChild(sizeTx2);
    label.appendChild(input);
    label.appendChild(planContent);
    plansContainer.appendChild(label);
  });

  outputDiv.innerHTML = ""; // Clear previous content
  outputDiv.appendChild(plansContainer);

  // After regenerating plans, sync neonObject.plan from the currently selected plan
  const selectedPlan = document.querySelector('input[name="plan"]:checked');
  if (selectedPlan) {
    const planLabel = selectedPlan.closest(".plan");
    if (planLabel) {
      const priceText = planLabel.querySelector(".plan-price")?.textContent?.trim();
      const widthText = planLabel.querySelector(".text-length")?.textContent?.trim();
      const heightText = planLabel.querySelector(".text-height")?.textContent?.trim();

      neonObject.plan = {
        id: selectedPlan.id,
        price: priceText || '0',
        width: widthText || '0',
        height: heightText || '0'
      };
    }
  }

  // Update the UI with the total price and setup plan selection listeners.
  calculateTotalPriceAndUpdateUI(neonObject);
  setupPlanEventListeners();
}

// setupPlanEventListeners: Adds click event listeners to each plan's label to prevent scroll jump.
function setupPlanEventListeners() {
  const plans = document.querySelectorAll('input[name="plan"]');
  plans.forEach((planInput) => {
    // Find the label associated with the input
    const planLabel = document.querySelector(`label[for="${planInput.id}"]`);
    if (planLabel) {
      planLabel.addEventListener("click", function (event) {
        // Prevent the browser's default behavior that causes the scroll jump.
        event.preventDefault();

        // Manually check the radio button.
        if (!planInput.checked) {
          planInput.checked = true;

          // Create a new 'change' event and dispatch it on the input
          // to ensure our existing logic in planChangeHandler runs.
          const changeEvent = new Event('change', { bubbles: true });
          planInput.dispatchEvent(changeEvent);
        }
      });
    }

    // We still need the original handler for direct interactions or accessibility tools.
    planInput.addEventListener("change", planChangeHandler);
  });
}

// planChangeHandler: Updates neonObject with the selected plan details and triggers redraw.
function planChangeHandler(event) {
  // Prevent default behavior and stop propagation
  event.preventDefault();
  event.stopPropagation();



  const planId = event.target.id;
  const planLabel = document.getElementById(planId).closest(".plan");
  const scaledWidth = planLabel.querySelector(".text-length").textContent.replace('"', "");
  const scaledHeight = planLabel.querySelector(".text-height").textContent.replace('"', "");
  const scaledPrice = planLabel.querySelector(".plan-price").textContent;

  // Update neonObject with the selected plan details.
  neonObject.plan = {
    id: planId,
    price: scaledPrice,
    width: scaledWidth,
    height: scaledHeight,
  };

  // Set radio button checked state manually since we prevented default
  event.target.checked = true;

  drawTextWithMeasurement(
    neonObject.text,
    neonObject.fontSize + " " + neonObject.fontFamily,
    neonObject.lineHeight,
    "mySVG",
    neonObject.color,
    true,
    neonObject.plan.width,
    neonObject.plan.height,
    true
  );
  calculateTotalPriceAndUpdateUI(neonObject);


}

// ---------------------------
// Other Event Handlers and Utilities
// ---------------------------

// Handle selection for indoor/outdoor options.
document.addEventListener("DOMContentLoaded", () => {
  const radioButtons = document.querySelectorAll('input[name="position"]'); // Radios for position
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.id === "test2" && radio.checked) {
        neonObject.type = "outdoor";
        neonObject.additionalPrice = parseInt(radio.value, 10);
        calculateTotalPriceAndUpdateUI(neonObject);
      } else if (radio.id === "test1" && radio.checked) {
        neonObject.type = "indoor";
        neonObject.additionalPrice = 0;
        calculateTotalPriceAndUpdateUI(neonObject);
      }
    });
  });
});

// Handle selection for cutto option.
// document.addEventListener("DOMContentLoaded", function () {
// const radios = document.querySelectorAll('.radio-buttons input[type="radio"][name="bb-radio"]');
// radios.forEach((radio) => {
//   radio.addEventListener("change", function () {
//     if (this.checked) {
//       const title = this.closest(".custom-radio").querySelector(".title_backboard span").textContent;
//       neonObject.cutTo = title;
//     }
//   });
// });
// });





document.addEventListener("DOMContentLoaded", function () {
  const radios = document.querySelectorAll('.radio-buttons input[type="radio"][name="bb-radio"]');

  radios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        const wrapper = this.closest(".custom-radio");
        const titleSpan = wrapper?.querySelector(".title_backboard span");

        if (titleSpan) {
          neonObject.cutTo = titleSpan.textContent;
        }
      }
    });
  });
});


// Handle extras (checkboxes and dropdowns).
document.addEventListener("DOMContentLoaded", function () {
  neonObject.extras = [];
  const checkboxes = document.querySelectorAll('input[type="checkbox"][name="offer"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      updateExtras(this, this.checked);
    });
  });
  const optionElements = document.querySelectorAll(".options-list .option");
  optionElements.forEach((option) => {
    option.addEventListener("click", function () {
      updateSelectOption(this);
    });
  });
});

// updateExtras: Adds or removes extras from neonObject.
function updateExtras(checkbox, isChecked) {
  if (isChecked) {
    neonObject.extras.push({
      id: checkbox.id,
      description: checkbox.value,
      price: parseInt(checkbox.dataset.price, 10),
    });
  } else {
    neonObject.extras = neonObject.extras.filter((extra) => extra.id !== checkbox.id);
  }
  calculateTotalPriceAndUpdateUI(neonObject);
}

// updateSelectOption: Updates an extra's price and description based on dropdown selection.
function updateSelectOption(optionElement) {
  let parentDropdown = optionElement.closest(".select-menu");
  let associatedCheckboxId = parentDropdown.previousElementSibling.getAttribute("for");
  let price = parseInt(optionElement.textContent.match(/\$(\d+)/)[1], 10);
  let extra = neonObject.extras.find((extra) => extra.id === associatedCheckboxId);
  if (extra) {
    extra.price = price;
    extra.description = optionElement.textContent;
  }
}

// Handle selection for backboard color.
document.addEventListener("DOMContentLoaded", function () {
  const backboardColorRadios = document.querySelectorAll('input[type="radio"][name="group3"]');
  window.neonObject = window.neonObject || {};
  backboardColorRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        neonObject.backboard = this.value;
      }
    });
  });
  const checkedRadio = document.querySelector('input[type="radio"][name="group3"]:checked');
  if (checkedRadio) {
    neonObject.backboard = checkedRadio.value;
  }
});

// calculateTotalPriceAndUpdateUI: Sums up all price components and updates the UI.
function calculateTotalPriceAndUpdateUI(neonObject) {
  // If there is no selected plan yet, fall back to fixed starting price
  // This avoids showing mismatched values when the builder hasn't fully initialized.
  if (!neonObject.plan || !neonObject.plan.price) {
    const fixedStartingPrice = 214.99;
    const fixedDiscountPrice = 171.99; // 20% off

    const prevPriceElement = document.querySelectorAll(".prev-price");
    const discountPriceElement = document.querySelectorAll(".discount-price");

    if (prevPriceElement && prevPriceElement.length > 0) {
      prevPriceElement.forEach((element) => {
        element.textContent = `$${fixedStartingPrice}`;
      });
    }

    if (discountPriceElement && discountPriceElement.length > 0) {
      discountPriceElement.forEach((element) => {
        element.textContent = `$${fixedDiscountPrice}`;
      });
    }

    neonObject.totalPrice = fixedStartingPrice;
    neonObject.discountPrice = fixedDiscountPrice;
    neonObject.originalDiscountPrice = fixedDiscountPrice;
    return;
  }

  // We have a selected plan: calculate real price from the plan and any extras
  let total = 0;
  if (neonObject.plan && neonObject.plan.price) {
    total += parseFloat(neonObject.plan.price);
  }
  if (neonObject.extras && Array.isArray(neonObject.extras)) {
    neonObject.extras.forEach((extra) => {
      if (extra.price) {
        total += parseFloat(extra.price);
      }
    });
  }
  if (neonObject.additionalPrice) {
    total += parseFloat(neonObject.additionalPrice);
  }
  // Add RGB surcharge if RGB is selected
  if (neonObject.rgbSurcharge) {
    total += parseFloat(neonObject.rgbSurcharge);
  }
  total = adjustToNinetyNine(total);

  // Base discount (site-wide promo, e.g. 20% off)
  let baseDiscountPrice = total * 0.80;
  baseDiscountPrice = adjustToNinetyNine(baseDiscountPrice);

  // Persist the non-coupon discounted price so we can reapply coupons later
  neonObject.originalDiscountPrice = baseDiscountPrice;

  // If a coupon code is active, apply it on top of the base discount
  let finalDiscountPrice = baseDiscountPrice;
  if (neonObject.discountApplied && neonObject.activeDiscount) {
    if (neonObject.activeDiscount.type === 'percentage' && neonObject.activeDiscount.value) {
      finalDiscountPrice = baseDiscountPrice * (1 - neonObject.activeDiscount.value / 100);
    } else if (neonObject.activeDiscount.type === 'amount' && neonObject.activeDiscount.value) {
      finalDiscountPrice = baseDiscountPrice - neonObject.activeDiscount.value;
    }
    finalDiscountPrice = adjustToNinetyNine(finalDiscountPrice);
  }
  const prevPriceElement = document.querySelectorAll(".prev-price");
  const discountPriceElement = document.querySelectorAll(".discount-price");

  if (prevPriceElement && prevPriceElement.length > 0) {
    prevPriceElement.forEach((element) => {
      element.textContent = `$${total}`;
    });
  }

  if (discountPriceElement && discountPriceElement.length > 0) {
    discountPriceElement.forEach((element) => {
      element.textContent = `$${finalDiscountPrice}`;
    });
  }

  // Also update the summary-total element in the modal
  const summaryTotal = document.getElementById('summary-total');
  if (summaryTotal) {
    summaryTotal.textContent = `$${finalDiscountPrice}`;
  }

  // Update discount breakdown message in the discount section
  const discountMessageEl = document.getElementById('discount-message');
  if (discountMessageEl) {
    if (neonObject.discountApplied && neonObject.activeDiscount) {
      const beforeCoupon = neonObject.originalDiscountPrice || baseDiscountPrice;
      let description = '';

      if (neonObject.activeDiscount.type === 'percentage' && neonObject.activeDiscount.value) {
        description = `${neonObject.activeDiscount.value}% off with ${neonObject.discountCode || 'discount code'}`;
      } else if (neonObject.activeDiscount.type === 'amount' && neonObject.activeDiscount.value) {
        description = `$${neonObject.activeDiscount.value} off with ${neonObject.discountCode || 'discount code'}`;
      }

      discountMessageEl.innerHTML = `Plan price: <span style="text-decoration: line-through; opacity: 0.7;">$${beforeCoupon}</span> <strong>$${finalDiscountPrice}</strong>${description ? ` <span>(${description})</span>` : ''}`;
    } else {
      // No active coupon: clear message
      discountMessageEl.textContent = '';
    }
  }

  // Visually reflect coupon on the selected size card's bold current price line
  // The bold price is rendered in the second <p> inside the price row (.size_tx)
  const allBoldPriceLines = document.querySelectorAll('.plan .size_tx p:last-of-type');

  // Reset any previous coupon styling on all bold price lines
  allBoldPriceLines.forEach((boldP) => {
    boldP.style.opacity = '';

    // Unwrap any previous strike span
    const strikeSpan = boldP.querySelector('.bold-price-strike');
    if (strikeSpan) {
      strikeSpan.replaceWith(strikeSpan.innerHTML);
    }

    const existingBadge = boldP.querySelector('.plan-coupon-percent');
    if (existingBadge) {
      existingBadge.remove();
    }
  });

  // Apply styling only if a coupon is active and a plan is selected
  if (neonObject.discountApplied && neonObject.activeDiscount) {
    const selectedPlanInput = document.querySelector('input[name="plan"]:checked');
    if (selectedPlanInput) {
      const planLabel = selectedPlanInput.closest('.plan');
      if (planLabel) {
        // Price row is the second .size_tx block (index 1)
        const priceRow = planLabel.querySelectorAll('.size_tx')[1];
        if (priceRow) {
          const boldP = priceRow.querySelector('p:last-of-type');
          if (boldP) {
            boldP.style.opacity = '0.7';

            // Wrap existing bold price content in a strike-through span
            const currentHTML = boldP.innerHTML;
            boldP.innerHTML = `<span class="bold-price-strike" style="text-decoration: line-through;">${currentHTML}</span>`;

            // Show coupon percentage/amount next to the bold price
            const badge = document.createElement('span');
            badge.className = 'plan-coupon-percent';
            badge.style.marginLeft = '6px';
            badge.style.fontSize = '13px';
            badge.style.fontWeight = '600';
            badge.style.color = '#000';
            badge.style.textDecoration = 'none';

            if (neonObject.activeDiscount.type === 'percentage' && neonObject.activeDiscount.value) {
              badge.textContent = `-${neonObject.activeDiscount.value}%`;
            } else if (neonObject.activeDiscount.type === 'amount' && neonObject.activeDiscount.value) {
              badge.textContent = `-$${neonObject.activeDiscount.value}`;
            } else {
              badge.textContent = '';
            }

            boldP.appendChild(badge);
          }
        }
      }
    }
  }

  neonObject.totalPrice = total;
  neonObject.discountPrice = finalDiscountPrice;
  return neonObject.totalPrice;
}

// ---------------------------
// Next and Previous Functionality
// ---------------------------
const boxes = document.querySelectorAll(".toggle");
const currentStep = document.getElementById("current-step");
const totalStep = document.getElementById("total-step");
totalStep.textContent = boxes.length;
const previousBtn = document.getElementById("previous");
const nextBtn = document.getElementById("next");
const panel = document.querySelector('.custom-scroll.right_side');
previousBtn.classList.add("disabled-btn");
let currentActive = 0;
const priceBox = document.querySelector(".price__box");
const discountSection = document.querySelector(".discount-code-section-desktop");

nextBtn.addEventListener("click", () => {
  if (currentActive < boxes.length - 1) {
    boxes[currentActive].classList.remove("activee");
    currentActive++;
    boxes[currentActive].classList.add("activee");
    currentStep.textContent = currentActive + 1;
    nextBtn.classList.remove("disabled-btn");
    if (currentActive === 0) {
      previousBtn.classList.add("disabled-btn");
    } else {
      previousBtn.classList.remove("disabled-btn");
    }
    // Show price box and discount section ONLY on step 8 (index 7)
    if (currentActive === 7) {
      priceBox.classList.remove("cart-hide");
      if (discountSection) discountSection.classList.remove("cart-hide");
    } else {
      priceBox.classList.add("cart-hide");
      if (discountSection) discountSection.classList.add("cart-hide");
    }
  }
});

previousBtn.addEventListener("click", () => {
  if (currentActive > 0) {
    boxes[currentActive].classList.remove("activee");
    currentActive--;
    boxes[currentActive].classList.add("activee");
    currentStep.textContent = currentActive + 1;
    nextBtn.classList.remove("disabled-btn");
    if (currentActive === 0) {
      previousBtn.classList.add("disabled-btn");
    } else {
      previousBtn.classList.remove("disabled-btn");
    }
    // Show price box and discount section ONLY on step 8 (index 7)
    if (currentActive === 7) {
      priceBox.classList.remove("cart-hide");
      if (discountSection) discountSection.classList.remove("cart-hide");
    } else {
      priceBox.classList.add("cart-hide");
      if (discountSection) discountSection.classList.add("cart-hide");
    }
  }
});

// ---------------------------
// Add to Cart Functionality
// ---------------------------
// Note: Add to cart button initialization moved to initializeNeonBuilder()
// to ensure DOM is ready when event listeners are attached.

// Font cache to store loaded fonts
const fontCache = {};

// loadFontAsBase64: Loads a font file and converts it to base64
async function loadFontAsBase64(fontName) {
  if (fontCache[fontName]) {
    return fontCache[fontName];
  }

  try {
    const response = await fetch(`/cdn/shop/t/${fontName}.ttf`);
    if (!response.ok) {
      console.warn(`Failed to load font: ${fontName}`);
      return null;
    }
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve) => {
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        fontCache[fontName] = base64;
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Error loading font ${fontName}:`, error);
    return null;
  }
}

// embedFontsInSVG: Adds @font-face rules to SVG for proper font rendering
async function embedFontsInSVG(svgMarkup) {
  // List of all available fonts
  const allFonts = [
    'Barcelona', 'Alexa', 'Bayview', 'Amsterdam', 'Greenworld', 'NewCursive',
    'Vintage', 'Venetian', 'Amanda', 'Austin', 'Beachfront', 'Chelsea',
    'Freehand', 'Freespirit', 'LoveNote', 'Neonscript', 'Northshore',
    'Photogenic', 'Royalty', 'Rocket', 'Signature', 'Sorrento', 'WildScript',
    'Avante', 'Buttercup', 'ClassicType', 'Typewriter', 'Melbourne', 'NeoTokyo',
    'Monaco', 'Waikiki', 'Bellview', 'LoveNeon', 'Marquee', 'Mayfair',
    'NeonGlow', 'NeonLite', 'Neontrace', 'Nevada', 'SciFi'
  ];

  // Find which fonts are actually used in the SVG
  const usedFonts = allFonts.filter(fontName => svgMarkup.includes(fontName));

  // Load and embed only the fonts that are used
  let fontFaceCSS = '<defs><style>';

  for (const fontName of usedFonts) {
    const base64 = await loadFontAsBase64(fontName);
    if (base64) {
      fontFaceCSS += `
        @font-face {
          font-family: "${fontName}";
          src: url('data:application/x-font-ttf;base64,${base64}') format('truetype');
        }`;
    }
  }

  fontFaceCSS += '</style></defs>';

  // Insert font definitions at the beginning of the SVG
  const svgStart = svgMarkup.indexOf('>') + 1;
  return svgMarkup.substring(0, svgStart) + fontFaceCSS + svgMarkup.substring(svgStart);
}

// handleAddToCart: Captures the neon sign area and creates a checkout.
async function handleAddToCart() {
  const addToCartButtonDesktop = document.getElementById('add_to_cart_desktop');
  const addToCartButtonMobile = document.getElementById('add_to_cart_mobile');

  // Show loading spinner
  if (addToCartButtonDesktop) addToCartButtonDesktop.classList.add('loading');
  if (addToCartButtonMobile) addToCartButtonMobile.classList.add('loading');

  try {
    const neonSignArea = document.getElementById('mySVG');

    // Get the SVG markup and send it to backend
    // The backend will handle font rendering and PNG conversion
    let svgMarkup = new XMLSerializer().serializeToString(neonSignArea);

    // Embed fonts in the SVG for proper rendering on backend
    svgMarkup = await embedFontsInSVG(svgMarkup);

    // Store SVG data in neonObject
    neonObject.svgMarkup = svgMarkup;
    neonObject.svgWidth = neonSignArea.getAttribute('width');
    neonObject.svgHeight = neonSignArea.getAttribute('height');

    // Remove imageURL since backend will generate it
    delete neonObject.imageURL;

    // Ensure color name is used instead of hex code
    if (neonObject.color && !neonObject.colorName) {
      neonObject.colorName = colorNameMap[neonObject.color] || neonObject.color;
    }

    // Remove any SVG URL properties before sending
    delete neonObject.svgURL;

    await createCheckout();
  } catch (error) {
    // Hide loading spinner on error
    if (addToCartButtonDesktop) addToCartButtonDesktop.classList.remove('loading');
    if (addToCartButtonMobile) addToCartButtonMobile.classList.remove('loading');
    console.error('Error processing checkout:', error);
    alert('Error processing checkout. Please try again.');
  }
}

// Global request counter for debugging
if (!window.apiRequestCounter) {
  window.apiRequestCounter = 0;
}

let isCreatingCheckout = false; // Prevent duplicate draft order creation

// createCheckout: Calls the backend to create a draft order and redirects to checkout.
async function createCheckout() {
  // Prevent duplicate submissions
  if (isCreatingCheckout) {
    console.log('Checkout already in progress, ignoring duplicate request');
    return;
  }
  isCreatingCheckout = true;

  const idempotencyKey = 'draft-order-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  window.apiRequestCounter++;
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 [API REQUEST #' + window.apiRequestCounter + '] Creating draft order');
  console.log('📋 Idempotency Key:', idempotencyKey);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📍 Action:', 'create-draft-order');

  try {
    const response = await fetch('https://apiv2.easyneonsigns.ca/create-draft-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'ghhgkkf7fjfhhfkfklflllfl',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(neonObject),
    });

    console.log('✅ [API RESPONSE #' + window.apiRequestCounter + '] Received response');
    console.log('📊 Status:', response.status, response.statusText);

    const result = await response.json();
    console.log('📦 Response data:', result);
    console.log('═══════════════════════════════════════════════════════');

    window.location.href = result.checkout_url;
  } catch (error) {
    console.log('❌ Exception:', error);
    console.log('═══════════════════════════════════════════════════════');
    alert('Error creating checkout. Please try again.');
    isCreatingCheckout = false; // Re-enable on error
  }
}

// ---------------------------
// Form Submission for Email
// ---------------------------
// const form = document.getElementById('myForm');
// form.addEventListener('submit', async (event) => {
// event.preventDefault(); // Prevent default form submission
// const formData = new FormData(form);
// try {
//   const response = await fetch('https://api.easyneonsigns.ca/submit-form', {
//     method: 'POST',
//     body: formData
//   });
//   if (response.ok) {
//     const result = await response.json();
//     document.getElementById('thankYouMessage').style.display = 'block';
//   } else {
//     console.error('Error submitting form:', response.statusText);
//   }
// } catch (error) {
//   console.error('Error submitting form:', error);
// }
// });
// NOTE: This handler is no longer used as all forms now have unique IDs
// Keeping it here in case a form with id="business-logo-form" is added in the future
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("business-logo-form");
  const thankYouMessage = document.getElementById("thankYouMessage");
  const loadingSpinner = document.getElementById("loadingSpinner");

  if (!form) {
    console.log('[neonText.js] No form with id="business-logo-form" found - handler not attached');
    return;
  }

  let isSubmitting = false; // Prevent duplicate submissions

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('Form already submitting, ignoring duplicate submission');
      return;
    }
    isSubmitting = true;

    // Hide previous messages
    thankYouMessage.style.display = "none";

    const formData = new FormData(form);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const message = formData.get("message").trim();
    const file = formData.get("file");

    let isValid = true;

    // Validation
    if (!name) {
      alert("Please enter your name.");
      isValid = false;
    }
    if (!email || !validateEmail(email)) {
      alert("Please enter a valid email.");
      isValid = false;
    }
    if (!message) {
      alert("Please describe your request.");
      isValid = false;
    }

    if (!isValid) {
      isSubmitting = false;
      return; // Stop submission if validation fails
    }

    // Show loading spinner
    loadingSpinner.style.display = "flex";

    const idempotencyKey = 'neontext-form-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    window.apiRequestCounter++;
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 [API REQUEST #' + window.apiRequestCounter + '] Sending form submission');
    console.log('📋 Idempotency Key:', idempotencyKey);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('📍 Form:', 'business-logo-form (neonText.js)');

    try {
      // Submit the form data to backend
      const response = await fetch("https://apiv2.easyneonsigns.ca/submit-form", {
        method: "POST",
        headers: {
          'X-API-Key': 'ghhgkkf7fjfhhfkfklflllfl',
          'X-Idempotency-Key': idempotencyKey
        },
        body: formData, // Automatically handles file upload
      });

      console.log('✅ [API RESPONSE #' + window.apiRequestCounter + '] Received response');
      console.log('📊 Status:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('📦 Response data:', result);
        console.log('═══════════════════════════════════════════════════════');

        thankYouMessage.style.display = "block";
        form.reset(); // Reset form after success
        // Keep isSubmitting true to prevent resubmission
      } else {
        console.log('❌ Error response');
        console.log('═══════════════════════════════════════════════════════');
        alert("An error occurred. Please try again.");
        isSubmitting = false; // Re-enable on error
      }
    } catch (error) {
      console.log('❌ Exception:', error);
      console.log('═══════════════════════════════════════════════════════');
      alert("An unexpected error occurred. Please try again.");
      isSubmitting = false; // Re-enable on error
    } finally {
      loadingSpinner.style.display = "none";
    }
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
});



// ---------------------------
// Discount Code Application
// ---------------------------
document.querySelectorAll('.apply-discount-button').forEach(button => {
  let isApplyingDiscount = false; // Prevent duplicate discount applications

  button.addEventListener('click', async () => {
    const discountCodeInput = button.parentElement.querySelector('.discount-code-input');
    const discountCode = discountCodeInput.value.trim();
    const discountMessage = button.closest('.discount__input__wrapper').nextElementSibling;

    // Check if button is in "Remove" mode
    if (button.classList.contains('remove-discount-button')) {
      neonObject.discountApplied = false;
      neonObject.activeDiscount = null;
      neonObject.discountCode = null;
      // Recalculate prices without the coupon but keep the base promotion
      calculateTotalPriceAndUpdateUI(neonObject);
      discountMessage.textContent = 'Discount removed.';
      button.textContent = 'Apply';
      button.classList.remove('btn-danger', 'remove-discount-button');
      button.classList.add('btn-primary', 'apply-discount-button');
      return; // Exit early, don't apply new discount
    }

    if (!discountCode) {
      if (discountMessage) {
        discountMessage.textContent = 'Please enter a discount code.';
        discountMessage.classList.remove('text-success');
        discountMessage.classList.add('text-danger');
      }
      return;
    }

    // Prevent rapid duplicate clicks while API call is in progress
    if (isApplyingDiscount) {
      console.log('⏳ Discount API call in progress, please wait...');
      return;
    }
    isApplyingDiscount = true;

    // Reset to original price before applying new discount (allows trying different codes)
    if (neonObject.discountApplied) {
      console.log('🔄 Resetting previous discount to apply new code');
      neonObject.discountPrice = neonObject.originalDiscountPrice;
      neonObject.discountApplied = false;
      neonObject.discountCode = null;
    }

    const idempotencyKey = 'discount-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    window.apiRequestCounter++;
    console.log('═══════════════════════════════════════════════════════');
    console.log('🚀 [API REQUEST #' + window.apiRequestCounter + '] Applying discount code');
    console.log('📋 Idempotency Key:', idempotencyKey);
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('📍 Action:', 'apply-discount');
    console.log('🎟️ Discount Code:', discountCode);

    try {
      const response = await fetch('https://apiv2.easyneonsigns.ca/apply-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'ghhgkkf7fjfhhfkfklflllfl',
          'X-Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({ discount_code: discountCode })
      });

      console.log('✅ [API RESPONSE #' + window.apiRequestCounter + '] Received response');
      console.log('📊 Status:', response.status, response.statusText);

      const data = await response.json();
      console.log('📦 Response data:', data);
      console.log('═══════════════════════════════════════════════════════');
      if (data.success) {
        // Store active discount so it can be re-applied whenever prices change
        if (data.discount_percentage) {
          neonObject.activeDiscount = {
            type: 'percentage',
            value: data.discount_percentage,
          };
        } else if (data.discount_amount) {
          neonObject.activeDiscount = {
            type: 'amount',
            value: data.discount_amount,
          };
        } else {
          neonObject.activeDiscount = null;
        }

        neonObject.discountApplied = true;
        neonObject.discountCode = discountCode; // Store discount code for backend

        // Recalculate UI prices with the active coupon applied
        calculateTotalPriceAndUpdateUI(neonObject);
        if (discountMessage) {
          discountMessage.textContent = 'Discount applied successfully!';
          discountMessage.classList.remove('text-danger');
          discountMessage.classList.add('text-success');
        }
        button.textContent = 'Remove';
        button.classList.remove('btn-primary', 'apply-discount-button');
        button.classList.add('btn-danger', 'remove-discount-button');
      } else {
        if (discountMessage) {
          discountMessage.textContent = data.message || 'Invalid discount code. Please try again.';
          discountMessage.classList.remove('text-success');
          discountMessage.classList.add('text-danger');
        }
      }
    } catch (error) {
      console.log('❌ Exception:', error);
      console.log('═══════════════════════════════════════════════════════');
      if (discountMessage) {
        discountMessage.textContent = 'Error applying discount.';
        discountMessage.classList.remove('text-success');
        discountMessage.classList.add('text-danger');
      }
    } finally {
      // Reset flag to allow future discount applications
      isApplyingDiscount = false;
    }
  });
});

// ---------------------------
// Initialization Calls
// ---------------------------
// Wrap everything in a function to ensure it runs after DOM is ready
function initializeNeonBuilder() {
  initFontPallate();
  initFontSelection();
  initEventListeners();

  // Initialize Add to Cart buttons
  const addToCartButtonDesktop = document.getElementById('add_to_cart_desktop');
  const addToCartButtonMobile = document.getElementById('add_to_cart_mobile');

  if (addToCartButtonDesktop) {
    addToCartButtonDesktop.addEventListener('click', async (event) => {
      event.preventDefault();
      await handleAddToCart();
    });
  }

  if (addToCartButtonMobile) {
    addToCartButtonMobile.addEventListener('click', async (event) => {
      event.preventDefault();
      await handleAddToCart();
    });
  }

  // Initialize price calculation
  setTimeout(() => {
    if (!textArea) {
      return;
    }

    // Trigger text measurement and plan generation
    const event = new Event('keyup');
    textArea.dispatchEvent(event);

    // Wait for plans to be generated, then select first plan and calculate price
    setTimeout(() => {
      const selectedPlan = document.querySelector('input[name="plan"]:checked');

      if (selectedPlan) {
        const planLabel = selectedPlan.closest(".plan");
        if (planLabel) {
          const priceText = planLabel.querySelector(".plan-price")?.textContent?.trim();
          const widthText = planLabel.querySelector(".text-length")?.textContent?.trim();
          const heightText = planLabel.querySelector(".text-height")?.textContent?.trim();

          neonObject.plan = {
            id: selectedPlan.id,
            price: priceText || '0',
            width: widthText || '0',
            height: heightText || '0'
          };

          calculateTotalPriceAndUpdateUI(neonObject);
        }
      }
    }, 300);
  }, 200);
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNeonBuilder);
} else {
  // DOM is already ready
  initializeNeonBuilder();
}
