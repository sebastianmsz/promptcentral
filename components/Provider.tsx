"use client";
import React, { memo } from "react";
import { SessionProvider } from "next-auth/react";
import { ProviderProps } from "@types";

const Provider = memo(({ children }: ProviderProps) => {
	return <SessionProvider>{children}</SessionProvider>;
});

Provider.displayName = "Provider";
export default Provider;
