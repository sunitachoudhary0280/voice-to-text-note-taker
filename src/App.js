import React, { useState } from 'react';
import NoteInput from './components/NoteInput';
import NoteList from './components/NoteList';
import './App.css';

const App = () => {
    const [notes, setNotes] = useState([]);

    const addNote = (noteContent) => {
        setNotes([...notes, noteContent]);
    };

    const deleteNote = (index) => {
        const newNotes = notes.filter((_, i) => i !== index);
        setNotes(newNotes);
    };

    return (
        <div className="container">
            <h1>Voice to Text Note Taker</h1>
            <p className="welcome-note">Welcome to Voice to Text Note Taker</p>
            <p className="welcome-note">Organize your thoughts, boost your productivity, and never forget an idea with Voice to Text Note Taker - your personal digital notebook.</p>
            <h2>Features</h2>
            <div className="features-container">
                <div className="feature-box">
                    <h3>📝 Quick Notes</h3>
                    <p>Jot down ideas instantly with our intuitive interface.</p>
                </div>
                <div className="feature-box">
                    <h3>✍️ Rich Text Editing</h3>
                    <p>Format your notes with ease using our powerful editor.</p>
                </div>
                <div className="feature-box">
                    <h3>☁️ Cloud Sync</h3>
                    <p>Access your notes from any device, anytime, anywhere.</p>
                </div>
                <div className="feature-box">
                    <h3>🏷️ Tags and Categories</h3>
                    <p>Organize your notes effortlessly with custom tags and categories.</p>
                </div>
                <div className="feature-box">
                    <h3>🔍 Search</h3>
                    <p>Find any note quickly with our advanced search feature.</p>
                </div>
                <div className="feature-box">
                    <h3>🤝 Collaboration</h3>
                    <p>Share and collaborate on notes with your team members.</p>
                </div>
            </div>
            <div className="get-started">
                <h2>Get Started</h2>
                <p>Ready to revolutionize the way you take notes?</p>
            </div>
            <NoteInput onAddNote={addNote} />
            <NoteList notes={notes} onDeleteNote={deleteNote} />
        </div>
    );
};

export default App;
