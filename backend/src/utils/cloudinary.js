const cloudinary = require('cloudinary').v2;
const config = require('../config');

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

/**
 * Streams an in-memory file buffer to Cloudinary (avoids writing temp files to disk).
 * @param {Buffer} buffer
 * @param {{ folder: string }} options
 * @returns {Promise<{ url: string, publicId: string }>}
 */
function uploadBuffer(buffer, { folder }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Deletes an asset from Cloudinary. Safe to call even if the asset no longer exists.
 * @param {string} publicId
 */
async function destroyImage(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}

module.exports = { cloudinary, uploadBuffer, destroyImage };
