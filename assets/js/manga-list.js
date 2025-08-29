// 漫畫資料
const mangaList = [
    { title: "漫畫A", 
      cover: "/assets/images/new-year-card/2025/img01.jpg", 
      year: 2021, pages: 15, 
      url: "a-reader.html" 
    },
    { title: "漫畫B", 
      cover: "/assets/images/new-year-card/2025/img02.jpg", 
      year: 2022, pages: 20, 
      url: "b-reader.html" 
    },
    { title: "漫畫C", 
      cover: "/assets/images/new-year-card/2025/img03.jpg", 
      year: 2023, pages: 12, 
      url: "c-reader.html" 
    },
    { title: "漫畫D", 
      cover: "/assets/images/new-year-card/2025/img02.jpg", 
      year: 2024, pages: 18, 
      url: "d-reader.html" 
    },
    { title: "漫畫E", 
      cover: "/assets/images/new-year-card/2025/img03.jpg", 
      year: 2025, pages: 10, 
      url: "e-reader.html" 
    },
    { title: "漫畫F", 
        cover: "/assets/images/new-year-card/2025/img01.jpg", 
        year: 2021, pages: 15, 
        url: "a-reader.html" 
      },
      { title: "漫畫G", 
        cover: "/assets/images/new-year-card/2025/img02.jpg", 
        year: 2022, pages: 20, 
        url: "b-reader.html" 
      },
      { title: "漫畫H", 
        cover: "/assets/images/new-year-card/2025/img03.jpg", 
        year: 2023, pages: 12, 
        url: "c-reader.html" 
      },
      { title: "漫畫I", 
        cover: "/assets/images/new-year-card/2025/img02.jpg", 
        year: 2024, pages: 18, 
        url: "d-reader.html" 
      },
      { title: "漫畫J", 
        cover: "/assets/images/new-year-card/2025/img03.jpg", 
        year: 2025, pages: 10, 
        url: "e-reader.html" 
      }
  ];
  
  // 動態產生 Swiper 結構
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  swiperWrapper.innerHTML = mangaList
    .map(
      (m) => `
      <div class="swiper-slide">
        <img src="${m.cover}" alt="${m.title}">
      </div>
    `
    )
    .join("");
  
  // 更新資訊的容器
  const infoBox = document.querySelector(".manga-info");
  
  // 更新漫畫資訊
  function updateInfo(i) {
    const m = mangaList[i];
    infoBox.innerHTML = `
      <h1>${m.title}</h1>
      <p>${m.year}｜${m.pages} 頁</p>
    `;
  }
  
  // 預設顯示「最新的作品」（最後一筆）
  updateInfo(mangaList.length - 1);
  
  // 初始化 Swiper（合併官方效果設定）
  const swiper = new Swiper(".mySwiper", {
    effect: "cards",
    grabCursor: true,
    loop: true,
    initialSlide: mangaList.length - 1, // 預設從最新的漫畫開始
    speed: 400,
    cardsEffect: {
      perSlideOffset: 9,
      perSlideRotate: 2,
    },
    on: {
      init: function () {
        updateInfo(this.realIndex);
      },
      slideChange: function () {
        updateInfo(this.realIndex);
      }
    }
  });
  
  // 點擊圖片 → 開啟閱讀頁面
  document.querySelectorAll(".swiper-slide img").forEach((img, index) => {
    img.addEventListener("click", () => {
      window.open(mangaList[index].url, "_blank");
    });
  });
  