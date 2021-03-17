import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv'
import express from 'express';
import helmet from 'helmet';

import { coursesHandler } from './handlers/coursesHandler';
import { errorHandler } from './handlers/errorHandler';
import { httpErrorHandler } from './handlers/httpErrorHandler';

dotenv.config();

const port = process.env.port || 15013;

const origin = [
  /(?:.*\.)?localhost(?::\d{1,5})?$/,
  /\.qcmakeupacademy\.com$/,
  /\.qceventplanning\.com$/,
  /\.qcdesignschool\.com$/,
  /\.qccareerschool\.com$/,
  /\.doggroomingcourse\.com$/,
  /\.qcwellnessstudies\.com$/,
  /\.winghill\.com$/,
  /\.qccareerschool\.now\.sh$/,
];

const app = express();
app.use(cors({ origin }));
app.use(helmet());
app.use(compression());
app.use('/courses', coursesHandler);
app.use(httpErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`listenting on port ${port}`);
});