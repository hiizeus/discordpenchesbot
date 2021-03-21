/**
 * Kullanıcı olup olmadığını kontrol eder.
 * @param id
 * @returns {boolean|undefined}
 */
exports.isUser = function (id) {
    if (id === undefined)
        return undefined;
    return id.search(/<@!?[0-9]+>/) >= 0;
}

/**
 * Kullanıcı id si ve mesaj üzerinden mesajdaki kullanıcıyı bulup getirir
 * @param id
 * @param msg
 * @returns {User}
 */
exports.getUserForID = function (id, msg) {
    if (!id) return;
    id = id.match(/[0-9]+/);
    if (!id) return;
    id = id[0];
    return msg.mentions.users.get(id)
}


exports.tumKomutlar = function (takmaadlar) {
    let takma = [];
    for (let ta in takmaadlar)
        for (let tx in takmaadlar[ta]) {
            takma[takmaadlar[ta][tx]] = ta;
        }
    return takma;
}
