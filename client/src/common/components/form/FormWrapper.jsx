import { Box, Button, Grid } from "@mui/material";
import FormField from "./FormField";

export default function FormWrapper({
  fields,
  colSpan = 12,
  formData,
  formErrors,
  onSubmit=(e)=>{},
  onChange,
  submitLabel,
  edit = false,
  noCancel=false,
  canEdit,
  setEdit=()=>{}
}) {

    function handleSubmit(e){
        e.preventDefault()
        onSubmit(e)
    }
    function handleCancel(e){
        setEdit(false)
        onSubmit(e,true)
    }

  return (
    <Box component={"form"} noValidate onSubmit={handleSubmit}>
      <Grid container spacing={1} sx={{ marginBottom: "1rem" }}>
        {fields.map((field) => (
          <Grid key={field.id + "-field"} size={field.colSpan || colSpan}>
            <FormField
              field={field}
              onChange={onChange}
              error={formErrors[field.id]}
              value={formData[field.id]}
              edit={field.alwaysEdit||edit}
            />
          </Grid>
        ))}
      </Grid>
      {edit ? (
        <>
          <Button key="submit-button" aria-label="submit-button" variant="contained" type="submit">
            {submitLabel||"Save"}
          </Button>
          {!noCancel ? <Button key="cancel-button" aria-label="cancel-button" onClick={handleCancel} variant="outlined">Cancel</Button> : <></>}
        </>
      ) : (
        <>{canEdit ? <Button key='edit-button' aria-label="edit-button" onClick={()=>setEdit(true)} variant="contained">Edit</Button> : <></>}</>
      )}
    </Box>
  );
}
