document.addEventListener('DOMContentLoaded', () => {

    // --- Sabitler ve Değişkenler ---
    const HOUR_24 = 24 * 60 * 60 * 1000;
    const ITEMS_PER_PAGE = 6;
    let currentPage = 1;
    let currentCategory = 'anasayfa';
    let currentSearchQuery = '';
    let currentSortBy = 'date-desc';

    // --- HTML Elementleri Seçme ---
    const newsContainer = document.getElementById('newsContainer');
    const pageTitle = document.getElementById('pageTitle');
    const navLinks = document.querySelectorAll('[data-category]');
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const paginationContainer = document.getElementById('pagination');
    const loadingSpinner = document.getElementById('loading');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const currencyRatesContainer = document.querySelector('.currency-rates');
    
    // Sayfa kimliğini kontrol etme
    const isIndexPage = document.body.id === 'index-page';
    const isArticlePage = document.body.id === 'article-page';

    // --- Gece Modu Fonksiyonları ---
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
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('dark-mode')) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });
    }
    
    // --- Haberleri Yerel Depolamadan Alma ---
    function getFreshNews() {
        let allNews = JSON.parse(localStorage.getItem('newsData')) || [];
        const currentTime = Date.now();
        return allNews.filter(item => (currentTime - item.timestamp) < HOUR_24);
    }
    
    // --- Haber Kartı Oluşturma (Ana Sayfa İçin) ---
    function createNewsCard(newsItem) {
        const imageHtml = newsItem.image ? `<img src="${newsItem.image}" alt="Haber görseli" class="news-image">` : '';
        return `
            <article class="news-card">
                ${imageHtml}
                <div class="news-content">
                    <h2 class="news-title">${newsItem.title}</h2>
                    <p class="news-excerpt">${newsItem.excerpt}</p>
                    <a href="article.html?id=${newsItem.id}" class="read-more">Devamını Oku</a>
                </div>
            </article>
        `;
    }

    // --- Haberleri Ekranda Gösterme Fonksiyonu (Sadece ana sayfa için) ---
    function displayNews(category, searchQuery, sortBy, page) {
        if (!isIndexPage) return;

        let newsToDisplay = getFreshNews();
        if (category !== 'anasayfa') {
            newsToDisplay = newsToDisplay.filter(item => item.category === category);
        }

        if (loadingSpinner) {
            loadingSpinner.style.display = 'flex';
        }
        if (newsContainer) {
            newsContainer.innerHTML = '';
        }
        if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            newsToDisplay = newsToDisplay.filter(item => 
                item.title.toLowerCase().includes(query) ||
                item.excerpt.toLowerCase().includes(query)
            );
        }

        newsToDisplay.sort((a, b) => {
            if (sortBy === 'date-desc') {
                return b.timestamp - a.timestamp;
            } else if (sortBy === 'date-asc') {
                return a.timestamp - b.timestamp;
            } else if (sortBy === 'title-asc') {
                return a.title.localeCompare(b.title);
            } else if (sortBy === 'title-desc') {
                return b.title.localeCompare(a.title);
            }
        });

        const totalPages = Math.ceil(newsToDisplay.length / ITEMS_PER_PAGE);
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pagedNews = newsToDisplay.slice(startIndex, endIndex);
        
        setTimeout(() => {
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
            if (pagedNews.length === 0) {
                if (newsContainer) {
                    newsContainer.innerHTML = `<p style="text-align: center; font-size: 1.2rem; color: var(--secondary-color);">Henüz yayınlanmış bir haber bulunmamaktadır. Lütfen <a href="admin.html">admin panelinden</a> haber ekleyin.</p>`;
                }
            } else {
                if (newsContainer) {
                    pagedNews.forEach(item => {
                        newsContainer.innerHTML += createNewsCard(item);
                    });
                }
            }
            renderPagination(totalPages);
        }, 500);

        if (pageTitle) {
            pageTitle.textContent = category === 'anasayfa' ? "En Son Haberler" : category.charAt(0).toUpperCase() + category.slice(1);
        }
    }
    
    // --- Sayfalama Fonksiyonu (Sadece ana sayfa için) ---
    function renderPagination(totalPages) {
        if (totalPages <= 1 || !paginationContainer) return;
        
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.addEventListener('click', () => {
                currentPage = i;
                displayNews(currentCategory, currentSearchQuery, currentSortBy, currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Sayfa başına kaydır
            });
            paginationContainer.appendChild(btn);
        }
    }

    // --- Haber Detay Sayfası için İşlevsellik ---
    function displayArticle() {
        if (!isArticlePage) return;
        
        const params = new URLSearchParams(window.location.search);
        const newsId = parseInt(params.get('id'));
        const allNews = JSON.parse(localStorage.getItem('newsData')) || [];
        const newsItem = allNews.find(item => item.id === newsId);

        if (loadingSpinner) {
            loadingSpinner.style.display = 'flex';
        }

        setTimeout(() => {
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
            const newsArticleContainer = document.getElementById('newsArticle');
            if (!newsItem || !newsArticleContainer) {
                newsArticleContainer.innerHTML = '<p class="error-message">Haber bulunamadı. Lütfen Arşiv\'den kontrol edin.</p>';
                document.getElementById('articleTitle').textContent = 'Hata';
                return;
            }

            const pageUrl = window.location.href;
            const articleContentHtml = `
                <div class="article-header">
                    <h1 class="article-title">${newsItem.title}</h1>
                    <div class="article-meta">
                        <span class="article-date">${new Date(newsItem.timestamp).toLocaleDateString()}</span>
                        <span class="article-category"> | ${newsItem.category.charAt(0).toUpperCase() + newsItem.category.slice(1)}</span>
                    </div>
                </div>
                ${newsItem.image ? `<img src="${newsItem.image}" alt="${newsItem.title}" class="article-image">` : ''}
                <div class="article-body">
                    <p class="article-excerpt">${newsItem.excerpt}</p>
                    <p class="article-content">${newsItem.content}</p>
                </div>
                <div class="social-share">
                    <span class="share-text">Paylaş:</span>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}" target="_blank" class="share-btn facebook-btn" aria-label="Facebook'ta Paylaş">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(newsItem.title)}" target="_blank" class="share-btn twitter-btn" aria-label="Twitter'da Paylaş">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="https://wa.me/?text=${encodeURIComponent(newsItem.title + " " + pageUrl)}" target="_blank" class="share-btn whatsapp-btn" aria-label="WhatsApp'ta Paylaş">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                </div>
            `;
            newsArticleContainer.innerHTML = articleContentHtml;
            document.getElementById('articleTitle').textContent = newsItem.title;

        }, 500);
    }

    // --- Navigasyon Olay Dinleyicileri (Tüm sayfalar için) ---
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if(isIndexPage && link.getAttribute('data-category')){
                    e.preventDefault();
                    currentCategory = link.getAttribute('data-category');
                    currentPage = 1;
                    displayNews(currentCategory, currentSearchQuery, currentSortBy, currentPage);
                    
                    navLinks.forEach(item => item.classList.remove('active'));
                    link.classList.add('active');
                }

                if (nav && menuToggle) {
                    if (nav.classList.contains('active')) {
                         nav.classList.remove('active');
                         menuToggle.classList.remove('open');
                    }
                }
            });
        });
    }

    // --- Diğer Olay Dinleyicileri (Sadece ana sayfa için) ---
    if (isIndexPage) {
        const initialUrlParams = new URLSearchParams(window.location.search);
        const initialCategory = initialUrlParams.get('category') || 'anasayfa';
        currentCategory = initialCategory;
        displayNews(currentCategory, currentSearchQuery, currentSortBy, currentPage);
        
        const activeLink = document.querySelector(`.nav-list [data-category="${initialCategory}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchQuery = e.target.value;
                currentPage = 1;
                displayNews(currentCategory, currentSearchQuery, currentSortBy, currentPage);
            });
        }
    
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSortBy = e.target.value;
                currentPage = 1;
                displayNews(currentCategory, currentSearchQuery, currentSortBy, currentPage);
            });
        }
    }
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });
    }

    // --- Döviz Kuru Özelliği ---
    const fetchCurrencyRates = async () => {
        const apiUrl = 'https://api.frankfurter.app/latest?from=TRY';

        const usdRateElement = document.getElementById('usdTryRate');
        const eurRateElement = document.getElementById('eurTryRate');
        const gbpRateElement = document.getElementById('gbpTryRate');

        if (!usdRateElement || !eurRateElement || !gbpRateElement) return;

        usdRateElement.textContent = '...';
        eurRateElement.textContent = '...';
        gbpRateElement.textContent = '...';

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Döviz kurları alınamadı.');
            }
            const data = await response.json();
            const rates = data.rates;

            const usdToTry = (1 / rates.USD).toFixed(2);
            const eurToTry = (1 / rates.EUR).toFixed(2);
            const gbpToTry = (1 / rates.GBP).toFixed(2);
            
            usdRateElement.textContent = `${usdToTry} ₺`;
            eurRateElement.textContent = `${eurToTry} ₺`;
            gbpRateElement.textContent = `${gbpToTry} ₺`;

        } catch (error) {
            console.error("Döviz kurları alınırken hata oluştu:", error);
            usdRateElement.textContent = 'Hata';
            eurRateElement.textContent = 'Hata';
            gbpRateElement.textContent = 'Hata';
        }
    };
    
    // Sayfa yüklendiğinde döviz kurlarını çek
    if (currencyRatesContainer) {
      fetchCurrencyRates();
    }

    // Sayfa kimliğine göre fonksiyonu çağır
    if(isIndexPage){
        const initialUrlParams = new URLSearchParams(window.location.search);
        const initialCategory = initialUrlParams.get('category') || 'anasayfa';
        currentCategory = initialCategory;
        displayNews(currentCategory, currentSearchQuery, currentSortBy, currentPage);
        const activeLink = document.querySelector(`.nav-list [data-category="${initialCategory}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    } else if (isArticlePage) {
        displayArticle();
    }
});

// --- PWA (Progressive Web App) Özellikleri ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker başarıyla kaydedildi:', registration);
      })
      .catch(error => {
        console.log('Service Worker kaydı başarısız:', error);
      });
  });
}