const OBJECT_NOTATION_REGEX = /^[a-zA-Z0-9_]+(\.\w+)*(\.[a-zA-Z0-9_]+)$/;
const ARRAY_FIELD_REGEX = /^[\w+.]+(\.\d)/;

export function createField({
  name,
  initialValue,
  value = '',
  validator = null,
  error = null,
  dirty = false,
  deleted = false,
  createdAfter = false, // Fields that can be added
}) {
  return {
    name,
    initialValue:
      initialValue === undefined || initialValue === null
        ? value
        : initialValue,
    value,
    validator,
    error,
    dirty,

    deleted, // Mark the field as deleted (i.e.: Remove an array field)
    createdAfter, // Fields created after, not in the initial form data (i.e.: Add a new array field)
  };
}

export function updateField(currentValues, updatedValues) {
  const { name, initialValue, value, validator, error, deleted } = {
    ...currentValues,
    ...updatedValues,
  };

  let dirty = false;
  if (deleted && currentValues.createdAfter) {
    dirty = false;
  } else {
    if (Array.isArray(value)) {
      dirty = deleted || !areArraysEqual(initialValue, value);
    } else {
      dirty = deleted || initialValue !== value;
    }
  }

  return {
    name,
    initialValue,
    value,
    validator,
    error,
    dirty,
    deleted,
    createdAfter: currentValues.createdAfter, // this cannot be updated
  };
}

export function cleanDeletedFields(fields) {
  return Object.keys(fields).reduce((newFields, field) => {
    const { ...updatedFields } = newFields;

    if (updatedFields[field].deleted) {
      delete updatedFields[field];
    }

    return updatedFields;
  }, fields);
}

export function resetFields(fields) {
  return Object.keys(fields).reduce((newFields, field) => {
    const { ...updatedFields } = newFields;

    if (updatedFields[field].deleted) {
      delete updatedFields[field];
      return updatedFields;
    }

    updatedFields[field].initialValue = updatedFields[field].value;
    updatedFields[field].dirty = false;
    updatedFields[field].createdAfter = false;

    return updatedFields;
  }, fields);
}

/**
 * Returns the parent fields for a given array of fields
 *
 * @param {Array} fields
 */
export function getParentFields(fields) {
  const parentFieldsWithoutFieldNames = fields.reduce((parentFields, field) => {
    const newParentFields = parentFields.slice();

    const matchArrayField = field.match(ARRAY_FIELD_REGEX);
    if (matchArrayField) {
      newParentFields.push(matchArrayField[0]);
      return newParentFields;
    }

    const matchObjectNotation = field.match(OBJECT_NOTATION_REGEX);
    if (matchObjectNotation) {
      newParentFields.push(matchObjectNotation[0]);
      return newParentFields;
    }

    newParentFields.push(field);
    return newParentFields;
  }, []);

  return [...new Set(parentFieldsWithoutFieldNames)];
}

/**
 * Check if a given field is an object
 *
 * @param {(string|Array)} field
 */
export function isObjectField(field) {
  return OBJECT_NOTATION_REGEX.test(field);
}

/**
 * Creates a new object according with a given object notation.
 *
 * @param {object} fields
 * @param {string} field
 *
 * @returns {object}
 */
export function createObjectFromNotation(fields, field) {
  const ARRAY_INDEX_REGEX = /^[0-9]$/;

  const fieldProperties = field.split(/\./);

  return fieldProperties.reverse().reduce((currentObject, prop, index) => {
    const { ...newField } = currentObject;

    // Check for a TMP property
    if (newField._TMP_) {
      const tmpValue = newField._TMP_;
      return { [prop]: tmpValue };
    }

    // Check if it's an array
    // Handle array field values in the first hand
    if (ARRAY_INDEX_REGEX.test(prop)) {
      const fieldValue = getArrayFieldValues(fields, field);
      return { _TMP_: [fieldValue] };
    }

    if (index === 0) {
      newField[prop] = fields[field].value;
      return newField;
    }

    return { [prop]: newField };
  }, {});
}

/**
 * Check if a given field is an array field.
 *
 * @param {(string|Array)} field
 */
export function isArrayField(field) {
  return field.match(ARRAY_FIELD_REGEX);
}

function getArrayFieldValues(fields, field) {
  const fieldsArray = Object.keys(fields);

  return fieldsArray.reduce((fieldValue, currentField) => {
    const { ...newFieldValue } = fieldValue;

    if (currentField.startsWith(field)) {
      const fieldName = currentField.split(/\./).pop();
      newFieldValue[fieldName] = fields[currentField].value;
    }

    return newFieldValue;
  }, {});
}

function areArraysEqual(initialArray, newArray) {
  if (!initialArray || !newArray || initialArray.length !== newArray.length) {
    return false;
  }

  let equal = true;
  initialArray.forEach(initialArrayValue => {
    if (!newArray.includes(initialArrayValue)) {
      equal = false;
    }
  });

  return equal;
}
