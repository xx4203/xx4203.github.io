// 讀取漫畫資料庫 JSON
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

    

    //低畫質版本路徑
    function getLowResPath(path) {
      return path.replace(/(\.\w+)$/, '-low$1'); // xxx.png → xxx-low.png
    }

    // 動態產生 Swiper 結構
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

    // 低畫質載完後再替換高畫質
    document.querySelectorAll(".progressive-cover").forEach((img) => {
      const highRes = new Image();
      highRes.src = img.dataset.highres;
      highRes.onload = () => {
        img.src = highRes.src;
        img.classList.add("loaded"); // 用 CSS 淡入
      };
    });

    // 更新資訊的容器
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

    // 點擊圖片 → 開啟閱讀頁
    document.querySelectorAll(".swiper-slide img").forEach((img) => {
      img.addEventListener("click", () => {
        const idx = img.dataset.index;
        const m = mangaList[idx];
        const chapterUrl = `/pages/manga/chapter.html#${m.workSlug}/${m.slug}`;
        window.open(chapterUrl, "_blank");
      });
    });

    // 預設顯示最後一筆
    updateInfo(mangaList.length - 1);
  })
  .catch(err => console.error("載入漫畫 JSON 失敗:", err));
