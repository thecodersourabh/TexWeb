import { SIZE_MEASUREMENTS } from "../../constants/measurements";
import { DesignSettings } from "../../types/design";

interface BasicSettingsProps {
  settings: DesignSettings;
  onSettingsChange: (newSettings: DesignSettings) => void;
}

export function BasicSettings({ settings, onSettingsChange }: BasicSettingsProps) {
  return (
    <div className="settings-section">
      <div className="section-header">
        <h2 className="section-title">Basic</h2>
      </div>
      <div className="setting-fields">
        <div className="setting-field">
          <label>Type</label>
          <select
            value={settings.itemType}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                itemType: e.target.value as any,
              })
            }
            className="compact-input"
          >
            <option value="T-shirt">T-Shirt</option>
            <option value="Pants">Pants</option>
            <option value="Full Body">Full Body</option>
          </select>
        </div>

        <div className="setting-field">
          <label>Size</label>
          <select
            value={settings.standardSize}
            onChange={(e) => {
              const newSize = e.target.value;
              onSettingsChange({
                ...settings,
                standardSize: newSize,
                measurements: SIZE_MEASUREMENTS[newSize as keyof typeof SIZE_MEASUREMENTS],
              });
            }}
            className="compact-input"
          >
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="2XL">2XL</option>
          </select>
        </div>

        <div className="setting-field">
          <label>Color</label>
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={settings.color}
              onChange={(e) =>
                onSettingsChange({ ...settings, color: e.target.value })
              }
              className="w-6 h-6 rounded cursor-pointer"
            />
            <span className="text-xs text-gray-600">
              {settings.color.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
