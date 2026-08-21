// Cascading carousel for the "Yeni Maceralar" homepage section.
// Exposed as window.SiempreCascading.init() so it can be re-run after the
// items are replaced dynamically (homepage-sections.js).
(function () {
  const isMobile = () => window.matchMedia("(max-width: 770px)").matches;

  function initOne(carousel) {
    // Tear down a previous init on this element (re-init after dynamic render).
    if (typeof carousel._cascadingCleanup === "function") {
      carousel._cascadingCleanup();
    }
    const oldDots = carousel.querySelector(".cascading-carousel__dots");
    if (oldDots) oldDots.remove();

    const items = Array.from(
      carousel.querySelectorAll(".cascading-carousel__item")
    );
    if (!items.length) return;

    const initialIndex = Math.floor(items.length / 2);
    let activeIndex = null;
    let showOverlay = true;
    const clampIndex = (index) =>
      Math.max(0, Math.min(index, items.length - 1));

    const dotsWrap = document.createElement("div");
    dotsWrap.className = "cascading-carousel__dots";
    items.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "cascading-carousel__dot";
      dot.setAttribute("aria-label", `Slide ${idx + 1}`);
      dot.addEventListener("click", () => goTo(idx));
      dotsWrap.appendChild(dot);
    });
    carousel.appendChild(dotsWrap);
    const dots = Array.from(dotsWrap.querySelectorAll(".cascading-carousel__dot"));

    const update = () => {
      const mobile = isMobile();
      const step = 18;
      const base = 50 - ((items.length - 1) / 2) * step;
      const layoutIndex = activeIndex === null ? initialIndex : activeIndex;

      items.forEach((item, index) => {
        const offset = index - layoutIndex;
        const absOffset = Math.abs(offset);
        const scale = Math.max(0.6, 1 - absOffset * 0.1);
        const zIndex = 10 - absOffset;
        const opacity = mobile ? Math.max(0.55, 1 - absOffset * 0.12) : 1;

        if (mobile) {
          const tightStack = window.matchMedia("(max-width: 550px)").matches;
          const stackOffset = tightStack ? 20 : 30;
          const centerShift = tightStack ? 12 : 0;
          item.style.left = "50%";
          item.style.transform = `translateX(-50%) translateX(${centerShift + offset * stackOffset}px) scale(${scale})`;
        } else {
          const left = base + index * step;
          item.style.left = `${left}%`;
          item.style.transform = `translateX(-50%) scale(${scale})`;
        }
        item.style.zIndex = zIndex;
        item.style.opacity = opacity;
        item.classList.toggle(
          "is-active",
          showOverlay && index === activeIndex && activeIndex !== null
        );
        item.classList.toggle("is-side", mobile && absOffset > 0);
        item.setAttribute("aria-hidden", index === activeIndex ? "false" : "true");
        item.tabIndex = index === activeIndex ? 0 : -1;
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === layoutIndex);
      });
    };

    const goTo = (index) => {
      activeIndex = clampIndex(index);
      update();
    };

    const resetToNeutral = () => {
      activeIndex = isMobile() ? initialIndex : null;
      items.forEach((item) => {
        item.classList.remove("is-active");
        item.classList.remove("is-side");
        item.setAttribute("aria-hidden", "false");
        item.tabIndex = -1;
      });
      update();
    };

    items.forEach((item, index) => {
      item.addEventListener("click", () => goTo(index));
      item.addEventListener("mouseenter", () => goTo(index));
    });

    const onLeave = () => { showOverlay = false; update(); };
    carousel.addEventListener("mouseleave", onLeave);

    let rafId = null;
    const handleMove = (event) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const hit = document.elementFromPoint(event.clientX, event.clientY);
        const item = hit ? hit.closest(".cascading-carousel__item") : null;
        if (!item) return;
        const index = items.indexOf(item);
        if (index !== -1) {
          goTo(index);
        }
      });
    };

    const onMove = (event) => {
      if (!showOverlay) {
        showOverlay = true;
      }
      handleMove(event);
    };
    carousel.addEventListener("mousemove", onMove);

    let touchStartX = null;
    const onTouchStart = (event) => { touchStartX = event.touches[0].clientX; };
    carousel.addEventListener("touchstart", onTouchStart, { passive: true });

    const onTouchEnd = (event) => {
      if (touchStartX === null) return;
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 40) {
        const baseIndex = activeIndex === null ? initialIndex : activeIndex;
        goTo(baseIndex + (deltaX < 0 ? 1 : -1));
      }
      touchStartX = null;
    };
    carousel.addEventListener("touchend", onTouchEnd);

    window.addEventListener("resize", update);

    carousel._cascadingCleanup = function () {
      carousel.removeEventListener("mouseleave", onLeave);
      carousel.removeEventListener("mousemove", onMove);
      carousel.removeEventListener("touchstart", onTouchStart);
      carousel.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", update);
    };

    resetToNeutral();
  }

  function initAll() {
    document
      .querySelectorAll("[data-cascading-carousel]")
      .forEach((carousel) => initOne(carousel));
  }

  window.SiempreCascading = { init: initAll };

  document.addEventListener("DOMContentLoaded", initAll);
})();
