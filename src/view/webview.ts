import { ipcRenderer } from "electron";
import { Ascript } from "./ascript";
import { Reference } from "./git/Reference";
import { Icon } from "./app/Icons";
import { View } from "./app/View";

/**
 * This interface contains app-context-related methods. These methods have the
 * same behaviour as the ones in @see View
 */
export interface AppContext {
    getLocale(id: string): string;
    createElement(id: string, ...classes: Array<string>): HTMLDivElement;
}

const view = new View();

window.onload = () => {
    document.getElementById("loaderText").innerText = view.getLocale("editor.app.loading");
    ipcRenderer.send("init");
    ipcRenderer.on("lifecycle", (_event, status, ...args) => {
        if (status === "mainMenu")
            view.loadMainMenu();
        if (status === "openRepo")
            view.loadRepository(args[0], args[1], args[2]);
        if (status === "registerNetworkPart")
            view.registerNetworkPart(args[0], args[1]);
        if (status === "executed")
            new Ascript.Notification(args[0]).setBackground("#2ad500").setDuration(2).send();
        if (status === "maximized")
            document.getElementById("windowIconMaximize").classList.add("maximized");
        if (status === "unmaximized")
            document.getElementById("windowIconMaximize").classList.remove("maximized");
        if (status === "updateGraph")
            view.commitCache.addAll(...args);
        if (status === "checkout") {
            Reference.getCheckedout().updateCheckoutStatus();
            view.checkout = args[0];
            Reference.getCheckedout().updateCheckoutStatus(false);
            new Ascript.Notification(args[1]).setBackground("#2ad500").setDuration(2).send();
        }
    });
    ipcRenderer.on("error", (_event, error) => {
        new Ascript.Notification(`${Icon.getIcon(Icon.Type.ERROR, 'ic')} ${error}`).setBackground("#f00").send();
    });
    document.getElementById("windowIconClose").addEventListener('click', () => {
        ipcRenderer.send("exitApp");
    });
    document.getElementById("windowIconMinimize").addEventListener('click', () => {
        ipcRenderer.send("minimizeApp");
    });
    document.getElementById("windowIconMaximize").addEventListener('click', () => {
        ipcRenderer.send("maximizeApp");
    })
}