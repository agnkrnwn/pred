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
            currentAyahIndex = 0; // Reset the currentAyahIndex to 0 when loading a new surah
            renderSurah();
            saveSettings();
            if (isFocusMode) {
                renderFocusMode(); // Re-render focus mode with the first ayah
            }
        } catch (error) {
            console.error('Error loading surah data:', error);
            document.getElementById('content').innerHTML = 'Error loading surah data. Please try again later.';
        }
    }

    function populateQariSelect() {
        const qariSelect = document.getElementById('qari');
        
        // Tambahkan opsi untuk file lokal
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

        // Setel nilai default setelah opsi-opsi terisi
        qariSelect.value = selectedQari;
    }

    function renderSurah() {
        const content = document.getElementById('content');
        content.style.opacity = '0';
        
        setTimeout(() => {
            content.innerHTML = '';
            
            quranData.ayah.forEach(ayah => {
                const ayahElement = document.createElement('div');
                ayahElement.className = 'ayah bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition duration-300 ease-in-out transform hover:scale-105';
                ayahElement.dataset.number = ayah.number;
                const arabicNumber = convertToArabicNumerals(ayah.number);
                if (showLatin) {
                    ayahElement.innerHTML = `
                        <p class="text-right mb-4 leading-loose" style="font-size: ${fontSize}px;">${ayah.text} <span class="text-green-600 dark:text-green-400">${arabicNumber}</span></p>
                        <p class="text-gray-600 dark:text-gray-400" style="font-size: ${fontSize - 4}px;">${ayah.teksLatin}</p>
                    `;
                } else {
                    ayahElement.innerHTML = `
                        <p class="text-right leading-loose" style="font-size: ${fontSize}px;">${ayah.text} <span class="text-green-600 dark:text-green-400">${arabicNumber}</span></p>
                    `;
                }
                ayahElement.addEventListener('click', () => {
                    playAudio(ayah.number);
                    highlightAyah(ayah.number);
                });
                content.appendChild(ayahElement);
            });
            
            content.style.opacity = '1';
        }, 300);
    
        document.getElementById('surahDropdown').value = currentSurah;
        document.getElementById('playAll').classList.remove('hidden');
        
        // Pastikan konten terlihat dan mode fokus dinonaktifkan
        document.getElementById('content').classList.remove('hidden');
        document.getElementById('focusMode').classList.add('hidden');
        isFocusMode = false;
    }

    // Fungsi untuk memutar audio
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

// Fungsi untuk menyorot ayat
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

// Fungsi untuk merender mode fokus
function renderFocusMode() {
    const focusAyah = document.getElementById('focusAyah');
    const ayah = quranData.ayah[currentAyahIndex];
    const arabicNumber = convertToArabicNumerals(ayah.number);
    
    focusAyah.innerHTML = `
        <p class="text-right mb-4 leading-loose" style="font-size: ${fontSize + 8}px;">${ayah.text} <span class="text-green-600 dark:text-green-400">${arabicNumber}</span></p>
        ${showLatin ? `<p class="text-gray-600 dark:text-gray-400" style="font-size: ${fontSize}px;">${ayah.teksLatin}</p>` : ''}
    `;

    if (audioEnabled) {
        playAudio(ayah.number);
    }
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
        }
    }

    function saveSettings() {
        const settings = {
            fontSize: fontSize,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            audioEnabled: audioEnabled,
            selectedQari: selectedQari,
            lastReadSurah: currentSurah,
            lastReadAyah: currentAyahIndex
        };
        localStorage.setItem('quranAppSettings', JSON.stringify(settings));
    }
    
    // Fungsi untuk memuat pengaturan
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
            
            // Load last read surah
            if (settings.lastReadSurah) {
                currentSurah = settings.lastReadSurah;
                currentAyahIndex = settings.lastReadAyah || 0;
            } else {
                currentSurah = '1'; // Default to Al-Fatihah if no last read surah
                currentAyahIndex = 0;
            }
        } else {
            currentSurah = '1'; // Default to Al-Fatihah if no settings
            currentAyahIndex = 0;
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

    document.getElementById('prevAyah').addEventListener('click', () => {
        if (currentAyahIndex > 0) {
            currentAyahIndex--;
            renderFocusMode();
        }
    });

    document.getElementById('nextAyah').addEventListener('click', () => {
        if (currentAyahIndex < quranData.ayah.length - 0) {
            currentAyahIndex++;
            renderFocusMode();
        }
    });

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
        if (isFocusMode) {
            playAllFocusMode();
        } else {
            playAllNormalMode();
        }
    });

    // Event listener untuk tombol Next dan Previous dalam mode fokus
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

    function playAllNormalMode() {
        let currentIndex = 0;
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

    function stopAudio() {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        currentAudioPromise = null;
        updatePlayAllButton();
    }

    // JavaScript update
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

    function playAllNormalMode() {
        let currentIndex = 0;
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

    // Fungsi untuk memutar semua ayat dalam mode fokus
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

    function playAllFocusMode() {
        const playNext = () => {
            if (currentAyahIndex < quranData.ayah.length - 1) {
                currentAyahIndex++;
                renderFocusMode();
                audio.onended = playNext;
            }
        };
        renderFocusMode();
        audio.onended = playNext;
    }

    document.getElementById('surahDropdown').addEventListener('change', (e) => {
        loadSurah(e.target.value);
    });
    
    // Modifikasi fungsi initialize
    async function initialize() {
        await loadReciters();
        loadSettings();
        await loadChapters();
        await loadSurah(currentSurah);
        renderSurah(); // Pastikan untuk memanggil renderSurah setelah loadSurah
    }

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
