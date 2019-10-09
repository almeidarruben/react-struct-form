import React, { useContext } from 'react';

export const FormContext = React.createContext({});

export function FormProvider({ value, ...props }) {
  const { children, ...newProps } = props;

  return (
    <FormContext.Provider value={value}>
      {value.isFormReady() && <form {...newProps}> {children}</form>}
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
