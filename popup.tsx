import React from "react";
import "./popup.css";
import icon from "data-base64:~assets/icon.png"

export default function Popup() {
  return (
    <div className="popup-container">
      <div className="popup-header">
        <img src={icon} alt="Fillr logo" className="popup-icon" />
        <div className="popup-title">Fillr.ai</div>
      </div>

      <div className="popup-secondary-message">
        Extract and autofill boring forms instantly using AI.
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
