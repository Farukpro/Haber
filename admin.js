document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('newsForm');
    const newsIdInput = document.getElementById('newsId');
    const newsTitleInput = document.getElementById('newsTitle');
    const newsExcerptInput = document.getElementById('newsExcerpt');
    const newsImageFileInput = document.getElementById('newsImageFile');
    const newsImageUrlInput = document.getElementById('newsImageUrl');
    const newsContentInput = document.getElementById('newsContent');
    const newsCategorySelect = document.getElementById('newsCategory');
    const submitBtn = document.getElementById('submitBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const messageElement = document.getElementById('message');
    const newsList = document.getElementById('newsList');
    const filterInput = document.getElementById('filterInput');
    const noResultsElement = document.getElementById('noResults');

    let newsData = JSON.parse(localStorage.getItem('newsData')) || [];

    // Mevcut haberleri ekranda listeleme
    function renderNewsList(filterQuery = '') {
        const filteredNews = newsData.filter(news =>
            news.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
            news.excerpt.toLowerCase().includes(filterQuery.toLowerCase())
        );

        newsList.innerHTML = '';
        if (filteredNews.length === 0) {
            noResultsElement.style.display = 'block';
        } else {
            noResultsElement.style.display = 'none';
            filteredNews.forEach(news => {
                const li = document.createElement('li');
                li.className = 'admin-news-item';
                li.innerHTML = `
                    <div class="item-info">
                        <strong>${news.title}</strong>
                        <span class="item-date">${new Date(news.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" data-id="${news.id}"><i class="fas fa-edit"></i> Düzenle</button>
                        <button class="delete-btn" data-id="${news.id}"><i class="fas fa-trash-alt"></i> Sil</button>
                    </div>
                `;
                newsList.appendChild(li);
            });
        }
    }

    // Formu temizleme
    function clearForm() {
        form.reset();
        newsIdInput.value = '';
        submitBtn.textContent = 'Haberi Ekle';
        newsImageFileInput.value = ''; // Dosya inputunu temizle
        newsImageUrlInput.value = ''; // URL inputunu temizle
    }
    
    // Haber ekleme/düzenleme formu
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let newsImage = '';
        if (newsImageFileInput.files.length > 0) {
            // Dosyayı Base64'e dönüştür
            newsImage = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(newsImageFileInput.files[0]);
            });
        } else {
            newsImage = newsImageUrlInput.value;
        }

        const newNews = {
            id: newsIdInput.value ? parseInt(newsIdInput.value) : Date.now(),
            title: newsTitleInput.value,
            excerpt: newsExcerptInput.value,
            image: newsImage,
            content: newsContentInput.value,
            category: newsCategorySelect.value,
            timestamp: Date.now()
        };

        if (newsIdInput.value) {
            // Düzenleme
            const newsIndex = newsData.findIndex(news => news.id === parseInt(newsIdInput.value));
            if (newsIndex !== -1) {
                newsData[newsIndex] = newNews;
                messageElement.textContent = 'Haber başarıyla güncellendi!';
                messageElement.style.color = 'green';
            }
        } else {
            // Ekleme
            newsData.unshift(newNews);
            messageElement.textContent = 'Haber başarıyla eklendi!';
            messageElement.style.color = 'green';
        }

        localStorage.setItem('newsData', JSON.stringify(newsData));
        clearForm();
        renderNewsList();

        setTimeout(() => {
            messageElement.textContent = '';
        }, 3000);
    });

    // Silme ve düzenleme butonları için olay dinleyicisi
    newsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn');
            const id = parseInt(btn.dataset.id);
            newsData = newsData.filter(news => news.id !== id);
            localStorage.setItem('newsData', JSON.stringify(newsData));
            renderNewsList(filterInput.value);
            messageElement.textContent = 'Haber başarıyla silindi.';
            messageElement.style.color = 'red';
            setTimeout(() => messageElement.textContent = '', 3000);
        } else if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const btn = e.target.closest('.edit-btn');
            const id = parseInt(btn.dataset.id);
            const newsToEdit = newsData.find(news => news.id === id);
            if (newsToEdit) {
                newsIdInput.value = newsToEdit.id;
                newsTitleInput.value = newsToEdit.title;
                newsExcerptInput.value = newsToEdit.excerpt;
                newsImageUrlInput.value = newsToEdit.image && !newsToEdit.image.startsWith('data:') ? newsToEdit.image : '';
                newsContentInput.value = newsToEdit.content;
                newsCategorySelect.value = newsToEdit.category;
                submitBtn.textContent = 'Değişiklikleri Kaydet';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // Filtreleme
    filterInput.addEventListener('input', (e) => {
        renderNewsList(e.target.value);
    });

    // Formu temizleme butonu
    clearFormBtn.addEventListener('click', clearForm);

    // Sayfa yüklendiğinde listeyi render et
    renderNewsList();
});