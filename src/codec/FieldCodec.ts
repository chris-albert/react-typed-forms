
import { Either, right, left, map, flatten } from "fp-ts/Either";
import _ from 'lodash'

export type CodecError = {
  message: string
}

export type Codec<A, B> = {
  encode: (a: A) => Either<CodecError, B>
  decode: (b: B) => Either<CodecError, A>
}

export function codec<A, B>(
  encode: (a: A) => Either<CodecError, B>,
  decode: (b: B) => Either<CodecError, A>
): Codec<A, B> {
   return {encode, decode}
}

export function error<A>(message: string): Either<CodecError, A> {
  return left({message})
}

export function mapA<A, B, AA>(
  self: Codec<A, B>,
  to: (a: A) => AA,
  from: (aa: AA) => A
): Codec<AA, B> {
  return codec<AA, B>(
    aa => self.encode(from(aa)),
    b  => map(to)(self.decode(b))
  )
}

export function flatMapA<A, B, AA>(
  self: Codec<A, B>,
  to: (a: A) => Either<CodecError, AA>,
  from: (aa: AA) => Either<CodecError,A>
): Codec<AA, B> {
  return codec<AA, B>(
    aa => flatten(map(self.encode)(from(aa))),
    b  => flatten(map(to)(self.decode(b)))
  )
}

export function mapB<A, B, BB>(
  self: Codec<A, B>,
  to: (a: B) => BB,
  from: (aa: BB) => B
): Codec<A, BB> {
  return codec<A, BB>(
    a  => map(to)(self.encode(a)),
    bb => self.decode(from(bb))
  )
}

export function flatMapB<A, B, BB>(
  self: Codec<A, B>,
  to: (a: B) => Either<CodecError, BB>,
  from: (aa: BB) => Either<CodecError, B>
): Codec<A, BB> {
  return codec<A, BB>(
    a  => flatten(map(to)(self.encode(a))),
    bb => flatten(map(self.decode)(from(bb)))
  )
}

export const refine = flatMapA

export const string: Codec<string, string> = codec(right, right)

export const number: Codec<number, string> = codec(
  n => right(_.toString(n)),
  s => {
    const mn = _.toNumber(s)
    return _.isNaN(mn) ? error(`Invalid number [${s}]`) : right(mn)
  }
)

export const graterThan: (n: number) => Codec<number, string> = n =>
  refine(
    number,
    nn => nn > n ? right(nn) : error(`Must be grater than [${n}]`),
    right
  )

export const boolean: Codec<boolean, string> = codec(
  b => right(_.toString(b)),
  s => {
    const l = _.toLower(s)
    if(l === 'true') {
      return right(true)
    } else if(l === 'false') {
      return right(false)
    } else {
      return error(`Invalid boolean [${s}]`)
    }
  }
)