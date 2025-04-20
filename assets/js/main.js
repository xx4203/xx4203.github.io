// main.js

// =========================
// 動態載入html/js檔案
// =========================
const basePath = window.location.pathname.includes("/pages") ? "../../" : "";
const rootPath = location.hostname.includes("github.io")
  ? "https://xx4203.com"
  : "";

// =========================
// Component 載入器
// =========================
document.addEventListener("DOMContentLoaded", function () {
  loadComponent("header", `${basePath}components/header.html`, [
    { type: "js", url: `${basePath}assets/js/header.js` }
  ]);

  loadComponent("footer", `${basePath}components/footer.html`, [
    { type: "js", url: `${basePath}assets/js/footer.js` }
  ], () => {
    if (typeof initFormLogic === "function") initFormLogic();
    setExternalLinksNewTab(); // footer載入後重設 a 標籤
  });

  loadComponent("new-year-card-form", `${basePath}components/new-year-card-form.html`, [
    { type: "js", url: `${basePath}assets/js/new-year-card-form.js` }
  ], () => {
    if (typeof initFormLogic === "function") initFormLogic();
    setExternalLinksNewTab(); // 表單載入後重設 a 標籤
  });
});

/**
 * 動態載入 HTML 和 JS
 * @param {string} containerId - 放置 Component 的 <div> ID
 * @param {string} htmlPath - HTML 檔案路徑
 * @param {Array} assets - JS 檔案列表
 */
function loadComponent(containerId, htmlPath, assets) {
    fetch(htmlPath)
      .then(response => response.text())
      .then(data => {
        document.getElementById(containerId).innerHTML = data;
        
        // 載入 JS，並在載入完成後初始化
        loadScripts(assets, () => {
          if (containerId === "new-year-card-form" && typeof initFormLogic === "function") {
            initFormLogic();  // _new-year-card-form.js 裡 export 的函式
          }
          setExternalLinksNewTab();
        });
      })
      .catch(error => console.error(`Error loading ${htmlPath}:`, error));
  }
  
  function loadScripts(files, callback) {
    let loaded = 0;
    const total = files.length;
  
    files.forEach(file => {
      if (file.type === "js") {
        const script = document.createElement("script");
        script.src = file.url;
        script.defer = true;
        script.onload = () => {
          loaded++;
          if (loaded === total && callback) callback();
        };
        document.body.appendChild(script);
      }
    });
}



// =========================
// 除了 .nav-link 以外的連結皆新分頁開啟
// =========================
function setExternalLinksNewTab() {
  const links = document.querySelectorAll("a");
  links.forEach(link => {
    if (!link.classList.contains("nav-link")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
}

// =========================
// Section 進入動畫
// =========================
document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("section");
  sections.forEach((section, index) => {
    section.classList.add("fade-section");
    section.style.transitionDelay = `${index * 0.1}s`;
  });

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(section => observer.observe(section));
});