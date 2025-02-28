import { createBrowserRouter, RouterProvider } from "react-router";
import NotFound from "./pages/NotFound.tsx";
import Home from "./pages/Home.tsx";
import { AuthPro } from "./context/AuthPro.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    /* children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
    ], */
  },
  { path: "*", element: <NotFound /> }, // Catch-all 404 page
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
