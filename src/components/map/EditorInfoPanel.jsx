import React from 'react';
import { useLocationData } from '../../context/LocationDataContext';
import { useRegions } from '../../context/RegionDataContext';

function EditorInfoPanel({
  isOpen,
  draft,
  onFieldChange,
  onSave,
  onCancel,
  canAutoSave = false,
  saveWarning = '',
  canDelete = false,
  onDelete,
}) {
  const { locations, selectedLocationId } = useLocationData();
  const currentLocation = locations.find((location) => location.id === selectedLocationId);
  const markerName = currentLocation?.name ?? 'Unknown Location';
  const { regions } = useRegions();
  const regionName = currentLocation?.regionId
    ? regions.find((region) => region.id === currentLocation.regionId)?.name
    : null;
  if (!isOpen || !draft) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave();
  };

  const handleInputChange = (field) => (event) => {
    onFieldChange(field, event.target.value);
  };

  return (
    <aside className="editor-info-panel" aria-label="Editor info panel">
      <div className="editor-info-panel__header">
        <h2>Editor Info Panel</h2>
        <button
          type="button"
          className="editor-info-panel__close"
          onClick={onCancel}
          aria-label="Close editor info panel"
        >
          ×
        </button>
      </div>
      <p className="editor-info-panel__subtitle">
        Editing: {markerName}
      </p>
      {regionName && (
        <p className="editor-info-panel__subtitle">
          Region: <strong>{regionName}</strong>
        </p>
      )}
      <form className="editor-info-panel__form" onSubmit={handleSubmit}>
        <label className="editor-info-panel__field">
          <span>Name</span>
          <input
            type="text"
            value={draft.name ?? ''}
            onChange={handleInputChange('name')}
          />
        </label>
        <label className="editor-info-panel__field">
          <span>Type / Category</span>
          <input
            type="text"
            value={draft.type ?? ''}
            onChange={handleInputChange('type')}
          />
        </label>
        <label className="editor-info-panel__field">
          <span>Description</span>
          <textarea
            rows={4}
            value={draft.description ?? ''}
            onChange={handleInputChange('description')}
          />
        </label>
        <div className="editor-info-panel__actions">
          <button type="button" className="panel-button" onClick={onCancel}>
            Cancel
          </button>
          {canDelete && (
            <button
              type="button"
              className="panel-button panel-button--danger"
              onClick={onDelete}
            >
              Delete
            </button>
          )}
          <button type="submit" className="panel-button panel-button--primary">
            Save
          </button>
        </div>
        {(!canAutoSave || saveWarning) && (
          <p className="editor-warning">
            {canAutoSave ? saveWarning : 'Only approved editors can save changes to the shared map.'}
          </p>
        )}
      </form>
    </aside>
  );
}

export default EditorInfoPanel;
