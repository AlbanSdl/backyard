import { Ascript } from "../ascript";

export namespace Icon {

    export enum Type {
        FOLDER = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M10,4h-6c-1.1,0,-1.99,0.9,-1.99,2l-0.01,12c0,1.1,0.9,2,2,2h16c1.1,0,2,-0.9,2,-2v-10c0,-1.1,-0.9,-2,-2,-2h-8l-2,-2z"/></svg>`,
        EDIT = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M3,17.25v3.75h3.75l11.06,-11.06l-3.75,-3.75l-11.06,11.06zm17.71,-10.21c0.39,-0.39,0.39,-1.02,0,-1.41l-2.34,-2.34c-0.39,-0.39,-1.02,-0.39,-1.41,0l-1.83,1.83l3.75,3.75l1.83,-1.83z"/></svg>`,
        SETTINGS = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="#fff" d="M15.95,10.78c0.03,-0.25,0.05,-0.51,0.05,-0.78s-0.02,-0.53,-0.06,-0.78l1.69,-1.32c0.15,-0.12,0.19,-0.34,0.1,-0.51l-1.6,-2.77c-0.1,-0.18,-0.31,-0.24,-0.49,-0.18l-1.99,0.8c-0.42,-0.32,-0.86,-0.58,-1.35,-0.78l-0.3,-2.12c-0.03,-0.2,-0.2,-0.34,-0.4,-0.34h-3.2c-0.2,0,-0.36,0.14,-0.39,0.34l-0.3,2.12c-0.49,0.2,-0.94,0.47,-1.35,0.78l-1.99,-0.8c-0.18,-0.07,-0.39,0,-0.49,0.18l-1.6,2.77c-0.1,0.18,-0.06,0.39,0.1,0.51l1.69,1.32c-0.04,0.25,-0.07,0.52,-0.07,0.78s0.02,0.53,0.06,0.78l-1.69,1.32c-0.15,0.12,-0.19,0.34,-0.1,0.51l1.6,2.77c0.1,0.18,0.31,0.24,0.49,0.18l1.99,-0.8c0.42,0.32,0.86,0.58,1.35,0.78l0.3,2.12c0.04,0.2,0.2,0.34,0.4,0.34h3.2c0.2,0,0.37,-0.14,0.39,-0.34l0.3,-2.12c0.49,-0.2,0.94,-0.47,1.35,-0.78l1.99,0.8c0.18,0.07,0.39,0,0.49,-0.18l1.6,-2.77c0.1,-0.18,0.06,-0.39,-0.1,-0.51l-1.67,-1.32zm-5.95,2.22c-1.65,0,-3,-1.35,-3,-3s1.35,-3,3,-3s3,1.35,3,3s-1.35,3,-3,3z"/></svg>`,
        CLOSE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M19,6.41l-1.41,-1.41l-5.59,5.59l-5.59,-5.59l-1.41,1.41l5.59,5.59l-5.59,5.59l1.41,1.41l5.59,-5.59l5.59,5.59l1.41,-1.41l-5.59,-5.59z"/></svg>`,
        ERROR = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M12,2c-5.52,0,-10,4.48,-10,10s4.48,10,10,10s10,-4.48,10,-10s-4.48,-10,-10,-10zm1,15h-2v-2h2v2zm0,-4h-2v-6h2v6z"/></svg>`,
        LAPTOP = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M20,18c1.1,0,2,-0.9,2,-2v-10c0,-1.1,-0.9,-2,-2,-2h-16c-1.1,0,-2,0.9,-2,2v10c0,1.1,0.9,2,2,2h-4v2h24v-2h-4zm-16,-12h16v10h-16v-10z"/></svg>`,
        CLOUD = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M19.35,10.04c-0.68,-3.45,-3.71,-6.04,-7.35,-6.04c-2.89,0,-5.4,1.64,-6.65,4.04c-3.01,0.32,-5.35,2.87,-5.35,5.96c0,3.31,2.69,6,6,6h13c2.76,0,5,-2.24,5,-5c0,-2.64,-2.05,-4.78,-4.65,-4.96z"/></svg>`,
        LABEL = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M17.63,5.84c-0.36,-0.51,-0.96,-0.84,-1.63,-0.84l-11,0.01c-1.1,0,-2,0.89,-2,1.99v10c0,1.1,0.9,1.99,2,1.99l11,0.01c0.67,0,1.27,-0.33,1.63,-0.84l4.37,-6.16l-4.37,-6.16z"/></svg>`,
        STASH = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M19,3h-14.01c-1.11,0,-1.98,0.89,-1.98,2l-0.01,14c0,1.1,0.88,2,1.99,2h14.01c1.1,0,2,-0.9,2,-2v-14c0,-1.11,-0.9,-2,-2,-2zm0,12h-4c0,1.66,-1.35,3,-3,3s-3,-1.34,-3,-3h-4.01v-10h14.01v10z"/></svg>`,
        STASH_POINT = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M12,2c-5.53,0,-10,4.47,-10,10s4.47,10,10,10s10,-4.47,10,-10s-4.47,-10,-10,-10zm5,13.59l-1.41,1.41l-3.59,-3.59l-3.59,3.59l-1.41,-1.41l3.59,-3.59l-3.59,-3.59l1.41,-1.41l3.59,3.59l3.59,-3.59l1.41,1.41l-3.59,3.59l3.59,3.59z"/></svg>`,
        DONE = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path fill="#fff" d="M9,16.2l-4.2,-4.2l-1.4,1.4l5.6,5.6l12,-12l-1.4,-1.4l-10.6,10.6z"/></svg>`,
    }

    export function getIcon(type: Type, classes: string = "", id: string = null): string {
        const str = `${classes.length > 0 ? "class=\"" + classes + "\" " : ""}${id != null ? "id=\"" + id + "\"" : ""} `;
        return type.slice(0, 5) + str + type.slice(5);
    }

    export function getPath(type: Type, keepMoveto: boolean = true, scale: number = 1): string {
        const path = getIcon(type).match(/\sd="(.*?)"/ui)[1];
        let ret = keepMoveto ? path : path.match(/M[0-9\s,\.]*(.*)/ui)[1];
        if (scale !== 1) {
            let regRes;
            const regex = /\d+(\.\d+)?/mug;
            let int = 0;
            while ((regRes = regex.exec(ret)) !== null && int < 100) {
                int++;
                const newValue = (Number.parseFloat(regRes[0]) * scale).toString();
                ret = ret.slice(0, regex.lastIndex - regRes[0].length) + newValue + ret.slice(regex.lastIndex);
                regex.lastIndex += newValue.length - regRes[0].length;
            }
        }
        return ret;
    }

    export function getTooltiped(type: Type, classes: string = "", content: string = "", parent?: HTMLElement, ...extraWrapperClass: Array<string>) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("tooltipWrapper", ...extraWrapperClass);
        const icon = new DOMParser().parseFromString(Icon.getIcon(type, classes), 'text/xml').firstElementChild;
        wrapper.appendChild(icon);
        if (content != "") Ascript.tooltip(wrapper, content, parent);
        return wrapper;
    }

}