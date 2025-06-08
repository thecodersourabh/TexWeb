import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SimpleHumanModel } from "../../components/SimpleHumanModel/SimpleHumanModel";
import { SettingsPanel } from "../../components/DesignSettings/SettingsPanel";
import { SIZE_MEASUREMENTS } from "../../constants/measurements";
import { DesignSettings, Measurements } from "../../types/design";
import "./Design.css";
import { DesignUploader } from "../../components/DesignSettings/DesignUploader";

const defaultSettings: DesignSettings = {
  itemType: "T-shirt",
  color: "#000000",
  standardSize: "M",
  measurements: SIZE_MEASUREMENTS.M,
  zoom: 1,
};

type SizeKey = keyof typeof SIZE_MEASUREMENTS;

export function Design() {
  const [settings, setSettings] = useState<DesignSettings>(defaultSettings);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Clean up URL if it contains a GUID
  useEffect(() => {
    if (location.pathname.includes("/design/")) {
      navigate("/design", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleSettingsChange = (newSettings: DesignSettings) => {
    console.log("Settings changed:", newSettings);

    // If changing to Full Body, ensure height is set
    if (newSettings.itemType === "Full Body") {
      const size = newSettings.standardSize as SizeKey;
      setSettings({
        ...newSettings,
        measurements: {
          ...newSettings.measurements,
          height: SIZE_MEASUREMENTS[size].height,
        },
      });
    } else {
      setSettings(newSettings);
    }
  };

  const handlePanelToggle = () => {
    // Using requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      setIsPanelOpen((prev) => !prev);
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
    <div className="design-container">
      
    <SettingsPanel
        settings={settings}
        isPanelOpen={isPanelOpen}
        onPanelToggle={handlePanelToggle}
        onSettingsChange={handleSettingsChange}
        onMeasurementChange={handleMeasurementChange}
      />        
       <div className="design-preview">
        <div className="model-container relative">
          <SimpleHumanModel
            modelUrl={customModelUrl}
            modelType={settings.itemType}
            color={settings.color}
            zoom={settings.zoom || 1}
            {...settings.measurements}
          />
          <div className="absolute top-4 right-4 z-10">
            <DesignUploader onImageSelected={setCustomModelUrl} />
          </div>
        </div>
      </div>
      </div>
      
  );
}
