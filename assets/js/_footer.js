document.getElementById("copyEmail").addEventListener("click", function () {
    const textToCopy = "xox4203@gmail.com"; // 要複製的文字
    const icon = this;

    // 複製文字到剪貼簿
    navigator.clipboard.writeText(textToCopy).then(() => {
        // 變更 icon 為 copy icon
        icon.classList.remove("bi-envelope");
        icon.classList.add("bi-copy");

        // 0.5 秒後變回 envelope icon
        setTimeout(() => {
            icon.classList.remove("bi-copy");
            icon.classList.add("bi-envelope");
        }, 500);
    }).catch(err => {
        console.error("複製失敗:", err);
    });
});



const links = document.querySelectorAll('a');
links.forEach(link => {
  if (!link.classList.contains('nav-link')) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }
});