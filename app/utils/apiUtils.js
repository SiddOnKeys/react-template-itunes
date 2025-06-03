import wretch from 'wretch';
import snakeCase from 'lodash/snakeCase';
import camelCase from 'lodash/camelCase';
import { mapKeysDeep } from './index';

export const API_TYPES = {
  GITHUB: 'github',
  ITUNES: 'itunes',
  DEFAULT: 'default'
};

const API_URLS = {
  [API_TYPES.GITHUB]: process.env.GITHUB_URL,
  [API_TYPES.ITUNES]: 'https://itunes.apple.com',
  [API_TYPES.DEFAULT]: null
};

const apiClients = {
  [API_TYPES.GITHUB]: null,
  [API_TYPES.ITUNES]: null,
  [API_TYPES.DEFAULT]: null
};

/**
 * Retrieves an API client for a specified type.
 *
 * @date 01/03/2024 - 14:47:28
 *
 * @param {string} type - The type of API client to retrieve.
 * @returns {Object} The requested API client, or undefined if it does not exist.
 */
export const getApiClient = (type = API_TYPES.GITHUB) => apiClients[type];

/**
 * Generates an API client for a specified type.
 * Supports GitHub and iTunes APIs with their respective base URLs.
 *
 * @date 01/03/2024 - 14:48:09
 *
 * @param {string} type - The type of API client to generate.
 * @returns {Object} The generated API client.
 */
export const generateApiClient = (type = API_TYPES.GITHUB) => {
  const baseURL = API_URLS[type];
  if (!baseURL) {
    throw new Error(`Invalid API type: ${type}`);
  }

  const client = createApiClientWithTransForm(baseURL);
  return Object.assign({}, apiClients, { [type]: client })[type];
};

/**
 * Creates an API client with response and request transformations.
 * The response transformation converts keys in the response data from snake_case to camelCase.
 * The request transformation converts keys in the request data from camelCase to snake_case.
 *
 * @date 01/03/2024 - 14:47:28
 *
 * @param {string} baseURL - The base URL for the API client.
 * @returns {Object} The API client with added transformations.
 */
export const createApiClientWithTransForm = (baseURL) => {
  const transformRequestOptions = (next) => async (url, opts) => {
    if (!opts.body) {
      return next(url, opts);
    }
    try {
      const parsedBody = JSON.parse(opts.body);
      const transformedBody = JSON.stringify(mapKeysDeep(parsedBody, (keys) => snakeCase(keys)));
      return next(url, { ...opts, body: transformedBody });
    } catch (error) {
      console.error('Invalid JSON body:', error);
      throw new Error('Invalid JSON body');
    }
  };

  return wretch(baseURL)
    .headers({ 'Content-Type': 'application/json' })
    .middlewares([transformRequestOptions])
    .resolve(async (resolver) => {
      try {
        const response = await resolver.res((data) => data);
        const data = await response.json();
        return {
          ok: response.ok,
          status: response.status,
          data: mapKeysDeep(data, (keys) => camelCase(keys))
        };
      } catch (error) {
        return {
          ok: false,
          status: error.status,
          data: error.json
        };
      }
    });
};
