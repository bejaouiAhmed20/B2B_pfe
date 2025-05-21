import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const PopupContext = createContext();

// Custom hook to use the popup context
export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

// Provider component
export const PopupProvider = ({ children }) => {
  const [showPopups, setShowPopups] = useState(false);
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to trigger popup display
  const triggerPopups = () => {
    console.log('Triggering popups after login');

    // Clear any previously seen popups from localStorage
    // This ensures popups are shown again after login
    popups.forEach(popup => {
      localStorage.removeItem(`popup_${popup.id}_lastSeen`);
    });

    // Set a flag in localStorage to indicate this is a login trigger
    localStorage.setItem('popup_login_trigger', 'true');

    setShowPopups(true);
  };

  // Function to fetch popups
  const fetchPopups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/popups/active');
      if (response.ok) {
        const data = await response.json();

        // Log the received popups for debugging
        console.log('Fetched popups:', data);

        // Filter out popups with invalid image URLs
        const validPopups = data.map(popup => {
          // Ensure image_url is properly formatted
          if (popup.image_url && !popup.image_url.startsWith('http') && !popup.image_url.startsWith('/')) {
            popup.image_url = '/' + popup.image_url;
          }
          return popup;
        });

        setPopups(validPopups);
      }
    } catch (error) {
      console.error('Error fetching popups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch popups when the provider mounts
  useEffect(() => {
    fetchPopups();
  }, []);

  // Reset the trigger when popups are closed
  const resetTrigger = () => {
    console.log('Resetting popup trigger');

    // Remove the login trigger flag
    localStorage.removeItem('popup_login_trigger');

    setShowPopups(false);
  };

  // Value to be provided to consumers
  const value = {
    showPopups,
    triggerPopups,
    resetTrigger,
    popups,
    loading,
    fetchPopups
  };

  return (
    <PopupContext.Provider value={value}>
      {children}
    </PopupContext.Provider>
  );
};

export default PopupContext;
