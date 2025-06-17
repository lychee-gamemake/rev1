let coinCount = 0;

function updateDisplayCoin() {
    document.getElementById("coin-count").textContent = coinCount;
}

function animateCoinToDisplay(coin) {
    const rect = coin.getBoundingClientRect();

    // 元の位置を固定
    coin.style.position = "fixed";
    coin.style.left = rect.left + "px";
    coin.style.top = rect.top + "px";
    coin.style.width = rect.width + "px";
    coin.style.height = rect.height + "px";
    coin.style.pointerEvents = "none";
    coin.style.zIndex = 999;

    // アニメーション用クラスを追加
    coin.classList.add("coin-animating");

    // アニメ終了後に削除＆加算
    setTimeout(() => {
        coin.remove();
        addCoinsToCounter(coin.dataset.amount || 5);
    }, 1000);
}

function addCoinsToCounter(amount) {
    coinCount += parseInt(amount);
    updateDisplayCoin();
    localStorage.setItem("coinCount", coinCount);
    showCoinGain(parseInt(amount));
    updateEnhanceButtons();
}

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

function showCoinGain(amount) {
    const coinDisplay = document.getElementById("coin-display");
    const coinText = document.createElement("div");
    coinText.className = "coin-float";
    coinText.innerText = `+${amount}`;

    // coinDisplayの下に絶対位置で配置
    const rect = coinDisplay.getBoundingClientRect();
    coinText.style.top = `${rect.bottom + window.scrollY + 5}px`;

    document.body.appendChild(coinText);

    // 一定時間後に削除
    setTimeout(() => {
        coinText.remove();
    }, 1500);
}

