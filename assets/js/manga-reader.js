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
      ? '<i class="bi bi-square-fill"></i>'
      : '<i class="bi bi-square-half"></i>';
    renderPage();
  });

  // 點擊翻頁（右翻書）+ 選單開啟時禁用翻頁
  pageContainer.addEventListener("click", (e) => {
    if (!menu.classList.contains("hidden")) return; // 選單開啟時禁用翻頁

    const containerWidth = pageContainer.clientWidth;
    const clickX = e.clientX - pageContainer.getBoundingClientRect().left;

    const leftZone = containerWidth * 0.25;
    const rightZone = containerWidth * 0.75;

    if (clickX < leftZone) {
      // 左側 → 下一頁
      currentPage = Math.min(currentPage + (isDoublePage ? 2 : 1), allPages.length - 1);
      if (isDoublePage && currentPage % 2 !== 0) currentPage--;
      renderPage();
    } else if (clickX > rightZone) {
      // 右側 → 上一頁
      currentPage = Math.max(currentPage - (isDoublePage ? 2 : 1), 0);
      if (isDoublePage && currentPage % 2 !== 0) currentPage--;
      renderPage();
    } else {
      // 中間 → 切換工具列
      const controlBar = document.querySelector(".control-bar");
      controlBar.classList.toggle("hidden");
    }

  });

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
