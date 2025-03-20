import React from 'react';
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
  return (
    <Card sx={{ mb: 3, mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Options de voyage
        </Typography>
        
        {/* Class type selection with visual tabs */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Choisissez votre classe
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            border: '1px solid #e0e0e0', 
            borderRadius: 1, 
            overflow: 'hidden'
          }}>
            <Box 
              onClick={() => setReservation(prev => ({ 
                ...prev, 
                classType: 'economy',
                fareType: 'light' 
              }))}
              sx={{ 
                flex: 1, 
                p: 2, 
                textAlign: 'center',
                bgcolor: reservation.classType === 'economy' ? '#CC0A2B' : 'transparent',
                color: reservation.classType === 'economy' ? 'white' : 'inherit',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: reservation.classType === 'economy' ? '#CC0A2B' : '#f5f5f5'
                }
              }}
            >
              <Typography variant="subtitle1" fontWeight={reservation.classType === 'economy' ? 'bold' : 'normal'}>
                Économique
              </Typography>
            </Box>
            <Box 
              onClick={() => setReservation(prev => ({ 
                ...prev, 
                classType: 'business',
                fareType: 'confort' 
              }))}
              sx={{ 
                flex: 1, 
                p: 2, 
                textAlign: 'center',
                bgcolor: reservation.classType === 'business' ? '#CC0A2B' : 'transparent',
                color: reservation.classType === 'business' ? 'white' : 'inherit',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: reservation.classType === 'business' ? '#CC0A2B' : '#f5f5f5'
                }
              }}
            >
              <Typography variant="subtitle1" fontWeight={reservation.classType === 'business' ? 'bold' : 'normal'}>
                Affaires
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Fare type selection with cards */}
        <Typography variant="subtitle2" gutterBottom>
          Sélectionnez votre tarif en {reservation.classType === 'economy' ? 'Économique' : 'Affaires'}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, overflowX: 'auto', pb: 1 }}>
          {fareTypes[reservation.classType].map(fare => (
            <Card 
              key={fare.id} 
              onClick={() => setReservation(prev => ({ ...prev, fareType: fare.id }))}
              sx={{ 
                minWidth: 180, 
                cursor: 'pointer',
                border: reservation.fareType === fare.id ? '2px solid #CC0A2B' : '1px solid #e0e0e0',
                boxShadow: reservation.fareType === fare.id ? '0 4px 8px rgba(204, 10, 43, 0.2)' : 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
                },
                flex: '0 0 auto',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                bgcolor: reservation.fareType === fare.id ? '#CC0A2B' : 'grey.100', 
                color: reservation.fareType === fare.id ? 'white' : 'text.primary',
                p: 1.5,
                textAlign: 'center'
              }}>
                <Typography variant="h6" fontWeight="bold">
                  {fare.name}
                </Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {fare.description}
                </Typography>
                <Typography variant="h6" color="primary" align="center" sx={{ my: 1 }}>
                  {(fare.multiplier).toFixed(2)}x
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ mt: 1 }}>
                  {fare.features.slice(0, 3).map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      {feature.included ? 
                        <CheckCircleOutline sx={{ mr: 1, fontSize: '0.9rem', color: 'success.main' }} /> : 
                        <HighlightOff sx={{ mr: 1, fontSize: '0.9rem', color: 'error.main' }} />
                      }
                      <Typography variant="body2" noWrap>
                        {feature.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
        
        {/* Display selected fare features in detail */}
        <Box sx={{ 
          bgcolor: 'primary.light', 
          color: 'primary.contrastText', 
          p: 2, 
          borderRadius: 1, 
          mt: 3,
          border: '1px solid',
          borderColor: 'primary.main',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AirplaneTicket sx={{ mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Détails du tarif {fareTypes[reservation.classType].find(fare => fare.id === reservation.fareType)?.name}
            </Typography>
          </Box>
          <Divider sx={{ my: 1, borderColor: 'primary.contrastText', opacity: 0.3 }} />
          <Grid container spacing={1}>
            {fareTypes[reservation.classType]
              .find(fare => fare.id === reservation.fareType)
              ?.features.map((feature, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    {feature.included ? 
                      <CheckCircleOutline sx={{ mr: 1, fontSize: '1rem', color: '#8eff8e' }} /> : 
                      <HighlightOff sx={{ mr: 1, fontSize: '1rem', color: '#ff8e8e' }} />
                    }
                    <Typography variant="body2">
                      {feature.text}
                    </Typography>
                  </Box>
                </Grid>
              ))
            }
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FareOptions;