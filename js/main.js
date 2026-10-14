const orbit = document.querySelector(".game-orbit");
const hero = document.querySelector(".hero");
const effectToggle = document.querySelector(".effect-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const tiles = [...orbit.querySelectorAll(".orbit-tile")];
const nodes = [...orbit.querySelectorAll(".orbit-node")];
const track = orbit.querySelector(".orbit-track ellipse");
const orbitItems = [
  ...tiles.map((element, index) => ({ element, offset: index / tiles.length * Math.PI * 2, isLogo: true })),
  ...nodes.map((element, index) => ({ element, offset: (index + 0.5) / nodes.length * Math.PI * 2, isLogo: false })),
];

let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let radiusX = 0;
let radiusY = 0;
let rotation = 0.24;
let velocity = 0;
let expansion = 1;
let dragging = null;
let animationFrame = null;
let previousTime = null;
let lastScrollY = window.scrollY || 0;
let isRunning = !reducedMotion.matches;
let heroVisible = true;

for (const item of orbitItems) {
  item.element.style.left = "0";
  item.element.style.top = "0";
}

function resizeOrbit() {
  const bounds = orbit.getBoundingClientRect();
  if (width === bounds.width && height === bounds.height) return;

  width = bounds.width;
  height = bounds.height;

  const iconSize = Number.parseFloat(getComputedStyle(tiles[0]).width);
  centerX = width / 2;
  centerY = height * 0.445;
  // Leave room for the front icons when scroll expands the ellipse.
  radiusX = Math.max(70, Math.min(565, (width - iconSize * 1.2 - 44) / 2.28));
  radiusY = Math.max(60, Math.min(height * 0.325, (height - iconSize * 1.2 - 160) / 2.25));

  renderOrbit(0);
}

function renderOrbit(delta) {
  if (!dragging) {
    velocity *= Math.exp(-delta * 3.2);
    rotation += (0.12 + velocity) * delta;
  }

  const targetExpansion = 1 + Math.min(0.14, Math.abs(velocity) * 0.04);
  expansion += (targetExpansion - expansion) * (1 - Math.exp(-delta * 7));

  const horizontal = radiusX * expansion;
  const vertical = radiusY * (1 + (expansion - 1) * 0.75);
  const tilt = Math.max(-12, Math.min(12, velocity * 4));

  track.setAttribute("cx", String(centerX));
  track.setAttribute("cy", String(centerY));
  track.setAttribute("rx", String(horizontal));
  track.setAttribute("ry", String(vertical));

  for (const item of orbitItems) {
    const angle = rotation + item.offset;
    const depth = (Math.sin(angle) + 1) / 2;
    const x = centerX + Math.cos(angle) * horizontal;
    const y = centerY + Math.sin(angle) * vertical;
    const scale = item.isLogo ? 0.77 + depth * 0.38 : 0.65 + depth * 0.65;

    item.element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) perspective(700px) rotateY(${(Math.cos(angle) * 10).toFixed(2)}deg) rotateZ(${tilt.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    item.element.style.opacity = String(item.isLogo ? 0.55 + depth * 0.45 : 0.28 + depth * 0.42);
    item.element.style.zIndex = String(10 + Math.round(depth * 20));

    if (item.isLogo) item.element.style.filter = `blur(${((1 - depth) * 0.55).toFixed(2)}px)`;
  }
}

function animateOrbit(time) {
  const interval = previousTime === null ? 0 : time - previousTime;

  if (previousTime === null || interval >= 1000 / 60 - 0.5) {
    renderOrbit(Math.min(interval / 1000, 0.06));
    previousTime = time;
  }

  animationFrame = requestAnimationFrame(animateOrbit);
}

function updateOrbit() {
  if (animationFrame !== null) cancelAnimationFrame(animationFrame);

  animationFrame = null;
  previousTime = null;

  const label = isRunning ? "Pause game orbit" : "Resume game orbit";
  effectToggle.setAttribute("aria-pressed", String(isRunning));
  effectToggle.setAttribute("aria-label", label);
  effectToggle.title = label;

  if (isRunning && heroVisible && !document.hidden) {
    animationFrame = requestAnimationFrame(animateOrbit);
  }
}

window.addEventListener("scroll", () => {
  const currentY = window.scrollY || 0;
  const distance = currentY - lastScrollY;
  lastScrollY = currentY;

  if (!isRunning || !heroVisible || document.hidden || dragging) return;

  velocity = Math.max(-4, Math.min(4, velocity + distance * 0.01));
}, { passive: true });

orbit.addEventListener("pointerdown", (event) => {
  if (event.button > 0 || dragging) return;

  dragging = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastX: event.clientX,
    lastTime: event.timeStamp,
    moved: false,
  };
});

orbit.addEventListener("pointermove", (event) => {
  if (!dragging || event.pointerId !== dragging.id) return;

  const horizontalDistance = Math.abs(event.clientX - dragging.startX);
  const verticalDistance = Math.abs(event.clientY - dragging.startY);

  if (!dragging.moved) {
    if (horizontalDistance < 6 || (event.pointerType === "touch" && verticalDistance > horizontalDistance)) return;

    dragging.moved = true;
    orbit.dataset.dragging = "true";
    orbit.setPointerCapture(event.pointerId);
  }

  const distance = event.clientX - dragging.lastX;
  const seconds = Math.max((event.timeStamp - dragging.lastTime) / 1000, 1 / 120);
  const turn = -distance / Math.max(radiusX, 100);

  rotation += turn;
  velocity = Math.max(-4, Math.min(4, turn / seconds));
  dragging.lastX = event.clientX;
  dragging.lastTime = event.timeStamp;

  if (!isRunning) renderOrbit(0);
});

function endOrbitDrag(event) {
  if (!dragging || event.pointerId !== dragging.id) return;

  if (orbit.hasPointerCapture(event.pointerId)) orbit.releasePointerCapture(event.pointerId);

  dragging = null;
  orbit.dataset.dragging = "false";
}

orbit.addEventListener("pointerup", endOrbitDrag);
orbit.addEventListener("pointercancel", endOrbitDrag);
orbit.addEventListener("lostpointercapture", endOrbitDrag);

effectToggle.hidden = false;
effectToggle.addEventListener("click", () => {
  isRunning = !isRunning;
  velocity = 0;
  dragging = null;
  orbit.dataset.dragging = "false";
  updateOrbit();
});

new ResizeObserver(resizeOrbit).observe(orbit);
new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  if (!heroVisible) velocity = 0;
  updateOrbit();
}).observe(hero);

resizeOrbit();
updateOrbit();

const copyButton = document.querySelector(".discord-copy");
const copyStatus = document.querySelector(".copy-status");
let feedbackTimeout;

copyButton.addEventListener("click", async () => {
  const username = copyButton.dataset.username;
  let copied = false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(username);
      copied = true;
    } catch {
      // file:// and locked-down browsers fall through to the selection copy.
    }
  }

  if (!copied) {
    const field = document.createElement("textarea");
    field.value = username;
    field.setAttribute("readonly", "");
    field.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.append(field);
    field.select();

    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    field.remove();
    copyButton.focus();
  }

  clearTimeout(feedbackTimeout);
  copyStatus.textContent = copied ? "Username copied." : `Copy manually: ${username}`;
  copyButton.setAttribute("aria-label", copied ? "Discord username copied. Copy again." : `Copy Discord username ${username}`);

  feedbackTimeout = setTimeout(() => {
    copyStatus.textContent = "";
    copyButton.setAttribute("aria-label", `Copy Discord username ${username}`);
  }, 4000);
});

const activeContentAnimations = new Set();
const revealElements = document.querySelectorAll("[data-reveal]");
const contentObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;

    const element = entry.target;
    contentObserver.unobserve(element);

    if (element.hasAttribute("data-reveal")) element.style.opacity = "";
    if (reducedMotion.matches || typeof element.animate !== "function") continue;

    if (!element.hasAttribute("data-roll")) {
      const animation = element.animate([
        { opacity: 0, transform: "translateY(12px)", filter: "blur(3px)" },
        { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
      ], {
        duration: 650,
        easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      });

      activeContentAnimations.add(animation);
      animation.finished.catch(() => {}).finally(() => activeContentAnimations.delete(animation));
      continue;
    }

    const value = element.textContent.trim();
    const accessibleValue = document.createElement("span");
    accessibleValue.className = "sr-only";
    accessibleValue.textContent = value;

    const reels = document.createElement("span");
    reels.className = "number-reels";
    reels.setAttribute("aria-hidden", "true");

    const tracks = [];
    let digitIndex = 0;

    for (const character of value) {
      if (!/\d/.test(character)) {
        const symbol = document.createElement("span");
        symbol.className = "reel-symbol";
        symbol.textContent = character;
        reels.append(symbol);
        continue;
      }

      const viewport = document.createElement("span");
      viewport.className = "digit-window";

      const digitTrack = document.createElement("span");
      digitTrack.className = "digit-track";

      const steps = 10 + Number(character);
      for (let step = 0; step <= steps; step++) {
        const glyph = document.createElement("span");
        glyph.className = "digit-glyph";
        glyph.textContent = String(step % 10);
        digitTrack.append(glyph);
      }

      viewport.append(digitTrack);
      reels.append(viewport);
      tracks.push({ track: digitTrack, steps, index: digitIndex });
      digitIndex += 1;
    }

    element.replaceChildren(accessibleValue, reels);

    const animations = [];
    for (const { track: digitTrack, steps, index } of tracks) {
      const animation = digitTrack.animate([
        { transform: "translateY(0)", filter: "blur(0px)", opacity: 1 },
        { filter: "blur(2px)", opacity: 0.65, offset: 0.18 },
        { filter: "blur(1px)", opacity: 0.85, offset: 0.65 },
        { transform: `translateY(-${steps * 1.2}em)`, filter: "blur(0px)", opacity: 1 },
      ], {
        duration: 1040 + index * 85,
        delay: index * 35,
        easing: "cubic-bezier(0.16, 0.68, 0.18, 1)",
        fill: "both",
      });

      activeContentAnimations.add(animation);
      animations.push(animation);
    }

    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      element.textContent = value;

      for (const animation of animations) {
        activeContentAnimations.delete(animation);
        animation.cancel();
      }
    });
  }
}, { threshold: 0.25, rootMargin: "0px 0px -24px 0px" });

for (const element of document.querySelectorAll("[data-roll], [data-reveal]")) {
  if (element.hasAttribute("data-reveal") && !reducedMotion.matches && typeof element.animate === "function") {
    element.style.opacity = "0";
  }

  contentObserver.observe(element);
}

reducedMotion.addEventListener("change", () => {
  isRunning = !reducedMotion.matches;
  velocity = 0;
  expansion = 1;
  renderOrbit(0);
  updateOrbit();

  if (!reducedMotion.matches) return;

  for (const animation of activeContentAnimations) animation.finish();
  for (const element of revealElements) element.style.opacity = "";
});

document.getElementById("year").textContent = new Date().getFullYear();
