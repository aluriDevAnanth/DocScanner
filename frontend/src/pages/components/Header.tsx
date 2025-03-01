import { useEffect, useContext, useState } from "react";
import { Link } from "react-router";
import AuthCon from "../../context/AuthPro";
import Login from "./Login";

export default function Header() {
  const currTheme = localStorage.getItem("DocScannerTheme");
  const { user, setAuth } = useContext(AuthCon);
  const [open, setOpen] = useState(false);

  function changeTheme() {
    if (document.documentElement.getAttribute("data-bs-theme") == "dark") {
      document.documentElement.setAttribute("data-bs-theme", "light");
      localStorage.setItem("DocScannerTheme", "light");
    } else {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("DocScannerTheme", "dark");
    }
  }

  async function logout() {
    try {
      localStorage.removeItem("DST");
      setAuth("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-bs-theme",
      currTheme || "light"
    );
  }, []);

  return (
    <div className="container-fluid">
      <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
        <div className="col-md-3 mb-2 mb-md-0 d-flex">
          <Link
            to="/"
            className="d-inline-flex link-body-emphasis text-decoration-none me-4"
          >
            <h3>Doc Scanner</h3>
          </Link>
          {user && <h6 className="my-auto">Hi, {user?.username}!</h6>}
        </div>
        <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
          <li>
            <Link
              to="/"
              aria-disabled={window.location.pathname == "/"}
              className={`nav-link px-2 ${
                window.location.pathname == "/" ? "link-secondary" : ""
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/credits"
              aria-disabled={window.location.pathname == "/credits"}
              className={`nav-link px-2 ${
                window.location.pathname == "/credits" ? "link-secondary" : ""
              }`}
            >
              Credits
            </Link>
          </li>
        </ul>
        <div className="col-md-3 text-end d-flex">
          {user && (
            <div className="my-auto me-3">Current Credits: {user.credits}</div>
          )}

          {!user ? (
            <>
              <button
                onClick={() => setOpen(true)}
                type="button"
                className="btn btn-primary me-2"
              >
                Login
              </button>
            </>
          ) : (
            <>
              <button onClick={logout} className="btn btn-danger  me-2">
                Logout
              </button>
            </>
          )}
          <button
            onClick={changeTheme}
            className="btn btn-dark shadow"
            id="btnSwitch"
          >
            Toggle Theme
          </button>
        </div>
      </header>
      <Login open={open} setOpen={setOpen} />
    </div>
  );
}
