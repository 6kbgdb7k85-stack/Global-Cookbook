import { IconButton, InputAdornment, TextField } from "@mui/material";
import { FIELD_TYPES } from "../../constants";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function FormField({
  field,
  value,
  onChange = () => {},
  error,
  inTable = false,
  onBlur=()=>{}
}) {
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    onChange(e);
  }

  function toggleVisibility(){
    setShowPass(prevShow=>!prevShow)
  }

  const standardProps = {
    id: field.id,
    name: field.id,
    label: field.label,
    value,
    error,
    helperText: error,
    onChange: handleChange,
    onBlur,
    required: field.required,
  };

  switch (field.type) {
    case FIELD_TYPES.PASSWORD:
      return (
        <TextField
          {...standardProps}
          type={showPass ? "text" : "password"}
          slotProps={{
            input:{
                endAdornment:(
                    <InputAdornment position="end"><IconButton onClick={toggleVisibility}>{showPass?<VisibilityOff/>:<Visibility/>}</IconButton></InputAdornment>
                )
            }
          }}
          sx={{width:"100%"}}
        />
      );
    default:
      return (
        <TextField
          {...standardProps}
          type={field.type || "text"}
          sx={{width:'100%'}}
        />
      );
  }
}
