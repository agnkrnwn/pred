document.addEventListener('DOMContentLoaded', () => {
    const calculateBtn = document.getElementById('calculateBtn');
    const inputNumbers = document.getElementById('inputNumbers');
    const results = document.getElementById('results');
    const finalResult = document.getElementById('finalResult');
    const luckyResult = document.getElementById('luckyResult');
    const angkaMain = document.getElementById('angkaMain');

    calculateBtn.addEventListener('click', calculate);

    function calculate() {
        const input = inputNumbers.value;
        if (!/^\d{1,4}$/.test(input)) {
            alert('Please enter 1 to 4 digits');
            return;
        }

        const digits = input.split('').map(Number);
        const sum = digits.reduce((a, b) => a + b, 0);
        const finalSum = sum % 9 || 9;

        const final = digits.map(d => (d + finalSum) % 10).join('');
        
        const lucky = generateLuckyNumbers(input, final, sum);
        const main = generateAngkaMain(input, final, sum);

        finalResult.textContent = `Final Result: ${final}`;
        luckyResult.textContent = `Lucky Result: ${lucky}`;
        angkaMain.textContent = `Angka Main: ${main}`;

        results.classList.remove('hidden');
    }

    function generateLuckyNumbers(input, final, sum) {
        let result = '';
        for (let i = 0; i < 4; i++) {
            let num = (parseInt(input[i % input.length]) + parseInt(final[i % final.length]) + sum + i) % 10;
            result += num;
        }
        return result;
    }

    function generateAngkaMain(input, final, sum) {
        const seed = parseInt(input) + parseInt(final) + sum;
        const result = new Set();
        let i = 0;
        while (result.size < 6) {
            let num = (seed + i * sum) % 10;
            result.add(num);
            i++;
        }
        return Array.from(result).join('');
    }
});