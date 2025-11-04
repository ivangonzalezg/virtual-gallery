import { Canvas, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Environment,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import React, { Suspense, useMemo, useState } from "react";

/**
 * Virtual Gallery — Proof of Concept (desktop-first)
 * - White-cube room with 3 walls + floor/ceiling
 * - Paintings as clickable planes
 * - Hover label + click to open detail panel with CTA
 * - Responsive: keeps orbit controls but tightens FOV on small screens
 *
 * How to use in Next.js:
 * 1) Create a page (e.g., app/poc/page.tsx or pages/poc.tsx) and export default this component
 * 2) Ensure dependencies: @react-three/fiber, @react-three/drei, three
 */

export default function VirtualGalleryPOC() {
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Demo artworks (replace with CMS data)
  const artworks: Artwork[] = useMemo(
    () => [
      {
        id: "a1",
        title: "Atardecer en la Bahía",
        artist: "A. Rivera",
        year: "2022",
        technique: "Óleo sobre lienzo",
        size: "80 x 60 cm",
        price: "$1,200",
        image:
          "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1600&auto=format&fit=crop",
        // Wall positions (meters): place on right wall
        position: [2.8, 1.4, -2],
        rotation: [0, -Math.PI / 2, 0],
        width: 1.1,
      },
      {
        id: "a2",
        title: "Campos de Oro",
        artist: "B. Ortega",
        year: "2023",
        technique: "Acrílico",
        size: "100 x 70 cm",
        price: "$1,600",
        image:
          "https://images.unsplash.com/vector-1752157581850-5d2ef1a868d5?q=80&w=1600&auto=format&fit=crop",
        // Back wall
        position: [0, 1.25, -2.9],
        rotation: [0, 0, 0],
        width: 1.3,
      },
      {
        id: "a3",
        title: "Marina Nocturna",
        artist: "C. Lozano",
        year: "2021",
        technique: "Mixta",
        size: "60 x 60 cm",
        price: "$980",
        image:
          "https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?q=80&w=1600&auto=format&fit=crop",
        // Left wall
        position: [-2.8, 1.1, -1.2],
        rotation: [0, Math.PI / 2, 0],
        width: 0.9,
      },
    ],
    []
  );

  const isOpen = Boolean(selected);

  return (
    <div
      style={{
        ...styles.page,
        paddingRight: isOpen ? 380 : 0, // espacio dinámico para el panel
        transition: "padding-right .3s ease",
      }}
    >
      <Header />
      <div style={styles.mainContent}>
        <Suspense fallback={<div style={styles.fallback}>Cargando sala…</div>}>
          <Canvas camera={{ position: [0, 1.6, 2.8], fov: 55 }} dpr={[1, 2]}>
            <color attach="background" args={["#f2f3f5"]} />
            <hemisphereLight
              intensity={0.5}
              groundColor={new THREE.Color("#e9eaee")}
            />
            <spotLight
              position={[3.5, 3.5, 2.5]}
              intensity={0.6}
              angle={0.5}
              penumbra={0.7}
              castShadow
            />
            <Environment preset="city" />

            <Room />

            {artworks.map((a) => (
              <Painting
                key={a.id}
                data={a}
                hovered={hoveredId === a.id}
                onHover={(h) => setHoveredId(h ? a.id : null)}
                onClick={() => setSelected(a)}
              />
            ))}

            <OrbitControls
              enablePan={false}
              minDistance={1.6}
              maxDistance={6}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2.05}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Detail drawer */}
      <DetailsPanel artwork={selected} onClose={() => setSelected(null)} />

      <Footer />
    </div>
  );
}

// Types
export type Artwork = {
  id: string;
  title: string;
  artist: string;
  year: string;
  technique: string;
  size: string;
  price: string;
  image: string;
  position: [number, number, number];
  rotation: [number, number, number];
  width: number; // meters
};

function Header() {
  return (
    <div style={styles.header}>
      <div style={styles.brand}>Sala Virtual — PoC</div>
      <div style={styles.hint}>
        Usa el mouse/trackpad para moverte • Click en una obra para ver detalles
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={styles.footer}>
      <span>
        * PoC — optimizada para escritorio. En móvil se conserva navegación
        básica y panel de detalles.
      </span>
    </div>
  );
}

function Room() {
  // Simple "white cube" 6x3x6 m
  useTexture({
    roughness: "https://threejs.org/examples/textures/roughness_map.jpg",
  });

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#f6f7f9" roughness={0.95} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, -3]}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-3, 1.5, 0]}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[3, 1.5, 0]}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Front lintel to frame view */}
      <mesh position={[0, 2.2, 3]}>
        <boxGeometry args={[6, 0.2, 0.1]} />
        <meshStandardMaterial color="#e9ebee" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Painting({
  data,
  onClick,
  onHover,
  hovered,
}: {
  data: Artwork;
  onClick: () => void;
  onHover: (h: boolean) => void;
  hovered: boolean;
}) {
  const texture = useLoader(THREE.TextureLoader, data.image);
  // compute height by aspect ratio
  const aspect = texture.image
    ? texture.image.width / texture.image.height
    : 1.2;
  const width = data.width;
  const height = width / aspect;

  // simple frame
  const frameThickness = 0.03;

  return (
    <group position={data.position} rotation={data.rotation}>
      {/* Shadow plane (subtle) */}
      <mesh position={[0, -height / 2 + 0.01, 0.01]}>
        <planeGeometry args={[width * 1.1, 0.05]} />
        <meshBasicMaterial color="#e3e5e8" />
      </mesh>

      {/* Frame */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {/* Outer frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry
            args={[
              width + frameThickness * 2,
              height + frameThickness * 2,
              0.02,
            ]}
          />
          <meshStandardMaterial
            color={hovered ? "#0E529A" : "#1f2937"}
            metalness={0.1}
            roughness={0.6}
          />
        </mesh>
        {/* Painting plane */}
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </mesh>

      {/* Hover label */}
      {hovered && (
        <Html center style={{ pointerEvents: "none" }}>
          <div style={styles.tag}>{data.title}</div>
        </Html>
      )}
    </group>
  );
}

function DetailsPanel({
  artwork,
  onClose,
}: {
  artwork: Artwork | null;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        ...styles.drawer,
        transform: artwork ? "translateX(0)" : "translateX(110%)",
      }}
    >
      {artwork && (
        <div style={styles.drawerInner}>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Cerrar">
            x
          </button>
          <img
            src={artwork.image}
            alt={artwork.title}
            style={styles.drawerImg}
          />
          <div style={styles.drawerBody}>
            <h2 style={{ margin: "0 0 6px" }}>{artwork.title}</h2>
            <div style={{ color: "#475569", marginBottom: 6 }}>
              {artwork.artist} • {artwork.year}
            </div>
            <div style={{ marginBottom: 8 }}>
              {artwork.technique} — {artwork.size}
            </div>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>
              {artwork.price}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href="#comprar" style={styles.ctaPrimary}>
                Comprar
              </a>
              <a href="#contacto" style={styles.ctaSecondary}>
                Contactar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple inline styles (desktop-first)
const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    color: "#0f172a",
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "#111", // para evitar parches blancos en bordes
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    zIndex: 10,
  },

  mainContent: {
    flex: 1,
    position: "relative",
    display: "flex",
    width: "100%",
    height: "100%",
  },

  fallback: {
    flex: 1,
    display: "grid",
    placeItems: "center",
  },

  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    height: "100vh",
    width: 380,
    maxWidth: "90vw",
    background: "#fff",
    boxShadow: "0 0 20px rgba(0,0,0,0.35)",
    transition: "transform .35s ease",
    zIndex: 30,
    transform: "translateX(110%)",
    display: "flex",
    flexDirection: "column",
  },

  drawerInner: {
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    height: "100%",
  },

  drawerImg: {
    width: "100%",
    height: 240,
    objectFit: "cover",
  },

  closeBtn: {
    background: "transparent",
    border: 0,
    fontSize: 26,
    cursor: "pointer",
    alignSelf: "flex-end",
    margin: 8,
  },

  tag: {
    background: "rgba(14,82,154,0.95)",
    color: "#fff",
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },

  ctaPrimary: {
    background: "#0E529A",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    textDecoration: "none",
  },

  ctaSecondary: {
    background: "#e5e7eb",
    padding: "8px 12px",
    borderRadius: 8,
    fontWeight: 600,
    textDecoration: "none",
    color: "#0f172a",
  },
};
