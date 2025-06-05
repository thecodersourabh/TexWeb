import { useState } from "react";
import { SimpleHumanModel } from "../../components/SimpleHumanModel/SimpleHumanModel";
import { SettingsPanel } from "../../components/DesignSettings/SettingsPanel";
import { SIZE_MEASUREMENTS } from "../../constants/measurements";
import { DesignSettings, Measurements } from "../../types/design";
import "./Design.css";

const defaultSettings: DesignSettings = {
  itemType: "T-shirt",
  color: "#000000",
  standardSize: "M",
  measurements: SIZE_MEASUREMENTS.M,
};

export function Design() {
  const [settings, setSettings] = useState<DesignSettings>(defaultSettings);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleSettingsChange = (newSettings: DesignSettings) => {
    setSettings(newSettings);
  };

  const handlePanelToggle = () => {
    // Using requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      setIsPanelOpen(prev => !prev);
    });
  };

  const handleMeasurementChange = (
    measurement: keyof Measurements,
    value: number
  ) => {
    setSettings((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [measurement]: value,
      },
    }));
  };

  return (
    <div className="design-container">      <SettingsPanel
        settings={settings}
        isPanelOpen={isPanelOpen}
        onPanelToggle={handlePanelToggle}
        onSettingsChange={handleSettingsChange}
        onMeasurementChange={handleMeasurementChange}
      />

      <div className="design-preview">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="human-model-canvas" id="design-model-container">
              <SimpleHumanModel
                color={settings.color}
                chest={settings.measurements.chest}
                waist={settings.measurements.waist}
                hips={settings.measurements.hips}
                height={
                  settings.itemType === "Pants"
                    ? (settings.measurements.inseam || 32) + 38 // Convert to inches
                    : 67 // ~170cm in inches
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
