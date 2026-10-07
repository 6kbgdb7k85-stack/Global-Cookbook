import {
  Button,
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

const initFormData = {
  username: "",
  email: "",
  password: "",
  confirm_pass: "",
};

export default function LoginSignup() {
  const [signup, setSignup] = useState(false);
  const [formData, setFormData] = useState(initFormData);
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

  function handleChange({name,value}) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  }

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
    setSignupError(null)
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
        formErrors={signupError?.field_error||{}}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel={signup?"Create Account":"Login"}
        edit={true}
        noCancel
      />
      <Typography variant="body1">{compileModeSwitchMethod()}</Typography>
    </>
  );
}
