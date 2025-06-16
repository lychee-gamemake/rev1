let hunger = 6;
let mood = 6;
const MAX_GAUGE = 6;

function renderGaugeImage(value, iconFullPath, iconEmptyPath) {
    const max = 6;
    let html = "";

    for (let i = 0; i < max; i++) {
        const iconPath = i < value ? iconFullPath : iconEmptyPath;
        html += `<img src="${iconPath}" class="gauge-icon" alt="gauge">`;
    }
    return html;
}

function startGaugeDecay() {
    const decayInterval = 20 * 1000

    setInterval(() => {
        if (hunger > 0) hunger--;
        if (mood > 0) mood--;
        updateDisplayGauge();
    }, decayInterval);
}

function updateDisplayGauge() {
    document.getElementById("hunger").innerHTML = renderGaugeImage(hunger, "icons/meat.png", "icons/meat_gray.png");
    document.getElementById("mood").innerHTML = renderGaugeImage(mood, "icons/heart.png", "icons/heart_gray.png");
}
