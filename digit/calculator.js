const calculateBtn = document.getElementById('calculateBtn');
const inputNumbers = document.getElementById('inputNumbers');
const results = document.getElementById('results');

calculateBtn.addEventListener('click', calculate);

// Modifikasi fungsi saveHistory
function saveHistory(input, finalResult, luckyResult, luckyResult6) {
    console.log('Menyimpan riwayat...');
    let history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    history.push({
        date: new Date().toISOString(),
        input,
        finalResult,
        luckyResult,
        luckyResult6
    });
    if (history.length > 20) {
        console.log('Riwayat melebihi 20, menghapus entri lama');
        history = history.slice(-20);
    }
    localStorage.setItem('calculationHistory', JSON.stringify(history));
    console.log('Riwayat tersimpan');

    if (!document.getElementById('history').classList.contains('hidden')) {
        updateHistoryDisplay();
    }
    
    predictTrend();
}

// Fungsi untuk menganalisis tren dan membuat prediksi
function predictTrend() {
    console.log('Memulai prediksi tren...');
    const history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    if (history.length < 5) return; // Butuh minimal 5 entri untuk analisis
    console.log('Riwayat tidak cukup untuk prediksi');

    // Analisis tren untuk setiap digit pada luckyResult
    let trends = [0, 0, 0, 0];
    for (let i = 1; i < history.length; i++) {
        for (let j = 0; j < 4; j++) {
            let diff = parseInt(history[i].luckyResult[j]) - parseInt(history[i-1].luckyResult[j]);
            if (diff > 0) trends[j]++;
            else if (diff < 0) trends[j]--;
        }
    }

    // Buat prediksi berdasarkan tren
    let lastResult = history[history.length - 1].luckyResult;
    let prediction = '';
    for (let i = 0; i < 4; i++) {
        if (trends[i] > 0) {
            prediction += (parseInt(lastResult[i]) + 1) % 10;
        } else if (trends[i] < 0) {
            prediction += (parseInt(lastResult[i]) - 1 + 10) % 10;
        } else {
            prediction += lastResult[i];
        }
    }

    // Analisis frekuensi untuk angka main
    let mainNumberFreq = new Array(10).fill(0);
    history.forEach(entry => {
        entry.luckyResult6.split('').forEach(digit => {
            mainNumberFreq[parseInt(digit)]++;
        });
    });

    // Pilih 6 angka dengan frekuensi tertinggi untuk prediksi angka main
    let mainNumberPrediction = mainNumberFreq
        .map((freq, index) => ({index, freq}))
        .sort((a, b) => b.freq - a.freq)
        .slice(0, 6)
        .map(item => item.index)
        .join('');

        console.log('Prediksi Lucky Result:', prediction);
        console.log('Prediksi Angka Main:', mainNumberPrediction);

    displayPrediction(prediction, mainNumberPrediction);
}

// Fungsi untuk menampilkan prediksi di UI
function displayPrediction(luckyPrediction, mainNumberPrediction) {
    const predictionElement = document.getElementById('prediction');
    predictionElement.innerHTML = `
        <h2 class="text-xl font-semibold mb-2">Prediksi Tren</h2>
        <p>Lucky Result berikutnya: <strong>${luckyPrediction}</strong></p>
        <p>Angka Main berikutnya: <strong>${mainNumberPrediction}</strong></p>
    `;
    predictionElement.classList.remove('hidden');
}

function toggleHistory() {
    const historyElement = document.getElementById('history');
    const toggleButton = document.getElementById('toggleHistory');
    if (historyElement.classList.contains('hidden')) {
        historyElement.classList.remove('hidden');
        toggleButton.textContent = 'Sembunyikan Riwayat';
        updateHistoryDisplay();
    } else {
        historyElement.classList.add('hidden');
        toggleButton.textContent = 'Tampilkan Riwayat';
    }
}

function clearHistory() {
    if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat perhitungan?')) {
        localStorage.removeItem('calculationHistory');
        document.getElementById('history').innerHTML = '';
        alert('Riwayat perhitungan telah dihapus.');
    }
}

// Modifikasi fungsi updateHistoryDisplay
function updateHistoryDisplay() {
    const history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    const historyElement = document.getElementById('history');
    if (history.length === 0) {
        historyElement.innerHTML = '<p>Belum ada riwayat perhitungan.</p>';
        return;
    }
    
    historyElement.innerHTML = '<h2 class="text-xl font-semibold mb-2">Riwayat Perhitungan</h2>';
    history.reverse().forEach(item => {
        historyElement.innerHTML += `
            <div class="mb-2 p-2 border-b">
                <p>Tanggal: ${new Date(item.date).toLocaleString()}</p>
                <p>Input: ${item.input}</p>
                <p>Hasil Akhir: ${item.finalResult}</p>
                <p>Lucky Result: ${item.luckyResult}</p>
                <p>Angka Main: ${item.luckyResult6}</p>
            </div>
        `;
    });
}

// Tambahkan event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('toggleHistory').addEventListener('click', toggleHistory);
    document.getElementById('clearHistory').addEventListener('click', clearHistory);
});


function calculate() {
    console.log('Memulai kalkulasi...');
    const input = inputNumbers.value;
    if (!/^\d{1,4}$/.test(input)) {
        alert('Please enter 1 to 4 digits');
        return;
    }

    const digits = input.split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    let finalSum = sum;
    while (finalSum >= 10) {
        finalSum = String(finalSum).split('').map(Number).reduce((a, b) => a + b, 0);
    }
    console.log('Sum:', sum, 'Final Sum:', finalSum);

    const breakdowns = digits.map((digit, index) => {
        const result = digit + finalSum;
        return {
            label: ['AS', 'KOP', 'KPLA', 'EKOR'][index],
            calculation: `${digit}+${finalSum} = ${result} (${Math.floor(result / 10)}+${result % 10}) = ${Math.floor(result / 10) + (result % 10)}`
        };
    });

    const finalResult = breakdowns.map(b => Math.floor((b.calculation.split('=')[2].trim()) / 10) + ((b.calculation.split('=')[2].trim()) % 10)).join('');
    
    // New algorithm for luckyResult (4 digits)
    const luckyResult = calculateLuckyResult(digits, finalResult, sum, finalSum);
    
    // New algorithm for luckyResult6 (6 digits)
    const luckyResult6 = calculateLuckyResult6(digits, finalResult, sum, finalSum);

    console.log('Final Result:', finalResult);
    console.log('Lucky Result:', luckyResult);
    console.log('Lucky Result 6:', luckyResult6);

    updateUI(digits, sum, finalSum, breakdowns, finalResult, luckyResult, luckyResult6);
    saveHistory(input, finalResult, luckyResult, luckyResult6);
    predictTrend();
    updateHistoryDisplay();
    console.log('Kalkulasi selesai');
}


function calculateLuckyResult(digits, finalResult, sum, finalSum) {
    console.log('Menghitung Lucky Result...');
    const primeFactors = [2, 3, 5, 7]; // Faktor prima untuk variasi tambahan
    let result = [];
    
    for (let i = 0; i < 4; i++) {
        let inputSum = digits.reduce((acc, digit, index) => acc + digit * (index + 1), 0);
        let finalResultWeight = finalResult.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
        let base = (parseInt(finalResult[i] || '0') + sum + finalSum + inputSum + finalResultWeight) % 10;
        let modifier = (digits[i] || 0) + (i * finalSum) + (primeFactors[i] * sum);
        let timeFactory = new Date().getSeconds() % 10;
        let digitResult = (base + modifier + timeFactory) % 10;

        console.log(`Digit ${i + 1}: Base=${base}, Modifier=${modifier}, Time Factor=${timeFactory}, Initial Result=${digitResult}`);
       
        while (result.includes(digitResult)) {
            digitResult = (digitResult + 1) % 10;
            console.log(`Collision detected, new digit: ${digitResult}`);
        }
        
        result.push(digitResult);
    }
    
    console.log('Lucky Result calculated:', result.join(''));
    return result.join('');
}

function calculateLuckyResult6(digits, finalResult, sum, finalSum) {
    console.log('Menghitung Lucky Result 6...');
    let finalResultDigits = [...new Set(finalResult.split(''))]; // Angka unik dari finalResult
    console.log('Unique digits from Final Result:', finalResultDigits);
    let result = new Set(finalResultDigits);
    
    // Fungsi untuk menghasilkan angka acak yang belum ada di result
    const getRandomUniqueNumber = () => {
        let num;
        do {
            num = Math.floor(Math.random() * 10);
        } while (result.has(num.toString()));
        return num.toString();
    };

    // Tambahkan angka acak hingga mencapai 6 digit
    while (result.size < 6) {
        let newDigit = getRandomUniqueNumber();
        console.log(`Adding new digit: ${newDigit}`);
        result.add(newDigit);
    }

    let shuffledResult = Array.from(result);
    console.log('Before shuffle:', shuffledResult.join(''));
    for (let i = shuffledResult.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledResult[i], shuffledResult[j]] = [shuffledResult[j], shuffledResult[i]];
    }
    console.log('After shuffle:', shuffledResult.join(''));

    return shuffledResult.join('');
}

function updateUI(digits, sum, finalSum, breakdowns, finalResult, luckyResult, luckyResult6) {
    document.getElementById('breakdown').textContent = `${digits.join(' + ')} = ${sum}`;
    document.getElementById('result').textContent = `${Math.floor(sum / 10)}+${sum % 10} = ${finalSum}`;
    breakdowns.forEach((b, i) => {
        document.getElementById(`breakdown${['A', 'B', 'C', 'D'][i]}`).textContent = `${b.label}: ${b.calculation}`;
    });
    document.getElementById('finalresult').textContent = finalResult;
    document.getElementById('luckyresult').textContent = luckyResult;
    document.getElementById('luckyresult6').textContent = luckyResult6;

    results.classList.remove('hidden');
}
