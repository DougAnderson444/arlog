import { writable } from 'svelte/store';

export const arlog = writable(null);
export const arLogLoaded = writable(false);
export const portal = writable(null);
export const selectedNetwork = writable(null);
export const testNet = writable(null);
