import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getLogoutUri } from '../utils/getRedirectUri';
import { UserService } from '../services';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  logout: () => void;
  loginWithRedirect: () => void;
  userCreated: boolean;
  creatingUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
    isLoading,
  } = useAuth0();

  const [userCreated, setUserCreated] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // Handle user creation when authenticated
  useEffect(() => {
    const createUserIfNeeded = async () => {
      
      if (!isAuthenticated) {
        return;
      }
      
      if (!user?.sub || !user?.email) {
        return;
      }
      
      if (userCreated || creatingUser) {
        return;
      }

      try {
        setCreatingUser(true);
        
        // Extract user details from Auth0 token
        const userData = {
          email: user.email,
          name: user.name || '',
          password: '', // Placeholder password for OAuth users
          phoneNumber: user.phone_number || '000-000-0000'
        };
        
        // Check if user already exists, then create if needed
        let apiUser;
        try {
          // First, check if user already exists by email
          apiUser = await UserService.getUserByEmail(user.email);
          
          if (apiUser) {
            // User already exists, store the mapping
            localStorage.setItem(`auth0_${user.sub}`, apiUser.id);
          } else {
            // User doesn't exist, create new user
            apiUser = await UserService.createUser(userData);
            
            // Store the mapping between Auth0 ID and API user ID
            if (apiUser && apiUser.id) {
              localStorage.setItem(`auth0_${user.sub}`, apiUser.id);
            }
          }
        } catch (error: any) {
          console.error('❌ Error during user creation/lookup:', error);
        }
        
        // Mark user creation as completed (whether successful or user already exists)
        setUserCreated(true);
      } catch (error) {
        console.error('AuthContext - Error processing user:', error);
      } finally {
        setCreatingUser(false);
      }
    };

    createUserIfNeeded();
  }, [isAuthenticated, user, userCreated, creatingUser]);

  const value = {
    isAuthenticated,
    user,
    loading: isLoading || creatingUser,
    logout: () => logout({ logoutParams: { returnTo: getLogoutUri() } }),
    loginWithRedirect,
    userCreated,
    creatingUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
