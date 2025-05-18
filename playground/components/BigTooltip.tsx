import { For, Show } from "solid-js";

import type { TooltipProps } from "../../src/plugins";

export const BigTooltip = (props: TooltipProps) => {
  const xDate = () => new Date(props.cursor.xValue * 1000).toLocaleDateString();

  return (
    <div
      style={{
        "z-index": 1000,
        "pointer-events": "none",
        background: "white",
        border: "2px solid #ccc",
        padding: "16px 20px",
        "font-size": "16px",
        "border-radius": "8px",
        "box-shadow": "0 4px 8px rgba(0,0,0,0.15)",
        "min-width": "300px",
      }}
    >
      <div
        style={{
          "margin-bottom": "16px",
          "font-weight": "bold",
          "border-bottom": "2px solid #eee",
          "padding-bottom": "8px",
          "font-size": "18px",
        }}
      >
        {xDate()}
      </div>
      <div>
        <For each={props.seriesData}>
          {(s) => {
            const cursorValue = () => props.u.data[s.seriesIdx]?.[props.cursor.idx];

            return (
              <Show when={s.visible}>
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    "margin-bottom": "12px",
                  }}
                >
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      "border-radius": "50%",
                      "background-color": s.stroke as string,
                      "margin-right": "12px",
                    }}
                  />
                  <div>
                    <strong style={{ color: s.stroke as string, "font-size": "16px" }}>
                      {s.label}
                    </strong>
                    <div style={{ "font-size": "14px", "margin-top": "4px" }}>
                      {cursorValue()?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Show>
            );
          }}
        </For>
      </div>
    </div>
  );
};
