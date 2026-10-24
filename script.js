const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-nav");
const siteHeader = document.querySelector(".site-header");
const servicesMenuButton = document.querySelector(".services-menu-toggle");
const servicesMenu = document.querySelector("#services-mega-menu");

const closeServicesMenu = () => {
  if (!servicesMenu || !servicesMenuButton) return;
  servicesMenu.hidden = true;
  servicesMenuButton.setAttribute("aria-expanded", "false");
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
    servicesMenuButton?.focus();
  }
});

const updateHeaderState = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  menuButton.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  navigation.classList.toggle("is-open", !open);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
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
