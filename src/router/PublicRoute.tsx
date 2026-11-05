import { lazy, useEffect } from "react";
import { Outlet } from "react-router-dom";

import {
    PUBLIC,
    PRIVATE_DASHBOARD,
    PUBLIC_TOKEN,
    PUBLIC_RETURN,
    PUBLIC_RETURN_TOKEN,
    PUBLIC_INVOICE,
    PUBLIC_FAILED,
    PUBLIC_RETURN_MP,
  } from "./paths";
  
  // import Layout from "../themes";
  
  const Payment = lazy(() => import("../pages/public/Payment"));
  const Access = lazy(() => import("../pages/public/Access"));
  const Dashboard = lazy(() => import("../pages/private/Dashboard"));
  // const Return = lazy(() => import("../pages/public/Return"));
  import Return from "../pages/public/Return";
  import ReciboPago from "../pages/public/Recibo-pago";
  import RechazoPago from "../pages/public/Rechazo-pago";
  import ReturnMP from "../pages/public/ReturnMP";
  
export const publicRoutes = {
    path: PUBLIC,
    // element: <PublicValidation />,
    children: [
        {
          path: PUBLIC,
          element: <Access />,
        },
        {
          path: PRIVATE_DASHBOARD,
          element: <Dashboard />,
        },
        {
          path: PUBLIC_TOKEN,
          element: <Payment />,
        },
        {
          path: PUBLIC_RETURN,
          element: <Return />,
        },
        {
          path: PUBLIC_RETURN_TOKEN,
          element: <Return />,
        },
        {
          path: PUBLIC_INVOICE,
          element: <ReciboPago />,
        },
        {
          path: PUBLIC_FAILED,
          element: <RechazoPago />,
        },
        {
          path: PUBLIC_RETURN_MP,
          element: <ReturnMP />,
        },

      ],
  };