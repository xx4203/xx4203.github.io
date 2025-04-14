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


const isNewYearCardPage = window.location.pathname.includes('new-year-card.html');

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


//

//連結 Google Script
function handleSubmit(event) {
  event.preventDefault(); // 防止預設送出

  const form = document.getElementById("myForm");
  const successMessage = document.querySelector(".success-message");
  const submitButton = document.getElementById("submit");

  // 表單資料轉為 URL 編碼
  const formData = new FormData(form);
  const data = new URLSearchParams();
  formData.forEach((value, key) => {
    data.append(key, value);
  });

  // 送出到 Apps Script
  fetch(form.action, {
    method: "POST",
    body: data,
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.result === "success") {
        form.reset(); // 清空表單
        form.classList.add("hidden");
        successMessage.classList.add("show");
      } else {
        alert("送出失敗，請稍後再試！");
      }
    })
    .catch((error) => {
      console.error("送出錯誤:", error);
      alert("送出失敗，請稍後再試！");
    });
}

// 成功畫面中返回按鈕
function formSubmitted() {
  // iframe onload 後觸發
  console.log("表單已送出（iframe onload）");
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("backButton")
    .addEventListener("click", () => {
      document.querySelector(".success-message").classList.remove("show");
      document.getElementById("myForm").classList.remove("hidden");
    });
});