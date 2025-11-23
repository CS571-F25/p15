import React, { useEffect, useMemo, useState } from 'react';

const PANEL_VIEWS = {
  HOME: 'home',
  MARKERS: 'markers',
  REGIONS: 'regions',
};

function EditorSidePanel({
  isEditorMode,
  markerPalette,
  markerToolbox,
  locationEditor,
  regionInfoPanel,
  regions = [],
  activeRegionId,
  onSelectRegion,
  onFocusRegion,
  onDeleteRegion,
  canAutoSave = false,
  isRegionMode,
  onToggleRegionMode,
  regionDraftPoints = [],
  onFinishRegion,
  onResetRegionDraft,
  canAssignSelection = false,
  onAssignSelection,
  selectedRegionName = '',
  selectedLocationName = '',
}) {
  const [view, setView] = useState(PANEL_VIEWS.HOME);
  const [markerView, setMarkerView] = useState('palette');
  const [panelWidth, setPanelWidth] = useState(360);
  const isResizingRef = React.useRef(false);

  const handleResizeStart = (event) => {
    event.preventDefault();
    isResizingRef.current = true;
    const startX = event.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const delta = moveEvent.clientX - startX;
      const nextWidth = Math.min(Math.max(startWidth + delta, 280), 520);
      setPanelWidth(nextWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (!isEditorMode) {
      setView(PANEL_VIEWS.HOME);
    }
  }, [isEditorMode]);

  const regionCountLabel = useMemo(() => {
    if (!regions.length) return 'No regions yet';
    return `${regions.length} region${regions.length === 1 ? '' : 's'}`;
  }, [regions]);

  if (!isEditorMode) return null;

  const renderHome = () => (
    <div className="editor-side-panel__home-grid">
      <button
        type="button"
        className="editor-side-panel__home-card"
        onClick={() => setView(PANEL_VIEWS.MARKERS)}
      >
        <span className="editor-side-panel__home-eyebrow">Tools</span>
        <strong>Markers</strong>
        <p>Drop, edit, and manage icons on the map.</p>
      </button>
      <button
        type="button"
        className="editor-side-panel__home-card"
        onClick={() => setView(PANEL_VIEWS.REGIONS)}
      >
        <span className="editor-side-panel__home-eyebrow">Tools</span>
        <strong>Regions</strong>
        <p>Create areas, adjust colors, and assign markers.</p>
      </button>
      <div className="editor-side-panel__home-card editor-side-panel__home-card--disabled">
        <span className="editor-side-panel__home-eyebrow">Coming Soon</span>
        <strong>World Settings</strong>
        <p>Shared editor presets and automation will live here.</p>
      </div>
    </div>
  );

  const renderMarkers = () => (
    <div className="editor-side-panel__section">
      <div className="editor-side-panel__tabs editor-side-panel__tabs--sub">
        <button
          type="button"
          className={markerView === 'palette' ? 'active' : ''}
          onClick={() => setMarkerView('palette')}
        >
          Palette
        </button>
        <button
          type="button"
          className={markerView === 'data' ? 'active' : ''}
          onClick={() => setMarkerView('data')}
        >
          Data
        </button>
        <button
          type="button"
          className={markerView === 'edit' ? 'active' : ''}
          onClick={() => setMarkerView('edit')}
        >
          Edit
        </button>
      </div>
      <div className="editor-side-panel__section-body">
        {markerView === 'palette' && (
          <>
            <div className="editor-side-panel__section-header">
              <h3>Marker Palette</h3>
              <p>Select a category and drag icons into place.</p>
            </div>
            {markerPalette}
          </>
        )}
        {markerView === 'data' && markerToolbox && (
          <>
            <div className="editor-side-panel__section-header">
              <h3>Data</h3>
              <p>Import or export marker data.</p>
            </div>
            {markerToolbox}
          </>
        )}
        {markerView === 'edit' && locationEditor && (
          <>
            <div className="editor-side-panel__section-header">
              <h3>Edit Marker</h3>
              <p>Update the highlighted marker&apos;s details.</p>
            </div>
            {locationEditor}
          </>
        )}
      </div>
    </div>
  );

  const renderRegions = () => (
    <>
      <div className="editor-side-panel__actions-grid">
        <article className="editor-side-panel__action-card">
          <header>
            <h4>Create Region</h4>
            <p>Enable region mode to start plotting boundaries.</p>
          </header>
          <button
            type="button"
            className="toolbox-button"
            onClick={onToggleRegionMode}
            disabled={!canAutoSave}
          >
            {isRegionMode ? 'Exit Region Mode' : 'Start Region Mode'}
          </button>
          {isRegionMode && (
            <div className="editor-side-panel__region-draft">
              <span>Draft points: {regionDraftPoints.length}</span>
              <div>
                <button
                  type="button"
                  className="toolbox-button"
                  onClick={onFinishRegion}
                  disabled={regionDraftPoints.length < 3}
                >
                  Finish
                </button>
                <button
                  type="button"
                  className="toolbox-button toolbox-button--ghost"
                  onClick={onResetRegionDraft}
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </article>
        <article className="editor-side-panel__action-card">
          <header>
            <h4>Edit Selected Region</h4>
            <p>Choose a region below to adjust its styling.</p>
          </header>
          <p className="editor-side-panel__action-count">{regionCountLabel}</p>
        </article>
        <article className="editor-side-panel__action-card">
          <header>
            <h4>Delete Selected Region</h4>
            <p>Removes the active region and its styling.</p>
          </header>
          <button
            type="button"
            className="toolbox-button toolbox-button--ghost"
            onClick={() => onDeleteRegion(activeRegionId)}
            disabled={!activeRegionId}
          >
            Delete Region
          </button>
        </article>
      </div>
      <div className="editor-side-panel__section">
        <div className="editor-side-panel__section-header">
          <h3>Regions</h3>
          <p>Select a region to focus or edit its details.</p>
        </div>
        <div className="region-list">
          {regions.length === 0 && (
            <p className="region-list__empty">No regions yet. Start with Create Region.</p>
          )}
          {regions.map((region) => (
            <div
              key={region.id}
              className={`region-item ${activeRegionId === region.id ? 'region-item--active' : ''}`}
            >
              <button
                type="button"
                className="region-item__select"
                onClick={() => onSelectRegion(region.id)}
              >
                <span
                  className="region-item__color"
                  style={{ backgroundColor: region.color || '#f97316' }}
                />
                {region.name}
              </button>
              <div className="region-item__actions">
                <button type="button" onClick={() => onFocusRegion(region.id)}>
                  Focus
                </button>
                <button type="button" onClick={() => onDeleteRegion(region.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {regionInfoPanel && (
        <div className="editor-side-panel__section">
          <div className="editor-side-panel__section-header">
            <h3>Region Details</h3>
            <p>Edit the currently selected region.</p>
          </div>
          {regionInfoPanel}
        </div>
      )}
      {canAssignSelection && (
        <div className="editor-side-panel__section">
          <button type="button" className="assign-region-button" onClick={onAssignSelection}>
            Assign {selectedLocationName || 'marker'} to {selectedRegionName || 'region'}
          </button>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    if (view === PANEL_VIEWS.MARKERS) return renderMarkers();
    if (view === PANEL_VIEWS.REGIONS) return renderRegions();
    return renderHome();
  };

  return (
    <aside
      className="editor-side-panel"
      aria-label="Map editor panel"
      style={{ width: `${panelWidth}px` }}
    >
      <div className="editor-side-panel__resizer" onMouseDown={handleResizeStart} />
      <header className="editor-side-panel__header">
        <div>
          <p className="editor-side-panel__label">Editor Mode</p>
          <h2>World Builder</h2>
        </div>
        <div className="editor-side-panel__tabs">
          <button
            type="button"
            className={view === PANEL_VIEWS.HOME ? 'active' : ''}
            onClick={() => setView(PANEL_VIEWS.HOME)}
          >
            Home
          </button>
          <button
            type="button"
            className={view === PANEL_VIEWS.MARKERS ? 'active' : ''}
            onClick={() => setView(PANEL_VIEWS.MARKERS)}
          >
            Markers
          </button>
          <button
            type="button"
            className={view === PANEL_VIEWS.REGIONS ? 'active' : ''}
            onClick={() => setView(PANEL_VIEWS.REGIONS)}
          >
            Regions
          </button>
        </div>
      </header>
      <div className="editor-side-panel__body">{renderContent()}</div>
    </aside>
  );
}

export default EditorSidePanel;
