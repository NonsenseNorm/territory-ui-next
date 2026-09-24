// Reuse the real geometry, retry and synchronization logic. Replace only OS background APIs.
export { position,leave,synchronize,pauseSharing } from '../lib/location';
import {state,delay} from './model';
export async function startBackground(){await delay(false);return state.settings.background;}
export async function stopBackground(){}

