import {Either, chain, map, mapLeft} from "fp-ts/Either";

type KleisliEitherRun<I, O, E> = (i: I) => Either<E, O>

export type KleisliEither<I, O, E> = {

  run: KleisliEitherRun<I, O, E>

  map    : <OO>(f: (o: O) => OO) => KleisliEither<I, OO, E>
  flatMap: <OO>(f: KleisliEitherRun<O, OO, E>) => KleisliEither<I, OO, E>

  mapError    : <EE>(f: (e: E) => EE) => KleisliEither<I, O, EE>

  contramap: <II>(f: (i: II) => I) => KleisliEither<II, O, E>
}

export const of: <I, O, E>(f: KleisliEitherRun<I, O, E>) => KleisliEither<I, O, E> =
  run => ({
    run,
    map: f => of(i => map(f)(run(i))),
    flatMap: f => of(i => chain(f)(run(i))),
    mapError: f => of(i => mapLeft(f)(run(i))),
    contramap: f => of(i => run(f(i)))
  })