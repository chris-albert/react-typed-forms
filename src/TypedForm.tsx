import React from 'react'
import * as t from 'io-ts'
import { match, __ } from 'ts-pattern'
import _ from 'lodash'
import { uid } from 'react-uid'

const Person = t.type({
  firstName: t.string,
  lastName : t.string,
  height   : t.number,
  weight   : t.number
})

type Person = t.TypeOf<typeof Person>

const obj: any = {
  firstName: "chris",
  lastName : "albert",
  height   : 188,
  weight   : 185
}

const TypedForm = <A extends t.Props>(type: t.TypeC<A>) => {

  const [formData, setFormData] = React.useState({})

  const fieldChanged = (name: string, raw: any, value: t.Validation<any>) => {
    console.log('fieldChanged', name, raw, value)
    setFormData(d => ({
      ...d,
      [name]: raw,
    }))
  }

  const fields = _.map(type.props, (prop: t.Mixed, name: string) => {
    return match(prop)
      .with({ name: 'string'}, { name: 'number'}, (v) => {
        return (
          <TInput
            key={uid(name)}
            value={_.get(formData, name)}
            codec={v}
            onChange={(r, v) => fieldChanged(name, r, v)}
          />
        )
      })
      .with(__, () => (<></>))
      .exhaustive()
  })

  return (
    <>
      {fields}
    </>
  )
}

export const test = () => {

  return TypedForm(Person)
}

type FieldType<A, B> = t.Type<A, B, B>

interface TypedProps<Value> {
  value   : any,
  codec   : FieldType<Value, any>,
  onChange: (raw: any, v: t.Validation<Value>) => void
}

interface TInputProps<A> extends TypedProps<A> {}

function TInput<A>({ value, codec, onChange }: TInputProps<A>) {

  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value, codec.decode(e.target.value))}
    />
  )
}