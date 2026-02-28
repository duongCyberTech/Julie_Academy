import { 
    Modal,
    Box,
    Button,
    Typography,
    Divider
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function ConfirmAction({ title, content, btnContent, open, setOpen, action, actionParams = [], btnColor = "primary", startIcon = null }) {
  return (
    <div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {content}
          </Typography>

          <Divider variant="middle" sx={{mt: 2}} />

          <Box
            sx={{
                mt: 4,
                display: "flex",
                justifyContent: "space-between"
            }}
          >
            <Button
                variant="outlined" color="error"
                startIcon={<CloseIcon />}
                onClick={() => setOpen(false)}
            >Hủy</Button>

            <Button
                variant="contained" color={btnColor}
                startIcon={startIcon}
                onClick={() => action(...actionParams)}
            >{btnContent}</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}