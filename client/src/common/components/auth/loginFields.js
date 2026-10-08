import { FIELD_TYPES } from "../../constants";

export const loginFields = [
  { id: "email", label: "Email", type: FIELD_TYPES.EMAIL, required: true },
  {
    id: "password",
    label: "Password",
    type: FIELD_TYPES.PASSWORD,
    required: true,
  },
];

export const signupFields = [
  { id: "email", label: "Email", type: FIELD_TYPES.EMAIL, required: true },
  { id: "username", label: "Username", type: FIELD_TYPES.TEXT, required: true },
  {
    id: "password",
    label: "Password",
    type: FIELD_TYPES.PASSWORD,
    required: true,
  },
  {
    id: "confirm_pass",
    label: "Confirm Password",
    type: FIELD_TYPES.PASSWORD,
    required: true,
    uiOnly: true,
    validation: (formData, value) => formData.password == value,
    validationMessage: "Passwords must match."
  },
];
