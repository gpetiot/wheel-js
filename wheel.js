// -----------------------------
// Configuration and Constants
// -----------------------------
const COLORS = [
    '#16a34a', '#0ea5e9', '#6366f1', '#8b5cf6', 
    '#ec4899', '#f43f5e', '#fb923c', '#fbbf24',
    '#84cc16', '#10b981', '#06b6d4', '#3b82f6'
];

const DEFAULTS = {
    DEFAULT_COLOR: '#6366f1',
    MIN_SPINS: 4,
    MAX_SPINS: 6,
    SPIN_DURATION: 5000,
    MIN_CHOICES_FOR_SINGLE_SLICES: 6
};

// -----------------------------
// Application State
// -----------------------------
const state = {
    choices: [],
    rotation: 0,
    isSpinning: false,
    result: ''
};

// -----------------------------
// DOM References
// -----------------------------
const elements = {
    wheel: document.getElementById('wheel'),
    spinButton: document.getElementById('spin-button'),
    resultMessage: document.getElementById('result-message'),
    resultElement: document.getElementById('result'),
    newChoiceInput: document.getElementById('new-choice'),
    choicesList: document.getElementById('choices-list')
};

// -----------------------------
// Pure Utility Functions
// -----------------------------

/**
 * Gets a valid color for a given index
 * @param {number} index - The index to get a color for
 * @returns {string} A valid color
 */
function getValidColor(index) {
    // Make sure we have a valid COLORS array
    if (!COLORS || !Array.isArray(COLORS) || COLORS.length === 0) {
        return DEFAULTS.DEFAULT_COLOR;
    }
    
    // Ensure index is a non-negative number
    const safeIndex = (typeof index === 'number' && !isNaN(index)) 
        ? Math.max(0, index) 
        : 0;
        
    // Calculate a valid color index within array bounds
    const colorIndex = safeIndex % COLORS.length;
    
    // Return the color or a default if the specific color is invalid
    return COLORS[colorIndex] || DEFAULTS.DEFAULT_COLOR;
}

/**
 * Creates an SVG path for a wheel sector
 * @param {number} centerX - X coordinate of the center
 * @param {number} centerY - Y coordinate of the center
 * @param {number} radius - Radius of the wheel
 * @param {number} startAngle - Starting angle in radians
 * @param {number} endAngle - Ending angle in radians
 * @returns {string} SVG path data
 */
function createSectorPath(centerX, centerY, radius, startAngle, endAngle) {
    // Check if this is a full circle (or very close to it)
    const isFullCircle = Math.abs(endAngle - startAngle - 2 * Math.PI) < 0.001;
    
    if (isFullCircle) {
        // For a full circle, create a more precise circle representation
        return [
            `M ${centerX},${centerY - radius}`, // Start at top of circle
            `A ${radius},${radius} 0 1 1 ${centerX - 0.001},${centerY - radius}`, // Almost full arc (clockwise)
            `A ${radius},${radius} 0 1 1 ${centerX},${centerY - radius}`, // Complete the circle
            'Z' // Close path
        ].join(' ');
    }
    
    // For regular sectors, calculate points on the circle
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);
    
    // Create SVG path for sector
    const largeArcFlag = (endAngle - startAngle) > Math.PI ? 1 : 0;
    return [
        `M ${centerX},${centerY}`,  // Move to center
        `L ${startX},${startY}`,    // Line to start point on circle
        `A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY}`, // Arc to end point
        'Z'                         // Close path
    ].join(' ');
}

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Prepares wheel data from choices, determining occurrences and colors
 * @param {Array} choices - The array of choice objects
 * @returns {Array} Array of objects with choice text, color, and occurrences
 */
function prepareWheelData(choices) {
    // Get choice texts
    const choiceTexts = choices.map(choice => choice.text);
    
    // If there are no choices, return an empty array
    if (choiceTexts.length === 0) {
        return [];
    }
    
    // Special case: If there's exactly one choice, it appears once with full wheel
    if (choiceTexts.length === 1) {
        return [{
            text: choiceTexts[0],
            color: getValidColor(0),
            occurrences: 1
        }];
    }
    
    // For each choice, determine color and number of occurrences
    return choiceTexts.map((text, index) => {
        const color = getValidColor(index);
        // If fewer than minimum choices, each choice appears twice
        const occurrences = choiceTexts.length < DEFAULTS.MIN_CHOICES_FOR_SINGLE_SLICES ? 2 : 1;
        
        return {
            text,
            color,
            occurrences
        };
    });
}

/**
 * Generates wheel slices from prepared wheel data
 * @param {Array} wheelData - Array of objects with choice text, color, and occurrences
 * @returns {Array} Array of slice objects with properties for rendering
 */
function generateWheelSlices(wheelData) {
    // Count total slices (accounting for duplicates)
    const totalSlices = wheelData.reduce(
        (total, item) => total + item.occurrences, 
        0
    );
    
    // Calculate angle per slice
    const sliceAngle = 360 / totalSlices;
    
    // Track current rotation position
    let currentRotation = 0;
    
    let slices = [];
    // Generate slices for each wheel data item
    wheelData.forEach(item => {
        if (item.occurrences === 1) {
            // Single occurrence - add one slice
            slices.push({
                text: item.text,
                color: item.color,
                rotate: currentRotation,
                sliceAngle: sliceAngle
            });
            
            currentRotation += sliceAngle;
        } else if (item.occurrences === 2) {
            // Double occurrence - add two slices with same color, 180° apart
            // First occurrence
            slices.push({
                text: item.text,
                color: item.color,
                rotate: currentRotation,
                sliceAngle: sliceAngle
            });
            
            // Second occurrence, 180° opposite
            slices.push({
                text: item.text,
                color: item.color,
                rotate: (currentRotation + 180),
                sliceAngle: sliceAngle
            });
            
            // Move to next position for different choice
            currentRotation += sliceAngle;
        }
    });
    
    return slices;
}

/**
 * Calculates the wheel slices data based on current choices
 * @param {Array} choices - The array of choice objects
 * @returns {Array} Array of slice objects with properties for rendering
 */
function calculateWheelSlices(choices) {
    // Step 1: Prepare wheel data (choices with colors and occurrences)
    const wheelData = prepareWheelData(choices);
    
    // Step 2: Generate wheel slices with proper angles and rotations
    const slices = generateWheelSlices(wheelData);
    
    // Double-check all slices have a valid color
    slices.forEach((slice, index) => {
        if (!slice.color || slice.color === 'undefined' || typeof slice.color !== 'string') {
            console.warn(`Missing color detected for slice ${index}, using default`);
            slice.color = DEFAULTS.DEFAULT_COLOR;
        }
    });
    
    // Verify that the total angle of all slices is 360 degrees
    const totalAngle = slices.reduce((sum, slice) => sum + slice.sliceAngle, 0);
    if (Math.abs(totalAngle - 360) > 0.001) {
        console.warn(`Total angle of wheel slices is ${totalAngle}, not 360 degrees`);
    }
    
    return slices;
}

/**
 * Calculates the rotation for readable text in a wheel slice
 * @param {number} textAngle - The angle of the text in radians
 * @returns {number} The adjusted rotation in degrees for readable text
 */
function calculateTextRotation(textAngle) {
    // Convert from radians to degrees and adjust to keep text horizontal
    const textRotationDegrees = (textAngle * 180 / Math.PI) + 90;
    
    // Adjust text rotation to ensure it's always readable (not upside down)
    return textRotationDegrees > 180 && textRotationDegrees < 360 
        ? textRotationDegrees + 180 
        : textRotationDegrees;
}

/**
 * Creates a new choice object
 * @param {string} text - The text for the choice
 * @returns {Object} A choice object
 */
function createChoice(text) {
    return {
        text: text.trim(),
        editing: false,
        editValue: text.trim()
    };
}

/**
 * Calculates the result after spinning the wheel
 * @param {number} rotation - The final rotation angle
 * @param {Array} slices - The wheel slices
 * @returns {string} The result text
 */
function calculateSpinResult(rotation, slices) {
    if (slices.length === 0) return '';
    
    // For a single choice filling the whole wheel, always return that choice
    if (slices.length === 1 && slices[0].sliceAngle === 360) {
        return slices[0].text;
    }
    
    const sliceAngle = slices[0].sliceAngle;
    
    // The modulo 360 of the final rotation tells us which slice is at the top
    const modRotation = rotation % 360;
    
    // The indicator points to the top (0 degrees), so we need to find which slice is there
    // We add 360 to ensure positive values, then modulo 360 again
    const normalizedRotation = (360 - modRotation) % 360;
    
    // Find which slice corresponds to this rotation
    const resultIndex = Math.floor(normalizedRotation / sliceAngle);
    
    // Get the result text - make sure we don't exceed array bounds
    const safeIndex = resultIndex % slices.length;
    return slices[safeIndex].text;
}

// -----------------------------
// DOM Creation Functions
// -----------------------------

/**
 * Creates an SVG text element for a wheel slice
 * @param {string} text - The text to display
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} rotation - Rotation in degrees
 * @param {number} sliceAngle - The angle of the slice in degrees
 * @returns {SVGTextElement} The SVG text element
 */
function createSliceText(svgNS, text, x, y, rotation, sliceAngle) {
    const textElement = document.createElementNS(svgNS, "text");
    textElement.setAttribute("x", x);
    textElement.setAttribute("y", y);
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("dominant-baseline", "middle");
    textElement.setAttribute("fill", "white");
    
    // Larger font for full circle or large slices
    let fontSize;
    if (sliceAngle === 360) {
        fontSize = "3.5";  // Slightly smaller font for full circle near border
    } else if (sliceAngle > 45) {
        fontSize = "3";  // Larger font for bigger slices
    } else {
        fontSize = "2.5"; // Default size for smaller slices
    }
    
    textElement.setAttribute("font-size", fontSize);
    textElement.setAttribute("font-weight", "bold");
    textElement.setAttribute("transform", `rotate(${rotation}, ${x}, ${y})`);
    textElement.setAttribute("text-shadow", "0 0 1px black");
    
    // Add a title for better accessibility
    const title = document.createElementNS(svgNS, "title");
    title.textContent = text;
    textElement.appendChild(title);
    
    // Break text into multiple lines if needed
    const words = text.split(' ');
    if (words.length > 1 && sliceAngle < 45 && sliceAngle !== 360) {
        // For smaller slices with multiple words, break into lines
        const midpoint = Math.ceil(words.length/2);
        
        const tspan1 = document.createElementNS(svgNS, "tspan");
        tspan1.setAttribute("x", x);
        tspan1.setAttribute("dy", "-0.6em");
        tspan1.textContent = words.slice(0, midpoint).join(' ');
        
        const tspan2 = document.createElementNS(svgNS, "tspan");
        tspan2.setAttribute("x", x);
        tspan2.setAttribute("dy", "1.2em");
        tspan2.textContent = words.slice(midpoint).join(' ');
        
        textElement.appendChild(tspan1);
        textElement.appendChild(tspan2);
    } else {
        textElement.textContent = text;
    }
    
    return textElement;
}

/**
 * Creates an empty wheel message
 * @returns {HTMLElement} The empty message element
 */
function createEmptyWheelMessage() {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-wheel-message';
    emptyMessage.innerHTML = 'Add choices<br>to start';
    return emptyMessage;
}

/**
 * Creates a choice list item for rendering
 * @param {Object} choice - The choice object
 * @param {number} index - The index of the choice
 * @param {Function} handleEdit - Function to handle edit
 * @param {Function} handleUpdate - Function to handle update
 * @param {Function} handleDelete - Function to handle delete
 * @returns {HTMLElement} The list item element
 */
function createChoiceListItem(choice, index, handleEdit, handleUpdate, handleDelete) {
    const listItem = document.createElement('li');
    listItem.className = 'choice-item';
    listItem.setAttribute('data-index', index);
    
    if (choice.editing) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = choice.editValue;
        
        input.onkeyup = (e) => {
            if (e.key === 'Enter') {
                handleUpdate(index, e.target.value);
            }
        };
        
        input.onblur = () => handleUpdate(index, input.value);
        
        listItem.appendChild(input);
        
        // Focus the input after rendering
        setTimeout(() => input.focus(), 10);
    } else {
        // Choice content
        const choiceContent = document.createElement('div');
        choiceContent.className = 'choice-content';
        
        // Text element
        const textElement = document.createElement('span');
        textElement.className = 'choice-text';
        textElement.textContent = choice.text;
        textElement.onclick = () => handleEdit(index);
        
        // Edit hint
        const editHint = document.createElement('span');
        editHint.className = 'edit-hint';
        editHint.textContent = 'Click to edit';
        
        choiceContent.appendChild(textElement);
        choiceContent.appendChild(editHint);
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '&times;';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            handleDelete(index);
        };
        
        listItem.appendChild(choiceContent);
        listItem.appendChild(deleteButton);
    }
    
    return listItem;
}

/**
 * Creates an empty choices list message
 * @returns {HTMLElement} The empty message element
 */
function createEmptyChoicesMessage() {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty-message';
    emptyItem.textContent = 'No choices added yet';
    return emptyItem;
}

// -----------------------------
// Rendering Functions
// -----------------------------

/**
 * Renders the wheel based on current state
 */
function renderWheel() {
    const wheel = elements.wheel;
    
    // Clear existing wheel slices
    wheel.innerHTML = '';
    
    // Get wheel choices
    const wheelSlices = calculateWheelSlices(state.choices);
    
    // If there are no choices, show an empty wheel with message
    if (wheelSlices.length === 0) {
        wheel.appendChild(createEmptyWheelMessage());
        return;
    }
    
    // Create SVG for wheel
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 100 100");
    
    // Calculate center point
    const centerX = 50;
    const centerY = 50;
    const radius = 50;
    
    // Create sectors using SVG paths
    wheelSlices.forEach((slice, index) => {
        // Calculate angles in radians
        const startAngle = toRadians(slice.rotate);
        const endAngle = toRadians(slice.rotate + slice.sliceAngle);
        
        // Get the path data
        const pathData = createSectorPath(centerX, centerY, radius, startAngle, endAngle);
        
        // Create sector path element
        const sector = document.createElementNS(svgNS, "path");
        sector.setAttribute("d", pathData);
        
        // Ensure we always have a valid fill color
        const fillColor = (slice.color && typeof slice.color === 'string') 
            ? slice.color 
            : DEFAULTS.DEFAULT_COLOR;
        sector.setAttribute("fill", fillColor);
        
        sector.setAttribute("stroke", "white");
        sector.setAttribute("stroke-width", "1");
        sector.setAttribute("data-slice-index", index);
        
        svg.appendChild(sector);
        
        // Create text for the slice
        const textAngle = startAngle + toRadians(slice.sliceAngle / 2);
        let textX, textY;

        if (slice.sliceAngle === 360) {
            // For full circle (single choice), position text at the top
            textX = centerX;
            textY = centerY - (radius * 0.6);
        } else {
            // For normal slices, calculate position along the radius
            const textRadius = radius * 0.75;
            textX = centerX + textRadius * Math.cos(textAngle);
            textY = centerY + textRadius * Math.sin(textAngle);
        }

        // Calculate rotation for text
        const adjustedRotation = slice.sliceAngle === 360 ? 0 : calculateTextRotation(textAngle);
        
        // Create the text element
        const text = createSliceText(svgNS, slice.text, textX, textY, adjustedRotation, slice.sliceAngle);
        svg.appendChild(text);
    });
    
    wheel.appendChild(svg);
}

/**
 * Renders the choices list based on current state
 */
function renderChoicesList() {
    const choicesList = elements.choicesList;
    
    // Clear existing choices
    choicesList.innerHTML = '';
    
    if (state.choices.length === 0) {
        choicesList.appendChild(createEmptyChoicesMessage());
        return;
    }
    
    // Create list items for each choice
    state.choices.forEach((choice, index) => {
        const listItem = createChoiceListItem(
            choice, 
            index,
            startEdit,
            updateChoice,
            deleteChoice
        );
        choicesList.appendChild(listItem);
    });
}

/**
 * Updates UI elements based on state
 */
function updateUIState() {
    // Update spin button state
    elements.spinButton.disabled = state.isSpinning || state.choices.length === 0;
}

// -----------------------------
// Event Handlers & State Updates
// -----------------------------

/**
 * Adds a new choice to the state
 * @param {string} text - The text for the new choice
 */
function addChoice() {
    const newChoiceText = elements.newChoiceInput.value.trim();
    if (newChoiceText) {
        // Add the new choice
        state.choices.push(createChoice(newChoiceText));
        elements.newChoiceInput.value = '';
        
        // Reset rotation to ensure consistent behavior
        state.rotation = 0;
        elements.wheel.style.transform = `rotate(0deg)`;
        
        // Re-render everything
        renderChoicesList();
        renderWheel();
        updateUIState();
    }
}

/**
 * Starts editing a choice
 * @param {number} index - The index of the choice to edit
 */
function startEdit(index) {
    // First, close any other editing rows
    state.choices.forEach((choice, i) => {
        if (i !== index && choice.editing) {
            updateChoice(i, choice.editValue);
        }
    });
    
    // Then start editing the selected row
    state.choices[index].editing = true;
    state.choices[index].editValue = state.choices[index].text;
    renderChoicesList();
}

/**
 * Updates a choice with new text
 * @param {number} index - The index of the choice to update
 * @param {string} newText - The new text for the choice
 */
function updateChoice(index, newText) {
    const choice = state.choices[index];
    
    // If newText is provided, use it; otherwise, use the existing editValue
    const textToUse = newText || choice.editValue;
    
    if (textToUse && textToUse.trim()) {
        choice.text = textToUse.trim();
    }
    choice.editing = false;
    
    // Reset rotation to ensure consistent behavior
    state.rotation = 0;
    elements.wheel.style.transform = `rotate(0deg)`;
    
    renderChoicesList();
    renderWheel();
}

/**
 * Deletes a choice
 * @param {number} index - The index of the choice to delete
 */
function deleteChoice(index) {
    state.choices.splice(index, 1);
    
    // Reset rotation to ensure consistent behavior
    state.rotation = 0;
    elements.wheel.style.transform = `rotate(0deg)`;
    
    // Re-render everything
    renderChoicesList();
    renderWheel();
    updateUIState();
}

/**
 * Spins the wheel
 */
function spinWheel() {
    if (state.isSpinning || state.choices.length === 0) return;
    
    state.isSpinning = true;
    state.result = '';
    elements.resultMessage.style.display = 'none';
    
    // Update button text during spinning
    elements.spinButton.textContent = 'Spinning...';
    elements.spinButton.disabled = true;
    
    // Random rotation between MIN_SPINS and MAX_SPINS full rotations
    const randomSpins = DEFAULTS.MIN_SPINS + Math.random() * (DEFAULTS.MAX_SPINS - DEFAULTS.MIN_SPINS);
    const newRotation = state.rotation + (randomSpins * 360);
    
    state.rotation = newRotation;
    elements.wheel.style.transform = `rotate(${newRotation}deg)`;
    
    // Calculate the result after spinning
    setTimeout(() => {
        const slices = calculateWheelSlices(state.choices);
        state.result = calculateSpinResult(newRotation, slices);
        
        elements.resultElement.textContent = state.result;
        elements.resultMessage.style.display = 'block';
        
        state.isSpinning = false;
        elements.spinButton.textContent = 'Spin';
        elements.spinButton.disabled = false;
    }, DEFAULTS.SPIN_DURATION);
}

// -----------------------------
// Initialization
// -----------------------------

/**
 * Initializes the wheel with optional parameters
 * @param {Array} initialChoices - Optional array of initial choice texts
 */
function initializeWheel(initialChoices) {
    // If initial choices are provided, use them
    if (initialChoices && Array.isArray(initialChoices) && initialChoices.length > 0) {
        state.choices = initialChoices.map(text => createChoice(text));
    }
    
    // Reset rotation to ensure consistent behavior
    state.rotation = 0;
    
    // Initial render
    renderChoicesList();
    renderWheel();
    updateUIState();
}

/**
 * Initializes the wheel from URL parameters
 * @returns {boolean} Whether initialization from URL was successful
 */
function initializeFromURL() {
    // Check if there are choices in the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const choicesParam = urlParams.get('choices');
    
    if (choicesParam) {
        try {
            // Parse JSON array from URL parameter
            const initialChoices = JSON.parse(decodeURIComponent(choicesParam));
            if (Array.isArray(initialChoices)) {
                initializeWheel(initialChoices);
                return true;
            }
        } catch (e) {
            console.warn('Invalid choices parameter in URL');
        }
    }
    
    // Default initialization with empty wheel
    initializeWheel();
    return false;
}

// -----------------------------
// Event Listeners
// -----------------------------

// Set up event listeners
function setupEventListeners() {
    elements.spinButton.addEventListener('click', spinWheel);
    
    elements.newChoiceInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            addChoice();
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializeFromURL();
});
