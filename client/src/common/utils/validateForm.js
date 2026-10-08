import capitalizeWord from "./capitalizeWord";

function validateField(field, value, formData) {
    const errors = [];
    if (field.required && !value) {
      errors.push(`${capitalizeWord(field.id)} is required.`);
    }
    if (field.validation && !field.validation(formData, value)) {
      errors.push(field.validationMessage || "Invalid value.");
    }
    return errors.length > 0 ? errors : null;
  }

export default function validateForm(formData, fields, changeEvent) {
    const newErrors = { };
    fields.forEach((field) => {
      if (field.id == changeEvent.name) {
        newErrors[field.id] = validateField(field, changeEvent.value, formData);
      } else {
        newErrors[field.id] = validateField(
          field,
          formData[field.id],
          formData,
        );
      }
    });
    Object.entries(newErrors).forEach(([key, val]) => {
      if (val === null) {
        delete newErrors[key];
      }
    });
    return newErrors
  }