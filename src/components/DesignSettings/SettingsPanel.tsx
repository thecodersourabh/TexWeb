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

export function SettingsPanel({
  settings,
  isPanelOpen,
  onPanelToggle,
  onSettingsChange,
  onMeasurementChange,
}: SettingsPanelProps) {
  return (
    <div className={`design-settings ${isPanelOpen ? "open" : "closed"}`}>
      <div className="settings-header">
        <span className="text-sm font-semibold text-gray-900">Settings</span>
        <button
          className="toggle-button"
          onClick={onPanelToggle}
          aria-label={isPanelOpen ? "Hide Settings" : "Show Settings"}
        >
          <span className="toggle-icon">{isPanelOpen ? "▼" : "▲"}</span>
        </button>
      </div>

      {isPanelOpen && (
        <div className="settings-content">
          <BasicSettings settings={settings} onSettingsChange={onSettingsChange} />
          <MeasurementSettings
            measurements={settings.measurements}
            itemType={settings.itemType}
            onMeasurementChange={onMeasurementChange}
          />
        </div>
      )}
    </div>
  );
}