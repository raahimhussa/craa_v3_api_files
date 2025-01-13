export default () => ({
  database: {
    uri: process.env.DB_URI,
    demo_uri: process.env.DEMO_DB_URI,
    demo_uri2: process.env.DEMO_DB_URI2,
  },
  // smtp: {
  //   host: process.env.AWS_SMTP_HOST,
  //   port: process.env.AWS_SMTP_PORT,
  //   sender: process.env.AWS_SMTP_SENDER,
  //   auth: {
  //     user: process.env.AWS_SMTP_USER,
  //     pass: process.env.AWS_SMTP_PASS,
  //   },
  // },
  // s3: {
  //   region: process.env.AWS_S3_REGION,
  //   bucketName: process.env.AWS_S3_BUCKET_NAME,
  //   awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   expires: 3000,
  //   acl: 'public-read',
  // },
});
