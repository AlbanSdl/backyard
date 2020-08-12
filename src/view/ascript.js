/**
 * @package
 * @nocollapse
 * @const
 * @license AScript 0.13 dev, build 13
 * https://github.com/AlbanSdl/ascript
 *
 * This script has been coded by Alban Sdl. Copyright (c) Alban Sdl, Jan 2019
 */

class Ascript {

    /* All the static methods you can use :
     *
     * setLocale()
     * getLocaleString()
     * xmlRequest()
     * sendForm()
     * uploadFile()
     * fadeOutElement()
     * fadeInElement()
     * hideElement()
     * showElement()
     * getRawProperty()
     * getId()
     * getClass()
     * getRandomInteger()
     * addRippleListener()
     * initRipple()
     *
     * Notifications :
     * Please use `new Ascript.Notification(str).send()`
     * Please use `new Ascript.Popup(id).setTitle(...).setContent(...).send()`
     */

    /************
     * Language *
     ************/
    /**
     * Sets the language of the script
     * @param locale {Ascript.LOCALE}
     */
    static setLocale(locale) {
        Ascript.locale = locale
    };

    static getLocaleString(id) {
        try {
            return Ascript.localStrings[id][Ascript.locale]
        } catch (e) {
            Ascript.locale = Ascript.LOCALE.EN;
            return Ascript.getLocaleString(id)
        }
    };

    /*********************
     * XML HTTP REQUESTS *
     *********************/

    /**
     * Sends a XHR {@link XMLHttpRequest}
     * @param method the method of the request ('GET' or 'POST' basically)
     * @param data the data you want to send with this request. Can be empty
     * @param url the url where your request should go
     * @param onSuccess the callback function which will be called if the request is successfully delivered
     * @param onError the callback function which will be called if an error occurs
     * @param onAbort the callback function which will be called if the request is cancelled (can be undefined)
     */
    static xmlRequest(method, data, url, onSuccess, onError, onAbort = (request, event) => {}) {
        let request = new XMLHttpRequest();
        if (method === 'GET') {
            url += "?" + data;
            data = null;
        }
        request.open(method, url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.onload = (request, event) => {
            onSuccess(request, event)
        };
        request.onerror = (request, event) => {
            onError(request, event)
        };
        request.onabort = (request, event) => {
            onAbort(request, event)
        };
        request.send(data);
    };

    /**
     * Validates a form and calls a XHR {@link Ascript.xmlRequest} : no page refresh
     * @param data, the data you want to send with this request. Can be empty
     * @param submitPageUrl, the url where your request should go
     * @param callback, the callback function which will be called
     */
    static sendForm(data, submitPageUrl, callback) {
        Ascript.xmlRequest('POST', data, submitPageUrl, (request) => {
            if (request.target.status >= 200 && request.target.status < 400) {
                callback(request.target.response);
            } else {
                let error = Ascript.getLocaleString(Ascript.stringIDS.ERROR) + request.target.status;
                if (request.target.response) error += ': ' + request.target.response;
                new Ascript.Notification(Ascript.getLocaleString(Ascript.stringIDS.ERROR_DATA_NOT_SENT) + error).send();
            }
        }, (request) => {
            let error = "";
            if (request.error === "") error = Ascript.getLocaleString(Ascript.stringIDS.CONNECTION_LOST);
            else error = request.error;
            new Ascript.Notification(Ascript.getLocaleString(Ascript.stringIDS.ERROR_DATA_NOT_SENT) + error).send();
        });
    };

    /**
     * Creates a request for an upload
     * @param inputFile {HTMLInputElement} the input element where the file is uploaded
     * @param uploadPageUrl {string} the url where the file will be output
     * @param startCallback {function} the callback which is called when the uploads begins
     * @param progressCallback {function} the callback which is called each time the upload's progress changes
     * @param completedCallback {function} the callback which is called when the upload is finished
     * @param errorCallback {function} the callback which is called when the upload fails or is aborted
     */
    static uploadFile(inputFile, uploadPageUrl, startCallback, progressCallback, completedCallback, errorCallback) {
        startCallback();
        let fd = new FormData();
        fd.append("file", inputFile.files[0]);
        let xhr = new XMLHttpRequest();
        xhr.open('POST', uploadPageUrl, true);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                progressCallback((e.loaded / e.total) * 100)
            }
        };
        xhr.onload = (xml) => {
            if (xml.status >= 200 && xml.status < 400) {
                completedCallback(xml.response)
            } else {
                errorCallback(xml.response)
            }
        };
        xhr.onerror = (e) => {
            errorCallback(e.error)
        };
        xhr.send(fd);
    };


    /**
     * Fades out an element
     * The element can even be deleted at the end of the animation (@param deletion)
     * Does the same think as {@link Ascript.hideElement} but animated
     * @type {string}
     */
    static fadeOutElement(elem, deletion = false, height=false, duration = '.5') {

        if (elem.fadeTimeout != null)
            clearTimeout(elem.fadeTimeout);

        elem.style.opacity = '1';
        if (!elem.classList.contains('show')) {
            elem.classList.add('show');
        }
        elem.style.transition = `all ${duration}s ease-in-out`;
        elem.style.opacity = '0';

        if (height) {
            elem.style.zIndex = (elem.style.zIndex !== "" ? (parseInt(elem.style.zIndex) - 1) : '0');
            elem.style.maxHeight = elem.style.minHeight = window.getComputedStyle(elem).getPropertyValue('height');
            // IMPORTANT FIX : don't count margin-top as it will be removed at the end.
            elem.style.marginTop = -(parseInt(window.getComputedStyle(elem).getPropertyValue('margin-bottom').slice(0, -2))
                + parseInt(window.getComputedStyle(elem).getPropertyValue('padding-top').slice(0, -2))
                + parseInt(window.getComputedStyle(elem).getPropertyValue('padding-bottom').slice(0, -2))
                + parseInt(window.getComputedStyle(elem).getPropertyValue('height').slice(0, -2))) + "px";
        }

        elem.fadeTimeout = setTimeout(() => {
            if (deletion) {
                if (elem.parentElement != null)
                    elem.parentElement.removeChild(elem);
            } else if (elem.style.opacity === '0') {
                elem.style.visibility = 'hidden';
                elem.style.display = 'none';
            }
        }, 800);
    };

    /**
     * Fades in an element
     * Does the same think as {@link Ascript.showElement} but animated
     * @type {string}
     */
    static fadeInElement(elem, max = '1', duration = '.5', display = '', height = false) {

        if (elem.fadeTimeout != null)
            clearTimeout(elem.fadeTimeout);

        elem.style.transition =  `all ${duration}s ease-in-out`;
        elem.style.display = display;
        elem.style.visibility = 'visible';
        elem.style.opacity = '0';
        elem.fadeTimeout = setTimeout(() => {
            if (!elem.classList.contains('show')) {
                elem.classList.add('show');
            }
            if (height) {
                elem.style.zIndex = (elem.style.zIndex !== "" ? (parseInt(elem.style.zIndex) + 1) : '1');
                elem.style.marginTop = '0px';
            }
            elem.style.opacity = max;
        }, 10)
    };

    /**
     * Fades out the element and fades in another element at the same location
     * IMPORTANT : the initial height has to be calculated by the browser.
     * So it needs the hidden element to be displayed once before any animation
     * @param elementIn {HTMLElement} the element which will be faded in
     * @param elementOut {HTMLElement} the element which will be replaced by elementIn
     * @param duration {Number} the duration of the animation
     * @param finalOpacity {Number} the final opacity of the elementIn
     */
    static crossFade(elementIn, elementOut, duration, finalOpacity = 1) {
        if (elementIn.style.height === '0px' || elementOut.style.height === '0px')
            return;
        const heightIn = window.getComputedStyle(elementIn).getPropertyValue('height').slice(0, -2),
            marginInTop = window.getComputedStyle(elementIn).marginTop, marginInBottom = window.getComputedStyle(elementIn).marginBottom,
            paddingInTop = window.getComputedStyle(elementIn).paddingTop, paddingInBottom = window.getComputedStyle(elementIn).paddingBottom,
            heightOut = window.getComputedStyle(elementOut).getPropertyValue('height').slice(0, -2),
            marginOutTop = window.getComputedStyle(elementOut).marginTop, marginOutBottom = window.getComputedStyle(elementOut).marginBottom,
            paddingOutTop = window.getComputedStyle(elementOut).paddingTop, paddingOutBottom = window.getComputedStyle(elementOut).paddingBottom;
        Object.assign(elementIn.style, {opacity: '0', display: 'block', height: '0px', transition: `all ${duration}s ease 0s`,
            marginTop: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px', visibility: 'visible'});
        Object.assign(elementOut.style, {transition: `all ${duration}s ease 0s`});
        setTimeout(() => {
            Object.assign(elementIn.style, {opacity: finalOpacity, height: `${heightIn}px`, marginTop: marginInTop,
                marginBottom: marginInBottom, paddingTop: paddingInTop, paddingBottom: paddingInBottom});
            Object.assign(elementOut.style, {opacity: '0', height: '0px', marginTop: '0px', marginBottom: '0px',
                paddingTop: '0px', paddingBottom: '0px'});
            setTimeout(() => {
                Object.assign(elementOut.style, {display: 'none', height: `${heightOut}px`, marginTop: marginOutTop,
                    marginBottom: marginOutBottom, paddingTop: paddingOutTop, paddingBottom: paddingOutBottom})
            }, duration * 1000)
        }, 10)
    };

    /**
     * Hides an element
     * @type {string}
     * @param elem {HTMLElement}
     */
    static hideElement(elem) {
        elem.style.visibility = 'hidden';
        elem.style.display = 'none';
    };

    /**
     * Shows an element
     * @type {string}
     * @param elem {HTMLElement}
     */
    static showElement(elem) {
        elem.style.display = '';
        elem.style.visibility = 'visible';
        if (elem.style.opacity === '0') {
            elem.style.opacity = '1';
        }
    };


    /**
     * Returns the CSS property without the measure (px or % (you can ask devs for more types))
     * @type {string | void | *}
     * @return {number}
     */
    static getRawProperty(property) {
        const replaced = property.replace('px', '').replace('%', '');
        return replaced === '' ? 0 : parseInt(replaced);
    };

    /**
     * Returns the object with the given id or the list of elements (if array of ids is given)
     * @param id {string|string[]}
     * @return {*}
     */
    static getId(id) {
        if (Array.isArray(id)) {
            let arr = [];
            for (let ids of id) {
                arr.push(Ascript.getId(ids))
            }
            return arr;
        }
        return document.getElementById(id);
    };

    /**
     * Returns the objects with the given class
     * @param className
     * @return {HTMLCollectionOf<Element>}
     */
    static getClass(className) {
        return document.getElementsByClassName(className);
    };

    /**
     * Returns a random int between 0 and the value given
     * @return {number}
     */
    static getRandomInteger(max) {
        return Math.floor(Math.random() * max);
    };

    /**
     * STYLING : Adds ripple animation style to item (eg buttons)
     * Adds a ripple animation on click to the current element
     * @param elem
     */
    static addRippleListener(elem) {
        elem.style.overflow = 'hidden';
        elem.addEventListener('mousedown', (e) => {
            e.preventDefault();
            let div = document.createElement('div');
            const btnOffset = elem.getBoundingClientRect();
            div.classList.add('rpl-effect');
            Object.assign(div.style, {position: 'absolute', borderRadius: '50%', width: '50px', height: '50px',
                background: '#2287fa', animation: 'rpl-animation 2s', pointerEvents: 'none'});
            let xPos = e.pageX - (btnOffset.left + (document.documentElement.scrollLeft !== null ? document.documentElement.scrollLeft : document.body.scrollLeft)),
                yPos = e.pageY - (btnOffset.top + (document.documentElement.scrollTop !== null ? document.documentElement.scrollTop : document.body.scrollTop));
            div.style.top = (yPos - 25) + 'px';
            div.style.left = (xPos - 25) + 'px';
            div.style.display = 'block';
            div.style.zIndex = (elem.style.zIndex !== '' ? parseInt(elem.style.zIndex) + 1 : 1);
            div.style.background = elem.getAttribute('data-rpl');
            elem.appendChild(div);
            setTimeout(() => {
                try {
                    div.parentElement.removeChild(div);
                } catch (e) {
                }
            }, 2000);
        });
    };

    /**
     * Adds a ripple to all element of a given class
     * @param className
     */
    static initRipple(className = 'rpl') {
        [].forEach.call(document.getElementsByClassName(className), (elem) => {Ascript.addRippleListener(elem)});
    };

    /**
     * Creates a svg chart with given dataset. The chart takes the width of the elementParent
     * @param elementParent {HTMLElement} the element in which the chart will be output
     * @param dataset {Object} the data which will be displayed in the chart
     * @param id {String} the id of the chart element
     * @param lineColor {String} the color of the line
     * @param heightRatio {Number} the height will be the width multiplied by this coefficient
     * @param gridColor {String} the color of the axes
     */
    static createChart(elementParent, dataset, id, lineColor, heightRatio, gridColor = "#ffffff") {
        const dataKeys = Object.keys(dataset);
        if (dataKeys.length === 0)
            return;
        let highestPoint = 0;
        for (let i in dataKeys) {
            if (dataset[i] > highestPoint)
                highestPoint = dataset[i];
        }
        const width = parseInt(window.getComputedStyle(elementParent).width.slice(0, -2));
        const height = heightRatio * width;
        const scaleX = (width - 30) / dataKeys[dataKeys.length - 1];
        const scaleY = (height - 30) / highestPoint;
        const chart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        chart.id = id;
        chart.innerHTML = `
            <line x1="15" y1="${height - 15}" x2="${width - 15}" y2="${height - 15}" style="stroke:${gridColor};stroke-width:1"/>
            <line x1="15" y1="15" x2="15" y2="${height - 15}" style="stroke:${gridColor};stroke-width:1"/>
            ${Ascript.getLocaleString(Ascript.stringIDS.UNABLE_TO_DISPLAY_CHART)}
        `;
        let latestPoint;
        Object.keys(dataset).forEach(function(x) {
            chart.innerHTML += `<circle cx="${15 + scaleX * parseInt(x)}" cy="${height - 15 - parseInt(dataset[x]) * scaleY}" r="3" stroke="${lineColor}" stroke-width="1" fill="${gridColor}"/>`;
            if (latestPoint != null)
                chart.innerHTML += `<line x1="${15 + scaleX * latestPoint[0]}" y1="${height - 15 - scaleY * latestPoint[1]}" x2="${15 + scaleX * parseInt(x)}" y2="${height - 15 - scaleY * parseInt(dataset[x])}" stroke-width="1" stroke="${lineColor}"/>`;
            latestPoint = [parseInt(x), parseInt(dataset[x])];
        });
        let scaleSysX = 0, scaleSysY = 0;
        while (scaleSysX <= width - 30) {
            chart.innerHTML += `<text x="${10 + scaleSysX}" y="${height}" font-family="sans-serif" font-size="10px" fill="${gridColor}">${scaleSysX / scaleX > 10 ? Math.round(scaleSysX / scaleX) : Math.round(scaleSysX / scaleX * 100) / 100}</text>`;
            scaleSysX += scaleX * dataKeys[dataKeys.length - 1] / 10
        }
        while (scaleSysY <= height - 30) {
            chart.innerHTML += `<text x="0" y="${height - 10 - scaleSysY}" font-family="sans-serif" font-size="10px" fill="${gridColor}">${scaleSysY / scaleY > 10 ? Math.round(scaleSysY / scaleY) : Math.round(scaleSysY / scaleY * 100) / 100}</text>`;
            scaleSysY += scaleY * highestPoint / 10
        }
        chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
        chart.setAttribute('preserveAspectRatio', 'xMinyMin meet');
        elementParent.appendChild(chart);
    }
}
Ascript.LOCALE = {
    FR: 0,
    EN: 1
};
Ascript.locale = Ascript.LOCALE.EN;
Ascript.localStrings = {
    1: ["Erreur ", "Error "],
    2: ["Une erreur s'est produite... Les données n'ont pas pu être envoyées: ", "An error occurred... Data has not been sent: "],
    3: ["Connexion interrompue", "Connection lost"],
    4: ["Il n'y a pas d'élément .notif ! Ajoute en avec Ascript.Notification.send()", "No such element .notif ! Summon some notification with Ascript.Notification.send() before…"],
    5: ["Élément copié !", "Copied item !"],
    6: ["Impossible d'afficher le graphique à cause de votre navigateur...", "Unable to display chart because of your browser..."],
    7: ["La notification a déjà été envoyée !", "Notification already sent !"],
    8: ["Impossible de changer la durée de la notification", "Unable to change notification's duration"],
    9: ["Impossible de changer le callback de la notification", "Unable to change notification's callback"],
    10: ["La popup est déjà affichée !", "Popup already displayed !"],
    11: ["Impossible de changer le callback de la popup", "Unable to change popup's callback"]
};
Ascript.stringIDS = {
    ERROR: 1,
    ERROR_DATA_NOT_SENT : 2,
    CONNECTION_LOST: 3,
    NO_SUCH_NOTIFICATION_ERROR: 4,
    CLIPBOARD_COPIED: 5,
    UNABLE_TO_DISPLAY_CHART: 6,
    NOTIFICATION_ALREADY_SENT: 7,
    NOTIFICATION_ERROR_DURATION: 8,
    NOTIFICATION_ERROR_DISMISS: 9,
    POPUP_ALREADY_SENT: 10,
    POPUP_ERROR_DISMISS: 11
};
Ascript.notifQueue = {};
Ascript.notifQueueTimed = [];
Ascript.imageLazyLoading = [];

Ascript.Notification = class {

    /**
     * Initializes a notification
     * @param content {String} the text or HTML displayed in the notification
     */
    constructor(content) {
        this.content = content;
        this.duration = 2000;
        this.background = '#222';
        this.textColor = '#fff';
        this.id = null;
        this.classes = [];
        this.onDismiss = null;
        this.elemNotif = null;
        this.notifTimer = null;
    }

    /**
     * Sets the duration of the notification (before being dismissed)
     * @param duration {Number}
     * @returns {Ascript.Notification}
     */
    setDuration(duration) {
        if (this.elemNotif !== null)
            console.error(Ascript.getLocaleString(Ascript.stringIDS.NOTIFICATION_ALREADY_SENT) +
                " " + Ascript.getLocaleString(Ascript.stringIDS.NOTIFICATION_ERROR_DURATION));
        this.duration = duration;
        return this;
    }

    /**
     * Way to add classes
     * @param classes {Array}
     */
    addClasses(classes) {
        if (classes.length === 0)
            return this;
        this.classes = [].push.apply(this.classes, classes);
        if (this.elemNotif !== null) {
            this.elemNotif.classList.add(this.classes.join(' '));
        }
        return this;
    }

    /**
     * Sets the background color of the notification
     * @param color {String}
     * @returns {Ascript.Notification}
     */
    setBackground(color) {
        this.background = color;
        if (this.elemNotif !== null)
            this.elemNotif.style.backgroundColor = this.background;
        return this;
    }

    /**
     * Sets the font's color in the notification
     * @param color {String}
     * @returns {Ascript.Notification}
     */
    setTextColor(color) {
        this.textColor = color;
        if (this.elemNotif !== null)
            this.elemNotif.style.color = this.textColor;
        return this;
    }

    /**
     * Sets the content of the notification (can be raw text of html)
     * @param content {String}
     * @returns {Ascript.Notification}
     */
    setContent(content) {
        this.content = content;
        if (this.elemNotif !== null)
            this.elemNotif.getElementsByClassName('notif-content')[0].innerHTML = content;
        return this;
    }

    /**
     * Sets the callback called when the notification is dismissed
     * @param callback
     * @returns {Ascript.Notification}
     */
    setOnDismiss(callback) {
        if (this.elemNotif !== null)
            console.error(Ascript.getLocaleString(Ascript.stringIDS.NOTIFICATION_ALREADY_SENT) +
                " " + Ascript.getLocaleString(Ascript.stringIDS.NOTIFICATION_ERROR_DISMISS));
        this.onDismiss = callback;
        return this;
    }

    /**
     * Sends the current notification
     */
    send() {
        // Sets the id of the notification
        this.id = Ascript.getRandomInteger(1000);
        while (Object.keys(Ascript.notifQueue).includes(this.id)) {
            this.id = Ascript.getRandomInteger(1000);
        }
        // Adds notif-holder if not already set
        if (!document.getElementById('notif-holder')) {
            let elem = document.createElement('div');
            elem.id = 'notif-holder';
            Object.assign(elem.style,{maxWidth:'300px', width:'80%', position:'fixed', display:'block', right:'5%',
                zIndex:'1000', top:'50px', height:'100%', pointerEvents:'none'});
            document.getElementsByTagName('body')[0].appendChild(elem);
        }
        // Creation of the notification
        this.elemNotif = document.createElement('div');
        if (this.classes.length !== 0) {
            this.elemNotif.classList.add('notif', this.classes.join(' '));
        } else {
            this.elemNotif.classList.add('notif');
        }
        this.elemNotif.id = this.id;
        this.elemNotif.innerHTML = "<div class=\"notif-close rpl smooth no-shadow\" style=\"position:relative;flex-shrink:0;border-radius:50%;width:50px;height:50px;display:block;cursor:pointer;z-index:100\" data-rpl=\"#eee\"><div style='position:relative'>" +
            "<div style='top:15.5px;left:16px;display:block;position:absolute;height:2px;width:50%;background:#fff;border-radius:10px;transform-origin:center left;transform:rotate(45deg)'></div>" +
            "<div style='top:33px;left:16px;display:block;position:absolute;height:2px;width:50%;background:#fff;border-radius:10px;transform-origin:center left;transform:rotate(-45deg)'></div></div></div><div class='notif-content' style='hyphens:auto;width:100%'>" + this.content + "</div>";
        Object.assign(this.elemNotif.style,{position:'relative', display:'flex', textAlign:'center', color:this.textColor, fontSize:'20px',
            top:'5px', width:'auto', maxWidth:'300px', backgroundColor:this.background, padding:'10px', paddingRight: '5px', borderRadius:'2px', zIndex:'10000',
            marginTop:'10px', minHeight:'50px', pointerEvents:'all', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row-reverse'});
        if (Ascript.notifQueueTimed.length > 7)
            Ascript.notifQueue[Ascript.notifQueueTimed[0]].hide();
        Ascript.notifQueueTimed.push(this.id);
        Ascript.notifQueue[this.id] = this;
        document.getElementById('notif-holder').appendChild(this.elemNotif);
        Ascript.fadeInElement(this.elemNotif, '1', '.2', 'flex');
        Ascript.addRippleListener(this.elemNotif.getElementsByClassName('notif-close')[0]);
        this.notifTimer = setTimeout(() => {this.hide()}, this.duration * 1000);
        this.elemNotif.getElementsByClassName('notif-close')[0].addEventListener('click', () => {
            this.hide();
            clearTimeout(this.notifTimer);
        });
    }

    /**
     * Hides the current notification (and deletes it)
     */
    hide() {
        if (this.id !== null && Ascript.getId(this.id) === this.elemNotif) {
            Ascript.notifQueueTimed.splice(Ascript.notifQueueTimed.indexOf(this.id), 1);
            delete Ascript.notifQueue[this.id];
            Ascript.fadeOutElement(Ascript.getId(this.id), true, true);
            if (this.onDismiss !== null)
                this.onDismiss();
        }
    }

};

Ascript.PopUp = class {

    /**
     * Initializes a popup
     * @param id {String} id of the popup element
     */
    constructor(id) {
        this.id = id;
        this.content = "";
        this.title = "";
        this.colorPrimary = '#222';
        this.colorSecondary = '#fff';
        this.classes = [];
        this.onDismiss = null;
        this.elem = null;
        this.dimensions = ['auto', 'auto'];
        this.buttons = {};
        this.fadeId = 'fade';
    }

    /**
     * Sets the title of the popup
     * @param title {String}
     * @returns {Ascript.PopUp}
     */
    setTitle(title) {
        if (this.elem !== null)
            console.error(Ascript.getLocaleString(Ascript.stringIDS.POPUP_ALREADY_SENT));
        this.title = title;
        return this;
    }
    
    addButton(name, classname, id, callback) {
        this.buttons[name] = [id, classname, callback];
        if (this.elem !== null && Ascript.getId(this.id) !== null) {
            const button = document.createElement('div');
            button.classList.add(classname);
            button.id = id;
            button.addEventListener('click', callback);
            Ascript.getId(this.id).firstChild.firstChild.appendChild(button);
            Ascript.addRippleListener(button);
        }
    }

    /**
     * Sets the dimensions of the popup
     * @param dimensions {Array}
     * @returns {Ascript.PopUp}
     */
    setDimensions(dimensions) {
        if (!Array.isArray(dimensions) || dimensions.length < 2)
            throw "Can't resize the popup, please provide an array as argument";
        this.dimensions = dimensions.slice(0, 2);
        return this;
    }

    /**
     * Way to add classes
     * @param classes {Array}
     */
    addClasses(classes) {
        if (classes.length === 0)
            return this;
        this.classes = [].push.apply(this.classes, classes);
        if (this.elem !== null) {
            this.elem.classList.add(this.classes.join(' '));
        }
        return this;
    }

    /**
     * Sets the colors of the popup
     * set primary property of colors in order to define a color for actionBar and text
     * set secondary property of colors in order to define a color for the background of the popup
     * @param colors {Object}
     * @returns {Ascript.PopUp}
     */
    setColors(colors) {
        for (let i in colors) {
            if (i === "primary")
                this.colorPrimary = colors[i];
            else if (i === "secondary")
                this.colorSecondary = colors[i];
        }
        if (this.elem !== null) {
            this.elem.style.backgroundColor = this.colorSecondary;
            this.elem.style.color = this.colorPrimary;
            this.elem.children[0].style.backgroundColor = this.colorPrimary;
            this.elem.children[0].style.color = this.colorSecondary;
        }
        return this;
    }

    /**
     * Sets the content of the popup (can be raw text of html)
     * @param content {String}
     * @returns {Ascript.PopUp}
     */
    setContent(content) {
        this.content = content;
        if (this.elem !== null)
            this.elem.children[1].innerHTML = content;
        return this;
    }

    /**
     * Sets the callback called when the popup is dismissed
     * @param callback
     * @returns {Ascript.PopUp}
     */
    setOnDismiss(callback) {
        if (this.elem !== null)
            console.error(Ascript.getLocaleString(Ascript.stringIDS.POPUP_ALREADY_SENT) +
                " " + Ascript.getLocaleString(Ascript.stringIDS.POPUP_ERROR_DISMISS));
        this.onDismiss = callback;
        return this;
    }

    /**
     * Displays the current popup
     */
    send() {
        let popup = document.createElement('div');
        popup.classList.add('popupBlock');
        popup.id = this.id;
        Object.assign(popup.style, {
            display: 'none',
            backgroundColor: this.colorSecondary,
            top: '50%',
            cssFloat: 'left',
            left: '50%',
            overflowX: 'hidden',
            overflowY: 'auto',
            transform: 'translateX(-50%) translateY(-50%)',
            position: 'fixed',
            zIndex: '99999',
            boxShadow: '0 0 20px #000',
            borderRadius: '2px',
            width: this.dimensions[0],
            height: this.dimensions[1],
            maxHeight: '100%',
            maxWidth: '100%'
        });
        popup.innerHTML = `<div class='actionBar' style="width:100%;height:auto;padding:5px;background:#444;color:#fff;margin:0 0 10px;border-top-left-radius:2px;border-top-right-radius:2px;display:flex;flex-direction:row-reverse;align-items:center;align-content:space-around;justify-content:space-between"><div id="popupButtonMenu" style="display:flex;flex-direction:row-reverse;padding-right:10px"></div><div class='title' style="font-size:30px;text-decoration:none;color:#fff;margin:10px">${this.title}</div></div><div class='popupContent' style="padding:40px;transform:translateX(-1%);color:#222">${this.content}</div>`;
        document.getElementsByTagName('body')[0].appendChild(popup);
        Ascript.fadeInElement(popup);
        const closeButton = document.createElement('div');
        closeButton.classList.add('popupClose');
        closeButton.setAttribute('data-rpl', '#eee');
        Object.assign(closeButton.style, {
            background: 'transparent',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'block',
            cursor: 'pointer',
            zIndex: '100',
            position: 'relative'
        });
        closeButton.innerHTML = '<div style="display:block;position:absolute;height:2px;width:50%;background:#fff;border-radius:10px;top:30%;left:32%;transform-origin:center left;transform:rotate(45deg)"></div>' +
            '<div style="display:block;position:absolute;height:2px;width:50%;background:#fff;border-radius:10px;top:65%;left:31%;transform-origin:center left;transform:rotate(-45deg)"></div>';
        popup.firstChild.firstChild.appendChild(closeButton);
        const fade = document.createElement('div');
        while (Ascript.getId(this.fadeId) != null) {
            this.fadeId += Math.round(Math.random());
        }
        fade.id = this.fadeId;
        Object.assign(fade.style, {
            display: 'none',
            overflow: 'hidden',
            backgroundColor: '#000',
            position: 'fixed',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
            opacity: '0.8',
            zIndex: '9999'
        });
        fade.addEventListener('click', () => {
            this.hide();
        });
        document.body.appendChild(fade);
        Ascript.fadeInElement(fade, '0.8');
        closeButton.addEventListener('click', () => {
            this.hide();
        });
        Ascript.initRipple('popupClose');
        setTimeout(() => {
            for (let name in this.buttons) {
                const button = document.createElement('div');
                button.classList.add(...this.buttons[name][1]);
                button.id = this.buttons[name][0];
                button.style.width = '50px';
                button.style.margin = '0 5px 0 0';
                button.setAttribute('data-rpl', this.colorSecondary);
                button.addEventListener('click', this.buttons[name][2]);
                popup.firstChild.firstChild.appendChild(button);
                Ascript.fadeInElement(button);
                Ascript.addRippleListener(button);
            }
        }, 500);
    }

    /**
     * Hides the current popup (and deletes it)
     */
    hide() {
        if (this.id !== null && Ascript.getId(this.id) != null) {
            Ascript.fadeOutElement(Ascript.getId(this.fadeId), true);
            Ascript.fadeOutElement(Ascript.getId(this.id), true);
            this.id = null;
            if (this.onDismiss !== null)
                this.onDismiss();
        }
    }

};

/**
 * Creates showcases in the window. Showcases can't be displayed at the same time.
 * @type {Ascript.ShowCase}
 */
Ascript.ShowCase = class {

    constructor(element) {
        this.element = element;
        this.background = '#222';
        this.textColor = '#fff';
        this.onDismiss = null;
        this.substitutionElement = this.element.cloneNode(true);
        this.content = "";
        this.title = "";
    }

    setBackgroundColor(color) {
        this.background = color;
        return this;
    }

    setTextColor(color) {
        this.textColor = color;
        return this;
    }

    setOnDismiss(callback_function) {
        this.onDismiss = callback_function;
        return this;
    }

    setDescriptionTitle(title) {
        this.title = title;
        return this;
    }

    setDescriptionContent(content) {
        this.content = content;
        return this;
    }

    display() {
        if (Ascript.getId('showcase') != null)
            return console.error("Only one showcase can be displayed at once !");
        const showcaseElement = document.createElement("div");
        showcaseElement.classList.add("showcase", "smooth");
        showcaseElement.id = "showcase";
        Object.assign(showcaseElement.style, {
            backgroundColor: this.background,
            color: this.textColor,
            width: "0",
            height: "0",
            zIndex: "10000",
            borderRadius: "100%",
            display: "block",
            position: "absolute",
            transform: "scale(0)"
        });
        setTimeout(() => {
            showcaseElement.style.transform = "scale(1)";
            showcaseElement.style.borderRadius = "0"
        }, 100);
        document.body.style.overflow = "hidden";
        document.getElementsByTagName('body')[0].appendChild(showcaseElement);
        Object.assign(showcaseElement.style, {
            width: "100%",
            height: "100%"
        });
        this.substitutionElement.style.zIndex = "10001";
        this.substitutionElement.style.transform = "scale(0)";
        this.substitutionElement.style.position = "relative";
        this.substitutionElement.style.left = this.element.getBoundingClientRect().left + window.pageXOffset + 'px';
        this.substitutionElement.style.top = this.element.getBoundingClientRect().top + window.pageYOffset + 'px';
        showcaseElement.appendChild(this.substitutionElement);

        // Determines if showcased element is left or right and places the text
        if (this.content !== "" || this.title !== "") {
            const leftPositioned = this.element.getBoundingClientRect().left >= window.innerWidth / 2;
            const textElements = document.createElement('div');
            textElements.innerHTML = `<div style='font-size:25px'>${this.title}</div><div style='font-size:17px'>${this.content}</div><div style='font-size:10px;font-style:italic;margin-top:12px'>Clique n'importe où pour fermer cette fenêtre</div>`;
            Object.assign(textElements.style, {
                color: this.textColor,
                position: "absolute",
                left: `${leftPositioned ? 25 : 75}%`,
                top: '50%',
                transform: `translateX(-50%) translateY(-50%)`,
                width: '40%'
            });
            textElements.addEventListener('click', (event) => {
                event.stopPropagation()
            });
            showcaseElement.appendChild(textElements);
        }
        Ascript.fadeOutElement(this.element);

        setTimeout(() => {
            Ascript.fadeInElement(this.substitutionElement);
            this.substitutionElement.style.transform = "scale(1)";
            this.substitutionElement.addEventListener('click', (event) => {
                event.stopPropagation();
                this.dismiss();
                this.element.click();
            });
            showcaseElement.addEventListener('click', () => {
                this.dismiss();
            });
        }, 500);
    }

    dismiss() {
        if (Ascript.getId("showcase") != null && Ascript.getId("showcase").style.opacity !== "0") {
            Ascript.fadeOutElement(Ascript.getId("showcase"), true);
            Ascript.fadeInElement(this.element);
            document.body.style.overflow = "auto";
            if (this.onDismiss !== null)
                this.onDismiss();
        }
    }

};

window.onload = () => {

    /* For some curious reasons, the page is not ready onload. That's why
     * a setTimeout is required for all addEventListener
     */
    setTimeout(() => {

        /**
         * Makes scroll on click on elements which have "scroll" class.
         * Provide a "data-scroll" argument with the class of the element you want to scroll to.
         * Remember, that the name of the element can be unique or not. If it's not unique, it will
         * scroll to the first detected element.
         * If you don't provide 'data-scroll' argument, it will scroll up to top
         *
         * Here is an example:
         * <div class="scroll" data-scroll="other-element">Example button</div>
         * <div class="other-element">It will scroll to this element</div>
         */
        Array.from(document.getElementsByClassName('scroll')).forEach((element) => {
            element.addEventListener('click', () => {
                window.scrollTo({
                    'behavior': 'smooth',
                    'left': 0,
                    'top': element.hasAttribute('data-scroll') ? document.getElementsByClassName(element.getAttribute('data-scroll')).item(0).getBoundingClientRect().top + (document.documentElement.scrollTop !== null ? document.documentElement.scrollTop : document.body.scrollTop) : 0
                })
            });
        });

        /**
         * Give to an element the class name parallax and set a background image.
         * Then, see magic appear…
         * On scroll, the image will move, synchronously
         *
         * You can provide the movement coefficient in the parallax-coefficient attribute
         */
        setInterval(() => {
            [].forEach.call(Ascript.getClass('parallax'),(element) => {
                let scrollToTop = (document.documentElement.scrollTop !== null ? document.documentElement.scrollTop : document.body.scrollTop) - element.offsetTop;
                element.style.backgroundPosition = 'center ' + (scrollToTop * (element.hasAttribute('data-parallax-coefficient') ? element.getAttribute('data-parallax-coefficient') : -0.2)) + 'px';
                let scrollToTopLeft = (2 - (scrollToTop * (element.hasAttribute('data-opacity-coefficient') ? element.getAttribute('data-opacity-coefficient') : 1) / (window.innerHeight / 2.6))) / 2;
                if (Math.sign(scrollToTopLeft) < 0)
                    scrollToTopLeft = 0;
                element.style.opacity = scrollToTopLeft + '';
            })
        }, 10);

        /**
         * Give to an element the class name clipboard and give it an attribute "content".
         * The element will then be able to copy the content to the clipboard on click
         */
        [].forEach.call(document.getElementsByClassName('clipboard'), (copyElement) => {
            copyElement.addEventListener('click', () => {
                let input = document.createElement("input");
                input.id = 'copy';
                input.style.opacity = "0";
                input.value = copyElement.getAttribute('content');
                document.getElementsByTagName('body')[0].appendChild(input);
                input.select();
                document.execCommand('copy');
                input.parentElement.removeChild(input);
                new Ascript.Notification(`<svg fill="#fff" height="24" width="24" style="transform:translateY(5px);margin-right:5px"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>${Ascript.getLocaleString(Ascript.stringIDS.CLIPBOARD_COPIED)}`).setDuration(10).send();
            })
        })
    }, 500);

    /**
     * Lazy Image Loading.
     * Just add the `lazyLoading` class to an element and
     * the data-lazy-loading attribute with the url of the image.
     */
    [].forEach.call(Ascript.getClass('lazyLoading'), (elements) => {
        let id = Ascript.getRandomInteger(1000);
        while (id in Ascript.imageLazyLoading && Ascript.imageLazyLoading.length < 1000) {
            id = Ascript.getRandomInteger(1000)
        }
        elements.id = `lazyLoading-${id}`;
        Ascript.imageLazyLoading.push(id);
    });

    setInterval(() => {
        const scroll = document.documentElement.scrollTop !== null ? document.documentElement.scrollTop : document.body.scrollTop;
        [].forEach.call(Ascript.imageLazyLoading, (id) => {
            const element = Ascript.getId(`lazyLoading-${id}`);
            if (element == null || !element.hasAttribute('data-lazy-loading'))
                return Ascript.imageLazyLoading.splice(Ascript.imageLazyLoading.indexOf(id), 1);
            if (scroll - element.getBoundingClientRect().top >= 0) {
                if (element.tag === 'img')
                    element.setAttribute('src', element.getAttribute('data-lazy-loading'));
                else
                    element.style.backgroundImage = `url('${element.getAttribute('data-lazy-loading')}')`;
                Ascript.imageLazyLoading.splice(Ascript.imageLazyLoading.indexOf(id), 1);
            }
        })
    }, 200);

    document.getElementsByTagName("body")[0].innerHTML+="<style>@keyframes rpl-animation{from{transform:scale(1);opacity:0.4}to{transform:scale(100);opacity:0}}</style>";
    Ascript.initRipple();

};