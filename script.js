const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const siteHeader = document.querySelector(".site-header");
const pageScrollbar = document.createElement("div");
const pageScrollbarThumb = document.createElement("div");
pageScrollbar.className = "page-scrollbar";
pageScrollbar.setAttribute("role", "scrollbar");
pageScrollbar.setAttribute("aria-label", "Page scroll position");
pageScrollbar.setAttribute("aria-orientation", "vertical");
pageScrollbar.setAttribute("aria-valuemin", "0");
pageScrollbar.setAttribute("aria-valuemax", "100");
pageScrollbar.tabIndex = 0;
pageScrollbarThumb.className = "page-scrollbar-thumb";
pageScrollbar.append(pageScrollbarThumb);
document.body.append(pageScrollbar);

let pageScrollbarFrame = 0;
let pageScrollbarDragOffset = 0;

const updatePageScrollbar = () => {
  const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  const maxScroll = Math.max(0, documentHeight - window.innerHeight);
  const isLocked = document.body.classList.contains("experience-mode-locked");
  if (isLocked || maxScroll < 1) {
    pageScrollbar.style.display = "none";
    return;
  }

  const thumbHeight = Math.max(28, (window.innerHeight * window.innerHeight) / documentHeight);
  const thumbTravel = Math.max(0, window.innerHeight - thumbHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  pageScrollbarThumb.style.height = `${thumbHeight}px`;
  pageScrollbarThumb.style.transform = `translateY(${progress * thumbTravel}px)`;
  pageScrollbar.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
  pageScrollbar.style.display = "block";
};

const schedulePageScrollbarUpdate = () => {
  if (pageScrollbarFrame) return;
  pageScrollbarFrame = requestAnimationFrame(() => {
    pageScrollbarFrame = 0;
    updatePageScrollbar();
  });
};

const scrollFromThumbPosition = (thumbTop) => {
  const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  const maxScroll = Math.max(0, documentHeight - window.innerHeight);
  const thumbHeight = pageScrollbarThumb.getBoundingClientRect().height;
  const thumbTravel = Math.max(1, window.innerHeight - thumbHeight);
  const top = Math.min(thumbTravel, Math.max(0, thumbTop));
  window.scrollTo({ top: (top / thumbTravel) * maxScroll, behavior: "instant" });
};

pageScrollbar.addEventListener("pointerdown", (event) => {
  if (event.target === pageScrollbarThumb) {
    pageScrollbarDragOffset = event.clientY - pageScrollbarThumb.getBoundingClientRect().top;
    pageScrollbarThumb.setPointerCapture(event.pointerId);
  } else {
    scrollFromThumbPosition(event.clientY - pageScrollbarThumb.getBoundingClientRect().height / 2);
  }
  event.preventDefault();
});

pageScrollbarThumb.addEventListener("pointermove", (event) => {
  if (pageScrollbarThumb.hasPointerCapture(event.pointerId)) {
    scrollFromThumbPosition(event.clientY - pageScrollbarDragOffset);
  }
});

pageScrollbarThumb.addEventListener("pointerup", (event) => {
  if (pageScrollbarThumb.hasPointerCapture(event.pointerId)) pageScrollbarThumb.releasePointerCapture(event.pointerId);
});

pageScrollbar.addEventListener("keydown", (event) => {
  const amount = event.key.startsWith("Page") ? window.innerHeight * 0.9 : 48;
  const movesDown = event.key === "ArrowDown" || event.key === "PageDown";
  const movesUp = event.key === "ArrowUp" || event.key === "PageUp";
  if (movesDown || movesUp || event.key === "Home" || event.key === "End") {
    event.preventDefault();
    const top = event.key === "Home" ? 0 : event.key === "End" ? document.documentElement.scrollHeight : window.scrollY + (movesDown ? amount : -amount);
    window.scrollTo({ top, behavior: "smooth" });
  }
});

window.addEventListener("scroll", schedulePageScrollbarUpdate, { passive: true });
window.addEventListener("resize", schedulePageScrollbarUpdate, { passive: true });
if ("ResizeObserver" in window) new ResizeObserver(schedulePageScrollbarUpdate).observe(document.documentElement);
schedulePageScrollbarUpdate();

const servicesMenuButton = document.querySelector(".services-menu-toggle");
const servicesMenu = document.querySelector("#services-mega-menu");
const servicesMenuWrap = document.querySelector(".services-menu-wrap");
let servicesMenuHideTimer = 0;

document.querySelectorAll(".site-header .button--header").forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const bounds = button.getBoundingClientRect();
    button.style.setProperty("--header-hover-x", `${event.clientX - bounds.left}px`);
    button.style.setProperty("--header-hover-y", `${event.clientY - bounds.top}px`);
  });
});

if (typeof Lenis === "function") {
  new Lenis({
    autoRaf: true,
    anchors: true,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
    lerp: 0.13,
    wheelMultiplier: 1.05,
  });
}

document.querySelectorAll(".card").forEach((card) => card.classList.add("card-reveal"));

const showImageFallback = (image) => {
  if (image.closest(".brand, .client-logo-item, .hero-client-set")) return;

  const fallback = document.createElement("div");
  const isManagerImage = Boolean(image.closest(".service-managers"));
  fallback.className = `${[...image.classList]
    .filter((name) => !["image-wipe", "image-loading", "project-image-reveal", "is-visible", "is-revealed"].includes(name))
    .join(" ")} image-fallback${isManagerImage ? " image-fallback--compact" : ""}`.trim();
  fallback.setAttribute("role", "img");
  fallback.setAttribute("aria-label", image.alt || "Samanto image unavailable");

  const frame = image.parentElement;
  frame?.classList.remove("image-loading");
  if (frame?.classList.contains("image-wipe")) frame.classList.remove("image-wipe", "is-revealed");
  image.replaceWith(fallback);
};

document.querySelectorAll("img").forEach((image) => {
  if (image.closest(".brand, .client-logo-item, .hero-client-set")) return;
  const frame = image.parentElement;
  const updateLoadingState = (loading) => {
    image.classList.toggle("image-loading", loading);
    if (frame?.matches(".service-image-frame, .project-image, .person-photo")) {
      frame.classList.toggle("image-loading", loading);
    }
  };
  image.addEventListener("load", () => updateLoadingState(false), { once: true });
  image.addEventListener("error", () => showImageFallback(image), { once: true });
  if (image.complete && image.naturalWidth === 0) showImageFallback(image);
  else if (!image.complete) updateLoadingState(true);
});

const revealCardImages = (card) => {
  window.setTimeout(() => {
    card.querySelectorAll(".image-wipe").forEach((image) => image.classList.add("is-revealed"));
  }, 160);
};

document.querySelectorAll("img.image-wipe").forEach((image) => {
  const revealImage = () => {
    if (image.matches(".about-photo")) return;
    const card = image.closest(".card-reveal");
    if (card) {
      if (card.classList.contains("is-visible")) revealCardImages(card);
    } else {
      window.setTimeout(() => image.classList.add("is-revealed"), 160);
    }
  };

  image.addEventListener("load", revealImage, { once: true });
  image.addEventListener("error", revealImage, { once: true });
  if (image.complete) revealImage();
});

const aboutImage = document.querySelector(".about-photo.image-wipe");
if (aboutImage) {
  const revealAboutImage = () => aboutImage.classList.add("is-revealed");
  const imageIsInView = () => {
    const bounds = aboutImage.getBoundingClientRect();
    return bounds.top < window.innerHeight && bounds.bottom > 0;
  };
  let aboutImageObserver = null;
  if (typeof IntersectionObserver === "function") {
    try {
      aboutImageObserver = new IntersectionObserver((entries, observer) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        if (aboutImage.complete) revealAboutImage();
        else {
          aboutImage.addEventListener("load", revealAboutImage, { once: true });
          aboutImage.addEventListener("error", revealAboutImage, { once: true });
        }
      }, { threshold: 0, rootMargin: "0px 0px 100px 0px" });
    } catch {
      aboutImageObserver = null;
    }
  }

  if (aboutImage.complete && imageIsInView()) revealAboutImage();
  else if (aboutImageObserver) aboutImageObserver.observe(aboutImage);
  else if (aboutImage.complete) revealAboutImage();
  else {
    aboutImage.addEventListener("load", revealAboutImage, { once: true });
    aboutImage.addEventListener("error", revealAboutImage, { once: true });
  }
}

const cardRevealTargets = document.querySelectorAll(".card-reveal");
const cardRevealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const card = entry.target;
          card.dataset.revealStartedAt = String(performance.now());
          card.classList.add("is-visible");
          revealCardImages(card);
          observer.unobserve(card);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    )
  : null;

cardRevealTargets.forEach((card) => {
  if (card.matches(".service-page .service-team-card")) {
    card.dataset.revealStartedAt = String(performance.now());
    card.classList.add("is-visible");
    revealCardImages(card);
    return;
  }
  if (cardRevealObserver) cardRevealObserver.observe(card);
  else {
    card.dataset.revealStartedAt = String(performance.now());
    card.classList.add("is-visible");
    revealCardImages(card);
  }
});

const projectImageTargets = document.querySelectorAll(".project-image img");
const projectImageObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    )
  : null;

projectImageTargets.forEach((image) => {
  image.classList.add("project-image-reveal");
  if (projectImageObserver) projectImageObserver.observe(image);
  else image.classList.add("is-visible");
});

const textRevealTargets = document.querySelectorAll(
  ".hero-copy .eyebrow, .section .eyebrow, .hero-copy h1, .section-title, .contact-form-wrap h2, .hero-copy > p, .service-detail-copy .lead, .clients > p, .about-content, .team-intro > .lead, .values-intro > .lead, .contact-form-wrap > .lead",
);

const textRevealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          if (element.matches(".service-page .service-detail-copy .lead")) {
            const highlights = [...document.querySelectorAll(".service-page .service-detail-stats .stat-card")];
            const highlightRevealTime = performance.now();
            highlights.forEach((card) => {
              if (card.classList.contains("is-visible")) return;
              card.dataset.revealStartedAt = String(highlightRevealTime);
              card.classList.add("is-visible");
              cardRevealObserver?.unobserve(card);
            });
            const copyIndex = [...element.parentElement.querySelectorAll(".lead")].indexOf(element);
            const scheduledStarts = highlights
              .map((card) => Number(card.dataset.revealStartedAt) + (Number.parseFloat(getComputedStyle(card).getPropertyValue("--entry-delay")) || 0));
            const waitForLastHighlight = scheduledStarts.length
              ? Math.max(0, Math.max(...scheduledStarts) - performance.now() + 60)
              : 0;
            element.style.setProperty("--reveal-delay", `${waitForLastHighlight + Math.max(0, copyIndex) * 100}ms`);
          }
          element.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px 12% 0px" },
    )
  : null;
const clientCaptionObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px 12% 0px" },
    )
  : null;
const observeAfterInitialNavigation = (target, observer) => {
  const observe = () => window.setTimeout(() => observer.observe(target), 100);
  if (document.readyState === "complete") observe();
  else window.addEventListener("load", observe, { once: true });
};

textRevealTargets.forEach((element) => {
  const isEyebrow = element.classList.contains("eyebrow");
  const isHeading = element.matches("h1, h2");
  const isClientCaption = element.matches(".clients > p");
  const serviceCopyIndex = element.matches(".service-detail-copy .lead")
    ? [...element.parentElement.querySelectorAll(".lead")].indexOf(element)
    : -1;
  const isHeroText = Boolean(element.closest(".hero-copy"));
  element.classList.add(isEyebrow ? "eyebrow-reveal" : "text-reveal");
  element.style.setProperty("--reveal-delay", serviceCopyIndex >= 0 ? `${220 + serviceCopyIndex * 140}ms` : isEyebrow || isClientCaption ? "0ms" : isHeading ? "120ms" : "220ms");

  if (isClientCaption && clientCaptionObserver) {
    clientCaptionObserver.observe(element);
  } else if (isHeroText && textRevealObserver) {
    observeAfterInitialNavigation(element, textRevealObserver);
  } else if (textRevealObserver) textRevealObserver.observe(element);
  else element.classList.add("is-visible");
});

const buttonRevealTargets = document.querySelectorAll(".button");
const buttonRevealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    )
  : null;

buttonRevealTargets.forEach((button) => {
  button.classList.add("button-reveal");
  if (buttonRevealObserver && button.closest(".hero-copy")) {
    button.style.setProperty("--reveal-delay", "320ms");
    observeAfterInitialNavigation(button, buttonRevealObserver);
  } else if (buttonRevealObserver) buttonRevealObserver.observe(button);
  else button.classList.add("is-visible");
});

const closeServicesMenu = () => {
  if (!servicesMenu || !servicesMenuButton) return;
  window.clearTimeout(servicesMenuHideTimer);
  servicesMenuWrap?.classList.remove("is-open");
  servicesMenuButton.setAttribute("aria-expanded", "false");
  servicesMenuHideTimer = window.setTimeout(() => {
    servicesMenu.hidden = true;
  }, 360);
};

const closeMobileNavigation = () => {
  navigation?.classList.remove("is-open");
  siteHeader?.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("menu-open");
};

const openServicesMenu = () => {
  if (!servicesMenu || !servicesMenuButton) return;
  window.clearTimeout(servicesMenuHideTimer);
  servicesMenu.hidden = false;
  servicesMenuButton.setAttribute("aria-expanded", "true");
  window.requestAnimationFrame(() => {
    if (servicesMenuButton.getAttribute("aria-expanded") === "true") {
      servicesMenuWrap?.classList.add("is-open");
    }
  });
};

servicesMenuWrap?.addEventListener("focusout", (event) => {
  if (!servicesMenuWrap.contains(event.relatedTarget)) closeServicesMenu();
});

servicesMenuButton?.addEventListener("click", () => {
  if (!servicesMenu) return;
  const open = servicesMenuButton.getAttribute("aria-expanded") === "true";
  if (open) closeServicesMenu();
  else openServicesMenu();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".services-menu-wrap")) closeServicesMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeServicesMenu();
    if (menuButton?.getAttribute("aria-expanded") === "true") {
      closeMobileNavigation();
      menuButton.focus();
    } else {
      servicesMenuButton?.focus();
    }
  }
});

const updateHeaderState = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  if (open) {
    closeMobileNavigation();
    closeServicesMenu();
  } else {
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Close menu");
    navigation.classList.add("is-open");
    siteHeader.classList.add("menu-open");
    document.body.classList.add("menu-open");
  }
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeMobileNavigation();
    closeServicesMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 800 && menuButton?.getAttribute("aria-expanded") === "true") {
    closeMobileNavigation();
    closeServicesMenu();
  }
});

const currentYearElement = document.querySelector("#current-year");
if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();

const serviceLinks = [...document.querySelectorAll(".service-nav-link")];
const serviceCards = serviceLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

const setActiveService = (activeCard) => {
  serviceLinks.forEach((link) => {
    const isActive = link.hash === `#${activeCard.id}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};

if (serviceCards.length) {
  const findCardForLink = (link) => serviceCards.find((card) => link.hash === `#${card.id}`);
  document.querySelectorAll('a[href^="#service-"]').forEach((link) => {
    link.addEventListener("click", () => {
      const card = findCardForLink(link);
      if (card) setActiveService(card);
      closeServicesMenu();
    });
  });

  let serviceScrollFrame = 0;
  const updateActiveServiceFromScroll = () => {
    serviceScrollFrame = 0;
    const activationLine = Math.max(siteHeader?.offsetHeight ?? 0, window.innerHeight * 0.3);
    let activeCard = serviceCards[0];
    for (const card of serviceCards) {
      if (card.getBoundingClientRect().top <= activationLine) activeCard = card;
      else break;
    }
    setActiveService(activeCard);
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!serviceScrollFrame) serviceScrollFrame = requestAnimationFrame(updateActiveServiceFromScroll);
    },
    { passive: true },
  );
  updateActiveServiceFromScroll();
}

const contactForm = document.querySelector("#contact-form");
const contactToast = document.querySelector("#contact-toast");
const contactToastMessage = document.querySelector("#contact-toast-message");
const dismissContactToast = contactToast?.querySelector(".contact-toast-dismiss");
let contactToastTimer = 0;
let contactToastHideTimer = 0;

const hideContactToast = () => {
  window.clearTimeout(contactToastTimer);
  if (!contactToast || contactToast.hidden) return;
  contactToast.classList.add("is-hiding");
  window.clearTimeout(contactToastHideTimer);
  contactToastHideTimer = window.setTimeout(() => {
    contactToast.hidden = true;
    contactToast.classList.remove("is-hiding");
  }, 240);
};

const showContactToast = () => {
  if (!contactToast || !contactToastMessage) return;
  window.clearTimeout(contactToastTimer);
  window.clearTimeout(contactToastHideTimer);
  contactToast.hidden = true;
  contactToast.classList.remove("is-hiding");
  window.requestAnimationFrame(() => {
    contactToast.hidden = false;
  });
  contactToastTimer = window.setTimeout(hideContactToast, 5000);
};

dismissContactToast?.addEventListener("click", hideContactToast);

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector(".form-message");
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonContent = submitButton?.innerHTML;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    submitButton.textContent = "Sending...";
  }
  if (status) status.textContent = "Sending your message...";

  try {
    const response = await fetch(form.dataset.endpoint || "./api/contact.php", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "We couldn't send your message. Please try again.");

    if (status) status.textContent = "";
    showContactToast();
    form.reset();
  } catch (error) {
    if (status) status.textContent = error.message || "We couldn't send your message. Please try again.";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      submitButton.innerHTML = originalButtonContent || "Send message";
    }
  }
});

const siteCursor = document.createElement("span");
siteCursor.className = "luxury-cursor";
siteCursor.setAttribute("aria-hidden", "true");
const fluentPointerOverlay = document.createElement("span");
fluentPointerOverlay.className = "fluent-pointer-overlay";
fluentPointerOverlay.setAttribute("aria-hidden", "true");
document.body.append(fluentPointerOverlay, siteCursor);

const hideSiteCursor = () => {
  siteCursor.classList.remove("is-visible");
  siteCursor.classList.remove("is-on-interactive");
  fluentPointerOverlay.classList.remove("is-visible");
  fluentPointerOverlay.classList.remove("is-site-link-target");
  document.body.classList.remove("has-luxury-cursor");
};

document.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse" && event.pointerType !== "pen") {
    hideSiteCursor();
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  const interactiveTarget = target?.closest("a, button, [role='button']");
  const editableTarget = target?.closest("input:not([type='button']):not([type='submit']), textarea, [contenteditable='true']");
  document.body.classList.add("has-luxury-cursor");
  if (interactiveTarget && !editableTarget) {
    const bounds = interactiveTarget.getBoundingClientRect();
    siteCursor.style.setProperty("--cursor-x", `${bounds.left + bounds.width / 2}px`);
    siteCursor.style.setProperty("--cursor-y", `${bounds.top + bounds.height / 2}px`);
    const targetStyles = window.getComputedStyle(interactiveTarget);
    fluentPointerOverlay.style.left = `${bounds.left}px`;
    fluentPointerOverlay.style.top = `${bounds.top}px`;
    fluentPointerOverlay.style.width = `${bounds.width}px`;
    fluentPointerOverlay.style.height = `${bounds.height}px`;
    fluentPointerOverlay.style.borderRadius = targetStyles.borderRadius;
    fluentPointerOverlay.style.setProperty("--target-x", `${event.clientX - bounds.left}px`);
    fluentPointerOverlay.style.setProperty("--target-y", `${event.clientY - bounds.top}px`);
    fluentPointerOverlay.classList.toggle("is-site-link-target", Boolean(interactiveTarget.closest(".site-footer, .site-header")));
    fluentPointerOverlay.classList.add("is-visible");
    siteCursor.classList.remove("is-visible");
    siteCursor.classList.add("is-on-interactive");
  } else {
    siteCursor.style.setProperty("--cursor-x", `${event.clientX}px`);
    siteCursor.style.setProperty("--cursor-y", `${event.clientY}px`);
    fluentPointerOverlay.classList.remove("is-visible");
    fluentPointerOverlay.classList.remove("is-site-link-target");
    siteCursor.classList.remove("is-on-interactive");
    siteCursor.classList.toggle("is-visible", !editableTarget);
  }
});
document.addEventListener("pointerout", (event) => {
  if (!event.relatedTarget) hideSiteCursor();
});
window.addEventListener("blur", hideSiteCursor);

document.querySelectorAll(".service-page .fluent-hover").forEach((surface) => {
  surface.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const bounds = surface.getBoundingClientRect();
    surface.style.setProperty("--hover-x", `${event.clientX - bounds.left}px`);
    surface.style.setProperty("--hover-y", `${event.clientY - bounds.top}px`);
  });
});

document.querySelectorAll(".service-team-photo").forEach((imageFrame) => {
  imageFrame.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const bounds = imageFrame.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width;
    const pointerY = (event.clientY - bounds.top) / bounds.height;
    imageFrame.style.setProperty("--image-hover-x", `${pointerX * 100}%`);
    imageFrame.style.setProperty("--image-hover-y", `${pointerY * 100}%`);
    imageFrame.style.setProperty("--image-tilt-x", `${(pointerX - 0.5) * 10}deg`);
    imageFrame.style.setProperty("--image-tilt-y", `${(0.5 - pointerY) * 10}deg`);
  });
  imageFrame.addEventListener("pointerleave", () => {
    imageFrame.style.setProperty("--image-tilt-x", "0deg");
    imageFrame.style.setProperty("--image-tilt-y", "0deg");
  });
});

document.querySelectorAll(".service-page main.service-main").forEach((content) => {
  content.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" || event.pointerType === "pen") {
      content.classList.add("is-pointer-active");
    }
  });
  content.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const bounds = content.getBoundingClientRect();
    content.style.setProperty("--section-cursor-x", `${event.clientX - bounds.left}px`);
    content.style.setProperty("--section-cursor-y", `${event.clientY - bounds.top}px`);
  });
  content.addEventListener("pointerleave", () => content.classList.remove("is-pointer-active"));
});

const experienceApp = document.querySelector("#experience-app");
if (experienceApp) {
  const experiencePanels = [...experienceApp.querySelectorAll("[data-panel]")];
  experienceApp.querySelectorAll(".fluent-hover").forEach((surface) => {
    surface.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const bounds = surface.getBoundingClientRect();
      surface.style.setProperty("--hover-x", `${event.clientX - bounds.left}px`);
      surface.style.setProperty("--hover-y", `${event.clientY - bounds.top}px`);
    });
  });
  experienceApp.querySelectorAll(".content-panel .experience-panel-content").forEach((content) => {
    content.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" || event.pointerType === "pen") {
        content.classList.add("is-pointer-active");
      }
    });
    content.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const bounds = content.getBoundingClientRect();
      content.style.setProperty("--section-cursor-x", `${event.clientX - bounds.left}px`);
      content.style.setProperty("--section-cursor-y", `${event.clientY - bounds.top}px`);
    });
    content.addEventListener("pointerleave", () => content.classList.remove("is-pointer-active"));
  });
  experienceApp.querySelectorAll(".about-image-interactive, .team-image-interactive").forEach((imageFrame) => {
    imageFrame.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const bounds = imageFrame.getBoundingClientRect();
      const pointerX = (event.clientX - bounds.left) / bounds.width;
      const pointerY = (event.clientY - bounds.top) / bounds.height;
      imageFrame.style.setProperty("--image-hover-x", `${pointerX * 100}%`);
      imageFrame.style.setProperty("--image-hover-y", `${pointerY * 100}%`);
      imageFrame.style.setProperty("--image-tilt-x", `${(pointerX - 0.5) * 10}deg`);
      imageFrame.style.setProperty("--image-tilt-y", `${(0.5 - pointerY) * 10}deg`);
    });
    imageFrame.addEventListener("pointerleave", () => {
      imageFrame.style.setProperty("--image-tilt-x", "0deg");
      imageFrame.style.setProperty("--image-tilt-y", "0deg");
    });
  });
  const heroSlides = [...experienceApp.querySelectorAll(".hero-slide")];
  const slideButtons = [...experienceApp.querySelectorAll("[data-slide-to]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollTitleRevealed = new Set();
  let activeSlide = 0;
  let heroSlideTimer = 0;
  let wheelGestureHandled = false;
  let wheelGestureTimer = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchGestureHandled = false;

  const panelOrder = experiencePanels.map((panel) => panel.dataset.panel);
  const stepPanel = (direction) => {
    const activeIndex = panelOrder.indexOf(experienceApp.dataset.active);
    const nextIndex = Math.max(0, Math.min(panelOrder.length - 1, activeIndex + direction));
    if (nextIndex === activeIndex) return;
    const outgoingPanel = experiencePanels[activeIndex];
    if (!openExperiencePanel(panelOrder[nextIndex])) return;
    const panelName = outgoingPanel?.dataset.panel;
    if (panelName && panelName !== "home" && !scrollTitleRevealed.has(panelName)) {
      outgoingPanel.classList.add("is-scroll-title-reveal");
      scrollTitleRevealed.add(panelName);
    }
  };

  const resetWheelGestureAfterPause = () => {
    window.clearTimeout(wheelGestureTimer);
    wheelGestureTimer = window.setTimeout(() => {
      wheelGestureHandled = false;
    }, 160);
  };

  const resetHeroSlideTimer = () => {
    window.clearTimeout(heroSlideTimer);
    heroSlideTimer = 0;
    if (
      reducedMotion.matches ||
      !experienceApp.classList.contains("is-hero-ready") ||
      experienceApp.dataset.active !== "home"
    ) return;
    heroSlideTimer = window.setTimeout(() => showSlide(activeSlide + 1), 5000);
  };

  const showSlide = (index) => {
    if (!heroSlides.length) return;
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeSlide;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    slideButtons.forEach((button, buttonIndex) => {
      if (buttonIndex === activeSlide) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    resetHeroSlideTimer();
  };

  const openExperiencePanel = (name) => {
    const activePanel = experiencePanels.find((panel) => panel.dataset.panel === name);
    if (!activePanel) return;
    const previousPanel = experienceApp.dataset.active;
    experienceApp.dataset.active = name;
    if (name === "home" && previousPanel !== "home") showSlide(0);
    resetHeroSlideTimer();
    experiencePanels.forEach((panel) => {
      const active = panel === activePanel;
      panel.dataset.active = String(active);
      const toggle = panel.querySelector(".experience-panel-toggle");
      const content = panel.querySelector(".experience-panel-content, .hero-content");
      toggle?.setAttribute("aria-expanded", String(active));
      content?.setAttribute("aria-hidden", String(!active));
      if (content && "inert" in content) content.inert = !active;
    });
    if (["about", "services", "team"].includes(name)) {
      activePanel.classList.remove("is-entering");
      void activePanel.offsetWidth;
      activePanel.classList.add("is-entering");
    }
    document.body.classList.toggle("experience-mode-locked", name !== "team");
    schedulePageScrollbarUpdate();
    if (name !== "team") window.scrollTo({ top: 0, behavior: "auto" });
    if (location.hash !== `#${name}`) history.replaceState(null, "", `#${name}`);
    return true;
  };

  window.addEventListener("wheel", (event) => {
    const activeName = experienceApp.dataset.active;
    if (activeName === "team") {
      if (event.deltaY < 0 && window.scrollY <= 1) {
        event.preventDefault();
        if (!wheelGestureHandled) {
          wheelGestureHandled = true;
          stepPanel(-1);
        }
        resetWheelGestureAfterPause();
        return;
      }
      return;
    }
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX) || event.deltaY === 0) return;
    event.preventDefault();
    if (!wheelGestureHandled) {
      wheelGestureHandled = true;
      stepPanel(event.deltaY > 0 ? 1 : -1);
    }
    resetWheelGestureAfterPause();
  }, { passive: false });

  window.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchGestureHandled = false;
  }, { passive: true });

  window.addEventListener("touchmove", (event) => {
    if (touchGestureHandled) {
      event.preventDefault();
      return;
    }
    const touch = event.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    if (Math.abs(deltaY) < 56 || Math.abs(deltaY) < Math.abs(deltaX)) return;

    const activeName = experienceApp.dataset.active;
    if (activeName === "team") {
      if (deltaY > 0 && window.scrollY <= 1) {
        event.preventDefault();
        touchGestureHandled = true;
        stepPanel(-1);
      }
      return;
    }

    event.preventDefault();
    touchGestureHandled = true;
    stepPanel(deltaY < 0 ? 1 : -1);
  }, { passive: false });

  window.addEventListener("touchend", () => {
    touchGestureHandled = false;
  }, { passive: true });
  window.addEventListener("touchcancel", () => {
    touchGestureHandled = false;
  }, { passive: true });

  experienceApp.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-open-panel]");
    if (!toggle) return;
    event.preventDefault();
    if (!openExperiencePanel(toggle.dataset.openPanel)) return;
    if (toggle.hasAttribute("data-next-slide")) showSlide(activeSlide + 1);
  });

  experienceApp.querySelectorAll("[data-slide-to]").forEach((button) => {
    button.addEventListener("click", () => showSlide(Number(button.dataset.slideTo)));
  });

  document.querySelectorAll(".experience-nav-link[data-open-panel], .footer-company [data-open-panel], .site-header .brand[data-open-panel], .footer-brand .brand[data-open-panel]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      closeMobileNavigation();
      if (!openExperiencePanel(link.dataset.openPanel)) return;
      if (link.hasAttribute("data-next-slide")) showSlide(activeSlide + 1);
    });
  });

  const initialPanel = ["home", "services", "about", "team"].includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : "home";
  experienceApp.classList.add("is-page-intro");
  window.setTimeout(() => experienceApp.classList.remove("is-page-intro"), 1000);
  showSlide(activeSlide);
  openExperiencePanel(initialPanel);
  const waitForHeroImage = async (image) => {
    if (!image.complete) {
      await new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }
    if (image.naturalWidth > 0 && typeof image.decode === "function") {
      await image.decode().catch(() => {});
    }
  };
  const firstHeroImage = heroSlides[0]?.querySelector("img");
  if (firstHeroImage) {
    waitForHeroImage(firstHeroImage).then(() => {
      experienceApp.classList.add("is-hero-ready");
      resetHeroSlideTimer();
    });
  } else {
    experienceApp.classList.add("is-hero-ready");
  }
}
