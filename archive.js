document.addEventListener('DOMContentLoaded', () => {
    const archiveContainer = document.getElementById('archiveContainer');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const paginationContainer = document.getElementById('pagination');

    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;

    // Haber kartı oluşturma fonksiyonu
    function createNewsCard(newsItem) {
        return `
            <div class="news-card">
                ${newsItem.image ? `<img src="${newsItem.image}" alt="${newsItem.title}" class="news-image">` : ''}
                <div class="news-content">
                    <h3 class="news-title">${newsItem.title}</h3>
                    <p class="news-excerpt">${newsItem.excerpt}</p>
                    <a href="article.html?id=${newsItem.id}" class="read-more">Devamını Oku</a>
                </div>
            </div>
        `;
    }

    // Haberleri arşiv sayfasına render etme
    function renderArchiveNews(newsToDisplay) {
        archiveContainer.innerHTML = '';
        if (newsToDisplay.length === 0) {
            archiveContainer.innerHTML = '<p class="no-results">Arşivde bu kritere uygun haber bulunamadı.</p>';
            return;
        }

        newsToDisplay.forEach(news => {
            archiveContainer.innerHTML += createNewsCard(news);
        });
    }

    // Sayfalama butonlarını oluşturma
    function setupPagination(newsData) {
        paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(newsData.length / ITEMS_PER_PAGE);

        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            btn.innerText = i;
            btn.addEventListener('click', () => {
                currentPage = i;
                displayPage(newsData);
            });
            paginationContainer.appendChild(btn);
        }
    }

    // Sayfayı gösterme
    function displayPage(newsData) {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedNews = newsData.slice(start, end);
        renderArchiveNews(paginatedNews);
        setupPagination(newsData);
    }

    // Filtreleme ve sıralama fonksiyonu
    function applyFilters() {
        const allNewsData = JSON.parse(localStorage.getItem('newsData')) || [];
        let filteredNews = [...allNewsData];
        
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredNews = filteredNews.filter(news => news.title.toLowerCase().includes(searchTerm) || news.excerpt.toLowerCase().includes(searchTerm));
        }

        const sortBy = sortSelect.value;
        switch (sortBy) {
            case 'date-asc':
                filteredNews.sort((a, b) => a.timestamp - b.timestamp);
                break;
            case 'date-desc':
                filteredNews.sort((a, b) => b.timestamp - a.timestamp);
                break;
            case 'title-asc':
                filteredNews.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                filteredNews.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }

        currentPage = 1;
        displayPage(filteredNews);
    }

    // Olay dinleyicileri
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }
    
    // Sayfa yüklendiğinde haberleri çek
    applyFilters();
});