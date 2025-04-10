import axios from 'axios';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

// Set up your API credentials
const API_KEY = '951471d9aff344dbbf551c17fa01e9ed';
const API_SECRET = '91465f303f004075b0d0dd96d529062c';

const oauth = new OAuth({
  consumer: { key: API_KEY, secret: API_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

const baseURL = 'https://api.thenounproject.com/v2';

interface NounProjectIcon {
  attribution: string;
  id: number;
  name: string;
  preview_url: string;
  permalink: string;
  // Add more fields if needed
}

async function searchIcons(term: string): Promise<NounProjectIcon[]> {
  const url = `${baseURL}/icon?query=${encodeURIComponent(term)}&include_svg=1&limit_to_public_domain=1`;

  const response = await getFromApi(url);

  const icons = response.data.icons as NounProjectIcon[];
  return icons;
}

async function getFromApi(url: string) {
    const request_data = {
        url,
        method: 'GET',
      };
    
    return await axios.get(url, {
        headers: oauth.toHeader(oauth.authorize(request_data)),
    });
}

export async function example() {
        // Example usage
    (async () => {
        try {
        const icons = await searchIcons('mandala');
        console.log(icons);
        } catch (error) {
        console.error('Error fetching icons:', error);
        }
    })();
}   

export async function downloadIcon(id: string) {
  const url = `${baseURL}/icon/${id}/download?color=000000&filetype=svg`; // 
  const response = await getFromApi(url);
  console.log(response.data.base64_encoded_file)


}
