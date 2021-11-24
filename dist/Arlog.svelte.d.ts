import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {};
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type ArlogProps = typeof __propDef.props;
export declare type ArlogEvents = typeof __propDef.events;
export declare type ArlogSlots = typeof __propDef.slots;
export default class Arlog extends SvelteComponentTyped<ArlogProps, ArlogEvents, ArlogSlots> {
}
export {};
