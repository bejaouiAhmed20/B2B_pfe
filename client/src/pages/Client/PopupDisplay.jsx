import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Dialog, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box,
  IconButton,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PopupDisplay = () => {
  const [popups, setPopups] = useState([]);
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [showDots, setShowDots] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClientHomePage, setIsClientHomePage] = useState(false);

  // Define fetchActivePopups before using it in useEffect
  // Inside your fetchActivePopups function, after setting popups
  const fetchActivePopups = useCallback(async () => {
    try {
      // Try to get either token
      const token = localStorage.getItem('token') || localStorage.getItem('clientToken');
      
      // Make the request without requiring authentication
      const response = await axios.get('http://localhost:5000/api/popups/active');
      console.log('Fetched popups:', response.data);
      
      // Log image URLs to debug
      if (response.data && response.data.length > 0) {
        response.data.forEach(popup => {
          console.log('Popup data:', popup);
          if (popup.image_url) {
            console.log('Image URL:', popup.image_url);
          } else {
            console.log('No image URL for this popup');
          }
        });
        
        // Mark popup as shown for this login session
        const currentLoginId = localStorage.getItem('loginTimestamp');
        if (currentLoginId) {
          localStorage.setItem('popupShownThisSession', currentLoginId);
        }
      }
      
      setPopups(response.data);
    } catch (error) {
      console.error('Error fetching active popups:', error);
    }
  }, []);

  useEffect(() => {
    if (popups.length > 0) {
      setOpen(true);
      setShowDots(popups.length > 1);
    }
  }, [popups]);

  useEffect(() => {
    // Check if we're on the client home page
    const checkIfClientHomePage = () => {
      const path = window.location.pathname;
      // Updated path conditions to match your client home page
      return path === '/client/dashboard' || path === '/client/home' || path === '/client';
    };
    
    setIsClientHomePage(checkIfClientHomePage());

    // Check for authentication
    const checkAuth = () => {
      const token = localStorage.getItem('token'); // Check standard token
      const clientToken = localStorage.getItem('clientToken'); // Check client token
      
      // Utiliser un identifiant unique pour chaque session de connexion
      const currentLoginId = localStorage.getItem('loginTimestamp');
      
      // Vérifier si le popup a déjà été affiché pour cette session de navigation
      const popupShownThisSession = localStorage.getItem('popupShownThisSession');
      
      if ((token || clientToken) && checkIfClientHomePage() && 
          (!popupShownThisSession || popupShownThisSession !== currentLoginId)) {
        setIsAuthenticated(true);
        // Delay popup appearance for better user experience
        const timer = setTimeout(() => {
          fetchActivePopups();
          // Marquer le popup comme affiché pour cette session de connexion spécifique
          if (currentLoginId) {
            localStorage.setItem('popupShownThisSession', currentLoginId);
          }
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    };
    
    // Run checkAuth when the component mounts and when the path changes
    checkAuth();
    
    // Listen for storage events (like login/logout)
    window.addEventListener('storage', checkAuth);
    
    // Add a more robust way to detect route changes in React
    const handleRouteChange = () => {
      const isHomePage = checkIfClientHomePage();
      setIsClientHomePage(isHomePage);
      if (isHomePage) {
        checkAuth();
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    // Also check when the component mounts
    handleRouteChange();
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [fetchActivePopups]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleNext = () => {
    if (currentPopupIndex < popups.length - 1) {
      setCurrentPopupIndex(currentPopupIndex + 1);
    } else {
      setOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentPopupIndex > 0) {
      setCurrentPopupIndex(currentPopupIndex - 1);
    }
  };

  const handleDotClick = (index) => {
    setCurrentPopupIndex(index);
  };

  const handleButtonClick = (link) => {
    window.open(link, '_blank');
  };

  // Don't render anything if no popups or not open
  if (popups.length === 0 || !open) {
    return null;
  }

  const currentPopup = popups[currentPopupIndex];
  const popupType = currentPopup.type || 'info';
  
  // Define colors based on popup type
  const getTypeColor = (type) => {
    switch(type) {
      case 'warning': return '#ff9800';
      case 'error': return '#f44336';
      case 'success': return '#4caf50';
      default: return '#2196f3'; // info
    }
  };

  const typeColor = getTypeColor(popupType);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={500}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box sx={{ height: '8px', backgroundColor: typeColor }} />
        
        <IconButton 
          aria-label="close" 
          onClick={handleClose}
          sx={{ 
            position: 'absolute', 
            right: 8, 
            top: 8, 
            color: 'grey.500',
            zIndex: 1
          }}
        >
          <CloseIcon />
        </IconButton>
        
        {popups.length > 1 && (
          <>
            <IconButton
              disabled={currentPopupIndex === 0}
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                zIndex: 1
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              disabled={currentPopupIndex === popups.length - 1}
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                zIndex: 1
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </>
        )}
        
        <DialogContent sx={{ p: 3, pt: 4 }}>
          {currentPopup.image_url ? (
            <Box textAlign="center" mb={3}>
              <img 
                src={currentPopup.image_url.startsWith('http') 
                  ? currentPopup.image_url 
                  : `http://localhost:5000/uploads/popups/${currentPopup.image_url.split('/').pop()}`} 
                alt={currentPopup.title}
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  objectFit: 'contain'
                }} 
                onError={(e) => {
                  console.error("Image loading error details:", {
                    src: e.target.src,
                    originalSrc: currentPopup.image_url
                  });
                  e.target.onerror = null; 
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+non+disponible';
                }}
              />
            </Box>
          ) : (
            // Afficher un placeholder si aucune image n'est disponible
            <Box textAlign="center" mb={3}>
              <div 
                style={{ 
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#aaa'
                }}
              >
                Aucune image
              </div>
            </Box>
          )}
          
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: typeColor
            }}
          >
            {currentPopup.title}
          </Typography>
          
          <Box sx={{ 
            mt: 2, 
            '& a': { color: typeColor },
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: '4px' }
          }}>
            <div dangerouslySetInnerHTML={{ __html: currentPopup.content }} />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'space-between' }}>
          <Box>
            {showDots && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {popups.map((_, index) => (
                  <Box 
                    key={index}
                    onClick={() => handleDotClick(index)}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: index === currentPopupIndex ? typeColor : 'grey.300',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              onClick={handleClose}
              sx={{ color: 'grey.600' }}
            >
              Fermer
            </Button>
            
            {currentPopup.button_text && currentPopup.button_link && (
              <Button 
                variant="contained" 
                onClick={() => handleButtonClick(currentPopup.button_link)}
                sx={{ 
                  backgroundColor: typeColor,
                  '&:hover': {
                    backgroundColor: typeColor,
                    filter: 'brightness(0.9)'
                  }
                }}
              >
                {currentPopup.button_text}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default PopupDisplay;