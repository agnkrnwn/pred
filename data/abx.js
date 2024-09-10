(() => {
    let quranData;
    let chapters;
    let currentSurah;
    let showLatin = false;
    let fontSize = 25;
    let isFocusMode = false;
    let currentAyahIndex = 0;
    let audioEnabled = false;
    let selectedQari = 'local';
    let reciters = [];
    let audio = new Audio();
    let isPlaying = false;
    let currentAudioPromise = null;
    let bookmarks = [];


    function convertToArabicNumerals(number) {
        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return number.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
    }

    async function loadChapters() {
        try {
            const response = await fetch('/data/chapter.json');
            chapters = await response.json();
            populateSurahDropdown();
        } catch (error) {
            console.error('Error loading chapters data:', error);
            document.getElementById('content').innerHTML = 'Error loading chapters data. Please try again later.';
        }
    }

    function populateSurahDropdown() {
        const dropdown = document.getElementById('surahDropdown');
        dropdown.innerHTML = '';
        chapters.chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter.id;
            option.textContent = `${chapter.id}. ${chapter.surah}`;
            dropdown.appendChild(option);
        });
        dropdown.addEventListener('change', (e) => {
            loadSurah(e.target.value);
        });
    }

    async function loadReciters() {
        try {
            const response = await fetch('/data/reciter.json');
            const data = await response.json();
            reciters = data.reciters;
            populateQariSelect();
        } catch (error) {
            console.error('Error loading reciters data:', error);
        }
    }

    async function loadSurah(surahId) {
        try {
            const response = await fetch(`/data/quran/${surahId.toString().padStart(3, '0')}.json`);
            quranData = await response.json();
            currentSurah = surahId;
            currentAyahIndex = getSavedAyahIndex(surahId) || 0;
            renderSurah();
            saveSettings();
            if (isFocusMode) {
                renderFocusMode();
            } else {
                scrollToCurrentAyah();
            }
        } catch (error) {
            console.error('Error loading surah data:', error);
            document.getElementById('content').innerHTML = 'Error loading surah data. Please try again later.';
        }
    }

    function populateQariSelect() {
        const qariSelect = document.getElementById('qari');
        qariSelect.innerHTML = '';
        
        const localOption = document.createElement('option');
        localOption.value = 'local';
        localOption.textContent = 'Local Audio';
        qariSelect.appendChild(localOption);

        reciters.forEach(reciter => {
            const option = document.createElement('option');
            option.value = reciter.link;
            option.textContent = reciter.judul;
            qariSelect.appendChild(option);
        });

        qariSelect.value = selectedQari;
    }

    function renderSurah() {
        const content = document.getElementById('content');
        content.style.opacity = '0';
        
        setTimeout(() => {
            content.innerHTML = '';
            
            quranData.ayah.forEach(ayah => {
                const ayahElement = document.createElement('div');
                ayahElement.className = 'ayah bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition duration-300 ease-in-out transform hover:scale-100';
                ayahElement.dataset.number = ayah.number;
                const arabicNumber = convertToArabicNumerals(ayah.number);
                if (showLatin) {
                    ayahElement.innerHTML = `
                        <p class="text-right mb-4 leading-loose" style="font-size: ${fontSize}px;">${ayah.text} <span class="text-green-600 dark:text-green-400">${arabicNumber}</span></p>
                        <p class="text-gray-600 dark:text-gray-400" style="font-size: ${fontSize - 4}px;">${ayah.teksLatin}</p>
                        <button class="bookmark-btn" data-surah="${currentSurah}" data-ayah="${ayah.number}">
                            <i class="fas fa-bookmark ${isBookmarked(currentSurah, ayah.number) ? 'text-yellow-500' : 'text-gray-400'}"></i>
                        </button>
                    `;
                } else {
                    ayahElement.innerHTML = `
                        <p class="text-right leading-loose" style="font-size: ${fontSize}px;">${ayah.text} <span class="text-green-600 dark:text-green-400">${arabicNumber}</span></p>
                        <button class="bookmark-btn" data-surah="${currentSurah}" data-ayah="${ayah.number}">
                            <i class="fas fa-bookmark ${isBookmarked(currentSurah, ayah.number) ? 'text-yellow-500' : 'text-gray-400'}"></i>
                        </button>
                    `;
                }
                ayahElement.addEventListener('click', () => {
                    playAudio(ayah.number);
                    highlightAyah(ayah.number);
                    currentAyahIndex = quranData.ayah.findIndex(a => a.number === ayah.number);
                    saveSettings();
                });
                content.appendChild(ayahElement);
            });
            
            content.style.opacity = '1';
            addBookmarkListeners();
        }, 300);
    
        document.getElementById('surahDropdown').value = currentSurah;
        document.getElementById('playAll').classList.remove('hidden');
        
        document.getElementById('content').classList.remove('hidden');
        document.getElementById('focusMode').classList.add('hidden');
        isFocusMode = false;
    }

    function addBookmarkListeners() {
        const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
        bookmarkBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const surah = btn.dataset.surah;
                const ayah = btn.dataset.ayah;
                toggleBookmark(surah, ayah);
                updateBookmarkUI(btn, surah, ayah);
            });
        });
    }

    function toggleBookmark(surah, ayah) {
        const index = bookmarks.findIndex(b => b.surah === surah && b.ayah === ayah);
        if (index > -1) {
            bookmarks.splice(index, 1);
        } else {
            bookmarks.push({ surah, ayah });
        }
        saveBookmarks();
        updateBookmarkList();
    }

    function updateBookmarkUI(btn, surah, ayah) {
        const icon = btn.querySelector('i');
        if (isBookmarked(surah, ayah)) {
            icon.classList.remove('text-gray-400');
            icon.classList.add('text-yellow-500');
        } else {
            icon.classList.remove('text-yellow-500');
            icon.classList.add('text-gray-400');
        }
    }

    function isBookmarked(surah, ayah) {
        return bookmarks.some(b => b.surah === surah && b.ayah === ayah);
    }

    function saveBookmarks() {
        localStorage.setItem('quranAppBookmarks', JSON.stringify(bookmarks));
    }

    function loadBookmarks() {
        const savedBookmarks = localStorage.getItem('quranAppBookmarks');
        if (savedBookmarks) {
            bookmarks = JSON.parse(savedBookmarks);
        }
    }

    function updateBookmarkList() {
        const bookmarkList = document.getElementById('bookmarkList');
        bookmarkList.innerHTML = '';
        if (bookmarks.length === 0) {
            bookmarkList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center">No bookmarks yet</p>';
            return;
        }
        bookmarks.forEach((bookmark, index) => {
            const bookmarkItem = document.createElement('div');
            bookmarkItem.className = 'flex items-center justify-between p-3 mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg transition duration-300 hover:bg-gray-200 dark:hover:bg-gray-600';
            bookmarkItem.innerHTML = `
                <span class="text-gray-800 dark:text-white cursor-pointer flex-grow">Surah ${bookmark.surah}:${bookmark.ayah}</span>
                <button class="delete-bookmark text-red-500 hover:text-red-700 transition duration-300" data-index="${index}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            bookmarkList.appendChild(bookmarkItem);

            // Add click event for navigating to the bookmark
            bookmarkItem.querySelector('span').addEventListener('click', () => {
                navigateToBookmark(bookmark.surah, bookmark.ayah);
            });

            // Add click event for deleting the bookmark
            bookmarkItem.querySelector('.delete-bookmark').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteBookmark(index);
            });
        });
    }

    function navigateToBookmark(surah, ayah) {
        loadSurah(surah);
        setTimeout(() => {
            const ayahElement = document.querySelector(`.ayah[data-number="${ayah}"]`);
            if (ayahElement) {
                ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
        document.getElementById('bookmarkModal').classList.add('hidden');
    }

    function deleteBookmark(index) {
        bookmarks.splice(index, 1);
        saveBookmarks();
        updateBookmarkList();
        updateAllBookmarkUI();
    }

    function updateAllBookmarkUI() {
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            const surah = btn.dataset.surah;
            const ayah = btn.dataset.ayah;
            updateBookmarkUI(btn, surah, ayah);
        });
    }

    function playAudio(ayahNumber) {
        if (!audioEnabled) return;
        
        const paddedSurahNumber = currentSurah.toString().padStart(3, '0');
        const paddedAyahNumber = ayahNumber.toString().padStart(3, '0');
        let audioUrl;

        if (selectedQari === 'local') {
            audioUrl = `/audio/${paddedSurahNumber}${paddedAyahNumber}.mp3`;
        } else {
            audioUrl = `${selectedQari}${paddedSurahNumber}${paddedAyahNumber}.mp3`;
        }
        
        if (currentAudioPromise) {
            audio.pause();
            audio.currentTime = 0;
            currentAudioPromise = null;
        }

        audio.src = audioUrl;
        currentAudioPromise = audio.play().catch(error => {
            if (error.name !== 'AbortError') {
                console.error('Audio playback error:', error);
            }
        });
    }

    function highlightAyah(ayahNumber) {
        const ayahs = document.querySelectorAll('.ayah');
        ayahs.forEach(ayah => {
            if (ayah.dataset.number == ayahNumber) {
                ayah.classList.add('bg-yellow-100', 'dark:bg-yellow-900');
            } else {
                ayah.classList.remove('bg-yellow-100', 'dark:bg-yellow-900');
            }
        });
    }

    function renderFocusMode() {
    const focusAyah = document.getElementById('focusAyah');
    const ayah = quranData.ayah[currentAyahIndex];
    const arabicNumber = convertToArabicNumerals(ayah.number);
    
    focusAyah.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
            <p class="text-right mb-4 leading-loose" style="font-size: ${fontSize + 8}px;">${ayah.text} <span class="text-green-600 dark:text-green-400">${arabicNumber}</span></p>
            ${showLatin ? `<p class="text-gray-600 dark:text-gray-400 mt-4" style="font-size: ${fontSize}px;">${ayah.teksLatin}</p>` : ''}
        </div>
    `;

    if (audioEnabled) {
        playAudio(ayah.number);
    }
    saveSettings();
}

    function toggleFocusMode() {
        isFocusMode = !isFocusMode;
        const content = document.getElementById('content');
        const focusMode = document.getElementById('focusMode');
        
        if (isFocusMode) {
            content.classList.add('hidden');
            focusMode.classList.remove('hidden');
            renderFocusMode();
        } else {
            focusMode.classList.add('hidden');
            content.classList.remove('hidden');
            scrollToCurrentAyah();
        }
        saveSettings();
    }

    document.getElementById('prevAyah').addEventListener('click', () => {
        if (currentAyahIndex > 0) {
            currentAyahIndex--;
            renderFocusMode();
        }
    });

    document.getElementById('nextAyah').addEventListener('click', () => {
        if (currentAyahIndex < quranData.ayah.length - 1) {
            currentAyahIndex++;
            renderFocusMode();
        }
    });

    function saveSettings() {
        const settings = {
            fontSize: fontSize,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            audioEnabled: audioEnabled,
            selectedQari: selectedQari,
            lastReadSurah: currentSurah,
            lastReadAyah: currentAyahIndex,
            isFocusMode: isFocusMode,
            bookmarks: bookmarks
        };
        localStorage.setItem('quranAppSettings', JSON.stringify(settings));
    }
    
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('quranAppSettings'));
        if (settings) {
            fontSize = settings.fontSize;
            document.getElementById('fontSize').value = fontSize;
            document.getElementById('fontSizeValue').textContent = `${fontSize}px`;
            if (settings.theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.getElementById('theme').value = 'dark';
            } else {
                document.documentElement.classList.remove('dark');
                document.getElementById('theme').value = 'light';
            }
            audioEnabled = settings.audioEnabled;
            document.getElementById('audioEnabled').checked = audioEnabled;
            selectedQari = settings.selectedQari || 'local';
            document.getElementById('qari').value = selectedQari;
            
            currentSurah = settings.lastReadSurah || '1';
            currentAyahIndex = settings.lastReadAyah || 0;
            isFocusMode = settings.isFocusMode || false;
            bookmarks = settings.bookmarks || [];
        } else {
            currentSurah = '1';
            currentAyahIndex = 0;
        }
        updateBookmarkList();
    }

    function getSavedAyahIndex(surahId) {
        const savedState = JSON.parse(localStorage.getItem('quranAppState')) || {};
        return savedState[surahId];
    }

    function scrollToCurrentAyah() {
        const ayahElements = document.querySelectorAll('.ayah');
        if (ayahElements[currentAyahIndex]) {
            ayahElements[currentAyahIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            highlightAyah(quranData.ayah[currentAyahIndex].number);
        }
    }

    document.getElementById('tanpaLatin').addEventListener('click', () => {
        showLatin = false;
        if (isFocusMode) {
            renderFocusMode();
        } else {
            renderSurah();
        }
    });

    document.getElementById('denganLatin').addEventListener('click', () => {
        showLatin = true;
        if (isFocusMode) {
            renderFocusMode();
        } else {
            renderSurah();
        }
    });

    document.getElementById('focusModeToggle').addEventListener('click', toggleFocusMode);

    

    document.getElementById('setting').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.remove('hidden');
    });

    document.getElementById('closeSettings').addEventListener('click', () => {
        document.getElementById('settingsModal').classList.add('hidden');
    });

    document.getElementById('fontSize').addEventListener('input', (e) => {
        fontSize = parseInt(e.target.value);
        document.getElementById('fontSizeValue').textContent = `${fontSize}px`;
        if (isFocusMode) {
            renderFocusMode();
        } else {
            renderSurah();
        }
        saveSettings();
    });

    document.getElementById('theme').addEventListener('change', (e) => {
        if (e.target.value === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        saveSettings();
    });
    
    document.getElementById('qari').addEventListener('change', (e) => {
        selectedQari = e.target.value;
        saveSettings();
    });

    document.getElementById('audioEnabled').addEventListener('change', (e) => {
        audioEnabled = e.target.checked;
        saveSettings();
    });

    document.getElementById('playAll').addEventListener('click', () => {
        if (isPlaying) {
            stopAudio();
        } else {
            isPlaying = true;
            updatePlayAllButton();
            if (isFocusMode) {
                playAllFocusMode();
            } else {
                playAllNormalMode();
            }
        }
    });

    function playAllNormalMode() {
        let currentIndex = currentAyahIndex;
        const playNext = () => {
            if (currentIndex < quranData.ayah.length && isPlaying) {
                playAudio(quranData.ayah[currentIndex].number);
                highlightAyah(quranData.ayah[currentIndex].number);
                currentIndex++;
                audio.onended = playNext;
            } else {
                stopAudio();
            }
        };
        playNext();
    }

    function playAllFocusMode() {
        const playNext = () => {
            if (currentAyahIndex < quranData.ayah.length - 1 && isPlaying) {
                currentAyahIndex++;
                renderFocusMode();
                audio.onended = playNext;
            } else {
                stopAudio();
            }
        };
        renderFocusMode();
        audio.onended = playNext;
    }

    function stopAudio() {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        currentAudioPromise = null;
        updatePlayAllButton();
    }

    function updatePlayAllButton() {
        const playAllButton = document.getElementById('playAll');
        if (isPlaying) {
            playAllButton.innerHTML = '<i class="fas fa-stop"></i>';
            playAllButton.title = 'Stop';
        } else {
            playAllButton.innerHTML = '<i class="fas fa-play"></i>';
            playAllButton.title = 'Play All';
        }
    }

    document.getElementById('surahDropdown').addEventListener('change', (e) => {
        loadSurah(e.target.value);
    });
    
    async function initialize() {
        await loadReciters();
        loadSettings();
        loadBookmarks();
        await loadChapters();
        await loadSurah(currentSurah);
        renderSurah();
        updateBookmarkList();
    }

    // Add event listeners for bookmark modal
    document.getElementById('bookmarkToggle').addEventListener('click', () => {
        document.getElementById('bookmarkModal').classList.remove('hidden');
        updateBookmarkList(); // Refresh the list when opening the modal
    });

    document.getElementById('closeBookmarkModal').addEventListener('click', () => {
        document.getElementById('bookmarkModal').classList.add('hidden');
    });

    initialize();
    updatePlayAllButton();

     // Tambahkan event listener untuk tombol kembali
     window.addEventListener('popstate', () => {
        if (currentSurah) {
            currentSurah = null;
            renderSurahList();
        }
    });

})();   