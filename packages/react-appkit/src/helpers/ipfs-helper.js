//
// Copyright 2020 DXOS.org
//

import urlJoin from 'url-join';

/**
 * IPFS gateway HTTP methods.
 * Imported from wirelineio/appkit
 */
export class IpfsHelper {
  /**
   * @param {string} ipfsGateway - IPFS gateway.
   */
  constructor (ipfsGateway) {
    console.assert(ipfsGateway);
    this._ipfsGateway = ipfsGateway.endsWith('/') ? ipfsGateway : `${ipfsGateway}/`;
  }

  /**
   * Creates a valid IPFS URL, using the first configured gateway.
   * @param {string} cid
   */
  url (cid) {
    return cid ? urlJoin(this._ipfsGateway, cid) : this._ipfsGateway;
  }

  /**
   * @param {string} body
   * @param {string} contentType
   * @return {Promise<String>} IPFS hash if successful
   */
  async upload (body, contentType = 'text/plain') {
    const response = await this._fetch({
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': contentType
      },
      referrer: 'no-referrer',
      body
    });

    return response.headers.get('Ipfs-Hash');
  }

  /**
   * @param {string} cid
   * @return {Promise<{string}>} content
   */
  async download (cid) {
    const response = await this._fetch({
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain'
      },
      referrer: 'no-referrer'
    }, cid);

    return response.text();
  }

  /**
   * Attempts IPFS requests (cycling through gateway addresses).
   * @param request
   * @param {string} [cid]
   * @return {Promise<{}>} response object
   * @private
   */
  async _fetch (request, cid = '') {
    let response;
    const gateway = this._ipfsGateway;
    try {
      const url = cid ? urlJoin(gateway, cid) : gateway;
      response = await fetch(url, request);
      if (!response.ok) {
        response = null;
      }
    } catch (err) {
      console.error(err);
      response = null;
    }

    if (!response) {
      throw new Error(`IPFS request failed: ${JSON.stringify(request)}`);
    }

    return response;
  }
}
