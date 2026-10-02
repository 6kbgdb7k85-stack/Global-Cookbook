import { FIELD_TYPES } from "../constants";
import { setDefault } from "./setDefaultValues";

export default function compilePayload(data, fields) {
  const payload = {};
  fields.forEach((field) => {
    if (!field.uiOnly) {
      payload[field.id] = data[field.id]||setDefault(field);
    }
  });
  return payload;
}

