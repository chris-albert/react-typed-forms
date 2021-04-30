import {Either} from "fp-ts/Either";
import * as either from "fp-ts/Either";

export type Attempt<A, B, E> = {

  attempt: (a: A) => Either<E, B>

  map: <C>(f: (b: B) => C) => Attempt<A, C, E>
  //
  // contramap: <C>(f: (c: C) => B) => Attempt<B, C, E>
  //
  // mapError: <EE>(f: (ee: E) => EE) => Attempt<A, B, EE>

}

export const attempt: <A, B, E>(_: ((_: A) => Either<E, B>)) => Attempt<A, B, E> =
    attemptFunc => ({
      attempt: attemptFunc,
      map: fbc => attempt(a => either.map(fbc)(attemptFunc(a))),
    })

export const succeed: <A, B>(_: (_: A) => B) => Attempt<A, B, never> = func =>
  attempt(a => either.right(func(a)))

export const always: <A>(_: A) => Attempt<any, A, never> = a =>
  succeed(_ => a)
