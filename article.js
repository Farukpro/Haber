document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = parseInt(urlParams.get('id'));

    const articleTitle = document.getElementById('articleTitle');
    const articleHeading = document.getElementById('article-heading');
    const articleDate = document.getElementById('article-date');
    const articleImage = document.getElementById('article-image');
    const articleContent = document.getElementById('article-content');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const shareTwitter = document.getElementById('shareTwitter');
    const shareFacebook = document.getElementById('shareFacebook');
    const shareWhatsapp = document.getElementById('shareWhatsapp');

    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
    if (localStorage.getItem('theme') === 'dark') {
        enableDarkMode();
    }
    darkModeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });

    const newsData = JSON.parse(localStorage.getItem('newsData')) || [];
    const newsItem = newsData[newsId];

    if (newsItem) {
        articleTitle.textContent = newsItem.title;
        articleHeading.textContent = newsItem.title;
        
        const date = new Date(newsItem.timestamp);
        const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
        articleDate.textContent = `Yayınlanma Tarihi: ${formattedDate}`;

        if (newsItem.image) {
            articleImage.src = newsItem.image;
            articleImage.style.display = 'block';
        } else {
            articleImage.style.display = 'none';
        }

        articleContent.textContent = newsItem.content;
        
        const articleUrl = window.location.href;
        const articleText = newsItem.title;

        shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(articleText)}&url=${encodeURIComponent(articleUrl)}`;
        shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
        shareWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(articleText + " " + articleUrl)}`;

    } else {
        articleTitle.textContent = 'Haber Bulunamadı';
        articleHeading.textContent = 'Haber Bulunamadı';
        articleContent.innerHTML = '<p>Aradığınız haber mevcut değil veya silinmiş.</p>';
    }
});