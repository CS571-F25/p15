import React from 'react';

function EditorInfoPanel({
  isOpen,
  draft,
  markerName,
  onFieldChange,
  onSave,
  onCancel,
}) {
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
      {markerName && (
        <p className="editor-info-panel__subtitle">
          Editing: {markerName}
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
          <button type="submit" className="panel-button panel-button--primary">
            Save
          </button>
        </div>
      </form>
    </aside>
  );
}

export default EditorInfoPanel;
