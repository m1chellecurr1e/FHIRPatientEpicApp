<script lang="ts">
  import { onMount } from 'svelte'; // Import onMount from Svelte

  // Step 1: Define SMART configuration
  const SMART_CONFIGURATION = {  
    clientId: '6f3057c5-5371-4313-a275-5db09aa3184e',
    scope: 'openid fhirUser',
    redirectUri: 'http://localhost:5174',
    FHIR_BASE_URL: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4'
  };

  // Step 2: Define endpoints
  const AUTH_ENDPOINT = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize';
  const TOKEN_ENDPOINT = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token';
  const TOKEN_KEY = 'smart_access_token';
  
  let error = null;
  let isAuthenticated = false; //define isAutheniticated at the top level
  let tokenString: string | null = null; // Declare a variable to hold the token string

  // Step 3: Function to exchange authorization code for access token
  async function exchangeCodeForToken(code: string) {
    try {
      console.log('Exchanging code for token...');
      
      const formData = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: SMART_CONFIGURATION.clientId,
        redirect_uri: SMART_CONFIGURATION.redirectUri
      });

      const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem('token_expiration', (Date.now() + data.expires_in * 1000).toString()); // Save expiration time
      localStorage.setItem('patient_id', data.patient); // Save patient ID
      isAuthenticated = true; // Set authenticated status to true after successful token exchange
      tokenString = data.access_token; // Store the token string for display
    } catch (e: unknown) { //specify the type of 'e' as unknown
      if (e instanceof Error) {
        error = e.message; // Access the message property if 
      } else {
        error = 'An unknown error occurred'; //Fallback for non-Error types
      } 
      console.error('Error exchanging code for token:', error);
    }
  }

  // Function to check if the token is expired
  function isTokenExpired(): boolean {
    const expiration = localStorage.getItem('token_expiration');
    return expiration ? Date.now() > parseInt(expiration) : true;
  }

  // On component mount, check for token expiration
  onMount(() => { // Wrap the logic in onMount
    if (isTokenExpired()) {
      localStorage.removeItem('patient_id'); // Clear patient ID if token is expired
      localStorage.removeItem(TOKEN_KEY); // Clear access token
      localStorage.removeItem('token_expiration'); // Clear expiration time
      isAuthenticated = false; // Set authenticated status to false
    } else {
      tokenString = localStorage.getItem(TOKEN_KEY); // Retrieve token string from local storage
      isAuthenticated = true; // Set authenticated status to true
    }
  });

  // Step 4: Check for code in URL
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const savedState = sessionStorage.getItem('smart_auth_state');

  console.log('Code:', code);
  console.log('State:', state);
  console.log('Saved State:', savedState);

  // Step 5: If code is present and valid, exchange it for a token
  if (code && state === savedState) {
      console.log('Code and state are valid, calling exchangeCodeForToken...');
    exchangeCodeForToken(code);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // Step 6: Function to initiate SMART authentication
  function initiateSMARTAuth() {
    const state = generateRandomState();
    sessionStorage.setItem('smart_auth_state', state);

    const SMART_AUTH_URL = new URL(AUTH_ENDPOINT);
    SMART_AUTH_URL.searchParams.set('response_type', 'code');
    SMART_AUTH_URL.searchParams.set('client_id', SMART_CONFIGURATION.clientId);
    SMART_AUTH_URL.searchParams.set('redirect_uri', SMART_CONFIGURATION.redirectUri);
    SMART_AUTH_URL.searchParams.set('scope', SMART_CONFIGURATION.scope);
    SMART_AUTH_URL.searchParams.set('state', state);

    window.location.href = SMART_AUTH_URL.toString();
  }

  // Step 7: Function to generate a random state
  function generateRandomState() {
    const array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return [...array].map(dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }
</script>

<style>
  .login-button {
    background-color: #007bff; /* Professional blue color */
    color: white; /* Text color */
    border: none; /* Remove border */
    padding: 10px 20px; /* Padding for the button */
    border-radius: 5px; /* Rounded corners */
    cursor: pointer; /* Pointer cursor on hover */
    font-size: 16px; /* Font size */
  }

  .login-container {
    display: flex; /* Use flexbox for centering */
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
    height: 100vh; /* Full viewport height */
  }
</style>

<!-- User Interface -->
<div class="login-container"> <!-- Added container for centering -->
  {#if !isAuthenticated}
    <button on:click={initiateSMARTAuth} class="login-button">Log Into EPIC</button> <!-- Button to launch SMART authentication -->
  {:else}
    <div>{tokenString}</div> <!-- Display the access token string after login -->
  {/if}
</div>

{#if isAuthenticated}
  <div class="banner">
    <h2>Welcome to your health information!</h2>
    <!-- Additional user information can be displayed here -->
  </div>
{/if}






