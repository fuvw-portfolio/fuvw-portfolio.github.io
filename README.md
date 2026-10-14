# fuvw — Roblox engineering portfolio

Static HTML, CSS, and JavaScript. No build step or frontend dependencies.

## Preview

Open index.html directly, use your editor's Live Server, or run:

    python -m http.server 8000

Then visit http://localhost:8000.

## Content

- Hero with a rotating elliptical orbit of five official game icons and the Speedy Fun Games and Multivers Games group icons, all cropped as rounded squares. Scrolling adds momentum and a subtle outward spread; horizontal dragging rotates it directly.
- The orbit pauses offscreen, supports the pause control and reduced motion, and keeps vertical touch scrolling available.
- Selected work: +1 Aura Speed Escape, Villain Tower, Heroes Tower, Anime Infection, and Merge Your Zoo. fuvw was the lead scripter on all five.
- Project headings include each game's official icon. Aura Speed Escape stays featured at the top, followed by Anime Infection, Villain Tower, Heroes Tower, and Merge Your Zoo. Video previews show their thumbnail for one second on entering view, then fade into muted gameplay once playback is ready. Watch video appears on hover or keyboard focus and opens a native modal player.
- Anime Infection cycles through anime-infection-1.mp4, anime-infection-2.mp4, and anime-infection-3.mp4, then repeats. The modal opens the currently previewed clip, cycles through the same sequence, and lets viewers select a clip directly. All clips live in assets/videos/; the tower footage came from https://github.com/fuvw-portfolio/fuvw-portfolio.github.io (vid/herotower.mp4 and vid/herootower.mp4 respectively).
- Video previews pause offscreen, in hidden tabs, and while the modal is open; reduced motion and data-saving preferences disable automatic preview playback. The modal supports Escape, backdrop click, keyboard focus, and native playback controls.
- About and Discord contact (@fuvw), with a copy username button.
- Locally hosted Inter font, licensed under the SIL Open Font License.
- Scroll-triggered digit reels with upward motion, blur, and fading; numbers settle on the verified snapshot values.
- Gentle text entrances and full support for the system's reduced-motion preference.

Visits, likes, and approval ratings are a Roblox API snapshot checked on 14 October 2026. Exact figures, source URLs, and universe IDs are retained in assets/game-stats.json. The 41K peak CCU for Aura Speed Escape was supplied by fuvw; it is a historical peak, not the current player count.

To refresh the figures, query the game and vote API URLs in the snapshot, update the snapshot and the displayed values in index.html, then change the checked date. Approval is likes / (likes + dislikes).

## Publish on GitHub Pages

Push the files to GitHub, then choose Settings → Pages → Deploy from branch main / root (/). Asset URLs are relative, and .nojekyll keeps the site buildless.

Game artwork and group icons are downloaded from the official Roblox thumbnail API. Design references: RoTerminal's compact type hierarchy, neutral surfaces, and blue accents; the elliptical movement, depth, and scroll response of Orbit Logos – North (https://www.framer.com/marketplace/components/orbit-logos-north/).
