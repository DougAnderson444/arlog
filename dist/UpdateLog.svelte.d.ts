/** @typedef {typeof __propDef.props}  UpdateLogProps */
/** @typedef {typeof __propDef.events}  UpdateLogEvents */
/** @typedef {typeof __propDef.slots}  UpdateLogSlots */
export default class UpdateLog extends SvelteComponentTyped<{
    contractID: any;
    keyfile: any;
}, {
    updated: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type UpdateLogProps = typeof __propDef.props;
export type UpdateLogEvents = typeof __propDef.events;
export type UpdateLogSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        contractID: any;
        keyfile: any;
    };
    events: {
        updated: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
