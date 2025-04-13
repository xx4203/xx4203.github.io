document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.getElementById("carousel");
  const dotsContainer = document.getElementById("dots");
  const images = carousel.querySelectorAll("img");
  const leftArrow = document.querySelector(".carousel-arrow.left");
  const rightArrow = document.querySelector(".carousel-arrow.right");

  let currentIndex = 0;

  // 產生小白點
  images.forEach((_, index) => {
    const dot = document.createElement("button");
    if (index === 0) dot.classList.add("active");
    dot.addEventListener("click", () => scrollToImage(index));
    dotsContainer.appendChild(dot);
  });

  function scrollToImage(index) {
    const image = images[index];
    carousel.scrollTo({
      left: image.offsetLeft - carousel.offsetLeft,
      behavior: "smooth",
    });
    updateDots(index);
    currentIndex = index;
    updateArrows();
  }

  function updateDots(index) {
    dotsContainer.querySelectorAll("button").forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  function updateArrows() {
    if (!leftArrow || !rightArrow) return;
    leftArrow.style.display = currentIndex === 0 ? "none" : "block";
    rightArrow.style.display = currentIndex === images.length - 1 ? "none" : "block";
  }

  carousel.addEventListener("scroll", () => {
    let closest = 0;
    let closestDistance = Infinity;
    images.forEach((img, i) => {
      const distance = Math.abs(
        carousel.scrollLeft + carousel.offsetWidth / 2 - (img.offsetLeft + img.offsetWidth / 2)
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = i;
      }
    });
    if (closest !== currentIndex) {
      updateDots(closest);
      currentIndex = closest;
      updateArrows();
    }
  });

  leftArrow?.addEventListener("click", () => {
    if (currentIndex > 0) {
      scrollToImage(currentIndex - 1);
    }
  });

  rightArrow?.addEventListener("click", () => {
    if (currentIndex < images.length - 1) {
      scrollToImage(currentIndex + 1);
    }
  });

  // 初始箭頭狀態
  updateArrows();
});