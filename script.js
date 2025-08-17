// Medya verileri (fotoğraf ve videolar)
const mediaItems = [];
const totalItems = 181;

// Medya verilerini oluştur
for (let i = 1; i <= totalItems; i++) {
    if (i === 41 || i == 42 || i == 61 || i == 82 || i == 143 || i == 144 || i == 148 || i == 159 || i == 173 || i == 176 || i == 180) {
        // Video öğesi
        mediaItems.push({
            id: i,
            type: 'video',
            url: `img/${i}.mp4`,
            thumbnail: 'thumbnails/thumbnail.jpeg',
            title: `Video ${i}`
        });
    } else {
        // Fotoğraf öğesi
        mediaItems.push({
            id: i,
            type: 'image',
            url: `img/${i}.webp`,
            thumbnail: `img/${i}.webp`,
            title: `Fotoğraf ${i}`
        });
    }
}

// DOM Elementleri
const galleryGrid = document.getElementById('gallery-grid');
const modal = document.getElementById('media-modal');
const modalImg = document.getElementById('modal-image');
const modalVid = document.getElementById('modal-video');
const closeBtn = document.querySelector('.close-btn');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const birthdayHeader = document.getElementById('birthday-header');

// Şu an modalda görüntülenen medya ID'si
let currentMediaId = 0;

// Fotoğraf ve video galerisini oluştur
function renderGallery() {
    galleryGrid.innerHTML = '';

    mediaItems.forEach(media => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        mediaItem.dataset.id = media.id;

        mediaItem.innerHTML = `
            <div class="media-thumbnail">
                <img data-src="${media.thumbnail}" alt="${media.title}" class="lazy-img">
                ${media.type === 'video' ? '<i class="fas fa-play play-icon"></i>' : ''}
                <div class="media-icon ${media.type === 'video' ? 'video-icon' : 'image-icon'}">
                    <i class="fas fa-${media.type === 'video' ? 'video' : 'image'}"></i>
                </div>
            </div>
        `;

        galleryGrid.appendChild(mediaItem);
    });

    // Tıklama olayları
    document.querySelectorAll('.media-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            openModal(id);
        });
    });

    // Lazy load başlat
    initLazyLoad();
}

// Lazy load fonksiyonu
function initLazyLoad() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                obs.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => observer.observe(img));
}


// Modal açma
function openModal(id) {
    const media = mediaItems.find(m => m.id === id);
    if (media) {
        if (media.type === 'image') {
            modalImg.src = media.url;
            modalImg.style.display = 'block';
            modalImg.alt = media.title;

            modalVid.style.display = 'none';
            modalVid.pause();
        } else {
            modalVid.src = media.url;
            modalVid.style.display = 'block';
            modalVid.setAttribute('title', media.title);

            modalImg.style.display = 'none';
        }

        currentMediaId = id;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Modal kapama
function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    modalVid.pause();
}

// Önceki medya
function showPrevMedia() {
    currentMediaId--;
    if (currentMediaId < 1) {
        currentMediaId = totalItems;
    }
    openModal(currentMediaId);
}

// Sonraki medya
function showNextMedia() {
    currentMediaId++;
    if (currentMediaId > totalItems) {
        currentMediaId = 1;
    }
    openModal(currentMediaId);
}

// Event listeners
closeBtn.addEventListener('click', closeModal);
prevBtn.addEventListener('click', showPrevMedia);
nextBtn.addEventListener('click', showNextMedia);

// Modal dışına tıklama ile kapatma
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Klavye kısayolları
document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'block') {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'ArrowLeft') {
            showPrevMedia();
        } else if (e.key === 'ArrowRight') {
            showNextMedia();
        } else if (e.key === ' ' && modalVid.style.display === 'block') {
            // Video için boşluk tuşuyla play/pause
            if (modalVid.paused) {
                modalVid.play();
            } else {
                modalVid.pause();
            }
            e.preventDefault(); // Sayfa kaymasını engelle
        }
    }
});

// Galeri öğesini güncelle
function updateGalleryItem(id) {
    const media = mediaItems.find(m => m.id === id);
    if (!media) return;

    const item = document.querySelector(`.media-item[data-id="${id}"]`);
    if (item) {
        const img = item.querySelector('.media-thumbnail img');
        if (img) {
            img.src = media.thumbnail;
        }
    }
}

// Slayt gösterisi için rastgele 5 fotoğraf seç
function selectRandomImages() {
    const images = mediaItems.filter(item => item.type === 'image');
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
}

// Slayt gösterisini başlat
function startSlideshow() {
    const slideshow = document.getElementById('slideshow-overlay');
    const slidesContainer = document.querySelector('.slideshow-container');

    // Slaytları dinamik olarak oluştur
    const selectedImages = selectRandomImages();

    // Container'ı temizle ve yeni slaytları ekle
    slidesContainer.innerHTML = `
        <button id="skip-slideshow">Slayt Gösterisini Geç <i class="fas fa-forward"></i></button>
        ${selectedImages.map((img, index) => `
            <div class="slide ${index === 0 ? 'fade' : ''}">
                <img src="${img.url}" class="slide-image" alt="${img.title}">
            </div>
        `).join('')}
    `;

    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    let slideInterval;

    function showNextSlide() {
        slides[currentSlide].classList.remove('fade');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('fade');
    }

    // Slayt geçişlerini başlat
    function startInterval() {
        slideInterval = setInterval(showNextSlide, 4000);
    }

    // İlk slaytı göster ve interval'i başlat
    startInterval();

    // Slaytı atlama butonu
    document.getElementById('skip-slideshow').addEventListener('click', () => {
        clearInterval(slideInterval);
        slideshow.style.opacity = '0';
        slideshow.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            slideshow.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 500);
    });

    // Slayt gösterisini başlat
    setTimeout(() => {
        document.body.style.overflow = 'hidden';
    }, 100);
}

// Sayfa yüklendiğinde
window.addEventListener('DOMContentLoaded', () => {
    renderGallery();
    startSlideshow(); // Slayt gösterisini başlat

    // Doğum günü animasyonu
    const header = document.querySelector('.birthday-header');
    header.style.opacity = '0';
    header.style.transform = 'translateY(20px)';

    setTimeout(() => {
        header.style.transition = 'opacity 1s ease, transform 1s ease';
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
    }, 300);
});

// Yukarı Çık Butonu
const backToTopButton = document.getElementById('back-to-top');

// Sayfa kaydırma olayını dinle
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

// Butona tıklandığında en üste git
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});