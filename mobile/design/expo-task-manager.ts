export function defineTask<T>(_name:string,_callback:(event:{data?:T;error?:unknown})=>Promise<void>) {}

