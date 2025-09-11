/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import proxy from "express-http-proxy";
import morgan from 'morgan';
import cookieparser from 'cookie-parser';  
import rateLimit from 'express-rate-limit';

const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  allowedHeaders: ["Authorization", "content-type"], // Adjust this to your client's origin
  credentials: true, // Allow cookies to be sent
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieparser());
app.set('trust proxy', 1); // trust first proxy

// apply rate limit
const {ipKeyGenerator } = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req:any) => (req.user ? 1000 :100), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
   keyGenerator: (req, res) => {
    return ipKeyGenerator(req.ip);
  },
});
app.use(limiter);


app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use("/", proxy("http://localhost:6001")); // Auth Service

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Oherb runing at http://localhost:${port}/api`);
});
server.on('error', console.error);