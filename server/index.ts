import express from 'express';
import 'reflect-metadata';


const app = express();
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(5000, (): void => {
    console.log('Server is running on port 5000');
});