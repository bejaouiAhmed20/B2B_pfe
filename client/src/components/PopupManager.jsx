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
  Error as ErrorIcon,
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  CloseFullscreen as CloseAllIcon
} from '@mui/icons-material';
import { usePopup } from '../contexts/PopupContext';
import './PopupManager.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function PopupManager() {
  const { popups, loading, showPopups, resetTrigger } = usePopup();
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [hasShownPopups, setHasShownPopups] = useState(false);
  const [availablePopups, setAvailablePopups] = useState([]);

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
      // Get all available popups (both seen and unseen)
      setAvailablePopups(popups);
      setCurrentPopupIndex(0);
      setOpen(true);
      setHasShownPopups(true);
    }
  }, [popups, loading, showPopups, isLoginPage]);

  // Navigation functions
  const goToPreviousPopup = () => {
    if (currentPopupIndex > 0) {
      setCurrentPopupIndex(currentPopupIndex - 1);
    }
  };

  const goToNextPopup = () => {
    if (currentPopupIndex < availablePopups.length - 1) {
      setCurrentPopupIndex(currentPopupIndex + 1);
    }
  };

  // Function to close current popup and show next
  const closeCurrentAndShowNext = () => {
    const currentPopup = availablePopups[currentPopupIndex];
    if (currentPopup) {
      // Mark current popup as seen
      localStorage.setItem(`popup_${currentPopup.id}_lastSeen`, new Date().toISOString());
    }

    // If there are more popups, show the next one
    if (currentPopupIndex < availablePopups.length - 1) {
      setCurrentPopupIndex(currentPopupIndex + 1);
    } else {
      // No more popups, close the dialog
      handleCloseAll();
    }
  };

  // Function to close current popup only
  const handleClose = () => {
    closeCurrentAndShowNext();
  };

  // Function to close all popups
  const handleCloseAll = () => {
    // Mark all popups as seen
    availablePopups.forEach(popup => {
      localStorage.setItem(`popup_${popup.id}_lastSeen`, new Date().toISOString());
    });

    setOpen(false);
    resetTrigger();
  };

  // If no popups, still loading, on login page, or invalid index, don't render anything
  if (availablePopups.length === 0 || loading || isLoginPage || currentPopupIndex >= availablePopups.length) {
    return null;
  }

  const currentPopup = availablePopups[currentPopupIndex];

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
        <Box className="popup-header-actions">
          <Chip
            label={currentPopup.type}
            color={getTypeColor(currentPopup.type)}
            size="small"
          />
          {availablePopups.length > 1 && (
            <Typography variant="caption" className="popup-header-counter">
              {currentPopupIndex + 1} sur {availablePopups.length}
            </Typography>
          )}
          <IconButton
            aria-label="close all"
            onClick={handleCloseAll}
            size="small"
            color="error"
            title="Fermer tout"
            className="popup-navigation-button"
          >
            <CloseAllIcon />
          </IconButton>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            size="small"
            className="popup-navigation-button"
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
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
        </Box>

        {/* Navigation buttons (only show if more than 1 popup) */}
        {availablePopups.length > 1 && (
          <Box className="popup-navigation">
            <IconButton
              onClick={goToPreviousPopup}
              disabled={currentPopupIndex === 0}
              size="small"
              title="Précédent"
              className="popup-navigation-button"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body2" className="popup-counter">
              {currentPopupIndex + 1} / {availablePopups.length}
            </Typography>
            <IconButton
              onClick={goToNextPopup}
              disabled={currentPopupIndex === availablePopups.length - 1}
              size="small"
              title="Suivant"
              className="popup-navigation-button"
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {availablePopups.length > 1 && (
            <Button
              onClick={handleCloseAll}
              color="error"
              variant="outlined"
              size="small"
              className="popup-close-all-button"
            >
              Fermer tout
            </Button>
          )}
          
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default PopupManager;
