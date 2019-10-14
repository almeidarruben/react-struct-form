# react-struct-form

React component and set of utilities to render and manage forms with complex data structures.

[![NPM registry](https://img.shields.io/npm/v/react-struct-form.svg?style=for-the-badge)](https://yarnpkg.com/en/package/react-struct-form) [![NPM license](https://img.shields.io/badge/license-mit-red.svg?style=for-the-badge)](LICENSE.md)

## Installation

```bash
# Yarn
yarn add react-struct-form

# NPM
npm install --save react-struct-form
```

## Usage

Form data can be accessed and managed using `FormContext` component or `useForm` hook.

More examples can be seen [here](/examples).

### `<FormContext.Consumer>`

```js
// PersonForm.js

import { Form, FormContext } from 'react-struct-form';

export default function PersonForm() {
  const formData = {
    firstName: 'John',
  };

  return (
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
}
```

### `useForm()`

```js
// InputField.js

import { useForm } from 'react-struct-form';

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
```

```js
// PersonForm.js

import { Form } from 'react-struct-form';

const formData = {
  firstName: 'John',
};

export default function PersonForm() {
  return (
    <Form initialFormData={formData}>
      <InputField name="firstName" placeholder="First Name" />
      <InputField name="lastName" placeholder="Last Name" />
    </Form>
  );
}
```

## API

[To be done]

## License

MIT © [almeidarruben](https://github.com/almeidarruben)
