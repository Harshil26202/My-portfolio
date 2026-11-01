# Harshil Kaneria — Portfolio

Personal portfolio of Harshil Kaneria, AI Engineer: agents that ship to production, and the evals that prove they work.

**Live site:** https://harshil26202.github.io/My-portfolio/

---

## The idea

One concept, one signature moment: **your AI twin is a robot.**

- **Hero:** a ceramic-and-glass robot built entirely in three.js (no model files). It follows your cursor, blinks, and waves when clicked, then opens the AI twin.
- **How I build:** a pinned scroll scene where 27 cubes scattered as "noise" assemble into one structure while three principles step through.
- **About:** my portrait (backdrop graded to the site's violet and page colour) in a card that tilts with the cursor, with a soft AI "scan" pass.
- **Work:** featured case studies (Cascade, Nexus), production work and builds, each with its own animated single-colour SVG illustration, plus detail sheets.
- **Research:** graph neural networks for PM2.5 forecasting across 184 cities (IIT Gandhinagar; Workshop on Climate Change and ML, Amalthea 2022), with an animated city-graph visual and key findings.
- **Recognition:** benchmarks plus a stacked card for each certificate type.
- **Skills:** an attention heatmap of tools × projects. **Experience:** a training-run loss curve with linked checkpoints.
- **Details:** smooth scroll (Lenis), word-by-word heading reveals, custom cursor, magnetic buttons, marquee, a live IST clock, light/dark themes, reduced-motion support.

Press **⌘K / Ctrl K** (or `/`) to open the **AI twin**. It runs BM25 retrieval over [`assets/js/knowledge.js`](assets/js/knowledge.js) entirely in the browser, streams answers with citations, and **abstains** when the best match falls below a threshold. No LLM call, no API key, nothing sent anywhere.

## Files

| File | What it holds |
|---|---|
| `index.html` | All page content, as static semantic HTML |
| `assets/css/style.css` | Design tokens (one type scale, light + dark) and layout |
| `assets/js/main.js` | Smooth scroll, loader, reveals, cursor, attention map, training chart, twin, contact form |
| `assets/js/scene.js` | The three.js robot and cube (loaded as an ES module from jsDelivr) |
| `assets/js/knowledge.js` | The twin's knowledge base |

## Updating content

- **Page copy:** `index.html`.
- **Twin answers:** add a chunk with `keys` (search terms) and an `answer` to `assets/js/knowledge.js`.
- **Attention map weights:** the `rows` array in `initAttention()` in `assets/js/main.js`.
- **Training-run checkpoints:** the `<li data-t="…">` items in `#run-log` (`data-t` is a fractional year).
- **Robot colours / shape:** `createRobot()` in `assets/js/scene.js`.
- **Your photo:** replace `assets/img/harshil.webp` and `assets/img/harshil.jpg` (4:5 portrait, 900×1125). If the face moves, adjust `.real-box` in `style.css`.

## Tech

Vanilla HTML, CSS and JavaScript with no build step, deployed on GitHub Pages. three.js 0.170 and Lenis 1.1 load from jsDelivr. Fonts: Geist and Geist Mono. Icons: Bootstrap Icons. WebGL scenes only render while on screen; without WebGL the page still works with a soft gradient fallback.

## Run locally

```bash
git clone https://github.com/Harshil26202/My-portfolio.git
cd My-portfolio
python3 -m http.server 8000   # then open http://localhost:8000
```
