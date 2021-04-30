import * as either from 'fp-ts/Either'

import * as a from './codec/Attempt'

test('always should always return the same value', () => {
  const alwaysTen = a.always(10)

  expect(alwaysTen.attempt(7)).toEqual(either.right(10))
  expect(alwaysTen.attempt('78')).toEqual(either.right(10))
})

test('mapping should map over result of function', () => {
  const addOne = a.succeed((i: number) => i + 1)

  expect(addOne.map(n => n + 2).attempt(10)).toEqual(either.right(13))
})