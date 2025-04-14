// main.js

// 判斷當前 HTML 是否在 pages 子資料夾內
// const basePath = window.location.pathname.includes("pages") ? "../" : "";
const rootPath = location.hostname.includes("github.io")
  ? "https://xx4203.com" // GitHub Pages 的自訂網域
  : "";

// 動態載入其他 components 和他的 JS
document.addEventListener("DOMContentLoaded", function () {
    // 如果之後還有其他要載入，可以在這裡新增 loadComponent
    loadComponent("header", `${rootPath}components/header.html`, [
        { type: "js", url: `${rootPath}assets/js/_header.js` }
    ]);

    loadComponent("footer", `${rootPath}components/footer.html`, [
        { type: "js", url: `${rootPath}assets/js/_footer.js` }
    ]);

    loadComponent("NewYearCard-form", `${rootPath}components/NewYearCard-form.html`, [
        { type: "js", url: `${rootPath}assets/js/_NewYearCard-form.js` }
      ], () => {
        // 載入完成後呼叫初始化
        if (typeof initFormLogic === "function") {
          initFormLogic();
        }
    });
});


/**
 * 動態載入 HTML 和 JS
 * @param {string} containerId - 放置 Component 的 <div> ID
 * @param {string} htmlPath - HTML 檔案路徑
 * @param {Array} assets - JS 檔案列表
 */
function loadComponent(containerId, htmlPath, assets) {
    fetch(htmlPath)
      .then(response => response.text())
      .then(data => {
        document.getElementById(containerId).innerHTML = data;
        
        // 載入 JS，並在載入完成後初始化
        loadScripts(assets, () => {
          if (containerId === "NewYearCard-form" && typeof initFormLogic === "function") {
            initFormLogic();  // _NewYearCard-form.js 裡 export 的函式
          }
        });
      })
      .catch(error => console.error(`Error loading ${htmlPath}:`, error));
  }
  
  function loadScripts(files, callback) {
    let loaded = 0;
    const total = files.length;
  
    files.forEach(file => {
      if (file.type === "js") {
        const script = document.createElement("script");
        script.src = file.url;
        script.defer = true;
        script.onload = () => {
          loaded++;
          if (loaded === total && callback) callback();
        };
        document.body.appendChild(script);
      }
    });
}


// 除了 nav-link 連結，其他都新分頁開啟

document.addEventListener('DOMContentLoaded', function () {
    // 載入 footer.html
    fetch('components/footer.html')
      .then(response => response.text())
      .then(data => {
        // 將 footer 內容插入到對應的 DOM 元素中
        document.getElementById('footer').innerHTML = data;
  
        // 確保 footer 載入後，再修改所有 <a> 標籤的 target 屬性
        const links = document.querySelectorAll('footer a');
        links.forEach(link => {
          if (!link.classList.contains('nav-link')) {  // 排除 .nav-link 類別
            link.setAttribute('target', '_blank');    // 設定新分頁開啟
            link.setAttribute('rel', 'noopener noreferrer'); // 增加安全性
          }
        });
      })
      .catch(error => console.error('Error loading footer:', error));
  });