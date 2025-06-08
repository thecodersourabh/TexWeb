export interface Measurements {
  neck: number;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  sleeveLength: number;
  inseam?: number;
  thigh?: number;
  height: number;  
}

export interface DesignSettings {
  itemType: "T-shirt" | "Pants" | "Full Body" | "other";
  color: string;
  measurements: Measurements;
  standardSize: string;
  zoom?: number;
}

export type MeasurementField = {
  key: keyof Measurements;
  label: string;
  range?: { min: number; max: number };
};
