import express from 'express';
import { DataSource } from 'typeorm';
import cors from 'cors';
import userRoutes from './routes/UserRoutes/userRoutes';
import { User } from './models/User';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Database connection
const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "b2b_db",
  entities: [User],
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