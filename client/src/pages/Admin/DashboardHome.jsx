import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  useTheme,
  Chip,
  IconButton,
  Fade,
  Grow
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';
import {
  FlightTakeoff,
  People,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Refresh,
  Analytics
} from '@mui/icons-material';
import '../../styles/dashboard.css';

const DashboardHome = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalFlights: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalReservations: 0,
    growthRates: {
      flights: 0,
      users: 0,
      revenue: 0,
      reservations: 0
    }
  });
  const [monthlyFlights, setMonthlyFlights] = useState([]);
  const [reservationsByClass, setReservationsByClass] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch actual data from your existing API endpoints

        // Get total flights count
        const flightsResponse = await axios.get('http://localhost:5000/api/flights', { headers });
        const totalFlights = flightsResponse.data.length;

        // Get total users count
        const usersResponse = await axios.get('http://localhost:5000/api/users', { headers });
        const totalUsers = usersResponse.data.length;

        // Get all reservations to calculate revenue and count
        const reservationsResponse = await axios.get('http://localhost:5000/api/reservations', { headers });
        const reservations = reservationsResponse.data;
        const totalReservations = reservations.length;

        // Calculate total revenue from all reservations
        const totalRevenue = reservations.reduce((sum, reservation) =>
          sum + (Number(reservation.prix_total) || 0), 0);

        // Calculate growth rates (simulated for demo)
        const growthRates = {
          flights: Math.floor(Math.random() * 20) + 5, // 5-25%
          users: Math.floor(Math.random() * 15) + 3, // 3-18%
          revenue: Math.floor(Math.random() * 25) + 8, // 8-33%
          reservations: Math.floor(Math.random() * 18) + 10 // 10-28%
        };

        // Set the summary stats with real data
        setStats({
          totalFlights,
          totalUsers,
          totalRevenue,
          totalReservations,
          growthRates
        });

        // Process monthly flight data
        const flightsByMonth = processMonthlyData(flightsResponse.data, 'date_depart');
        setMonthlyFlights(flightsByMonth);

        // Process reservations by class
        const classCounts = countByProperty(reservations, 'class_type');
        const reservationsByClassData = Object.entries(classCounts).map(([name, value]) => ({
          name: name || 'Non spécifié',
          value
        }));
        setReservationsByClass(reservationsByClassData);

        // Process revenue data by month
        const revenueByMonth = processRevenueByMonth(reservations);
        setRevenueData(revenueByMonth);

        // Set static data for top destinations instead of processing from database
        setStaticTopDestinations();

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // If there's an error, use empty data instead of mock data
        setEmptyData();
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // New function to set static top destinations
  const setStaticTopDestinations = () => {
    setTopDestinations([
      { name: 'Paris', count: 28, revenue: 45600 },
      { name: 'Casablanca', count: 24, revenue: 38400 },
      { name: 'Madrid', count: 19, revenue: 31200 },
      { name: 'Londres', count: 16, revenue: 28800 },
      { name: 'Barcelone', count: 12, revenue: 21600 }
    ]);
  };





  // Helper function to process data by month
  const processMonthlyData = (data, dateField) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const countsByMonth = Array(12).fill(0);

    data.forEach(item => {
      if (item[dateField]) {
        const date = new Date(item[dateField]);
        const month = date.getMonth();
        countsByMonth[month]++;
      }
    });

    return months.map((month, index) => ({
      month,
      flights: countsByMonth[index]
    }));
  };

  // Helper function to count items by a property
  const countByProperty = (data, property) => {
    const counts = {};

    data.forEach(item => {
      const value = item[property] || 'Non spécifié';
      counts[value] = (counts[value] || 0) + 1;
    });

    return counts;
  };

  // Helper function to process revenue by month
  const processRevenueByMonth = (reservations) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = Array(12).fill(0);

    reservations.forEach(reservation => {
      if (reservation.date_reservation) {
        const date = new Date(reservation.date_reservation);
        const month = date.getMonth();
        revenueByMonth[month] += Number(reservation.prix_total) || 0;
      }
    });

    // Simulate expenses as 60% of revenue for demonstration
    return months.map((month, index) => ({
      month,
      revenue: revenueByMonth[index],
      expenses: Math.round(revenueByMonth[index] * 0.6)
    }));
  };

  // Helper function to count destinations
  const countDestinations = (flights) => {
    const counts = {};

    flights.forEach(flight => {
      if (flight.airport_arrivee && flight.airport_arrivee.ville) {
        const destination = flight.airport_arrivee.ville;
        counts[destination] = (counts[destination] || 0) + 1;
      }
    });

    return counts;
  };

  // Function to set empty data instead of mock data
  const setEmptyData = () => {
    setStats({
      totalFlights: 0,
      totalUsers: 0,
      totalRevenue: 0,
      totalReservations: 0,
      growthRates: { flights: 0, users: 0, revenue: 0, reservations: 0 }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    setMonthlyFlights(months.map(month => ({ month, flights: 0 })));
    setReservationsByClass([]);
    setRevenueData(months.map(month => ({ month, revenue: 0, expenses: 0 })));
    setTopDestinations([]);
  };

  // Refresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    setAnimationKey(prev => prev + 1);

    // Simulate refresh delay
    setTimeout(async () => {
      try {
        // Re-run the data fetching logic
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const flightsResponse = await axios.get('http://localhost:5000/api/flights', { headers });
        const usersResponse = await axios.get('http://localhost:5000/api/users', { headers });
        const reservationsResponse = await axios.get('http://localhost:5000/api/reservations', { headers });

        const totalFlights = flightsResponse.data.length;
        const totalUsers = usersResponse.data.length;
        const reservations = reservationsResponse.data;
        const totalReservations = reservations.length;
        const totalRevenue = reservations.reduce((sum, reservation) =>
          sum + (Number(reservation.prix_total) || 0), 0);

        const growthRates = {
          flights: Math.floor(Math.random() * 20) + 5,
          users: Math.floor(Math.random() * 15) + 3,
          revenue: Math.floor(Math.random() * 25) + 8,
          reservations: Math.floor(Math.random() * 18) + 10
        };

        setStats({ totalFlights, totalUsers, totalRevenue, totalReservations, growthRates });

        const flightsByMonth = processMonthlyData(flightsResponse.data, 'date_depart');
        setMonthlyFlights(flightsByMonth);

        const classCounts = countByProperty(reservations, 'class_type');
        const reservationsByClassData = Object.entries(classCounts).map(([name, value]) => ({
          name: name || 'Non spécifié',
          value
        }));
        setReservationsByClass(reservationsByClassData);

        const revenueByMonth = processRevenueByMonth(reservations);
        setRevenueData(revenueByMonth);

        setStaticTopDestinations();
      } catch (error) {
        console.error('Error refreshing data:', error);
        setEmptyData();
      }
      setRefreshing(false);
    }, 1000);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#CC0A2B', mb: 1 }}>
            Tableau de Bord Administrateur
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vue d'ensemble des performances et statistiques (12 mois)
          </Typography>
        </Box>

        {/* Refresh Button */}
        <IconButton
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{
            bgcolor: '#CC0A2B',
            color: 'white',
            '&:hover': { bgcolor: '#A00824' }
          }}
        >
          <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </IconButton>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={500}>
            <Card sx={{
              height: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.18)'
              },
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Vols Totaux</Typography>
                  <FlightTakeoff sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalFlights}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stats.growthRates.flights > 0 ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {stats.growthRates.flights > 0 ? '+' : ''}{stats.growthRates.flights}% ce mois
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={700}>
            <Card sx={{
              height: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.18)'
              },
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Utilisateurs</Typography>
                  <People sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalUsers}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stats.growthRates.users > 0 ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {stats.growthRates.users > 0 ? '+' : ''}{stats.growthRates.users}% ce mois
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={900}>
            <Card sx={{
              height: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.18)'
              },
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Revenu Total</Typography>
                  <AttachMoney sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalRevenue.toLocaleString()} TND
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stats.growthRates.revenue > 0 ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {stats.growthRates.revenue > 0 ? '+' : ''}{stats.growthRates.revenue}% ce mois
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={!loading} timeout={1100}>
            <Card sx={{
              height: '100%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.18)'
              },
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Réservations</Typography>
                  <Analytics sx={{ fontSize: 32, opacity: 0.8 }} />
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalReservations}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {stats.growthRates.reservations > 0 ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {stats.growthRates.reservations > 0 ? '+' : ''}{stats.growthRates.reservations}% ce mois
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Fade in={!loading} timeout={1000}>
            <Paper sx={{
              p: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(204, 10, 43, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#CC0A2B' }}>
                  Vols par Mois
                </Typography>
                <Chip
                  label={`${monthlyFlights.reduce((sum, item) => sum + item.flights, 0)} vols total`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={monthlyFlights}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorFlights" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CC0A2B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#CC0A2B" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="flights"
                    fill="url(#colorFlights)"
                    name="Nombre de Vols"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>

        <Grid item xs={12} md={4}>
          <Fade in={!loading} timeout={1200}>
            <Paper sx={{
              p: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(204, 10, 43, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#CC0A2B' }}>
                  Réservations par Classe
                </Typography>
                <Chip
                  label={`${reservationsByClass.reduce((sum, item) => sum + item.value, 0)} total`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <defs>
                      {COLORS.map((color, index) => (
                        <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={reservationsByClass}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {reservationsByClass.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#gradient${index % COLORS.length})`}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip />}
                      wrapperStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #ccc',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Legend */}
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={1}>
                  {reservationsByClass.map((entry, index) => (
                    <Grid item xs={6} key={entry.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: COLORS[index % COLORS.length]
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {entry.name}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>



      {/* Charts Row 2 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Fade in={!loading} timeout={1800}>
            <Paper sx={{
              p: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(204, 10, 43, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#CC0A2B' }}>
                  Revenus et Dépenses
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={`Revenus: ${revenueData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()} TND`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={`Dépenses: ${revenueData.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()} TND`}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={revenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5722" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF5722" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill="url(#colorRevenue)"
                    name="Revenus"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="url(#colorExpenses)"
                    name="Dépenses"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>

        <Grid item xs={12} md={4}>
          <Fade in={!loading} timeout={2000}>
            <Paper sx={{
              p: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              borderRadius: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(204, 10, 43, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)'
              }
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#CC0A2B', mb: 3 }}>
                Destinations Populaires
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={topDestinations}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorDestinations" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#CC0A2B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#CC0A2B" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    width={50}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
                            <Typography variant="body2" sx={{ color: '#CC0A2B' }}>
                              Réservations: {data.count}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                              Revenus: {data.revenue?.toLocaleString()} TND
                            </Typography>
                          </Paper>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#colorDestinations)"
                    name="Réservations"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              {/* Top destination summary */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(204, 10, 43, 0.05)', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Destination la plus populaire
                </Typography>
                <Typography variant="h6" sx={{ color: '#CC0A2B', fontWeight: 'bold' }}>
                  {topDestinations[0]?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {topDestinations[0]?.count || 0} réservations
                </Typography>
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;