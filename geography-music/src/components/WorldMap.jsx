// src/components/WorldMap.jsx
import React, { useMemo, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const GEO_URL =
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";

function getIso3(geo) {
  return geo.id || geo.properties?.ISO_A3 || geo.properties?.iso_a3 || "";
}
function getName(geo) {
  return (
    geo.properties?.name ||
    geo.properties?.NAME ||
    geo.properties?.ADMIN ||
    "Unknown"
  );
}

export default function WorldMap({
  onSelectCountry,
  selectedCode,
  position,
  setPosition,
  // quiz support
  quizCorrectCode,
  quizReveal = false,
  // send country list once
  onGeographyList,
}) {
  const styles = useMemo(
    () => ({
      hover: { fill: "#f0e68c", outline: "none", cursor: "pointer" },
      pressed: { fill: "#f0d98c", outline: "none" },
    }),
    []
  );

  const sentListRef = useRef(false);

  return (
    <ComposableMap projectionConfig={{ scale: 160 }}>
      <ZoomableGroup
        center={position.coordinates}
        zoom={position.zoom}
        minZoom={1}
        maxZoom={8}
        onMoveEnd={({ coordinates, zoom }) =>
          setPosition({ coordinates, zoom })
        }
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) => {
            if (
              onGeographyList &&
              !sentListRef.current &&
              geographies?.length
            ) {
              onGeographyList(
                geographies.map((g) => ({ code: getIso3(g), name: getName(g) }))
              );
              sentListRef.current = true;
            }

            return geographies.map((geo) => {
              const code = getIso3(geo);
              const name = getName(geo);
              const isSelected = selectedCode === code;
              const isCorrect = quizReveal && quizCorrectCode === code;

              return (
                <Geography
                  key={code || name}
                  geography={geo}
                  onClick={() => onSelectCountry?.({ code, name })}
                  style={{
                    default: {
                      fill: isCorrect
                        ? "#06d6a0"
                        : isSelected
                        ? "#ffd166"
                        : "#83c5be",
                      stroke: "#2b2d42",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: styles.hover,
                    pressed: styles.pressed,
                  }}
                />
              );
            });
          }}
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
}
