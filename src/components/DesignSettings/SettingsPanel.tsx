import { memo, useEffect, useRef } from 'react';
import { DesignSettings } from "../../types/design";
import { Measurements } from "../../types/design";
import { BasicSettings } from "./BasicSettings";
import { MeasurementSettings } from "./MeasurementSettings";

interface SettingsPanelProps {
  settings: DesignSettings;
  isPanelOpen: boolean;
  onPanelToggle: () => void;
  onSettingsChange: (settings: DesignSettings) => void;
  onMeasurementChange: (measurement: keyof Measurements, value: number) => void;
}

export const SettingsPanel = memo(function SettingsPanel({
  settings,
  isPanelOpen,
  onPanelToggle,
  onSettingsChange,
  onMeasurementChange,
}: SettingsPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      if (isPanelOpen) {
        contentRef.current.style.display = 'block';
        // Force a reflow before adding the transition class
        contentRef.current.offsetHeight;
        contentRef.current.style.opacity = '1';
      } else {
        contentRef.current.style.opacity = '0';
        const onTransitionEnd = () => {
          if (!isPanelOpen && contentRef.current) {
            contentRef.current.style.display = 'none';
          }
        };
        contentRef.current.addEventListener('transitionend', onTransitionEnd, { once: true });
      }
    }
  }, [isPanelOpen]);

  return (
    <div 
      className={`design-settings ${isPanelOpen ? "open" : "closed"}`}
      role="complementary"
      aria-label="Design settings panel"
    >
      <div className="settings-header">
        <span className="text-sm font-semibold text-gray-900">Settings</span>
        <button
          className="toggle-button"
          onClick={onPanelToggle}
          aria-label={isPanelOpen ? "Hide Settings" : "Show Settings"}
          aria-expanded={isPanelOpen}
        >
          <span className="toggle-icon">{isPanelOpen ? "▼" : "▲"}</span>
        </button>
      </div>

      <div 
        ref={contentRef}
        className="settings-content"
        aria-hidden={!isPanelOpen}
        style={{
          opacity: 0,
          display: 'none',
          transition: 'opacity 0.2s ease'
        }}
      >
        <BasicSettings settings={settings} onSettingsChange={onSettingsChange} />
        <MeasurementSettings
          measurements={settings.measurements}
          itemType={settings.itemType}
          onMeasurementChange={onMeasurementChange}
        />
      </div>
    </div>
  );
});
