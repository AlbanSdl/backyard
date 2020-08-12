const { Notification } = require("electron");

class AppNotification extends Notification {

    constructor(title, body, isSilent, icon, onClick) {
        super({
            title: title,
            body: body,
            isSilent: isSilent,
            icon: icon
        });
        if (onClick != null)
            this.on("click", onClick);
        this.show();
    }
}

module.exports.AppNotification = AppNotification;