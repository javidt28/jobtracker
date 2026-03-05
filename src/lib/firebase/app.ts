"use client";

import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFirebaseConfig } from "./config";

function getApp() {
  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId) return null;
  const apps = getApps();
  if (apps.length) return apps[0];
  return initializeApp(config);
}

export function getFirebaseAuth() {
  const app = getApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseFirestore() {
  const app = getApp();
  return app ? getFirestore(app) : null;
}
