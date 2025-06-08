import { Measurements, MeasurementField } from "../../types/design";
import { MEASUREMENT_RANGE, HEIGHT_RANGE } from "../../constants/measurements";
import { RangeInput } from "./RangeInput";
import { CollapsibleSection } from "./CollapsibleSection";

interface MeasurementSettingsProps {
  measurements: Measurements;
  itemType: string;
  onMeasurementChange: (measurement: keyof Measurements, value: number) => void;
  onStateChange?: (isOpen: boolean) => void;
}

export function MeasurementSettings({
  measurements,
  itemType,
  onMeasurementChange,
  onStateChange
}: MeasurementSettingsProps) {
  const getMeasurementFields = (): MeasurementField[] => {
    const commonFields: MeasurementField[] = [
      {
        key: "neck",
        label: "Neck (inches)",
        range: MEASUREMENT_RANGE,
      },
      {
        key: "chest",
        label: "Chest (inches)",
        range: MEASUREMENT_RANGE,
      },
      {
        key: "waist",
        label: "Waist (inches)",
        range: MEASUREMENT_RANGE,
      },
      {
        key: "hips",
        label: "Hips (inches)",
        range: MEASUREMENT_RANGE,
      },
    ];

    const shirtFields: MeasurementField[] = [
      {
        key: "shoulder",
        label: "Shoulder Width (inches)",
        range: MEASUREMENT_RANGE,
      },
      {
        key: "sleeveLength",
        label: "Sleeve Length (inches)",
        range: MEASUREMENT_RANGE,
      },
    ];

    const pantsFields: MeasurementField[] = [
      {
        key: "inseam",
        label: "Inseam Length (inches)",
        range: MEASUREMENT_RANGE,
      },
      {
        key: "thigh",
        label: "Thigh Circumference (inches)",
        range: MEASUREMENT_RANGE,
      },
    ];

    const heightField: MeasurementField = {
      key: "height",
      label: "Height (inches)",
      range: HEIGHT_RANGE,
    };

    switch (itemType) {
      case "Full Body":
        return [...commonFields, ...shirtFields, ...pantsFields, heightField];
      case "T-shirt":
        return [...commonFields, ...shirtFields];
      case "Pants":
        return [...commonFields, ...pantsFields];
      default:
        return commonFields;
    }
  };
  return (    <CollapsibleSection title="Measurements" defaultOpen={true} onStateChange={onStateChange}>
      <div className="setting-fields">
        {getMeasurementFields().map((field) => (
          <div key={field.key} className="setting-field">
            <RangeInput
              value={measurements[field.key] || 0}
              onChange={(value) => onMeasurementChange(field.key, value)}
              min={field.range?.min || 0}
              max={field.range?.max || 50}
              step={0.5}
              label={field.label}
              unit=" in"
              showValue={true}
            />
          </div>
        ))}      </div>
    </CollapsibleSection>
  );
}
