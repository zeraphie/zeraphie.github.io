// ─ perf — honest degradation ─
//
// Software WebGL means every frame of every canvas is CPU work —
// detect it once, degrade the page honestly, and say so in the
// console so "is it my hardware acceleration?" has an answer.
// ?debug installs a live state line for stuck-frame forensics.

/** Detect + apply the degraded mode. Returns whether it is on. */
export function initPerfMode(): boolean {
  function softwareRendered(): boolean {
    try {
      const probe = document.createElement("canvas");
      const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
      if (!gl) {
        return true;
      }
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
      console.info(
        `[flow] webgl renderer: ${renderer || "(masked)"} — ` +
          "if this says SwiftShader/Software, browser hardware acceleration is off " +
          "(chrome://gpu, Settings → System → graphics acceleration)"
      );
      return /swiftshader|software|llvmpipe|basic render/i.test(renderer);
    } catch {
      return true;
    }
  }
  // Manual override for A/B-ing the degrade: ?perf=low or
  // localStorage flow-perf=low forces it on real hardware.
  const PERF_FORCED =
    new URLSearchParams(location.search).get("perf") === "low" ||
    (() => {
      try {
        return localStorage.getItem("flow-perf") === "low";
      } catch {
        return false;
      }
    })();
  const PERF_LOW = PERF_FORCED || softwareRendered();
  if (PERF_LOW) {
    document.body.dataset.perf = "low";
    console.info(`[flow] degrade active (${PERF_FORCED ? "forced" : "software gpu detected"})`);
  }
  return PERF_LOW;
}

/** ?debug: a live state line, so a stuck frame reports exactly
 * which piece failed instead of needing forensic screenshots. */
export function installDebugHud(line: () => string): void {
  if (!new URLSearchParams(location.search).has("debug")) {
    return;
  }
  const hud = document.createElement("div");
  hud.style.cssText =
    "position:fixed;left:50%;bottom:4px;transform:translateX(-50%);z-index:99;" +
    "font:11px Consolas,monospace;color:#00cc88;background:rgba(20,22,23,.85);" +
    "padding:2px 10px;pointer-events:none;white-space:nowrap;";
  document.body.appendChild(hud);
  window.setInterval(() => {
    hud.textContent = line();
  }, 250);
}
