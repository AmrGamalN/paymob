import { Request, Response } from 'express';
import express from 'express';
import { swaggerDoc } from './configs/swagger.config';
import { mongodbConnect } from './configs/mongodb.config';
import { HandleError, logger } from '@amrogamal/shared-code';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import routes from './router';
const { errorMiddleware } = HandleError.getInstance();
const app = express();
const PORT = process.env.PORT || 4000;

const corsOption = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOption));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'http://localhost:4000'],
      imgSrc: ["'self'", 'data:'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

swaggerDoc(app);
app.use('/api/v1', routes);
Promise.all([mongodbConnect()])
  .then(() => {
    app.use((req: Request, res: Response) => {
      res.status(404).json({ message: 'Page not found' });
    });
    app.use(errorMiddleware());
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(error);
  });
