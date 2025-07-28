# Quick Debug Tips for Testing Auth0 Token Exchange

## What to Look For in Updated Logs

### 1. Token Exchange Initiation
Look for these specific log messages:
```
⚠️ DeepLinkHandler: Auth0 client not found, using manual token exchange
🔄 DeepLinkHandler: About to call exchangeCodeForTokens with: {code: '...', state: '...', hasAccessToken: false}
💱 DeepLinkHandler: Starting token exchange process...
```

### 2. HTTP Request Details
```
📡 DeepLinkHandler: Making token exchange request to: https://dev-arrows.au.auth0.com/oauth/token
📡 DeepLinkHandler: Request body: {grant_type: 'authorization_code', client_id: '...', code: '...', redirect_uri: 'com.texweb.app://callback'}
📡 DeepLinkHandler: Token exchange response status: 200
```

### 3. Token Storage
```
✅ DeepLinkHandler: Token exchange successful
💾 DeepLinkHandler: Storing Auth0 tokens...
💾 DeepLinkHandler: Stored tokens with key: @@auth0spajs@@::wyCAzyDQa7umHNaXCColuKkLtx0pkX0G::https://dev-arrows.au.auth0.com/api/v2/::openid profile email
👤 DeepLinkHandler: Stored user info: {sub: '...', email: '...', name: '...'}
✅ DeepLinkHandler: Token storage verified successfully
```

## Key Changes Made

1. **Fixed Content-Type**: Changed from `application/json` to `application/x-www-form-urlencoded`
2. **Fixed Request Body**: Using `URLSearchParams` instead of JSON.stringify
3. **Improved Token Storage**: Better key format and verification
4. **Enhanced Logging**: More detailed debug information

## Testing Steps

1. Open the updated Android app
2. Tap sign in and complete authentication
3. Check the console logs for the new debug messages
4. Verify that tokens are stored in localStorage
5. Check if the navigation updates to show user profile

## If Token Exchange Still Fails

Look for error messages like:
- `❌ DeepLinkHandler: Token exchange failed: 400 {error details}`
- Check if the redirect URI in Auth0 dashboard matches exactly: `com.texweb.app://callback`
- Verify the Auth0 client configuration allows authorization code flow

## Auth0 Dashboard Settings to Verify

1. **Application Type**: Single Page Application
2. **Allowed Callback URLs**: `com.texweb.app://callback`
3. **Grant Types**: Authorization Code, Refresh Token
4. **Token Endpoint Authentication Method**: None (for SPA)
