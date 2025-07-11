let coinCount = 0;

function updateDisplayCoin() {
    document.getElementById("coin-count").textContent = coinCount;
}

// コインのアニメーション（回収時）
function animateCoinToDisplay(coin, totalAmount = null) {
    const rect = coin.getBoundingClientRect();

    coin.style.position = "fixed";
    coin.style.left = rect.left + "px";
    coin.style.top = rect.top + "px";
    coin.style.width = rect.width + "px";
    coin.style.height = rect.height + "px";
    coin.style.pointerEvents = "none";
    coin.style.zIndex = 10000; // ヘッダーより前面に出す

    coin.classList.add("coin-animating");

    // アニメーション後に削除して加算
    setTimeout(() => {
        coin.remove();
    }, 1000);
}

// コイン加算処理
function addCoinsToCounter(amount) {
    const before = coinCount;
    coinCount += parseInt(amount);
    const added = coinCount - before;

    updateDisplayCoin();
    localStorage.setItem("coinCount", coinCount);
    showCoinGain(added);
    updateEnhanceButtons();
}

// コインの強化ボタン状態更新
function updateEnhanceButtons() {
    const buttons = document.querySelectorAll(".enhance-button");
    buttons.forEach(button => {
        const cost = parseInt(button.dataset.cost);
        if (coinCount >= cost) {
            button.disabled = false;
            button.classList.remove("disabled");
        } else {
            button.disabled = true;
            button.classList.add("disabled");
        }
    });
}

// コイン増加のフロート表示
function showCoinGain(amount) {
    const coinDisplay = document.getElementById("coin-display");
    const coinText = document.createElement("div");
    coinText.className = "coin-float";
    coinText.innerText = `+${amount}`;

    const rect = coinDisplay.getBoundingClientRect();
    coinText.style.top = `${rect.bottom + window.scrollY + 5}px`;

    document.body.appendChild(coinText);

    setTimeout(() => {
        coinText.remove();
    }, 1500);
}
