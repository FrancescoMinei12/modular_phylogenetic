/**
 * @file tree-controls.js
 * @brief Tree visualization control module
 * @description Provides interactive controls for manipulating phylogenetic tree visualizations
 * including zooming, panning, and label size adjustment.
 */
import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @namespace PhylogeneticTree.ui.components.TreeControls
 * @description Namespace containing all tree visualization control functions
 */

/* State variables for tree manipulation */

let _scale = 1;
let _initialScale = 1;
let _translateX = 0;
let _translateY = 0;
let _isDragging = false;
let _startX = 0;
let _startY = 0;
let _minScale = 0.5;
let _maxScale = 3;

/**
 * @function createControlPanel
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Creates interactive control panel for tree manipulation
 * @param {string} containerId - ID selector for parent container
 * @param {Object} treeData - Phylogenetic tree data object
 * @param {string} treeContainerId - ID selector for tree container
 */
function createControlPanel(containerId, treeData, treeContainerId) {
    const container = document.querySelector(containerId);
    if (!container) return;

    _scale = 1;
    _initialScale = 1;
    _translateX = 0;
    _translateY = 0;
    _isDragging = false;

    const controlPanel = document.createElement("div");
    controlPanel.className = "tree-control-panel";

    const zoomControls = document.createElement("div");
    zoomControls.className = "zoom-controls";

    const zoomInBtn = document.createElement("button");
    zoomInBtn.innerHTML = '<i class="fas fa-plus"></i>';
    zoomInBtn.title = "Zoom In";
    zoomInBtn.addEventListener("click", () => zoomIn(treeContainerId));

    const zoomOutBtn = document.createElement("button");
    zoomOutBtn.innerHTML = '<i class="fas fa-minus"></i>';
    zoomOutBtn.title = "Zoom Out";
    zoomOutBtn.addEventListener("click", () => zoomOut(treeContainerId));

    const resetBtn = document.createElement("button");
    resetBtn.innerHTML = '<i class="fas fa-sync"></i>';
    resetBtn.title = "Reset View";
    resetBtn.addEventListener("click", () => resetView(treeContainerId));

    const moveControls = document.createElement("div");
    moveControls.className = "move-controls";

    const panBtn = document.createElement("button");
    panBtn.innerHTML = '<i class="fas fa-arrows-alt"></i>';
    panBtn.title = "Pan Mode";
    panBtn.className = "toggle-button";
    panBtn.addEventListener("click", () => togglePanMode(treeContainerId, panBtn));

    const labelSizeControl = document.createElement("div");
    labelSizeControl.className = "label-size-control";

    const labelSizeLabel = document.createElement("span");
    labelSizeLabel.textContent = "Label Size:";

    const labelSizeSlider = document.createElement("input");
    labelSizeSlider.type = "range";
    labelSizeSlider.min = "8";
    labelSizeSlider.max = "16";
    labelSizeSlider.value = "12";
    labelSizeSlider.id = "label-size-control";
    labelSizeSlider.name = "label-size";
    labelSizeSlider.addEventListener("input", (e) => changeLabelSize(e.target.value, treeContainerId));

    zoomControls.appendChild(zoomInBtn);
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(resetBtn);

    moveControls.appendChild(panBtn);

    labelSizeControl.appendChild(labelSizeLabel);
    labelSizeControl.appendChild(labelSizeSlider);

    controlPanel.appendChild(zoomControls);
    controlPanel.appendChild(moveControls);
    controlPanel.appendChild(labelSizeControl);

    container.appendChild(controlPanel);
}

/**
 * @function updateTransform
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Updates CSS transform properties for tree container
 * @param {string} treeContainerId - ID selector for tree container
 */
function updateTransform(treeContainerId) {
    const treeContainer = document.querySelector(treeContainerId);
    if (!treeContainer) return;

    clampTranslation(treeContainerId);

    treeContainer.style.transform = `translate(${_translateX}px, ${_translateY}px) scale(${_scale})`;
}

/**
 * @function togglePanMode
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Toggles pan/drag mode for tree navigation
 * @param {string} treeContainerId - ID selector for tree container
 * @param {HTMLElement} button - Reference to pan mode toggle button
 */

function togglePanMode(treeContainerId, button) {
    const treeContainer = document.querySelector(treeContainerId);
    if (!treeContainer) return;

    const isPanMode = treeContainer.classList.toggle('pan-mode');
    button.classList.toggle('active', isPanMode);

    if (isPanMode) {
        treeContainer.style.cursor = 'grab';
        treeContainer.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    } else {
        treeContainer.style.cursor = 'default';
        treeContainer.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
}

/**
 * @function handleMouseDown
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Handles mouse down event for panning
 * @param {MouseEvent} e - Mouse event object
 */
function handleMouseDown(e) {
    _isDragging = true;
    _startX = e.clientX - _translateX;
    _startY = e.clientY - _translateY;
    e.currentTarget.style.cursor = 'grabbing';
}

/**
 * @function handleMouseMove
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Handles mouse move event for panning
 * @param {MouseEvent} e - Mouse event object
 */
function handleMouseMove(e) {
    if (!_isDragging) return;

    e.preventDefault();
    _translateX = e.clientX - _startX;
    _translateY = e.clientY - _startY;

    const treeContainer = e.target.closest('.pan-mode') || document.querySelector('.pan-mode');
    if (treeContainer) {
        updateTransform('#' + treeContainer.id);
    }
}

/**
 * @function handleMouseUp
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Handles mouse up event for panning
 * @param {MouseEvent} e - Mouse event object
 */
function handleMouseUp(e) {
    if (!_isDragging) return;

    _isDragging = false;
    const treeContainer = document.querySelector('.pan-mode');
    if (treeContainer) {
        treeContainer.style.cursor = 'grab';
    }
}

/**
 * @function zoomIn
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Increases zoom level of tree visualization
 * @param {string} treeContainerId - ID selector for tree container
 */
function zoomIn(treeContainerId) {
    const treeContainer = document.querySelector(treeContainerId);
    if (!treeContainer) return;

    if (_scale < _maxScale) {
        _scale *= 1.2;
        _scale = Math.min(_scale, _maxScale);
        updateTransform(treeContainerId);
    }
}

/**
 * @function zoomOut
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Decreases zoom level of tree visualization
 * @param {string} treeContainerId - ID selector for tree container
 */
function zoomOut(treeContainerId) {
    const treeContainer = document.querySelector(treeContainerId);
    if (!treeContainer) return;

    if (_scale > _minScale) {
        _scale *= 0.8;
        _scale = Math.max(_scale, _minScale);
        updateTransform(treeContainerId);
    }
}

/**
 * @function resetView
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Resets tree view to initial position and zoom
 * @param {string} treeContainerId - ID selector for tree container
 */
function resetView(treeContainerId) {
    const treeContainer = document.querySelector(treeContainerId);
    if (!treeContainer) return;

    _scale = _initialScale;
    _translateX = 0;
    _translateY = 0;
    updateTransform(treeContainerId);
}

/**
 * @function changeLabelSize
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Adjusts font size of all tree labels
 * @param {number} size - New font size in pixels
 * @param {string} treeContainerId - ID selector for tree container
 */
function changeLabelSize(size, treeContainerId) {
    const treeContainer = document.querySelector(treeContainerId);
    if (!treeContainer) return;

    const radialLabels = treeContainer.querySelectorAll('.labels text');
    const horizontalLabels = treeContainer.querySelectorAll('.nodes .node text');

    radialLabels.forEach(label => {
        label.style.fontSize = `${size}px`;
    });

    horizontalLabels.forEach(label => {
        label.style.fontSize = `${size}px`;
    });
}

/**
 * @function clampTranslation
 * @memberof PhylogeneticTree.ui.components.TreeControls
 * @description Constrains tree translation to keep it within viewable area
 * @param {string} treeContainerId - ID selector for tree container
 */
function clampTranslation(treeContainerId) {
    const treeContainer = document.querySelector(treeContainerId);
    const containerParent = treeContainer.closest('.tree-container-wrapper');
    if (!treeContainer || !containerParent) return;

    const containerRect = containerParent.getBoundingClientRect();
    const treeRect = treeContainer.getBoundingClientRect();

    const effectiveTreeWidth = treeRect.width / _scale;
    const effectiveTreeHeight = treeRect.height / _scale;

    const margin = 50;

    const maxX = _scale < 1 ? containerRect.width - effectiveTreeWidth * _scale : margin;
    const minX = _scale < 1 ? 0 : Math.min(0, containerRect.width - effectiveTreeWidth * _scale - margin);

    const maxY = _scale < 1 ? containerRect.height - effectiveTreeHeight * _scale : margin;
    const minY = _scale < 1 ? 0 : Math.min(0, containerRect.height - effectiveTreeHeight * _scale - margin);

    _translateX = Math.min(maxX, Math.max(minX, _translateX));
    _translateY = Math.min(maxY, Math.max(minY, _translateY));
}

PhylogeneticTree.ui.components.TreeControls = {
    createControlPanel,
    updateTransform,
    togglePanMode,
    zoomIn,
    zoomOut,
    resetView,
    changeLabelSize,
    clampTranslation
};