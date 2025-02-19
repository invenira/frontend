import { IAPsList } from '@/components';
import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { CreateIAP } from '@/components/CreateIAP.tsx';

export const IAPs = () => {
  const [openCreateIapDialog, setOpenCreateIapDialog] = useState(false);

  const handleClickOpen = () => {
    setOpenCreateIapDialog(true);
  };

  const handleClose = () => {
    setOpenCreateIapDialog(false);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 3,
          mb: 1,
        }}
      >
        <Button onClick={handleClickOpen}>New IAP</Button>
      </Box>

      <IAPsList />

      <Dialog fullScreen open={openCreateIapDialog} onClose={handleClose}>
        <DialogTitle>Create new IAP</DialogTitle>
        <DialogContent>
          <CreateIAP onSuccess={handleClose} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
