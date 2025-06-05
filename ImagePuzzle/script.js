/**
 * @file script.js
 * @author [Your Name/Group] - Quantum Dynamics Inc.
 * @version 3.7 (ChronoMatrix Engine - Image Load & Core Functionality Stabilized)
 * @date [Current Date]
 * @description Core JavaScript engine for the "ChronoMatrix Puzzle Engine".
 * This version specifically addresses image loading and functionality issues,
 * ensuring robust puzzle creation, drag-and-drop, keyboard interactions,
 * and overall game flow for matrix resolutions from 3x3 to 30x30.
 * Extensive logging for debugging is maintained to highlight problem resolution.
 */

"use strict"; // Enforce stricter parsing and error handling

/**
 * @namespace ChronoMatrixGame
 * @description Main game module encapsulating all logic, state, and UI interactions.
 */
const ChronoMatrixGame = (function() {

    // --- DOM Element Cache ---
    const puzzleContainerEl = document.getElementById('puzzle-container');
    const puzzleShroudEl = document.getElementById('puzzle-shroud');
    const startButtonEl = document.getElementById('startButton');
    const movesCounterDisplayEl = document.getElementById('movesCounter');
    const timerDisplayEl = document.getElementById('timer');
    const difficultySelectorEl = document.getElementById('difficulty');
    const imageUploadInputEl = document.getElementById('imageUpload');
    const imagePreviewEl = document.getElementById('image-preview');
    const successMessageModalEl = document.getElementById('successMessage');
    const finalMovesDisplayEl = document.getElementById('finalMoves');
    const finalTimeDisplayEl = document.getElementById('finalTime');
    const playAgainButtonEl = document.getElementById('playAgainButton');
    const animatedSectionNodes = document.querySelectorAll('.animated-section');
    const startButtonTextEl = document.getElementById('startButtonText');


    // --- Game Configuration Constants ---
    const DEFAULT_PUZZLE_IMAGE_PATH = 'assets/IMAGE.png';
    // Base dimension for puzzle area in JS, but CSS --puzzle-base-dimension controls actual display.
    const BASE_PUZZLE_AREA_DIMENSION_PX_FALLBACK = 400; 
    const MIN_TILE_SIZE_FOR_BORDER_PX = 6; // Tiles smaller than this might get 'tile-no-border'
    const GRID_SIZE_TILE_ANIMATION_SIMPLIFY_THRESHOLD = 15; // Beyond this, tile entry anim is simpler
    const GRID_SIZE_SHUFFLE_SIMPLIFY_THRESHOLD = 12; // Beyond this, visual shuffle is simpler
    const UI_ANIMATION_TIMINGS_MS = {
        TILE_ENTRY_STAGGER_BASE: 20,
        TILE_ENTRY_STAGGER_LARGE_GRID_FACTOR: 0.1,
        TILE_ENTRY_ANIMATION_DURATION: 500, // Should generally match CSS
        SHUFFLE_VISUAL_CUE_DURATION_SMALL_GRID: 400,
        SHUFFLE_VISUAL_CUE_DURATION_LARGE_GRID: 50,
        SUCCESS_MODAL_FADE_DURATION: 350,
        SECTION_LOAD_ANIMATION_BASE_DELAY: 100,
    };


    // --- Game State Variables ---
    let currentGridSize = parseInt(difficultySelectorEl.value);
    let activeTilesDataArray = [];
    let currentMovesCount = 0;
    let gameTimerIntervalId = null;
    let elapsedSeconds = 0;
    let activePuzzleImageSrc = DEFAULT_PUZZLE_IMAGE_PATH; // This variable holds the current path
    let isGameCurrentlyActive = false;
    let currentlyDraggedTileElement = null;
    let keyboardSelectedTile1 = null;
    let cachedLoadedImageObject = null; // Store the Image object for efficiency


    // --- Logging Utility ---
    const ENABLE_DEV_LOGS = true; // Global toggle for development console logs
    function logDebug(component, message, details = '') {
        if (ENABLE_DEV_LOGS) {
            console.log(`[CM-${component}] ${message}`, details); // Changed to console.log for better visibility
        }
    }


    /**
     * Formats total seconds into MM:SS string.
     * @param {number} totalSeconds
     * @returns {string} Formatted time (e.g., "01:30").
     */
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }


    // --- Core Game Initialization ---

    /**
     * Main function to start or restart the game. Orchestrates loading, setup, and UI updates.
     * @async
     */
    async function initializeNewGame() {
        logDebug('GameFlow', 'Initializing new game...');
        isGameCurrentlyActive = true;
        currentGridSize = parseInt(difficultySelectorEl.value);
        logDebug('GameSetup', `Matrix density set to: ${currentGridSize}x${currentGridSize}`);

        _resetGameMetricsAndUIState();
        _updateStartButtonState(`Loading ${currentGridSize}x${currentGridSize}...`, true);
        _displayPuzzlePlaceholder(`Calibrating Matrix ${currentGridSize}x${currentGridSize}...`);

        try {
            // Step 1: Load the image resource. This is crucial.
            const imageToUse = await _loadImageResource(activePuzzleImageSrc);
            if (!imageToUse || imageToUse.naturalWidth === 0 || imageToUse.naturalHeight === 0) {
                 throw new Error(`Loaded image is invalid or has zero dimensions.`);
            }
            cachedLoadedImageObject = imageToUse; // Update cache with the successfully loaded Image object
            imagePreviewEl.src = cachedLoadedImageObject.src; // Ensure the preview shows the correct image

            // Step 2: Create puzzle tiles
            _dynamicallyCreatePuzzleTiles(cachedLoadedImageObject);

            // Step 3: Wait for initial tile animations before shuffling for visual effect
            const estEntryDur = _calculateMaxTileEntryAnimationDelay();
            await _delayExecution(estEntryDur + 50); // Small buffer after animations

            // Step 4: Shuffle tiles and start timer
            await _shuffleTilesOnGrid();
            _initializeAndStartGameTimer();

            _updateStartButtonState('Restart Matrix', false);
            logDebug('GameFlow', `Game started: ${currentGridSize}x${currentGridSize}.`);

        } catch (error) {
            console.error('ChronoMatrix Critical Error during game initialization:', error);
            _displayPuzzleErrorState(`Matrix Init Failed: ${error.message.substring(0, 150)}`);
            _updateStartButtonState('Initialization Error', true);
            isGameCurrentlyActive = false; // Game cannot proceed if init failed
        }
    }

    /**
     * Resets game metrics (moves, timer) and UI state.
     * @private
     */
    function _resetGameMetricsAndUIState() {
        currentMovesCount = 0; elapsedSeconds = 0;
        movesCounterDisplayEl.textContent = currentMovesCount.toString();
        timerDisplayEl.textContent = formatTime(elapsedSeconds);

        if (gameTimerIntervalId) clearInterval(gameTimerIntervalId); // Clear existing timer
        gameTimerIntervalId = null;

        successMessageModalEl.classList.add('hidden'); // Ensure success modal is hidden
        successMessageModalEl.setAttribute('aria-hidden', 'true');

        if (keyboardSelectedTile1) { // Clean up any lingering keyboard selection
            keyboardSelectedTile1.classList.remove('tile-keyboard-focus');
            keyboardSelectedTile1 = null;
        }
        logDebug('GameReset', 'Game metrics and UI state reset.');
    }

    /**
     * Updates the main start button's text and disabled state.
     * @private
     */
    function _updateStartButtonState(text, isDisabled) {
        startButtonTextEl.textContent = text;
        startButtonEl.disabled = isDisabled;
        startButtonEl.setAttribute('aria-busy', isDisabled.toString());
    }

    /**
     * Displays messages within the puzzle container, including loading spinners.
     * @private
     * @param {string} message - Text to display.
     */
    function _displayPuzzlePlaceholder(message) {
        // Ensure wrapper exists as per HTML, or create if it was somehow removed/not present.
        let wrapper = puzzleContainerEl.querySelector('.puzzle-placeholder-wrapper');
        let textEl;
        let spinnerContainerEl;

        if (!wrapper) {
            // Create the full structure if it's missing (robustness against manual HTML changes)
            wrapper = document.createElement('div');
            wrapper.className = 'puzzle-placeholder-wrapper';
            wrapper.setAttribute('aria-live', 'polite');
            
            textEl = document.createElement('p');
            textEl.className = 'puzzle-placeholder initial-placeholder-text';
            wrapper.appendChild(textEl);

            spinnerContainerEl = document.createElement('div');
            spinnerContainerEl.className = 'spinner-container';
            spinnerContainerEl.setAttribute('aria-hidden', 'true');
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            spinnerContainerEl.appendChild(spinner);
            wrapper.appendChild(spinnerContainerEl);

            puzzleContainerEl.appendChild(wrapper);
        } else {
            textEl = wrapper.querySelector('.puzzle-placeholder');
            spinnerContainerEl = wrapper.querySelector('.spinner-container');
        }

        if (textEl) textEl.textContent = message;
        if (spinnerContainerEl) {
            spinnerContainerEl.style.display =
                (currentGridSize > 10 && !message.toLowerCase().includes("error")) ? 'flex' : 'none';
        }
        logDebug('UIUpdate', `Displaying placeholder: \"${message}\"`);
    }

    /**
     * Displays an error message inside the puzzle container.
     * @private
     * @param {string} errorMessage - The error message text.
     */
    function _displayPuzzleErrorState(errorMessage) {
        // This overrides any previous content and spinner.
        puzzleContainerEl.innerHTML = `<p class="puzzle-placeholder error-text" style="color: var(--color-error);">${errorMessage}</p>`;
        logDebug('UIUpdate', `Displaying error state: \"${errorMessage}\"`);
    }

    /**
     * Utility to create a promise-based delay.
     * @private
     * @param {number} ms - Milliseconds to delay.
     * @returns {Promise<void>}\
     */
    function _delayExecution(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Estimates maximum tile entry animation delay based on grid size.
     * Used to time the shuffle so it starts after tiles animate in.
     * @private
     * @returns {number} Delay in MS.
     */
    function _calculateMaxTileEntryAnimationDelay() {
        if (currentGridSize > GRID_SIZE_TILE_ANIMATION_SIMPLIFY_THRESHOLD) {
            return 50; // Minimal delay for performance on very large grids
        }
        const tileCount = currentGridSize * currentGridSize;
        const staggerEffect = UI_ANIMATION_TIMINGS_MS.TILE_ENTRY_STAGGER_BASE *
                      (currentGridSize > 10 ? UI_ANIMATION_TIMINGS_MS.TILE_ENTRY_STAGGER_LARGE_GRID_FACTOR : 1);
        const maxStaggerDelay = (tileCount - 1) * staggerEffect;
        // Cap max stagger delay + animation duration to prevent excessively long waits
        return Math.min(1500, maxStaggerDelay + UI_ANIMATION_TIMINGS_MS.TILE_ENTRY_ANIMATION_DURATION);
    }


    // --- Image Loading and Tile Creation ---

    /**
     * Asynchronously loads an image resource. Handles caching and fallback to default image if specified URL fails.
     * @private
     * @param {string} imageUrl - URL of the image to load.
     * @returns {Promise<HTMLImageElement>} Resolves with the loaded Image object.
     * @throws {Error} If loading fails (including fallback if attempted and failed).
     */
    async function _loadImageResource(imageUrl) {
        logDebug('ImageLoader', `Attempting to load: \"${imageUrl}\"`);
        // Check if image is already cached AND if its source matches requested URL AND if it's fully loaded
        if (cachedLoadedImageObject && cachedLoadedImageObject.src.endsWith(imageUrl) && 
            cachedLoadedImageObject.complete && cachedLoadedImageObject.naturalWidth > 0) {
            logDebug('ImageLoader', 'Using cached image object.');
            return cachedLoadedImageObject;
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            // img.crossOrigin = "anonymous"; // Uncomment if loading images from different origins/domains

            img.onload = () => {
                // Critical check: Ensure image actually has dimensions, even if onload fires.
                if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                    reject(new Error(`Image loaded but has zero dimensions for \"${imageUrl}\". Possible corrupt or invalid image file.`));
                    return;
                }
                logDebug('ImageLoader', `Successfully loaded: ${imageUrl} (Dimensions: ${img.naturalWidth}x${img.naturalHeight})`);
                resolve(img);
            };

            img.onerror = (err) => {
                logDebug('ImageLoader', `Error loading image: \"${imageUrl}\"`, err);
                // Fallback mechanism: If original image fails, try loading the default.
                if (imageUrl !== DEFAULT_PUZZLE_IMAGE_PATH) {
                    logDebug('ImageLoader', 'Original image failed, falling back to default puzzle image.');
                    activePuzzleImageSrc = DEFAULT_PUZZLE_IMAGE_PATH; // Update global variable to default path for future calls.
                    _loadImageResource(DEFAULT_PUZZLE_IMAGE_PATH) // Recursively attempt to load the default image.
                        .then(resolve) // If default loads successfully, resolve the initial promise.
                        .catch(fallbackErr => { // If default also fails, then reject.
                            console.error('ImageLoader Error: Default fallback image also failed.', fallbackErr);
                            reject(new Error(`Failed to load: \"${imageUrl}\", and fallback (${DEFAULT_PUZZLE_IMAGE_PATH}) also failed: ${fallbackErr.message}.`));
                        });
                } else {
                    // If even the default image fails (which is the last resort), reject.\
                    reject(new Error(`Critical: Default puzzle image (${DEFAULT_PUZZLE_IMAGE_PATH}) could not be loaded. Please ensure file exists and is not corrupt.`));
                }
            };
            img.src = imageUrl; // Start loading the image by setting its source.
        });
    }

    /**
     * Creates all individual puzzle tile DOM elements based on the loaded image and current grid size.
     * Appends tiles to the puzzle container using a document fragment for optimized performance.
     * @private
     * @param {HTMLImageElement} image - The successfully loaded HTMLImageElement object.\
     */
    function _dynamicallyCreatePuzzleTiles(image) {
        puzzleContainerEl.innerHTML = ''; // Clear any previous content (placeholder, old tiles) for a fresh setup.
        activeTilesDataArray = []; // Reset the array that tracks tile data.

        _configurePuzzleContainerGridStyles(); // Apply CSS Grid styles based on currentGridSize.

        const slicingDims = _calculateTileSlicingDimensions(image); // Get precise dimensions for image background positioning.
        logDebug('TileCreation', 'Calculated image slicing dimensions:', slicingDims);

        const fragment = document.createDocumentFragment(); // Use DocumentFragment for batch DOM insertions, highly optimized for large grids.
        const totalTiles = currentGridSize * currentGridSize;

        for (let i = 0; i < totalTiles; i++) {
            const tileEl = _createSingleTileDOMElement(i, image, slicingDims, totalTiles);
            activeTilesDataArray.push({ element: tileEl, originalId: i }); // Store tile data for win-checking.
            fragment.appendChild(tileEl);
        }

        puzzleContainerEl.appendChild(fragment); // Perform a single, efficient DOM append operation.
        logDebug('TileCreation', `${activeTilesDataArray.length} tiles dynamically created and appended to DOM.`);
    }

    /**
     * Configures the CSS Grid `grid-template-columns` and `grid-template-rows` on the main puzzle container element.
     * @private
     */
    function _configurePuzzleContainerGridStyles() {
        // Read current computed width/height of the puzzle shroud to ensure pixel-perfect calculations below.
        // Use getComputedStyle on the `document.documentElement` to read custom properties defined in `:root`.
        const rootStyle = getComputedStyle(document.documentElement); 
        const cssPuzzleDimValue = rootStyle.getPropertyValue('--puzzle-base-dimension').trim();
        // Use the CSS variable value or fall back to a reasonable constant if it's not set/parseable.
        const finalPuzzleDimPx = parseFloat(cssPuzzleDimValue) || BASE_PUZZLE_AREA_DIMENSION_PX_FALLBACK;

        // Apply these dimensions to the puzzle shroud so that its clientWidth/Height are correct for slicing.
        puzzleShroudEl.style.width = `${finalPuzzleDimPx}px`;
        puzzleShroudEl.style.height = `${finalPuzzleDimPx}px`;
        
        puzzleContainerEl.style.gridTemplateColumns = `repeat(${currentGridSize}, 1fr)`;
        puzzleContainerEl.style.gridTemplateRows = `repeat(${currentGridSize}, 1fr)`;
        logDebug('TileCreation', `Puzzle container grid configured for ${currentGridSize}x${currentGridSize} matrix.`);
    }

    /**
     * Calculates precise dimensions required for correctly slicing and positioning the background image for each tile.
     * @private
     * @param {HTMLImageElement} image - The loaded source image (`HTMLImageElement` object).\
     * @returns {object} An object containing the calculated dimensions:\
     *                   `tilePhysicalWidthPx`, `tilePhysicalHeightPx`: Actual pixel dimensions of a single tile.\
     *                   `bgScaledWidthPx`, `bgScaledHeightPx`: The dimensions the image would have if it covered the entire puzzle container.\
     *                   `bgOffsetXCorrectionPx`, `bgOffsetYCorrectionPx`: Offsets to center the scaled background image within the container if aspect ratios differ.\
     */
    function _calculateTileSlicingDimensions(image) {
        // Use clientWidth/clientHeight for runtime pixel dimensions, which are most accurate after CSS has been applied.\
        const containerWidth = puzzleShroudEl.clientWidth;
        const containerHeight = puzzleShroudEl.clientHeight;
        
        const tilePhysicalWidthPx = containerWidth / currentGridSize;
        const tilePhysicalHeightPx = containerHeight / currentGridSize;

        const imageAspectRatio = image.naturalWidth / image.naturalHeight;
        const containerAspectRatio = containerWidth / containerHeight;

        let bgScaledWidthPx, bgScaledHeightPx;
        let bgOffsetXCorrectionPx = 0; // Horizontal offset to center the scaled background
        let bgOffsetYCorrectionPx = 0; // Vertical offset to center the scaled background

        // Logic to scale background image to "cover" the container while maintaining its aspect ratio.
        if (imageAspectRatio > containerAspectRatio) { // If image is wider (more landscape) than container
            bgScaledHeightPx = containerHeight; // Image height matches container height
            bgScaledWidthPx = containerHeight * imageAspectRatio; // Image width scales proportionally
            bgOffsetXCorrectionPx = (containerWidth - bgScaledWidthPx) / 2; // Center horizontally
        } else { // If image is taller (more portrait) or square compared to container
            bgScaledWidthPx = containerWidth; // Image width matches container width
            bgScaledHeightPx = containerWidth / imageAspectRatio; // Image height scales proportionally
            bgOffsetYCorrectionPx = (containerHeight - bgScaledHeightPx) / 2; // Center vertically
        }

        return {
            tilePhysicalWidthPx, tilePhysicalHeightPx,
            bgScaledWidthPx, bgScaledHeightPx,
            bgOffsetXCorrectionPx, bgOffsetYCorrectionPx
        };
    }

    /**
     * Creates a single HTML `div` element for a puzzle tile, applies its specific background style and attributes.\
     * Attaches all necessary event listeners (drag/drop, keyboard interaction).\
     * @private
     * @param {number} tileId - The original, sequential ID of this tile (0 to total_tiles-1).\
     * @param {HTMLImageElement} image - The loaded source image (`HTMLImageElement` object).\
     * @param {object} slicingDims - Pre-calculated dimensions from `_calculateTileSlicingDimensions` for background positioning.\
     * @param {number} totalTiles - Total number of tiles in the current puzzle.\
     * @returns {HTMLElement} The created and configured `div` element representing the puzzle tile.\
     */
    function _createSingleTileDOMElement(tileId, image, slicingDims, totalTiles) {
        const tileEl = document.createElement('div');
        tileEl.className = 'puzzle-tile';
        tileEl.setAttribute('role', 'button');
        tileEl.setAttribute('tabindex', '0');
        tileEl.setAttribute('aria-label', `Puzzle piece ${tileId + 1} of ${totalTiles}. Original position for ${Math.floor(tileId / currentGridSize) + 1}th row, ${tileId % currentGridSize + 1}th column.`);
        
        const row = Math.floor(tileId / currentGridSize);
        const col = tileId % currentGridSize;

        tileEl.style.backgroundImage = `url("${image.src}")`;
        tileEl.style.backgroundSize = `${slicingDims.bgScaledWidthPx}px ${slicingDims.bgScaledHeightPx}px`;
        tileEl.style.backgroundPosition =
            `-${(col * slicingDims.tilePhysicalWidthPx) - slicingDims.bgOffsetXCorrectionPx}px ` +
            `-${(row * slicingDims.tilePhysicalHeightPx) - slicingDims.bgOffsetYCorrectionPx}px`;

        if (slicingDims.tilePhysicalWidthPx < MIN_TILE_SIZE_FOR_BORDER_PX || slicingDims.tilePhysicalHeightPx < MIN_TILE_SIZE_FOR_BORDER_PX) {
            tileEl.classList.add('tile-no-border');
        }
        tileEl.dataset.id = tileId.toString();
        tileEl.draggable = true;
        _attachStandardEventListenersToTile(tileEl);

        let animDelay = tileId * UI_ANIMATION_TIMINGS_MS.TILE_ENTRY_STAGGER_BASE;
        if (currentGridSize > 10) {
            animDelay *= UI_ANIMATION_TIMINGS_MS.TILE_ENTRY_STAGGER_LARGE_GRID_FACTOR;
        }
        animDelay = Math.min(animDelay, 1200);

        if (currentGridSize > GRID_SIZE_TILE_ANIMATION_SIMPLIFY_THRESHOLD) {
            tileEl.style.opacity = '1';
            tileEl.style.transform = 'scale(1) rotateY(0deg) translateZ(0)';
        } else {
            tileEl.style.setProperty('--tile-animation-delay', `${animDelay / 1000}s`);
        }
        return tileEl;
    }

    /**
     * Attaches all standard event listeners (drag/drop, keyboard, focus) to a given puzzle tile element.
     * @private
     * @param {HTMLElement} tileEl - The puzzle tile DOM element to attach listeners to.
     */
    function _attachStandardEventListenersToTile(tileEl) {
        tileEl.addEventListener('dragstart', _handleTileDragStart);
        tileEl.addEventListener('dragover', _handleTileDragOver);
        tileEl.addEventListener('drop', _handleTileDrop);
        tileEl.addEventListener('dragend', _handleTileDragEnd);
        tileEl.addEventListener('keydown', _handleTileKeyDown);
        tileEl.addEventListener('focus', (e) => e.target.classList.add('tile-keyboard-focus'));
        tileEl.addEventListener('blur', (e) => e.target.classList.remove('tile-keyboard-focus'));
    }


    // --- Tile Shuffling Logic ---

    /**
     * Shuffles the tiles on the puzzle grid visually and updates their DOM order.\
     * Uses the Fisher-Yates (Knuth) shuffle algorithm applied directly to DOM elements for efficient reordering.\
     * Includes a customizable visual cue animation before the actual shuffle occurs.\
     * @private
     * @async
     */
    async function _shuffleTilesOnGrid() {
        logDebug('ShuffleLogic', 'Initiating tile shuffle sequence.');
        const tilesInDOM = Array.from(puzzleContainerEl.children);
        if (!tilesInDOM.length) { logDebug('Shuffle', 'No tiles found in container to shuffle. Skipping shuffle operation.'); return; }

        let cueDuration = 0;
        if (currentGridSize <= GRID_SIZE_SHUFFLE_SIMPLIFY_THRESHOLD) {
            tilesInDOM.forEach(t => t.classList.add('shuffling-visual-effect'));
            cueDuration = UI_ANIMATION_TIMINGS_MS.SHUFFLE_VISUAL_CUE_DURATION_SMALL_GRID;
        } else {
            logDebug('ShuffleLogic', `Grid size (${currentGridSize}x${currentGridSize}) > threshold. Using simplified visual shuffle cue.`);
            cueDuration = UI_ANIMATION_TIMINGS_MS.SHUFFLE_VISUAL_CUE_DURATION_LARGE_GRID;
        }

        await _delayExecution(cueDuration);

        if (currentGridSize <= GRID_SIZE_SHUFFLE_SIMPLIFY_THRESHOLD) {
            tilesInDOM.forEach(t => t.classList.remove('shuffling-visual-effect'));
        }

        // Fisher-Yates shuffle algorithm on the array of DOM nodes.
        for (let i = tilesInDOM.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // Swap DOM elements in their parent
            // This is a correct way to do Fisher-Yates on a live HTMLCollection / NodeList via insertBefore
            const nodeA = tilesInDOM[i];
            const nodeB = tilesInDOM[j];
            
            // To swap nodeA (at index i) and nodeB (at index j, where j < i):
            // 1. Get a reference to nodeA's next sibling (if it exists)
            const nodeA_nextSibling = nodeA.nextSibling;
            // 2. Insert nodeB immediately before nodeA
            puzzleContainerEl.insertBefore(nodeB, nodeA);
            // 3. Insert nodeA at nodeB's original position (which is now occupied by its own next sibling, nodeA's previous next sibling)
            puzzleContainerEl.insertBefore(nodeA, nodeB.nextSibling); // This will insert A back right after B (in its new position)
        }
        
        logDebug('ShuffleLogic', 'Tiles shuffled (DOM order updated).');
    }


    // --- Game Timer Logic ---

    /**
     * Initializes and starts the game timer. The timer updates the display every second.\
     * It will stop automatically when `isGameCurrentlyActive` becomes false (e.g., on game won/reset).\
     * @private
     */
    function _initializeAndStartGameTimer() {
        logDebug('Timer', 'Initializing and starting game timer.');
        if (gameTimerIntervalId) {
            clearInterval(gameTimerIntervalId);
            logDebug('Timer', 'Cleared an existing timer interval before starting a new one.');
        }
        elapsedSeconds = 0;
        timerDisplayEl.textContent = formatTime(elapsedSeconds);

        gameTimerIntervalId = setInterval(() => {
            if (isGameCurrentlyActive) {
                elapsedSeconds++;
                timerDisplayEl.textContent = formatTime(elapsedSeconds);
            } else {
                clearInterval(gameTimerIntervalId);
                gameTimerIntervalId = null;
                logDebug('Timer', 'Timer stopped due to game becoming inactive.');
            }
        }, 1000);
    }


    // --- Drag and Drop Event Handlers (for Tile Swapping) ---

    /**
     * Handles the `dragstart` event, triggered when a user begins dragging a tile.\
     * It stores the dragged tile and applies visual feedback.\
     * @private\
     * @param {DragEvent} event - The `DragEvent` object from the browser.\
     */
    function _handleTileDragStart(event) {
        if (!isGameCurrentlyActive) {
            event.preventDefault(); // Prevent dragging if the game is not active.
            logDebug('DragDrop', 'DragStart ignored: Game not active.');
            return;
        }
        currentlyDraggedTileElement = event.target.closest('.puzzle-tile');
        if (!currentlyDraggedTileElement) return;

        setTimeout(() => { // Using setTimeout to allow browser to render drag image before class change.
            if(currentlyDraggedTileElement) {
                currentlyDraggedTileElement.classList.add('dragging');
                logDebug('DragDrop', `DragStart: Applied 'dragging' class to Tile ID ${currentlyDraggedTileElement.dataset.id}.`);
            }
        }, 0);

        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', currentlyDraggedTileElement.dataset.id);
        logDebug('DragDrop', `Drag started for Tile ID: ${currentlyDraggedTileElement.dataset.id}.`);
    }

    /**
     * Handles the `dragover` event, which is fired when a dragged element or text selection \
     * is dragged over a valid drop target. Crucial: `event.preventDefault()` must be called \
     * here to allow a drop to occur on this element.\
     * @private\
     * @param {DragEvent} event - The `DragEvent` object.\
     */
    function _handleTileDragOver(event) {
        if (!isGameCurrentlyActive) return;
        event.preventDefault(); // Prevents browser default (e.g., not allowing drop), which is necessary for `drop` event to fire.
        event.dataTransfer.dropEffect = 'move'; // Visual feedback that a "move" is possible.
    }

    /**
     * Handles the `drop` event, fired when a dragged element is dropped on a valid target.\
     * This function implements the actual logic for swapping the positions of two puzzle tiles in the DOM.\
     * @private\
     * @param {DragEvent} event - The `DragEvent` object.\
     */
    function _handleTileDrop(event) {
        if (!isGameCurrentlyActive || !currentlyDraggedTileElement) {
            logDebug('DragDrop', 'Drop ignored: Game not active or no tile being dragged.', { active: isGameCurrentlyActive, dragged: !!currentlyDraggedTileElement });
            return;
        }
        event.preventDefault();

        const dropTargetTileElement = event.target.closest('.puzzle-tile'); // Identify the actual puzzle tile element where the drop occurred.

        if (dropTargetTileElement && dropTargetTileElement !== currentlyDraggedTileElement) {
            logDebug('DragDrop', `Drop: Tile ID ${currentlyDraggedTileElement.dataset.id} dropped onto Tile ID ${dropTargetTileElement.dataset.id}.`);

            // --- Robust DOM Node Swap Implementation ---
            // Uses temporary placeholders to reliably swap elements in the DOM,
            // works for both adjacent and non-adjacent tiles.
            const parentContainer = puzzleContainerEl;
            const draggedNode = currentlyDraggedTileElement;
            const targetNode = dropTargetTileElement;

            // Create temporary placeholders at their current positions
            const tempPlaceholder1 = document.createElement('div');
            parentContainer.insertBefore(tempPlaceholder1, draggedNode);

            const tempPlaceholder2 = document.createElement('div');
            parentContainer.insertBefore(tempPlaceholder2, targetNode);

            // Now, insert the actual nodes into the placeholders' spots.
            parentContainer.insertBefore(draggedNode, tempPlaceholder2);
            parentContainer.insertBefore(targetNode, tempPlaceholder1);

            // Remove the temporary placeholders.
            tempPlaceholder1.remove();
            tempPlaceholder2.remove();
            // --- End Robust DOM Node Swap Implementation ---

            _incrementMoveCount();
            _checkForWinCondition();
        } else {
            logDebug('DragDrop', 'Drop occurred on itself or on an invalid non-tile element. No swap performed.');
        }
    }

    /**
     * Handles the `dragend` event, which fires after a drag operation finishes (e.g., on successful drop or drag cancel).\
     * Used for cleaning up temporary styles or state related to dragging.\
     * @private\
     */
    function _handleTileDragEnd() {
        if (currentlyDraggedTileElement) {
            currentlyDraggedTileElement.classList.remove('dragging');
            logDebug('DragDrop', `DragEnd: Removed 'dragging' class from Tile ID ${currentlyDraggedTileElement.dataset.id}.`);
        }
        currentlyDraggedTileElement = null;
    }


    // --- Keyboard Interaction Logic (for Accessibility) ---

    /**
     * Handles `keydown` events on puzzle tiles, enabling keyboard-based tile selection and swapping.\
     * Users can select two tiles with `Enter` or `Space` and then swap their positions.\
     * `Escape` key deselects a tile.\
     * @private\
     * @param {KeyboardEvent} event - The `KeyboardEvent` object.\
     */
    function _handleTileKeyDown(event) {
        if (!isGameCurrentlyActive) return;

        const currentFocusedTile = event.target.closest('.puzzle-tile');
        if (!currentFocusedTile) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (!keyboardSelectedTile1) {
                // First tile selection
                keyboardSelectedTile1 = currentFocusedTile;
                logDebug('KeyboardInteraction', `Tile ID ${keyboardSelectedTile1.dataset.id} selected as first tile for keyboard swap.`);
            } else if (keyboardSelectedTile1 === currentFocusedTile) {
                // Deselect if the same tile is pressed again
                keyboardSelectedTile1.classList.remove('tile-keyboard-focus');
                keyboardSelectedTile1 = null;
                logDebug('KeyboardInteraction', `Tile ID ${currentFocusedTile.dataset.id} deselected (same tile selected again).`);
            } else { // Second tile selected - perform the swap
                logDebug('KeyboardInteraction', `Attempting to swap Tile ID ${keyboardSelectedTile1.dataset.id} with Tile ID ${currentFocusedTile.dataset.id} via keyboard.`);

                // Perform DOM swap using the same robust temporary placeholder method as drag-and-drop.
                const parentContainer = puzzleContainerEl;
                const sel1 = keyboardSelectedTile1;
                const sel2 = currentFocusedTile;

                const tempPlaceholder1 = document.createElement('div'); parentContainer.insertBefore(tempPlaceholder1, sel1);
                const tempPlaceholder2 = document.createElement('div'); parentContainer.insertBefore(tempPlaceholder2, sel2);

                parentContainer.insertBefore(sel1, tempPlaceholder2);
                parentContainer.insertBefore(sel2, tempPlaceholder1);

                tempPlaceholder1.remove();
                tempPlaceholder2.remove();

                _incrementMoveCount();
                _checkForWinCondition();

                sel1.classList.remove('tile-keyboard-focus');
                keyboardSelectedTile1 = null;
                sel2.focus(); // Shift keyboard focus to the second tile involved in the swap.
                logDebug('KeyboardInteraction', 'Tiles swapped successfully via keyboard.');
            }
        } else if (event.key === "Escape" && keyboardSelectedTile1) {
            // If Escape key is pressed and a tile is selected, deselect it.
            keyboardSelectedTile1.classList.remove('tile-keyboard-focus');
            keyboardSelectedTile1 = null;
            logDebug('KeyboardInteraction', 'Keyboard selection cancelled with Escape key.');
        }
        // Optional: Implement arrow key navigation for more complex grid traversal accessibility.
    }


    // --- Game State Management (Move Counter, Win Condition) ---

    /**
     * Increments the move counter and updates its display in the UI.
     * @private
     */
    function _incrementMoveCount() {
        currentMovesCount++;
        movesCounterDisplayEl.textContent = currentMovesCount.toString();
        logDebug('GameStats', `Moves: ${currentMovesCount}`);
    }

    /**
     * Checks if the puzzle has been solved. A puzzle is solved when all tiles are in their correct original positions\
     * (i.e., their `data-id` matches their current index in the DOM).\
     * If solved, it triggers the `_handleGameWonSequence`.\
     * @private\
     */
    function _checkForWinCondition() {
        logDebug('WinCheck', 'Checking for puzzle win condition...');
        const tilesInDOM = Array.from(puzzleContainerEl.children);

        if (tilesInDOM.length === 0 || tilesInDOM.length !== currentGridSize * currentGridSize) {
             logDebug('WinCheck', 'Tile count mismatch during win check or no tiles present. Skipping.', tilesInDOM.length);
             return;
        }

        for (let i = 0; i < tilesInDOM.length; i++) {
            if (!tilesInDOM[i].dataset || parseInt(tilesInDOM[i].dataset.id) !== i) {
                logDebug('WinCheck', `Puzzle not solved: Tile at index ${i} (ID ${tilesInDOM[i].dataset.id}) is not in place.`);
                return;
            }
        }
        logDebug('WinCheck', 'Puzzle found to be solved!');
        _handleGameWonSequence();
    }

    /**
     * Handles the sequence of events when the game is successfully won (puzzle solved).\
     * It stops the timer, updates final statistics, displays the success modal,\
     * and makes tiles non-interactive.\
     * @private\
     */
    function _handleGameWonSequence() {
        isGameCurrentlyActive = false;
        if (gameTimerIntervalId) {
            clearInterval(gameTimerIntervalId);
            gameTimerIntervalId = null;
            logDebug('GameFlow', 'Game won. Timer stopped.');
        }

        finalMovesDisplayEl.textContent = currentMovesCount.toString();
        finalTimeDisplayEl.textContent = formatTime(elapsedSeconds);

        successMessageModalEl.classList.remove('hidden');
        successMessageModalEl.setAttribute('aria-hidden', 'false');
        setTimeout(() => playAgainButtonEl.focus(), UI_ANIMATION_TIMINGS_MS.SUCCESS_MODAL_FADE_DURATION / 2);

        Array.from(puzzleContainerEl.children).forEach(tile => {
            tile.draggable = false;
            tile.setAttribute('tabindex', '-1');
            tile.classList.remove('tile-keyboard-focus');

            if (currentGridSize <= GRID_SIZE_TILE_ANIMATION_SIMPLIFY_THRESHOLD) {
                tile.classList.add('correct-placement-flash');
                setTimeout(() => tile.classList.remove('correct-placement-flash'),
                           UI_ANIMATION_TIMINGS_MS.TILE_ENTRY_ANIMATION_DURATION + 200);
            }
        });
        logDebug('GameFlow', 'Game won sequence completed. UI updated accordingly.');
    }


    // --- UI Control Event Handlers (Global Controls: Difficulty, Upload, Play Again) ---

    /**
     * Handles the `change` event on the file input for custom image uploads.\
     * It reads the selected image file (as a Data URL) and triggers a game re-initialization with it.\
     * Includes basic file type validation.\
     * @private\
     * @param {Event} event - The `change` event object from the file input.\
     */
    function _handleImageFileUpload(event) {
        logDebug('ImageUpload', 'Image file selection initiated.');
        const file = event.target.files[0];

        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Invalid file type selected. Please choose an image file (PNG, JPG, GIF, WEBP, etc.).');
                event.target.value = null;
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                logDebug('ImageUpload', 'File successfully read by FileReader. Preparing new puzzle source.');
                activePuzzleImageSrc = e.target.result;
                cachedLoadedImageObject = null; // Invalidate any previous cached image for user upload.
                initializeNewGame();
            };

            reader.onerror = (e) => {
                console.error('FileReader Error:', e);
                alert('An error occurred while reading the image file. Please try a different file.');
            };

            reader.readAsDataURL(file);
        } else {
            logDebug('ImageUpload', 'No file selected or file selection cancelled.');
        }
        event.target.value = null; // Always clear the file input's value after processing.
    }


    // --- Initial Page Setup and Event Listener Binding ---

    /**
     * Sets up the initial visual state of the page components when the DOM is loaded.\
     * This includes configuring puzzle area dimensions and applying initial section animations.\
     * @private\
     */
    function _setupInitialPageViewState() {
        logDebug('PageSetup', 'Setting up initial page view state.');

        // Get puzzle dimensions from CSS variable.
        const rootStyle = getComputedStyle(document.documentElement);
        const cssPuzzleDimValue = rootStyle.getPropertyValue('--puzzle-base-dimension').trim();
        const finalPuzzleDimPx = parseFloat(cssPuzzleDimValue) || BASE_PUZZLE_AREA_DIMENSION_PX_FALLBACK;

        puzzleShroudEl.style.width = `${finalPuzzleDimPx}px`;
        puzzleShroudEl.style.height = `${finalPuzzleDimPx}px`;
        logDebug('PageSetup', `Puzzle shroud dimensions set to: ${finalPuzzleDimPx}px x ${finalPuzzleDimPx}px (matching CSS).`);

        // Set the default image source for the preview panel on initial page load.
        imagePreviewEl.src = DEFAULT_PUZZLE_IMAGE_PATH;
        imagePreviewEl.onerror = () => {
            logDebug('ImageLoader', `Default preview image failed to load from: ${DEFAULT_PUZZLE_IMAGE_PATH}. Please check file path and integrity.`);
            imagePreviewEl.alt = "Default preview image unavailable.";
        };

        // Apply staggered animation delays to sections based on data-animation-order attributes.
        animatedSectionNodes.forEach((section) => {
            const order = parseInt(section.dataset.animationOrder || '1');
            const delayMs = order * UI_ANIMATION_TIMINGS_MS.SECTION_LOAD_ANIMATION_BASE_DELAY;
            section.style.setProperty('--animation-delay', `${delayMs / 1000}s`); // Set CSS custom property.
        });
        logDebug('PageSetup', 'Staggered animation delays applied to page sections.');

        _displayPuzzlePlaceholder("Awaiting Matrix Initialization...");
    }

    /**
     * Attaches all primary event listeners to the static UI elements of the game.\
     * This function is called once on `DOMContentLoaded`.\
     * @private\
     */
    function _initializeGlobalEventListeners() {
        logDebug('EventListeners', 'Initializing global UI event listeners.');

        startButtonEl.addEventListener('click', initializeNewGame);
        difficultySelectorEl.addEventListener('change', initializeNewGame);
        imageUploadInputEl.addEventListener('change', _handleImageFileUpload);

        // Accessibility enhancement for custom file input label
        const uploadLabel = imageUploadInputEl.previousElementSibling;
        if (uploadLabel && uploadLabel.tagName === 'LABEL' && uploadLabel.getAttribute('for') === imageUploadInputEl.id) {
            uploadLabel.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    imageUploadInputEl.click();
                    logDebug('UI', 'Upload via keyboard triggered for image input.');
                }
            });
        }

        playAgainButtonEl.addEventListener('click', () => {
            successMessageModalEl.classList.add('hidden');
            successMessageModalEl.setAttribute('aria-hidden', 'true');
            setTimeout(initializeNewGame, UI_ANIMATION_TIMINGS_MS.SUCCESS_MODAL_FADE_DURATION / 2);
        });
        logDebug('EventListeners', 'All global event listeners attached successfully.');
    }

    /**
     * The main entry point for the JavaScript execution.\
     * This function is called once the entire HTML document has been completely loaded and parsed.\
     * @private\
     */
    function _onDOMLoaded() {
        logDebug('Application', 'DOM fully loaded and parsed. Initializing ChronoMatrix Engine...');
        _setupInitialPageViewState();
        _initializeGlobalEventListeners();
        logDebug('Application', 'ChronoMatrix Engine ready and operational. Awaiting user interaction.');
    }

    // --- Script Execution Start ---\
    // Attach the main initialization function to the 'DOMContentLoaded' event.\
    document.addEventListener('DOMContentLoaded', _onDOMLoaded);

    // --- Publicly Exposed Methods (Optional) ---\
    // This return statement ensures the IIFE (Immediately Invoked Function Expression) pattern is complete.\
    // No methods are exposed to the global scope for this self-contained game.\
    return { /* No public API exposed by default for this self-contained game. */ };

})(); // End of ChronoMatrixGame IIFE