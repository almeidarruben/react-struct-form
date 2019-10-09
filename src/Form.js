import React, { useReducer, useState, useEffect } from 'react';

import { FormProvider } from './FormContext';
import {
  createField,
  updateField as updateFieldData,
  cleanDeletedFields,
  resetFields,
  getParentFields,
} from './field';
import { iterateObjectDeep, isFormDirty, getFormData } from './utils';

const initialState = {
  fields: {},
  dirty: false,
  submitting: false,
};

export default function Form({
  initialFormData,
  loading = false,
  errors = {},
  className,
  children,
  onChange,
  onSubmit,
  onAfterSubmit,
  intl,
  inverted,
  size,
  widths,
}) {
  const reducer = (state, action) => {
    return { ...state, ...action };
  };

  const [state, setState] = useReducer(reducer, initialState);
  const [canSubmit, setCanSubmit] = useState(false);
  const [formReady, setFormReady] = useState(false);

  useEffect(() => {
    if (!formReady) {
      setFormReady(true);
    }
  }, [formReady]);

  useEffect(() => {
    if (initialFormData && Object.keys(initialFormData).length) {
      const fields = {};
      const createNewField = ({ name, value }) => {
        fields[name] = createField({ name, value });
      };
      iterateObjectDeep(initialFormData, createNewField);

      setState({
        fields,
      });
    }
  }, [initialFormData]);

  useEffect(() => {
    if (canSubmit) {
      submit();
    }

    return () => {
      setCanSubmit(false);
    };
  }, [canSubmit]);

  useEffect(() => {
    const errorsArray = Object.keys(errors);
    if (errorsArray.length > 0) {
      const { ...newFields } = state.fields;
      errorsArray.forEach(field => {
        newFields[field] = updateFieldData(newFields[field], {
          error: errors[field],
        });
      });

      setState({ fields: newFields });
    }
  }, [errors]);

  function getData(name = null, checkInitialFormData = false) {
    const { fields } = state;

    if (!name) return getFormData(fields);

    const field = fields[name];
    if (!fields[name]) return '';

    return checkInitialFormData ? field.initialValue : field.value;
  }

  // Used for object array fields
  function addField(parentFieldName, fields) {
    const { ...newFields } = state.fields;

    // Generate the last field index
    const lastParentField = getFields(parentFieldName).slice(-1)[0];
    let newFieldIndex = 0;
    if (lastParentField) {
      const LAST_INDEX_REGEX = /(\d+)(?!.*\d)/;
      const lastFieldIndex = lastParentField.match(LAST_INDEX_REGEX)[0];
      newFieldIndex = parseInt(lastFieldIndex) + 1;
    }

    fields.forEach(field => {
      const newFieldName = `${parentFieldName}.${newFieldIndex}.${field.name}`;
      const newField = createField({
        name: newFieldName,
        value: field.value,
        validator: field.validator,
        dirty: true,
        createdAfter: true,
      });

      newFields[newFieldName] = newField;
    });

    setState({ fields: newFields, dirty: true });
  }

  // Used for object array fields
  function removeField(parentFieldName) {
    const fieldsToRemove = getFields(parentFieldName, false);
    const { ...newFields } = state.fields;

    fieldsToRemove.forEach(field => {
      newFields[field] = updateFieldData(newFields[field], { deleted: true });
    });

    setState({
      fields: newFields,
      dirty: isFormDirty(newFields),
    });
  }

  async function updateField(name, data) {
    const { ...newFields } = state.fields;

    if (!newFields[name]) {
      newFields[name] = createField({
        name,
        initialValue: '',
        createdAfter: true,
        dirty: true,
        ...data,
      });
    } else {
      newFields[name] = updateFieldData(newFields[name], data);
    }

    await setState({
      fields: newFields,
      dirty: isFormDirty(newFields),
    });
  }

  function swapFields(originParentFieldName, destinationParentFieldName) {
    const { ...newFields } = state.fields;

    getFields(originParentFieldName, false).forEach(originFieldName => {
      const fieldName = originFieldName.split('.').pop();
      const swapFieldName = `${destinationParentFieldName}.${fieldName}`;

      const tmpField = updateFieldData(newFields[originFieldName], {
        name: swapFieldName,
      });
      newFields[swapFieldName] = updateFieldData(newFields[swapFieldName], {
        name: originFieldName,
      });
      newFields[originFieldName] = tmpField;
    });

    setState({
      fields: newFields,
      dirty: isFormDirty(newFields),
    });
  }

  /**
   * Return the fields for a given array field.
   * Returned data can be grouped by parent field.
   *
   * @param {object} fields
   * @param {boolean} groupByParentField let array fields to be grouped by their parent
   */
  function getFields(field, groupByParentField = true) {
    const filteredArrayFields = Object.keys(state.fields).filter(
      arrayField =>
        arrayField.startsWith(field) && !state.fields[arrayField].deleted,
    );

    if (!groupByParentField) return filteredArrayFields;

    return getParentFields(filteredArrayFields);
  }

  /**
   * Reset errors for all fields.
   */
  function resetErrors() {
    const { ...newFields } = state.fields;

    Object.keys(newFields).forEach(field => {
      newFields[field] = updateFieldData(newFields[field], { error: null });
    });

    setState({
      fields: newFields,
    });
  }

  function getFormattedError(field) {
    // TODO: Check why fields are undefined at this point
    if (!state.fields[field]) return;
    const fieldError = state.fields[field].error;

    return (
      (fieldError &&
        fieldError instanceof Error &&
        fieldError.formatMessage &&
        fieldError.formatMessage(intl)) ||
      (fieldError && fieldError.message) ||
      fieldError
    );
  }

  function updateError(field, error) {
    const { ...newFields } = state.fields;

    // TODO: Check why fields are undefined at this point
    if (!newFields[field]) return;

    newFields[field] = updateFieldData(newFields[field], { error });
    setState({
      fields: newFields,
    });
  }

  function hasErrors() {
    const { fields } = state;
    return Boolean(
      Object.keys(fields).find(field =>
        Boolean(fields[field].error && !fields[field].deleted),
      ),
    );
  }

  // Validators
  function addValidator(name, validator) {
    // FIXME: The state is being mutated. Investigate how to solve this.
    if (!state.fields[name]) {
      state.fields[name] = createField({ name, validator });
    } else {
      state.fields[name] = updateFieldData(state.fields[name], { validator });
    }

    // TODO: This is the right approach, uncomment this after fixing state
    //  mutation issue above.
    /*
    const { ...newFields } = state.fields

    if (!newFields[name]) {
      newFields[name] = createField({ name, validator })
    } else {
      newFields[name] = updateFieldData(newFields[name], { validator })
    }

    setState({
      fields: newFields,
    })
    */
  }

  // Check if any of the validators have errors. If so, updates the error state
  // accordingly.
  function checkValidatorErrors(fields) {
    const { ...newFields } = fields;
    let hasErrors = false;

    const fieldsArray = Object.keys(fields);
    return new Promise(resolve => {
      fieldsArray.forEach((field, index) => {
        const validator = fields[field].validator;
        const error =
          validator &&
          validator(getData(field), {
            getData,
          });

        if (error) {
          // TODO: This is confusing, having 2 function doing the same
          // Review updateFieldData and updateField
          newFields[field] = updateFieldData(fields[field], { error });
          hasErrors = true;
        }

        if (index === fieldsArray.length - 1) {
          resolve({ hasErrors, fields: newFields });
        }
      });
    });
  }

  // Helpers
  function isDirty() {
    return state.dirty;
  }

  function isLoading() {
    return state.loading;
  }

  function isSubmitting() {
    return state.submitting;
  }

  // Handlers
  function handleChange() {
    onChange && onChange(getData());
  }

  function handleSubmit() {
    if (!onSubmit) {
      console.error(`'onSubmit' prop is not defined.`);
      return;
    }

    checkBeforeSubmit();
  }

  function isFormReady() {
    return formReady;
  }

  async function checkBeforeSubmit() {
    // remove fields marked for deletion
    const cleanedFields = cleanDeletedFields(state.fields);

    // check if any of the remaining fields have errors
    const { hasErrors, fields } = await checkValidatorErrors(cleanedFields);

    if (hasErrors) {
      setState({ fields });
    } else {
      setState({ fields: cleanedFields, dirty: false });
      setCanSubmit(true);
    }
  }

  function submit() {
    onSubmit(getData());
    resetFields(state.fields);
    onAfterSubmit && onAfterSubmit();
  }

  const contextValue = {
    getData,
    getFields,
    addField,
    removeField,
    updateField,
    swapFields,

    updateError,
    getFormattedError,
    hasErrors,
    resetErrors,

    addValidator,

    isDirty,
    isLoading,
    isSubmitting,

    isFormReady,
  };

  return (
    <FormProvider
      value={contextValue}
      onChange={handleChange}
      onSubmit={() => handleSubmit()}
      {...{ loading, className, inverted, size, widths, children }}
    />
  );
}
