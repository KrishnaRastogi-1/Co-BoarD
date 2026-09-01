"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { userDetailContext } from "../../context/userDetailContext";

export default function Provider({ children }: { children: React.ReactNode }) {
    const [userDetails, setUserDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isSignedIn, isLoaded } = useUser();

    useEffect(() => {
        const createNewUser = async () => {
            try {
                const result = await axios.post("/api/users");
                console.log(result.data);
                setUserDetails(result.data);
            } catch (err) {
                console.error("Failed to sync user:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoaded && isSignedIn) {
            createNewUser();
        } else if (isLoaded && !isSignedIn) {
            // Clerk finished loading and confirmed no session — nothing to fetch
            setIsLoading(false);
        }
    }, [isLoaded, isSignedIn]);

    return (
        <userDetailContext.Provider value={{ userDetails, setUserDetails, isLoading }}>
            <div>{children}</div>
        </userDetailContext.Provider>
    );
}