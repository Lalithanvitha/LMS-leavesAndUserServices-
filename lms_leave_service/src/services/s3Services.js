const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3");
const uploadFileToS3 = async (file) => {
  const key = `leave_documents/${Date.now()}-${file.originalname}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    body: file.buffer,
    ContentType: file.mimetype,
  });
  await s3.send(command);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
module.exports = { uploadFileToS3 };
