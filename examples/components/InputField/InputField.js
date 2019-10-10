import React from 'react';

import { useForm } from '../../../src/index';

export default function InputField({ name, placeholder }) {
  const { getData, updateField } = useForm();

  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      value={getData(name)}
      onChange={event => updateField(name, { value: event.target.value })}
    />
  );
}
