import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import swaggerUi from 'swagger-ui-express';

import authRouter from './routes/auth.router';
import { errorMiddleware } from '@/packages/error-handler/error-middleware';
const swaggerDocument = require('./swagger-output.json');

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

// Routes
app.use('/api', authRouter);

app.use(errorMiddleware);

const port = process.env.PORT ? Number(process.env.PORT) : 6001;

const server = app.listen(port, () => {
  console.log(`Auth Service is running at http://localhost:${port}/api`);

  console.log(`Swagger Docs available at http://localhost:${port}/docs-json`);
});

server.on('error', (err: Error) => {
  console.log('Server Error: ', err.message);
});
