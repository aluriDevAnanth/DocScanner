import { createBrowserRouter, RouterProvider } from "react-router";
import NotFound from "./pages/NotFound.tsx";
import Home from "./pages/Home.tsx";
import { AuthPro } from "./context/AuthPro.tsx";
import Credits from "./pages/Credits.tsx";
import CreditsLoader from "./pages/loaders/credits.tsx";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  {
    path: "/credits",
    element: <Credits />,
    loader: CreditsLoader,
    hydrateFallbackElement: <></>,
  },
  { path: "*", element: <NotFound /> },
]);
function App() {
  return (
    <>
      <AuthPro>
        <RouterProvider router={router} />
      </AuthPro>
    </>
  );
}

export default App;
