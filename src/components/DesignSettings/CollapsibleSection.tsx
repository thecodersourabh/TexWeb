import { useState, useRef, useEffect } from 'react';
import './CollapsibleSection.css';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({ 
  title, 
  defaultOpen = true, 
  children 
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<string>("auto");

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(`${height}px`);
    }
  }, [children]);

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="settings-section">
      <div className="section-header" onClick={toggleSection}>
        <h2 className="section-title">{title}</h2>
        <span className={`section-toggle ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      <div 
        ref={contentRef}
        className={`section-content ${!isOpen ? 'closed' : ''}`}
        style={{ maxHeight: isOpen ? contentHeight : '0' }}
      >
        {children}
      </div>
    </div>
  );
}
