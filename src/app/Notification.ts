import { Notification } from "electron";

export class AppNotification extends Notification {

    constructor(title: string, body: string, isSilent: boolean, icon: string, onClick: (event: Electron.Event) => void) {
        super({
            title: title,
            body: body,
            silent: isSilent,
            icon: icon
        });
        if (onClick != null)
            this.on("click", onClick);
        this.show();
    }
}