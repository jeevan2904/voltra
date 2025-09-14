import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import morgan from 'morgan';
import proxy from 'express-http-proxy';
import rateLimit from 'express-rate-limit';

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  })
);

app.use(morgan('dev'));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(cookieParser());

app.set('trust proxy', 1);

// Applying Rate Limitting
const limitter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  message: { error: 'Too many requests, Please try again later!' },
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: any) => req.ip,
});

app.use(limitter);

// Add Proxy to Auth-Service
app.use('/', proxy('http://localhost:6001'));

// Health Check API
app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to Api-Gateway!' });
});

const port = Number(process.env.PORT) || 8080;

const server = app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);
});

server.on('error', (err: Error) => {
  console.log('Server Error: ', err.message);
});
