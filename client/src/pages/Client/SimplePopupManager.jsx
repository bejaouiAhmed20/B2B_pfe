import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SimplePopupManager = () => {
  const [popups, setPopups] = useState([]);
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState({});

  useEffect(() => {
    // Fetch active popups
    const fetchActivePopups = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/popups/active');
        console.log('Fetched popups:', response.data);
        setPopups(response.data);
        
        // Check if we have popups and if any are not dismissed
        if (response.data.length > 0) {
          // Get dismissed popups from localStorage
          const dismissedPopups = JSON.parse(localStorage.getItem('dismissedPopups') || '{}');
          setDismissed(dismissedPopups);
          
          // Find first non-dismissed popup
          const nonDismissedIndex = response.data.findIndex(popup => {
            const dismissedUntil = dismissedPopups[popup.id];
            return !dismissedUntil || new Date(dismissedUntil) < new Date();
          });
          
          if (nonDismissedIndex !== -1) {
            setCurrentPopupIndex(nonDismissedIndex);
            setOpen(true);
          }
        }
      } catch (error) {
        console.error('Error fetching active popups:', error);
      }
    };
    
    fetchActivePopups();
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleDismiss = () => {
    const currentPopup = popups[currentPopupIndex];
    if (currentPopup) {
      // Calculate dismiss until date based on duration_days
      const dismissUntil = new Date();
      dismissUntil.setDate(dismissUntil.getDate() + (currentPopup.duration_days || 7));
      
      // Update dismissed popups in state and localStorage
      const updatedDismissed = { ...dismissed, [currentPopup.id]: dismissUntil.toISOString() };
      setDismissed(updatedDismissed);
      localStorage.setItem('dismissedPopups', JSON.stringify(updatedDismissed));
    }
    
    // Check if there are more popups to show
    const nextNonDismissedIndex = popups.findIndex((popup, index) => {
      return index > currentPopupIndex && (!dismissed[popup.id] || new Date(dismissed[popup.id]) < new Date());
    });
    
    if (nextNonDismissedIndex !== -1) {
      setCurrentPopupIndex(nextNonDismissedIndex);
    } else {
      setOpen(false);
    }
  };

  const handleButtonClick = (link) => {
    if (link) {
      window.open(link, '_blank');
    }
    handleDismiss();
  };

  // If no popups or all dismissed, don't render anything
  if (!popups.length || !open) {
    return null;
  }

  const currentPopup = popups[currentPopupIndex];
  if (!currentPopup) {
    return null;
  }

  // Get background color based on popup type
  const getBackgroundColor = (type) => {
    switch (type) {
      case 'warning': return '#fff3cd';
      case 'error': return '#f8d7da';
      case 'success': return '#d4edda';
      default: return '#cce5ff'; // info
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: getBackgroundColor(currentPopup.type),
        padding: '20px',
        borderRadius: '5px',
        maxWidth: '500px',
        position: 'relative',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            right: '10px',
            top: '10px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'rgba(0, 0, 0, 0.6)'
          }}
        >
          ×
        </button>
        
        <h2 style={{ paddingRight: '30px', marginTop: '0' }}>{currentPopup.title}</h2>
        
        {currentPopup.image_url && (
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <img 
              src={`http://localhost:5000${currentPopup.image_url}`} 
              alt={currentPopup.title}
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }}
            />
          </div>
        )}
        
        <div 
          dangerouslySetInnerHTML={{ __html: currentPopup.content }} 
          style={{ whiteSpace: 'pre-line' }}
        />
        
        {currentPopup.button_text && (
          <div style={{ textAlign: 'center', marginTop: '15px', paddingBottom: '10px' }}>
            <button 
              onClick={() => handleButtonClick(currentPopup.button_link)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {currentPopup.button_text}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePopupManager;