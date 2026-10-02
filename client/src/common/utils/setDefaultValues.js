import { FIELD_TYPES } from "../constants";

export function setDefaultValues(fields) {
  const obj = {};
  fields.forEach((field) => {
    obj[field.id] = setDefault(field);
  });
  return obj;
}

export function setDefault(field) {
  if (field.defaultNull) {
    return null;
  }
  if (field.type === FIELD_TYPES.NUMBER) {
    return 0;
  } else if (field.type === FIELD_TYPES.SWITCH) {
    return false;
  }
  return "";
}
