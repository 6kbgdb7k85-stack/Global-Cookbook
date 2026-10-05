import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function DialogWrapper({ title, message, open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <IconButton
        sx={{ position: "absolute", right: 8, top: 8 }}
        id="close-button"
        onClick={onClose}
      >
        <CloseIcon/>
      </IconButton>
      <DialogContent dividers>
        <Typography gutterBottom>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button id="ok-button" name="confirm" onClick={onClose}>
          OK
        </Button>
        <Button autoFocus id="cancel-button" name="cancel" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
