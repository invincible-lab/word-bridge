import React from "react";
import { S } from "./styles";

export default function Spinner({ text }) {
  return (
    <div style={S.spinnerWrap}>
      <div style={S.spinner} />
      {text && (
        <p style={{ color: "rgba(255,255,255,0.8)", marginTop: 12 }}>{text}</p>
      )}
    </div>
  );
}
