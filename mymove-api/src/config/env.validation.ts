import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('/api'),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),

  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_SERVICE_KEY: Joi.string().required(),
  SUPABASE_JWT_SECRET: Joi.string().required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRATION: Joi.number().default(3600),

  BCRYPT_ROUNDS: Joi.number().default(12),

  CORS_ORIGIN: Joi.string().default('*'),

  AWS_REGION: Joi.string().default('eu-central-1'),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_S3_BUCKET_NAME: Joi.string().default('mymove-videos'),
});
