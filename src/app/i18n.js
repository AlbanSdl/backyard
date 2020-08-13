const fs = require("fs");

class i18n {

    constructor(lang) {
        this.lang = lang;
        this.translation = new Map();
        fs.readFile(`./src/resources/locales/${lang}`, "utf8", (err, data) => {
            if (!err) {
                data.split("\n").forEach((str) => {
                    const sp = str.split(/\s/)
                    if (sp.length > 1)
                        this.translation.set(sp[0], sp.slice(1, sp.length).join(" "));
                })
            }
        });
    }

    getLocaleString(id) {
        const translation = this.translation.get(id);
        return translation == null ? id : translation;
    }

}

module.exports.i18n = i18n;