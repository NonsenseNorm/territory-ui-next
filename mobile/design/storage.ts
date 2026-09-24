const prefix = 'territory-design:pending:';
const memory = new Map<string,string>();
const storage = {
  async getItem(key:string) { return typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(prefix+key) : memory.get(key) ?? null; },
  async setItem(key:string,value:string) { if(typeof sessionStorage !== 'undefined') sessionStorage.setItem(prefix+key,value); else memory.set(key,value); },
  async removeItem(key:string) { if(typeof sessionStorage !== 'undefined') sessionStorage.removeItem(prefix+key); else memory.delete(key); },
  async multiRemove(keys:string[]) { await Promise.all(keys.map(key=>storage.removeItem(key))); },
};
export default storage;
export function clearPending() { if(typeof sessionStorage !== 'undefined') Object.keys(sessionStorage).filter(key=>key.startsWith(prefix)).forEach(key=>sessionStorage.removeItem(key)); memory.clear(); }

