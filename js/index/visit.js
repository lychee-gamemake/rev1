// --- 定数定義 ---
const GUEST_INTERVAL_MINUTES = 45; // ← 本番用（デバッグ時は 0.5 とかでもOK）
const GUEST_CHECK_INTERVAL_MS = 20 * 360 * 1000; // ゲストチェックの頻度（ms）
const GUEST_STAY_MIN_SEC = 30 * 60;  // 滞在時間（秒）最小
const GUEST_STAY_MAX_SEC = 60 * 60;  // 滞在時間（秒）最大
const COIN_MAX_LIMIT = 1500;    // コイン報酬の上限

// 評価ポイント（温泉レベルに影響）
let evaluationPoints = 0;

// 現在滞在中のゲスト一覧
let currentGuests = [];

// 全わんこデータ
let allDogs = [];

// 履歴の保持日数（3日分）
const MAX_HISTORY_DAYS = 3;

// レアリティごとのコイン基準額
const COIN_RATES = { 1: 100, 2: 150, 3: 200, 4: 300, 5: 500 };

// 温泉レベル：まだ保存されてなければ1をセット
if (!localStorage.getItem("onsenLevel")) {
    localStorage.setItem("onsenLevel", "1");
}
function getOnsenLevelFromStorage() {
    return parseInt(localStorage.getItem("onsenLevel") || "1");
}

// ゲーム初期化（データ読み込み＆放置分処理）
fetch('data/dog_data.json')
    .then(res => res.json())
    .then(data => {
        allDogs = data;
        simulateOfflineGuests();
        startGuestLoop();
        renderHistory();
    });

// 評価ポイントから温泉レベルを取得
function getOnsenLevel(points) {
    if (points >= 142500) return 5;
    if (points >= 60000) return 4;
    if (points >= 25000) return 3;
    if (points >= 7500) return 2;
    return 1;
}

// レベルに応じた最大ゲスト数
function getMaxGuests(level) {
    return level === 1 ? 1 : (level === 2 ? 2 : 3);
}

// 来訪回数に応じたリボンの色を取得
function getRibbon(visitCount) {
    if (visitCount >= 100) return '赤';
    if (visitCount >= 50) return '黄';
    if (visitCount >= 20) return '緑';
    if (visitCount >= 10) return '青';
    return null;
}

// 来訪回数に応じたコイン倍率を取得
function getBuff(visitCount) {
    if (visitCount >= 100) return 3.0;
    if (visitCount >= 50) return 2.0;
    if (visitCount >= 20) return 1.5;
    if (visitCount >= 10) return 1.0;
    return 1.0;
}

// 放置していた間の来客を再現
function simulateOfflineGuests() {
    const lastTime = parseInt(localStorage.getItem("lastPlayedTime") || "0");
    if (!lastTime) return;

    const now = Date.now();
    const intervalMs = GUEST_INTERVAL_MINUTES * 60 * 1000;
    const diffMinutes = Math.floor((now - lastTime) / intervalMs);
    const level = getOnsenLevelFromStorage();
    const maxGuests = getMaxGuests(level);

    // ← 修正ポイント：IDとレアリティでフィルタ
    const validCandidates = allDogs.filter(dog =>
        dog.id >= 1 && dog.rarity && dog.rarity <= level
    );
    if (validCandidates.length === 0) return;

    for (let i = 0; i < diffMinutes * maxGuests; i++) {
        const candidate = validCandidates[Math.floor(Math.random() * validCandidates.length)];
        candidate.visitCount = (candidate.visitCount || 0) + 1;

        const coinAmount = Math.min(Math.floor(COIN_RATES[candidate.rarity] * getBuff(guest.visitCount)), COIN_MAX_LIMIT);

        const history = JSON.parse(localStorage.getItem("wanHistory") || "[]");
        history.unshift({
            id: candidate.id,
            name: candidate.breed || `${candidate.breed}（${candidate.color}）`,
            rarity: candidate.rarity,
            ribbon: getRibbon(candidate.visitCount),
            seen: false,
            timestamp: now - (diffGuests - i) * intervalMs,
            coin: coinAmount
        });
        const cutoff = now - MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000;
        const trimmed = history.filter(entry => entry.timestamp >= cutoff);
        localStorage.setItem("wanHistory", JSON.stringify(trimmed));

        dropOfflineCoin(coinAmount);
    }
}

// コイン画像を固定位置に1枚だけ表示し、クリックで加算
function dropOfflineCoin(amount) {
    const coinImg = document.createElement('img');
    coinImg.src = "icons/coin.png";
    coinImg.alt = "コイン";
    coinImg.className = "coin-icon";
    coinImg.dataset.amount = amount;
    coinImg.style.position = "absolute";
    coinImg.style.left = "80%";
    coinImg.style.top = "75%";
    coinImg.style.cursor = "pointer";

    coinImg.onclick = (e) => {
        const clickedRect = coinImg.getBoundingClientRect();
        const coins = Array.from(document.querySelectorAll('.coin-icon'));
        const radius = 15;

        let total = 0;
        const targets = [];

        coins.forEach(c => {
            const rect = c.getBoundingClientRect();
            const dx = rect.left - clickedRect.left;
            const dy = rect.top - clickedRect.top;

            if (Math.abs(dx) < radius && Math.abs(dy) < radius) {
                const amount = parseInt(c.dataset.amount) || 0;
                total += amount;
                targets.push({ el: c, amount });
            }
        });

        // 一括でアニメーションしつつ、最後にまとめて加算
        if (targets.length > 0) {
            targets.forEach(({ el, amount }) => animateCoinToDisplay(el, amount));
            // ⚠ animateCoinToDisplay の中で加算しないようにすること！
            // ここで合計値を1回だけ加算
            setTimeout(() => {
                addCoinsToCounter(total);
            }, 1000); // アニメ終わったあと
        }
    };
    document.getElementById("game").appendChild(coinImg);
}

// ゲストを定期的に生成
function startGuestLoop() {
    setInterval(() => {
        const level = getOnsenLevelFromStorage();
        if (currentGuests.length >= getMaxGuests(level)) return;

        // ← 修正ポイント：IDが1以上 & レアリティ制限
        const validCandidates = allDogs.filter(dog =>
            dog.id >= 1 && dog.rarity && dog.rarity <= level
        );
        if (validCandidates.length === 0) return;

        const candidate = validCandidates[Math.floor(Math.random() * validCandidates.length)];
        candidate.visitCount = (candidate.visitCount || 0) + 1;

        const stay = getRandomInt(GUEST_STAY_MIN_SEC, GUEST_STAY_MAX_SEC) * 1000;
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
    }, GUEST_CHECK_INTERVAL_MS);
}

// ゲスト画像を表示
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
    guestImg.dataset.wanId = guest.id;
    document.getElementById('game').appendChild(guestImg);
}

// ゲスト画像とデータを削除
function removeGuest(id) {
    const index = currentGuests.findIndex(g => g.id === id);
    if (index !== -1) {
        const guest = currentGuests[index];

        // 画像を消す
        const img = document.querySelector(`img[data-wan-id='${id}']`);
        if (img) img.remove();

        // コイン計算してドロップ
        const coinAmount = Math.min(Math.floor(COIN_RATES[guest.rarity] * getBuff(guest.visitCount)), COIN_MAX_LIMIT);
        dropOfflineCoin(coinAmount);

        currentGuests.splice(index, 1);
    }
}

// 来訪履歴に追加
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
    const cutoff = Date.now() - MAX_HISTORY_DAYS * 24 * 60 * 1000;
    const trimmed = history.filter(entry => entry.timestamp >= cutoff);
    localStorage.setItem("wanHistory", JSON.stringify(trimmed));
}

// 履歴の表示描画
function renderHistory() {
    const list = JSON.parse(localStorage.getItem("wanHistory") || "[]");
    const div = document.getElementById("history-list");
    div.innerHTML = list.map(h => `
    <div>
      ${h.name}（★${h.rarity}）${h.ribbon ? `🎀${h.ribbon}` : ''}：${new Date(h.timestamp).toLocaleString()} - ${h.coin}コイン [${h.seen ? '目撃済' : '未目撃'}]
    </div>`).join("");
}

// 履歴表示を初期化
function clearHistoryDisplay() {
    localStorage.removeItem("wanHistory");
    renderHistory();
}

// モーダル閉じる
function closeHistoryModal() {
    document.getElementById("history-modal").classList.add("hidden");
}

// min〜maxのランダム整数
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// コインを加算＆表示更新
function addCoinsToCounter(amount) {
    let current = parseInt(localStorage.getItem("coinCount") || "0");
    current += amount;
    localStorage.setItem("coinCount", current);
    document.getElementById("coin-count").textContent = current;
}

// 初期化と履歴ボタン設定
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("coin-count").textContent = localStorage.getItem("coinCount") || "0";
    document.getElementById("history-display").onclick = () => {
        renderHistory();
        document.getElementById("history-modal").classList.remove("hidden");
    };
});

// モーダル外クリックで閉じる
window.addEventListener("click", (event) => {
    const modalIds = ["modal", "history-modal"];
    modalIds.forEach(id => {
        const modal = document.getElementById(id);
        if (modal && !modal.classList.contains("hidden") && event.target === modal) {
            modal.classList.add("hidden");
        }
    });
});

// ゲーム終了時間を保存
window.addEventListener("beforeunload", () => {
    localStorage.setItem("lastPlayedTime", Date.now());
});