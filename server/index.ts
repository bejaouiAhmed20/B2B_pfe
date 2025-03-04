import express from 'express';
import { DataSource } from 'typeorm';
import cors from 'cors';
import userRoutes from './routes/UserRoutes/userRoutes';
import flightRoutes from './routes/FlightRoutes/flightRoutes';
import locationRoutes from './routes/LocationRoutes/locationRoutes';
import airportRoutes from './routes/AirportRoutes/airportRoutes';
import { User } from './models/User';
import { Flight } from './models/Flight';
import { Location } from './models/Location';
import { Airport } from './models/Airport';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/airports', airportRoutes);

// Database connection
const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "b2b_db",
  entities: [User, Flight, Location, Airport],
  synchronize: true,
  logging: true
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

export default app;