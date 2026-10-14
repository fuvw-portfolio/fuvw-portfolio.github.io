const videoDialog = document.querySelector(".video-dialog");
const videoPlayer = videoDialog.querySelector(".video-player");
const videoTitle = videoDialog.querySelector("#video-dialog-title");
const videoLogo = videoDialog.querySelector("#video-dialog-logo");
const videoGameLink = videoDialog.querySelector(".video-game-link");
const videoFileLink = videoDialog.querySelector(".video-file-link");
const videoError = videoDialog.querySelector(".video-error");
const videoClips = videoDialog.querySelector(".video-clips");
let modalSources = [];
let modalClipIndex = 0;
const previewVisibility = new Map();
const videoMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

function revealVideoPreview(state) {
  if (state.active && state.ready && state.delayElapsed) state.button.classList.add("is-playing");
}

function playVideoPreview(video, state) {
  video.play().then(() => {
    if (!state.active) return;
    state.ready = true;
    revealVideoPreview(state);
  }).catch(() => {});
}

function playModalClip(index) {
  modalClipIndex = index;
  videoError.hidden = true;
  videoFileLink.href = modalSources[index];
  videoPlayer.src = modalSources[index];
  for (const [clipIndex, button] of [...videoClips.children].entries()) {
    button.setAttribute("aria-pressed", String(clipIndex === index));
  }
  videoPlayer.play().catch(() => {});
}

// Buffer behind the thumbnail, then fade after 1 second of visible time.
function updateVideoPreviews() {
  const canPlay = !videoDialog.open && !document.hidden && !videoMotionPreference.matches && !navigator.connection?.saveData;
  for (const [video, state] of previewVisibility) {
    if (canPlay && state.visible) {
      if (state.active) continue;
      state.active = true;
      state.timer = window.setTimeout(() => {
        state.delayElapsed = true;
        revealVideoPreview(state);
      }, 1000);
      playVideoPreview(video, state);
    } else {
      window.clearTimeout(state.timer);
      state.timer = null;
      state.active = false;
      state.ready = false;
      state.delayElapsed = false;
      state.button.classList.remove("is-playing");
      video.pause();
    }
  }
}

const videoPreviewObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    previewVisibility.get(entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= 0.3;
  }
  updateVideoPreviews();
}, { threshold: 0.3 });

for (const button of document.querySelectorAll(".video-preview")) {
  const preview = button.querySelector("video");
  const sources = (button.dataset.videos || button.dataset.video).split(/\s+/);
  const state = { button, sources, index: 0, visible: false, active: false, ready: false, delayElapsed: false, timer: null };
  previewVisibility.set(preview, state);
  preview.loop = sources.length === 1;
  videoPreviewObserver.observe(preview);

  preview.addEventListener("ended", () => {
    if (!state.active || sources.length === 1) return;
    state.index = (state.index + 1) % sources.length;
    state.ready = false;
    button.classList.remove("is-playing");
    preview.src = sources[state.index];
    playVideoPreview(preview, state);
  });

  button.addEventListener("click", () => {
    const project = button.closest("article");
    const title = document.getElementById(button.dataset.project);
    videoTitle.textContent = title.textContent;
    videoLogo.src = project.querySelector(".project-logo").src;
    videoGameLink.href = title.querySelector("a").href;
    videoPlayer.poster = preview.poster;
    videoError.hidden = true;
    modalSources = sources;
    videoClips.replaceChildren();
    videoClips.hidden = sources.length === 1;
    if (sources.length > 1) {
      for (let index = 0; index < sources.length; index++) {
        const clip = document.createElement("button");
        clip.type = "button";
        clip.className = "video-clip";
        clip.textContent = `Clip ${index + 1}`;
        clip.addEventListener("click", () => playModalClip(index));
        videoClips.append(clip);
      }
    }
    videoDialog.showModal();
    document.body.classList.add("video-open");
    updateVideoPreviews();
    playModalClip(state.index);
  });
}

videoDialog.querySelector(".video-close").addEventListener("click", () => videoDialog.close());
videoDialog.addEventListener("click", event => {
  if (event.target !== videoDialog) return;
  const bounds = videoDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
    videoDialog.close();
  }
});

// Native dialog handles Escape, keyboard focus trapping, and focus restoration.
videoDialog.addEventListener("close", () => {
  videoPlayer.pause();
  videoPlayer.removeAttribute("src");
  videoPlayer.load();
  videoError.hidden = true;
  modalSources = [];
  videoClips.replaceChildren();
  videoClips.hidden = true;
  document.body.classList.remove("video-open");
  updateVideoPreviews();
});

videoPlayer.addEventListener("ended", () => {
  if (videoDialog.open && modalSources.length > 1) playModalClip((modalClipIndex + 1) % modalSources.length);
});

videoPlayer.addEventListener("error", () => {
  if (videoDialog.open && videoPlayer.hasAttribute("src")) videoError.hidden = false;
});
document.addEventListener("visibilitychange", updateVideoPreviews);
videoMotionPreference.addEventListener("change", updateVideoPreviews);
