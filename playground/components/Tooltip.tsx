import { For, Show } from "solid-js";

import type { TooltipProps } from "../../src/plugins";

export const Tooltip = (props: TooltipProps) => {
  const xDate = () => new Date(props.cursor.xValue * 1000).toLocaleDateString();

  return (
    <div
      style={{
        "z-index": 1000,
        "pointer-events": "none",
        background: "white",
        border: "1px solid #ccc",
        padding: "6px 8px",
        "font-size": "12px",
        "border-radius": "4px",
        "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          "margin-bottom": "8px",
          "font-weight": "bold",
          "border-bottom": "1px solid #eee",
          "padding-bottom": "4px",
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
                    "margin-bottom": "4px",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      "border-radius": "50%",
                      "background-color": s.stroke as string,
                      "margin-right": "6px",
                    }}
                  />
                  <div>
                    <strong style={{ color: s.stroke as string }}>{s.label}</strong>:{" "}
                    {cursorValue()?.toFixed(2)}
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
