// Feature flags as dependency injection. Rather than
//
//   if (flagOn) doTheNewThing(); else doTheOldThing();
//
// scattered through the code, the old behaviour stays whole in one
// implementation, the new one is written beside it, and a seam declares
// which the flag picks:
//
//   registry.provide('main/GamesList', { flag: 'wgtgrd-4', on: GamesListNext, off: GamesList });
//
// Callers ask for the seam by name and never see the flag:
//
//   const GamesList = registry.resolve('main/GamesList');
//
// Removing the flag later is deleting the losing implementation and
// turning the seam into registry.provide('main/GamesList', GamesListNext)
// -- no caller changes, so no caller can break. Run both implementations
// through the same tests while the flag lives (./contract.js).
//
// Resolve at the moment of use, never once at startup and keep: flags
// change while things run (an edit in Consul lands within seconds).
//
// Seam names are global to the page (every widget shares one registry in
// the browser), so they're prefixed with their owner: 'main/GamesList'.

export class UnknownFeature extends Error {}

// isEnabled(flag) -> boolean: the current value of a flag. Off for
// anything unknown -- which is also what the browser has before the
// flags arrive.
export function createFeatureRegistry({ isEnabled }) {
  const seams = new Map();

  return {
    // implementation: the one thing to give out, or { flag, on, off } to
    // choose by flag. Providing a name again replaces it.
    provide(name, implementation) {
      const flagged = implementation !== null && typeof implementation === 'object'
        && 'flag' in implementation && 'on' in implementation && 'off' in implementation;
      if (flagged && typeof implementation.flag !== 'string') throw new TypeError(`${name}: flag must be a flag's name`);
      seams.set(name, flagged ? { ...implementation } : { only: implementation });
    },

    // The implementation for this moment's flags. A name nobody provided
    // throws -- a typo shouldn't quietly give out nothing.
    resolve(name) {
      const seam = seams.get(name);
      if (!seam) throw new UnknownFeature(`Nothing provides "${name}"`);
      if ('only' in seam) return seam.only;
      return isEnabled(seam.flag) ? seam.on : seam.off;
    },

    has: (name) => seams.has(name),

    // Every seam and the flag behind it, for finding what a flag touches.
    describe() {
      return [...seams].map(([name, seam]) => ({ name, flag: seam.flag ?? null }));
    },
  };
}
