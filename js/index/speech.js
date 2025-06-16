const speech = document.getElementById("speech");

let speechInterval;

const linesNormal = [
    "お客さん、まだかな〜",
    "今日もぽかぽかいい湯だよ〜",
    "いっぱいお客さんが来てくれるといいな",
    "おやつの時間はまだかな？"
];

const linesGuest = [
    "ゆっくりしていってね〜",
    "湯加減はいかがですか〜",
];

function startRandomSpeech(lines) {
    clearInterval(speechInterval);
    speechInterval = setInterval(() => {
        const rand = Math.floor(Math.random() * lines.length);
        speech.textContent = lines[rand];
        speech.style.display = 'block';
    }, 5000);
}
