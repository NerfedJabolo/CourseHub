import express from 'express';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(express.json());
app.use('/api', routes);

export default app;
