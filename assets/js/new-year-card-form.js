function initFormLogic() {
  // 切換 IG 欄位
  const radioButtons = document.querySelectorAll('input[name="entry.306163396"]');
  const instagramWrapper = document.getElementById("q3-instagram-wrapper");
  
  function toggleInstagramField() {
    const selectedValue = document.querySelector('input[name="entry.306163396"]:checked')?.value;
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


// =========================
// 更換 new-year-card.html 頁面 accent-color
// =========================
const isNewYearCardPage = window.location.pathname.includes('new-year-card.html');
if (isNewYearCardPage) {
  document.documentElement.style.setProperty('--accent-color', '#ff5517');
  const logo = document.getElementById('site-logo');
}


// =========================
//表單送出成功訊息
// =========================
function formSubmitted() {
  const form = document.getElementById("myForm");
  const success = form.querySelector(".success-message");
  const fields = form.querySelector(".form-fields");

  // 隱藏原本表單欄位
  fields.style.display = "none";

  // 顯示成功訊息，套用動畫類別
  success.classList.add("show");

  // 綁定返回按鈕
  document.getElementById("backButton").addEventListener("click", function () {
    fields.style.display = "block";
    success.classList.remove("show");
    form.reset();
  });
}