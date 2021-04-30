import {Either, left, right, isLeft, fold} from "fp-ts/Either";
import {KleisliEither, of as kleisliEitherOf} from "../core/KleisliEither";

export type DecodeError = {
  message: string
}
export type DecodeErrorWithValue<A> = DecodeError & {
  value: A
}

export type Decoder<I, O> = {
  run: (i: I) => Either<DecodeErrorWithValue<I>, O>

  map: <OO>(_: (o: O) => OO) => Decoder<I, OO>
  refine: <OO>(_: (o: O) => Either<DecodeError, OO>) => Decoder<I, OO>
}

export const invalid: <A>(_: string) => Either<DecodeError, A> =
  name => left({ message: `Invalid ${name}` })

export const of: <I, O>(_: (i: I) => Either<DecodeError, O>) => Decoder<I, O> =
  f => {
    const ke = kleisliEitherOf(f)

    return {
      run: i => {
        const res = f(i)
        if(isLeft(res)) {
          return left({...res.left, value: i})
        } else {
          return right(res.right)
        }
      },
      map: g => of(i => {
        const res = f(i)
        if(isLeft(res)) {
          return left({...res.left, value: i})
        } else {
          return right(g(res.right))
        }
      }),
      refine: g => of(i => {
        const res = f(i)
        if(isLeft(res)) {
          return left({...res.left, value: i})
        } else {
          return g(res.right)
        }
      })
    }
  }