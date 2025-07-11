const shiba = document.getElementById("shiba");
const guest = document.getElementById("guest");

let guestVisible = false;

// メニュー起動
document.getElementById("menu-display").onclick = () => {
    document.getElementById("menu-modal").classList.remove("hidden");
};

// ページ遷移関数
function navigateTo(path) {
    window.location.href = path;
}

window.onload = () => {
    startRandomSpeech(linesNormal);
    startGuestLoop();
    startGaugeDecay();
    updateDisplayGauge();
    updateDisplayCoin();
};

window.addEventListener("DOMContentLoaded", () => {
    const savedCoins = localStorage.getItem("coinCount");
    coinCount = savedCoins ? parseInt(savedCoins) : 0;
    updateDisplayCoin();
});

const menuBtn = document.getElementById("menu-display");
if (menuBtn) {
    menuBtn.onclick = () => {
        const menuModal = document.getElementById("menu-modal");
        if (menuModal) menuModal.classList.remove("hidden");
    };
}

// モーダルの外側クリックで閉じる
window.addEventListener("click", (event) => {
    // 対象のモーダルIDを配列で管理
    const modalIds = ["modal", "menu-modal"];

    modalIds.forEach(id => {
        const modal = document.getElementById(id);
        if (modal && !modal.classList.contains("hidden") && event.target === modal) {
            modal.classList.add("hidden");
        }
    });
});

document.querySelectorAll(".close-button").forEach(button => {
    button.addEventListener("click", () => {
        button.closest(".modal").classList.add("hidden");
    });
});


