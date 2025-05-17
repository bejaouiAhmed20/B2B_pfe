import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Grid
} from '@mui/material';
import {
  AirplaneTicket,
  CheckCircleOutline,
  HighlightOff
} from '@mui/icons-material';

const FareOptions = ({ fareTypes, reservation, setReservation }) => {
  useEffect(() => {
    if (!reservation.classType && !reservation.class_type) {
      setReservation(prev => ({
        ...prev,
        classType: 'economy',
        class_type: 'economy',
        fareType: 'light',
        fare_type: 'light'
      }));
    }
  }, []);

  const updateReservation = (classType, fareType) => {
    setReservation(prev => ({
      ...prev,
      classType,
      class_type: classType,
      fareType,
      fare_type: fareType
    }));
  };

  const selectedClass = reservation.classType || reservation.class_type;
  const selectedFare = reservation.fareType || reservation.fare_type;
  const selectedFareObj = fareTypes[selectedClass].find(f => f.id === selectedFare);

  return (
    <Card className="rounded-2xl shadow-sm mb-6 border border-gray-100">
      <CardContent className="px-6 py-8 space-y-6">
        {/* Class selection */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" className="text-gray-700 mb-2">
            Classe de voyage
          </Typography>
          <Box className="flex overflow-hidden rounded-lg border border-gray-200">
            {['economy', 'business'].map(type => (
              <Box
                key={type}
                onClick={() => updateReservation(type, type === 'economy' ? 'light' : 'confort')}
                className={`flex-1 text-center px-4 py-2 cursor-pointer transition duration-200 font-medium ${
                  selectedClass === type
                    ? 'bg-[#CC0A2B] text-white'
                    : 'bg-white hover:bg-gray-50 text-gray-800'
                }`}
              >
                {type === 'economy' ? 'Économique' : 'Affaires'}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Fare cards */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" className="text-gray-700 mb-3">
            Tarif en {selectedClass === 'economy' ? 'Économique' : 'Affaires'}
          </Typography>

          <Box className="flex gap-4 overflow-x-auto pb-1">
            {fareTypes[selectedClass].map(fare => {
              const isSelected = selectedFare === fare.id;
              return (
                <Card
                  key={fare.id}
                  onClick={() => updateReservation(selectedClass, fare.id)}
                  className={`min-w-[220px] flex-shrink-0 transition-transform border ${
                    isSelected ? 'border-[#CC0A2B] shadow-md' : 'border-gray-200'
                  } hover:-translate-y-1 duration-200 rounded-lg overflow-hidden`}
                >
                  <Box
                    className={`p-2 text-center font-bold ${
                      isSelected ? 'bg-[#CC0A2B] text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {fare.name}
                  </Box>
                  <CardContent className="space-y-2">
                    <Typography variant="body2" color="text.secondary">
                      {fare.description}
                    </Typography>
                    <Typography variant="h6" align="center" className="text-primary">
                      {fare.multiplier.toFixed(2)}x
                    </Typography>
                    <Divider />
                    <Box>
                      {fare.features.slice(0, 3).map((feature, idx) => (
                        <Box key={idx} className="flex items-center gap-1 text-sm text-gray-700">
                          {feature.included ? (
                            <CheckCircleOutline fontSize="small" className="text-green-600" />
                          ) : (
                            <HighlightOff fontSize="small" className="text-red-400" />
                          )}
                          <Typography variant="body2" noWrap>
                            {feature.text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Selected Fare Details */}
        {selectedFareObj && (
          <Box className="bg-[#fef6f7] p-4 rounded-xl border border-[#CC0A2B]/20">
            <Box className="flex items-center gap-2 mb-2">
              <AirplaneTicket className="text-[#CC0A2B]" />
              <Typography variant="subtitle1" fontWeight="bold" className="text-gray-800">
                Détails du tarif {selectedFareObj.name}
              </Typography>
            </Box>
            <Divider className="mb-3" />
            <Grid container spacing={2}>
              {selectedFareObj.features.map((feature, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Box className="flex items-center gap-2">
                    {feature.included ? (
                      <CheckCircleOutline className="text-green-500" />
                    ) : (
                      <HighlightOff className="text-red-400" />
                    )}
                    <Typography variant="body2">{feature.text}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FareOptions;
