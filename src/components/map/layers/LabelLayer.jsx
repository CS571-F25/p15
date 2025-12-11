import React, { useMemo } from "react";
import { LayerGroup, Marker } from "react-leaflet";
import L from "leaflet";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function LabelLayer({ labels = [], zoomLevel = 4, isEditable = false, isEditorMode = false, onDragLabel }) {
  const iconMarkers = useMemo(
    () =>
      labels.map((label) => {
        const baseSize = 28 * (label.size || 1);
        const zoomDelta = clamp(zoomLevel - 4, -4, 4);
        const zoomScale = label.scaleWithZoom === false ? 1 : 1 + zoomDelta * 0.06;
        const scaledSize = baseSize * (label.zoomScale || 1) * zoomScale;
        const rawStart = Number.isFinite(label.fadeInStart) ? label.fadeInStart : 2.8;
        const rawEnd = Number.isFinite(label.fadeInEnd) ? label.fadeInEnd : rawStart + 1.8;
        const fadeStart = rawStart;
        const minGap = 0.2;
        const fadeEnd = rawEnd <= fadeStart + minGap ? fadeStart + minGap : rawEnd;
        let opacity = fadeEnd > fadeStart
          ? clamp((zoomLevel - fadeStart) / (fadeEnd - fadeStart), 0, 1)
          : 1;
        if (isEditorMode) {
          opacity = Math.max(opacity, 0.2);
        }
        const color = label.color || "#fef3c7";
        const fontFamily = label.font || "'Cinzel','Cormorant Garamond',serif";
        const text = escapeHtml(label.text || "Label");
        const html = `<div class="map-label" style="font-size:${scaledSize}px;color:${color};opacity:${opacity};font-family:${fontFamily};">${text}</div>`;
        const size = [scaledSize * 4, scaledSize * 1.4];
        return {
          ...label,
          html,
          iconSize: size,
          anchor: [size[0] / 2, size[1] / 2],
        };
      }),
    [labels, zoomLevel, isEditorMode]
  );

  return (
    <LayerGroup>
      {iconMarkers.map((label) => (
        <Marker
          key={label.id}
          position={[label.lat, label.lng]}
          draggable={isEditable}
          interactive={isEditable}
          icon={L.divIcon({
            className: "map-label-icon",
            html: label.html,
            iconSize: label.iconSize,
            iconAnchor: label.anchor,
          })}
          eventHandlers={
            isEditable && onDragLabel
              ? {
                  dragend: (event) => {
                    const next = event.target.getLatLng();
                    onDragLabel(label.id, { lat: next.lat, lng: next.lng });
                  },
                }
              : undefined
          }
        />
      ))}
    </LayerGroup>
  );
}

export default LabelLayer;



