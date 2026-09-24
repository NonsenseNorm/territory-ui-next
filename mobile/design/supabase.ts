import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { insideBoundary } from '../lib/geometry';
import { state,save,delay,subscribe,notify,sessionFor,newSharing } from './model';
export const configured=true;
export class ApiError extends Error { constructor(message:string,public status:number) {super(message);} }
const hash=(value:string)=>Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,value);
const result=(session:Session|null,error:Error|null=null)=>({data:{session,user:session?.user??null},error});
export const supabase={auth:{
  async getSession(){return result(state.session);},
  onAuthStateChange(callback:(event:AuthChangeEvent,session:Session|null)=>void){const unsubscribe=subscribe(callback);return {data:{subscription:{unsubscribe}}};},
  startAutoRefresh(){}, stopAutoRefresh(){},
  async signUp({email,password}:{email:string;password:string}) {
    try {await delay(true,'signup'); if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('メールアドレスを確認してください。'); if(password.length<8) throw new Error('パスワードは8文字以上で入力してください。'); if(state.account?.email===email) throw new Error('このメールアドレスは登録済みです。'); state.account={id:Crypto.randomUUID(),email,hash:await hash(password),confirmed:false}; save(); return result(null); } catch(error) {return result(null,error as Error);}
  },
  async signInWithPassword({email,password}:{email:string;password:string}) {
    try {await delay(true,'login'); const account=state.account; if(!account || account.email!==email || (account.hash==='seed' ? password!=='preview123' : account.hash!==await hash(password))) throw new Error('メールアドレスまたはパスワードが正しくありません。'); if(!account.confirmed) throw new Error('メールアドレスの確認が完了していません。'); state.session=sessionFor(account); notify('SIGNED_IN'); return result(state.session); } catch(error) {return result(null,error as Error);}
  },
  async signOut(_options?:{scope?:string}) {state.session=null;state.sharing=null;notify('SIGNED_OUT');return {error:null};},
}};
export async function api<T>(path:string,method='GET',body?:unknown):Promise<T> {
  const input=(body??{}) as Record<string,any>;
  const operation=path==='/nfc/toggle'?'nfc':path.endsWith('/ghost')?'ghost':path==='/scans'?'scan':path==='/auth/logout'?'logout':path==='/account'?'delete':'';
  await delay(true,operation);
  if(!state.session) throw new ApiError('ログインしてください。',401);
  if(state.sharing && Date.parse(state.sharing.expires_at)<=Date.now()) state.sharing=null;
  let data:unknown;
  if(path==='/session') data={session:state.sharing};
  else if(path==='/nfc/toggle' && method==='POST') {
    if(state.operations.includes(input.operation_id)) return {session:state.sharing} as T;
    if(input.tag_number!=='DESIGN-TAG-001') throw new ApiError('タグが登録されていません。',400);
    if(state.sharing) state.sharing=null;
    else { const next=newSharing(); if(!insideBoundary(next.places.boundary,input.latitude,input.longitude)) throw new ApiError('場所の範囲内でタッチしてください。',400); state.sharing=next; }
    state.operations.push(input.operation_id); data={session:state.sharing};
  } else if(path.endsWith('/ghost') && method==='PATCH') {if(state.sharing) state.sharing.ghost=Boolean(input.ghost);data={session:state.sharing};}
  else if(path.endsWith('/heartbeat')) {if(state.sharing) state.sharing.expires_at=new Date(Date.now()+120000).toISOString();data={session:state.sharing};}
  else if(path.startsWith('/sessions/') && method==='DELETE') {if(state.sharing?.id===path.split('/')[2]) state.sharing=null;data={session:null};}
  else if(path==='/location-requests') data=[];
  else if(path.startsWith('/location-requests/')) data={ok:true};
  else if(path==='/scans' && method==='POST') {
    if(!state.sharing) throw new ApiError('場所に参加してください。',400);
    if(Object.values(state.scans).some(scan=>Date.now()-scan.created<30000)) throw new ApiError('次のスキャンまでお待ちください。',400);
    const id=Crypto.randomUUID();const scan={id,created:Date.now(),expires_at:new Date(Date.now()+30000).toISOString(),results:[]};state.scans[id]=scan;data=scan;
  } else if(path.startsWith('/scans/')) {
    const scan=state.scans[path.split('/')[2]];if(!scan||!state.sharing) throw new ApiError('スキャンを閲覧する権限がありません。',400);
    scan.results=!state.settings.emptyScan && Date.now()-scan.created>=2000 && Date.now()-scan.created<300000 ? [{session_id:'55555555-5555-4555-8555-555555555555',user_id:'66666666-6666-4666-8666-666666666666',place_name:'サンプルカフェ',latitude:35.6812,longitude:139.7013,accuracy:8,recorded_at:new Date(scan.created+2000).toISOString()}]:[];data=scan;
  } else if(path==='/auth/logout') {state.sharing=null;state.scans={};data={ok:true};}
  else if(path==='/account' && method==='DELETE') {state.account=null;state.sharing=null;state.scans={};state.operations=[];data={ok:true};}
  else throw new ApiError('APIが見つかりません。',404);
  save();return JSON.parse(JSON.stringify(data)) as T;
}

