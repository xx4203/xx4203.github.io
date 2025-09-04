
// =========================
// 讀取漫畫資料庫 JSON
// =========================
fetch("/assets/js/manga-library.json")
  .then(res => res.json())
  .then(data => {
    // 展平成一個章節清單，並補上 workSlug
    const mangaList = [];
    data.forEach(work => {
      work.chapters.forEach(ch => {
        mangaList.push({
          ...ch,
          workSlug: work.slug, // 作品 slug
          slug: ch.slug        // 章節 slug
        });
      });
    });


    // =========================
    // // 動態產生 Swiper 結構
    // =========================
    const swiperWrapper = document.querySelector(".swiper-wrapper");
    swiperWrapper.innerHTML = mangaList
      .map(
        (m, i) => `
          <div class="swiper-slide">
            <img 
              src="${getLowResPath(m.cover)}" 
              data-highres="${m.cover}" 
              alt="${m.title}" 
              data-index="${i}"
              class="progressive-cover"
            >
          </div>
        `
      )
    .join("");


    // =========================
    // 載入cover檔案
    // =========================
    function getLowResPath(path) {
      return path.replace(/(\.\w+)$/, '-low$1');
    }

    const imgs = document.querySelectorAll(".progressive-cover");

    imgs.forEach((img) => {
      const src = img.dataset.highres;

      // 低畫質預設
      img.src = getLowResPath(src);

      // 建立 srcset
      const base = src.replace(/(\.\w+)$/, "");
      const ext = src.match(/(\.\w+)$/)[0];

      img.srcset = `
        ${base}-w480${ext} 480w,
        ${base}-w960${ext} 960w,
        ${base}-w1920${ext} 1920w,
        ${base}${ext} 3000w
      `;
    });

    // 更新 sizes 為 Swiper 容器寬度
    function updateImgSizes() {
      const swiperWidth = document.querySelector(".swiper").clientWidth;
      imgs.forEach(img => {
        img.sizes = `${swiperWidth}px`;
      });
    }

    // 初始化一次
    updateImgSizes();

    // 監聽視窗 resize
    window.addEventListener("resize", updateImgSizes);


    // =========================
    // 更新資訊的容器
    // =========================
    const infoBox = document.querySelector(".manga-info");

    function updateInfo(i) {
      const m = mangaList[i];
      infoBox.innerHTML = `
        <h3>${m.title}</h3>
        <p>${m.year}｜${m.pages} 頁</p>
      `;
    }

    // 初始化 Swiper
    const swiper = new Swiper(".mySwiper", {
      effect: "cards",
      grabCursor: true,
      loop: true,
      initialSlide: mangaList.length - 1, // 預設最後一章
      speed: 400,
      cardsEffect: { perSlideOffset: 9, perSlideRotate: 2 },
      on: {
        init: function () {
          updateInfo(this.realIndex);
        },
        slideChange: function () {
          updateInfo(this.realIndex);
        }
      }
    });

    // =========================
    // 點擊圖片 → 開啟閱讀頁
    // =========================
    document.querySelectorAll(".swiper-slide img").forEach((img) => {
      img.addEventListener("click", () => {
        const idx = img.dataset.index;
        const m = mangaList[idx];
        const chapterUrl = `/pages/manga/chapter.html#${m.workSlug}/${m.slug}`;
        window.open(chapterUrl, "_blank");
      });
    });

        
    // =========================
    // // 預設顯示最後一筆
    // =========================
    updateInfo(mangaList.length - 1);

  })
.catch(err => console.error("載入漫畫 JSON 失敗:", err));
