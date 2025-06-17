let hunger = 6;
let mood = 6;
const MAX_GAUGE = 6;
const DECAY_INTERVAL_MS = 1000 * 60 * 60 * 4; // 4時間
const STORAGE_KEY = "wanwan_gauge_data";

function renderGaugeImage(value, iconFullPath, iconEmptyPath) {
    let html = "";
    for (let i = 0; i < MAX_GAUGE; i++) {
        const iconPath = i < value ? iconFullPath : iconEmptyPath;
        html += `<img src="${iconPath}" class="gauge-icon" alt="gauge">`;
    }
    return html;
}

function updateDisplayGauge() {
    document.getElementById("hunger").innerHTML = renderGaugeImage(hunger, "icons/meat.png", "icons/meat_gray.png");
    document.getElementById("mood").innerHTML = renderGaugeImage(mood, "icons/heart.png", "icons/heart_gray.png");
}

function saveGaugeData() {
    const data = {
        hunger,
        mood,
        lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadGaugeData() {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) {
        saveGaugeData(); // 初回
        return;
    }

    const data = JSON.parse(dataStr);
    const now = Date.now();
    const elapsedMs = now - data.lastUpdated;
    const decayAmount = Math.floor(elapsedMs / DECAY_INTERVAL_MS);

    hunger = Math.max(0, data.hunger - decayAmount);
    mood = Math.max(0, data.mood - decayAmount);
    saveGaugeData(); // 減少後に保存しなおす
}

function startGaugeDecay() {
    setInterval(() => {
        const now = Date.now();
        const dataStr = localStorage.getItem(STORAGE_KEY);
        if (!dataStr) return;

        const data = JSON.parse(dataStr);
        const elapsedMs = now - data.lastUpdated;
        const decayAmount = Math.floor(elapsedMs / DECAY_INTERVAL_MS);

        if (decayAmount > 0) {
            hunger = Math.max(0, hunger - decayAmount);
            mood = Math.max(0, mood - decayAmount);
            saveGaugeData();
            updateDisplayGauge();
        }
    }, 60000);
}

window.addEventListener("DOMContentLoaded", () => {
    loadGaugeData();
    updateDisplayGauge();
    startGaugeDecay();
});

//　モーダル起動
document.getElementById("hunger").addEventListener("click", () => openModal('hunger'));
document.getElementById("mood").addEventListener("click", () => openModal('mood'));

let currentTarget = "";

function openModal(target) {
    currentTarget = target;
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("modalContent").innerHTML = originalModalContent;
}

const originalModalContent = `
	<p>どっちにする？</p>
	<div class="container">
		<div class="card" onclick="selectFood('meal')">
		<img src="icons/meat.png" alt="ごはん">
		<p>ごはん<br><br><br>おなか回復</p>
	</div>
	<div class="card" onclick="selectFood('snack')">
		<img src="icons/heart.png" alt="おやつ">
		<p>おやつ<br><br><br>ごきげん回復</p>
	</div>
`;

function selectFood(type) {
    let image = "";
    let text = "";
    let isFull = false;

    if (type === "meal") {
        if (hunger >= MAX_GAUGE) {
            isFull = true;
            image = "images/full.png";
            text = "もう食べられないよ〜";
        } else {
            image = "images/eating_meal.png";
            text = "もぐもぐ…ごはん中";
            hunger = Math.min(MAX_GAUGE, hunger + 1);
        }
    } else if (type === "snack") {
        if (mood >= MAX_GAUGE) {
            isFull = true;
            image = "images/full.png";
            text = "おやつはまたあとで〜";
        } else {
            image = "images/eating_snack.png";
            text = "もぐもぐ…おやつ中";
            mood = Math.min(MAX_GAUGE, mood + 1);
        }
    }

    document.getElementById("modalContent").innerHTML = `
        <p>${text}</p>
        <img src="${image}" alt="しばたろう">
    `;

    if (!isFull) {
        saveGaugeData();
        updateDisplayGauge();
    }

    setTimeout(() => {
        closeModal();
    }, 2000);
}
