"use client";

import { setupListeners } from "@reduxjs/toolkit/query";
import { Provider } from "react-redux";

import { makeStore, type AppStore } from "@/store/store";
import React, { useEffect, useState } from "react";

const ReduxProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState<AppStore>(makeStore);

  useEffect(() => setupListeners(store.dispatch), [store]);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

export default ReduxProvider;
