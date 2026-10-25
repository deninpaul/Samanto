const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const siteHeader = document.querySelector(".site-header");
const servicesMenuButton = document.querySelector(".services-menu-toggle");
const servicesMenu = document.querySelector("#services-mega-menu");
const servicesMenuWrap = document.querySelector(".services-menu-wrap");
const canHoverServicesMenu = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 50.001rem)");
const navHoverIndicator = document.createElement("span");
navHoverIndicator.className = "nav-hover-indicator";
navHoverIndicator.setAttribute("aria-hidden", "true");
navigation?.prepend(navHoverIndicator);
let activeNavHoverTarget = null;
let servicesMenuHideTimer = 0;

const getNavHoverTarget = (target) => {
  if (!(target instanceof Element)) return null;
  const item = target.closest(".services-menu-toggle, a");
  if (!item || !navigation?.contains(item)) return null;
  if (item.matches("a") && (item.parentElement !== navigation || item.closest(".services-menu-link"))) return null;
  return item;
};

const positionNavHoverIndicator = (item) => {
  if (!canHoverServicesMenu.matches || navigation?.classList.contains("is-open") || !item) {
    navHoverIndicator.classList.remove("is-visible");
    return;
  }
  const navRect = navigation.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const indicatorStyle = window.getComputedStyle(navHoverIndicator);
  const horizontalPadding = Number.parseFloat(indicatorStyle.paddingLeft) || 0;
  const verticalPadding = Number.parseFloat(indicatorStyle.paddingTop) || 0;
  navHoverIndicator.style.width = `${itemRect.width + horizontalPadding * 2}px`;
  navHoverIndicator.style.height = `${itemRect.height + verticalPadding * 2}px`;
  navHoverIndicator.style.transform = `translate3d(${itemRect.left - navRect.left - horizontalPadding}px, ${itemRect.top - navRect.top - verticalPadding}px, 0)`;
  navHoverIndicator.classList.add("is-visible");
};

navigation?.addEventListener("pointerover", (event) => {
  if (event.pointerType !== "mouse") return;
  const item = getNavHoverTarget(event.target);
  if (!item) return;
  activeNavHoverTarget = item;
  positionNavHoverIndicator(item);
});
navigation?.addEventListener("pointerleave", () => {
  activeNavHoverTarget = null;
  navHoverIndicator.classList.remove("is-visible");
});
navigation?.addEventListener("focusin", (event) => {
  const item = getNavHoverTarget(event.target);
  if (item) positionNavHoverIndicator(item);
});
navigation?.addEventListener("focusout", (event) => {
  if (!navigation.contains(event.relatedTarget)) navHoverIndicator.classList.remove("is-visible");
});
window.addEventListener("resize", () => positionNavHoverIndicator(activeNavHoverTarget));

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
  if (image.closest(".brand, .client-logo-item")) return;

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
  if (image.closest(".brand, .client-logo-item")) return;
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
          card.classList.add("is-visible");
          revealCardImages(card);
          observer.unobserve(card);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    )
  : null;

cardRevealTargets.forEach((card) => {
  if (cardRevealObserver) cardRevealObserver.observe(card);
  else {
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
  ".hero-copy .eyebrow, .section .eyebrow, .hero-copy h1, .section-title, .contact-form-wrap h2, .hero-copy > p, .clients > p, .about-content, .team-intro > .lead, .values-intro > .lead, .contact-form-wrap > .lead",
);

const textRevealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
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
  const isHeroText = Boolean(element.closest(".hero-copy"));
  element.classList.add(isEyebrow ? "eyebrow-reveal" : "text-reveal");
  element.style.setProperty("--reveal-delay", isEyebrow || isClientCaption ? "0ms" : isHeading ? "120ms" : "220ms");

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

document.querySelector("#current-year").textContent = new Date().getFullYear();

const clientTrack = document.querySelector(".client-track");
if (clientTrack) {
  const showClientFallback = (image) => {
    if (image.naturalWidth > 1) return;
    image.hidden = true;
    const item = image.closest(".client-logo-item");
    const label = item?.querySelector(".client-logo-label");
    if (label) label.hidden = false;
  };

  clientTrack.querySelectorAll(".client-logo-item").forEach((item) => {
    item.setAttribute("role", "img");
    item.setAttribute("aria-label", `${item.dataset.client} client logo`);
    const image = item.querySelector("img");
    image?.addEventListener("load", () => showClientFallback(image));
    if (image?.complete) showClientFallback(image);
  });

  const duplicatedItems = [...clientTrack.children].map((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    const image = clone.querySelector("img");
    image?.addEventListener("load", () => showClientFallback(image));
    if (image?.complete) showClientFallback(image);
    return clone;
  });
  clientTrack.append(...duplicatedItems);
  clientTrack.classList.add("is-ready");
}

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
