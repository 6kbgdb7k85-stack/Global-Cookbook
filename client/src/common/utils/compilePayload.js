export default function compilePayload(data, fields) {
  const payload = {};
  fields.forEach((field) => {
    if (!field.uiOnly) {
      payload[field.id] = data[field.id];
    }
  });
  return payload;
}
