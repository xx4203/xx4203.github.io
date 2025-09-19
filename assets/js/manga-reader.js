function initReader(manga, mangaList) {
  let currentPage = 0;
  let isDoublePage = false;

  // 封面永遠在第一頁
  const allPages = [manga.cover, ...(manga.images || [])];

  // === 新增：章節索引 ===
  const allChapters = mangaList;
  const currentChapterIndex = allChapters.findIndex(c => c.title === manga.title);

  const pageContainer = document.querySelector(".page-container");
  const toggleBtn = document.getElementById("toggleView");
  const menuBtn = document.getElementById("menuToggle");
  const menu = document.getElementById("chapterMenu");
  const chapterList = document.getElementById("chapterList");
  const fullscreenBtn = document.getElementById("fullscreenBtn");


  // =========================
  // 載入圖片檔案
  // =========================
  function getLowResPath(path) {
    return path.replace(/(\.\w+)$/, '-w480$1'); // xxx.png → xxx-low.png
  }

  const images = []; // 儲存所有建立的 img

  function renderImage(src, style = {}) {
    const img = document.createElement("img");

    // 先放低畫質
    img.src = getLowResPath(src);
    img.style.objectFit = "contain";
    Object.assign(img.style, style);

    // 判斷裝置效能
    const cores = navigator.hardwareConcurrency || 4; // fallback 4 核
    let allowedWidths = [480, 960, 1920];
    if (cores <= 2) allowedWidths = allowedWidths.filter(w => w <= 960); // 低效能裝置限制

    // 建立 srcset
    const base = src.replace(/(\.\w+)$/, "");
    const ext = src.match(/(\.\w+)$/)[0];
    const srcsetStr = allowedWidths.map(w => `${base}-w${w}${ext} ${w}w`).join(", ");

    // 等低畫質載入後，再塞 srcset 觸發高畫質下載
    img.onload = () => {
      img.srcset = `
        ${base}-w480${ext} 480w,
        ${base}-w960${ext} 960w,
        ${base}-w1920${ext} 1920w,
      `;
    };

    images.push(img); // 加入陣列，方便 resize 更新
    return img;
  }

  // 更新 images 的 sizes 為容器寬度
  function updateImageSizes(containerSelector = ".manga-reader") {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const width = container.clientWidth;
    images.forEach(img => {
      img.sizes = `${width}px`;
    });
  }

  // 初始化一次
  updateImageSizes();

  // 監聽視窗 resize
  window.addEventListener("resize", () => updateImageSizes());



  // =========================
  // 渲染頁面
  // =========================
  function renderPage() {
    pageContainer.innerHTML = "";

    if (isDoublePage) {
      const remainingPages = allPages.length - currentPage;
      pageContainer.style.display = "flex";
      pageContainer.style.width = "100vw";
      pageContainer.style.gap = "0"; // 取消空隙

      // 如果只剩最後一頁且總頁數為奇數，單獨置中
      if (remainingPages === 1) {
        const img = renderImage(allPages[currentPage], {
          maxWidth: "100%",
        });
        img.classList.add("progressive-img");
        img.style.width = "auto";
        img.style.maxWidth = "50%";
        img.style.objectFit = "contain";
        img.style.margin = "0 auto"; // 置中
        pageContainer.appendChild(img);

      } else {
        // 正常雙頁顯示
        let pages = allPages.slice(currentPage, currentPage + 2);

        // 封面/第一頁在右、第二頁在左
        if (pages.length === 2) pages = [pages[1], pages[0]];

        pages.forEach((src, i) => {
          const img = renderImage(src, {
            width: "50%",
            height: "auto",
          });
          img.classList.add("progressive-img");
          img.loading = "lazy"; 
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
      const img = renderImage(allPages[currentPage], {
        maxWidth: "100%",
      });
      img.classList.add("progressive-img");
      img.style.maxWidth = "100%";
      img.style.objectFit = "contain";
      pageContainer.appendChild(img);

      pageContainer.style.width = "";
      pageContainer.style.display = "flex";
    }
  }

  // =========================
  // 預載下一頁
  // =========================
    // function preloadNextPages(count = 1) {
    //   for (let i = 1; i <= count; i++) {
    //     const nextIndex = currentPage + i * (isDoublePage ? 2 : 1);
    //     if (nextIndex < allPages.length) {
    //       const nextPages = allPages.slice(nextIndex, nextIndex + (isDoublePage ? 2 : 1));
    //       nextPages.forEach(src => {
    //         const img = new Image();
    //         img.src = getLowResPath(src);
    //         const base = src.replace(/(\.\w+)$/, "");
    //         const ext = src.match(/(\.\w+)$/)[0];
    //         img.srcset = `
    //           ${base}-w480${ext} 480w,
    //           ${base}-w960${ext} 960w,
    //           ${base}-w1920${ext} 1920w
    //         `;
    //       });
    //     }
    //   }
    // }

  // =========================
  // 翻頁提示
  // =========================
  function showHint(html, duration = 1500) {
  let hint = document.getElementById("pageHint");
    if (!hint) {
      hint = document.createElement("div");
      hint.id = "pageHint";
      hint.className = "page-hint hidden";
      document.body.appendChild(hint);
    }

    hint.innerHTML = html;
    hint.classList.add("show");
    hint.classList.remove("hidden");

    setTimeout(() => {
      hint.classList.remove("show");
      setTimeout(() => hint.classList.add("hidden"), 300);
    }, duration);
  }


  // =========================
  // 共用翻頁函式
  // =========================
  function goPage(direction) {
    if (direction === "next") {
      if (currentPage >= allPages.length - (isDoublePage ? 2 : 1)) {
        const isLastChapter = currentChapterIndex === allChapters.length - 1;
        showHint(isLastChapter ? "END" : `<p class="paragraph">END</p>`, 800);
      } else {
        currentPage = Math.min(currentPage + (isDoublePage ? 2 : 1), allPages.length - 1);
        if (isDoublePage && currentPage % 2 !== 0) currentPage--;
        renderPage();
      }
    } else if (direction === "prev") {
      if (currentPage === 0) {
        showHint(`
          <i class="bi bi-arrow-left-square"></i>
          <p>閱讀方向</p>
        `, 800);
      } else {
        currentPage = Math.max(currentPage - (isDoublePage ? 2 : 1), 0);
        if (isDoublePage && currentPage % 2 !== 0) currentPage--;
        renderPage();
      }
    }
  }
  
  // =========================
  // 單/雙頁切換
  // =========================
  toggleBtn.addEventListener("click", (e) => {
    isDoublePage = !isDoublePage;

    // 雙頁時從偶數頁開始
    if (isDoublePage && currentPage % 2 !== 0) currentPage--;

    toggleBtn.innerHTML = isDoublePage
      ? '<i class="bi bi-book-fill"></i>'
      : '<i class="bi bi-book-half"></i>';
    renderPage();
  });


  // =========================
  // 翻頁控制狀態
  // =========================
  let hasDragged = false;
  let startX = 0;
  let isDragging = false;

  // =========================
  // 檢查是否縮放 (移動端)
  // =========================
  function isZoomed() {
    return window.visualViewport && window.visualViewport.scale > 1.0;
  }

  // =========================
  // 點擊翻頁
  // =========================
  pageContainer.addEventListener("click", (e) => {
    if (isZoomed()) return; // 放大狀態下停用
    if (hasDragged) {
      hasDragged = false; // 滑動後的點擊不觸發
      return;
    }
    if (!menu.classList.contains("hidden")) return;

    const imgs = pageContainer.querySelectorAll("img");
    if (!imgs.length) return;

    const rects = Array.from(imgs).map(img => img.getBoundingClientRect());
    const minX = rects[0].left;
    const maxX = rects[rects.length - 1].right;
    const totalWidth = maxX - minX;
    const clickX = e.clientX;
    const leftZone = minX + totalWidth * 0.35;
    const rightZone = minX + totalWidth * 0.65;

    if (clickX < leftZone) goPage("next");
    else if (clickX > rightZone) goPage("prev");
    else document.querySelector(".control-bar").classList.toggle("hidden");
  });

  // =========================
  // 滑動翻頁（單指拖動）
  // =========================
  function handleStart(e) {
    if (isZoomed()) { // 放大狀態不啟動
      isDragging = false;
      return;
    }
    if (e.type.startsWith("touch") && e.touches.length > 1) {
      isDragging = false;
      return;
    }
    startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    isDragging = true;
    hasDragged = false;
  }

  function handleMove(e) {
    if (!isDragging) return;
    if (e.type.startsWith("touch") && e.touches.length > 1) {
      isDragging = false;
    }
  }

  function handleEnd(e) {
    if (!isDragging) return;

    const endX = e.type.includes("mouse") ? e.clientX : e.changedTouches[0].clientX;
    const deltaX = endX - startX;

    isDragging = false;

    if (Math.abs(deltaX) > 50) {
      hasDragged = true; // 滑動翻頁後阻擋點擊翻頁
      goPage(deltaX > 0 ? "next" : "prev");
    }
  }

  // 監聽事件
  pageContainer.addEventListener("mousedown", handleStart);
  pageContainer.addEventListener("mouseup", handleEnd);
  pageContainer.addEventListener("touchstart", handleStart);
  pageContainer.addEventListener("touchmove", handleMove);
  pageContainer.addEventListener("touchend", handleEnd);



  // =========================
  // 滑鼠翻頁手形符號
  // =========================
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


  // =========================
  // 章節選單
  // =========================
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });

  
  // =========================
  // 點擊空白處關閉章節選單
  // =========================
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== menuBtn) {
      menu.classList.add("hidden");
    }
  });


  // =========================
  // 章節列表
  // =========================
  // 清空列表
  chapterList.innerHTML = "";

  // header
  const headerLi = document.createElement("li");
  headerLi.className = "chapter-header";
  headerLi.innerHTML = `
    <a href="https://xx4203.com/" class="chapter-logo">
      <svg id="site-logo" viewBox="0 0 1350 1350" alt="小大象-LittleElefan-logo.svg">
          <path d="M675.47,346.43c86.5,0,156.61,70.12,156.61,156.61,0,58.72-32.32,109.88-80.14,136.69l133.27,366.17c6.81,18.71-3.17,39.52-22.3,46.48-4.25,1.55-8.59,2.28-12.84,2.28-14.91,0-28.82-9-34.11-23.55l-103.64-284.76v272.26c0,19.91-16.5,36.05-36.85,36.05s-36.85-16.14-36.85-36.05v-272.26s-103.64,284.76-103.64,284.76c-5.3,14.55-19.2,23.55-34.11,23.55-4.26,0-8.6-.73-12.84-2.28-19.12-6.96-29.11-27.77-22.3-46.48l133.27-366.17c-37.48-21.01-65.43-56.99-75.77-99.84h-96.5c-20.35,0-36.85-16.5-36.85-36.85s16.5-36.85,36.85-36.85h96.5c16.57-68.71,78.44-119.76,152.24-119.76M675.47,311.43c-22.07,0-43.72,3.73-64.34,11.08-19.93,7.11-38.46,17.43-55.06,30.67-25.81,20.59-45.91,47.67-58.23,78.01h-71.1c-39.62,0-71.85,32.23-71.85,71.85s32.23,71.85,71.85,71.85h71.09c12.48,30.77,32.85,57.91,58.94,78.54l-123.93,340.49c-13.4,36.81,5.99,77.79,43.22,91.34,8,2.91,16.35,4.39,24.82,4.39,14.45,0,28.39-4.27,40.3-12.35,12.37-8.38,21.6-20.22,26.7-34.23l35.75-98.24v73.77c0,39.18,32.23,71.05,71.85,71.05s71.85-31.87,71.85-71.05v-73.77l35.76,98.24c5.1,14.01,14.33,25.85,26.7,34.23,11.92,8.08,25.85,12.35,40.3,12.35,8.46,0,16.81-1.48,24.81-4.39,17.9-6.51,32.27-19.51,40.46-36.58,8.32-17.34,9.3-36.78,2.76-54.75l-123.93-340.49c18.23-14.41,33.79-32.07,45.79-52.11,17.73-29.62,27.11-63.61,27.11-98.29,0-25.85-5.07-50.95-15.07-74.6-9.65-22.82-23.46-43.31-41.05-60.9-17.59-17.59-38.07-31.4-60.9-41.05-23.65-10-48.74-15.07-74.6-15.07h0Z"/>
          <polygon points="675.47 527.34 623.12 579.68 598.83 555.39 651.18 503.05 598.83 450.7 623.12 426.42 675.47 478.76 727.81 426.42 752.1 450.7 699.76 503.05 752.1 555.39 727.81 579.68 675.47 527.34"/>
      </svg>
      <span class="medium">by Dan Lo</span>
    </a>

  `;
  chapterList.appendChild(headerLi);

  // 章節列表
  mangaList.forEach(m => {
    const li = document.createElement("li");
    li.className = m.title === manga.title ? "active" : "";

    // 把 m.cover 拆成 base 和 ext
    const base = m.cover.replace(/(\.\w+)$/, "");
    const ext = m.cover.match(/(\.\w+)$/)[0];

    li.innerHTML = `
      <a href="${m.url}">
        <img 
          src="${base}-low${ext}" 
          alt="${m.title}"
          sizes="max-width: 6rem"
        >
        <div>
          <h4>${m.title}</h4>
          <p>${m.year}｜${m.pages}頁</p>
        </div>
      </a>
    `;

    // 整個 li 可點
    li.addEventListener("click", () => {
      location.href = m.url;
    });

    chapterList.appendChild(li);
  });


  // footer
  const footerLi = document.createElement("li");
  footerLi.className = "chapter-footer";
  footerLi.innerHTML = `
    <div id="copyright">
    <p>Dan Lo © </p>
    <p>2019-2025</p>
    <p>All right reserved.</p>
    </div>
    <div class="footer-social-link">
        <a href="https://xx4203.com/"><i class="bi bi-globe2 icon-btn sec-color"></i></a>
        <a href="https://www.instagram.com/x_x4203/"><i class="bi bi-instagram icon-btn sec-color"></i></a>
        <i class="bi bi-envelope icon-btn sec-color" id="copyEmail"></i>
    </div>
    <i id="back-top" class="bi bi-arrow-up-circle icon-btn sec-color"></i>
  `;
  chapterList.appendChild(footerLi);

  // 可選：點擊 back-top 回頂端
  document.getElementById("back-top")?.addEventListener("click", () => {
    menu.scrollTop = 0;
  });

  // 可選：點擊 copyEmail 複製信箱
  const copyEmailBtn = document.getElementById("copyEmail");
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", () => {
      // 複製信箱
      navigator.clipboard.writeText("xox4203@gmail.com");

      // 先暫存原本的 class
      const originalClass = copyEmailBtn.className;

      // 改成 copy icon
      copyEmailBtn.className = "bi bi-copy icon-btn sec-color";

      // 0.5 秒後恢復原本信封 icon
      setTimeout(() => {
        copyEmailBtn.className = originalClass;
      }, 500);
    });
  }


  // =========================
  // 鍵盤快捷鍵：翻頁
  // =========================
  let isChapterListOpen = false; // 預設章節列表關閉

  function nextPage() {
    goPage("next");
  }

  function prevPage() {
    goPage("prev");
  }

  document.addEventListener("keydown", function (event) {
    if (["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;

    if (isChapterListOpen) {
      // 📖 章節列表模式
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          selectChapter(-1);
          break;
        case "ArrowDown":
          event.preventDefault();
          selectChapter(1);
          break;
        case "Enter":
          event.preventDefault();
          enterChapter();
          break;
        case "Tab":
          event.preventDefault();
          toggleChapterList(); // 關閉
          break;
      }
    } else {
      // 📖 閱讀模式
      switch (event.key) {
        // 下一頁
        case "ArrowLeft":
        case "ArrowDown":
        case "a": case "A":
        case "s": case "S":
        case "PageDown":
        case " ":
        case "Spacebar":
          event.preventDefault();
          nextPage();
          break;

        // 上一頁
        case "ArrowRight":
        case "ArrowUp":
        case "d": case "D":
        case "w": case "W":
        case "PageUp":
          event.preventDefault();
          prevPage();
          break;

        // 功能鍵
        case "f": case "F":
          event.preventDefault();
          toggleFullscreen();
          break;

        case "p": case "P": // 改用 P 來切換單/雙頁
          event.preventDefault();
          togglePageMode();
          break;

        case "Tab":
          event.preventDefault();
          toggleChapterList(); // 開啟
          break;
      }
    }
  });



  // =========================
  // 全螢幕切換 + icon 切換
  // =========================
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


// 禁止右鍵與拖曳
document.addEventListener("contextmenu", e => { if(e.target.tagName==="IMG") e.preventDefault(); });
document.addEventListener("dragstart", e => { if(e.target.tagName==="IMG") e.preventDefault(); });


