export async function handleSMARTCallback(code: string) {
  const SMART_TOKEN_URL = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token';
  
  try {
    const tokenResponse = await fetch(SMART_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: SMART_CONFIGURATION.clientId,
        redirect_uri: SMART_CONFIGURATION.redirectUri
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`HTTP error! status: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    // Store the access token securely
    localStorage.setItem('smart_access_token', tokenData.access_token);
    
    return tokenData;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}

export const load = async ({ url }) => {
  console.log('Callback URL:', url.toString());
  const code = url.searchParams.get('code');
  console.log('Received code:', code);
  
  if (!code) {
    console.error('No code found in URL');
    throw new Error('No code provided');
  }

  try {
    console.log('Attempting to exchange code for token...');
    const tokenData = await handleSMARTCallback(code);
    console.log('Token Data:', tokenData);
    
    // Test if token is stored
    const storedToken = localStorage.getItem('smart_access_token');
    console.log('Stored token:', storedToken);

    return {
      success: true
    };
  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
}; 

async function testFHIRAccess() {
  const accessToken = localStorage.getItem('smart_access_token');
  if (!accessToken) {
    console.error('No access token found');
    return;
  }

  try {
    const response = await fetch(`${SMART_CONFIGURATION.FHIR_BASE_URL}/Patient`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('FHIR test successful:', data);
    } else {
      console.error('FHIR test failed:', response.status);
    }
  } catch (error) {
    console.error('FHIR test error:', error);
  }
} 