import React, { useState } from "react";
import "./AudioInterviewApp.css"; // Import CSS file

const QUESTIONS = [
  "Please tell us your first name.",
  "Please tell us your last name.",
  "What is your mobile number?",
  "What is your email address?",
];

export default function AudioInterviewApp() {
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(""));
  const [submitted, setSubmitted] = useState(Array(QUESTIONS.length).fill(false));
  const [status, setStatus] = useState("Idle");
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);

  function speak(text, callback) {
    if (!("speechSynthesis" in window)) {
      alert("Speech Synthesis not supported");
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.onend = callback;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function startListening(index) {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus(`🎤 Listening for answer to Question ${index + 1}...`);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswers((prev) => {
        const updated = [...prev];
        updated[index] = transcript;
        return updated;
      });
      setStatus(`✅ Answer recorded for Question ${index + 1}`);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setStatus("❌ Error in speech recognition");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  function handleAsk(index) {
    setCurrentIndex(index);
    setStatus(`🗣️ Speaking Question ${index + 1}...`);
    speak(QUESTIONS[index], () => {
      setStatus("🎤 Question spoken. Start answering...");
      startListening(index);
    });
  }

  function handleInputChange(index, value) {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }

  function handleIndividualSubmit(index) {
    if (!answers[index]) {
      alert("Please record or type an answer before submitting.");
      return;
    }

    const confirmSubmit = window.confirm(
      `Submit your answer for Question ${index + 1}?`
    );

    if (confirmSubmit) {
      setSubmitted((prev) => {
        const updated = [...prev];
        updated[index] = true;
        return updated;
      });
      setStatus(`✅ Answer for Question ${index + 1} submitted.`);
    } else {
      setAnswers((prev) => {
        const updated = [...prev];
        updated[index] = "";
        return updated;
      });
      setStatus(`Answer for Question ${index + 1} reset.`);
    }
  }

  function handleSubmitAll() {
    if (answers.some((a) => !a)) {
      alert("Please answer all questions before submitting all.");
      return;
    }
    console.log("Final Answers:", answers);
    alert("✅ All answers submitted successfully!");
  }

  return (
    <div className="container">
      <div className="form-card">
        <h1 className="form-title">🎙️ Audio Interview Form</h1>
        <p className="form-subtitle">
          The system will ask each question aloud. You can speak your answer,
          edit it manually, and submit when ready.
        </p>

        <div className="status-box">
          <strong>Status:</strong> {status}
        </div>

        <form>
          {QUESTIONS.map((q, i) => (
            <div
              key={i}
              className={`question-card ${submitted[i] ? "submitted" : ""}`}
            >
              <div className="question-header">
                <h2>Question {i + 1}</h2>
                {submitted[i] && <span className="submitted-label">✅ Submitted</span>}
              </div>

              <p className="question-text">{q}</p>

              <textarea
                className="answer-box"
                rows="3"
                placeholder="Your answer will appear here..."
                value={answers[i]}
                onChange={(e) => handleInputChange(i, e.target.value)}
                disabled={submitted[i]}
              />

              <div className="button-group">
                <button
                  type="button"
                  className={`btn ${isListening && currentIndex === i ? "btn-yellow" : "btn-blue"}`}
                  onClick={() => handleAsk(i)}
                  disabled={isListening || submitted[i]}
                >
                  {isListening && currentIndex === i ? "🎤 Listening..." : "Ask & Record"}
                </button>

                {!submitted[i] && (
                  <button
                    type="button"
                    className="btn btn-green"
                    onClick={() => handleIndividualSubmit(i)}
                  >
                    Submit Answer
                  </button>
                )}
              </div>
            </div>
          ))}
        </form>

        <div className="submit-all">
          <button onClick={handleSubmitAll} className="btn btn-indigo">
            🚀 Submit All Answers
          </button>
        </div>

        <p className="tip">
          💡 Tip: Works best in Chrome or Edge. Allow microphone access.
        </p>
      </div>
    </div>
  );
}
