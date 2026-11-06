/** Shared, dependency-free browser/CLI transport contract for Mandos166. */
export const LIVE_FORMAT = 'mandos/live-deaths@1';
export const ACK_FORMAT = 'mandos/live-import-ack@1';
export const LIVE_PREFIX = 'death-166:';
export const MAX_LIVE_BYTES = 49152;
export const MAX_LIVE_FRAMES = 12;
export const LIVE_EXPORT_LIMIT = 10;
export const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
export const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function ordered(value) {
  if (Array.isArray(value)) return value.map(ordered);
  return isObject(value) ? Object.fromEntries(Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => [k, ordered(value[k])])) : value;
}
export const packetText = value => JSON.stringify(ordered(value), null, 2) + '\n';
export async function packetHash(value) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(packetText(value)));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
function keys(value, allowed) { return isObject(value) && Object.keys(value).every(k => allowed.includes(k)); }
const integer = n => Number.isInteger(n) && n >= 0;
const text = (v, n) => typeof v === 'string' && v.length <= n;
const grid = v => keys(v, ['x','y']) && Number.isInteger(v.x) && Number.isInteger(v.y);
const uint = n => integer(n) && n <= 0xffffffff;
const birthRng = s => keys(s, ['quick','fixed','value','stateI','fixval','state']) && typeof s.quick === 'boolean' && typeof s.fixed === 'boolean' && uint(s.value) && uint(s.stateI) && s.stateI < 32 && uint(s.fixval) && Array.isArray(s.state) && s.state.length === 32 && s.state.every(uint);
const scalarMap = v => isObject(v) && Object.values(v).every(x => typeof x === 'boolean' || Number.isFinite(x));
const item = v => keys(v, ['handle','label','quantity','aware','unknownRunes']) && Number.isFinite(v.handle) && text(v.label, 512) && integer(v.quantity) && typeof v.aware === 'boolean' && (v.unknownRunes === null || typeof v.unknownRunes === 'boolean');
function frame(f) {
  return keys(f, ['turn','command','player','monsters','map','items','messages','precision']) && integer(f.turn)
    && ['character-known/health-band-derived','character-known+granted-monster-truth'].includes(f.precision)
    && keys(f.command, ['code','dir','args','submission']) && text(f.command.code, 64) && f.command.submission === 'not-yet-submitted'
    && keys(f.player, ['grid','hp','maxHp','sp','maxSp','depth','level','status']) && grid(f.player.grid)
    && ['hp','maxHp','sp','maxSp','depth','level'].every(k => Number.isFinite(f.player[k])) && scalarMap(f.player.status)
    && Array.isArray(f.monsters) && f.monsters.length <= 12 && f.monsters.every(m => keys(m, ['id','name','grid','hp','maxHp','visible']) && Number.isFinite(m.id) && (typeof m.name === 'string' || Number.isFinite(m.name)) && grid(m.grid) && Number.isFinite(m.hp) && Number.isFinite(m.maxHp) && m.visible === true)
    && Array.isArray(f.map) && f.map.length <= 49 && f.map.every(c => c === null || (keys(c, ['x','y','feat','known','monster']) && grid({x:c.x,y:c.y}) && Number.isFinite(c.feat) && typeof c.known === 'boolean' && Number.isFinite(c.monster)))
    && keys(f.items, ['pack','equipment','home']) && ['pack','equipment','home'].every(k => Array.isArray(f.items[k]) && f.items[k].length <= 48 && f.items[k].every(v => v === null || item(v)))
    && Array.isArray(f.messages) && f.messages.length <= 8 && f.messages.every(m => text(m, 512));
}
export function packetShape(value) {
  if (!keys(value, ['schema','id','sha256','packet']) || value.schema !== 'mandos/death-outbox@1' || !isHash(value.id) || !isHash(value.sha256)) return false;
  const p = value.packet;
  return keys(p, ['schema','id','terminalHash','source','identity','terminal','capture','pending']) && p.schema === LIVE_FORMAT && p.id === value.id && isHash(p.terminalHash)
    && keys(p.source, ['mod','engine','api','codeDigest','flags','settings','life']) && typeof p.source.mod === 'string' && typeof p.source.engine === 'string' && typeof p.source.api === 'string'
    && (p.source.life === undefined || p.source.life === null || (integer(p.source.life) && p.source.life > 0))
    && (p.source.codeDigest === null || isHash(p.source.codeDigest)) && isObject(p.source.flags) && Object.values(p.source.flags).every(v => typeof v === 'boolean')
    && isObject(p.source.settings) && Object.values(p.source.settings).every(Number.isFinite)
    && keys(p.identity, ['hostKey','quality']) && (p.identity.hostKey === null || typeof p.identity.hostKey === 'string') && ['host-key','derived-session'].includes(p.identity.quality)
    && keys(p.terminal, ['outcome','cause','key','race','class','birthStats','level','maxLevel','depth','maxDepth','gold','turn','endedAt','seed','birthRngState','birthOptions','knowledge','messages','messagesTotal','belongings','belongingsTotal','textTruncated','missing'])
    && ['death','winner','retired'].includes(p.terminal.outcome) && (p.terminal.cause === null || text(p.terminal.cause, 256)) && p.terminal.knowledge === 'terminal-revealed'
    && ['race','class'].every(k => p.terminal[k] === null || text(p.terminal[k], 128)) && ['level','maxLevel','depth','maxDepth','gold','turn','endedAt'].every(k => p.terminal[k] === null || integer(p.terminal[k])) && ['messagesTotal','belongingsTotal'].every(k => integer(p.terminal[k]))
    && Array.isArray(p.terminal.missing) && p.terminal.missing.length <= 13 && p.terminal.missing.every(k => text(k, 32))
    && (p.terminal.seed === undefined || uint(p.terminal.seed)) && (p.terminal.birthRngState === undefined || birthRng(p.terminal.birthRngState))
    && (p.terminal.birthOptions === undefined || (isObject(p.terminal.birthOptions) && Object.entries(p.terminal.birthOptions).every(([k,v]) => k.startsWith('birth_') && typeof v === 'boolean')))
    && typeof p.terminal.textTruncated === 'boolean' && (p.terminal.key === null || text(p.terminal.key, 256))
    && Array.isArray(p.terminal.birthStats) && p.terminal.birthStats.length <= 6 && p.terminal.birthStats.every(Number.isFinite)
    && Array.isArray(p.terminal.messages) && p.terminal.messages.length <= 20 && p.terminal.messages.every(m => keys(m, ['text','count']) && text(m.text, 512) && integer(m.count))
    && Array.isArray(p.terminal.belongings) && p.terminal.belongings.length <= 48 && p.terminal.belongings.every(i => keys(i, ['name','location','quantity']) && text(i.name, 160) && ['equipment','pack','quiver','home'].includes(i.location) && integer(i.quantity))
    && keys(p.capture, ['frames','decisions','droppedFrames','truncated','gaps']) && Array.isArray(p.capture.frames) && p.capture.frames.length <= MAX_LIVE_FRAMES
    && Number.isInteger(p.capture.decisions) && p.capture.decisions >= 0 && Number.isInteger(p.capture.droppedFrames) && p.capture.droppedFrames >= 0 && typeof p.capture.truncated === 'boolean' && Array.isArray(p.capture.gaps)
    && p.capture.gaps.every(g => text(g, 128)) && p.capture.frames.every(frame)
    && isObject(p.pending) && p.pending.export === true && p.pending.analysis === true
    && new TextEncoder().encode(packetText(p)).length <= MAX_LIVE_BYTES;
}
