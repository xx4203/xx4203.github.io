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
      // 雙頁顯示
      let pages = allPages.slice(currentPage, currentPage + 2);

      // 封面/第一頁在右、第二頁在左
      if (pages.length === 2) pages = [pages[1], pages[0]];

      pages.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.style.flex = "1 1 50%";        // 讓兩張圖各佔一半寬度
        img.style.maxWidth = "50%";
        img.style.objectFit = "contain";
        pageContainer.appendChild(img);
      });

      pageContainer.style.display = "flex";
      pageContainer.style.width = "100vw";
      pageContainer.style.gap = "0";       // 取消空隙
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
    if (!menu.classList.contains("hidden")) return;

    if (e.clientX < window.innerWidth / 2) {
      currentPage = Math.min(currentPage + (isDoublePage ? 2 : 1), allPages.length - 1);
    } else {
      currentPage = Math.max(currentPage - (isDoublePage ? 2 : 1), 0);
    }

    if (isDoublePage && currentPage % 2 !== 0) currentPage--;
    renderPage();
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
