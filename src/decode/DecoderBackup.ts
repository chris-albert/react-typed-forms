import {Either, chain} from "fp-ts/Either";

export type DecodeError<A> = {
  message: string
  value: A
}

type DecodeFunction<I, O> = (i: I) => Either<DecodeError<I>, O>

export type DecoderBase<I, O> = {
  decode: DecodeFunction<I, O>
}

export type Decoder<I, O> =
  DecoderBase<I, O> &
  {
    refine: <OO>(f: (o: O) => Either<DecodeError<I>, OO>) => Decoder<I, OO>
  }

export const decoder: <I, O>(df: DecodeFunction<I, O>) => Decoder<I, O> =
  decode => {
    return {
      decode,
      refine: f => decoder(i => chain(f)(decode(i)))
    }
  }