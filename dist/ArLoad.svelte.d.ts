/** @typedef {typeof __propDef.props}  ArLoadProps */
/** @typedef {typeof __propDef.events}  ArLoadEvents */
/** @typedef {typeof __propDef.slots}  ArLoadSlots */
export default class ArLoad extends SvelteComponentTyped<{}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ArLoadProps = typeof __propDef.props;
export type ArLoadEvents = typeof __propDef.events;
export type ArLoadSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {};
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
