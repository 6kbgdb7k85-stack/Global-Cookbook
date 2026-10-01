import { Box, Button, Grid } from "@mui/material";
import FormField from "./FormField";

export default function FormWrapper({
  fields,
  colSpan,
  formData,
  formErrors,
  onSubmit,
  onChange,
  submitLabel
}) {
  return (
    <Box component={"form"} noValidate onSubmit={onSubmit}>
      <Grid container spacing={1} sx={{marginBottom: "1rem"}}>
        {fields.map((field) => (
          <Grid key={field.id + "-field"} size={field.colSpan || colSpan}>
            <FormField
              field={field}
              onChange={onChange}
              error={formErrors[field.id]}
              value={formData[field.id]}
            />
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" type="submit">{submitLabel}</Button>
    </Box>
  );
}
