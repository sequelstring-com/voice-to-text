import React, { useState } from "react";
import "./ExcelStyleForm.css";

export default function ExcelStyleForm() {
  const rows = Array.from({ length: 10 }, (_, i) => i + 1);
  const [isListening, setIsListening] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const weldingHeaders = [
    "KP Section",
    "Weld ID",
    "WPS Number",
    "Material Gr I",
    "Material Gr II",
    "Size (Inch)",
    "Size (mm)",
    "Weld Side",
    "Root / Hot",
    "Fill 1",
    "Fill 2",
    "Cap",
    "Fit up",
    "Final",
    "Material.",
    "Comb.",
    "Pipe No / Spl. No.",
    "Pipe length (mtrs)",
    "Remarks"
  ];


  // 🎙 Unified voice input handler (Electron Whisper)
  const handleVoiceInput = async (event) => {
    const input = event.target.previousSibling;
    const fieldLabel =
      input.getAttribute("data-label") || "this field";

    if (!window.electronAPI || !window.electronAPI.startListening) {
      alert("Electron API not available. Make sure preload.js is loaded.");
      return;
    }

    try {
      setIsListening(true);
      setActiveInput(input);

      // Speak prompt (browser TTS is fine for UX)
      const utterance = new SpeechSynthesisUtterance(`Please say ${fieldLabel}`);
      window.speechSynthesis.speak(utterance);

      // Wait for TTS to finish
      await new Promise((resolve) => (utterance.onend = resolve));

      console.log("🎙 Asking Whisper to listen...");
      const transcript = await window.electronAPI.startListening();
      console.log("✅ Whisper result:", transcript);


      input.value = transcript;
    } catch (err) {
      console.error("Error using voice input:", err);
      alert("Voice input failed. Check mic or Whisper setup.");
    } finally {
      setIsListening(false);
      setActiveInput(null);
    }
  };

  const renderInput = (defaultValue = "", label = "") => (
    <div className="input-with-mic">
      <input type="text" defaultValue={defaultValue} data-label={label} />
      <button
        type="button"
        className={`mic-btn ${isListening && activeInput?.getAttribute("data-label") === label
          ? "mic-active"
          : ""
          }`}
        onClick={handleVoiceInput}
        disabled={isListening}
        title={isListening ? "Listening..." : "Click to speak"}
      >
        {isListening && activeInput?.getAttribute("data-label") === label
          ? "🎧"
          : "🎤"}
      </button>
    </div>
  );

  return (
    <div className="excel-form-container">
      {/* Orange Header */}
      <div className="orange-header">
        <h1>AL TASINM ENTERPRISES LLC</h1>
      </div>

      {/* Blue Title Row */}
      <div className="blue-title">
        <h2>Daily Welding Production - Visual Inspection Report</h2>
      </div>

      {/* Top Section */}
      <div className="top-section">
        <div className="logo-box"></div>

        <div className="info-table">
          <table>
            <tbody>
              <tr>
                <td className="label">Contract No.:</td>
                <td>{renderInput("", "Contract Number")}</td>
                <td className="label">Contract Title:</td>
                <td>{renderInput("", "Contract Title")}</td>
                <td className="label">Report No.:</td>
                <td>{renderInput("", "Report Number")}</td>
                <td className="label">Activity Date:</td>
                <td>{renderInput("", "Activity Date")}</td>
              </tr>
              <tr>
                <td className="label">PO / WO No.:</td>
                <td>{renderInput("", "PO or WO Number")}</td>
                <td className="label">Client WPS No.:</td>
                <td>{renderInput("", "Client WPS Number")}</td>
                <td className="label">Project Title / Well ID:</td>
                <td>{renderInput("", "Project Title or Well ID")}</td>
                <td className="label">Line No.:</td>
                <td>{renderInput("", "Line Number")}</td>
              </tr>
              <tr>
                <td className="label">Site Name:</td>
                <td>{renderInput("", "Site Name")}</td>
                <td className="label">Location:</td>
                <td colSpan="5">{renderInput("", "Location")}</td>
              </tr>
              <tr>
                <td className="label">Drawing / ISO No.:</td>
                <td colSpan="7">{renderInput("", "Drawing or ISO Number")}</td>
              </tr>
              <tr>
                <td className="label">Job Description:</td>
                <td colSpan="7">{renderInput("", "Job Description")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Welding Table */}


      {/* Welding Table */}
      <div className="welding-table-container">
        <table className="welding-table">
          <thead>
            <tr>
              <th rowSpan="2">Sr. No</th>
              <th rowSpan="2">KP Sec.</th>
              <th rowSpan="2">Weld ID</th>
              <th rowSpan="2">WPS No.</th>
              <th colSpan="2">Material Gr. / Heat No.</th>
              <th colSpan="2">Size</th>
              <th rowSpan="2">Weld Side</th>
              <th colSpan="4">Welder No. / Welding Process</th>
              <th colSpan="2">Visual Insp.</th>
              <th colSpan="2">Pipe Line</th>
              <th rowSpan="2">Pipe No. / Spl. No.</th>
              <th rowSpan="2">Pipe length (mtrs)</th>
              <th rowSpan="2">Remarks</th>
            </tr>
            <tr>
              <th>I</th>
              <th>II</th>
              <th>(Inch)</th>
              <th>(mm)</th>
              <th>Root / Hot</th>
              <th>Fill</th>
              <th>Fill</th>
              <th>Cap</th>
              <th>Fit up</th>
              <th>Final</th>
              <th>Mtrl.</th>
              <th>Comb.</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((num) => (
              <tr key={num}>
                <td>{num}</td>
                {weldingHeaders.map((label, i) => (
                  <td key={i}>{renderInput("", label)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Welding Consumable Section */}
      <div className="consumable-container">
        <table className="consumable-table">
          <tbody>
            <tr>
              <th rowSpan="3" className="vertical-header">
                Welding<br />Consumable
              </th>
              <th>AWS Classification</th>
              <td>{renderInput("", "AWS Classification 1")}</td>
              <td>{renderInput("", "AWS Classification 2")}</td>
              <td>{renderInput("", "AWS Classification 3")}</td>
              <td>{renderInput("", "AWS Classification 4")}</td>
            </tr>
            <tr>
              <th>Electrode Dia. (mm)</th>
              <td>{renderInput("", "Electrode Dia 1")}</td>
              <td>{renderInput("", "Electrode Dia 2")}</td>
              <td>{renderInput("", "Electrode Dia 3")}</td>
              <td>{renderInput("", "Electrode Dia 4")}</td>
            </tr>
            <tr>
              <th>Manufacturer & Batch No.</th>
              <td>{renderInput("", "Manufacturer 1")}</td>
              <td>{renderInput("", "Manufacturer 2")}</td>
              <td>{renderInput("", "Manufacturer 3")}</td>
              <td>{renderInput("", "Manufacturer 4")}</td>
            </tr>
          </tbody>
        </table>
      </div>


      {/* Legend and Signature */}
      <div className="legend-signature-container">
        <div className="legend-text">
          <p>
            <strong>Material Grade Legend:</strong> 1 = A 106 Gr. B; 2 = A 105N;
            3 = A 234 Gr WPB; 4 = ISO 3183- L245 (Gr. B); 5 = ISO 3183- L290 (X42);
            6 = ISO 3183- L360 (X52); ...
          </p>
          <p className="legend-bottom">
            <strong>Welding Process Legend:</strong> P1 = GTAW; P2 = SMAW; P3 = GMAW;
            P4 = FCAW; P5 = SAW &nbsp;&nbsp;&nbsp;
            <strong>Weld Side:</strong> A = 12–6 O’Clock; B = 6–12 O’Clock
          </p>
        </div>

        <table className="signature-table">
          <thead>
            <tr>
              <th>ATNM Permit Holder</th>
              <th>ATNM QCI</th>
              <th>PDO</th>
              <th>Data Entry By</th>
            </tr>
          </thead>
          <tbody>
            {["Name", "Signature", "Date"].map((label) => (
              <tr key={label}>
                <td>
                  <strong>{label}:</strong>{" "}
                  {renderInput("", `Permit Holder ${label}`)}
                </td>
                <td>
                  <strong>{label}:</strong>{" "}
                  {renderInput("", `QCI ${label}`)}
                </td>
                <td>
                  <strong>{label}:</strong>{" "}
                  {renderInput("", `PDO ${label}`)}
                </td>
                <td>
                  <strong>{label}:</strong>{" "}
                  {renderInput("", `Data Entry ${label}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Action Buttons */}
      <div className="form-actions">
        {/* <button
          className="btn btn-green"
          onClick={() => {
            // 1️⃣ Collect header fields (top table only)
            const header = {};
            const headerLabels = [
              "Contract Number",
              "Contract Title",
              "Report Number",
              "Activity Date",
              "PO or WO Number",
              "Client WPS Number",
              "Project Title or Well ID",
              "Drawing or ISO Number",
              "Line Number",
              "Site Name",
              "Job Description",
              "Location",
            ];

            headerLabels.forEach((label) => {
              const input = document.querySelector(`input[data-label='${label}']`);
              if (input) {
                const key = label
                  .toLowerCase()
                  .replace(/\s+/g, "_")
                  .replace(/number/g, "no")
                  .replace(/title/g, "title")
                  .replace(/or_/g, "")
                  .replace(/_/g, "_");
                header[key] = input.value.trim();
              }
            });

            // 2️⃣ Collect welding table rows
            const tableRows = [];
            const table = document.querySelector(".welding-table tbody");
            if (table) {
              for (let row of table.rows) {
                const cells = row.querySelectorAll("input[data-label]");
                const rowData = {};
                cells.forEach((c) => {
                  const label = c.getAttribute("data-label");
                  rowData[label] = c.value.trim();
                });
                tableRows.push(rowData);
              }
            }

            // 3️⃣ Send to Electron
            const payload = { header, rows: tableRows };
            console.log("✅ Sending structured data to Electron:", payload);
            window.electronAPI.exportExcel(payload);
          }}
        >
          Submit
        </button> */}

        <button
          className="btn btn-green"
          onClick={() => {
            alert("Form saved successfully!");
          }}
        >
          Submit
        </button>



        <button
          className="btn btn-red"
          onClick={() => {
            document.querySelectorAll("input[data-label]").forEach((i) => (i.value = ""));
          }}
        >
          Clear
        </button>
      </div>

    </div>
  );
}
















// import React, { useState } from "react";
// import "./AudioInterviewApp.css";

// const QUESTIONS = [
//   "Please tell us your contract number.",
//   "Please tell us your contract title.",
//   "What is your report number?",
//   "What is your activity date?",
//   "What is your PO or WO number?",
//   "What is your Client WPS number?",
//   "What is your Project Title or Well ID number?",
//   "What is your Project Drawing or ISO number?",
//   "What is your Line number?",
//   "What is your Site Name?",
//   "What is your Job Description?",
//   "What is your Location?",
// ];

// export default function ALTashimFormApp() {
//   const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(""));
//   const [submitted, setSubmitted] = useState(Array(QUESTIONS.length).fill(false));
//   const [status, setStatus] = useState("Idle");
//   const [currentIndex, setCurrentIndex] = useState(null);
//   const [isListening, setIsListening] = useState(false);

//   // ✅ Offline text-to-speech
//   const speak = (text, callback) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.onend = callback;
//     window.speechSynthesis.cancel();
//     window.speechSynthesis.speak(utterance);
//   };

//   // ✅ Offline speech recognition via Electron + Vosk
//   // async function startListening(callback) {
//   //   try {
//   //     setIsListening(true);
//   //     const transcript = await window.electronAPI.startListening();
//   //     setIsListening(false);
//   //     callback(transcript);
//   //   } catch (err) {
//   //     console.error(err);
//   //     setStatus("❌ Error during offline recognition");
//   //     setIsListening(false);
//   //   }
//   // }

//   async function startListening(callback) {
//     try {
//       setIsListening(true);
//       console.log("Calling Electron startListening...");
//       console.log(window);
//       const transcript = await window.electronAPI.startListening();
//       console.log("✅ Transcript:", transcript);
//       setIsListening(false);
//       callback(transcript);
//     } catch (err) {
//       console.error("❌ Electron IPC Error:", err);
//       setStatus("❌ Error during offline recognition: " + (err.message || err));
//       setIsListening(false);
//     }
//   }


//   function handleAsk(index) {
//     setCurrentIndex(index);
//     setStatus(`🗣️ Asking Question ${index + 1}...`);

//     speak(QUESTIONS[index], () => {
//       setStatus("🎤 Listening offline...");
//       startListening((answer) => {
//         setAnswers((prev) => {
//           const updated = [...prev];
//           updated[index] = answer;
//           return updated;
//         });
//         setStatus(`✅ You said: "${answer}". Confirming...`);
//         setTimeout(() => confirmAnswer(index, answer), 1000);
//       });
//     });
//   }

//   function confirmAnswer(index, answer) {
//     speak(`You said: ${answer}. Is that correct? Please say Yes or No.`, () => {
//       startListening((response) => {
//         if (response.includes("yes")) {
//           handleIndividualSubmit(index, true);
//         } else if (response.includes("no")) {
//           handleIndividualSubmit(index, false);
//         } else {
//           speak("Sorry, I didn't catch that. Please say Yes or No.", () =>
//             confirmAnswer(index, answer)
//           );
//         }
//       });
//     });
//   }

//   function handleIndividualSubmit(index, confirmed = null) {
//     if (confirmed === null) {
//       const confirmSubmit = window.confirm(`Submit answer for Question ${index + 1}?`);
//       confirmed = confirmSubmit;
//     }

//     if (confirmed) {
//       setSubmitted((prev) => {
//         const updated = [...prev];
//         updated[index] = true;
//         return updated;
//       });
//       setStatus(`✅ Answer for Question ${index + 1} submitted.`);
//     } else {
//       setAnswers((prev) => {
//         const updated = [...prev];
//         updated[index] = "";
//         return updated;
//       });
//       setStatus(`🔁 Retrying Question ${index + 1}...`);
//       speak("Let's try again.", () => handleAsk(index));
//     }
//   }

//   function handleSubmitAll() {
//     if (answers.some((a) => !a)) {
//       alert("Please answer all questions before submitting.");
//       return;
//     }
//     console.log("Final Answers:", answers);
//     alert("✅ All answers recorded successfully (offline).");
//   }

//   return (
//     <div className="container">
//       <div className="form-card">
//         <h1 className="form-title">🎙️ AL TASHNIM Offline Voice Form</h1>
//         <p className="form-subtitle">Works fully offline using local AI speech model.</p>

//         <div className="status-box">
//           <strong>Status:</strong> {status}
//         </div>

//         {QUESTIONS.map((q, i) => (
//           <div key={i} className={`question-card ${submitted[i] ? "submitted" : ""}`}>
//             <div className="question-header">
//               <h2>Question {i + 1}</h2>
//               {submitted[i] && <span className="submitted-label">✅ Submitted</span>}
//             </div>

//             <p className="question-text">{q}</p>

//             <textarea
//               className="answer-box"
//               rows="3"
//               value={answers[i]}
//               onChange={(e) =>
//                 setAnswers((prev) => {
//                   const updated = [...prev];
//                   updated[i] = e.target.value;
//                   return updated;
//                 })
//               }
//               disabled={submitted[i]}
//             />

//             <div className="button-group">
//               <button
//                 type="button"
//                 className={`btn ${isListening && currentIndex === i ? "btn-yellow" : "btn-blue"
//                   }`}
//                 onClick={() => handleAsk(i)}
//                 disabled={isListening || submitted[i]}
//               >
//                 {isListening && currentIndex === i ? "🎤 Listening..." : "Ask & Record"}
//               </button>

//               {!submitted[i] && (
//                 <button
//                   type="button"
//                   className="btn btn-green"
//                   onClick={() => handleIndividualSubmit(i)}
//                 >
//                   Submit Answer
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}

//         <div className="submit-all">
//           <button onClick={handleSubmitAll} className="btn btn-indigo">
//             🚀 Submit All Answers
//           </button>
//         </div>

//         <p className="tip">💡 Works offline with local Vosk model. No internet needed!</p>
//       </div>
//     </div>
//   );
// }
