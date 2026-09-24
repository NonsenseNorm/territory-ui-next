import { state,delay } from './model';
export const Accuracy={High:4};
export async function requestForegroundPermissionsAsync() {await delay(false);return {granted:!state.settings.gpsDenied};}
export async function getCurrentPositionAsync(_options?:unknown) {await delay(false);return {coords:{latitude:state.settings.outside?35.7:35.681,longitude:139.701,accuracy:5},timestamp:Date.now()};}
export async function requestBackgroundPermissionsAsync(){return {granted:state.settings.background};}
export async function hasStartedLocationUpdatesAsync(_name:string){return false;}
export async function startLocationUpdatesAsync(_name:string,_options:unknown){}
export async function stopLocationUpdatesAsync(_name:string){}

