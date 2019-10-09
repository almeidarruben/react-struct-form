import React from 'react';

import { useForm } from '../../../src/index';

export default function InputField({ name, placeholder }) {
  const { getData } = useForm();

  return (
    <input
      type="text"
      name={name}
      placeholder={placeholder}
      value={getData(name)}
    />
  );
}
