import { useState } from 'react';
import { SimpleHumanModel } from '../components/SimpleHumanModel/SimpleHumanModel';

interface Measurements {
  neck: number;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  sleeveLength: number;
  inseam?: number; // Only for pants
  thigh?: number; // Only for pants
}

interface DesignSettings {
  itemType: 'shirt' | 'pants' | 'other';
  color: string;
  measurements: Measurements;
  standardSize: string; // For reference
}

const defaultMeasurements: Measurements = {
  neck: 36,
  chest: 96,
  waist: 82,
  hips: 98,
  shoulder: 44,
  sleeveLength: 64,
  inseam: 81,
  thigh: 55,
};

export function Design() {
  const [settings, setSettings] = useState<DesignSettings>({
    itemType: 'shirt',
    color: '#000000',
    standardSize: 'M',
    measurements: defaultMeasurements,
  });

  const handleMeasurementChange = (measurement: keyof Measurements, value: number) => {
    setSettings({
      ...settings,
      measurements: {
        ...settings.measurements,
        [measurement]: value
      }
    });
  };

  const getMeasurementFields = () => {
    const commonFields = [
      { key: 'neck', label: 'Neck Circumference (cm)' },
      { key: 'chest', label: 'Chest Circumference (cm)' },
      { key: 'waist', label: 'Waist Circumference (cm)' },
      { key: 'hips', label: 'Hips Circumference (cm)' },
    ];

    const shirtFields = [
      { key: 'shoulder', label: 'Shoulder Width (cm)' },
      { key: 'sleeveLength', label: 'Sleeve Length (cm)' },
    ];

    const pantsFields = [
      { key: 'inseam', label: 'Inseam Length (cm)' },
      { key: 'thigh', label: 'Thigh Circumference (cm)' },
    ];

    return [
      ...commonFields,
      ...(settings.itemType === 'shirt' ? shirtFields : []),
      ...(settings.itemType === 'pants' ? pantsFields : []),
    ];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Custom Design Studio</h1>
        <p className="mt-2 text-lg text-gray-600">Enter your measurements for a perfect fit</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Type
                </label>
                <select
                  value={settings.itemType}
                  onChange={(e) => setSettings({ ...settings, itemType: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="shirt">Shirt</option>
                  <option value="pants">Pants</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard Size Reference
                </label>
                <select
                  value={settings.standardSize}
                  onChange={(e) => setSettings({ ...settings, standardSize: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="2XL">2XL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fabric Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.color}
                    onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded-md p-1"
                  />
                  <span className="text-sm text-gray-500">{settings.color.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Detailed Measurements</h2>
            <div className="space-y-4">
              {getMeasurementFields().map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={settings.measurements[field.key as keyof Measurements]}
                      onChange={(e) => handleMeasurementChange(field.key as keyof Measurements, parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      min="0"
                      step="0.5"
                    />
                    <span className="text-sm text-gray-500 w-8">cm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">3D Preview</h2>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-full h-[350px]" id ="design-model-container">
              <SimpleHumanModel
                color={settings.color}
                chest={settings.measurements.chest}
                waist={settings.measurements.waist}
                hips={settings.measurements.hips}
                height={settings.itemType === 'pants' ? (settings.measurements.inseam || 81) + 90 : 170}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button className="bg-gray-100 text-gray-600 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
              Reset Measurements
            </button>
            <button className="bg-rose-600 text-white px-8 py-2 rounded-md hover:bg-rose-700 transition-colors">
              Save Design
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
