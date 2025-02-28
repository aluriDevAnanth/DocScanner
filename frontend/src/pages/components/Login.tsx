import React, { FormEvent } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import AuthCon from "../../context/AuthPro";

export default function Login({ open, setOpen }) {
  const { user, auth, setAuth } = React.useContext(AuthCon);
  const [stage, setStage] = React.useState(1);
  const [error, setError] = React.useState("");

  async function login(e: FormEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${process.env.BASE_URL}/auth/login`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(data),
      });

      const res = await response.json();
      console.log(res);

      localStorage.setItem("DST", res.data.token);
      setAuth(res.data.token);

      setOpen(false);
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  async function register(e: FormEvent) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.cpassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${process.env.BASE_URL}/auth/register`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ ...data, role: "user" }),
      });

      const res = await response.json();
      console.log(res);

      localStorage.setItem("DST", res.data.token);
      setAuth(res.data.token);

      setOpen(false);
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  return (
    <Modal centered show={open} onHide={() => setOpen(false)}>
      <Modal.Header closeButton>
        <Modal.Title>You are not logged In</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {stage == 1 ? (
          <Form onSubmit={login}>
            <FloatingLabel
              controlId="floatingInput"
              label="Email address"
              className="mb-3"
            >
              <Form.Control
                name="username"
                type="email"
                placeholder="name@example.com"
              />
            </FloatingLabel>
            <FloatingLabel
              className="mb-3"
              controlId="floatingPassword"
              label="Password"
            >
              <Form.Control
                name="password"
                type="password"
                placeholder="Password"
              />
            </FloatingLabel>
            <div className="d-flex justify-content-between">
              <Button type="submit">Submit</Button>
              <Button variant="info" onClick={() => setStage(2)}>
                Don't have an account, Then Register.
              </Button>
            </div>
          </Form>
        ) : (
          <Form onSubmit={register}>
            <FloatingLabel
              controlId="floatingInput"
              label="Email address"
              className="mb-3"
            >
              <Form.Control
                name="username"
                type="email"
                placeholder="name@example.com"
              />
            </FloatingLabel>
            <FloatingLabel
              className="mb-3"
              controlId="floatingPassword111"
              label="Password"
            >
              <Form.Control
                name="password"
                type="password"
                placeholder="Password"
              />
            </FloatingLabel>

            <FloatingLabel
              className="mb-3"
              controlId="floatingPassword"
              label="Confirm Password"
            >
              <Form.Control
                name="cpassword"
                type="password"
                placeholder="Password"
              />
            </FloatingLabel>

            {error && (
              <div>
                <p
                  style={{ fontSize: "14px" }}
                  className="text-small ps-3 text-danger"
                >
                  {error}
                </p>
              </div>
            )}

            <div className="d-flex justify-content-between">
              <Button type="submit">Submit</Button>
              <Button variant="info" onClick={() => setStage(1)}>
                Login
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}
