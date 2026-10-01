import { Button, Link, TextField, Typography, useFormControl } from "@mui/material";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import FormWrapper from "../form/FormWrapper";
import { loginFields, signupFields } from "./loginFields";
import compilePayload from "../../utils/compilePayload";
import useFetch from "../../utils/useFetch";

const initFormData = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function LoginSignup() {
  const [signup, setSignup] = useState(false);
  const [formData, setFormData] = useState(initFormData);
  const { setUser } = useOutletContext();

  const {response:loginResponse,loading:loginLoading,error:loginError,setError:setLoginError,runFetch:runLogin}=useFetch('login','POST',false)
  const {response:signupResponse,loading:setSignupResponse,error:signupError,setError:setSignupError,runFetch:runSignup}=useFetch('signup','POST',false)

  function handleChange(e) {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [e.target.name]: e.target.value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if(signup){
        runSignup(compilePayload(formData,signupFields))
    }else{
        runLogin(compilePayload(formData,loginFields))
    }
  }

  function switchMode(){
    setSignup(prevSignup=>!prevSignup)
    setFormData(initFormData)
  }

  function compileModeSwitchMethod() {
    if (signup) {
      return <>Already have an account? Click <Link onClick={switchMode}>here</Link> to login.</>;
    }
    return <>Don't have an account? Click <Link onClick={switchMode}>here</Link> to create an account.</>;
  }

  return (
    <>
      <FormWrapper
        fields={signup ? signupFields : loginFields}
        colSpan={12}
        formData={formData}
        formErrors={{}}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitLabel={"Login"}
      />
      <Typography variant="body1">{compileModeSwitchMethod()}</Typography>
    </>
  );
}
