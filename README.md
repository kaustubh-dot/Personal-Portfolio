# Kaustubh Upadhya — Portfolio

Static portfolio built with HTML, CSS, JavaScript, Three.js, and GSAP. The homepage has a comic city scene, selected projects, Side Quests, About, and contact links. Each project opens a dedicated detail page.

## Branches

- main: deployed version.
- all-changes: current portfolio development.

## Run and build

Run npm run dev, then open http://localhost:5500. Python must be available for the local server.

Run npm run build to generate public/ with the homepage, project pages, assets, and robots.txt. Build output is generated and should not be committed.

## Edit content

- index.html: homepage content and project links.
- assets/: homepage styles, scripts, illustrations, and résumé.
- projects/project-01.html through project-03.html: project content, currently placeholders.
- projects/assets/: shared project styles, interactions, and artwork.

Replace placeholder copy and media in the corresponding HTML pages when real project details are available. Keep image dimensions accurate to avoid layout shifts.

The site supports reduced motion. The loader and logo cameo work independently of the animation CDNs; page content remains available without JavaScript.
