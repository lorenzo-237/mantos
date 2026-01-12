export interface UserRequest {
  id: number;
  username: string;
  token: string;
  theme: string;
  isAdmin: boolean;
  mantis: {
    user: {
      id: number;
      name: string;
    };
  };
}

export interface UserBlaster {
  id: number;
  username: string;
  password: string;
  token: string;
  socket_id: string;
  isAdmin: boolean;
  theme: string;
}
