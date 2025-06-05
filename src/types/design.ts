export interface Measurements {
  neck: number;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  sleeveLength: number;
  inseam?: number;
  thigh?: number;
}

export interface DesignSettings {
  itemType: "T-shirt" | "Pants" | "other";
  color: string;
  measurements: Measurements;
  standardSize: string;
}

export type MeasurementField = {
  key: keyof Measurements;
  label: string;
  range?: { min: number; max: number };
};
