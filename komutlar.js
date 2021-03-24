const ayarlar = require('./config.json'),
    axios = require('axios'),
    emoji = require('./bot/emoji'),
    fonk = require('./bot/fonk'),
    ytdl = require('ytdl-core'),
    fs = require('fs');

let emojiNames = [];
for (let eji in emoji.emoji)
    emojiNames.push(eji);


let takmaadlar = {
    "yardim": [
        "h",
        "help",
        "komutlar",
        "commands",
    ],
    "temizle": [
        "t",
        "clear",
        "prune",
    ],
    "insta": [
        "ig",
    ],
    "yt": [
        "youtube",
    ],
    "emoji": emojiNames
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

    "insta": {
        aciklama: "Instagram'daki kullanının profil resmini döner.",
        kullanim: "[instagram kullanıcı adı]",
        goruntulenebilir: true,
        islem: function (bot, msg, sonek) {
            if (sonek.length > 1) {
                axios.get("https://www.instagram.com/" + sonek + "/?__a=1")
                    .then(response => {
                        let hd = response.data.graphql.user.profile_pic_url_hd;
                        msg.channel.send(hd);
                    })
                    .catch(err => {
                        console.log(err);
                        msg.channel.send("Kullanıcı verisini alamadım!");
                    });
            }
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
    },


    "emoji": {
        aciklama: "Özel emojileri kullanabilrisiniz. \n\t#örn p!tokat @username",
        kullanim: "[emoji => " + takmaadlar.emoji.join('|') + "] [kullanıcı adı]",
        goruntulenebilir: true,
        islem: function (bot, msg, sonek, komut) {
            let ch = msg.channel;
            let emo = emoji.emoji[komut];
            if (!sonek) {
                ch.send(emo.userund);
                return;
            }
            if (ch.type !== "dm") {
                if (!fonk.isUser(sonek)) {
                    ch.send(emo.usernot);
                    return;
                }

                let hedef = fonk.getUserForID(sonek, msg).username;
                let i = 0;
                if (emo.msg.length > 1)
                    i = Math.floor(Math.random() * (emo.msg.length + 1));
                let yazi = emo.msg[i];
                yazi = yazi.replace(/\?/, msg.author.username);
                yazi = yazi.replace(/\?/, hedef);

                let resim = emo.img[i];

                const exampleEmbed = {
                    color: 0x0099ff,
                    url: 'https://discord.js.org',
                    author: {
                        name: yazi,
                        icon_url: msg.author.avatarURL(),
                        url: resim,
                    },
                    image: {
                        url: resim,
                    },
                };
                ch.send({embed: exampleEmbed});
            }
        }
    },

    "yt": {
        aciklama: "Videonun ham URLini verir. Bu URL üzerinden videoyu indirebilirsin!",
        kullanim: "[YouTube URL]",
        goruntulenebilir: true,
        islem: async function (bot, msg, sonek) {
            if (sonek.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
                let info = await ytdl.getInfo(sonek);
                let formatSec = ytdl.chooseFormat(info.formats, {quality: 'highestaudio'});

                const vEmbed = {
                    color: 0x0099ff,
                    title: info.videoDetails.title,
                    url: formatSec.url,
                    description: 'Video indirmek için hazır başlığa tıklayarak indirebilirsin.',
                };

                msg.channel.send({embed: vEmbed});
            } else {
                msg.channel.send("Kral url geçersiz mk");
            }
        }
    }
};

exports.komutlar = komutlar;
exports.takmaadlar = takmaadlar;
