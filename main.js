const menuButton = document.querySelector(".burger");
const navigation = document.querySelector(".nav");
const smallScreen = matchMedia("(max-width: 900px)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function setMenu(open) {
  navigation.classList.toggle("nav--open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
}
menuButton.addEventListener("click", () =>
  setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
document.addEventListener("click", (event) => {
  if (
    !event.target.closest(".nav, .burger") ||
    event.target.closest(".nav__link")
  )
    setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("nav--open")) {
    setMenu(false);
    menuButton.focus();
  }
});
smallScreen.addEventListener("change", () => setMenu(false));

const galleryChoices = Array.from(
  document.querySelectorAll("[data-gallery-choice]"),
);
const gallerySlides = Array.from(
  document.querySelectorAll("[data-gallery-slide]"),
);
let workIndex = 0;
function showWork(index) {
  workIndex = (index + gallerySlides.length) % gallerySlides.length;
  galleryChoices.forEach((button, i) =>
    button.setAttribute("aria-pressed", String(i === workIndex)),
  );
  gallerySlides.forEach((slide, i) => {
    slide.hidden = i !== workIndex;
  });
}
galleryChoices.forEach((button, index) =>
  button.addEventListener("click", () => showWork(index)),
);
document.querySelectorAll("[data-work-dir]").forEach((button) => {
  button.addEventListener("click", () =>
    showWork(workIndex + Number(button.dataset.workDir)),
  );
});

const productDialog = document.getElementById("product-dialog");
const diagram = productDialog.querySelector(".diagram");
const mechanism = productDialog.querySelector("[data-mechanism]");
let productOpener;
let activeProduct;

function setMechanism(open) {
  diagram.classList.toggle("diagram--open", open);
  mechanism.setAttribute("aria-pressed", String(open));
  mechanism.querySelector("span").textContent = [
    "wood",
    "aluminum",
    "vertical",
  ].includes(activeProduct)
    ? "Повернуть ламели"
    : activeProduct === "zebra"
      ? "Сместить полосы"
      : open
        ? "Опустить"
        : "Поднять";
  mechanism
    .querySelector("use")
    .setAttribute("href", open ? "#i-replay" : "#i-play");
}
document.querySelectorAll("[data-product]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.product;
    const title = productDialog.querySelector("#detail-title");
    productOpener = button;
    title.textContent = button.querySelector(".product__title").textContent;
    productDialog.querySelector(".detail__desc").textContent = button
      .closest(".product")
      .querySelector(".product__description").textContent;
    productDialog.querySelector("[data-motion]").textContent =
      button.dataset.motion;
    productDialog.querySelector("[data-measure]").textContent =
      button.dataset.measure;
    productDialog.querySelector("[data-brief]").dataset.brief = key;
    diagram.className = "diagram diagram--" + key;
    activeProduct = key;
    setMechanism(false);
    productDialog.showModal();
    productDialog.scrollTop = 0;
    title.focus({ preventScroll: true });
  });
});
mechanism.addEventListener("click", () =>
  setMechanism(!diagram.classList.contains("diagram--open")),
);
productDialog
  .querySelector("[data-product-close]")
  .addEventListener("click", () => productDialog.close());
productDialog.addEventListener("close", () => {
  if (!document.querySelector("dialog:modal") && productOpener)
    productOpener.focus({ preventScroll: true });
});
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outside) dialog.close();
  });
});

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const entries = document.querySelectorAll(
    ".product, .about__copy, .process__intro, .reviews__inner",
  );
  const observer = new IntersectionObserver(
    (changes) => {
      for (const change of changes) {
        if (!change.isIntersecting) continue;
        observer.unobserve(change.target);
        if (reducedMotion.matches) continue;
        change.target.animate(
          [
            { opacity: 0.6, translate: "0 12px" },
            { opacity: 1, translate: "0 0" },
          ],
          { duration: 480, easing: "cubic-bezier(.2,.75,.28,1)" },
        );
      }
    },
    { threshold: 0.12 },
  );
  entries.forEach((element) => observer.observe(element));
}

const filterButtons = [...document.querySelectorAll("[data-filter]")];
const cards = [...document.querySelectorAll("[data-category]")];
filterButtons.forEach((filter) =>
  filter.addEventListener("click", () => {
    const type = filter.dataset.filter;
    filterButtons.forEach((button) =>
      button.setAttribute("aria-pressed", String(button === filter)),
    );
    cards.forEach((card) => {
      card.hidden = type !== "all" && card.dataset.category !== type;
    });
  }),
);

const daylight = document.querySelector(".hero__demo");
daylight.addEventListener("click", () => {
  const lowered = daylight.getAttribute("aria-pressed") === "false";
  daylight.setAttribute("aria-pressed", String(lowered));
  daylight.querySelector("span").textContent = lowered
    ? "Поднять штору"
    : "Опустить штору";
  daylight
    .querySelector("use")
    .setAttribute("href", lowered ? "#i-replay" : "#i-play");
  daylight.closest(".hero").classList.toggle("hero--shade", lowered);
});
