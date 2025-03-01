import { createContext, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  auth: string | null;
  setAuth: React.Dispatch<React.SetStateAction<string>>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AuthCon = createContext<AuthContextType>({
  user: null,
  auth: null,
  setAuth: () => {},
});

import { ReactNode } from "react";

interface AuthProProps {
  children: ReactNode;
}

export function AuthPro({ children }: AuthProProps) {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(localStorage.getItem("DST"));

  useEffect(() => {
    if (auth) {
      (async () => {
        const res = await (
          await fetch(`${process.env.BASE_URL}/auth/auth`, {
            headers: { Authorization: `Bearer ${auth}` },
          })
        ).json();

        setUser(res.data.user);
      })();
    } else {
      setUser(null);
    }
  }, [auth]);

  return (
    <AuthCon.Provider value={{ user, auth, setAuth, setUser }}>
      {children}
    </AuthCon.Provider>
  );
}

export default AuthCon;
