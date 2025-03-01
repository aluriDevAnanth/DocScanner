import React, { FormEvent, useContext, useState } from "react";
import Header from "./components/Header";
import {
  Button,
  Container,
  Form,
  InputGroup,
  Modal,
  Table,
} from "react-bootstrap";
import { useLoaderData } from "react-router";
import * as date from "../utils/date";
import AuthCon from "../context/AuthPro";

export interface Credits {
  id?: number;
  username: string;
  requested_credits: number;
  status: string;
  created_at: string;
}

function Clock() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const difference = midnight - now;

    if (difference <= 0) {
      return "00h 00m 00s";
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const format = (value) => (value < 10 ? `0${value}` : value);
    return `${format(hours)}h ${format(minutes)}m ${format(seconds)}s`;
  };

  return (
    <div className="text-center w-100">
      <div className="fs-3">
        Time until Credit Reset: {getTimeUntilMidnight()}
      </div>
    </div>
  );
}

export default function Credits() {
  const [open, setOpen] = useState(false);
  const { auth } = useContext(AuthCon);
  const creditsData: Credits[] = useLoaderData();

  const [credits, setCredits] = React.useState<Credits[]>(
    creditsData.map((q) => {
      delete q.id;
      return q;
    }) || []
  );

  async function requestCredits(e: FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    console.log(data);
    try {
      const response = await fetch(`${process.env.BASE_URL}/credits/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth}`,
        },
        body: JSON.stringify(data),
      });

      const res = await response.json();
      console.log(res);
      setCredits(res.data.credit_requests);
      setOpen(false);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  return (
    <div>
      <Modal centered show={open} onHide={() => setOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Request Credits</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={requestCredits}>
            <InputGroup className="mb-3">
              <InputGroup.Text>Number Of Credits</InputGroup.Text>
              <Form.Control name="requested_credits" type="number" required />
            </InputGroup>
            <div>
              <Button type="submit">Submit</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <Header />
      <Container className="d-flex">
        <Clock />
        <div>
          <Button onClick={() => setOpen(true)}>Request</Button>
        </div>
      </Container>
      <Container className="mt-3">
        {credits.length > 0 && (
          <Table striped bordered hover>
            <thead>
              <tr>
                {Object.keys(credits[0]).map((k, i) => (
                  <th key={i}>{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {credits.map((c, i) => (
                <tr key={i}>
                  {Object.keys(credits[0]).map((k, ii) => (
                    <td key={ii}>
                      {k == "created_at" ? date.formatDate(c[k]) : c[k]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </div>
  );
}
