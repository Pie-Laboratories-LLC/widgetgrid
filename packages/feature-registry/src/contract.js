// One test suite, run against every implementation of a seam -- what keeps
// the eventual flag removal safe: the new implementation has passed the old
// one's tests the whole time it was behind the flag.
//
//   import { describeContract } from '@widgetgrid/feature-registry/contract';
//
//   describeContract('main/GamesList', { off: GamesList, on: GamesListNext }, (GamesList) => {
//     test('lists solitaire', () => { ... });
//   });
//
// node:test only -- import this from tests, never from code that ships.
import { describe } from 'node:test';

export function describeContract(name, implementations, suite) {
  for (const [label, implementation] of Object.entries(implementations)) {
    describe(`${name} (${label})`, () => suite(implementation, label));
  }
}
