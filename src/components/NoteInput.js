import React, { useState } from 'react';
import axios from 'axios';

const NoteInput = ({ onAddNote }) => {
    const [noteContent, setNoteContent] = useState('');
    const [transcribedContent, setTranscribedContent] = useState('');
    const [llmResponse, setLlmResponse] = useState('');
    const [recognition, setRecognition] = useState(null);
    const [transcriptionRecognition, setTranscriptionRecognition] = useState(null);
    const [noteWordCount, setNoteWordCount] = useState(0);
    const [transcribedWordCount, setTranscribedWordCount] = useState(0);

    const startDictation = () => {
        const newRecognition = new window.webkitSpeechRecognition();
        newRecognition.continuous = true; // Keep listening
        newRecognition.interimResults = true; // Show interim results
        newRecognition.lang = 'en-US'; // Set language

        newRecognition.onresult = (event) => {
            const interimTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setNoteContent(interimTranscript);
            updateWordCount(interimTranscript, setNoteWordCount);
        };

        newRecognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
        };

        newRecognition.onend = () => {
            console.log("Speech recognition service disconnected");
        };

        newRecognition.start();
        setRecognition(newRecognition);
    };

    const stopDictation = () => {
        if (recognition) {
            recognition.stop();
            setRecognition(null);
        }
    };

    const startTranscription = () => {
        const newTranscriptionRecognition = new window.webkitSpeechRecognition();
        newTranscriptionRecognition.continuous = true; // Keep listening
        newTranscriptionRecognition.interimResults = true; // Show interim results
        newTranscriptionRecognition.lang = 'en-US'; // Set language

        newTranscriptionRecognition.onresult = (event) => {
            const interimTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setTranscribedContent(interimTranscript);
            updateWordCount(interimTranscript, setTranscribedWordCount);
        };

        newTranscriptionRecognition.onerror = (event) => {
            console.error("Transcription error", event.error);
        };

        newTranscriptionRecognition.onend = () => {
            console.log("Transcription service disconnected");
        };

        newTranscriptionRecognition.start();
        setTranscriptionRecognition(newTranscriptionRecognition);
    };

    const stopTranscription = () => {
        if (transcriptionRecognition) {
            transcriptionRecognition.stop();
            setTranscriptionRecognition(null);
        }
    };

    const updateWordCount = (text, setWordCount) => {
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (noteContent.trim()) {
            onAddNote(noteContent);
            setNoteContent('');
            updateWordCount('', setNoteWordCount);
        }
    };

    const sendToLLM = async () => {
        const combinedText = `${noteContent} ${transcribedContent}`;

        console.log("Combined Text:", combinedText);
        console.log("API Key:", process.env.REACT_APP_GROQ_API_KEY);

        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                messages: [
                    {
                        role: "user",
                        content: `I want that my project should work like I want the functionality that the text from the second text box gets combined with the text from the first text box and the data is sent to the LLM model like Groq model and the output gets displayed in the third text box as the user has specified.`
                    },
                    {
                        role: "assistant",
                        content: `You want to create a UI component that allows users to combine text from two text boxes and send it to the Groq model.`
                    },
                    {
                        role: "user",
                        content: combinedText
                    }
                ],
                model: "llama3-8b-8192",
                temperature: 1,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            });

            const summary = response.data.choices[0]?.message?.content || "Unable to generate summary.";
            setLlmResponse(summary);
        } catch (error) {
            console.error('Error sending to LLM:', error);
            setLlmResponse('Failed to send to LLM. Please check your API key and permissions.');
        }
    };

    const saveResponse = () => {
        const contentToSave = llmResponse || "No response yet.";

        const blob = new Blob([contentToSave], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'your_response.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const speakResponse = () => {
        if (llmResponse) {
            const textToSpeak = llmResponse.replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '');
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            window.speechSynthesis.speak(utterance);

            utterance.onend = () => {
                console.log("Speech has finished.");
            };
        }
    };

    return (
        <div className="container">
            <h1>Voice to Text Note Taker</h1>
            <h2>Note Dictation</h2>
            <p>Word Count (Note): {noteWordCount}</p>
            <button onClick={startDictation}>Start Dictation</button>
            <button onClick={stopDictation} disabled={!recognition} style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Stop Dictation
            </button>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={noteContent}
                    onChange={(e) => {
                        setNoteContent(e.target.value);
                        updateWordCount(e.target.value, setNoteWordCount);
                    }}
                    placeholder="Type your note here..."
                />
                <button type="submit">Add Note</button>
            </form>

            <h2>Transcription</h2>
            <p>Word Count (Transcribed): {transcribedWordCount}</p>
            <button onClick={startTranscription}>Start Recording</button>
            <button onClick={stopTranscription} disabled={!transcriptionRecognition} style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Stop Recording
            </button>
            <textarea
                value={transcribedContent}
                onChange={(e) => {
                    setTranscribedContent(e.target.value);
                    updateWordCount(e.target.value, setTranscribedWordCount);
                }}
                placeholder="Transcribed content will appear here or type your task..."
                style={{ marginTop: '10px', height: '100px' }}
            />
            <p>Word Count (Output): {llmResponse ? llmResponse.trim().split(/\s+/).filter(word => word.length > 0).length : 0}</p>

            <button onClick={sendToLLM} style={{ marginTop: '20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Send to LLM
            </button>

            <button onClick={saveResponse} style={{ marginTop: '20px', marginLeft: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Save Response
            </button>

            <button onClick={speakResponse} style={{ marginTop: '20px', marginLeft: '10px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Speak Response
            </button>

            <div style={{ marginTop: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                <h3>Your Response Appears Here:</h3>
                <p>{llmResponse || "No response yet."}</p>
            </div>
        </div>
    );
};

export default NoteInput;
