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
    setShowPopups(true);
  };

  // Function to fetch popups
  const fetchPopups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/popups/active');
      if (response.ok) {
        const data = await response.json();
        setPopups(data);
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
