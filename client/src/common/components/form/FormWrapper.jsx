import { Box, Button, Grid } from "@mui/material";
import FormField from "./FormField";
import { useOutletContext } from "react-router";
import { useEffect, useState } from "react";

export default function FormWrapper({
  fields,
  colSpan = 12,
  formData,
  formErrors,
  onSubmit = (e) => {e.preventDefault()},
  onChange,
  submitLabel,
  edit = false,
  noCancel = false,
  canEdit,
  setEdit = () => {},
  loading = false,
}) {
  const [valid,setValid]=useState(false)

  const { user } = useOutletContext();

  useEffect(()=>{
    setValid(formErrors&&Object.entries(formErrors).length==0)
  },[formErrors])

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(e);
  }
  function handleCancel(e) {
    setEdit(false);
    onSubmit(e, true);
  }

  

  return (
    <Box component={"form"} noValidate onSubmit={handleSubmit}>
      <Grid container spacing={1} sx={{ marginBottom: "1rem" }}>
        {fields.map((field) => (
          <Grid key={field.id + "-field"} size={field.colSpan || colSpan}>
            {(field.visibilityRestriction !== "creator" ||
              !formData.user ||
              formData.user.id === user?.id) && (
              <FormField
                field={field}
                onChange={onChange}
                error={formErrors?.[field.id]}
                value={formData[field.id]}
                edit={field.alwaysEdit || edit}
                loading={loading}
              />
            )}
          </Grid>
        ))}
      </Grid>
      {!loading && (
        <>
          {edit ? (
            <>
              <Button
                key="submit-button"
                aria-label="submit-button"
                variant="contained"
                type="submit"
                disabled={!valid}
                sx={{mr:1}}
              >
                {submitLabel || "Save"}
              </Button>
              {!noCancel ? (
                <Button
                  key="cancel-button"
                  aria-label="cancel-button"
                  onClick={handleCancel}
                  variant="outlined"
                >
                  Cancel
                </Button>
              ) : (
                <></>
              )}
            </>
          ) : (
            <>
              {canEdit ? (
                <Button
                  key="edit-button"
                  aria-label="edit-button"
                  onClick={() => setEdit(true)}
                  variant="contained"
                >
                  Edit
                </Button>
              ) : (
                <></>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}
