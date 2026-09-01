// context/userDetailContext.ts
import { createContext } from "react";

export interface UserDetails {
    id: string;
    name: string | null;
    email: string;
}

interface UserDetailContextType {
    userDetails: UserDetails | null;
    setUserDetails: React.Dispatch<React.SetStateAction<UserDetails | null>>;
    isLoading?: boolean;
}

export const userDetailContext = createContext<UserDetailContextType>({
    userDetails: null,
    setUserDetails: () => {},
    isLoading: true,
});