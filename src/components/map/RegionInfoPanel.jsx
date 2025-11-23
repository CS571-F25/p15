import React from 'react';
import { useRegions } from '../../context/RegionDataContext';
import {
  DEFAULT_REGION_CATEGORY,
  REGION_CATEGORIES,
} from '../../constants/regionConstants';

function RegionInfoPanel({
  isOpen,
  onFieldChange,
  onDelete,
  onClose,
}) {
  const { regions, selectedRegionId } = useRegions();
  const region = regions.find((entry) => entry.id === selectedRegionId);

  if (!isOpen || !region) return null;

  const handleChange = (field) => (event) => {
    const raw = event.target.value;
    const numericFields = ['opacity', 'labelSize', 'labelWidth', 'labelOffsetX', 'labelOffsetY'];
    const value = numericFields.includes(field) ? parseFloat(raw) : raw;
    onFieldChange(field, value);
  };

  const handleCheckboxChange = (field) => (event) => {
    onFieldChange(field, event.target.checked);
  };

  return (
    <aside className="editor-info-panel region-info-panel" aria-label="Region info panel">
      <div className="editor-info-panel__header">
        <h2>Region Info</h2>
        <button
          type="button"
          className="editor-info-panel__close"
          onClick={onClose}
          aria-label="Close region info panel"
        >
          ×
        </button>
      </div>
      <form className="editor-info-panel__form">
        <label className="editor-info-panel__field">
          <span>Name</span>
          <input type="text" value={region.name || ''} onChange={handleChange('name')} />
        </label>
        <label className="editor-info-panel__field">
          <span>Fill Color</span>
          <input type="color" value={region.color || '#f97316'} onChange={handleChange('color')} />
        </label>
        <label className="editor-info-panel__field">
          <span>Category</span>
          <select
            value={region.category || DEFAULT_REGION_CATEGORY}
            onChange={handleChange('category')}
          >
            {REGION_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="editor-info-panel__field editor-info-panel__field--inline">
          <span>Label</span>
          <input
            type="checkbox"
            checked={region.labelEnabled !== false}
            onChange={(event) => onFieldChange('labelEnabled', event.target.checked)}
          />
          <small>Show region title on map</small>
        </label>
        <label className="editor-info-panel__field">
          <span>Opacity</span>
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={region.opacity ?? 0.3}
            onChange={handleChange('opacity')}
          />
        </label>
        <label className="editor-info-panel__field editor-info-panel__field--inline">
          <span>Scale With Zoom</span>
          <input
            type="checkbox"
            checked={region.labelScaleWithZoom !== false}
            onChange={handleCheckboxChange('labelScaleWithZoom')}
          />
        </label>
        <label className="editor-info-panel__field">
          <span>Vertical Text Size</span>
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.05"
            value={region.labelSize ?? 1}
            onChange={handleChange('labelSize')}
          />
        </label>
        <label className="editor-info-panel__field">
          <span>Label Width</span>
          <input
            type="range"
            min="0.4"
            max="2.4"
            step="0.05"
            value={region.labelWidth ?? 1}
            onChange={handleChange('labelWidth')}
          />
        </label>
        <label className="editor-info-panel__field">
          <span>Label Offset X</span>
          <input
            type="range"
            min="-400"
            max="400"
            step="5"
            value={region.labelOffsetX ?? 0}
            onChange={handleChange('labelOffsetX')}
          />
        </label>
        <label className="editor-info-panel__field">
          <span>Label Offset Y</span>
          <input
            type="range"
            min="-400"
            max="400"
            step="5"
            value={region.labelOffsetY ?? 0}
            onChange={handleChange('labelOffsetY')}
          />
        </label>
        <div className="editor-info-panel__actions">
          <button type="button" className="panel-button" onClick={onClose}>
            Close
          </button>
          <button type="button" className="panel-button panel-button--danger" onClick={onDelete}>
            Delete Region
          </button>
        </div>
      </form>
    </aside>
  );
}

export default RegionInfoPanel;

