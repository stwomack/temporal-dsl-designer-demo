export const config = {
  temporal: {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'journey-workflows',
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9093').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'journey-platform',
    groupId: process.env.KAFKA_GROUP_ID || 'journey-platform-workers',
  },
  email: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  server: {
    port: parseInt(process.env.SERVER_PORT || '3001', 10),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};
