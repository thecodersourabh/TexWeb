import { useAuth0 } from '@auth0/auth0-react';


export const Auth = () => {
  
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  
  return (
    <div style={{ 
      padding: '30px', 
      margin: '30px', 
      border: '5px solid red', 
      backgroundColor: 'yellow',
      fontSize: '20px'
    }}>
      <h1>🎉 SUPER SIMPLE Auth Component is Working!</h1>
      <p><strong>isAuthenticated:</strong> {String(isAuthenticated)}</p>
      <p><strong>isLoading:</strong> {String(isLoading)}</p>
      <p><strong>User exists:</strong> {String(!!user)}</p>
      {user && (
        <>
          <p><strong>User email:</strong> {user.email}</p>
          <p><strong>User name:</strong> {user.name}</p>
        </>
      )}
      {!isAuthenticated && (
        <button onClick={() => loginWithRedirect()} style={{ 
          padding: '15px', 
          fontSize: '18px',
          backgroundColor: 'green',
          color: 'white'
        }}>
          Login with Auth0
        </button>
      )}
      {isAuthenticated && (
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} style={{ 
          padding: '15px', 
          fontSize: '18px',
          backgroundColor: 'red',
          color: 'white'
        }}>
          Logout
        </button>
      )}
    </div>
  );
};
