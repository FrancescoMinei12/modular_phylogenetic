import { PhylogeneticTree } from "../../namespace-init.js";

/**
 * @function createToggleSwitch
 * @description Creates a toggle switch in the specified container
 * @param {string} containerSelector - CSS selector for the container where the switch will be placed
 * @param {function} onToggle - Callback function that receives true/false when state changes
 * @returns {HTMLInputElement} - The input element that controls the toggle state
 */
function createToggleSwitch(containerSelector, onToggle = () => { }) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container not found: ${containerSelector}`);
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "flex items-center";

    const labelTextLeft = document.createElement("span");
    labelTextLeft.className = "mr-2 text-sm font-medium text-gray-700";
    labelTextLeft.textContent = "Radial";

    const toggleContainer = document.createElement("div");
    toggleContainer.className = "relative inline-flex items-center cursor-pointer";

    const track = document.createElement("div");
    track.className = "w-11 h-6 bg-gray-200 rounded-full transition-colors duration-200";

    const circle = document.createElement("div");
    circle.className = "absolute top-0.5 left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "sr-only";

    const labelTextRight = document.createElement("span");
    labelTextRight.className = "ml-2 text-sm font-medium text-gray-700";
    labelTextRight.textContent = "Horizontal";

    toggleContainer.appendChild(input);
    toggleContainer.appendChild(track);
    toggleContainer.appendChild(circle);

    wrapper.appendChild(labelTextLeft);
    wrapper.appendChild(toggleContainer);
    wrapper.appendChild(labelTextRight);

    container.appendChild(wrapper);

    const updateToggleState = () => {
        if (input.checked) {
            track.style.backgroundColor = "#2563eb";
            circle.style.transform = "translateX(20px)";
            circle.style.borderColor = "white";
        } else {
            track.style.backgroundColor = "#e5e7eb";
            circle.style.transform = "translateX(0)";
            circle.style.borderColor = "#d1d5db";
        }
    };

    toggleContainer.addEventListener("click", () => {
        input.checked = !input.checked;
        updateToggleState();
        onToggle(input.checked);
    });

    input.addEventListener("change", () => {
        updateToggleState();
        onToggle(input.checked);
    });

    return input;
}

PhylogeneticTree.ui.components.layoutSwitch = {
    createToggleSwitch
};