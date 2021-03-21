const Discord = require('discord.js'),
    ayarlar = require('./config.json'),
    komutlar = require('./komutlar'),
    chalk = require('chalk'),
    versiyonKontrol = require('./versiyonkontrol'),
    fonk = require('./bot/fonk'),
    bot = new Discord.Client();

let debug = ayarlar.debug;
let takmaadlar = null;

cWarn = chalk.bgYellow.black;
cError = chalk.bgRed.black;
cDebug = chalk.bgWhite.black;
cGreen = chalk.bold.green;
cGrey = chalk.bold.grey;
cYellow = chalk.bold.yellow;
cBlue = chalk.bold.blue;
cRed = chalk.bold.red;
cServer = chalk.bold.magenta;
cUYellow = chalk.bold.underline.yellow;
cBgGreen = chalk.bgGreen.black;

ayarKontrol();

bot.on("error", m => {
    console.log(cError(" WARN ") + " " + m);
});
bot.on("warn", m => {
    if (show_warn) console.log(cWarn(" WARN ") + " " + m);
});
bot.on("debug", m => {
    if (debug) console.log(cDebug(" DEBUG ") + " " + m);
});

let activityList = [
    "PLAYING",
    "WATCHING",
];

bot.on('ready', () => {
    setInterval(() => {
        const index = Math.floor(Math.random() * (activityList.length - 1) + 1);
        bot.user.setActivity("p!yardim", {
            type: activityList[index],
        });
    }, 10000);

    versiyonKontrol.guncellemeKontrol();

    takmaadlar = fonk.tumKomutlar(komutlar.takmaadlar);

    console.log(cGreen("PenchesBot Hazır!") + " Şuanda " + bot.channels.cache.size + " kanal ve " + bot.guilds.cache.size + " sunucu dinliyor!");
});

bot.on("disconnected", () => {
    console.log(cRed("Bağlantısı Kesildi") + " => Discord");
    setTimeout(() => {
        console.log("Tekrar giriş yapmaya çalışıyor...");
        bot.login(ayarlar.token, (err, token) => {
            if (err) {
                console.log(err);
                setTimeout(() => {
                    process.exit(1);
                }, 2000);
            }
            if (!token) {
                console.log(cWarn(" WARN ") + " bağlantı hatası");
                setTimeout(() => {
                    process.exit(0);
                }, 2000);
            }
        });
    });
});

//Bir mesaj olayı tetiklendiğinde
bot.on('message', msg => {
    if (msg.author.id === bot.user.id) return;

    if (msg.channel.type === "dm") msg.channel.send("Şimdilik dmlere cevap vermiyorum canım ya");

    if (!msg.content.startsWith(ayarlar.command_prefix)) return;

    let komut = msg.content.split(" ")[0].replace(/\n/g, " ").substring(ayarlar.command_prefix.length).toLowerCase();
    let sonek = msg.content.replace(/\n/g, " ").substring(komut.length + 2).trim();

    //console.log(komut, sonek); //test

    if (msg.content.startsWith(ayarlar.command_prefix)) {
        if (komutlar.komutlar.hasOwnProperty(komut)) {
            komutCalistir(msg, komut, sonek, "normal");
        } else if (takmaadlar.hasOwnProperty(komut)) {
            //msg.content = msg.content.replace(/[^ ]+ /, ayarlar.command_prefix + komutlar.takmaadlar[komut] + " ");
            komutCalistir(msg, takmaadlar[komut], sonek, "normal", komut);
        }
    }
});

//Bot giriş yap
bot.login(ayarlar.token);

function ayarKontrol() {
    if (!ayarlar.token) {
        console.log(cWarn(" WARN ") + " Token tanımlanmadı!");
    }

    if (!ayarlar.bot_client_id) {
        console.log(cWarn(" WARN ") + " Bot Client ID Tanımlanmadı");
    }

    if (!ayarlar.command_prefix || ayarlar.command_prefix.length < 1) {
        console.log(cWarn(" WARN ") + " Bot için bir prefix tanımlanmadı");
    }
}

function komutCalistir(msg, komut, sonek, tip, orj = null) {
    try {
        if (tip === "normal") {
            if (msg.channel.type !== "dm") console.log(cServer(msg.channel.guild.name) + " > " + cGreen(msg.author.username) + " > " + msg.cleanContent.replace(/\n/g, " "));
            else console.log(cGreen(msg.author.username) + " > " + msg.cleanContent.replace(/\n/g, " "));
            komutlar.komutlar[komut].islem(bot, msg, sonek, orj);
        }
    } catch (e) {
        console.log(e.stack);
    }
}
