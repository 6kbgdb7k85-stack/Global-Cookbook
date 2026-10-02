import {
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { FIELD_TYPES, MUI_TYPOGRAPHY_SIZES } from "../../constants";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function FormField({
  field,
  value,
  onChange = () => {},
  error,
  onBlur = () => {},
  edit = false,
}) {
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    onChange(e, field.type===FIELD_TYPES.SWITCH);
  }

  function toggleVisibility() {
    setShowPass((prevShow) => !prevShow);
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
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleVisibility}>
                    {showPass ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: "100%" }}
        />
      );
    case FIELD_TYPES.SWITCH:
      if (!edit || field.readonly) {
        return <Typography variant={field.size}>{value}</Typography>;
      }
      return (
        <FormControlLabel
          label={field.label}
          control={<Switch checked={value===true||value==="true"} id={field.id} name={field.id} onChange={handleChange} />}
        />
      );
    default:
      if (!edit || field.readonly) {
        return <Typography variant={field.size}>{value}</Typography>;
      }
      return (
        <TextField
          {...standardProps}
          type={field.type || "text"}
          sx={{ width: "100%" }}
        />
      );
  }
}
