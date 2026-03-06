import { createContext, type ReactNode, useContext } from "react";

interface AuthContextValue {
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
}

const AuthContext = createContext<AuthContextValue>({});

export function useAuthContext() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
}

export function AuthProvider({ children, privacyUrl, termsUrl, helpUrl }: AuthProviderProps) {
  return (
    <AuthContext.Provider value={{ privacyUrl, termsUrl, helpUrl }}>
      {children}
    </AuthContext.Provider>
  );
}
