// 漫畫資料
const mangaList = [
    { title: "請不要這樣", 
      cover: "/assets/images/manga/202009_請不要這樣/cover.png", 
      year: 2020, pages: 2, 
      url: "/pages/manga/202009_請不要這樣.html" ,
      images: [
      "/assets/images/manga/202009_請不要這樣/01.png",
      "/assets/images/manga/202009_請不要這樣/02.png"
    ]
    },
    { title: "沒有人要吃的榴槤", 
      cover: "/assets/images/manga/202107_沒有人要吃的榴槤/cover.png", 
      year: 2021, pages: 2, 
      url: "/assets/images/manga/202107_沒有人要吃的榴槤/p01.png" 
    },
    { title: "花海", 
      cover: "/assets/images/manga/202108_目珠/cover.png", 
      year: 2021, pages: 3, 
      url: "/assets/images/manga/202108_目珠/cover.png" 
    },
    { title: "目珠", 
      cover: "/assets/images/manga/202108_花海/cover.png", 
      year: 2021, pages: 3, 
      url: "/assets/images/manga/202108_花海/cover.png" 
    },
    { title: "WINGS", 
      cover: "/assets/images/manga/202112_WINGS/cover.png", 
      year: 2021, pages: 3, 
      url: "/assets/images/manga/202112_WINGS/cover.png" 
    },
    { title: "春分", 
      cover: "/assets/images/manga/202203_春分/cover.png", 
      year: 2022, pages: 3, 
      url: "/assets/images/manga/202203_春分/cover.png" 
    },
    { title: "有祕密的寵物們", 
        cover: "/assets/images/manga/202207_有祕密的寵物們/cover.png", 
        year: 2022, pages: 4, 
        url: "/assets/images/manga/202207_有祕密的寵物們/cover.png" 
    },
    { title: "頂樓加蓋", 
      cover: "/assets/images/manga/202208_頂樓加蓋/cover.png", 
      year: 2022, pages: 2, 
      url: "/assets/images/manga/202208_頂樓加蓋/cover.png" 
    },
    { title: "啪嚓", 
      cover: "/assets/images/manga/202209_啪嚓/cover.png", 
      year: 2022, pages: 2, 
      url: "/assets/images/manga/202209_啪嚓/cover.png" 
    },
    { title: "無聲的存在", 
      cover: "/assets/images/manga/202303_無聲的存在/cover.png", 
      year: 2023, pages: 4, 
      url: "/assets/images/manga/202303_無聲的存在/cover.png" 
    },
    { title: "雨天", 
      cover: "/assets/images/manga/202301_雨天/cover.png", 
      year: 2023, pages: 11, 
      url: "/assets/images/manga/202301_雨天/cover.png" 
    },
    { title: "週末", 
      cover: "/assets/images/manga/202404_週末/cover.png", 
      year: 2024, pages: 4, 
      url: "/assets/images/manga/202404_週末/cover.png" 
    }
  ];
  
  // 動態產生 Swiper 結構
  const swiperWrapper = document.querySelector(".swiper-wrapper");
  swiperWrapper.innerHTML = mangaList
  .map(
    (m, i) => `
      <div class="swiper-slide">
        <img src="${m.cover}" alt="${m.title}" data-index="${i}">
      </div>
    `
  )
  .join("");

// 點擊 → 開啟閱讀頁
document.querySelectorAll(".swiper-slide img").forEach((img) => {
  img.addEventListener("click", () => {
    const idx = img.dataset.index;
    window.open(mangaList[idx].url, "_blank");
  });
});
  
  // 更新資訊的容器
  const infoBox = document.querySelector(".manga-info");
  
  // 更新漫畫資訊
  function updateInfo(i) {
    const m = mangaList[i];
    infoBox.innerHTML = `
      <h3>${m.title}</h3>
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
  