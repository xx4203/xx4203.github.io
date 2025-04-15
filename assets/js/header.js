//
//menu-icon 動態
document.getElementById("menu-icon").addEventListener("click", function () {
    this.classList.toggle("active"); // 點擊時切換 .active
});


//
// 迷你 header 動態
let lastScroll = 0;
const header = document.getElementById("header");

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  // 開始往下滾
  if (currentScroll > lastScroll && currentScroll > 100) {
    header.classList.add("header", "hide");
    header.classList.remove("show");
  }
  // 往上滾動
  else if (currentScroll < lastScroll) {
    header.classList.add("mini-header", "show");
    header.classList.remove("hide");
  }

  // 回到頂部時移除樣式
  if (currentScroll < 1) {
    header.classList.remove("mini-header", "hide", "show");
  }

  lastScroll = currentScroll;
});