
import { Either, right, left, map, flatten, isRight } from "fp-ts/Either";
import _ from 'lodash'

export type DecodeType<T extends {[index: string]: Codec<any, any>}> = {
  [P in keyof T]: Parameters<T[P]['encode']>[0]
}

export type EncodeType<T extends {[index: string]: Codec<any, any>}> = {
  [P in keyof T]: Parameters<T[P]['decode']>[0]
}

export type CodecError = {
  message: string
}

export type CodecBase<A, B> = {
  encode: (a: A) => Either<CodecError, B>
  decode: (b: B) => Either<CodecError, A>
}

export type Codec<A, B> = {
  refine: <AA>(
    f: (a: A) => Either<CodecError, AA>,
    g: (aa: AA) => Either<CodecError,A>
  ) => Codec<AA, B>
} & CodecBase<A, B>

export function codec<A, B>(
  encode: (a: A) => Either<CodecError, B>,
  decode: (b: B) => Either<CodecError, A>
): Codec<A, B> {
  const base = {encode, decode}
  return {
    ...base,
    refine: (f, g) => flatMapA(base, f, g)
  }
}

export function error<A>(message: string): Either<CodecError, A> {
  return left({message})
}

export function mapA<A, B, AA>(
  self: CodecBase<A, B>,
  to: (a: A) => AA,
  from: (aa: AA) => A
): Codec<AA, B> {
  return codec<AA, B>(
    aa => self.encode(from(aa)),
    b  => map(to)(self.decode(b))
  )
}

export function flatMapA<A, B, AA>(
  self: CodecBase<A, B>,
  to: (a: A) => Either<CodecError, AA>,
  from: (aa: AA) => Either<CodecError,A>
): Codec<AA, B> {
  return codec<AA, B>(
    aa => flatten(map(self.encode)(from(aa))),
    b  => flatten(map(to)(self.decode(b)))
  )
}

export function mapB<A, B, BB>(
  self: CodecBase<A, B>,
  to: (a: B) => BB,
  from: (aa: BB) => B
): Codec<A, BB> {
  return codec<A, BB>(
    a  => map(to)(self.encode(a)),
    bb => self.decode(from(bb))
  )
}

export function flatMapB<A, B, BB>(
  self: CodecBase<A, B>,
  to: (a: B) => Either<CodecError, BB>,
  from: (aa: BB) => Either<CodecError, B>
): Codec<A, BB> {
  return codec<A, BB>(
    a  => flatten(map(to)(self.encode(a))),
    bb => flatten(map(self.decode)(from(bb)))
  )
}

export const string: Codec<string, string> = codec(right, right)

export const number: Codec<number, string> = codec(
  n => right(_.toString(n)),
  s => {
    const mn = _.toNumber(s)
    return _.isNaN(mn) ? error(`Invalid number [${s}]`) : right(mn)
  }
)

export const graterThan: (n: number) => Codec<number, string> = n =>
  number.refine(
    nn => nn > n ? right(nn) : error(`Must be grater than [${n}]`),
    right
  )

export const positive: Codec<number, string> =
  graterThan(0)

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

function objRecurse(
  obj: object,
  pairs: Array<[string, Codec<any, string>]>,
  good: Array<[string, any]>,
  bad: Array<[string, CodecError]>
): [Array<[string, any]>, Array<[string, CodecError]>] {
  const head = _.head(pairs)
  if(_.isNil(head)) {
    return [good, bad]
  } else {
    const res = head[1].decode(_.get(obj, head[0]))
    if(isRight(res)) {
      return objRecurse(obj,_.tail(pairs), [...good, [head[0] ,res.right]], bad)
    } else {
      return objRecurse(obj,_.tail(pairs), good, [...bad, [head[0], res.left]])
    }
  }
}

export function object(schema: {[index: string]: Codec<any, string>}): Codec<DecodeType<typeof schema>, object> {
  return codec(
    a => right({}),
    b => {
      const [good, bad] = objRecurse(b, _.toPairs(schema), [], [])
      if(_.isEmpty(bad)) {
        return right(_.fromPairs(good))
      } else {
        return error("ahhh o broke")
      }
      // return error("test")
    }
  )
}