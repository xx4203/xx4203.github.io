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
  let isChapterListOpen = false;

  pageContainer.style.transformOrigin = "0 0";

  // =========================
  // 縮放狀態（只影響漫畫頁面）
  // =========================
  const viewport = document.querySelector(".page-viewport");

  let zoomScale = 1;
  let offsetX = 0;
  let offsetY = 0;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;


  // =========================
  // 放大/縮小到「某個 client 座標」為中心
  // =========================
  function zoomToClientPoint(clientX, clientY, targetScale) {
    const vpRect = viewport.getBoundingClientRect();

    // 1) 把 client 座標轉成 viewport 內座標（px）
    const px = clientX - vpRect.left;
    const py = clientY - vpRect.top;

    // 2) 算出「目前」那個 px/py 對應到內容座標（content space）
    const contentX = (px - offsetX) / zoomScale;
    const contentY = (py - offsetY) / zoomScale;

    // 3) 套用新縮放後，回推新的 offset，讓同一個 contentX/Y 仍落在 px/py
    zoomScale = targetScale;
    offsetX = px - contentX * zoomScale;
    offsetY = py - contentY * zoomScale;

    applyTransform(); // 你原本就會 clampOffset()
  }

  // =========================
  // 連點時間
  // =========================
  let suppressClickUntil = 0;
  function suppressClicks(ms = 350) {
    suppressClickUntil = Date.now() + ms;
  }

  let clickTimer = null;
  let pendingClickEvent = null;

  // dblclick 的時間窗口（桌機常用 250~300）
  const CLICK_DELAY = 260;

  function scheduleSingleClick(e) {
    // 如果目前已被 suppress（例如剛 pinch / double tap 成功）
    if (Date.now() < suppressClickUntil) return;

    // 拖曳過就不算 click
    if (hasDragged) {
      hasDragged = false;
      return;
    }

    // 選單開啟中不翻頁
    if (!menu.classList.contains("hidden")) return;

    // 取消上一個待處理 click（避免連點造成多次排程）
    if (clickTimer) clearTimeout(clickTimer);

    pendingClickEvent = e;

    clickTimer = setTimeout(() => {
      // 時間到了才真的當作單擊
      pendingClickEvent = null;
      clickTimer = null;

      // ⭐ 這裡呼叫你原本 click 翻頁的內容
      handleClickToPage(e);
    }, CLICK_DELAY);
  }

  function cancelScheduledClick() {
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = null;
    pendingClickEvent = null;
  }





  // =========================
  // 邊界限制函式
  // =========================
  function clampOffset() {
    const viewportRect = viewport.getBoundingClientRect();

    // ⭐ 用 scrollWidth / scrollHeight 拿「原始內容尺寸」
    const contentWidth = pageContainer.scrollWidth * zoomScale;
    const contentHeight = pageContainer.scrollHeight * zoomScale;

    const minOffsetX = Math.min(0, viewportRect.width - contentWidth);
    const minOffsetY = Math.min(0, viewportRect.height - contentHeight);

    const maxOffsetX = 0;
    const maxOffsetY = 0;

    // X 軸
    if (contentWidth <= viewportRect.width) {
      offsetX = (viewportRect.width - contentWidth) / 2;
    } else {
      offsetX = Math.min(maxOffsetX, Math.max(minOffsetX, offsetX));
    }

    // Y 軸
    if (contentHeight <= viewportRect.height) {
      offsetY = (viewportRect.height - contentHeight) / 2;
    } else {
      offsetY = Math.min(maxOffsetY, Math.max(minOffsetY, offsetY));
    }
  }

  function applyTransform() {
    clampOffset();
    pageContainer.style.transform =
      `translate(${offsetX}px, ${offsetY}px) scale(${zoomScale})`;
  }




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
  // 狀態保存（F5 重整保留）
  // =========================
  const STATE_KEY = `reader:${location.pathname}`;

  function saveReaderState() {
    const state = {
      currentPage,
      isDoublePage,
    };
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function loadReaderState() {
    try {
      const raw = sessionStorage.getItem(STATE_KEY);
      if (!raw) return;

      const state = JSON.parse(raw);

      if (Number.isInteger(state.currentPage)) {
        currentPage = Math.max(0, Math.min(allPages.length - 1, state.currentPage));
      }
      if (typeof state.isDoublePage === "boolean") {
        isDoublePage = state.isDoublePage;
        // 雙頁時從偶數頁開始
        if (isDoublePage && currentPage % 2 !== 0) currentPage--;
        toggleBtn.innerHTML = isDoublePage
          ? '<i class="bi bi-book-fill"></i>'
          : '<i class="bi bi-book-half"></i>';
      }
    } catch (e) {
      // 解析失敗就忽略
    }
  }


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
        applyTransform();
        saveReaderState();
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
        applyTransform();
        saveReaderState();
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
    applyTransform();
  });


  // =========================
  // 翻頁控制狀態
  // =========================
  let hasDragged = false;
  let startX = 0;
  let isDragging = false;
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;


  // =========================
  // 慣性 pan 參數（touch）
  // =========================
  let inertiaId = null;           // requestAnimationFrame id
  let lastPanX = 0;
  let lastPanY = 0;
  let lastPanT = 0;
  let velocityX = 0;
  let velocityY = 0;

  const INERTIA_FRICTION = 0.92;  // 摩擦力：越小越快停（0.85~0.95 之間調）
  const INERTIA_MIN_SPEED = 0.12; // 停止門檻(px/ms)
  const INERTIA_MAX_SPEED = 2.5;  // 速度上限(px/ms)，避免甩太快


  function stopInertia() {
    if (inertiaId) cancelAnimationFrame(inertiaId);
    inertiaId = null;
  }

  function startInertia() {
    stopInertia();

    let vx = velocityX;
    let vy = velocityY;
    let prevX = offsetX;
    let prevY = offsetY;
    let lastT = performance.now();

    function step(now) {
      const dt = now - lastT; // ms
      lastT = now;

      // 速度太小就停
      const speed = Math.hypot(vx, vy);
      if (speed < INERTIA_MIN_SPEED) {
        stopInertia();
        return;
      }

      // 用速度推進位移（px = (px/ms) * ms）
      offsetX += vx * dt;
      offsetY += vy * dt;

      applyTransform(); // 內含 clampOffset()

      // ⭐ 如果被 clamp 住（代表撞到邊界），就停止該方向慣性
      if (offsetX === prevX) vx = 0;
      if (offsetY === prevY) vy = 0;

      prevX = offsetX;
      prevY = offsetY;

      // 摩擦衰減
      vx *= INERTIA_FRICTION;
      vy *= INERTIA_FRICTION;

      inertiaId = requestAnimationFrame(step);
    }

    inertiaId = requestAnimationFrame(step);
  }



  // =========================
  //單指「拖動畫面」
  // =========================
  viewport.addEventListener("touchstart", (e) => {
    // 只在放大時才允許單指拖曳 pan
    if (isZoomed() && e.touches.length === 1) {
      stopInertia(); // ⭐ 新拖曳開始，先停掉慣性

      isPanning = true;

      const t = e.touches[0];
      panStartX = t.clientX - offsetX;
      panStartY = t.clientY - offsetY;

      // ⭐ 初始化速度計算用的基準點/時間
      lastPanX = t.clientX;
      lastPanY = t.clientY;
      lastPanT = performance.now();
      velocityX = 0;
      velocityY = 0;
    }
  });


  viewport.addEventListener("touchmove", (e) => {
    if (isPanning && e.touches.length === 1) {
      e.preventDefault();
      hasDragged = true;

      const t = e.touches[0];
      const now = performance.now();

      // 先照你原本方式更新位置
      offsetX = t.clientX - panStartX;
      offsetY = t.clientY - panStartY;
      applyTransform();

      // ⭐ 算速度（px/ms），用最近一小段時間的位移
      const dt = now - lastPanT;
      if (dt > 0) {
        const dx = t.clientX - lastPanX;
        const dy = t.clientY - lastPanY;

        // 即時速度
        const vx = dx / dt;
        const vy = dy / dt;

        // 做一點平滑（避免抖動）
        velocityX = velocityX * 0.7 + vx * 0.3;
        velocityY = velocityY * 0.7 + vy * 0.3;

        // 限制最大速度，避免甩太快
        velocityX = Math.max(-INERTIA_MAX_SPEED, Math.min(INERTIA_MAX_SPEED, velocityX));
        velocityY = Math.max(-INERTIA_MAX_SPEED, Math.min(INERTIA_MAX_SPEED, velocityY));
      }

      lastPanX = t.clientX;
      lastPanY = t.clientY;
      lastPanT = now;
    }
  }, { passive: false });



  // =========================
  // 檢查是否縮放（只看漫畫容器）
  // =========================
  viewport.addEventListener("mousedown", (e) => {
    if (!isZoomed()) return;

    isPanning = true;
    panStartX = e.clientX - offsetX;
    panStartY = e.clientY - offsetY;

    e.preventDefault();
  });

  viewport.addEventListener("mousemove", (e) => {
    if (!isPanning) return;

    offsetX = e.clientX - panStartX;
    offsetY = e.clientY - panStartY;
    hasDragged = true;
    applyTransform();
  });

  viewport.addEventListener("mouseup", () => {
    isPanning = false;
  });

  viewport.addEventListener("mouseleave", () => {
    isPanning = false;
  });



  // =========================
  // 檢查是否縮放（只看漫畫容器）
  // =========================
  function isZoomed() {
    return zoomScale > 1;
  }

  // =========================
  // 點擊翻頁
  // =========================
  viewport.addEventListener("click", (e) => {
    scheduleSingleClick(e);
  });

  function handleClickToPage(e) {
    const imgs = pageContainer.querySelectorAll("img");
    if (!imgs.length) return;

    const rect = viewport.getBoundingClientRect();
    const minX = rect.left;
    const maxX = rect.right;
    const totalWidth = maxX - minX;
    const clickX = e.clientX;
    const leftZone = minX + totalWidth * 0.35;
    const rightZone = minX + totalWidth * 0.65;

    if (clickX < leftZone) goPage("next");
    else if (clickX > rightZone) goPage("prev");
    else document.querySelector(".control-bar").classList.toggle("hidden");
  }


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
  // 滾輪縮放（只縮放漫畫頁面）
  // =========================
  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();

    const rect = pageContainer.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomSpeed = 0.002; // ⭐ 調這裡：越大縮放越快
const factor = Math.exp(-e.deltaY * zoomSpeed);
const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomScale * factor));

    const scaleRatio = newScale / zoomScale;

    offsetX = mouseX - scaleRatio * (mouseX - offsetX);
    offsetY = mouseY - scaleRatio * (mouseY - offsetY);

    zoomScale = newScale;
    applyTransform();
  }, { passive: false });


  // =========================
  // 手機雙指縮放（pinch zoom）
  // =========================
  let startDistance = null;
  let startZoom = 1;
  let pinchCenter = null;

  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      stopInertia();
      const [t1, t2] = e.touches;

      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      startDistance = Math.hypot(dx, dy);
      startZoom = zoomScale;

      const rect = pageContainer.getBoundingClientRect();

      pinchCenter = {
        x: ((t1.clientX + t2.clientX) / 2) - rect.left,
        y: ((t1.clientY + t2.clientY) / 2) - rect.top,
      };
    }
  });


  viewport.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && startDistance) {
      e.preventDefault();

      const [t1, t2] = e.touches;
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      const distance = Math.hypot(dx, dy);

      const newScale = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, startZoom * (distance / startDistance))
      );

      // 🔥 核心：以 pinch 中心補償位移
      const scaleRatio = newScale / zoomScale;

      offsetX = pinchCenter.x - scaleRatio * (pinchCenter.x - offsetX);
      offsetY = pinchCenter.y - scaleRatio * (pinchCenter.y - offsetY);

      zoomScale = newScale;
      applyTransform();
    }
  }, { passive: false });


  viewport.addEventListener("touchend", (e) => {
    if (!isPanning) return;
    isPanning = false;

    // 只在「仍是放大狀態」才做慣性（避免縮回時亂滑）
    if (!isZoomed()) return;

    // ⭐ 有速度才啟動慣性
    if (Math.hypot(velocityX, velocityY) > INERTIA_MIN_SPEED) {
      startInertia();
    }
  });



  // =========================
  // 手機 double tap（兩下）放大/縮回
  // =========================
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;

  viewport.addEventListener("touchend", (e) => {
    // 只處理單指結束的情況（避免跟 pinch 打架）
    if (e.changedTouches.length !== 1) return;

    const t = e.changedTouches[0];
    const now = Date.now();

    const dt = now - lastTapTime;
    const dx = t.clientX - lastTapX;
    const dy = t.clientY - lastTapY;
    const dist2 = dx * dx + dy * dy;

    // 250ms 內 + 點的位置沒差太遠（30px 內） => 視為 double tap
    if (dt < 250 && dist2 < 30 * 30) {
      e.preventDefault();
      e.stopPropagation();
      stopInertia();

      cancelScheduledClick();
      suppressClicks(400);

      if (isZoomed()) {
        zoomScale = 1;
        offsetX = 0;
        offsetY = 0;
        applyTransform();
      } else {
        zoomToClientPoint(t.clientX, t.clientY, DOUBLE_TAP_ZOOM);
      }

      lastTapTime = 0; // 重置，避免三連點又觸發
      return;
    }

    lastTapTime = now;
    lastTapX = t.clientX;
    lastTapY = t.clientY;
  }, { passive: false });



  // =========================
  // 連點兩下還原
  // =========================
  const DOUBLE_TAP_ZOOM = 2.5; // ⭐ 你想要雙擊放大的倍率在這裡調

  viewport.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();

    cancelScheduledClick(); // ⭐ 把可能已排程的單擊取消
    suppressClicks(400);

    if (isZoomed()) {
      // 已放大：雙擊縮回
      zoomScale = 1;
      offsetX = 0;
      offsetY = 0;
      applyTransform();
    } else {
      // 未放大：雙擊放大到滑鼠位置
      zoomToClientPoint(e.clientX, e.clientY, DOUBLE_TAP_ZOOM);
    }
  });




  // =========================
  // 滑鼠翻頁手形符號
  // =========================
  viewport.addEventListener("mousemove", (e) => {
    const rect = viewport.getBoundingClientRect();
    const x = e.clientX;

    const leftZone = rect.left + rect.width * 0.35;
    const rightZone = rect.left + rect.width * 0.65;

    // 菜單開啟時不要顯示 pointer（避免誤導）
    if (!menu.classList.contains("hidden")) {
      viewport.style.cursor = "default";
      return;
    }

    if (x < leftZone || x > rightZone) {
      viewport.style.cursor = "pointer";
    } else {
      viewport.style.cursor = "default";
    }
  });



    // =========================
    // 章節選單
    // =========================
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("hidden");
      isChapterListOpen = !menu.classList.contains("hidden");
      if (isChapterListOpen) initChapterKeyboardSelection();
      else clearChapterKeyboardSelection();
    });

    
    // =========================
    // 點擊空白處關閉章節選單
    // =========================
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== menuBtn) {
        menu.classList.add("hidden");
        isChapterListOpen = false;
        clearChapterKeyboardSelection();
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
      // ✅ 若目前在 fullscreen，標記下一頁要恢復
      if (document.fullscreenElement) markFullscreenForNextPage();

      // ✅ 順便存一下目前閱讀狀態（可選，但很合理）
      saveReaderState();

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
  // 鍵盤功能：補齊缺的函式
  // =========================

  // 1) 工具列（你點中間區域就是 toggle .control-bar）
  function toggleControlBar() {
    document.querySelector(".control-bar")?.classList.toggle("hidden");
  }

  // 2) 全螢幕（抽成可被鍵盤呼叫的版本）
  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
      // icon 交給 fullscreenchange 統一處理（下面有）
    } catch (err) {
      console.warn("Fullscreen failed:", err);
    }
  }

  // 讓 icon 永遠跟著「真實全螢幕狀態」走（避免 ESC 離開後 icon 不對）
  document.addEventListener("fullscreenchange", () => {
    if (!fullscreenBtn) return;
    fullscreenBtn.innerHTML = document.fullscreenElement
      ? '<i class="bi bi-fullscreen-exit"></i>'
      : '<i class="bi bi-fullscreen"></i>';
  });

  // 3) 單/雙頁切換（直接沿用你現成的 toggleBtn click）
  function togglePageMode() {
    toggleBtn?.click();
  }

  // 4) 章節列表開關（直接沿用 menuBtn click）
  function toggleChapterList(force) {
    // force: true/false 可選；不給就是 toggle
    const isHidden = menu.classList.contains("hidden");
    const willOpen = force === undefined ? isHidden : force;

    if (willOpen && isHidden) menuBtn?.click();
    if (!willOpen && !isHidden) menuBtn?.click();

    isChapterListOpen = !menu.classList.contains("hidden");

    // 開啟章節列表時，初始化鍵盤選取
    if (isChapterListOpen) {
      initChapterKeyboardSelection();
    } else {
      clearChapterKeyboardSelection();
    }
  }

  // 5) 章節列表鍵盤上下選取 / Enter 進入
  let chapterKeyboardIndex = 0;

  function getChapterLis() {
    // 只取章節項目：排除 header/footer
    return Array.from(chapterList.querySelectorAll("li"))
      .filter(li => !li.classList.contains("chapter-header") && !li.classList.contains("chapter-footer"));
  }

  function clearChapterKeyboardSelection() {
    getChapterLis().forEach(li => li.classList.remove("kbd-active"));
  }

  function initChapterKeyboardSelection() {
    const lis = getChapterLis();
    if (!lis.length) return;

    // 預設選到目前 active 章節，沒有就選第一個
    chapterKeyboardIndex = Math.max(0, lis.findIndex(li => li.classList.contains("active")));
    clearChapterKeyboardSelection();
    lis[chapterKeyboardIndex].classList.add("kbd-active");
    lis[chapterKeyboardIndex].scrollIntoView({ block: "nearest" });
  }

  function selectChapter(delta) {
    const lis = getChapterLis();
    if (!lis.length) return;

    chapterKeyboardIndex = Math.max(0, Math.min(lis.length - 1, chapterKeyboardIndex + delta));

    clearChapterKeyboardSelection();
    lis[chapterKeyboardIndex].classList.add("kbd-active");
    lis[chapterKeyboardIndex].scrollIntoView({ block: "nearest" });
  }

  function enterChapter() {
    const lis = getChapterLis();
    const li = lis[chapterKeyboardIndex];
    if (!li) return;

    const link = li.querySelector("a");
    if (link?.href) location.href = link.href;
  }


  // =========================
  // Fullscreen 跨章節恢復（導覽後需要 user gesture）
  // =========================
  const FS_KEY = "reader:shouldRestoreFullscreen";

  function markFullscreenForNextPage() {
    sessionStorage.setItem(FS_KEY, "1");
  }

  function consumeFullscreenRestoreFlag() {
    const should = sessionStorage.getItem(FS_KEY) === "1";
    sessionStorage.removeItem(FS_KEY);
    return should;
  }

  // 在新章節頁載入後：等第一次「使用者操作」再恢復 fullscreen
  function setupFullscreenRestoreOnFirstGesture() {
    if (!consumeFullscreenRestoreFlag()) return;

    const tryRestore = async () => {
      try {
        // 如果已經是 fullscreen 就不用做
        if (document.fullscreenElement) return;
        await document.documentElement.requestFullscreen();
      } catch (e) {
        // 失敗就算了（有些瀏覽器限制更嚴）
      } finally {
        window.removeEventListener("keydown", tryRestoreOnce, true);
        window.removeEventListener("pointerdown", tryRestoreOnce, true);
      }
    };

    const tryRestoreOnce = (e) => {
      // 任意一次 gesture 觸發即可
      tryRestore();
    };

    // capture:true 讓它最早拿到手勢
    window.addEventListener("keydown", tryRestoreOnce, true);
    window.addEventListener("pointerdown", tryRestoreOnce, true);

    // （可選）給個提示：你也可以用 showHint 顯示「按 F 返回全螢幕」
    // showHint(`<p class="paragraph">按 F 返回全螢幕</p>`, 1200);
  }




  // =========================
  // 鍵盤快捷鍵：翻頁
  // =========================
  function nextPage() {
    goPage("next");
  }

  function prevPage() {
    goPage("prev");
  }

  document.addEventListener("keydown", function (event) {
    if (["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;

    // ✅ 全域：F11（不管目錄開不開都可以切全螢幕）
    if (event.code === "F11") {
      event.preventDefault();
      toggleFullscreen();
      return;
    }

    // ✅ 全域功能鍵（不管目錄開不開都可以用）
    switch (event.key) {
      case "m": case "M":
        event.preventDefault();
        toggleControlBar();
        return;

      case "f": case "F":
        event.preventDefault();
        toggleFullscreen();
        return;

      case "p": case "P":
        event.preventDefault();
        togglePageMode();
        return;

      case "l": case "L":
        event.preventDefault();
        toggleChapterList(); // 開/關
        return;
    }

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
        case "l": case "L":
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

      }
    }
  });



  // =========================
  // 全螢幕切換 + icon 切換
  // =========================
  fullscreenBtn.addEventListener("click", () => {
    toggleFullscreen();
  });



  // 初始渲染
  loadReaderState();
  setupFullscreenRestoreOnFirstGesture();
  renderPage();
  applyTransform();
}


// 禁止右鍵與拖曳
document.addEventListener("contextmenu", e => { if(e.target.tagName==="IMG") e.preventDefault(); });
document.addEventListener("dragstart", e => { if(e.target.tagName==="IMG") e.preventDefault(); });


