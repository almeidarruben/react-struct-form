import React from 'react';

import { Form, FormContext } from '../src';
import InputField from './components/InputField/InputField';

const formData = {
  firstName: 'John',
};

export const contextComponent = () => (
  <Form initialFormData={formData}>
    <FormContext.Consumer>
      {({ getData, updateField }) => (
        <>
          <input
            type="text"
            placeholder="First name"
            value={getData('firstName')}
            onChange={event =>
              updateField('firstName', { value: event.target.value })
            }
          />
          <input
            type="text"
            placeholder="Last Name"
            value={getData('lastName')}
            onChange={event =>
              updateField('lastName', { value: event.target.value })
            }
          />
        </>
      )}
    </FormContext.Consumer>
  </Form>
);

export const hook = () => (
  <Form initialFormData={formData}>
    <InputField name="firstName" placeholder="First Name" />
    <InputField name="lastName" placeholder="Last Name" />
  </Form>
);

export default { title: 'Form|Components' };
