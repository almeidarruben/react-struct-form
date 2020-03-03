import deepMerge from 'deepmerge';
import {
  getParentFields,
  createObjectFromNotation,
  isArrayField,
  isObjectField,
} from './field';

/**
 * Check if a property is already in Dot Notation.
 * TODO: Use function from field.js
 *
 * @param {string} name Property to check
 */
function isObjectInDotNotation(name) {
  return name.split(/\./).length > 1;
}

/**
 * Rename array field property names to full object dot notation path
 *
 * @param {string} name
 * @param {object} field
 */
function renameArrayFieldPropertiesToDotNotation(name, field) {
  return field.map((fieldValue, index) => {
    return Object.keys(fieldValue).map(innerField => {
      return { [`${name}.${index}.${innerField}`]: fieldValue[innerField] };
    });
  });
}

/**
 * Decorate all object properties with a given property in Dot Notation.
 *
 * @param {object} obj Object with properties to be decorated
 * @param {string} prop Property to decorate with
 *
 * @returns {object}
 */
function decorateObjectPropertyNamesInDotNotation(obj, prop) {
  return Object.keys(obj).reduce((acc, curr) => {
    const { ...newObject } = acc;
    delete newObject[curr];

    return { [`${prop}.${curr}`]: acc[curr], ...newObject };
  }, obj);
}

function handleArrayValues(propertyName, obj, callback) {
  // Prevent empty array fields from being added.
  // Array fields can be added dynamically with form 'addField' function.
  if (obj.length === 0) {
    return;
  }

  if (typeof obj[0] === 'string') {
    // It's an array of strings or an empty array. There's no need to iterate
    // deeper we assign the value
    callback({ name: propertyName, value: obj });
  } else {
    if (Array.isArray(obj)) {
      // Check if arrayFieldProperties are dot notation already
      // TODO: We're checking just the first property. Do we need to check more?
      if (isObjectInDotNotation(Object.keys(obj[0])[0])) {
        iterateObjectDeep(obj, callback);
      } else {
        const renamedProperties = renameArrayFieldPropertiesToDotNotation(
          propertyName,
          obj,
        );
        iterateObjectDeep(renamedProperties, callback);
      }
    }
  }
}

function handleObjectValues(prop, obj, callback) {
  if (typeof prop === 'string') {
    // Handle deep objects
    // Rename the child property in other to generate full object path
    const newObject = decorateObjectPropertyNamesInDotNotation(obj, prop);
    iterateObjectDeep(newObject, callback);
  } else {
    iterateObjectDeep(prop, callback);
  }
}

/**
 * Iterate over all properties in the object and executes a callback on each
 * string values.
 *
 * @param {object} obj Object to iterate
 * @param {function} callback Function to be executed in every object value
 */
export function iterateObjectDeep(obj, callback) {
  const objectToIterate = Array.isArray(obj) ? obj : Object.keys(obj);

  objectToIterate.forEach(prop => {
    const propertyValue = obj[prop];
    const isPropertyAnObject = typeof prop === 'object';

    // String, Number, Boolean or Null we assign directly
    if (
      typeof propertyValue === 'string' ||
      typeof propertyValue === 'number' ||
      typeof propertyValue === 'boolean' ||
      propertyValue === null
    ) {
      // Assign the value
      callback({ name: prop, value: obj[prop] });
    } else {
      const isPropertyValueAnObject = typeof propertyValue === 'object';

      if (isPropertyAnObject || isPropertyValueAnObject) {
        const deepObject = isPropertyAnObject ? prop : propertyValue;

        if (Array.isArray(deepObject)) {
          handleArrayValues(prop, deepObject, callback);
        } else {
          handleObjectValues(prop, deepObject, callback);
        }
      }
    }
  });
}

/**
 * Check if there are fields marked as dirty
 *
 * @param {object[]} fields
 */
export function isFormDirty(fields) {
  return Boolean(Object.keys(fields).find(field => fields[field].dirty));
}

export function getFormData(fields) {
  const fieldsArray = Object.keys(fields);
  const groupedFields = getParentFields(fieldsArray);

  // Sort field in order to ensure the correct index order for array fields
  const sortedFields = groupedFields.sort();
  return sortedFields.reduce((formData, field) => {
    const { ...newFormData } = formData;

    if (isObjectField(field) || isArrayField(field)) {
      const newFieldObject = createObjectFromNotation(fields, field);
      return deepMerge(newFormData, newFieldObject);
    } else {
      const fieldValue = fields[field].value;
      newFormData[field] = fieldValue;
    }

    return newFormData;
  }, {});
}
