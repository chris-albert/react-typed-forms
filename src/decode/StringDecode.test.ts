import * as StringDecode from './StringDecode'
import * as either from 'fp-ts/Either'

test('a simple string decoder should succeed', () => {
  expect(StringDecode.string.run('hi'))
    .toEqual(either.right('hi'))
})

test('a number should succeed', () => {
  expect(StringDecode.number.run('10'))
    .toEqual(either.right(10))
})

test('a non number should fail a number decoder', () => {
  expect(StringDecode.number.run('asdf'))
    .toEqual(either.left({
      message: 'Invalid number',
      value: 'asdf'
    }))
})

test('a positive number should succeed', () => {
  expect(StringDecode.positive.run('10'))
    .toEqual(either.right(10))
})

test('a non number should fail being positive', () => {
  expect(StringDecode.positive.run('asdf'))
    .toEqual(either.left({
      message: 'Invalid number',
      value: 'asdf'
    }))
})

test('a negative number should fail', () => {
  expect(StringDecode.positive.run('-1'))
    .toEqual(either.left({
      message: 'Invalid positive number',
      value: '-1'
    }))
})