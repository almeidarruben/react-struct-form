import React, { useContext } from 'react';
import { Form } from 'semantic-ui-react';

export const FormContext = React.createContext({});

export function FormProvider({ value, ...props }) {
  return (
    <FormContext.Provider value={value}>
      {value.isFormReady() && <Form {...props} />}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return { ...context };
}
