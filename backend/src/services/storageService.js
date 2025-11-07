/**
 * Storage Service
 * Handles audio file uploads to Raindrop SmartBuckets
 */

import { randomBytes } from 'crypto';
import { Buffer } from 'buffer';

/**
 * Upload audio file to SmartBuckets
 * @param {Object} smartBuckets - SmartBuckets client
 * @param {String} base64Audio - Base64 encoded audio data
 * @param {Number} userId - User ID
 * @param {Number} sessionId - Session ID
 * @returns {String} URL of uploaded file
 */
export async function uploadAudio(smartBuckets, base64Audio, userId, sessionId) {
  try {
    console.log('📤 Uploading audio to SmartBuckets...');

    // Extract base64 data (remove data:audio/webm;base64, prefix if present)
    let base64Data = base64Audio;
    if (base64Audio.includes('base64,')) {
      base64Data = base64Audio.split('base64,')[1];
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Generate filename
    const timestamp = Date.now();
    const randomId = randomBytes(8).toString('hex');
    const filename = `${userId}/${sessionId}-${timestamp}-${randomId}.webm`;

    // Detect content type
    let contentType = 'audio/webm';
    if (base64Audio.includes('audio/mp3') || base64Audio.includes('audio/mpeg')) {
      contentType = 'audio/mpeg';
    } else if (base64Audio.includes('audio/wav')) {
      contentType = 'audio/wav';
    }

    // Upload to SmartBuckets
    const result = await smartBuckets.upload(filename, audioBuffer, contentType);

    console.log('✅ Audio uploaded:', result.url);
    return result.url;

  } catch (error) {
    console.error('❌ Error uploading audio:', error);
    throw new Error('Failed to upload audio file');
  }
}

/**
 * Validate audio data
 */
export function validateAudioData(base64Audio) {
  if (!base64Audio || typeof base64Audio !== 'string') {
    return { valid: false, error: 'Audio data is required' };
  }

  // Check if it's base64
  const base64Regex = /^data:audio\/(webm|mpeg|mp3|wav);base64,/;
  if (!base64Regex.test(base64Audio) && !isValidBase64(base64Audio)) {
    return { valid: false, error: 'Invalid audio data format' };
  }

  // Extract actual base64 data
  let base64Data = base64Audio;
  if (base64Audio.includes('base64,')) {
    base64Data = base64Audio.split('base64,')[1];
  }

  // Check size (approximate, should be 2-5MB for 2 minutes)
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > 10) {
    return { valid: false, error: 'Audio file too large (max 10MB)' };
  }

  if (sizeInMB < 0.01) {
    return { valid: false, error: 'Audio file too small (min 10KB)' };
  }

  return { valid: true, sizeInMB };
}

/**
 * Check if string is valid base64
 */
function isValidBase64(str) {
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch (error) {
    return false;
  }
}

/**
 * Generate signed URL for audio access (for playback)
 */
export function getAudioUrl(smartBuckets, audioKey) {
  return smartBuckets.getSignedUrl(audioKey, 3600); // 1 hour expiry
}

/**
 * Mock upload for testing without SmartBuckets
 */
export function mockUploadAudio(userId, sessionId) {
  const mockUrl = `https://mock-storage.coachtcf.app/${userId}/${sessionId}-${Date.now()}.webm`;
  console.log('⚠️  Mock audio upload:', mockUrl);
  return mockUrl;
}

export default {
  uploadAudio,
  validateAudioData,
  getAudioUrl,
  mockUploadAudio,
};

