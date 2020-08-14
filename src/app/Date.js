class DateFormat {

    constructor(date) {
        this.date = date;
    }

    toSuchDigits(dateElem, nb) {
        const d = new String(dateElem);
        if (nb > d.length)
            return `${'0'.repeat(nb-d.length)}${d}`;
        if (nb < d.length)
            return d.substring(d.length - nb);
        return d;
    }

    getYear(digits) {
        return this.toSuchDigits(this.date.getFullYear(), digits);
    }

    getMonth(digits) {
        return this.toSuchDigits(this.date.getMonth() + 1, digits);
    }

    getDate(digits) {
        return this.toSuchDigits(this.date.getDate(), digits);
    }

    getHour(digits) {
        return this.toSuchDigits(this.date.getHours(), digits);
    }

    getMinutes(digits) {
        return this.toSuchDigits(this.date.getMinutes(), digits);
    }

    getSeconds(digits) {
        return this.toSuchDigits(this.date.getSeconds(), digits);
    }

    getMillis(digits) {
        return this.toSuchDigits(this.date.getMilliseconds(), digits);
    }

    /**
     * Formats the date to match the format string. Here is a list of all the keywords
     * `y` year
     * `M` month
     * `d` date
     * `h` hour
     * `m` minutes
     * `s` seconds
     * `S` millis
     * Set as much characters as you would like numbers to appear
     * @param {String} format the format to follow
     */
    format(format) {
        const reg = /(y+)|(m+)|(d+)|(h+)|(s+)|(M+)|(S+)/mug
        let arr;
        while ((arr = reg.exec(format)) !== null) {
            const len = arr[0].length;
            let repl;
            switch (arr[0][0]) {
                case "y":
                    repl = this.getYear(len);
                    break;
                case "m":
                    repl = this.getMinutes(len);
                    break;
                case "d":
                    repl = this.getDate(len);
                    break;
                case "h":
                    repl = this.getHour(len);
                    break;
                case "s":
                    repl = this.getSeconds(len);
                    break;
                case "M":
                    repl = this.getMonth(len);
                    break;
                case "S":
                    repl = this.getMillis(len);
                    break;
            }
            format = format.substring(0, reg.lastIndex - len) + repl + format.substring(reg.lastIndex);
        }
        return format;
    }
}

module.exports.DateFormat = DateFormat;