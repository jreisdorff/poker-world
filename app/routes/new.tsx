import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import "./index.css";
import * as THREE from "three";
import { useEffect, useState } from "react";
import { createRoot, hydrateRoot } from 'react-dom/client';
import Pag3DModel from "~/components/Pag3DModel";

// Global variable used to open info dialog only on first visit
declare global {
  interface Window {
    isFirstVisit: boolean;
  }
}

export default function NewPage() {

    const [created, setCreated] = useState(false);

    useEffect(() => {
        if (document && typeof window !== "undefined" && !created) {
            const container = document.getElementById('root');
            const root = hydrateRoot(container!, <Pag3DModel />);
            setCreated(true);        
        }
    });

  return null;
}
