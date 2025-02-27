const React = require("react");
import { useState, useRef, useEffect } from "react";
import { create, remove, readDir, readFile, BaseDirectory } from '@tauri-apps/plugin-fs';

function FileSystemTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    listRecordings();
    // Initialize audio element
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setCurrentlyPlaying(null);
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Start recording
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          sampleSize: 16,
        } 
      });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Create a file system-friendly name
        const date = new Date();
        const fileName = `recording-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}.webm`;
        
        try {
          const file = await create(fileName, {
            baseDir: BaseDirectory.Document,
          });
          await file.write(uint8Array);
          await file.close();
          setMessage("Recording saved successfully!");
          listRecordings();
        } catch (error) {
          setMessage(`Error saving recording: ${error}`);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setMessage("Recording started...");
    } catch (error) {
      setMessage(`Error starting recording: ${error}`);
    }
  }

  // Stop recording
  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMessage("Recording stopped.");
    }
  }

  // List recordings
  async function listRecordings() {
    try {
      const entries = await readDir(".", {
        baseDir: BaseDirectory.Document,
      });
      const recordingFiles = entries
        .filter(entry => entry.name?.endsWith('.webm'))
        .map(entry => entry.name as string);
      setRecordings(recordingFiles);
    } catch (error) {
      setMessage(`Error listing recordings: ${error}`);
    }
  }

  // Delete recording
  async function deleteRecording(fileName: string) {
    try {
      await remove(fileName, {
        baseDir: BaseDirectory.Document,
      });
      setMessage(`${fileName} deleted successfully!`);
      listRecordings();
    } catch (error) {
      setMessage(`Error deleting recording: ${error}`);
    }
  }

  // Play recording
  async function playRecording(fileName: string) {
    try {
      if (currentlyPlaying === fileName) {
        // Stop playing if it's already playing
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setCurrentlyPlaying(null);
        return;
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Read the file
      const audioData = await readFile(fileName, {
        baseDir: BaseDirectory.Document,
      });
      
      // Create blob with proper MIME type
      const blob = new Blob([audioData], { 
        type: 'audio/webm;codecs=opus'
      });
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        try {
          audioRef.current.src = url;
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setCurrentlyPlaying(fileName);
              })
              .catch(error => {
                console.error("Playback error:", error);
                setMessage(`Error playing audio: ${error}`);
                URL.revokeObjectURL(url);
                setCurrentlyPlaying(null);
              });
          }
          
          // Clean up the URL when done
          audioRef.current.onended = () => {
            URL.revokeObjectURL(url);
            setCurrentlyPlaying(null);
          };
        } catch (playError) {
          console.error("Audio setup error:", playError);
          setMessage(`Error setting up audio: ${playError}`);
          URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error("File reading error:", error);
      setMessage(`Error reading file: ${error}`);
    }
  }

  return (
    <main className="container">
      <h1>Audio Recorder</h1>

      <div className="row" style={{ gap: '10px', marginBottom: '20px' }}>
        {!isRecording ? (
          <button onClick={startRecording}>Start Recording</button>
        ) : (
          <button onClick={stopRecording}>Stop Recording</button>
        )}
        <button onClick={listRecordings}>Refresh Recordings</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Status:</h3>
        <p>{message}</p>
      </div>

      <div>
        <h3>Recordings:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {recordings.map((fileName) => (
            <li key={fileName} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '10px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}>
              <span>{fileName}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => playRecording(fileName)}
                  style={{
                    backgroundColor: currentlyPlaying === fileName ? '#ff4444' : '#4CAF50',
                  }}
                >
                  {currentlyPlaying === fileName ? 'Stop' : 'Reproducir'}
                </button>
                <button onClick={() => deleteRecording(fileName)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default FileSystemTest;
