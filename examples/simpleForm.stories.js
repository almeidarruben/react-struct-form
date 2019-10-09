import React from 'react';

import { Form, FormContext } from '../src';
import InputField from './components/InputField/InputField';

const formData = {
  firstName: 'John',
};

export const contextComponent = () => (
  <Form initialFormData={formData}>
    <FormContext>
      {({ getData }) => (
        <>
          <input
            type="text"
            placeholder="First name"
            value={getData('firstName')}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={getData('lastName')}
          />
        </>
      )}
    </FormContext>
  </Form>
);

export const hook = () => (
  <Form initialFormData={formData}>
    <InputField name="firstName" placeholder="First Name" />
    <InputField name="lastName" placeholder="Last Name" />
  </Form>
);

export default { title: 'Form|Components' };
