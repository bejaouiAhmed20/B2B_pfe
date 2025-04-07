// In your createReservation function or equivalent
exports.createReservation = async (req, res) => {
  try {
    const { 
      flight_id, 
      nombre_passagers, 
      prix_total, 
      class_type,  // Make sure these are being extracted from the request
      fare_type,   // Make sure these are being extracted from the request
      coupon, 
      discountAmount,
      seats,
      status 
    } = req.body;
    
    console.log("Received reservation data:", req.body);
    
    // Create the reservation with all fields
    const reservation = await Reservation.create({
      flight_id,
      user_id: req.user.id, // Assuming you have user info from auth middleware
      date_reservation: new Date(),
      nombre_passagers,
      prix_total,
      class_type,  // Make sure these are included in the create call
      fare_type,   // Make sure these are included in the create call
      coupon,
      discountAmount,
      status: status || 'confirmed'
    });
    
    // Handle seats if needed
    // ...
    
    res.status(201).json({ 
      success: true, 
      data: reservation 
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating reservation', 
      error: error.message 
    });
  }
};