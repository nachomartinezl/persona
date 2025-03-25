import React from "react";
import styles from "../styles/components/StyleSelector.module.css";
import styleData from "../data/styles_3.json";

const StyleSelector = ({ onStyleSelect, onCustomPromptChange }) => {
  const [selectedStyleChip, setSelectedStyleChip] = React.useState(null);
  const [isCustomStyle, setIsCustomStyle] = React.useState(false);
  const [customStyleInput, setCustomStyleInput] = React.useState("");

  const handleStyleChipClick = (styleKey) => {
    setSelectedStyleChip(styleKey);
    setIsCustomStyle(false);
    setCustomStyleInput("");

    const prefix = styleData.prefix[0];
    const prompts = styleData.style[styleKey];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const fullPrompt = `${prefix} ${randomPrompt}`;

    onStyleSelect("custom"); // Treat it like a custom selection
    onCustomPromptChange(fullPrompt);
  };

  const handleCustomStyleSelect = () => {
    setIsCustomStyle(true);
    setSelectedStyleChip("custom");
    onStyleSelect("custom");
  };

  const handleCustomPromptChange = (event) => {
    const prefix = styleData.prefix[0];
    const userPrompt = event.target.value;
    const fullPrompt = `${prefix} ${userPrompt}`;

    setCustomStyleInput(userPrompt);
    onCustomPromptChange(fullPrompt);
  };

  return (
    <div className={styles.styleSelectorContainer}>
      <p className={styles.label}>Pick a style:</p>

      <div className={styles.chipContainer}>
        {Object.keys(styleData.style).map((styleKey) => (
          <div
            key={styleKey}
            className={`${styles.styleChip} ${
              selectedStyleChip === styleKey ? styles.selected : ""
            }`}
            onClick={() => handleStyleChipClick(styleKey)}
          >
            {styleKey}
          </div>
        ))}

        <div
          className={`${styles.styleChip} ${
            isCustomStyle ? styles.selected : ""
          } ${styles.customChip}`}
          onClick={handleCustomStyleSelect}
        >
          Enter Custom Prompt
        </div>
      </div>

      {isCustomStyle && (
        <input
          type="text"
          placeholder="Type your custom style here..."
          className={styles.customPromptInput}
          value={customStyleInput}
          onChange={handleCustomPromptChange}
        />
      )}
    </div>
  );
};

export default StyleSelector;
