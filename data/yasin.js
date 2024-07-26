(() => {
    let yasinData;
    let showLatin = false;
    let fontSize = 25;
    let isFocusMode = false;
    let currentAyahIndex = 0;
    let audioEnabled = false;
    let selectedQari = 'local';
    let reciters = [];
    let audio = new Audio();

    function convertToArabicNumerals(number) {
        const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return number.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
    }

    async function loadYasin() {
        try {
            const response = await fetch('/data/yasin.json');
            yasinData = await response.json();
            renderYasin();
        } catch (error) {
            console.error('Error loading Yasin data:', error);
            document.getElementById('content').innerHTML = 'Error loading Yasin data. Please try again later.';
        }
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

    function playAudio(ayahNumber) {
        if (!audioEnabled) return;
        
        const paddedNumber = ayahNumber.toString().padStart(3, '0');
        let audioUrl;

        if (selectedQari === 'local') {
            audioUrl = `/audio/036${paddedNumber}.mp3`;
        } else {
            audioUrl = `${selectedQari}036${paddedNumber}.mp3`;
        }
        
        audio.src = audioUrl;
        audio.play();
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

    function renderYasin() {
        const content = document.getElementById('content');
        content.style.opacity = '0';
        
        setTimeout(() => {
            content.innerHTML = '';
            
            yasinData.ayah.forEach(ayah => {
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
    }

    function renderFocusMode() {
        const focusAyah = document.getElementById('focusAyah');
        const ayah = yasinData.ayah[currentAyahIndex];
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
            selectedQari: selectedQari
        };
        localStorage.setItem('fontyasiin', JSON.stringify(settings));
        localStorage.setItem('yasinqori', selectedQari);
    }

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('fontyasiin'));
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
            selectedQari = settings.selectedQari;
            document.getElementById('qari').value = selectedQari;
            
             // Jika ada pengaturan qari yang tersimpan, gunakan itu. Jika tidak, gunakan 'local'
             selectedQari = settings.selectedQari || 'local';
            
             // Pastikan untuk mengatur nilai select setelah opsi-opsi terisi
             setTimeout(() => {
                 const qariSelect = document.getElementById('qari');
                 if (qariSelect) {
                     qariSelect.value = selectedQari;
                 }
             }, 0);
         }
     }

    document.getElementById('tanpaLatin').addEventListener('click', () => {
        showLatin = false;
        if (isFocusMode) {
            renderFocusMode();
        } else {
            renderYasin();
        }
    });

    document.getElementById('denganLatin').addEventListener('click', () => {
        showLatin = true;
        if (isFocusMode) {
            renderFocusMode();
        } else {
            renderYasin();
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
        if (currentAyahIndex < yasinData.ayah.length - 1) {
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
            renderYasin();
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

    function playAllNormalMode() {
        let currentIndex = 0;
        const playNext = () => {
            if (currentIndex < yasinData.ayah.length) {
                playAudio(yasinData.ayah[currentIndex].number);
                highlightAyah(yasinData.ayah[currentIndex].number);
                currentIndex++;
                audio.onended = playNext;
            }
        };
        playNext();
    }

    function playAllFocusMode() {
        const playNext = () => {
            if (currentAyahIndex < yasinData.ayah.length - 1) {
                currentAyahIndex++;
                renderFocusMode();
                audio.onended = playNext;
            }
        };
        renderFocusMode();
        audio.onended = playNext;
    }

    async function initialize() {
        await loadReciters();
        loadSettings();
        loadYasin();
    }

    initialize();
})();
