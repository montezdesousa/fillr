import React from "react";
import "./popup.css";

export default function Popup() {
  return (
    <div className="popup-container">
      <div className="popup-header">
        <svg
          className="popup-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" fill="#e5e7eb" />
        </svg>

        <div className="popup-title">Fillr</div>
      </div>

      <div className="popup-secondary-message">
        Use Fillr to automatically populate web forms from images.
      </div>

      <div className="popup-instructions">
        <ol>
          <li>Right-click on any form page.</li>
          <li>Select <strong>"Fill from..."</strong> in the context menu.</li>
          <li>Choose an image from your device or camera containing the form data.</li>
          <li>Review the extracted fields in the modal and click <strong>Accept</strong> to populate the form.</li>
          <li>You can also <strong>Retry</strong> or <strong>Cancel</strong> if needed.</li>
        </ol>
      </div>
    </div>
  );
}
