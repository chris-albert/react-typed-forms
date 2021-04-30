import * as fc from './codec/FieldCodec'
import * as either from 'fp-ts/Either'
import * as z from 'zod'

test('a simple string codec should succeed', () => {
  const value = 'hi'
  const res = fc.string.decode(value)
  expect(res).toEqual(either.right(value))
})

test('a number should succeed', () => {
  const value = '100'
  const res = fc.number.decode(value)
  expect(res).toEqual(either.right(100))
})

test('a number should fail', () => {
  const value = 'asdf'
  const res = fc.number.decode(value)
  expect(res).toEqual(fc.error('Invalid number [asdf]'))
})

test('a positive number should fail if negative', () => {
  const value = '-10'
  const res = fc.positive.decode(value)
  expect(res).toEqual(fc.error('Must be grater than [0]'))
})

test('boolean should parse correctly', () => {
  expect(fc.boolean.decode('true')).toEqual(either.right(true))
  expect(fc.boolean.decode('false')).toEqual(either.right(false))
  expect(fc.boolean.decode('TRUE')).toEqual(either.right(true))
  expect(fc.boolean.decode('FALSE')).toEqual(either.right(false))

  expect(fc.boolean.decode('asdf')).toEqual(fc.error('Invalid boolean [asdf]'))
})

test('a simple object should succeed', () => {
  const obj = {
    str: '10',
    num: '-5',
    bool: 'true'
  }

  const schema = {
    str: fc.string,
    num: fc.number
  }

  const os = fc.object(schema)

  const res = os.decode(obj)

  // expect(res).toEqual(either.right({str: '10', num: -5}))
  // expect(os.decode({})).toEqual(either.right({str: '10', num: -5}))

})


export {}