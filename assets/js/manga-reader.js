function initReader(manga, mangaList) {
  let currentPage = 0;
  let isDoublePage = false;

  // 封面永遠在第一頁
  const allPages = [manga.cover, ...(manga.images || [])];

  const pageContainer = document.querySelector(".page-container");
  const toggleBtn = document.getElementById("toggleView");
  const menuBtn = document.getElementById("menuToggle");
  const menu = document.getElementById("chapterMenu");
  const chapterList = document.getElementById("chapterList");
  const fullscreenBtn = document.getElementById("fullscreenBtn");

  // 渲染頁面
  function renderPage() {
    pageContainer.innerHTML = "";

    if (isDoublePage) {
      const remainingPages = allPages.length - currentPage;
      pageContainer.innerHTML = "";
      pageContainer.style.display = "flex";
      pageContainer.style.width = "100vw";
      pageContainer.style.gap = "0"; // 取消空隙

      // 如果只剩最後一頁且總頁數為奇數，單獨置中
      if (remainingPages === 1) {
        const img = document.createElement("img");
        img.src = allPages[currentPage];
        img.style.width = "auto";
        img.style.maxWidth = "50%"; // 或你想要的大小
        img.style.objectFit = "contain";
        img.style.margin = "0 auto"; // 置中
        pageContainer.appendChild(img);
      } else {
        // 正常雙頁顯示
        let pages = allPages.slice(currentPage, currentPage + 2);

        // 封面/第一頁在右、第二頁在左
        if (pages.length === 2) pages = [pages[1], pages[0]];

        pages.forEach((src, i) => {
          const img = document.createElement("img");
          img.src = src;
          img.style.width = "50%";
          img.style.height = "auto";
          img.style.objectFit = "contain";

          // 左頁靠右、右頁靠左
          if (i === 0) {
            img.classList.add("left-page");
            img.style.marginLeft = "auto";
            img.style.marginRight = "0";
          } else {
            img.classList.add("right-page");
            img.style.marginLeft = "0";
            img.style.marginRight = "auto";
          }

          pageContainer.appendChild(img);
        });
      }
    } else {
      const img = document.createElement("img");
      img.src = allPages[currentPage];
      img.style.maxWidth = "100%";
      img.style.objectFit = "contain";
      pageContainer.appendChild(img);
      pageContainer.style.width = "";
      pageContainer.style.display = "flex";
    }

  }

  // 單/雙頁切換
  toggleBtn.addEventListener("click", (e) => {
    isDoublePage = !isDoublePage;

    // 雙頁時從偶數頁開始
    if (isDoublePage && currentPage % 2 !== 0) currentPage--;

    toggleBtn.innerHTML = isDoublePage
      ? '<i class="bi bi-book-fill"></i>'
      : '<i class="bi bi-book-half"></i>';
    renderPage();
  });




  // 點擊翻頁（右翻書）+ 選單開啟時禁用翻頁
  pageContainer.addEventListener("click", (e) => {
  if (!menu.classList.contains("hidden")) return; // 選單開啟時禁用翻頁

  const imgs = pageContainer.querySelectorAll("img");
  if (!imgs.length) return;

  if (isDoublePage) {
    let minX, maxX;

    if (imgs.length === 2) {
      // 雙頁正常情況 → 取兩張圖的範圍
      const rectLeft = imgs[0].getBoundingClientRect();
      const rectRight = imgs[1].getBoundingClientRect();
      minX = rectLeft.left;
      maxX = rectRight.right;
    } else {
      // 雙頁模式但只有一張圖（最後一頁） → 用整個容器
      const rect = pageContainer.getBoundingClientRect();
      minX = rect.left;
      maxX = rect.right;
    }

    const clickX = e.clientX;
    const totalWidth = maxX - minX;
    const leftZone = minX + totalWidth * 0.35;
    const rightZone = minX + totalWidth * 0.65;

    if (clickX < leftZone && clickX >= minX) {
      // 左側 → 下一頁
      currentPage = Math.min(currentPage + 2, allPages.length - 1);
      if (currentPage % 2 !== 0) currentPage--; // 保證偶數頁
      renderPage();
    } else if (clickX > rightZone && clickX <= maxX) {
      // 右側 → 上一頁
      currentPage = Math.max(currentPage - 2, 0);
      if (currentPage % 2 !== 0) currentPage--;
      renderPage();
    } else {
      // 中間 → 工具列切換
      document.querySelector(".control-bar").classList.toggle("hidden");
    }

  } else {
    // 單頁模式
    const rect = imgs[0].getBoundingClientRect();
    const minX = rect.left;
    const maxX = rect.right;
    const clickX = e.clientX;

    const width = rect.width;
    const leftZone = minX + width * 0.35;
    const rightZone = minX + width * 0.65;

    if (clickX < leftZone && clickX >= minX) {
      // 左側 → 下一頁
      currentPage = Math.min(currentPage + 1, allPages.length - 1);
      renderPage();
    } else if (clickX > rightZone && clickX <= maxX) {
      // 右側 → 上一頁
      currentPage = Math.max(currentPage - 1, 0);
      renderPage();
    } else {
      // 中間 → 工具列切換
      document.querySelector(".control-bar").classList.toggle("hidden");
    }
  }
});




//滑鼠翻頁手形符號
pageContainer.addEventListener("mousemove", (e) => {
  const imgs = pageContainer.querySelectorAll("img");
  if (!imgs.length) return;

  let minX, maxX;

  if (isDoublePage) {
    if (imgs.length === 2) {
      const rectLeft = imgs[0].getBoundingClientRect();
      const rectRight = imgs[1].getBoundingClientRect();
      minX = rectLeft.left;
      maxX = rectRight.right;
    } else {
      const rect = pageContainer.getBoundingClientRect();
      minX = rect.left;
      maxX = rect.right;
    }
  } else {
    const rect = imgs[0].getBoundingClientRect();
    minX = rect.left;
    maxX = rect.right;
  }

  const totalWidth = maxX - minX;
  const leftZone = minX + totalWidth * 0.35;
  const rightZone = minX + totalWidth * 0.65;

  if (e.clientX < leftZone && e.clientX >= minX || e.clientX > rightZone && e.clientX <= maxX) {
    pageContainer.style.cursor = "pointer"; // 或 "grab"
  } else {
    pageContainer.style.cursor = "default";
  }
});







  //滑動翻頁
  let startX = 0;
  let isDragging = false;

  function handleStart(e) {
    startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    isDragging = true;
  }

  function handleEnd(e) {
    if (!isDragging) return;
    const endX = e.type.includes("mouse") ? e.clientX : e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    isDragging = false;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // 從左往右滑 → 下一頁
        currentPage = Math.min(currentPage + (isDoublePage ? 2 : 1), allPages.length - 1);
      } else {
        // 從右往左滑 → 上一頁
        currentPage = Math.max(currentPage - (isDoublePage ? 2 : 1), 0);
      }
      if (isDoublePage && currentPage % 2 !== 0) currentPage--;
      renderPage();
    }
  }

  pageContainer.addEventListener("mousedown", handleStart);
  pageContainer.addEventListener("mouseup", handleEnd);
  pageContainer.addEventListener("touchstart", handleStart);
  pageContainer.addEventListener("touchend", handleEnd);






  // 章節選單
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });

  // 點擊空白處關閉章節選單
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== menuBtn) {
      menu.classList.add("hidden");
    }
  });

  // 章節列表
  chapterList.innerHTML = mangaList.map(m => `
    <li class="${m.title === manga.title ? "active" : ""}">
      <a href="${m.url}">
        <img src="${m.cover}" alt="${m.title}">
        <div>
          <h4>${m.title}</h4>
          <p>${m.year}｜${m.pages}頁</p>
        </div>
      </a>
    </li>
  `).join("");

  // 全螢幕切換 + icon 切換
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
    } else {
      document.exitFullscreen();
      fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
    }
  });







  // 初始渲染
  renderPage();
}