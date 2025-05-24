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

  // Check if we're on a login page to prevent showing popups there
  const location = window.location.pathname;
  const isLoginPage = location === '/login' || location === '/login-client';

  // Show popup ONLY when explicitly triggered (after login)
  useEffect(() => {
    // Don't show popups on login pages
    if (isLoginPage) {
      console.log('On login page, not showing popups');
      return;
    }

    // Only show popups when explicitly triggered (after login)
    if (showPopups && popups.length > 0 && !loading) {
      console.log('Showing popups after login trigger');
      showNextPopup();
      setHasShownPopups(true);
    }
    // Remove the automatic display without trigger
  }, [popups, loading, showPopups, isLoginPage]);

  // Function to show the next available popup
  const showNextPopup = () => {
    console.log('showNextPopup called, current index:', currentPopupIndex);

    // Create an array of popup indices that haven't been seen yet
    const unseenPopups = [];

    // Check all popups to find unseen ones
    for (let i = 0; i < popups.length; i++) {
      const popupId = popups[i].id;
      const lastSeen = localStorage.getItem(`popup_${popupId}_lastSeen`);

      if (!lastSeen) {
        unseenPopups.push(i);
      }
    }

    console.log('Unseen popups:', unseenPopups);

    // If we have unseen popups, show the first one
    if (unseenPopups.length > 0) {
      const nextIndex = unseenPopups[0];
      console.log('Showing unseen popup at index:', nextIndex);
      setCurrentPopupIndex(nextIndex);
      setOpen(true);
    }
    // If all popups have been seen but we're triggered after login
    else if (showPopups && !hasShownPopups) {
      console.log('All popups seen, but showing first one after login');
      // Reset all "seen" statuses in localStorage
      popups.forEach(popup => {
        localStorage.removeItem(`popup_${popup.id}_lastSeen`);
      });

      // Show the first popup
      setCurrentPopupIndex(0);
      setOpen(true);
    }
    // If all popups have been seen and we've already shown popups in this session
    else {
      console.log('All popups seen and already shown in this session, resetting trigger');
      resetTrigger();
    }
  };

  const handleClose = () => {
    console.log('handleClose called for popup index:', currentPopupIndex);

    // Record that we've seen this popup
    if (popups.length > 0) {
      const popupId = popups[currentPopupIndex].id;
      localStorage.setItem(`popup_${popupId}_lastSeen`, new Date().toISOString());
    }

    setOpen(false);

    // Find all unseen popups
    const unseenPopups = [];
    for (let i = 0; i < popups.length; i++) {
      // Skip the current popup we just closed
      if (i === currentPopupIndex) continue;

      const popupId = popups[i].id;
      const lastSeen = localStorage.getItem(`popup_${popupId}_lastSeen`);
      if (!lastSeen) {
        unseenPopups.push(i);
      }
    }

    console.log('Remaining unseen popups:', unseenPopups);

    // If there are no more unseen popups, reset the trigger
    if (unseenPopups.length === 0) {
      console.log('No more unseen popups, resetting trigger');
      resetTrigger();
      return;
    }

    // Show the next unseen popup
    const nextIndex = unseenPopups[0];
    console.log('Showing next unseen popup at index:', nextIndex);

    // Use setTimeout to avoid immediate reopening
    setTimeout(() => {
      setCurrentPopupIndex(nextIndex);
      setOpen(true);
    }, 500);
  };

  // If no popups, still loading, on login page, or invalid index, don't render anything
  if (popups.length === 0 || loading || isLoginPage || currentPopupIndex >= popups.length) {
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
                  : `http://localhost:5000${currentPopup.image_url.startsWith('/') ? '' : '/'}${currentPopup.image_url}`}
                alt={currentPopup.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '4px'
                }}
                onError={(e) => {
                  console.error('Image loading error:', currentPopup.image_url);
                  e.target.style.display = 'none';
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
