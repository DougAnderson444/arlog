/** @typedef {typeof __propDef.props}  ReadContractProps */
/** @typedef {typeof __propDef.events}  ReadContractEvents */
/** @typedef {typeof __propDef.slots}  ReadContractSlots */
export default class ReadContract extends SvelteComponentTyped<{
    contractID: any;
    showLog?: () => Promise<void>;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
    get showLog(): () => Promise<void>;
}
export type ReadContractProps = typeof __propDef.props;
export type ReadContractEvents = typeof __propDef.events;
export type ReadContractSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        contractID: any;
        showLog?: () => Promise<void>;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
