document.getElementById('calculateBtn').addEventListener('click', function() {
    const inputNumbers = document.getElementById('inputNumbers').value;
    let sum = 0;
    let breakdownText = '';
    let digitA = 0;
    let digitB = 0;
    let digitC = 0;
    let digitD = 0;
  
    for (let i = 0; i < inputNumbers.length; i++) {
      const digit = parseInt(inputNumbers[i]);
      sum += digit;
      breakdownText += (i === 0 ? '' : ' + ') + inputNumbers[i];
  
      if (i === 0) digitA = digit;
      else if (i === 1) digitB = digit;
      else if (i === 2) digitC = digit;
      else if (i === 3) digitD = digit;
    }
  
    let originalSum = sum;
    while (sum >= 10) {
      let newSum = 0;
      while (sum > 0) {
        newSum += sum % 10;
        sum = Math.floor(sum / 10);
      }
      sum = newSum;
    }
  
    const breakdownA = Math.floor((digitA + sum) / 10 + (digitA + sum) % 10);
    const breakdownB = Math.floor((digitB + sum) / 10 + (digitB + sum) % 10);
    const breakdownC = Math.floor((digitC + sum) / 10 + (digitC + sum) % 10);
    const breakdownD = Math.floor((digitD + sum) / 10 + (digitD + sum) % 10);
  
    document.getElementById('result').textContent = `${Math.floor(originalSum / 10)}+${originalSum % 10} = ${sum}`;
    document.getElementById('breakdown').textContent = `${breakdownText} = ${originalSum} `;
    document.getElementById('breakdownA').textContent = `${digitA}+${sum} = ${digitA + sum} (${Math.floor((digitA + sum) / 10)}+${(digitA + sum) % 10}) = ${Math.floor((digitA + sum) / 10 + (digitA + sum) % 10)}`;
    document.getElementById('breakdownB').textContent = `${digitB}+${sum} = ${digitB + sum} (${Math.floor((digitB + sum) / 10)}+${(digitB + sum) % 10}) = ${Math.floor((digitB + sum) / 10 + (digitB + sum) % 10)}`;
    document.getElementById('breakdownC').textContent = `${digitC}+${sum} = ${digitC + sum} (${Math.floor((digitC + sum) / 10)}+${(digitC + sum) % 10}) = ${Math.floor((digitC + sum) / 10 + (digitC + sum) % 10)}`;
    document.getElementById('breakdownD').textContent = `${digitD}+${sum} = ${digitD + sum} (${Math.floor((digitD + sum) / 10)}+${(digitD + sum) % 10}) = ${Math.floor((digitD + sum) / 10 + (digitD + sum) % 10)}`;
  
    
    // Calculate the final result as concatenated digits
    const finalResult = `${breakdownA}${breakdownB}${breakdownC}${breakdownD}`;
    document.getElementById('finalresult').textContent = ` ${finalResult}`;
  
    // Calculate and display the lucky result
    const luckyResult = (parseInt(finalResult) * (Math.random() * 10) * (inputNumbers) / (originalSum) * (Math.random() * breakdownB) ).toFixed(0).slice(0, 4);
    document.getElementById('luckyresult').textContent = ` ${luckyResult}`;
    //const luckyResult6 = (parseInt(finalResult) * (Math.random() + 88) * (inputNumbers) * (originalSum) / (Math.random() * breakdownA) / (breakdownB) * (breakdownC) ).toFixed(0).slice(0, 6);
    //document.getElementById('luckyresult6').textContent = ` ${luckyResult6}`;

    const luckyResult6 = generateUniqueRandomNumbers(6, 0, 9);
    document.getElementById('luckyresult6').textContent = luckyResult6.join('');

    // Display the sections
  document.getElementById('breakdownSection').style.display = 'block';
  document.getElementById('digitBreakdownSection').style.display = 'block';
  document.getElementById('resultSection').style.display = 'block';
  document.getElementById('finalLuckySection').style.display = 'block';
  document.getElementById('finalLuckySection2').style.display = 'block';
  document.getElementById('txt').style.display = 'block';
  });
  
function generateUniqueRandomNumbers(count, min, max) {
    const uniqueNumbers = new Set();
  
    while (uniqueNumbers.size < count) {
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min ;
      uniqueNumbers.add(randomNumber);
    }
  
    return Array.from(uniqueNumbers);
}
