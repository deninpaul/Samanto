const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const siteHeader = document.querySelector(".site-header");
const servicesMenuButton = document.querySelector(".services-menu-toggle");
const servicesMenu = document.querySelector("#services-mega-menu");

document.querySelectorAll(".card").forEach((card) => card.classList.add("card-reveal"));

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
  servicesMenu.hidden = true;
  servicesMenuButton.setAttribute("aria-expanded", "false");
};

const closeMobileNavigation = () => {
  navigation?.classList.remove("is-open");
  siteHeader?.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("menu-open");
};

servicesMenuButton?.addEventListener("click", () => {
  if (!servicesMenu) return;
  const open = servicesMenuButton.getAttribute("aria-expanded") === "true";
  servicesMenu.hidden = open;
  servicesMenuButton.setAttribute("aria-expanded", String(!open));
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

let smoothScrollFrame = 0;
const stopSmoothScroll = () => {
  if (!smoothScrollFrame) return;
  window.cancelAnimationFrame(smoothScrollFrame);
  smoothScrollFrame = 0;
  document.documentElement.classList.remove("custom-scroll-active");
};

["wheel", "touchstart", "pointerdown"].forEach((type) => {
  window.addEventListener(type, stopSmoothScroll, { passive: true });
});
window.addEventListener("keydown", (event) => {
  if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
    stopSmoothScroll();
  }
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.target || event.defaultPrevented) return;
  const id = decodeURIComponent(link.hash.slice(1));
  const target = id ? document.getElementById(id) : document.documentElement;
  if (!target) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  event.preventDefault();
  stopSmoothScroll();

  const scrollPadding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const startY = window.scrollY;
  const endY = Math.max(0, startY + target.getBoundingClientRect().top - scrollPadding);
  const distance = endY - startY;
  if (Math.abs(distance) < 2) return;

  if (window.location.hash !== link.hash) history.pushState(null, "", link.hash);
  const duration = Math.min(1100, Math.max(450, 450 + Math.abs(distance) * 0.12));
  const startTime = performance.now();
  document.documentElement.classList.add("custom-scroll-active");

  const animateScroll = (now) => {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) smoothScrollFrame = window.requestAnimationFrame(animateScroll);
    else {
      smoothScrollFrame = 0;
      document.documentElement.classList.remove("custom-scroll-active");
    }
  };

  smoothScrollFrame = window.requestAnimationFrame(animateScroll);
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

document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector(".form-message").textContent = "Thanks for reaching out. We will be in touch soon.";
  event.currentTarget.reset();
});
