const React = require("react");
import { useState } from "react";

import { create, writeTextFile, readTextFile, remove, BaseDirectory } from '@tauri-apps/plugin-fs';

function FileSystemTest() {
  const [fileContent, setFileContent] = useState("");
  const [message, setMessage] = useState("");

  // Create file
  async function createFile() {
    try {
      const file = await create("hello-world.txt", {
        baseDir: BaseDirectory.Document,
      });
      await file.write(new TextEncoder().encode("Hello, World!"));
      await file.close();
      setMessage("File created successfully!");
    } catch (error) {
      setMessage(`Error creating file: ${error}`);
    }
  }

  // Read file
  async function readFile() {
    try {
      const content = await readTextFile("hello-world.txt", {
        baseDir: BaseDirectory.Document,
      });
      setFileContent(content);
      setMessage("File read successfully!");
    } catch (error) {
      setMessage(`Error reading file: ${error}`);
    }
  }

  // Update file
  async function updateFile() {
    try {
      const newContent = `Hello, World! Updated at ${new Date().toLocaleString()}`;
      await writeTextFile("hello-world.txt", newContent, {
        baseDir: BaseDirectory.Document,
      });
      setMessage("File updated successfully!");
    } catch (error) {
      setMessage(`Error updating file: ${error}`);
    }
  }

  // Delete file
  async function deleteFile() {
    try {
      await remove("hello-world.txt", {
        baseDir: BaseDirectory.Document,
      });
      setFileContent("");
      setMessage("File deleted successfully!");
    } catch (error) {
      setMessage(`Error deleting file: ${error}`);
    }
  }

  return (
    <main className="container">
      <h1>Tauri File CRUD Example</h1>

      <div className="row" style={{ gap: '10px', marginBottom: '20px' }}>
        <button onClick={createFile}>Create File</button>
        <button onClick={readFile}>Read File</button>
        <button onClick={updateFile}>Update File</button>
        <button onClick={deleteFile}>Delete File</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Status:</h3>
        <p>{message}</p>
      </div>

      <div>
        <h3>File Content:</h3>
        <p>{fileContent}</p>
      </div>
    </main>
  );
}

export default FileSystemTest;
