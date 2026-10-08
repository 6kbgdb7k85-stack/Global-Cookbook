import {
  Button,
  keyframes,
  Link,
  TextField,
  Typography,
  useFormControl,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import FormWrapper from "../form/FormWrapper";
import { loginFields, signupFields } from "./loginFields";
import compilePayload from "../../utils/compilePayload";
import useFetch from "../../utils/useFetch";
import capitalizeWord from "../../utils/capitalizeWord";

const initFormData = {
  username: "",
  email: "",
  password: "",
  confirm_pass: "",
};

export default function LoginSignup() {
  const [signup, setSignup] = useState(false);
  const [formData, setFormData] = useState(initFormData);
  const [formErrors, setFormErrors] = useState(null);
  const { setUser } = useOutletContext();

  const {
    response: loginResponse,
    loading: loginLoading,
    error: loginError,
    setError: setLoginError,
    runFetch: runLogin,
  } = useFetch("login", "POST", false);
  const {
    response: signupResponse,
    loading: setSignupResponse,
    error: signupError,
    setError: setSignupError,
    runFetch: runSignup,
  } = useFetch("signup", "POST", false);

  useEffect(() => {
    if (loginResponse) {
      setUser(loginResponse.user);
      localStorage.setItem("token", loginResponse.token);
    }
  }, [loginResponse]);

  useEffect(() => {
    if (signupResponse) {
      setUser(signupResponse.user);
      localStorage.setItem("token", signupResponse.token);
    }
  }, [signupResponse]);

  useEffect(() => {
    if (signupError) {
      setFormErrors(signupError.field_error);
    }
  }, [signupError]);

  useEffect(() => {
    if (loginError) {
      if (loginError.field_error) {
        setFormErrors(loginError.field_error);
      } else {
        console.log(loginError);
      }
    }
  }, [loginError]);

  function handleChange({ name, value }) {
    const field = signup
      ? signupFields.find((field) => field.id === name)
      : loginFields.find((field) => field.id === name);
    const newFormData = {...formData}
    newFormData[name]=value
    setFormData(newFormData);
    validateForm(newFormData, field, { name, value });
  }

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

  function validateForm(formData, field, changeEvent) {
    const newErrors = { ...formErrors };
    const fields = signup ? signupFields : loginFields;
    fields.forEach((field) => {
      if (field.id == changeEvent.name) {
        newErrors[field.id]=validateField(field,changeEvent.value,formData)
      }else{
        newErrors[field.id]=validateField(field,formData[field.id],formData)
      }
    });
    // if (field.required) {
    //   newErrors[field.id] = newValue
    //     ? null
    //     : [`${capitalizeWord(field.id)} is required`];
    // }
    // if (field.validation) {
    //   newErrors[field.id] = field.validation(formData, newValue)
    //     ? null
    //     : [field.validationMessage || "Field invalid"];
    // }
    Object.entries(newErrors).forEach(([key, val]) => {
      if (val === null) {
        delete newErrors[key];
      }
    });
    setFormErrors(newErrors);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (signup) {
      runSignup(compilePayload(formData, signupFields));
    } else {
      runLogin(compilePayload(formData, loginFields));
    }
  }

  function switchMode() {
    setSignup((prevSignup) => !prevSignup);
    setFormData(initFormData);
    setFormErrors({})
  }

  function compileModeSwitchMethod() {
    if (signup) {
      return (
        <>
          Already have an account? Click <Link onClick={switchMode}>here</Link>{" "}
          to login.
        </>
      );
    }
    return (
      <>
        Don't have an account? Click <Link onClick={switchMode}>here</Link> to
        create an account.
      </>
    );
  }

  return (
    <>
      <FormWrapper
        fields={signup ? signupFields : loginFields}
        colSpan={12}
        formData={formData}
        formErrors={formErrors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel={signup ? "Create Account" : "Login"}
        edit={true}
        noCancel
      />
      <Typography variant="body1">{compileModeSwitchMethod()}</Typography>
    </>
  );
}
