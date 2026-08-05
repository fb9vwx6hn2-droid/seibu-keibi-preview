const header = document.getElementById("siteHeader");
const menuButton = document.getElementById("menuButton");
const globalNav = document.getElementById("globalNav");
const heroVideo = document.getElementById("heroVideo");
const videoStatus = document.getElementById("videoStatus");
const contactForm = document.getElementById("contactForm");
const formResult = document.getElementById("formResult");
const contactStatus = document.getElementById("contactStatus");
const serviceMenuDialog = document.getElementById("serviceMenuDialog");
const serviceMenuTitle = document.getElementById("serviceMenuTitle");
const serviceMenuImage = document.getElementById("serviceMenuImage");
const serviceMenuImageWrap = document.getElementById("serviceMenuImageWrap");
const serviceMenuClose = document.getElementById("serviceMenuClose");

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  menuButton?.classList.remove("is-open");
  globalNav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "メニューを開く");
};

menuButton?.addEventListener("click", () => {
  const willOpen = !globalNav?.classList.contains("is-open");
  menuButton.classList.toggle("is-open", willOpen);
  globalNav?.classList.toggle("is-open", willOpen);
  document.body.classList.toggle("menu-open", willOpen);
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute("aria-label", willOpen ? "メニューを閉じる" : "メニューを開く");
});

globalNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});
updateHeader();

if (heroVideo) {
  const markVideoReady = () => {
    heroVideo.classList.add("is-ready");
    videoStatus?.classList.add("video-loaded");
    if (videoStatus) {
      videoStatus.lastChild.textContent = " 16:9 VIDEO / PLAYING";
    }
  };

  heroVideo.addEventListener("canplay", markVideoReady, { once: true });
  heroVideo.addEventListener("error", () => {
    heroVideo.classList.remove("is-ready");
  });

  if (heroVideo.readyState >= 3) markVideoReady();
}

const closeServiceMenu = () => {
  if (!serviceMenuDialog) return;
  if (typeof serviceMenuDialog.close === "function") {
    serviceMenuDialog.close();
  } else {
    serviceMenuDialog.removeAttribute("open");
  }
};

document.querySelectorAll(".service-menu-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!serviceMenuDialog || !serviceMenuImage || !serviceMenuTitle) return;

    const title = trigger.dataset.menuTitle ?? "サービス";
    const imagePath = trigger.dataset.menuImage;
    if (!imagePath) return;

    serviceMenuTitle.textContent = title;
    serviceMenuImage.src = imagePath;
    serviceMenuImage.alt = `${title}の料金と作業内容をまとめたメニュー表`;
    serviceMenuImage.classList.remove("is-zoomed");
    if (serviceMenuImageWrap) {
      serviceMenuImageWrap.scrollTop = 0;
      serviceMenuImageWrap.scrollLeft = 0;
    }

    document.body.classList.add("service-menu-open");
    if (typeof serviceMenuDialog.showModal === "function") {
      serviceMenuDialog.showModal();
    } else {
      serviceMenuDialog.setAttribute("open", "");
    }
  });
});

serviceMenuClose?.addEventListener("click", closeServiceMenu);

serviceMenuDialog?.addEventListener("click", (event) => {
  if (event.target === serviceMenuDialog) closeServiceMenu();
});

serviceMenuDialog?.addEventListener("close", () => {
  document.body.classList.remove("service-menu-open");
});

serviceMenuDialog?.addEventListener("cancel", () => {
  document.body.classList.remove("service-menu-open");
});

serviceMenuImage?.addEventListener("click", () => {
  serviceMenuImage.classList.toggle("is-zoomed");
  if (!serviceMenuImage.classList.contains("is-zoomed") && serviceMenuImageWrap) {
    serviceMenuImageWrap.scrollLeft = 0;
  }
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  if (formResult) {
    formResult.textContent =
      "入力内容を確認しました。現在は叩き台のため、実際の送信は行われません。";
  }
});

const contactLinks = window.SEIBU_CONTACTS ?? {};
const contactLabels = {
  line: "LINE公式アカウント",
  instagram: "Instagramアカウント",
  googleForm: "Googleフォーム",
};

document.querySelectorAll("[data-contact-link]").forEach((link) => {
  const type = link.dataset.contactLink;
  const configuredValue = contactLinks[type]?.trim();

  if (configuredValue) {
    link.href = configuredValue;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return;
  }

  link.classList.add("is-pending");
  link.setAttribute("aria-disabled", "true");
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (contactStatus) {
      contactStatus.textContent = `${contactLabels[type]}は、正式な情報をいただいた後に接続します。`;
    }
  });
});

const currentYear = document.getElementById("currentYear");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());
