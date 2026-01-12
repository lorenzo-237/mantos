export interface UserInfo {
  id: number;
  username: string;
  token: string; // Mantis API token
  theme: 'Clair' | 'Sombre';
  isAdmin: boolean;
  mantis: {
    user: {
      id: number;
      name: string;
    };
  };
}

export interface LoginRequest {
  username: string;
  password: string;
  ldap: boolean;
}

export interface LoginResponse {
  user: UserInfo;
  token: string; // JWT Mantos
}
