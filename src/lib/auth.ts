export const SMART_CONFIGURATION = {  
//Set up constants for SMART configuration
  clientId: '6f3057c5-5371-4313-a275-5db09aa3184e',
  scope: 'launch/patient openid fhirUser',
  redirectUri: 'http://localhost:5175/callback', // Adjust as needed
  FHIR_BASE_URL: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4' // e.g., 'https://launch.smarthealthit.org/v/r4/fhir'
};

export function initiateSMARTAuth() {
  const state = generateRandomState();
  sessionStorage.setItem('smart_auth_state', state);

  // Changed base URL to use interconnect-fhir-oauth
  const SMART_AUTH_URL = new URL('https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize');
  
  SMART_AUTH_URL.searchParams.set('client_id', SMART_CONFIGURATION.clientId);
  SMART_AUTH_URL.searchParams.set('response_type', 'code');
  SMART_AUTH_URL.searchParams.set('scope', SMART_CONFIGURATION.scope);
  SMART_AUTH_URL.searchParams.set('redirect_uri', SMART_CONFIGURATION.redirectUri);
  SMART_AUTH_URL.searchParams.set('state', state);
  
  // Remove aud and iss parameters if doing standalone launch
  // SMART_AUTH_URL.searchParams.set('aud', SMART_CONFIGURATION.FHIR_BASE_URL);
  // SMART_AUTH_URL.searchParams.set('iss', SMART_CONFIGURATION.FHIR_BASE_URL);

  console.log('Auth URL:', SMART_AUTH_URL.toString());
  window.location.href = SMART_AUTH_URL.toString();
}

function generateRandomState() {
  return Math.random().toString(36).substring(2);
}
