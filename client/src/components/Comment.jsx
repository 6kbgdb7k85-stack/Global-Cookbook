import { Box, Grid, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function Comment({ comment }) {

  return (
    <Box sx={{ mt: "1rem" }}>
      <Grid container spacing={0}>
        <Grid size={11}>
          <Stack direction={"row"}>
            <Typography variant="body1">{comment.user?.username||'unknown_user'} {comment.created_time}</Typography>
          </Stack>
        </Grid>
        <Grid size={1} sx={{ textAlign: "right" }}>
          <IconButton size={"small"}>
            <MoreVertIcon fontSize="inherit" />
          </IconButton>
        </Grid>
        <Grid size={11}>
          <Typography variant="body2">{comment.text}</Typography>
        </Grid>
        <Grid size={1} />
      </Grid>
    </Box>
  );
}
