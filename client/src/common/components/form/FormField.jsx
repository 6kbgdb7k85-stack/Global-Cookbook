import {
  FormControlLabel,
  IconButton,
  InputAdornment,
  Skeleton,
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
  loading
}) {
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    onChange({
      name: e.target.name,
      value: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
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

  if (loading){
    return <Skeleton variant="rectangle" width={"100%"} height={25}/>
  }

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
          control={
            <Switch
              checked={value}
              id={field.id}
              name={field.id}
              onChange={handleChange}
            />
          }
        />
      );
    case FIELD_TYPES.TEXTAREA:
      if (!edit || field.readonly) {
        return <Typography variant={field.size}>{value}</Typography>;
      }
      return (
        <TextField
          {...standardProps}
          multiline
          rows={4}
          sx={{ width: "100%" }}
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
