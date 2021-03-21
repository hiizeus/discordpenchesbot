const ayarlar = require('./config.json');

let takmaadlar = {
    "h": "yardim", "help": "yardim", "y": "yardim", "commands": "yardim", "komutlar": "yardim",
    "p": "temizle", "t": "temizle", "clear": "temizle", "prune": "temizle",
};

let komutlar = {
    "yardim": {
        aciklama: "Tüm komutlar hakkında bilgi verir.",
        kullanim: "[komut]",
        islem: function (bot, msg, sonek) {
            var toSend = [];
            if (!sonek) {
                toSend.push("`" + ayarlar.command_prefix + "yardim <komut adı>` şeklinde yazarak daha fazla bilgi alabilirsin.\n");
                toSend.push("**Komutlar:**```glsl\n");
                Object.keys(komutlar).forEach(komut => {
                    if (komutlar[komut].hasOwnProperty("goruntulenebilir")) {
                        if (komutlar[komut].goruntulenebilir)
                            toSend.push("\n" + ayarlar.command_prefix + komut + " " + komutlar[komut].kullanim + "\n\t#" + komutlar[komut].aciklama);
                    } else
                        toSend.push("\n" + ayarlar.command_prefix + komut + " " + komutlar[komut].kullanim + "\n\t#" + komutlar[komut].aciklama);
                });
                toSend = toSend.join('');
                if (toSend.length >= 1990) {
                    msg.channel.send(toSend.substr(0, 1990).substr(0, toSend.substr(0, 1990).lastIndexOf('\n\t')) + "```");
                    setTimeout(() => {
                        msg.channel.send("```glsl" + toSend.substr(toSend.substr(0, 1990).lastIndexOf('\n\t')) + "```");
                    }, 1000);
                } else msg.channel.send(toSend + "```");
            } else {
                sonek = sonek.trim().toLowerCase();
                if (komutlar.hasOwnProperty(sonek)) {
                    toSend.push("`" + ayarlar.command_prefix + sonek + ' ' + komutlar[sonek].kullanim + "`");
                    if (komutlar[sonek].hasOwnProperty("bilgi")) toSend.push(komutlar[sonek].bilgi);
                    else if (komutlar[sonek].hasOwnProperty("aciklama")) toSend.push(komutlar[sonek].aciklama);
                    if (komutlar[sonek].hasOwnProperty("komutSil")) toSend.push("*Mesaj silinebilir*");
                    msg.channel.send(toSend);
                } else {
                    msg.channel.send("'" + sonek + "' komutu bulunamadı! Takma adlara izin verilmez!")
                        .then(msg => {
                            setTimeout(() => {
                                msg.delete();
                            }, 3000);
                        })
                }
            }
        }
    },

    "kanalbilgisi": {
        aciklama: "Kanal hakkında bilgi verir.",
        kullanim: "",
        komutSil: true,
        goruntulenebilir: true,
        islem: function (bot, msg) {
            var toSend = [];
            toSend.push('Kanal Adı: ', msg.channel.name);
            toSend.push('Kanal ID: ', msg.channel.id);
            toSend.push('Kanal Açıklaması: ', msg.channel.description);
            toSend.push('Server ID: ', msg.channel.guild.id);
            toSend.push('Server Adı: ', msg.channel.guild.name);
            msg.channel.send(toSend).then(msg => {
                if (this.komutSil) {
                    setTimeout(() => {
                        msg.delete()
                    }, 5000);
                }
            });
        }
    },


    "temizle": {
        aciklama: "Kanalda belirtilen sayıda mesajı temizler.",
        kullanim: "[silinecek mesaj sayısı]",
        komutSil: true,
        goruntulenebilir: true,
        islem: function (bot, msg, sonek) {
            if (msg.channel.type !== "dm") {
                if (msg.channel.permissionsFor(msg.author).has("MANAGE_MESSAGES")) { //mesaj atan kişinin mesajları düzenleme yetkisi varsa
                    if (msg.channel.permissionsFor(bot.user).has("MANAGE_MESSAGES")) { //botun mesajları düzenleme yetkisi varsa
                        if (sonek.length < 1) sonek = 1;
                        sonek++;
                        let silmeSayaci = -1;
                        msg.channel.messages.fetch({limit: sonek}).then(msgs => {
                            msgs.forEach(msg => {
                                msg.delete();
                                silmeSayaci++;
                            })
                        }).then(() => {
                            msg.channel.send(silmeSayaci + " adet mesaj silindi!").then((msg) => {
                                setTimeout(() => {
                                    msg.delete();
                                }, 3000)
                            });
                        });
                    }
                }
            }
        }
    }
};

exports.komutlar = komutlar;
exports.takmaadlar = takmaadlar;
