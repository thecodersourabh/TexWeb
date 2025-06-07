export const MEASUREMENT_RANGE = { min: 0, max: 50 };
export const HEIGHT_RANGE = { min: 0, max: 100 }; 

export const SIZE_MEASUREMENTS = {
  XS: {
    neck: 13.75,
    chest: 35,
    waist: 29,
    hips: 35,
    shoulder: 16,
    sleeveLength: 24,
    inseam: 30,
    thigh: 20,
    height: 64, 
  },
  S: {
    neck: 14.25,
    chest: 37,
    waist: 31,
    hips: 37,
    shoulder: 16.5,
    sleeveLength: 24.5,
    inseam: 31,
    thigh: 21,
    height: 66, // 5'6"
  },
  M: {
    neck: 14.75,
    chest: 39,
    waist: 33,
    hips: 39,
    shoulder: 17.5,
    sleeveLength: 25.5,
    inseam: 32,
    thigh: 22,
    height: 68, // 5'8"
  },
  L: {
    neck: 15.25,
    chest: 41,
    waist: 35,
    hips: 41,
    shoulder: 18.5,
    sleeveLength: 26,
    inseam: 33,
    thigh: 23,
    height: 70, // 5'10"
  },
  XL: {
    neck: 15.75,
    chest: 43,
    waist: 37,
    hips: 43,
    shoulder: 19.5,
    sleeveLength: 26.5,
    inseam: 34,
    thigh: 24,
    height: 72, 
  },
  "2XL": {
    neck: 16.25,
    chest: 45,
    waist: 39,
    hips: 45,
    shoulder: 20.5,
    sleeveLength: 27,
    inseam: 35,
    thigh: 25,
    height: 74, 
  },
} as const;
