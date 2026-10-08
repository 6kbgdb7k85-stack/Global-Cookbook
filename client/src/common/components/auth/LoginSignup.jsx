import {
  Link, Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import FormWrapper from "../form/FormWrapper";
import { loginFields, signupFields } from "./loginFields";
import compilePayload from "../../utils/compilePayload";
import useFetch from "../../utils/useFetch";
import { ALERT_TIME } from "../../constants";
import validateForm from "../../utils/validateForm";

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
  const { setUser, addAlert } = useOutletContext();

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
        addAlert({
          severity: "error",
          message: loginError.alert_error,
          id: crypto.randomUUID(),
          timeRemaining: ALERT_TIME,
        });
      }
    }
  }, [loginError]);

  function handleChange({ name, value }) {
    const field = signup
      ? signupFields.find((field) => field.id === name)
      : loginFields.find((field) => field.id === name);
    const newFormData = { ...formData };
    newFormData[name] = value;
    setFormData(newFormData);
    setFormErrors(validateForm(newFormData, signup ? signupFields : loginFields, { name, value }));
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
    setFormErrors({});
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
