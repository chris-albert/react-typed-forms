import {Decoder, of, invalid} from "./Decoder";
import {right} from "fp-ts/Either";
import _ from 'lodash'

export const string: Decoder<string, string> = of(right)

export const number: Decoder<string, number> = of(s => {
  const v = _.toNumber(s)
  return _.isNaN(v) ? invalid('number'): right(v)
})

export const positive: Decoder<string, number> =
  number.refine(n =>
    n > 0 ? right(n) : invalid('positive number')
  )