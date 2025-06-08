import { SIZE_MEASUREMENTS } from "../../constants/measurements";
import { DesignSettings } from "../../types/design";
import { RangeInput } from "./RangeInput";
import { CollapsibleSection } from "./CollapsibleSection";

interface BasicSettingsProps {
  settings: DesignSettings;
  onSettingsChange: (newSettings: DesignSettings) => void;
  onStateChange?: (isOpen: boolean) => void;
}

export function BasicSettings({ settings, onSettingsChange, onStateChange }: BasicSettingsProps) {  return (    <CollapsibleSection title="Basic" defaultOpen={true} onStateChange={onStateChange}>
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

        <div className="setting-field">
          <label>Zoom</label>
          <RangeInput
            value={settings.zoom ?? 1}
            min={0.5}
            max={2}
            step={0.1}
            onChange={(value) =>
              onSettingsChange({ ...settings, zoom: value })
            }
          />        </div>
      </div>
    </CollapsibleSection>
  );
}
