// =========================
// 建立 mini-header
// =========================
const originHeader = document.getElementById("header");
// 建立 #mini-header
const miniHeader = document.createElement("header");
miniHeader.id = "mini-header";
miniHeader.innerHTML = header.innerHTML;
// 插入到 #header 後方
header.insertAdjacentElement("afterend", miniHeader);


// =========================
//menu-icon 動態
// =========================
document.body.addEventListener("click", function (e) {
  const icon = e.target.closest(".menu-icon");
  if (icon) {
    icon.classList.toggle("active");
  }
});


// =========================
// mini-header 滾動變化
// =========================
let lastScroll = 0;
const miniHeaderScroll = document.getElementById("mini-header");
const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
const viewHeight = window.innerHeight * 1; // 取得視口高度

// rem 轉換成 px 函式
function remToPx(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  // 判斷是否符合 max-height: 400px and max-width: 1920px
  const isSmallScreen = window.innerHeight <= 400 && window.innerWidth <= 1920;
  const triggerScroll = isSmallScreen ? remToPx(6) : remToPx(20);

  if (currentScroll > triggerScroll && currentScroll > lastScroll) {
    // 滾動超過門檻 + 向下滑時觸發
    miniHeaderScroll.classList.add("hide");
    miniHeaderScroll.classList.remove("hide");
  } else if (currentScroll < lastScroll && currentScroll > triggerScroll) {
    // 向上滑但還在門檻以下（還不回頂部）
    miniHeaderScroll.classList.add("show"); 
    miniHeaderScroll.classList.remove("hide"); 
  } else if (currentScroll <= triggerScroll) {
    // 回到上方，恢復初始狀態
    miniHeaderScroll.classList.remove("show", "hide");
  }
  if (currentScroll > viewHeight && currentScroll > lastScroll) {
    miniHeaderScroll.classList.add("hide"); 
    miniHeaderScroll.classList.remove("show"); 
  }
  lastScroll = currentScroll;
});


// =========================
// 手動切換 dark/light theme
// =========================
function initThemeToggle() {
  const toggleButtons = document.querySelectorAll(".theme-toggle");
  const themeIcons = document.querySelectorAll(".theme-toggle i");

  const storedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentTheme = storedTheme || "light"; //預設 light

  setTheme(currentTheme);

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark-mode");
      const newTheme = isDark ? "light" : "dark";
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    });
  });

  function setTheme(theme) {
    document.documentElement.classList.remove("dark-mode", "light-mode");
  
    if (theme === "dark") {
      document.documentElement.classList.add("dark-mode");
      themeIcons.forEach((icon) => {
        icon.classList.remove("bi-moon-fill");
        icon.classList.add("bi-sun-fill");
      });
    } else {
      document.documentElement.classList.add("light-mode");
      themeIcons.forEach((icon) => {
        icon.classList.remove("bi-sun-fill");
        icon.classList.add("bi-moon-fill");
      });
    }
  }
}

// 最後再執行主題切換初始化
initThemeToggle();