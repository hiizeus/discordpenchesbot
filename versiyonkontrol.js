const axios = require("axios");
let version = require("./package.json").version;

exports.guncellemeKontrol = function () {
    axios.get("https://raw.githubusercontent.com/hiizeus/discordpenchesbot/main/package.json",)
        .then(response => {
            let sonSurum = response.data.version;
            let v = version.split(".").join(""); //1.0.0 => 100
            let s = sonSurum.split(".").join(""); //1.0.1 => 101

            if (v < s)
                console.log("Bot Güncel Değil! (Şuanki Versiyon: " + version + ") (Güncel Versiyon: " + sonSurum + ")");
            else if (v > s)
                console.log("Botunuz bir geliştirme sürümü: (v" + version + ")");
            else
                console.log("PenchesBot güncel (v" + version + ")");
        })
        .catch(err => {
            console.log(cWarn(" WARN ") + " Versiyon kontrol hatası: " + err);
        });
}
