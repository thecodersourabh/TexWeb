import { memo, useCallback, useRef, useState, useEffect } from "react";
import { DesignSettings } from "../../types/design";
import { Measurements } from "../../types/design";
import { BasicSettings } from "./BasicSettings";
import { MeasurementSettings } from "./MeasurementSettings";
import "./SettingsPanel.css";

interface SettingsPanelProps {
  settings: DesignSettings;
  isPanelOpen: boolean;
  onPanelToggle: () => void;
  onSettingsChange: (settings: DesignSettings) => void;
  onMeasurementChange: (measurement: keyof Measurements, value: number) => void;
}

export const SettingsPanel = memo(function SettingsPanel({
  settings,
  isPanelOpen,
  onPanelToggle,
  onSettingsChange,
  onMeasurementChange,
}: SettingsPanelProps) {  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [openSections, setOpenSections] = useState({ basic: true, measurements: true });

  const handleSectionStateChange = (section: 'basic' | 'measurements') => (isOpen: boolean) => {
    setOpenSections(prev => ({ ...prev, [section]: isOpen }));
  };

  const allSectionsClosed = !openSections.basic && !openSections.measurements;
  const oneCollapsed = (openSections.basic && !openSections.measurements) || 
                      (!openSections.basic && openSections.measurements);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!panelRef.current) return;
    
    touchStartY.current = e.touches[0].clientY;
    currentY.current = panelRef.current.getBoundingClientRect().top;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !panelRef.current) return;

    const deltaY = e.touches[0].clientY - touchStartY.current;
    const newY = currentY.current + deltaY;

    // Only allow dragging down when open, and up when closed
    if ((isPanelOpen && deltaY > 0) || (!isPanelOpen && deltaY < 0)) {
      panelRef.current.style.transform = `translateY(${deltaY}px)`;
      e.preventDefault();
    }
  }, [isDragging, isPanelOpen]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isDragging || !panelRef.current) return;

    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // Threshold for considering it a swipe (75px)
    if (Math.abs(deltaY) > 75) {
      if ((isPanelOpen && deltaY > 0) || (!isPanelOpen && deltaY < 0)) {
        onPanelToggle();
      }
    }

    // Reset transform
    panelRef.current.style.transform = '';
    setIsDragging(false);
  }, [isDragging, isPanelOpen, onPanelToggle]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    panel.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      panel.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (    <div 
      ref={panelRef}
      className={`design-settings ${isPanelOpen ? "open" : "closed"} ${
        allSectionsClosed ? "all-collapsed" : oneCollapsed ? "one-collapsed" : ""
      }`}
      style={{ 
        touchAction: isDragging ? 'none' : 'pan-y',
        transition: isDragging ? 'none' : undefined 
      }}
    >
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
      <div className={`settings-content ${!isPanelOpen ? 'invisible' : ''}`}>
        <BasicSettings settings={settings} onSettingsChange={onSettingsChange} onStateChange={handleSectionStateChange('basic')} />
        <MeasurementSettings
          measurements={settings.measurements}
          itemType={settings.itemType}
          onMeasurementChange={onMeasurementChange}
          onStateChange={handleSectionStateChange('measurements')}
        />
      </div>
    </div>
  );
});