/* ================= FUNGSI UMUM ================= */
function clearInput(inputId, resultId) {
    document.getElementById(inputId).value = '';
    document.getElementById(resultId).textContent = 'Hasil akan ditampilkan di sini...';
    document.getElementById(resultId).className = 'result-box';
}

function formatResultBox(elementId, isSuccess, message) {
    const resultBox = document.getElementById(elementId);
    resultBox.textContent = message;
    resultBox.className = isSuccess ? 'result-box success' : 'result-box error';
}

/* ================= GAUSS JORDAN ================= */
function gaussJordan() {
    let input = document.getElementById("matrixInput").value.trim();
    
    if (!input) {
        formatResultBox("resultGauss", false, "Error: Input matriks tidak boleh kosong.");
        return;
    }
    
    let rows = input.split("\n");
    let A = rows.map(r => r.trim().split(/\s+/).map(Number));
    
    // Validasi input
    const cols = A[0].length;
    for (let i = 0; i < A.length; i++) {
        if (A[i].length !== cols) {
            formatResultBox("resultGauss", false, `Error: Baris ke-${i+1} memiliki jumlah kolom yang berbeda.`);
            return;
        }
        
        for (let j = 0; j < A[i].length; j++) {
            if (isNaN(A[i][j])) {
                formatResultBox("resultGauss", false, `Error: Baris ke-${i+1}, kolom ke-${j+1} bukan angka.`);
                return;
            }
        }
    }
    
    let n = A.length;
    let m = A[0].length;
    
    // Proses Gauss-Jordan
    for (let i = 0; i < n; i++) {
        // Cari pivot maksimum pada kolom i
        let maxRow = i;
        let maxVal = Math.abs(A[i][i]);
        
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > maxVal) {
                maxVal = Math.abs(A[k][i]);
                maxRow = k;
            }
        }
        
        // Tukar baris jika diperlukan
        if (maxRow !== i) {
            [A[i], A[maxRow]] = [A[maxRow], A[i]];
        }
        
        let pivot = A[i][i];
        
        if (Math.abs(pivot) < 1e-10) {
            formatResultBox("resultGauss", false, "Error: Matriks singular, tidak memiliki solusi unik.");
            return;
        }
        
        // Normalisasi baris pivot
        for (let j = 0; j < m; j++) {
            A[i][j] /= pivot;
        }
        
        // Eliminasi kolom i di baris lain
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let factor = A[k][i];
                for (let j = 0; j < m; j++) {
                    A[k][j] -= factor * A[i][j];
                }
            }
        }
    }
    
    // Format hasil
    let hasil = "Matriks Identitas (solusi sistem persamaan):\n\n";
    
    // Tampilkan matriks hasil
    for (let i = 0; i < n; i++) {
        let row = "";
        for (let j = 0; j < m; j++) {
            // Format angka menjadi 4 digit desimal
            row += A[i][j].toFixed(4).padStart(10, ' ');
        }
        hasil += row + "\n";
    }
    
    // Tampilkan solusi
    hasil += "\nSolusi (nilai variabel):\n";
    for (let i = 0; i < n; i++) {
        hasil += `x${i+1} = ${A[i][m-1].toFixed(4)}\n`;
    }
    
    formatResultBox("resultGauss", true, hasil);
}

/* ================= REGRESI LINEAR ================= */
function regresiLinear() {
    let input = document.getElementById("regresiInput").value.trim();
    
    if (!input) {
        formatResultBox("resultRegresi", false, "Error: Input data tidak boleh kosong.");
        return;
    }
    
    let rows = input.split("\n");
    let data = [];
    
    // Validasi input
    for (let i = 0; i < rows.length; i++) {
        let values = rows[i].trim().split(/\s+/);
        if (values.length !== 2) {
            formatResultBox("resultRegresi", false, `Error: Baris ke-${i+1} harus memiliki tepat 2 nilai (x dan y).`);
            return;
        }
        
        let x = Number(values[0]);
        let y = Number(values[1]);
        
        if (isNaN(x) || isNaN(y)) {
            formatResultBox("resultRegresi", false, `Error: Baris ke-${i+1} mengandung nilai non-numerik.`);
            return;
        }
        
        data.push([x, y]);
    }
    
    if (data.length < 2) {
        formatResultBox("resultRegresi", false, "Error: Dibutuhkan minimal 2 pasang data untuk regresi linear.");
        return;
    }
    
    let n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    data.forEach(([x, y]) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
    });
    
    let a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    let b = (sumY - a * sumX) / n;
    
    // Hitung R-squared (koefisien determinasi)
    let yMean = sumY / n;
    let ssTotal = 0, ssResidual = 0;
    
    data.forEach(([x, y]) => {
        let yPred = a * x + b;
        ssTotal += Math.pow(y - yMean, 2);
        ssResidual += Math.pow(y - yPred, 2);
    });
    
    let rSquared = 1 - (ssResidual / ssTotal);
    
    // Format hasil
    let hasil = `PERSAMAAN REGRESI LINEAR:\n`;
    hasil += `y = ${a.toFixed(4)}x + ${b.toFixed(4)}\n\n`;
    
    hasil += `STATISTIK DATA:\n`;
    hasil += `Jumlah data (n) = ${n}\n`;
    hasil += `Σx = ${sumX.toFixed(4)}\n`;
    hasil += `Σy = ${sumY.toFixed(4)}\n`;
    hasil += `Σxy = ${sumXY.toFixed(4)}\n`;
    hasil += `Σx² = ${sumX2.toFixed(4)}\n\n`;
    
    hasil += `PARAMETER REGRESI:\n`;
    hasil += `Slope (a) = ${a.toFixed(4)}\n`;
    hasil += `Intercept (b) = ${b.toFixed(4)}\n`;
    hasil += `Koefisien determinasi (R²) = ${rSquared.toFixed(4)}\n\n`;
    
    hasil += `DATA DAN PREDIKSI:\n`;
    hasil += `x\t\ty Aktual\t\ty Prediksi\n`;
    hasil += `─\t\t─\t\t\t─\n`;
    
    data.forEach(([x, y]) => {
        let yPred = a * x + b;
        hasil += `${x.toFixed(2)}\t\t${y.toFixed(2)}\t\t\t${yPred.toFixed(2)}\n`;
    });
    
    formatResultBox("resultRegresi", true, hasil);
}