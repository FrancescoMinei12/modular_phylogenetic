export function setupSlider(sliderId, onChange) {
    const slider = document.getElementById(sliderId);
    slider.addEventListener("input", (event) => {
        onChange(event.target.value);
    });
}
