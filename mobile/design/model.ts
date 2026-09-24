import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import type { Sharing, Scan } from '../lib/types';
import { clearPending } from './storage';
export type Settings = { offline:boolean; gpsDenied:boolean; outside:boolean; nfc:'success'|'cancel'|'error'; background:boolean; emptyScan:boolean; latency:number; failNext:string };
type Account = { id:string; email:string; hash:string; confirmed:boolean };
type State = { account:Account|null; session:Session|null; sharing:Sharing|null; scans:Record<string,Scan & { created:number }>; operations:string[]; settings:Settings };
const defaults:Settings = {offline:false,gpsDenied:false,outside:false,nfc:'success',background:true,emptyScan:false,latency:450,failNext:''};
const key='territory-design:model:v1';
const initial=():State=>({account:null,session:null,sharing:null,scans:{},operations:[],settings:{...defaults}});
function read():State { try { const saved=typeof sessionStorage!=='undefined'?sessionStorage.getItem(key):null; return saved?JSON.parse(saved):initial(); } catch {return initial();} }
export let state=read();
const listeners=new Set<(event:AuthChangeEvent,session:Session|null)=>void>();
export function save() { if(typeof sessionStorage!=='undefined') sessionStorage.setItem(key,JSON.stringify(state)); if(typeof window!=='undefined') window.dispatchEvent(new Event('territory-design-change')); }
export function notify(event:AuthChangeEvent) { save(); listeners.forEach(callback=>callback(event,state.session)); }
export function subscribe(callback:(event:AuthChangeEvent,session:Session|null)=>void) { listeners.add(callback); return ()=>listeners.delete(callback); }
export async function delay(network=true, operation='') { await new Promise(resolve=>setTimeout(resolve,state.settings.latency)); if(network && state.settings.offline) throw new Error('通信に失敗しました。'); if(operation && state.settings.failNext===operation) { state.settings.failNext=''; save(); throw new Error('通信に失敗しました。再試行してください。'); } }
export function sessionFor(account:Account):Session {
  const user:User={id:account.id,email:account.email,app_metadata:{provider:'email'},user_metadata:{},aud:'authenticated',created_at:new Date().toISOString()};
  return {access_token:'design-only-not-a-real-token',refresh_token:'design-only',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user};
}
export function newSharing():Sharing { return {id:'11111111-1111-4111-8111-111111111111',user_id:state.session!.user.id,ghost:false,expires_at:new Date(Date.now()+120000).toISOString(),places:{id:'22222222-2222-4222-8222-222222222222',city_id:'33333333-3333-4333-8333-333333333333',name:'サンプル広場',boundary:{type:'Polygon',coordinates:[[[139.7000,35.6800],[139.7020,35.6800],[139.7020,35.6820],[139.7000,35.6820],[139.7000,35.6800]]]}}}; }
export function confirmEmail() { if(state.account) {state.account.confirmed=true; save();} }
export function configure(patch:Partial<Settings>) { state.settings={...state.settings,...patch}; save(); }
export function reset() { state=initial(); clearPending(); notify('SIGNED_OUT'); }
export function scenario(name:string) {
  reset();
  if(name==='signed-out') return;
  state.account={id:'44444444-4444-4444-8444-444444444444',email:'designer@example.test',hash:'seed',confirmed:true};
  state.session=sessionFor(state.account);
  if(['online','ghost','scan','empty','outside'].includes(name)) state.sharing=newSharing();
  if(name==='ghost') state.sharing!.ghost=true;
  if(name==='empty') state.settings.emptyScan=true;
  if(name==='outside') state.settings.outside=true;
  notify('SIGNED_IN');
}

