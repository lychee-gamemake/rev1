const shiba = document.getElementById("shiba");
const guest = document.getElementById("guest");

let guestVisible = false;

function showGuest() {
    guestVisible = true;
    guest.style.display = "block";
    guest.src = "images/guest1.png"; // 通常立ち絵
    speech.textContent = "お客さんだ！いらっしゃいませ！";
    shiba.src = "images/shiba_talk.png";
    startRandomSpeech(linesGuest);

    document.querySelectorAll('.coin-icon').forEach(coin => {
        animateCoinToDisplay(coin);
    });

    // 10秒後に入浴画像へ切り替え
    setTimeout(() => {
        guest.src = "images/guest1_in.png";
        guest.classList.add("centered");
        speech.textContent = "ごゆっくりどうぞ〜";

        // 5分後に帰る
        setTimeout(() => {
            hideGuest();
        }, 10000); // 5秒
    }, 5000); // 5秒
}

function startGuestLoop() {
    setInterval(() => {
        if (!guestVisible) {
            showGuest();
        }
    }, 15000); // 15秒ごとにお客さん来訪
}

function hideGuest() {
    guestVisible = false;
    guest.style.display = "none";
    guest.classList.remove("centered");
    shiba.src = "images/shiba.png";
    startRandomSpeech(linesNormal);

    // ランダムなコイン額を生成（5〜14）
    const amount = Math.floor(Math.random() * 10 + 5);

    // コイン画像を作成
    const coin = document.createElement("img");
    coin.src = "icons/coin.png";
    coin.classList.add("coin-icon");
    coin.dataset.amount = amount;

    // コインの位置を設定（お客さんの位置）
    coin.style.left = "calc(80% - 30px)";
    coin.style.top = "calc(69% - 30px)";

    // クリックイベントで加算＆アニメーション
    coin.addEventListener("click", () => {
        coin.classList.add("coin-animating");
        setTimeout(() => {
            coin.remove();
            addCoinsToCounter(amount);
        }, 1000);
    });

    // 画面に追加
    document.getElementById("game").appendChild(coin);
}
