import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432).required(),
  APP_PORT: Joi.number().default(5000).required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  UPLOAD_MAX_SIZE: Joi.number().default(10 * 1024 * 1024), // 10MB
  UPLOAD_ALLOWED_TYPES: Joi.string().default('jpg,jpeg,png,gif'),
  // Storage configuration
  STORAGE_TYPE: Joi.string().valid('local', 'cloud').default('local'),
  UPLOAD_PATH: Joi.string().default('public/images'),
  CLOUD_PROVIDER: Joi.string().valid('aws', 'gcp', 'azure').optional(),
  CLOUD_BUCKET: Joi.string().optional(),
  CLOUD_REGION: Joi.string().optional(),
  CLOUD_ACCESS_KEY_ID: Joi.string().optional(),
  CLOUD_SECRET_ACCESS_KEY: Joi.string().optional(),
  CLOUD_BASE_URL: Joi.string().uri().optional(),
  // Request delay configuration for frontend testing
  ENABLE_REQUEST_DELAY: Joi.boolean().default(false).optional(),
  REQUEST_DELAY_MS: Joi.number().default(2000).optional(),
});
