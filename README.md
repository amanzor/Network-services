# ANCS Corp — Website Redesign Proposal

Concept redesign for **Advanced Networks & Cabling Services Corp (ANCS Corp)**. It replaces the current single-page GoDaddy site at ancscorp.com and keeps all of its existing content.

**Design direction: "Signal Path × The Rack"**
- **Hierarchical modular architecture.** The page is organized like engineering sheets: each section is a "Sheet" made of "Modules," and each service has a "Spec."
- **Signal Path.** A fiber line runs down the side of the page and fills with light as you scroll, lighting a node at each section. The hero has a code-drawn fiber light animation layered over a Higgsfield video loop.
- **The Rack.** The services appear as a server rack. Clicking a rack unit (U01–U04) draws a glowing patch cable into its spec panel. Stats appear as rack units with LEDs, industries as patch ports, and the Call button looks like a patch jack.

## Run locally
It's a static site with no build step:
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Structure
```
index.html              all content + SEO + LocalBusiness schema
assets/css/styles.css   design system (tokens, rack, modules, responsive)
assets/js/main.js       spine, fiber canvas, rack tabs/cable, live hours, counters, form
assets/img/             Higgsfield-generated concept imagery (JPG, optimized)
assets/media/           Higgsfield/Kling video loops (H.264, muted, faststart)
```

## Content carried over from ancscorp.com
Everything below was carried over:
- All four service descriptions and their bullet lists, word for word
- Partners: Hotwire, FPL FiberNet, Crown Castle, Comcast
- Work With Us, Custom Solutions, Experience and Why Choose ANCS copy
- The inflation promise
- The 80% repeat-client figure
- Industries served
- Reviews and Project Gallery sections
- Contact form, phone 786-400-7445, business hours and the after-hours note
- Footer and copyright

## To confirm with the owner before launch
- [ ] **Years in business.** The current site says "25+", "20+" and "more than a decade" in different places. This build uses **20+** everywhere.
- [ ] **Logo.** The header uses a placeholder rack-mark wordmark. Swap in the official logo file.
- [ ] **Project photos.** The gallery and service images are AI concept imagery made for this proposal. Replace them with real ANCS job-site photos.
- [ ] **Reviews.** Add real, verified reviews to `REVIEWS` in `assets/js/main.js`, or embed their Google Business reviews. No reviews were invented.
- [ ] **Contact form backend.** Set `data-endpoint="https://formspree.io/f/XXXX"` (or similar) on the `<form>`. Until then the form runs in demo mode.
- [ ] **Business details.** Get an email address, street address and social links. None of these are on the current site.

## Deploy
The site works on GitHub Pages, Netlify, Vercel or any static host. On GitHub Pages: **Settings → Pages → Deploy from branch**, then pick the branch and the root folder.

## Accessibility & performance
- Built with semantic landmarks, a keyboard-operable rack tablist (arrow keys plus Home/End), visible focus states and a skip link.
- Motion is disabled for visitors with `prefers-reduced-motion`.
- Gallery videos lazy-load near the viewport, and the hero canvas pauses when it's offscreen.
- All media together is about 2.5 MB.
