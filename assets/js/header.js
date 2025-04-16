// =========================
//menu-icon 動態
// =========================
document.getElementById("menu-icon").addEventListener("click", function () {
    this.classList.toggle("active"); // 點擊時切換 .active
});


// =========================
// logo 和 nav-list 動態
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const logo = document.getElementById("nav-logo");
  const navList = document.getElementById("nav-list");

  // 先讓 logo 動
  setTimeout(() => {
    logo.classList.add("animate-in");
  }, 100);

  // nav-list 比 logo 晚一點出現
  setTimeout(() => {
    navList.classList.add("animate-in");
  }, 300);
});



// =========================
// 建立 mini-header
// =========================
// 取得 #header 元素
const originHeader = document.getElementById("header");
// 建立 #mini-header
const miniHeader = document.createElement("header");
miniHeader.id = "mini-header";
miniHeader.innerHTML = header.innerHTML;
// 插入到 #header 後方
header.insertAdjacentElement("afterend", miniHeader);


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
    miniHeaderScroll.classList.add("show");
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