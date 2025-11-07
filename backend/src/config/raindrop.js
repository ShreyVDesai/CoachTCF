/**
 * Raindrop Platform Configuration
 * Handles SmartInference, SmartBuckets, and SmartSQL connections
 */

import https from 'https';
import http from 'http';

/**
 * SmartInference API client
 * Mimics OpenAI API structure
 */
export class SmartInferenceClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = process.env.RAINDROP_INFERENCE_ENDPOINT || 'https://api.raindrop.ai/v1';
  }

  /**
   * Call SmartInference chat completion (GPT-4o)
   */
  async chat(options) {
    const { model = 'gpt-4o', messages, temperature = 0.7, maxTokens = 2000 } = options;

    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    return this.makeRequest('/chat/completions', requestBody);
  }

  /**
   * Make HTTP request to Raindrop API
   */
  async makeRequest(endpoint, body) {
    const url = new URL(endpoint, this.baseUrl);
    const protocol = url.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
      };

      const req = protocol.request(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            
            if (res.statusCode >= 400) {
              reject(new Error(parsed.error?.message || 'SmartInference API error'));
            } else {
              resolve(parsed);
            }
          } catch (error) {
            reject(new Error('Failed to parse SmartInference response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`SmartInference request failed: ${error.message}`));
      });

      req.write(JSON.stringify(body));
      req.end();
    });
  }
}

/**
 * SmartBuckets client for file storage
 */
export class SmartBucketsClient {
  constructor(config) {
    this.bucketName = config.bucketName;
    this.accessKey = config.accessKey;
    this.secretKey = config.secretKey;
    this.endpoint = config.endpoint || 'https://storage.raindrop.ai';
  }

  /**
   * Upload file to SmartBuckets
   */
  async upload(filename, buffer, contentType = 'application/octet-stream') {
    // For now, we'll simulate S3-compatible storage
    // In production, you'd use AWS SDK or similar
    const url = `${this.endpoint}/${this.bucketName}/${filename}`;
    
    // This is a simplified version - in production use proper S3 SDK
    console.log('📤 Uploading file to SmartBuckets:', filename);
    
    // Return the public URL
    return {
      url,
      key: filename,
      bucket: this.bucketName,
    };
  }

  /**
   * Generate signed URL for file access
   */
  getSignedUrl(filename, expiresIn = 3600) {
    return `${this.endpoint}/${this.bucketName}/${filename}?expires=${expiresIn}`;
  }
}

/**
 * Initialize Raindrop clients
 */
export function initRaindrop() {
  const apiKey = process.env.RAINDROP_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  RAINDROP_API_KEY not set - SmartInference will not work');
  }

  const smartInference = new SmartInferenceClient(apiKey);

  const smartBuckets = new SmartBucketsClient({
    bucketName: process.env.RAINDROP_BUCKET_NAME,
    accessKey: process.env.RAINDROP_BUCKET_ACCESS_KEY,
    secretKey: process.env.RAINDROP_BUCKET_SECRET_KEY,
    endpoint: process.env.RAINDROP_BUCKET_ENDPOINT,
  });

  console.log('✅ Raindrop clients initialized');

  return {
    smartInference,
    smartBuckets,
  };
}

// For environments without Raindrop, use OpenAI directly
export function createOpenAIFallback() {
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey) {
    throw new Error('Neither RAINDROP_API_KEY nor OPENAI_API_KEY is set');
  }

  console.log('⚠️  Using OpenAI fallback (not Raindrop)');

  return {
    smartInference: {
      async chat(options) {
        const { model, messages, temperature = 0.7, maxTokens = 2000 } = options;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: model === 'gpt-4o' ? 'gpt-4o' : 'gpt-4',
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        return await response.json();
      },
    },
  };
}

export default {
  SmartInferenceClient,
  SmartBucketsClient,
  initRaindrop,
  createOpenAIFallback,
};

