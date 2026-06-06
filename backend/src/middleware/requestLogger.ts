import morgan from 'morgan';

// Use 'dev' format in development for colourful concise output,
// 'combined' in production for Apache-style structured logs.
export const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
);
