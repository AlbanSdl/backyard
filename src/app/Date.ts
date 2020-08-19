export class DateFormat {

    private date: Date;

    constructor(date: Date) {
        this.date = date;
    }

    private toSuchDigits(dateElem: number, nb: number): string {
        const d = new String(dateElem);
        if (nb > d.length)
            return `${'0'.repeat(nb-d.length)}${d}`;
        if (nb < d.length)
            return d.substring(d.length - nb);
        return <string> d;
    }

    private getYear(digits: number): string {
        return this.toSuchDigits(this.date.getFullYear(), digits);
    }

    private getMonth(digits: number): string {
        return this.toSuchDigits(this.date.getMonth() + 1, digits);
    }

    private getDate(digits: number): string {
        return this.toSuchDigits(this.date.getDate(), digits);
    }

    private getHour(digits: number): string {
        return this.toSuchDigits(this.date.getHours(), digits);
    }

    private getMinutes(digits: number): string {
        return this.toSuchDigits(this.date.getMinutes(), digits);
    }

    private getSeconds(digits: number): string {
        return this.toSuchDigits(this.date.getSeconds(), digits);
    }

    private getMillis(digits: number): string {
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
    public format(format: string) {
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