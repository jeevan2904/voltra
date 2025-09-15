import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';

import authRouter from './routes/auth.router';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

// Routes
app.use('/api', authRouter);

app.use(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const server = app.listen(port, () => {
  console.log(`Auth Service is running at http://localhost:${port}/api`);
});

server.on('error', (err: Error) => {
  console.log('Server Error: ', err.message);
});
