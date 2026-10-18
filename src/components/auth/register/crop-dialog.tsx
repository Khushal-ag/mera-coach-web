"use client";

import type { RegisterFormController } from "./use-register-form";

/** Modal used to position the business logo or profile photo before upload. */
export function CropDialog({ form }: { form: RegisterFormController }) {
  const { crop, closeCropper, applyCrop } = form;
  if (!crop) return null;
  return (
    <div
      id="rgCropModal"
      style={{
        display: "flex",
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.75)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          maxWidth: 560,
          width: "95%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#1b4332",
              }}
            >
              {crop.title}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>
              {crop.hint}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCropper}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#999",
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            width: "100%",
            maxHeight: 360,
            overflow: "hidden",
            background: "#f0f0f0",
            borderRadius: 10,
          }}
        >
          {/* Local blob preview cannot be optimized by next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={crop.url}
            alt=""
            style={{ maxWidth: "100%", display: "block" }}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 14,
          }}
        >
          <i
            className="fas fa-search-minus"
            style={{ color: "#888", fontSize: 13 }}
          />
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={0}
            style={{ flex: 1, accentColor: "#1b4332" }}
          />
          <i
            className="fas fa-search-plus"
            style={{ color: "#888", fontSize: 13 }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 18,
          }}
        >
          <button
            type="button"
            onClick={closeCropper}
            style={{
              padding: "9px 20px",
              border: "1.5px solid #ddd",
              borderRadius: 8,
              background: "#fff",
              fontSize: 13,
              cursor: "pointer",
              color: "#555",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyCrop}
            style={{
              padding: "9px 24px",
              border: "none",
              borderRadius: 8,
              background: "#1b4332",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <i className="fas fa-crop-alt" /> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
