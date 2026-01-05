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

/* ================= GAUSS JORDAN DENGAN LANGKAH-LANGKAH ================= */
function gaussJordan() {
    console.log("Fungsi gaussJordan dipanggil"); // Debug log
    
    try {
        let input = document.getElementById("matrixInput").value.trim();
        
        if (!input) {
            formatResultBox("resultGauss", false, "Error: Input matriks tidak boleh kosong.");
            return;
        }
        
        let rows = input.split("\n");
        console.log("Jumlah baris:", rows.length); // Debug log
        
        // Bersihkan spasi ekstra dan konversi ke angka
        let A = [];
        for (let i = 0; i < rows.length; i++) {
            // Split dengan satu atau lebih spasi
            let values = rows[i].trim().split(/\s+/);
            console.log(`Baris ${i+1}:`, values); // Debug log
            
            // Konversi ke angka
            let row = [];
            for (let j = 0; j < values.length; j++) {
                let num = Number(values[j]);
                if (isNaN(num)) {
                    formatResultBox("resultGauss", false, `Error: Baris ke-${i+1}, kolom ke-${j+1} ("${values[j]}") bukan angka yang valid.`);
                    return;
                }
                row.push(num);
            }
            A.push(row);
        }
        
        // Validasi semua baris memiliki jumlah kolom yang sama
        const firstRowLength = A[0].length;
        for (let i = 1; i < A.length; i++) {
            if (A[i].length !== firstRowLength) {
                formatResultBox("resultGauss", false, `Error: Baris ke-${i+1} memiliki ${A[i].length} kolom, tetapi baris pertama memiliki ${firstRowLength} kolom.\nSemua baris harus memiliki jumlah kolom yang sama.`);
                return;
            }
        }
        
        let n = A.length; // Jumlah baris
        let m = A[0].length; // Jumlah kolom
        
        console.log(`Ukuran matriks: ${n} × ${m}`); // Debug log
        
        // Tentukan jenis matriks
        let isAugmented = false;
        let message = "";
        
        if (m === n + 1) {
            // Matriks augmented untuk sistem persamaan
            isAugmented = true;
            message = "Matriks augmented terdeteksi. Menyelesaikan sistem persamaan linear...";
        } else if (m === n) {
            // Matriks persegi
            isAugmented = false;
            message = "Matriks persegi terdeteksi. Akan mencari invers matriks...";
        } else {
            // Ukuran tidak sesuai
            if (m < n) {
                formatResultBox("resultGauss", false, 
                    `Error: Jumlah kolom (${m}) lebih kecil dari jumlah baris (${n}).\n` +
                    `Untuk matriks augmented: diperlukan ${n} kolom koefisien + 1 kolom konstanta = ${n+1} kolom\n` +
                    `Untuk matriks persegi: diperlukan ${n} kolom`);
            } else {
                formatResultBox("resultGauss", false, 
                    `Error: Ukuran matriks tidak sesuai.\n` +
                    `Matriks: ${n} baris × ${m} kolom\n` +
                    `Untuk sistem persamaan: diperlukan ${n}×${n+1} (matriks augmented)\n` +
                    `Untuk matriks persegi: diperlukan ${n}×${n}`);
            }
            return;
        }
        
        // Siapkan langkah-langkah
        const stepsBox = document.getElementById('stepsGauss');
        stepsBox.innerHTML = '<h4><i class="fas fa-list-ol"></i> Langkah-langkah Perhitungan</h4>';
        stepsBox.classList.add('active');
        
        // Tambahkan informasi matriks
        addStep(stepsBox, 'Informasi Matriks', 
            `${message}\n` +
            `Ukuran: ${n} × ${m}\n` +
            `Jenis: ${isAugmented ? 'Matriks Augmented [A|b]' : 'Matriks Persegi A'}`
        );
        
        // Simpan matriks asli untuk referensi
        let originalMatrix = JSON.parse(JSON.stringify(A));
        
        // Jika matriks persegi, buat matriks augmented [A|I] untuk mencari invers
        if (!isAugmented) {
            let augmentedA = [];
            for (let i = 0; i < n; i++) {
                augmentedA[i] = [...A[i]];
                for (let j = 0; j < n; j++) {
                    augmentedA[i].push(i === j ? 1 : 0);
                }
            }
            A = augmentedA;
            m = A[0].length; // Update jumlah kolom
            addStep(stepsBox, 'Membuat Matriks Augmented [A|I]', 
                'Matriks identitas ditambahkan untuk mencari invers matriks:\n' +
                matrixToString(A)
            );
        } else {
            // Tampilkan matriks awal
            addStep(stepsBox, 'Matriks Awal', matrixToString(A));
        }
        
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
                addStep(stepsBox, `Langkah ${i+1}.1: Pivoting`, `Menukar baris ${i+1} dengan baris ${maxRow+1}:\n${matrixToString(A)}`);
            }
            
            let pivot = A[i][i];
            
            // Cek pivot nol
            if (Math.abs(pivot) < 1e-10) {
                addStep(stepsBox, `Langkah ${i+1}.2: Error`, `Pivot mendekati nol (${pivot.toFixed(6)}).\nSistem mungkin tidak memiliki solusi unik.`);
                
                if (!isAugmented) {
                    formatResultBox("resultGauss", false, "Error: Matriks singular, tidak memiliki invers.\nPivot mendekati nol.");
                } else {
                    formatResultBox("resultGauss", false, "Error: Matriks singular, tidak memiliki solusi unik.\nPivot mendekati nol.");
                }
                return;
            }
            
            // Langkah 2: Normalisasi baris pivot
            for (let j = 0; j < m; j++) {
                A[i][j] /= pivot;
            }
            addStep(stepsBox, `Langkah ${i+1}.2: Normalisasi Baris ${i+1}`, `Membagi baris ${i+1} dengan pivot = ${pivot.toFixed(4)}:\n${matrixToString(A)}`);
            
            // Langkah 3: Eliminasi kolom i di baris lain
            for (let k = 0; k < n; k++) {
                if (k !== i) {
                    let factor = A[k][i];
                    if (Math.abs(factor) > 1e-10) {
                        for (let j = 0; j < m; j++) {
                            A[k][j] -= factor * A[i][j];
                        }
                        addStep(stepsBox, `Langkah ${i+1}.3: Eliminasi Baris ${k+1}`, `Baris ${k+1} = Baris ${k+1} - (${factor.toFixed(4)} × Baris ${i+1}):\n${matrixToString(A)}`);
                    }
                }
            }
        }
        
        // Format hasil akhir
        let hasil = "";
        
        if (isAugmented) {
            // Untuk matriks augmented [A|b] - Sistem Persamaan
            hasil = "=== HASIL PERHITUNGAN GAUSS-JORDAN ===\n\n";
            hasil += "Matriks dalam Reduced Row Echelon Form (RREF):\n\n";
            
            // Tampilkan matriks hasil
            for (let i = 0; i < n; i++) {
                let row = "";
                for (let j = 0; j < m; j++) {
                    let value = A[i][j];
                    let formattedValue = (Math.abs(value) < 1e-10) ? "0.0000" : value.toFixed(4);
                    row += formattedValue.padStart(12, ' ');
                }
                hasil += row + "\n";
            }
            
            // Cek konsistensi dan tampilkan solusi
            let isConsistent = true;
            let hasInfinite = false;
            let freeVariables = [];
            
            hasil += "\n=== SOLUSI SISTEM PERSAMAAN ===\n";
            
            for (let i = 0; i < n; i++) {
                // Cek jika semua koefisien nol
                let allZeroCoeff = true;
                for (let j = 0; j < n; j++) {
                    if (Math.abs(A[i][j]) > 1e-10) {
                        allZeroCoeff = false;
                        break;
                    }
                }
                
                if (allZeroCoeff) {
                    if (Math.abs(A[i][n]) > 1e-10) {
                        // 0 = konstanta (tidak nol) → tidak konsisten
                        isConsistent = false;
                        hasil += `Baris ${i+1}: 0 = ${A[i][n].toFixed(4)} → KONTRA DIKSI!\n`;
                    } else {
                        // 0 = 0 → variabel bebas
                        hasInfinite = true;
                        freeVariables.push(i+1);
                    }
                }
            }
            
            // Tampilkan solusi variabel
            if (isConsistent) {
                for (let i = 0; i < n; i++) {
                    if (!freeVariables.includes(i+1)) {
                        hasil += `x${i+1} = ${A[i][n].toFixed(4)}\n`;
                    }
                }
                
                if (hasInfinite) {
                    hasil += `\nVariabel bebas: x${freeVariables.join(', x')}\n`;
                    hasil += "Sistem memiliki tak hingga banyak solusi.\n";
                    hasil += "Variabel bebas dapat bernilai sembarang bilangan real.";
                } else {
                    hasil += "\n✓ SISTEM MEMILIKI SOLUSI UNIK";
                }
            } else {
                hasil += "\n✗ SISTEM TIDAK KONSISTEN (TIDAK MEMILIKI SOLUSI)\n";
                hasil += "Ditemukan persamaan yang kontradiktif (0 = konstanta ≠ 0)";
            }
            
        } else {
            // Untuk matriks persegi - Mencari Invers
            hasil = "=== HASIL INVERS MATRIKS ===\n\n";
            
            // Pisahkan matriks identitas dan invers
            let identityMatrix = [];
            let inverseMatrix = [];
            
            for (let i = 0; i < n; i++) {
                identityMatrix[i] = A[i].slice(0, n);
                inverseMatrix[i] = A[i].slice(n);
            }
            
            hasil += "Matriks Awal:\n";
            for (let i = 0; i < n; i++) {
                let row = "";
                for (let j = 0; j < n; j++) {
                    let value = originalMatrix[i][j];
                    let formattedValue = (Math.abs(value) < 1e-10) ? "0.0000" : value.toFixed(4);
                    row += formattedValue.padStart(12, ' ');
                }
                hasil += row + "\n";
            }
            
            hasil += "\nMatriks Invers A⁻¹:\n";
            for (let i = 0; i < n; i++) {
                let row = "";
                for (let j = 0; j < n; j++) {
                    let value = inverseMatrix[i][j];
                    let formattedValue = (Math.abs(value) < 1e-10) ? "0.0000" : value.toFixed(4);
                    row += formattedValue.padStart(12, ' ');
                }
                hasil += row + "\n";
            }
            
            // Verifikasi A × A⁻¹ = I
            hasil += "\n=== VERIFIKASI A × A⁻¹ = I ===\n";
            
            let verification = [];
            for (let i = 0; i < n; i++) {
                verification[i] = [];
                for (let j = 0; j < n; j++) {
                    let sum = 0;
                    for (let k = 0; k < n; k++) {
                        sum += originalMatrix[i][k] * inverseMatrix[k][j];
                    }
                    verification[i][j] = sum;
                }
            }
            
            // Tampilkan hasil verifikasi
            let isIdentity = true;
            for (let i = 0; i < n; i++) {
                let row = "";
                for (let j = 0; j < n; j++) {
                    let value = verification[i][j];
                    let expected = (i === j ? 1 : 0);
                    let diff = Math.abs(value - expected);
                    
                    if (diff < 1e-10) {
                        row += expected.toFixed(4).padStart(12, ' ');
                    } else {
                        row += value.toFixed(4).padStart(12, ' ');
                        isIdentity = false;
                    }
                }
                hasil += row + "\n";
            }
            
            if (isIdentity) {
                hasil += "\n✓ VERIFIKASI BERHASIL: A × A⁻¹ = I (matriks identitas)";
            } else {
                hasil += "\n⚠️ PERHATIAN: A × A⁻¹ ≈ I (mungkin ada error numerik kecil)\n";
                hasil += "Selisih maksimum dari matriks identitas: " + 
                    Math.max(...verification.flat().map((v, idx) => {
                        let i = Math.floor(idx / n);
                        let j = idx % n;
                        return Math.abs(v - (i === j ? 1 : 0));
                    })).toFixed(10);
            }
        }
        
        // Tambahkan interpretasi
        hasil += "\n\n=== INTERPRETASI ===\n";
        hasil += "• Metode Gauss-Jordan mengubah matriks menjadi bentuk eselon baris tereduksi\n";
        hasil += "• Diagonal utama menjadi 1, semua elemen lainnya menjadi 0\n";
        hasil += "• Dilengkapi dengan pivoting parsial untuk stabilitas numerik\n";
        
        if (isAugmented) {
            hasil += "• Kolom terakhir matriks augmented adalah solusi sistem persamaan";
        } else {
            hasil += "• Matriks invers dapat digunakan untuk menyelesaikan A·x = b dengan x = A⁻¹·b";
        }
        
        formatResultBox("resultGauss", true, hasil);
        
        // Tambahkan langkah terakhir
        addStep(stepsBox, "Hasil Akhir", 
            `Perhitungan Gauss-Jordan selesai.\n` +
            `${isAugmented ? 'Solusi sistem persamaan dapat dibaca dari kolom terakhir matriks.' : 'Matriks invers dapat dibaca dari bagian kanan matriks.'}`
        );
        
    } catch (error) {
        console.error("Error dalam gaussJordan:", error);
        formatResultBox("resultGauss", false, `Terjadi kesalahan: ${error.message}\n\nSilakan periksa input Anda dan coba lagi.`);
    }
}

/* ================= REGRESI LINEAR DENGAN LANGKAH-LANGKAH ================= */
function regresiLinear() {
    console.log("Fungsi regresiLinear dipanggil"); // Debug log
    
    try {
        let input = document.getElementById("regresiInput").value.trim();
        
        if (!input) {
            formatResultBox("resultRegresi", false, "Error: Input data tidak boleh kosong.");
            return;
        }
        
        let rows = input.split("\n");
        let data = [];
        
        // Validasi dan parsing input
        for (let i = 0; i < rows.length; i++) {
            let values = rows[i].trim().split(/\s+/);
            
            if (values.length !== 2) {
                formatResultBox("resultRegresi", false, 
                    `Error: Baris ke-${i+1} harus memiliki tepat 2 nilai (x dan y).\n` +
                    `Format yang benar: x spasi y\n` +
                    `Contoh: 1 2 atau 3.5 4.2`
                );
                return;
            }
            
            let x = Number(values[0]);
            let y = Number(values[1]);
            
            if (isNaN(x) || isNaN(y)) {
                formatResultBox("resultRegresi", false, 
                    `Error: Baris ke-${i+1} mengandung nilai non-numerik.\n` +
                    `x = "${values[0]}", y = "${values[1]}"\n` +
                    `Pastikan keduanya adalah angka yang valid.`
                );
                return;
            }
            
            data.push([x, y]);
        }
        
        if (data.length < 2) {
            formatResultBox("resultRegresi", false, 
                `Error: Dibutuhkan minimal 2 pasang data untuk regresi linear.\n` +
                `Jumlah data saat ini: ${data.length}`
            );
            return;
        }
        
        // Siapkan langkah-langkah
        const stepsBox = document.getElementById('stepsRegresi');
        stepsBox.innerHTML = '<h4><i class="fas fa-list-ol"></i> Langkah-langkah Perhitungan</h4>';
        stepsBox.classList.add('active');
        
        // Tampilkan data awal
        let dataStr = "Data yang dimasukkan:\n";
        data.forEach(([x, y], idx) => {
            dataStr += `  ${idx+1}. x = ${x}, y = ${y}\n`;
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
        
        // Hitung rata-rata
        let meanX = sumX / n;
        let meanY = sumY / n;
        
        // Tampilkan perhitungan jumlah
        addStep(stepsBox, 'Menghitung Σ (Sigma)', 
            `n = ${n} (jumlah data)\n` +
            `Σx = ${sumX.toFixed(6)}\n` +
            `Σy = ${sumY.toFixed(6)}\n` +
            `Σxy = ${sumXY.toFixed(6)}\n` +
            `Σx² = ${sumX2.toFixed(6)}\n` +
            `Σy² = ${sumY2.toFixed(6)}\n\n` +
            `Rata-rata x (x̄) = Σx / n = ${meanX.toFixed(6)}\n` +
            `Rata-rata y (ȳ) = Σy / n = ${meanY.toFixed(6)}`
        );
        
        // Hitung slope (b)
        let numerator = n * sumXY - sumX * sumY;
        let denominator = n * sumX2 - sumX * sumX;
        
        // Validasi denominator
        if (Math.abs(denominator) < 1e-10) {
            addStep(stepsBox, 'Error', 
                `Penyebut mendekati nol: ${denominator.toFixed(10)}\n` +
                `Hal ini terjadi ketika semua nilai x sama (variansi x = 0).\n` +
                `Regresi linear tidak dapat dihitung untuk data ini.`
            );
            formatResultBox("resultRegresi", false, 
                "Error: Tidak dapat menghitung regresi linear.\n" +
                "Semua nilai x sama (tidak ada variasi).\n" +
                "Variansi x = 0, penyebut = " + denominator.toFixed(10)
            );
            return;
        }
        
        let b = numerator / denominator;
        
        // Hitung intercept (a)
        let a = meanY - b * meanX;
        
        // Tampilkan perhitungan slope dan intercept
        addStep(stepsBox, 'Menghitung Slope (b)', 
            `Rumus: b = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²)\n` +
            `b = (${n} × ${sumXY.toFixed(4)} - ${sumX.toFixed(4)} × ${sumY.toFixed(4)}) / (${n} × ${sumX2.toFixed(4)} - ${sumX.toFixed(4)}²)\n` +
            `b = (${(n*sumXY).toFixed(4)} - ${(sumX*sumY).toFixed(4)}) / (${(n*sumX2).toFixed(4)} - ${Math.pow(sumX, 2).toFixed(4)})\n` +
            `b = ${numerator.toFixed(4)} / ${denominator.toFixed(4)}\n` +
            `b = ${b.toFixed(6)}`
        );
        
        addStep(stepsBox, 'Menghitung Intercept (a)', 
            `Rumus: a = ȳ - b·x̄\n` +
            `a = ${meanY.toFixed(4)} - ${b.toFixed(4)} × ${meanX.toFixed(4)}\n` +
            `a = ${meanY.toFixed(4)} - ${(b*meanX).toFixed(4)}\n` +
            `a = ${a.toFixed(6)}`
        );
        
        // Hitung prediksi, SST, SSR, dan SSE
        let SST = 0; // Total Sum of Squares
        let SSR = 0; // Regression Sum of Squares
        let SSE = 0; // Error Sum of Squares
        let predictions = [];
        
        data.forEach(([x, y]) => {
            let yPred = a + b * x;
            predictions.push([x, y, yPred]);
            
            SST += Math.pow(y - meanY, 2);
            SSR += Math.pow(yPred - meanY, 2);
            SSE += Math.pow(y - yPred, 2);
        });
        
        // Hitung R-squared
        let rSquared = 1 - (SSE / SST);
        
        // Hitung koefisien korelasi (r)
        let r = (b > 0 ? 1 : -1) * Math.sqrt(rSquared);
        
        // Hitung standar error
        let standardError = Math.sqrt(SSE / (n - 2));
        
        // Hitung standar error untuk slope dan intercept
        let seSlope = standardError / Math.sqrt(sumX2 - n * Math.pow(meanX, 2));
        let seIntercept = standardError * Math.sqrt(sumX2 / (n * (sumX2 - n * Math.pow(meanX, 2))));
        
        // Tampilkan perhitungan R-squared
        addStep(stepsBox, 'Menghitung Koefisien Determinasi (R²)', 
            `SST (Total Sum of Squares) = Σ(yᵢ - ȳ)² = ${SST.toFixed(6)}\n` +
            `SSE (Error Sum of Squares) = Σ(yᵢ - ŷᵢ)² = ${SSE.toFixed(6)}\n` +
            `SSR (Regression Sum of Squares) = Σ(ŷᵢ - ȳ)² = ${SSR.toFixed(6)}\n\n` +
            `R² = 1 - (SSE / SST)\n` +
            `R² = 1 - (${SSE.toFixed(6)} / ${SST.toFixed(6)})\n` +
            `R² = 1 - ${(SSE/SST).toFixed(6)}\n` +
            `R² = ${rSquared.toFixed(6)}\n\n` +
            `Koefisien Korelasi (r) = ${r.toFixed(6)}`
        );
        
        // Format hasil akhir
        let hasil = "=== HASIL REGRESI LINEAR ===\n\n";
        
        hasil += `Persamaan Regresi Linear:\n`;
        hasil += `ŷ = ${a.toFixed(6)} + ${b.toFixed(6)}·x\n\n`;
        
        hasil += `=== PARAMETER STATISTIK ===\n`;
        hasil += `Jumlah data (n): ${n}\n`;
        hasil += `Rata-rata x (x̄): ${meanX.toFixed(6)}\n`;
        hasil += `Rata-rata y (ȳ): ${meanY.toFixed(6)}\n`;
        hasil += `Slope (b): ${b.toFixed(6)} ± ${seSlope.toFixed(6)}\n`;
        hasil += `Intercept (a): ${a.toFixed(6)} ± ${seIntercept.toFixed(6)}\n\n`;
        
        hasil += `=== UKURAN KECOCOKAN MODEL ===\n`;
        hasil += `Koefisien Determinasi (R²): ${rSquared.toFixed(6)}\n`;
        hasil += `Koefisien Korelasi (r): ${r.toFixed(6)}\n`;
        hasil += `Standar Error Estimasi: ${standardError.toFixed(6)}\n`;
        hasil += `SST (Total): ${SST.toFixed(6)}\n`;
        hasil += `SSR (Regression): ${SSR.toFixed(6)}\n`;
        hasil += `SSE (Error): ${SSE.toFixed(6)}\n\n`;
        
        hasil += `=== INTERPRETASI R² ===\n`;
        let r2Percent = (rSquared * 100).toFixed(2);
        if (rSquared >= 0.9) {
            hasil += `  Sangat kuat (${r2Percent}% variasi y dijelaskan oleh x) ✓\n`;
        } else if (rSquared >= 0.7) {
            hasil += `  Kuat (${r2Percent}% variasi y dijelaskan oleh x) ✓\n`;
        } else if (rSquared >= 0.5) {
            hasil += `  Sedang (${r2Percent}% variasi y dijelaskan oleh x)\n`;
        } else if (rSquared >= 0.3) {
            hasil += `  Lemah (${r2Percent}% variasi y dijelaskan oleh x)\n`;
        } else {
            hasil += `  Sangat lemah (${r2Percent}% variasi y dijelaskan oleh x)\n`;
        }
        
        if (Math.abs(r) >= 0.7) {
            hasil += `  Korelasi ${r > 0 ? 'positif' : 'negatif'} yang kuat antara x dan y\n`;
        }
        
        hasil += `\n=== DATA DAN PREDIKSI ===\n`;
        hasil += `No.\tx\t\ty Aktual\tŷ Prediksi\tResidual (y-ŷ)\n`;
        hasil += `──\t──\t\t────────\t──────────\t─────────────\n`;
        
        predictions.forEach(([x, y, yPred], idx) => {
            let residual = y - yPred;
            hasil += `${(idx+1).toString().padStart(2)}` +
                    `\t${x.toFixed(4).padStart(8)}` +
                    `\t${y.toFixed(4).padStart(12)}` +
                    `\t${yPred.toFixed(4).padStart(12)}` +
                    `\t${residual.toFixed(6).padStart(14)}\n`;
        });
        
        // Hitung statistik residual
        let meanResidual = predictions.reduce((sum, [,,, residual]) => sum + (residual || 0), 0) / n;
        let residualStd = Math.sqrt(predictions.reduce((sum, [,,, residual]) => {
            return sum + Math.pow((residual || 0) - meanResidual, 2);
        }, 0) / (n - 1));
        
        hasil += `\nStatistik Residual:\n`;
        hasil += `Rata-rata residual: ${meanResidual.toFixed(6)}\n`;
        hasil += `Standar deviasi residual: ${residualStd.toFixed(6)}\n`;
        
        if (Math.abs(meanResidual) > 0.01) {
            hasil += `⚠️ Rata-rata residual tidak mendekati 0 (mungkin ada bias)\n`;
        }
        
        formatResultBox("resultRegresi", true, hasil);
        
        // Tambahkan interpretasi akhir
        addStep(stepsBox, 'Interpretasi Hasil', 
            `Persamaan regresi: ŷ = ${a.toFixed(4)} + ${b.toFixed(4)}·x\n` +
            `• Setiap kenaikan 1 unit x, y ${b > 0 ? 'meningkat' : 'menurun'} sebesar ${Math.abs(b).toFixed(4)} unit\n` +
            `• Ketika x = 0, nilai prediksi y adalah ${a.toFixed(4)}\n` +
            `• Model menjelaskan ${(rSquared*100).toFixed(2)}% variasi dalam data y\n` +
            `• Korelasi antara x dan y adalah ${r > 0 ? 'positif' : 'negatif'} (r = ${r.toFixed(4)})`
        );
        
    } catch (error) {
        console.error("Error dalam regresiLinear:", error);
        formatResultBox("resultRegresi", false, 
            `Terjadi kesalahan tak terduga:\n${error.message}\n\n` +
            `Silakan periksa format input dan coba lagi.`
        );
    }
}

/* ================= INISIALISASI ================= */
// Pastikan fungsi tersedia di scope global
window.gaussJordan = gaussJordan;
window.regresiLinear = regresiLinear;
window.clearInput = clearInput;
window.showExample = showExample;

console.log("Script.js berhasil dimuat!");
console.log("Fungsi yang tersedia: gaussJordan(), regresiLinear(), clearInput(), showExample()");
