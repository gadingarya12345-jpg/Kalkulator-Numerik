/* ================= FUNGSI UMUM ================= */
function clearInput(inputId, resultId) {
    document.getElementById(inputId).value = '';
    document.getElementById(resultId).textContent = 'Hasil akan ditampilkan di sini...';
    document.getElementById(resultId).className = 'result-box';
    
    // Hapus langkah-langkah
    const stepsId = resultId.replace('result', 'steps');
    const stepsBox = document.getElementById(stepsId);
    if (stepsBox) {
        stepsBox.innerHTML = '';
        stepsBox.classList.remove('active');
    }
}

function formatResultBox(elementId, isSuccess, message) {
    const resultBox = document.getElementById(elementId);
    resultBox.textContent = message;
    resultBox.className = isSuccess ? 'result-box success' : 'result-box error';
}

function showExample(method) {
    if (method === 'gauss') {
        document.getElementById('matrixInput').value = '2 1 5\n4 4 6';
        formatResultBox("resultGauss", true, "Contoh telah dimuat.\nSistem persamaan:\n2x + y = 5\n4x + 4y = 6\n\nKlik 'Hitung Gauss-Jordan' untuk melihat hasil.");
    } else if (method === 'regresi') {
        document.getElementById('regresiInput').value = '1 2\n2 4\n3 5\n4 4\n5 6';
        formatResultBox("resultRegresi", true, "Contoh telah dimuat.\nData:\n(1, 2), (2, 4), (3, 5), (4, 4), (5, 6)\n\nKlik 'Hitung Regresi Linear' untuk melihat hasil.");
    }
}

/* ================= GAUSS JORDAN DENGAN LANGKAH-LANGKAH ================= */
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
            formatResultBox("resultGauss", false, `Error: Baris ke-${i+1} memiliki jumlah kolom yang berbeda.\nSemua baris harus memiliki jumlah kolom yang sama.`);
            return;
        }
        
        for (let j = 0; j < A[i].length; j++) {
            if (isNaN(A[i][j])) {
                formatResultBox("resultGauss", false, `Error: Baris ke-${i+1}, kolom ke-${j+1} bukan angka.\nPastikan hanya memasukkan angka yang dipisahkan spasi.`);
                return;
            }
        }
    }
    
    let n = A.length; // Jumlah baris
    let m = A[0].length; // Jumlah kolom
    
    // Validasi matriks augmented
    if (m !== n + 1) {
        formatResultBox("resultGauss", false, `Error: Matriks augmented harus memiliki ${n} kolom koefisien + 1 kolom konstanta.\nUkuran matriks saat ini: ${n}×${m}, seharusnya: ${n}×${n+1}`);
        return;
    }
    
    // Siapkan langkah-langkah
    const stepsBox = document.getElementById('stepsGauss');
    stepsBox.innerHTML = '<h4><i class="fas fa-list-ol"></i> Langkah-langkah Perhitungan</h4>';
    stepsBox.classList.add('active');
    
    // Tambahkan matriks awal
    addStep(stepsBox, 'Matriks Augmented Awal', matrixToString(A));
    
    // Proses Gauss-Jordan
    for (let i = 0; i < n; i++) {
        // Langkah 1: Pivoting (mencari pivot maksimum)
        let maxRow = i;
        let maxVal = Math.abs(A[i][i]);
        
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > maxVal) {
                maxVal = Math.abs(A[k][i]);
                maxRow = k;
            }
        }
        
        // Jika perlu menukar baris
        if (maxRow !== i) {
            [A[i], A[maxRow]] = [A[maxRow], A[i]];
            addStep(stepsBox, `Langkah ${i+1}.1: Pivoting`, `Menukar baris ${i+1} dengan baris ${maxRow+1}\n${matrixToString(A)}`);
        }
        
        let pivot = A[i][i];
        
        // Cek pivot nol
        if (Math.abs(pivot) < 1e-10) {
            addStep(stepsBox, `Langkah ${i+1}.2: Error`, `Pivot mendekati nol (${pivot.toFixed(6)}).\nSistem mungkin tidak memiliki solusi unik.`);
            formatResultBox("resultGauss", false, "Error: Matriks singular, tidak memiliki solusi unik.\nPivot mendekati nol.");
            return;
        }
        
        // Langkah 2: Normalisasi baris pivot
        for (let j = 0; j < m; j++) {
            A[i][j] /= pivot;
        }
        addStep(stepsBox, `Langkah ${i+1}.2: Normalisasi Baris ${i+1}`, `Membagi baris ${i+1} dengan pivot = ${pivot.toFixed(4)}\n${matrixToString(A)}`);
        
        // Langkah 3: Eliminasi kolom i di baris lain
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                let factor = A[k][i];
                if (Math.abs(factor) > 1e-10) { // Hanya lakukan eliminasi jika factor tidak nol
                    for (let j = 0; j < m; j++) {
                        A[k][j] -= factor * A[i][j];
                    }
                    addStep(stepsBox, `Langkah ${i+1}.3: Eliminasi Baris ${k+1}`, `Baris ${k+1} = Baris ${k+1} - (${factor.toFixed(4)} × Baris ${i+1})\n${matrixToString(A)}`);
                }
            }
        }
    }
    
    // Cek konsistensi solusi
    let isConsistent = true;
    for (let i = 0; i < n; i++) {
        // Cek jika semua koefisien nol tapi konstanta tidak nol
        let allZero = true;
        for (let j = 0; j < n; j++) {
            if (Math.abs(A[i][j]) > 1e-10) {
                allZero = false;
                break;
            }
        }
        if (allZero && Math.abs(A[i][n]) > 1e-10) {
            isConsistent = false;
            break;
        }
    }
    
    if (!isConsistent) {
        addStep(stepsBox, "Analisis Konsistensi", "Sistem tidak konsisten (tidak memiliki solusi).\nDitemukan baris dengan semua koefisien nol tetapi konstanta tidak nol.");
        formatResultBox("resultGauss", false, "Sistem persamaan tidak konsisten (tidak memiliki solusi).\nDitemukan kontradiksi dalam persamaan.");
        return;
    }
    
    // Format hasil akhir
    let hasil = "=== HASIL PERHITUNGAN GAUSS-JORDAN ===\n\n";
    hasil += "Matriks Identitas (Reduced Row Echelon Form):\n\n";
    
    // Tampilkan matriks hasil dengan format yang rapi
    for (let i = 0; i < n; i++) {
        let row = "";
        for (let j = 0; j < m; j++) {
            // Format angka
            let value = A[i][j];
            let formattedValue;
            if (Math.abs(value) < 1e-10) {
                formattedValue = "0.0000";
            } else {
                formattedValue = value.toFixed(4);
            }
            row += formattedValue.padStart(12, ' ');
        }
        hasil += row + "\n";
    }
    
    // Tampilkan solusi
    hasil += "\n=== SOLUSI SISTEM PERSAMAAN ===\n";
    let hasInfinite = false;
    for (let i = 0; i < n; i++) {
        // Cek apakah variabel bebas (semua koefisien nol)
        let allZero = true;
        for (let j = 0; j < n; j++) {
            if (Math.abs(A[i][j]) > 1e-10) {
                allZero = false;
                break;
            }
        }
        
        if (allZero) {
            if (Math.abs(A[i][n]) < 1e-10) {
                hasil += `x${i+1} = variabel bebas (∞ solusi)\n`;
                hasInfinite = true;
            }
        } else {
            hasil += `x${i+1} = ${A[i][n].toFixed(4)}\n`;
        }
    }
    
    if (hasInfinite) {
        hasil += "\nCatatan: Sistem memiliki tak terhingga banyak solusi.";
    }
    
    // Tambahkan interpretasi
    hasil += "\n=== INTERPRETASI ===\n";
    hasil += "• Matriks berhasil direduksi menjadi bentuk eselon baris tereduksi\n";
    hasil += "• Diagonal utama menjadi 1, elemen lainnya menjadi 0\n";
    hasil += "• Kolom terakhir menunjukkan solusi variabel\n";
    
    formatResultBox("resultGauss", true, hasil);
    
    // Tambahkan langkah terakhir
    addStep(stepsBox, "Hasil Akhir", "Matriks dalam bentuk Reduced Row Echelon Form (RREF)\nSolusi dapat dibaca dari kolom terakhir.");
}

function matrixToString(matrix) {
    let str = "";
    for (let i = 0; i < matrix.length; i++) {
        str += "[";
        for (let j = 0; j < matrix[i].length; j++) {
            let value = matrix[i][j];
            if (Math.abs(value) < 1e-10) value = 0;
            str += value.toFixed(4).padStart(10, ' ');
        }
        str += " ]\n";
    }
    return str;
}

function addStep(stepsBox, title, content) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-item';
    stepDiv.innerHTML = `
        <div class="step-title">
            <i class="fas fa-arrow-right"></i>
            ${title}
        </div>
        <div class="step-content">${content}</div>
    `;
    stepsBox.appendChild(stepDiv);
}

/* ================= REGRESI LINEAR DENGAN LANGKAH-LANGKAH ================= */
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
            formatResultBox("resultRegresi", false, `Error: Baris ke-${i+1} harus memiliki tepat 2 nilai (x dan y).\nFormat: x< spasi >y`);
            return;
        }
        
        let x = Number(values[0]);
        let y = Number(values[1]);
        
        if (isNaN(x) || isNaN(y)) {
            formatResultBox("resultRegresi", false, `Error: Baris ke-${i+1} mengandung nilai non-numerik.\nPastikan hanya memasukkan angka.`);
            return;
        }
        
        data.push([x, y]);
    }
    
    if (data.length < 2) {
        formatResultBox("resultRegresi", false, "Error: Dibutuhkan minimal 2 pasang data untuk regresi linear.");
        return;
    }
    
    // Siapkan langkah-langkah
    const stepsBox = document.getElementById('stepsRegresi');
    stepsBox.innerHTML = '<h4><i class="fas fa-list-ol"></i> Langkah-langkah Perhitungan</h4>';
    stepsBox.classList.add('active');
    
    // Tampilkan data awal
    let dataStr = "Data yang dimasukkan:\n";
    data.forEach(([x, y], idx) => {
        dataStr += `  ${idx+1}. (${x}, ${y})\n`;
    });
    addStep(stepsBox, 'Data Awal', dataStr);
    
    let n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    
    // Hitung jumlah-jumlah
    data.forEach(([x, y]) => {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
    });
    
    // Tampilkan perhitungan jumlah
    addStep(stepsBox, 'Menghitung Jumlah-Jumlah', 
        `n = ${n} (jumlah data)\n` +
        `Σx = ${sumX.toFixed(4)}\n` +
        `Σy = ${sumY.toFixed(4)}\n` +
        `Σxy = ${sumXY.toFixed(4)}\n` +
        `Σx² = ${sumX2.toFixed(4)}\n` +
        `Σy² = ${sumY2.toFixed(4)}`
    );
    
    // Hitung rata-rata
    let meanX = sumX / n;
    let meanY = sumY / n;
    
    // Hitung slope (b) dengan rumus yang benar
    let numerator = n * sumXY - sumX * sumY;
    let denominator = n * sumX2 - sumX * sumX;
    
    // Validasi denominator
    if (Math.abs(denominator) < 1e-10) {
        addStep(stepsBox, 'Error', `Penyebut mendekati nol (${denominator.toFixed(6)}).\nData x mungkin konstan.`);
        formatResultBox("resultRegresi", false, "Error: Penyebut perhitungan mendekati nol.\nMungkin semua nilai x sama (variansi x = 0).");
        return;
    }
    
    let b = numerator / denominator;
    
    // Hitung intercept (a)
    let a = meanY - b * meanX;
    
    // Tampilkan rumus dan perhitungan
    addStep(stepsBox, 'Menghitung Slope (b)', 
        `Rumus: b = (nΣxy - ΣxΣy) / (nΣx² - (Σx)²)\n` +
        `b = (${n} × ${sumXY.toFixed(4)} - ${sumX.toFixed(4)} × ${sumY.toFixed(4)}) / (${n} × ${sumX2.toFixed(4)} - ${sumX.toFixed(4)}²)\n` +
        `b = (${(n*sumXY).toFixed(4)} - ${(sumX*sumY).toFixed(4)}) / (${(n*sumX2).toFixed(4)} - ${(sumX*sumX).toFixed(4)})\n` +
        `b = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}\n` +
        `b = ${b.toFixed(4)}`
    );
    
    addStep(stepsBox, 'Menghitung Intercept (a)', 
        `Rumus: a = ȳ - b x̄\n` +
        `a = ${meanY.toFixed(4)} - ${b.toFixed(4)} × ${meanX.toFixed(4)}\n` +
        `a = ${meanY.toFixed(4)} - ${(b*meanX).toFixed(4)}\n` +
        `a = ${a.toFixed(4)}`
    );
    
    // Hitung prediksi dan kesalahan
    let ssTotal = 0, ssResidual = 0;
    let predictions = [];
    
    data.forEach(([x, y]) => {
        let yPred = a + b * x;
        predictions.push([x, y, yPred]);
        ssTotal += Math.pow(y - meanY, 2);
        ssResidual += Math.pow(y - yPred, 2);
    });
    
    // Hitung R-squared
    let rSquared = 1 - (ssResidual / ssTotal);
    
    // Hitung korelasi (r)
    let r = Math.sqrt(rSquared);
    if (b < 0) r = -r; // Tanda korelasi sesuai slope
    
    // Hitung standar error
    let standardError = Math.sqrt(ssResidual / (n - 2));
    
    // Tampilkan perhitungan R-squared
    addStep(stepsBox, 'Menghitung Koefisien Determinasi (R²)', 
        `R² = 1 - (SSresidual / SStotal)\n` +
        `SSresidual = Σ(yᵢ - ŷᵢ)² = ${ssResidual.toFixed(4)}\n` +
        `SStotal = Σ(yᵢ - ȳ)² = ${ssTotal.toFixed(4)}\n` +
        `R² = 1 - (${ssResidual.toFixed(4)} / ${ssTotal.toFixed(4)})\n` +
        `R² = 1 - ${(ssResidual/ssTotal).toFixed(4)}\n` +
        `R² = ${rSquared.toFixed(4)}`
    );
    
    // Format hasil akhir
    let hasil = "=== HASIL REGRESI LINEAR ===\n\n";
    hasil += `Persamaan Regresi:\n`;
    hasil += `y = ${a.toFixed(4)} + ${b.toFixed(4)}x\n\n`;
    
    hasil += `=== PARAMETER STATISTIK ===\n`;
    hasil += `Jumlah data (n): ${n}\n`;
    hasil += `Rata-rata x (x̄): ${meanX.toFixed(4)}\n`;
    hasil += `Rata-rata y (ȳ): ${meanY.toFixed(4)}\n`;
    hasil += `Slope (b): ${b.toFixed(4)}\n`;
    hasil += `Intercept (a): ${a.toFixed(4)}\n\n`;
    
    hasil += `=== UKURAN KECOCOKAN ===\n`;
    hasil += `Koefisien Determinasi (R²): ${rSquared.toFixed(4)}\n`;
    hasil += `Koefisien Korelasi (r): ${r.toFixed(4)}\n`;
    hasil += `Standar Error: ${standardError.toFixed(4)}\n\n`;
    
    hasil += `Interpretasi R²:\n`;
    if (rSquared >= 0.9) {
        hasil += `  Sangat kuat (${(rSquared*100).toFixed(1)}% variasi y dijelaskan oleh x)\n`;
    } else if (rSquared >= 0.7) {
        hasil += `  Kuat (${(rSquared*100).toFixed(1)}% variasi y dijelaskan oleh x)\n`;
    } else if (rSquared >= 0.5) {
        hasil += `  Sedang (${(rSquared*100).toFixed(1)}% variasi y dijelaskan oleh x)\n`;
    } else {
        hasil += `  Lemah (${(rSquared*100).toFixed(1)}% variasi y dijelaskan oleh x)\n`;
    }
    
    hasil += `\n=== DATA DAN PREDIKSI ===\n`;
    hasil += `No.\tx\ty Aktual\ty Prediksi\tSelisih\n`;
    hasil += `──\t──\t────────\t──────────\t───────\n`;
    
    predictions.forEach(([x, y, yPred], idx) => {
        let diff = y - yPred;
        hasil += `${(idx+1).toString().padStart(2, ' ')}\t${x.toFixed(2)}\t${y.toFixed(4).padStart(8, ' ')}\t${yPred.toFixed(4).padStart(10, ' ')}\t${diff.toFixed(4)}\n`;
    });
    
    formatResultBox("resultRegresi", true, hasil);
}
