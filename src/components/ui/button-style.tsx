"use client";

import { createContext, useContext, type ReactNode } from "react";

/** Which button rendering a subtree uses. The public site is "metal"; admin stays "plain". */
export type ButtonStyle = "plain" | "metal";

const ButtonStyleContext = createContext<ButtonStyle>("plain");

export function ButtonStyleProvider({ value, children }: { value: ButtonStyle; children: ReactNode }) {
  return <ButtonStyleContext.Provider value={value}>{children}</ButtonStyleContext.Provider>;
}

export function useButtonStyle() {
  return useContext(ButtonStyleContext);
}
