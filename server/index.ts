// At the very top of your index.ts file
import dotenv from 'dotenv';
dotenv.config();

import "reflect-metadata";
import express from 'express';
import { DataSource } from 'typeorm';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/UserRoutes/userRoutes';
import flightRoutes from './routes/FlightRoutes/flightRoutes';
import locationRoutes from './routes/LocationRoutes/locationRoutes';
import airportRoutes from './routes/AirportRoutes/airportRoutes';
import newsRoutes from './routes/NewsRoutes/newsRoutes';
import authRoutes from './routes/AuthRoutes/authRoutes';
import couponRoutes from './routes/CouponRoutes/couponRoutes';
import reservationRoutes from './routes/ReservationRoutes/ReservationRoutes';
import compteRoutes from './routes/CompteRoutes/compteRoutes';
import uploadRoutes from './routes/UploadRoutes/uploadRoutes';
import requestSoldeRoutes from './routes/RequestSoldeRoutes/requestSoldeRoutes';
import contractRoutes from './routes/ContractRoutes/contractRoutes';
import reclamationRoutes from './routes/ReclamationRoutes/reclamationRoutes';
import seatReservationRoutes from './routes/SeatReservationRoutes/seatReservationRoutes';
import planeRoutes from './routes/PlaneRoutes/planeRoutes';
import seatRoutes from './routes/SeatRoutes/seatRoutes';
import { SeatReservation } from './models/SeatReservation';
import { FlightSeatReservation } from './models/FlightSeatReservation';

import { User } from './models/User';
import { Flight } from './models/Flight';
import { Location } from './models/Location';
import { Airport } from './models/Airport';
import { News } from './models/News';
import { Coupon } from './models/Coupon';
import { Reservation } from './models/Reservation';
import { Compte } from './models/Compte';
import { RequestSolde } from './models/RequestSolde';
import { Contract } from './models/Contract';
import { Reclamation } from './models/Reclamation';
import { Plane } from './models/Plane';
import { Seat } from './models/Seat';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/comptes', compteRoutes);
app.use('/api/request-solde', requestSoldeRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/reclamations', reclamationRoutes);


// Make sure you have this line to serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
// Add this line to the routes section
app.use('/api/seat-reservations', seatReservationRoutes);

// Add these with your other app.use statements
app.use('/api/planes', planeRoutes);
app.use('/api/seats', seatRoutes);

// Update the entities array in the DataSource configuration
const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "b2b_db3",
  entities: [
    User, 
    Flight, 
    Location, 
    Airport, 
    News, 
    Coupon, 
    Reservation, 
    Compte, 
    RequestSolde, 
    Contract, 
    Reclamation, 
    Plane, 
    Seat, 
    SeatReservation,
    FlightSeatReservation
  ],
  synchronize: true,
  logging: true,
  charset: "utf8mb4",
  extra: {
    charset: "utf8mb4_unicode_ci"
  },
  entitySkipConstructor: true
});

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });

// Add this line near the end of your file, after initializing AppDataSource
export { AppDataSource };

export default app;