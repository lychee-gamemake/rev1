let evaluationPoints = 0;
let currentGuests = [];
let allDogs = [];
const MAX_HISTORY_DAYS = 3;
const COIN_RATES = { 1: 100, 2: 150, 3: 200, 4: 300, 5: 500 };

fetch('data/dog_data.json')
    .then(res => res.json())
    .then(data => {
        allDogs = data;
        startGuestLoop();
        renderHistory();
    });

function getOnsenLevel(points) {
    if (points >= 142500) return 5;
    if (points >= 60000) return 4;
    if (points >= 25000) return 3;
    if (points >= 7500) return 2;
    return 1;
}
function getMaxGuests(level) {
    return level === 1 ? 1 : (level === 2 ? 2 : 3);
}
function getRibbon(visitCount) {
    if (visitCount >= 100) return '赤';
    if (visitCount >= 50) return '黄';
    if (visitCount >= 20) return '緑';
    if (visitCount >= 10) return '青';
    return null;
}
function getBuff(visitCount) {
    if (visitCount >= 100) return 3.0;
    if (visitCount >= 50) return 2.0;
    if (visitCount >= 20) return 1.5;
    if (visitCount >= 10) return 1.0;
    return 1.0;
}

function startGuestLoop() {
    setInterval(() => {
        const level = getOnsenLevel(evaluationPoints);
        if (currentGuests.length >= getMaxGuests(level)) return;
        const candidate = allDogs[Math.floor(Math.random() * allDogs.length)];
        candidate.visitCount++;
        const stay = getRandomInt(30, 60) * 360 * 1000;
        const guest = {
            ...candidate,
            arrivedAt: Date.now(),
            stayDuration: stay,
            seen: true
        };
        currentGuests.push(guest);
        renderGuest(guest);
        addHistoryEntry(guest);
        setTimeout(() => {
            removeGuest(guest.id);
        }, stay);
    }, 20 * 360 * 1000); // 20秒ごと（本番では20分）
}

function renderGuest(guest) {
    const guestImg = document.createElement('img');
    guestImg.src = guest.image_idle;
    guestImg.onerror = () => {
        console.error("画像読み込み失敗:", guest.image_idle);
    };
    guestImg.alt = guest.name;
    guestImg.className = 'guest-img';
    guestImg.style.position = 'absolute';
    guestImg.style.right = `2%`;
    guestImg.style.bottom = `20%`;
    //guestImg.style.left = `${getRandomInt(20, 70)}%`;
    //guestImg.style.top = `${getRandomInt(40, 70)}%`;
    guestImg.onclick = () => {
        const coin = Math.min(Math.floor(COIN_RATES[guest.rarity] * getBuff(guest.visitCount)), 1500);
        addCoinsToCounter(coin);
        guestImg.remove();
    };
    guestImg.dataset.wanId = guest.id;
    document.getElementById('game').appendChild(guestImg);
}

function removeGuest(id) {
    const index = currentGuests.findIndex(g => g.id === id);
    if (index !== -1) {
        const img = document.querySelector(`img[data-wan-id='${id}']`);
        if (img) img.remove();
        currentGuests.splice(index, 1);
    }
}

function addHistoryEntry(guest) {
    const history = JSON.parse(localStorage.getItem("wanHistory") || "[]");
    history.unshift({
        id: guest.id,
        name: guest.breed || `${guest.breed}（${guest.color}）`,
        rarity: guest.rarity,
        ribbon: getRibbon(guest.visitCount),
        seen: guest.seen,
        timestamp: Date.now(),
        coin: Math.min(Math.floor(COIN_RATES[guest.rarity] * getBuff(guest.visitCount)), 1500)
    });
    const cutoff = Date.now() - MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000;
    const trimmed = history.filter(entry => entry.timestamp >= cutoff);
    localStorage.setItem("wanHistory", JSON.stringify(trimmed));
}

function renderHistory() {
    const list = JSON.parse(localStorage.getItem("wanHistory") || "[]");
    const div = document.getElementById("history-list");
    div.innerHTML = list.map(h => `
    <div>
      ${h.name}（★${h.rarity}）${h.ribbon ? `🎀${h.ribbon}` : ''}：${new Date(h.timestamp).toLocaleString()} - ${h.coin}コイン [${h.seen ? '目撃済' : '未目撃'}]
    </div>`
    ).join("");
}

function clearHistoryDisplay() {
    localStorage.removeItem("wanHistory");
    renderHistory();
}

function closeHistoryModal() {
    document.getElementById("history-modal").classList.add("hidden");
}

// 履歴ボタンのイベント登録
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("history-display").onclick = () => {
        renderHistory();
        document.getElementById("history-modal").classList.remove("hidden");
    };
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addCoinsToCounter(amount) {
    let current = parseInt(localStorage.getItem("coinCount") || "0");
    current += amount;
    localStorage.setItem("coinCount", current);
    document.getElementById("coin-count").textContent = current;
}

// モーダルの外側クリックで閉じる
window.addEventListener("click", (event) => {
    // 対象のモーダルIDを配列で管理
    const modalIds = ["modal", "history-modal"];

    modalIds.forEach(id => {
        const modal = document.getElementById(id);
        if (modal && !modal.classList.contains("hidden") && event.target === modal) {
            modal.classList.add("hidden");
        }
    });
});