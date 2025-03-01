import express from "express";
import db from "../db/db.js";

const router = express.Router();

function processMultipartData(req) {
  const boundary = req.headers["content-type"]?.split("boundary=")[1];
  if (!boundary) throw new Error("Invalid multipart/form-data format");

  const username = req.headers["username"];
  if (!username) throw new Error("Missing username");

  const bodyText = req.body.toString();
  const parts = bodyText.split(`--${boundary}`);

  let fileContent = "";
  for (const part of parts) {
    if (part.includes('Content-Disposition: form-data; name="file"')) {
      fileContent = part.split("\r\n\r\n")[1]?.trim();
      break;
    }
  }

  if (!fileContent) throw new Error("File content is empty");

  return { username, fileContent };
}

function getWordFrequencies(text) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const frequencies = {};
  words.forEach((word) => (frequencies[word] = (frequencies[word] || 0) + 1));
  return frequencies;
}

function cosineSimilarity(vec1, vec2) {
  const words = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  let dotProduct = 0,
    mag1 = 0,
    mag2 = 0;

  words.forEach((word) => {
    const freq1 = vec1[word] || 0;
    const freq2 = vec2[word] || 0;
    dotProduct += freq1 * freq2;
    mag1 += freq1 ** 2;
    mag2 += freq2 ** 2;
  });

  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2) || 1);
}

router.post(
  "/scan",
  express.raw({ type: "multipart/form-data", limit: "2mb" }),
  (req, res) => {
    try {
      const { username, fileContent } = processMultipartData(req);

      if (!username || !fileContent) {
        return res
          .status(400)
          .json({ error: "Missing username or file content" });
      }

      const wordVector = JSON.stringify(getWordFrequencies(fileContent));

      let doc = db
        .prepare(
          "INSERT INTO documents (username, content, vector) VALUES (?, ?, ?)"
        )
        .run(username, fileContent, wordVector);

      let scan = db
        .prepare("INSERT INTO scans (username, document_id) VALUES (?, ?)")
        .run(username, doc.lastInsertRowid);

      const storedDocs = db
        .prepare("SELECT id, username, content, vector FROM documents")
        .all();

      const newVector = JSON.parse(wordVector);

      let similarDocs = storedDocs
        .map((doc) => ({
          username: doc.username,
          scan_id: scan.lastInsertRowid,
          similar_document_id: doc.id,
          similarity: cosineSimilarity(newVector, JSON.parse(doc.vector)),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      if (similarDocs.length > 0) {
        const placeholders = similarDocs.map(() => "(?, ?, ?)").join(", ");
        const values = similarDocs.flatMap(
          ({ scan_id, similar_document_id, similarity }) => [
            scan_id,
            similar_document_id,
            similarity,
          ]
        );

        db.prepare(
          `INSERT INTO similar_docs (scan_id, similar_document_id, similarity) VALUES ${placeholders}`
        ).run(...values);
      }

      const similarDocIds = similarDocs.map((doc) => doc.similar_document_id);
      const placeholders = similarDocIds.map(() => "?").join(", ");
      const similarDocContents = db
        .prepare(
          `SELECT id, content FROM documents WHERE id IN (${placeholders})`
        )
        .all(...similarDocIds);

      const contentMap = Object.fromEntries(
        similarDocContents.map((doc) => [doc.id, doc.content])
      );

      similarDocs = similarDocs.map((doc) => ({
        ...doc,
        content: contentMap[doc.similar_document_id],
      }));

      db.prepare(
        "UPDATE users SET credits = credits - 1 WHERE username = ?"
      ).run(username);

      const updatedUser = db
        .prepare("SELECT username, credits FROM users WHERE username = ?")
        .get(username);

      delete updatedUser.passwordHash;

      res.json({
        success: true,
        message:
          "File uploaded and scanned successfully, these are the top 5 similar documents.",
        data: { username, similarDocs, user: updatedUser },
      });
    } catch (error) {
      res.json({
        success: false,
        message: error.message,
        data: {},
      });
    }
  }
);

router.get("/matches/:docId", (req, res) => {
  const docId = req.params.docId;

  let similarDocs = db
    .prepare(
      `SELECT 
        s.id AS scan_id,
        s.username,
        s.document_id, 
        s.scan_timestamp,
        d.uploaded_at,
        sd.similar_document_id, 
        sd.similarity
        FROM scans s
        JOIN documents d ON s.document_id = d.id
        LEFT JOIN similar_docs sd ON s.id = sd.scan_id
        WHERE d.id = ?;
      `
    )
    .all(docId);

  const similarDocIds = similarDocs.map((doc) => doc.similar_document_id);
  const placeholders = similarDocIds.map(() => "?").join(", ");
  const similarDocContents = db
    .prepare(`SELECT id, content FROM documents WHERE id IN (${placeholders})`)
    .all(...similarDocIds);

  const contentMap = Object.fromEntries(
    similarDocContents.map((doc) => [doc.id, doc.content])
  );

  similarDocs = similarDocs.map((doc) => ({
    ...doc,
    content: contentMap[doc.similar_document_id],
  }));

  res.json({
    success: true,
    message: "Document matches retrieved successfully",
    data: { similarDocs },
  });
});

export default router;
