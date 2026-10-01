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
}) {
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    onChange(e);
  }

  function toggleVisibility(){
    setShowPass(prevShow=>!prevShow)
  }

  switch (field.type) {
    case FIELD_TYPES.PASSWORD:
      return (
        <TextField
          id={field.id}
          name={field.id}
          label={field.label}
          type={showPass ? "text" : "password"}
          value={value}
          error={error}
          helperText={error}
          onChange={handleChange}
          required={field.required}
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
          id={field.id}
          name={field.id}
          label={field.label}
          type={field.type || "text"}
          value={value}
          error={error}
          helperText={error}
          onChange={handleChange}
          required={field.required}
          sx={{width:'100%'}}
        />
      );
  }
}
