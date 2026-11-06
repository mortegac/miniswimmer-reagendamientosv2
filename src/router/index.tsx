import { useRoutes } from "react-router-dom";

import ErrorPage from "../pages/public/ErrorPage";
import ErrorDataPage from "../pages/public/ErrorDataPage";
import { publicRoutes } from "./PublicRoute";


// import Layout from "../themes";

function Router() {
  const routes = [
    { ...publicRoutes },
    {
      path: "500",
      element: <ErrorDataPage />,
    },
    {
      path: "*",
      element: <ErrorPage />,
    },
  ];

  const element = useRoutes(routes);

  return (
    <div
      className={[
        "bg-gradient-to-b from-slate-200/70 to-slate-50 relative min-h-screen",
        "before:content-[''] before:h-[370px] before:w-screen before:left-0 before:top-0 before:fixed before:bg-gradient-to-t before:from-theme-1/80 before:to-theme-2",
        "after:content-[''] after:h-[370px] after:w-screen after:left-0 after:top-0 after:fixed after:bg-texture-white after:bg-contain after:bg-fixed after:bg-[center_-13rem] after:bg-no-repeat",
      ].join(" ")}
    >
      <div className="relative z-10 pb-10">{element}</div>
    </div>
  );
}

export default Router;

