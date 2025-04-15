//
//menu-icon 動態
document.getElementById("menu-icon").addEventListener("click", function () {
    this.classList.toggle("active"); // 點擊時切換 .active
});


//
// 迷你 header
// document.addEventListener("DOMContentLoaded", () => {
//   const originalHeader = document.getElementById("header");

//   // 確保 header 內容已載入（原本 header 是空的，loadComponent 載入後才有 nav 結構）
//   if (originalHeader && originalHeader.children.length > 0) {
//     createMiniHeader(originalHeader);
//   } else {
//     // 若還未載入完成，再等一下
//     const observer = new MutationObserver(() => {
//       if (originalHeader.children.length > 0) {
//         createMiniHeader(originalHeader);
//         observer.disconnect();
//       }
//     });
//     observer.observe(originalHeader, { childList: true });
//   }

//   function createMiniHeader(sourceEl) {
//     const miniHeader = document.createElement("div");
//     miniHeader.id = "mini-header";
//     miniHeader.innerHTML = sourceEl.innerHTML;
//     document.body.appendChild(miniHeader);

//     // 初始化樣式（也可寫在 CSS）
//     miniHeader.style.position = "sticky";
//     miniHeader.style.top = "0";
//     miniHeader.style.zIndex = "999";
//     miniHeader.style.display = "none";
//   }
// });


//old
let lastScroll = 0;
const header = document.getElementById("header");

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  // 開始往下滾
  if (currentScroll > lastScroll && currentScroll > 1) {
    header.classList.add("mini-header");
  }

  // 持續滾動一段後
  if (currentScroll > lastScroll && currentScroll > 500) {
    header.classList.add( "hide");
  }

  // 往上滾動
  else if (currentScroll < lastScroll && currentScroll > 500) {
    header.classList.remove("hide");
  }

  // 回到頂部時移除樣式
  if (currentScroll < lastScroll && currentScroll < 1) {
    header.classList.remove("mini-header", "hide");
  } 

  lastScroll = currentScroll;
});