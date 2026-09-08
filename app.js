(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const config = window.PGMT_CONFIG || {};
  const resourceLabels = { paper: "paper", arxiv: "arXiv", youtube: "YouTube", bilibili: "Bilibili" };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  for (const link of $$("[data-resource]")) {
    const value = config[link.dataset.resource];
    if (typeof value !== "string" || !value.trim()) continue;
    let url;
    try { url = new URL(value, document.baseURI); } catch { continue; }
    if (!["https:", "http:", "file:"].includes(url.protocol)) continue;
    link.href = value;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.removeAttribute("role");
    link.removeAttribute("aria-disabled");
    link.classList.remove("unavailable");
    link.title = `Open ${resourceLabels[link.dataset.resource] || link.dataset.resource}`;
    $(".soon", link)?.remove();
  }

  if ("IntersectionObserver" in window) {
    const sections = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        $$(".section-nav a").forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    }, { rootMargin: "-10% 0px -55% 0px" });
    $$("main>section[id]").forEach(section => sections.observe(section));
  }

  function hydrate(video) {
    const source = $("source[data-src]", video);
    if (source) {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
      video.load();
    }
  }
  function pauseOthers(current) {
    $$("video").forEach(video => { if (video !== current) video.pause(); });
  }
  async function play(video) {
    hydrate(video);
    pauseOthers(video);
    try { await video.play(); return true; } catch { return false; }
  }

  const hero = $("#hero-video");
  const heroToggle = $("#hero-toggle");
  let heroVisible = false;
  let heroPausedByUser = false;
  let heroStartedByUser = false;
  function updateHeroButton() {
    heroToggle.setAttribute("aria-label", hero.paused ? "Play teaser" : "Pause teaser");
    $("use", heroToggle).setAttribute("href", hero.paused ? "#i-play" : "#i-pause");
  }
  function updateHero() {
    const allowed = heroVisible && !heroPausedByUser && !document.hidden && !$("dialog[open]") &&
      !$$("video").some(video => video !== hero && !video.paused) &&
      (heroStartedByUser || (!reduceMotion.matches && !navigator.connection?.saveData));
    if (allowed) void play(hero);
    else hero.pause();
  }
  hero.addEventListener("play", updateHeroButton);
  hero.addEventListener("pause", updateHeroButton);
  heroToggle.addEventListener("click", () => {
    if (hero.paused) { heroStartedByUser = true; heroPausedByUser = false; void play(hero); }
    else { heroPausedByUser = true; hero.pause(); }
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      updateHero();
    }, { threshold: 0.15 }).observe(hero);
  } else { heroVisible = true; updateHero(); }
  reduceMotion.addEventListener("change", updateHero);

  const clips = [
    { id: "stairs", label: "Walking up stairs", category: "locomotion", duration: "0:29", text: "Terrain-aware foot placement and swing clearance adapt a flat-ground locomotion reference to stairs." },
    { id: "bridge", label: "Ascending and descending stairs", category: "locomotion", duration: "0:12", text: "PGMT ascends, turns, and descends an outdoor staircase using the same perceptive locomotion policy." },
    { id: "box", label: "Obstacle traversal", category: "locomotion", duration: "0:08", text: "The policy adjusts footholds and whole-body posture to climb onto a box. The evaluation includes obstacles up to 37 cm high." },
    { id: "grass", label: "Outdoor locomotion", category: "locomotion", duration: "0:13", text: "The robot maintains locomotion on grass despite vegetation, soft support surfaces, and imperfect terrain observations." },
    { id: "cartwheel", label: "Dynamic whole-body motion", category: "tracking", duration: "0:08", text: "Terrain perception is introduced while retaining the general motion prior, including dynamic behaviors such as cartwheels." },
    { id: "dance", label: "Motion tracking on uneven terrain", category: "tracking", duration: "0:17", text: "The robot preserves a whole-body motion reference while adapting its contacts and posture to the local terrain." },
    { id: "teleop-stairs", label: "Teleoperation during stair traversal", category: "teleoperation", duration: "0:17", text: "The operator controls upper-body motion while PGMT handles terrain-dependent lower-body adaptation on stairs." },
    { id: "teleop-punch", label: "Whole-body teleoperation", category: "teleoperation", duration: "0:08", text: "Human motion captured through PICO is retargeted online with GMR and executed by the same PGMT policy." },
    { id: "teleop-recovery", label: "Teleoperated posture transitions", category: "teleoperation", duration: "0:10", text: "Operator-commanded lying down and standing up demonstrate whole-body control across upright and ground-level postures." },
    { id: "recovery", label: "Disturbance rejection and recovery", category: "recovery", duration: "0:50", text: "The same policy responds to external disturbances and recovers from fallen states without a dedicated recovery controller." },
  ];
  const highlights = ["bridge", "box", "cartwheel", "dance", "teleop-stairs", "recovery"];
  const grid = $("#demo-grid");
  const tabs = $$("[data-category]");
  const videoObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    for (const entry of entries) if (!entry.isIntersecting) entry.target.pause();
  }, { threshold: 0 }) : null;

  function renderCategory(category, announce = true) {
    $$("video", grid).forEach(video => video.pause());
    videoObserver?.disconnect();
    const selected = category === "highlights" ? highlights.map(id => clips.find(clip => clip.id === id)) : clips.filter(clip => clip.category === category);
    grid.replaceChildren();
    selected.forEach(clip => {
      const card = document.createElement("figure");
      card.className = "demo-card";
      card.dataset.clip = clip.id;
      card.innerHTML = `<div class="clip-screen"><video controls muted playsinline loop preload="none" poster="assets/images/${clip.id}.jpg" aria-label="${clip.label}"><source src="assets/media/${clip.id}.mp4" type="video/mp4"></video></div><figcaption class="clip-caption"><h3>${clip.label}</h3><p>${clip.text}</p><div class="clip-footer"><span class="clip-meta">${clip.duration} &nbsp; · &nbsp; 1× speed</span><button class="clip-play" type="button" aria-label="Play ${clip.label.toLowerCase()}"><svg class="icon" aria-hidden="true"><use href="#i-play"/></svg><span>Play clip</span></button></div></figcaption>`;
      const video = $("video", card);
      const button = $(".clip-play", card);
      function sync() {
        button.setAttribute("aria-label", `${video.paused ? "Play" : "Pause"} ${clip.label.toLowerCase()}`);
        $("use", button).setAttribute("href", video.paused ? "#i-play" : "#i-pause");
        $("span", button).textContent = video.paused ? "Play clip" : "Pause clip";
      }
      video.addEventListener("play", () => { pauseOthers(video); sync(); });
      video.addEventListener("pause", sync);
      video.addEventListener("error", () => {
        let error = $(".media-error", card);
        if (!error) { error = document.createElement("p"); error.className = "media-error"; error.setAttribute("role", "status"); $("figcaption", card).append(error); }
        error.textContent = "The clip could not be loaded. Please try again.";
      });
      button.addEventListener("click", () => {
        if (video.paused) {
          if (video.error) video.load();
          const bounds = video.getBoundingClientRect();
          if (bounds.top < 55 || bounds.bottom > innerHeight) video.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
          void play(video);
        } else video.pause();
      });
      grid.append(card);
      videoObserver?.observe(video);
    });
    for (const tab of tabs) {
      const active = tab.dataset.category === category;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    }
    $("#demo-panel").setAttribute("aria-labelledby", `tab-${category}`);
    if (announce) $("#demo-status").textContent = `${selected.length} ${category === "highlights" ? "highlight" : category} demonstrations shown.`;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => renderCategory(tab.dataset.category));
    tab.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); renderCategory(tabs[next].dataset.category); tabs[next].focus(); }
    });
  });
  renderCategory("highlights", false);

  const videoDialog = $("#video-dialog");
  const overview = $("#overview-video");
  const figureDialog = $("#figure-dialog");
  function openDialog(dialog) {
    $$("video").forEach(video => video.pause());
    dialog.showModal();
    document.body.classList.add("dialog-open");
  }
  $$("[data-open-video]").forEach(button => button.addEventListener("click", () => { openDialog(videoDialog); void play(overview); }));
  $("#zoom-method").addEventListener("click", () => openDialog(figureDialog));
  $$("dialog").forEach(dialog => {
    $("[data-close-dialog]", dialog).addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (!$("dialog[open]")) document.body.classList.remove("dialog-open");
      overview.pause();
      updateHero();
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) $$("video").forEach(video => video.pause());
    else updateHero();
  });

  const copyButton = $("#copy-citation");
  let copyTimer;
  copyButton.addEventListener("click", async () => {
    const citation = $("#bibtex").textContent.trim();
    let copied = false;
    try { await navigator.clipboard.writeText(citation); copied = true; } catch {
      const field = document.createElement("textarea");
      field.value = citation;
      field.style.cssText = "position:fixed;left:-9999px;top:0";
      document.body.append(field);
      field.select();
      try { copied = document.execCommand("copy"); } catch { /* Keep the citation selectable. */ }
      field.remove();
      copyButton.focus();
    }
    $("span", copyButton).textContent = copied ? "Copied!" : "Select to copy";
    $("#copy-status").textContent = copied ? "BibTeX citation copied to clipboard." : "Select and copy the BibTeX text below.";
    if (!copied) {
      const range = document.createRange();
      range.selectNodeContents($("#bibtex"));
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { $("span", copyButton).textContent = "Copy"; }, 2500);
  });
})();
