(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const config = window.PGMT_CONFIG || {};

  // A single, public configuration file controls every reserved resource slot.
  for (const link of $$("[data-resource]")) {
    const value = config[link.dataset.resource];
    if (typeof value !== "string" || !value.trim()) continue;
    let url;
    try { url = new URL(value, document.baseURI); } catch { continue; }
    if (!["https:", "http:", "file:"].includes(url.protocol)) continue;
    link.href = value;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.removeAttribute("aria-disabled");
    link.removeAttribute("role");
    link.classList.remove("unavailable");
    link.title = `Open ${link.dataset.resource === "bilibili" ? "Bilibili" : link.dataset.resource}`;
    $(".soon", link)?.remove();
    const status = $(".resource-status", link);
    if (status) status.innerHTML = `${link.dataset.resource === "paper" ? "Read PDF" : "Open resource"} <svg class="icon" aria-hidden="true"><use href="#i-external"/></svg>`;
  }

  const menu = $(".menu-toggle");
  const navigation = $("#navigation");
  function closeMenu() {
    navigation.classList.remove("is-open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
  }
  menu.addEventListener("click", () => {
    const open = navigation.classList.toggle("is-open");
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  navigation.addEventListener("click", event => { if (event.target.closest("a")) closeMenu(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menu.focus();
    }
  });

  const progress = $(".reading-progress");
  let scrollQueued = false;
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
    scrollQueued = false;
  }
  window.addEventListener("scroll", () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        $$("nav a[href^='#']").forEach(link => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      }
    }, { rootMargin: "-15% 0px -60% 0px" });
    $$("main section[id]").forEach(section => sectionObserver.observe(section));
  }

  const hero = $("#hero-video");
  const heroToggle = $("#hero-toggle");
  let heroVisible = false;
  let heroManuallyPaused = false;
  let heroUserStarted = false;
  function hydrateVideo(video) {
    const source = $("source[data-src]", video);
    if (source) { source.src = source.dataset.src; source.removeAttribute("data-src"); video.load(); }
  }
  async function playVideo(video) {
    hydrateVideo(video);
    try { await video.play(); return true; } catch { return false; }
  }
  function syncHeroButton() {
    const playing = !hero.paused;
    heroToggle.setAttribute("aria-label", playing ? "Pause background video" : "Play background video");
    $("use", heroToggle).setAttribute("href", playing ? "#i-pause" : "#i-play");
  }
  function mayPlayHero() {
    return heroVisible && !heroManuallyPaused && !document.hidden && !$("dialog[open]") &&
      (heroUserStarted || (!reduceMotion.matches && !navigator.connection?.saveData));
  }
  function updateHero() {
    if (mayPlayHero()) void playVideo(hero);
    else hero.pause();
  }
  hero.addEventListener("play", syncHeroButton);
  hero.addEventListener("pause", syncHeroButton);
  heroToggle.addEventListener("click", () => {
    if (hero.paused) {
      heroManuallyPaused = false;
      heroUserStarted = true;
      void playVideo(hero);
    } else { heroManuallyPaused = true; hero.pause(); }
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      updateHero();
    }, { threshold: 0.15 }).observe(hero);
  } else { heroVisible = true; updateHero(); }
  reduceMotion.addEventListener("change", updateHero);

  const demonstrations = {
    locomotion: [
      { id: "stairs", label: "Running up stairs", duration: "0:10", title: "Taking stairs\nin stride.", text: "The policy adapts foot placement and swing clearance to traverse stairs using terrain-agnostic locomotion references.", fact: "Terrain-aware footholds" },
      { id: "bridge", label: "Across the bridge", duration: "0:32", title: "New geometry.\nSame controller.", text: "Ascending and descending a real-world staircase with the same perceptive locomotion policy, guided by a local elevation map.", fact: "Unseen stair geometry" },
      { id: "box", label: "Stepping onto a box", duration: "0:08", title: "A higher\nstep forward.", text: "PGMT adjusts its footholds and whole-body posture to climb an obstacle. The real-world evaluation includes boxes up to 37 cm high.", fact: "Adaptive swing clearance" },
      { id: "grass", label: "Running on grass", duration: "0:13", title: "Out of the lab.\nOnto the grass.", text: "The same policy maintains locomotion on natural outdoor terrain, coping with vegetation and imperfect terrain observations.", fact: "Outdoor locomotion" },
    ],
    tracking: [
      { id: "cartwheel", label: "Dynamic cartwheel", duration: "0:08", title: "Keep the\nwhole-body skill.", text: "Injecting terrain perception preserves the general motion prior, including highly dynamic whole-body behaviors such as cartwheels.", fact: "Dynamic motion tracking" },
      { id: "dance", label: "Motion on uneven ground", duration: "0:17", title: "The same motion.\nA different surface.", text: "Whole-body references are executed on uneven ground while contacts and posture adapt to local terrain constraints.", fact: "Terrain-adaptive tracking" },
    ],
    teleoperation: [
      { id: "teleop-stairs", label: "Teleoperation on stairs", duration: "0:17", title: "You guide.\nThe robot adapts.", text: "The operator commands upper-body motion during stair traversal. The policy handles terrain-dependent lower-body adaptation.", fact: "Locomotion + teleoperation" },
      { id: "teleop-punch", label: "Whole-body teleoperation", duration: "0:08", title: "From human intent\nto robot motion.", text: "Whole-body motion captured through PICO is retargeted online with GMR and tracked by the same PGMT policy.", fact: "PICO + online retargeting" },
      { id: "teleop-recovery", label: "Lie down & get up", duration: "0:10", title: "Through every\nchange of posture.", text: "Operator-commanded lying down and standing up demonstrate whole-body teleoperation across upright and ground-level postures.", fact: "Whole-body teleoperation" },
    ],
    recovery: [
      { id: "recovery", label: "Disturbance & recovery", duration: "0:50", title: "Recover.\nThen carry on.", text: "After strong external disturbances, PGMT handles balance recovery and getting back up through the same policy, without a dedicated recovery controller.", fact: "Unified recovery behavior" },
    ],
  };
  let activeCategory = "locomotion";
  let activeIndex = 0;
  const demoVideo = $("#demo-video");
  const demoPlay = $("#demo-play");
  const thumbnails = $("#demo-thumbnails");
  const tabs = $$("[data-category]");
  function syncDemoButton() {
    const playing = !demoVideo.paused;
    demoPlay.innerHTML = `${playing ? "Pause demonstration" : "Play demonstration"} <svg class="icon" aria-hidden="true"><use href="${playing ? "#i-pause" : "#i-play"}"/></svg>`;
  }
  demoVideo.addEventListener("play", syncDemoButton);
  demoVideo.addEventListener("pause", syncDemoButton);
  demoVideo.addEventListener("error", () => {
    $("#demo-status").textContent = "This video could not be loaded. Select another demonstration or try playing it again.";
    demoPlay.textContent = "Retry demonstration";
  });
  demoPlay.addEventListener("click", () => {
    if (demoVideo.paused) void playVideo(demoVideo);
    else demoVideo.pause();
  });
  // Native player interaction hydrates the source even before the section observer runs.
  demoVideo.addEventListener("pointerdown", () => hydrateVideo(demoVideo), { passive: true });
  function selectClip(index, autoplay = false, announce = true) {
    activeIndex = index;
    const clip = demonstrations[activeCategory][index];
    demoVideo.pause();
    demoVideo.poster = `assets/images/${clip.id}.jpg`;
    demoVideo.setAttribute("aria-label", clip.label);
    demoVideo.removeAttribute("src");
    const source = $("source", demoVideo);
    source.src = `assets/media/${clip.id}.mp4`;
    source.removeAttribute("data-src");
    demoVideo.load();
    $("#demo-title").textContent = clip.title;
    $("#demo-copy").textContent = clip.text;
    $(".demo-ordinal").textContent = `${String(index + 1).padStart(2, "0")} / ${String(demonstrations[activeCategory].length).padStart(2, "0")}`;
    $("#demo-facts").replaceChildren(...[clip.fact, "Original playback speed"].map(text => {
      const span = document.createElement("span"); span.textContent = text; return span;
    }));
    $$(".demo-thumb", thumbnails).forEach((button, i) => button.setAttribute("aria-pressed", String(index === i)));
    if (announce) $("#demo-status").textContent = `${clip.label}. ${clip.text}`;
    if (autoplay) {
      const bounds = demoVideo.getBoundingClientRect();
      if (bounds.top < 80 || bounds.bottom > innerHeight) demoVideo.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      void playVideo(demoVideo);
    }
  }
  function renderThumbnails() {
    thumbnails.replaceChildren();
    thumbnails.dataset.count = String(demonstrations[activeCategory].length);
    demonstrations[activeCategory].forEach((clip, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "demo-thumb";
      button.setAttribute("aria-label", `Watch ${clip.label.toLowerCase()}`);
      button.setAttribute("aria-pressed", String(index === activeIndex));
      button.innerHTML = `<span class="thumb-image"><img src="assets/images/${clip.id}.jpg" width="480" height="270" loading="lazy" alt=""><span class="thumb-play"><svg class="icon" aria-hidden="true"><use href="#i-play"/></svg></span></span><span class="thumb-caption"><span>${clip.label}</span><small>${clip.duration}</small></span>`;
      button.addEventListener("click", () => selectClip(index, true));
      thumbnails.append(button);
    });
  }
  function selectCategory(category, focus = false) {
    activeCategory = category;
    activeIndex = 0;
    for (const tab of tabs) {
      const selected = tab.dataset.category === category;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    }
    $("#demo-panel").setAttribute("aria-labelledby", `tab-${category}`);
    renderThumbnails();
    selectClip(0, false);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectCategory(tab.dataset.category));
    tab.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectCategory(tabs[next].dataset.category, true); }
    });
  });
  renderThumbnails();
  if ("IntersectionObserver" in window) {
    const demoObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        hydrateVideo(demoVideo);
        demoObserver.disconnect();
      }
    }, { rootMargin: "200px" });
    demoObserver.observe(demoVideo);
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) demoVideo.pause();
    }, { threshold: 0 }).observe(demoVideo);
  }

  const benchmarkData = {
    ours: { label: "PGMT", overall: 87.81, l9: 83.33 },
    cnn: { label: "PGMT-CNN", overall: 87.38, l9: 80.52 },
    noheight: { label: "PGMT-NoHeight", overall: 86.53, l9: 78.85 },
    rgmt: { label: "RGMT reimplementation", overall: 46.68, l9: 40.52 },
    pretrain: { label: "PGMT pretraining", overall: 40.02, l9: 35.31 },
    sonic: { label: "SONIC v1.1 external", overall: 25.09, l9: 20.73 },
  };
  $$("[data-metric]").forEach(button => button.addEventListener("click", () => {
    const metric = button.dataset.metric;
    $$("[data-metric]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    const descriptions = [];
    $$("[data-model]").forEach(row => {
      const data = benchmarkData[row.dataset.model];
      const value = data[metric].toFixed(2);
      $(".chart-bar", row).style.setProperty("--value", `${value}%`);
      $(".chart-value", row).textContent = `${value}%`;
      descriptions.push(`${data.label} ${value} percent`);
    });
    const label = `${metric === "overall" ? "Overall" : "Level 9"} completion: ${descriptions.join(", ")}.`;
    $("#benchmark-chart").setAttribute("aria-label", label);
    $("#metric-status").textContent = label;
  }));

  const videoDialog = $("#video-dialog");
  const overviewVideo = $("#overview-video");
  const figureDialog = $("#figure-dialog");
  function openDialog(dialog) {
    closeMenu();
    hero.pause();
    demoVideo.pause();
    dialog.showModal();
    document.body.classList.add("dialog-open");
  }
  $$("[data-open-video]").forEach(button => button.addEventListener("click", () => {
    openDialog(videoDialog);
    void playVideo(overviewVideo);
  }));
  $("#zoom-method").addEventListener("click", () => openDialog(figureDialog));
  $$("dialog").forEach(dialog => {
    $("[data-close-dialog]", dialog).addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener("close", () => {
      if (!$("dialog[open]")) document.body.classList.remove("dialog-open");
      overviewVideo.pause();
      updateHero();
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { hero.pause(); demoVideo.pause(); overviewVideo.pause(); }
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
      try { copied = document.execCommand("copy"); } catch { /* Manual selection remains available. */ }
      field.remove();
      copyButton.focus();
    }
    $("span", copyButton).textContent = copied ? "Copied!" : "Select to copy";
    $("#copy-status").textContent = copied ? "BibTeX citation copied to clipboard." : "Automatic copying is unavailable. Select and copy the BibTeX text below.";
    if (!copied) {
      const range = document.createRange();
      range.selectNodeContents($("#bibtex"));
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { $("span", copyButton).textContent = "Copy BibTeX"; }, 2500);
  });
})();
