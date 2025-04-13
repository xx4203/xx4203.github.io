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
      // 初始化狀態（處理自動填入）
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


const isNewYearCardPage = window.location.pathname.includes('NewYearCard.html');

    if (isNewYearCardPage) {
    // 換主色
    document.documentElement.style.setProperty('--accent-color', '#ff5517');

    // 換 Logo 圖檔
    const logo = document.getElementById('site-logo');
    if (logo) {
        logo.src = '/assets/images/header/DanLo(xx4203)_logo_OrangeLine.svg'; // 換成其他 SVG 圖檔
    }
}


// 成功送出表單訊息

function formSubmitted() {
  if (typeof sent_redirect !== "undefined") {
    const form = document.getElementById("myForm");
    form.querySelector(".form-fields").style.display = "none";
    form.querySelector(".success-message").style.display = "block";
  }
}

document.getElementById("backButton").addEventListener("click", function () {
  const form = document.getElementById("myForm");
  form.querySelector(".form-fields").style.display = "block";
  form.querySelector(".success-message").style.display = "none";
  
  // 可選：清除表單欄位
  form.reset();
});

function handleSubmit(event) {
  event.preventDefault();

  const form = document.getElementById("myForm");
  const formData = new FormData(form);

  fetch("https://script.google.com/macros/s/XXXXX/exec", {
    method: "POST",
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // 顯示成功畫面，隱藏原本表單
        document.querySelector(".form-fields").style.display = "none";
        document.querySelector(".success-message").style.display = "block";
      }
    })
    .catch(error => {
      console.error("Error:", error);
    });
}