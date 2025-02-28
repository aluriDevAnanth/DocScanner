import Header from "./components/Header";
import Form from "react-bootstrap/Form";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import AuthCon from "../context/AuthPro";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Login from "./components/Login";
import Card from "react-bootstrap/Card";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const { user, auth, setAuth, setUser } = useContext(AuthCon);
  const [open, setOpen] = useState(false);
  const [similarDocs, setSimilarDocs] = useState([]);

  async function postScan(e: FormEvent) {
    e.preventDefault();
    if (!auth) return setOpen(true);

    const data = new FormData(e.target as HTMLFormElement);
    if (file) {
      data.append("file", file);
    }

    try {
      const response = await fetch(`${process.env.BASE_URL}/scan`, {
        headers: { username: "qqq@qqq.com" },
        method: "POST",
        body: data,
      });

      const res = await response.json();
      console.log(res);

      setSimilarDocs(res.data.similarDocs);
      setUser(res.data.user);
    } catch (error) {
      console.error("Error scanning file:", error);
    }
  }

  return (
    <div>
      <Header />
      <Login open={open} setOpen={setOpen} />
      <div className="container">
        <div className="container">
          <Form onSubmit={postScan}>
            <div className="d-flex column-gap-3">
              <Form.Group
                controlId="formFile"
                className="mb-3 d-flex flex-fill column-gap-3"
              >
                <Form.Label className="my-auto">Upload file to Scan</Form.Label>
                <div className="flex-fill">
                  <Form.Control
                    type="file"
                    required
                    name="file"
                    accept=".txt,.pdf,.docx"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFile(e.target.files?.[0] ?? null);
                    }}
                  />
                </div>
              </Form.Group>
              <div>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </div>
            </div>
          </Form>
        </div>
        <div className="container">
          <h2 className="mb-3 mt-3">Similar Documents</h2>
          <div className="d-flex column-gap-3 row-gap-3 flex-wrap">
            {similarDocs &&
              similarDocs.map((data, i) => {
                return (
                  <Card key={i} style={{ width: "18rem" }}>
                    <Card.Body>
                      <Card.Title>{data.similar_document_id}</Card.Title>
                      <Card.Text>
                        Similarity: {parseFloat(data.similarity).toFixed(2)}
                      </Card.Text>
                      <Card.Text>{data.content}</Card.Text>
                    </Card.Body>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
