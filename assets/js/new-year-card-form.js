function initFormLogic() {
  // 切換 IG 欄位
  const radioButtons = document.querySelectorAll('input[name="索取or交換"]');
  const instagramWrapper = document.getElementById("q3-instagram-wrapper");

  function toggleInstagramField() {
    const selectedValue = document.querySelector('input[name="索取or交換"]:checked')?.value;
    if (selectedValue === "交換") {
      instagramWrapper.classList.add("show");
    } else {
      instagramWrapper.classList.remove("show");
    }
  }

  if (radioButtons.length && instagramWrapper) {
    toggleInstagramField();
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", toggleInstagramField);
    });
  }

  // 已填寫欄位改變顏色
  const inputFields = document.querySelectorAll("input, textarea");
  inputFields.forEach((input) => {
    if (input.value.trim() !== "") {
      input.classList.add("filled");
    }

    input.addEventListener("input", () => {
      if (input.value.trim() !== "") {
        input.classList.add("filled");
      } else {
        input.classList.remove("filled");
      }
    });
  });
}

// 換主色 & Logo（僅限 new-year-card.html）
const isNewYearCardPage = window.location.pathname.includes('new-year-card.html');
if (isNewYearCardPage) {
  document.documentElement.style.setProperty('--accent-color', '#ff5517');
  const logo = document.getElementById('site-logo');
  if (logo) {
    logo.src = '/assets/images/header/DanLo(xx4203)_logo_OrangeLine.svg';
  }
}

// iframe onload 送出後觸發的函式
function formSubmitted() {
  console.log("表單已送出（iframe onload）");
  const form = document.getElementById("myForm");
  form.querySelector(".form-fields").style.display = "none";
  form.querySelector(".success-message").style.display = "block";
}

// DOM Ready 後的行為
document.addEventListener("DOMContentLoaded", () => {
  // 初始化邏輯
  initFormLogic();

  // 成功畫面中的返回按鈕
  const backButton = document.getElementById("backButton");
  if (backButton) {
    backButton.addEventListener("click", () => {
      const form = document.getElementById("myForm");
      form.querySelector(".form-fields").style.display = "block";
      form.querySelector(".success-message").style.display = "none";
      form.reset();
    });
  }
});
