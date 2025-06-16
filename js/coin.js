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
