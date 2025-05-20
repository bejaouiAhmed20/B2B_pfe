import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Slide,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { usePopup } from '../contexts/PopupContext';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function PopupManager() {
  const { popups, loading, showPopups, resetTrigger } = usePopup();
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [hasShownPopups, setHasShownPopups] = useState(false);

  // Show popup when triggered or automatically if not shown before
  useEffect(() => {
    // If popups are explicitly triggered (after login)
    if (showPopups && popups.length > 0 && !loading) {
      showNextPopup();
      setHasShownPopups(true);
    }
    // If popups haven't been shown yet and we're not waiting for a trigger
    else if (!hasShownPopups && popups.length > 0 && !loading && !showPopups) {
      showNextPopup();
      setHasShownPopups(true);
    }
  }, [popups, loading, showPopups, hasShownPopups]);

  // Function to show the next available popup
  const showNextPopup = () => {
    // Find the first popup that hasn't been seen yet
    let nextIndex = currentPopupIndex;
    let foundUnseen = false;

    while (nextIndex < popups.length && !foundUnseen) {
      const popupId = popups[nextIndex].id;
      const lastSeen = localStorage.getItem(`popup_${popupId}_lastSeen`);

      if (!lastSeen) {
        foundUnseen = true;
        setCurrentPopupIndex(nextIndex);
        setOpen(true);
        break;
      }

      nextIndex++;
    }

    // If we've gone through all popups and they've all been seen
    if (!foundUnseen && showPopups) {
      // If triggered after login, show the first popup anyway
      setCurrentPopupIndex(0);
      setOpen(true);
    }
  };

  const handleClose = () => {
    // Record that we've seen this popup
    if (popups.length > 0) {
      const popupId = popups[currentPopupIndex].id;
      localStorage.setItem(`popup_${popupId}_lastSeen`, new Date().toISOString());
    }

    setOpen(false);

    // Check if there are more popups to show
    if (currentPopupIndex < popups.length - 1) {
      setTimeout(() => {
        setCurrentPopupIndex(currentPopupIndex + 1);
        showNextPopup();
      }, 500);
    } else {
      // Reset the trigger when all popups have been shown
      resetTrigger();
    }
  };

  // If no popups or still loading, don't render anything
  if (popups.length === 0 || loading || currentPopupIndex >= popups.length) {
    return null;
  }

  const currentPopup = popups[currentPopupIndex];

  // Get icon based on popup type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'success':
        return <SuccessIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  // Get color based on popup type
  const getTypeColor = (type) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="popup-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getTypeIcon(currentPopup.type)}
          <Typography variant="h6">{currentPopup.title}</Typography>
        </Box>
        <Box>
          <Chip
            label={currentPopup.type}
            color={getTypeColor(currentPopup.type)}
            size="small"
            sx={{ mr: 1 }}
          />
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentPopup.image_url && (
            <Box sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              mt: 1,
              mb: 1
            }}>
              <img
                src={currentPopup.image_url.startsWith('http')
                  ? currentPopup.image_url
                  : `http://localhost:5000${currentPopup.image_url}`}
                alt={currentPopup.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
              />
            </Box>
          )}
          <Typography
            variant="body1"
            id="popup-description"
            sx={{
              whiteSpace: 'pre-line',
              '& a': { color: 'primary.main' }
            }}
            dangerouslySetInnerHTML={{ __html: currentPopup.content }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{
        borderTop: 1,
        borderColor: 'divider',
        pt: 1,
        pb: 1,
        px: 2,
        justifyContent: currentPopup.button_text ? 'space-between' : 'flex-end'
      }}>
        {currentPopup.button_text && currentPopup.button_link && (
          <Button
            variant="contained"
            color="primary"
            href={currentPopup.button_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {currentPopup.button_text}
          </Button>
        )}
        <Button onClick={handleClose} color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PopupManager;
