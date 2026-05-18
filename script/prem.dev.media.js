/* ----------------------------LENIS SCRIPT START-------------------------------- */
        // 1. Lenis
        const lenis = new Lenis({
			duration: 1.2, // Скролл хэр зөөлөн үргэлжлэх хугацаа (секундээр)
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Хурдсах уусалт
			smoothWheel: true
			});
		// Хөтчийн скролл хийх болгонд Lenis-ийг байнга шинэчилж ажиллуулах функц
		function raf(time) {
			lenis.raf(time);
			requestAnimationFrame(raf);
			}
		requestAnimationFrame(raf);
/* ----------------------------LENIS SCRIPT END-------------------------------- */
        
/* ----------------------------MENU SCRIPT START-------------------------------- */
        // 2. Mobile Menu Logic
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');

        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });

        // Гадна талд дарахад хаах
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });

        // Линк дарахад хаах
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
/* ----------------------------MENU SCRIPT END-------------------------------- */
        
/* ----------------------------ALBUM SCRIPT START-------------------------------- */
		let glGlobalAlbums = []; // Вэб дээрх бүх цомгийн өгөгдлийг багцалж хадгалах дэлхийн (global) массив
        let glActiveAlbumIndex = 0; // Яг одоо хэрэглэгчийн нээчихсэн байгаа цомгийн дугаар (индекс)
        let glActiveImgIndex = 0; // Яг одоо лайтбокс дотор харагдаж байгаа зураг/видеоны дугаар (индекс)

        // Линкээс YouTube ID салгаж авах хамгийн найдвартай Regex функц
        function parseYouTubeId(url) { 
            // YouTube линкнүүдийн бүтцийг таних тогтмол илэрхийлэл (Regular Expression)
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp); // Оруулсан линкийг дээрх загвартай тулгаж шалгана
            // Хэрэв линк тохирч байвал, түүний ард байгаа 11 тэмдэгттэй ID кодыг буцаана, үгүй бол null буцаана
            return (match && match[2].length === 11) ? match[2] : null;
        } // Функц дуусна

        // HTML хуудасны бүх бүтэц уншигдаж дуусах үед ажиллах гол үйл явдал
        document.addEventListener("DOMContentLoaded", () => {
            // Вэб хуудас дээрх `.gl-row-grid` ангилалтай бүх цомгуудыг хайж олоод жагсаалт болгоно
            const albumElements = document.querySelectorAll('.gl-row-grid');
            
            // Олдсон цомгуудыг нэг нэгээр нь авч боловсруулах гол давталт эхэлнэ
            albumElements.forEach((albumEl, albumIdx) => {
                // Цомгийн data-images доторх текстийг таслал `,` тэмдэгтээр нь салгаж массив болгоно
                const rawData = albumEl.getAttribute('data-images').split(',');
                const parsedImages = []; // Цэвэрлэж бэлдсэн өгөгдлүүдийг хадгалах түр массив

                // Салгаж авсан текст медиа бүрийг нэг бүрчлэн унших давталт
                rawData.forEach(item => {
                    const cleanItem = item.trim(); // Текстийн урд болон ард үлдсэн илүүдэл хоосон зай, шинэ мөрийг устгана
                    if (!cleanItem) return; // Хэрэв хоосон мөр байвал алгасаад дараагийнх руу шилжинэ

                    const parts = cleanItem.split('|'); // Текстиг босоо зураас `|` тэмдэгтээр линк болон тайлбар болгож хуваана
                    const url = parts[0].trim(); // Эхний хэсэг буюу медиагийн линкийг авч хоосон зайг нь цэвэрлэнэ
                    const videoId = parseYouTubeId(url); // Линкийг YouTube мөн эсэхийг шалгаж, ID кодыг нь салгаж авна

                    // Бэлэн болсон цэвэр өгөгдлийг объект болгон түр массив руу хийнэ
                    parsedImages.push({
                        url: url, // Медиагийн бодит линк
                        caption: parts[1] ? parts[1].trim() : "Тайлбаргүй", // Тайлбар байвал авна, байхгүй бол "Тайлбаргүй" гэж бичнэ
                        isVideo: videoId !== null, // YouTube ID олдсон бол true (видео), олдоогүй бол false (зураг) болно
                        youtubeId: videoId // Салгаж авсан YouTube ID кодыг хадгална
                    }); // Объект оруулах хэсэг дуусна
                }); // Текст унших давталт дуусна

                glGlobalAlbums.push(parsedImages); // Бэлэн болсон цомгийн датаг үндсэн том массив руу нэмнэ
                const totalCount = parsedImages.length; // Энэ цомогт нийт хэдэн медиа файл байгааг тоолно
                albumEl.setAttribute('data-count', totalCount); // HTML элемент дээр data-count атрибутаар тоог тэмдэглэнэ
                albumEl.innerHTML = ''; // HTML дотор байсан түүхий бичвэрүүдийг устгаж цэвэрлэнэ

                // Вэб хуудас дээр цомгоос хамгийн ихдээ хэдэн карт гаргахыг шийднэ (1 файлтай бол 1 карт, олон бол 2 карт харагдана)
                const displayCount = totalCount === 1 ? 1 : 2;

                // Тогтоосон тооны дагуу вэб хуудас дээр картуудыг үүсгэж зурах давталт
                for (let i = 0; i < displayCount; i++) {
                    const mediaData = parsedImages[i]; // Яг одоо зурах гэж буй медиа өгөгдлийг авна
                    const itemDiv = document.createElement('div'); // Шинээр карт болгох `div` элемент үүсгэнэ
                    itemDiv.className = 'gl-card-item'; // Үүсгэсэн div-дээ 'gl-card-item' CSS ангиллыг өгнө

                    const img = document.createElement('img'); // Карт дотор байрлах зургийн `img` элемент үүсгэнэ
                    if (mediaData.isVideo) { // Хэрэв энэ файл видео байвал
                        // YouTube-ийн серверээс тухайн видеоны автоматаар үүсдэг ковер зургийг дуудаж src-д нь онооно
                        img.src = `https://img.youtube.com/vi/${mediaData.youtubeId}/mqdefault.jpg`;
                        img.loading = "lazy"; // Зургийг уян хатан уншуулна
                        itemDiv.appendChild(img); // Ковер зургийг карт дотроо хуулж оруулна

					// 🌟 YouTube-ийн улаан Play товчийг идэвхжүүлэх код:
                        const playButton = document.createElement('div');
                        playButton.className = 'gl-youtube-play-btn'; // Таны хуучин CSS дээрх класс нэр
                        // Хэрэв хуучин код чинь дотроо SVG эсвэл Icon агуулж байсан бол энд innerHTML-ээр хийж болно:
                        playButton.innerHTML = `
                            <svg viewBox="0 0 68 48" width="100%" height="100%">
                                <path class="gl-yt-play-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path>
                                <polygon points="26,33 44,24 26,15" fill="#fff"></polygon>
                            </svg>
                        `; 
                        itemDiv.appendChild(playButton);
						
                    } else { // Хэрэв видео биш ердийн зураг байвал
                        img.src = mediaData.url; // Зургийн бодит линкийг src-д нь онооно
                        img.loading = "lazy"; // Вэб ачааллыг хөнгөвчлөх үүднээс зургийг lazy уншуулна
                        itemDiv.appendChild(img); // Зургийг карт дотор хуулж оруулна
                    } // Нөхцөл дуусна

                    // Хэрэв цомогт 2-оос олон файл байгаад, яг одоо 2 дахь картыг зурж байвал
                    if (totalCount > 2 && i === 1) {
                        const overlay = document.createElement('div'); // Харанхуйлах маск div үүсгэнэ
                        overlay.className = 'gl-dark-mask'; // Маскны CSS ангиллыг онооно
                        overlay.innerText = `+${totalCount - 1}`; // Үлдэж буй зургийн тоог тооцож бичнэ
                        itemDiv.appendChild(overlay); // Маскийг карт дотор хуулж оруулна
                    } // Маск үүсгэх нөхцөл дуусна

                    // Картыг дарах үед Лайтбокс попапыг тухайн цомог, тухайн зургийн дугаартайгаар нээх үйлдэл
                    itemDiv.onclick = () => openGlLightbox(albumIdx, i);
                    albumEl.appendChild(itemDiv); // Бэлэн болсон бүтэн картыг вэб хуудасны Grid блок руу хуулж оруулна
                } // Карт зурах давталт дуусна
            }); // Цомог боловсруулах давталт дуусна
        }); // DOMContentLoaded үйл явдал дуусна

        // Лайтбокс цонхыг нээх функц
        function openGlLightbox(albumIdx, imgIdx) {
            glActiveAlbumIndex = albumIdx; // Сонгосон цомгийн дугаарыг глобал хувьсагчид хадгална
            glActiveImgIndex = imgIdx; // Сонгосон зургийн дугаарыг глобал хувьсагчид хадгална
            updateGlLightbox(); // Лайтбокс доторх зураг, текстийг шинэчилж зурах функцийг дуудна
            // Лайтбокс суурь попап div-ийг дэлгэцэнд харагдуулахын тулд стилийг нь 'flex' болгоно
            document.getElementById('gl-lightbox-popup').style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Попап нээлттэй үед арын үндсэн вэб хуудсыг гүйж scroll хийхийг хаана
        } // Функц дуусна

        // Лайтбокс доторх контентыг сольж шинэчлэх гол функц
        function updateGlLightbox() {
            const currentAlbum = glGlobalAlbums[glActiveAlbumIndex]; // Идэвхтэй байгаа цомгийн датаг массив хэлбэрээр авна
            const media = currentAlbum[glActiveImgIndex]; // Одоо харуулах ёстой зургийн өгөгдлийг авна
            
            // Лайтбокс доторх HTML элементүүдийг ID-гаар нь дуудаж хувьсагчид авна
            const imgEl = document.getElementById('gl-lightbox-img');
            const videoEl = document.getElementById('gl-lightbox-video');
            const captionEl = document.getElementById('gl-lightbox-caption');

            // Өмнөх дуудагдсан байсан src болон зургуудыг бүрэн цэвэрлэж нууна (Давхцаж алдаа гарахаас сэргийлнэ)
            imgEl.style.display = 'none'; // Зургийн элементийг нууна
            imgEl.src = ''; // Зургийн линкийг хоосон болгоно
            videoEl.style.display = 'none'; // Видео тоглуулагчийг нууна
            videoEl.src = ''; // Видео тоглуулагчийн линкийг хоосон болгоно

            if (media.isVideo) { // Хэрэв харуулах медиа видео байвал
                // 🛠 ЗАСВАР (YouTube Ориг товч): autoplay=1-ийг хассанаар видео шууд тоглохгүй, YouTube-ийн өөрийнх нь ориг том улаан товч гарч ирнэ.
                // Мөн Error 153-аас сэргийлж enablejsapi=1 болон origin-ийг хэвээр үлдээв.
                videoEl.src = `https://www.youtube.com/embed/${media.youtubeId}?rel=0&enablejsapi=1&origin=${window.location.origin}`;
                videoEl.style.display = 'block'; // Видео тоглуулагчийг дэлгэцэнд гаргана
            } else { // Хэрэв ердийн зураг байвал
                imgEl.src = media.url; // Зургийн бодит линкийг онооно
                imgEl.style.display = 'block'; // Зургийн элементийг дэлгэцэнд гаргана
            } // Нөхцөл дуусна
            
            captionEl.innerText = media.caption; // Доод талын тайлбар хэсэгт медиагийн текстийг хэвлэнэ

            // Хэрэв тухайн цомогт ганцхан файл байвал хажуу талын навигацийн сумуудыг нууна, олон бол харуулна
            const navs = document.querySelectorAll('.gl-nav-zone');
            navs.forEach(nav => nav.style.display = currentAlbum.length === 1 ? 'none' : 'flex');
        } // Функц дуусна

        // Сум дарах үед зураг урагш хойш солих функц
        function changeGlImage(direction, event) {
            if (event) event.stopPropagation(); // Сум дарах үед хаах үйлдэл (popup click) давхар ажиллахаас хамгаална
            const currentAlbum = glGlobalAlbums[glActiveAlbumIndex]; // Одоо байгаа цомгийн файлыг авна
            if (currentAlbum.length === 1) return; // Хэрэв ганцхан зурагтай цомог бол солих үйлдэл хийхгүй зогсооно

            glActiveImgIndex += direction; // Зургийн индексийг даралтаас хамаарч 1-ээр нэмнэ эсвэл хасна
            if (glActiveImgIndex >= currentAlbum.length) glActiveImgIndex = 0; // Хэрэв хамгийн сүүлчийн зураг дээр очоод дахин урагшилбал эхний зураг руу шилжүүлнэ
            if (glActiveImgIndex < 0) glActiveImgIndex = currentAlbum.length - 1; // Хэрэв эхний зураг дээр байхдаа буцвал хамгийн сүүлчийн зураг руу аваачна
            
            updateGlLightbox(); // Шинэ зургийг лайтбокс дотор зурж шинэчилнэ
        } // Функц дуусна

        // Лайтбокс цонхыг хаах функц
        function closeGlLightbox() {
            document.getElementById('gl-lightbox-popup').style.display = 'none'; // Үндсэн попап div-ийг бүрэн нууна
            document.getElementById('gl-lightbox-video').src = ''; // Видеог бүрэн зогсоохын тулд iframe-ийн src-ийг хоосон болгоно
            document.getElementById('gl-lightbox-img').src = ''; // Зургийн src линкийг мөн цэвэрлэнэ
            document.body.style.overflow = ''; // Арын үндсэн вэбийн гүйж scroll хийх эрхийг буцааж нээнэ
        } // Функц дуусна

        // Компьютерийн гар (клавиатур)-аас удирдах UX функц
        document.addEventListener('keydown', (e) => {
            // Зөвхөн Лайтбокс попап дэлгэцэнд нээлттэй харагдаж байгаа үед л энэ товчлуурууд ажиллана
            if (document.getElementById('gl-lightbox-popup').style.display === 'flex') {
                if (e.key === 'ArrowRight') changeGlImage(1); // Баруун сум дарахад дараагийн зураг руу шилжинэ
                if (e.key === 'ArrowLeft') changeGlImage(-1); // Зүүн сум дарахад өмнөх зураг руу буцна
                if (e.key === 'Escape') closeGlLightbox(); // Гарын Escape товчийг дарахад попап хаагдана
            } // Нөхцөл дуусна
        }); // Үйл явдал дуусна
/* ----------------------------ALBUM SCRIPT END-------------------------------- */

/* ----------------------------TEXT WRAPPER START-------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    // Вэб дээрх бүх текстийн хайрцагуудыг олно
    const wrappers = document.querySelectorAll('.gl-text-wrapper');
    
    wrappers.forEach(wrapper => {
        const textEl = wrapper.querySelector('.gl-truncate-text');
        const btnEl = wrapper.querySelector('.gl-toggle-btn');
        
        // Текстийн бодит өндөр нь харагдаж буй өндрөөсөө их байвал (урт текст гэсэн үг)
        if (textEl.scrollHeight > textEl.offsetHeight) {
            btnEl.style.display = 'inline-block'; // "Цааш нь унших" товчийг ил гаргана
        } else {
            btnEl.style.display = 'none'; // 2-оос цөөн мөр бол товчлуурыг бүрмөсөн нууна
        }
    });
});

// 📑 Текстийг доош түлхэж дэлгэх болон буцааж хумих функц
function toggleGlText(btnElement) {
    const textElement = btnElement.parentElement.querySelector('.gl-truncate-text');
    
    // Классыг идэвхжүүлнэ (Зургуудыг араар нь оруулахгүй, доош нь түлхэнэ)
    textElement.classList.toggle('gl-expanded');
    
    // Төлөвөөс хамаарч текстийг солих
    if (textElement.classList.contains('gl-expanded')) {
        btnElement.innerText = "Хумих";
    } else {
        btnElement.innerText = "Цааш нь";
    }

    // 🌟 Lenis Scroll ашиглаж байгаа үед хуудасны өндөр өөрчлөгдсөнийг Lenis-д мэдэгдэж шинэчлэх
    if (window.lenis) {
        window.lenis.resize();
    } else if (typeof lenis !== 'undefined') {
        lenis.resize();
    }
}
/* ----------------------------TEXT WRAPPER END-------------------------------- */
