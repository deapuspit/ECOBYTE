const authModal = document.getElementById('auth-modal');
const btnLoginNav = document.querySelector('.btn-login');
const btnCloseModal = document.getElementById('close-modal');
const loginFormContainer = document.getElementById('login-form-container');
const signupFormContainer = document.getElementById('signup-form-container');
const linkToSignup = document.getElementById('to-signup');
const linkToLogin = document.getElementById('to-login');
const userProfileNav = document.getElementById('user-profile-nav');
const userNameNav = document.querySelector('.user-name');
const btnLogout = document.getElementById('btn-logout');

let currentUserEmail = null;
let totalPoints = 0;
let leaderboardChart = null;

const pointElements = document.getElementById('total-points');
const badgeElement = document.getElementById('user-badge');

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-box ${type}`;
    
    let icon = "🌿";
    if (type === 'error') icon = "❌";
    if (type === 'info') icon = "🔒";

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function paksaTutupModal() {
    if (authModal) {
        authModal.classList.add('hidden');
        authModal.style.setProperty('display', 'none', 'important');
    }
}

function paksaBukaModal() {
    if (authModal) {
        authModal.classList.remove('hidden');
        authModal.style.setProperty('display', 'flex', 'important');
    }
}

if (btnLoginNav) {
    btnLoginNav.addEventListener('click', () => {
        paksaBukaModal();
        if(loginFormContainer) loginFormContainer.classList.remove('hidden');
        if(signupFormContainer) signupFormContainer.classList.add('hidden');
    });
}

if (btnCloseModal) {
    btnCloseModal.addEventListener('click', (e) => {
        e.preventDefault();
        paksaTutupModal();
    });
}

window.addEventListener('click', (e) => {
    if (e.target === authModal) {
        paksaTutupModal();
    }
});

if (linkToSignup) {
    linkToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        if(loginFormContainer) loginFormContainer.classList.add('hidden');
        if(signupFormContainer) signupFormContainer.classList.remove('hidden');
    });
}

if (linkToLogin) {
    linkToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        if(signupFormContainer) signupFormContainer.classList.add('hidden');
        if(loginFormContainer) loginFormContainer.classList.remove('hidden');
    });
}

function unlockDashboard() {
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('locked');
        card.classList.add('unlocked');
        const overlay = card.querySelector('.card-lock-overlay');
        if (overlay) overlay.style.display = 'none';
    });
}

function lockDashboard() {
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('unlocked');
        card.classList.add('locked');
        const overlay = card.querySelector('.card-lock-overlay');
        if (overlay) overlay.style.display = 'block';
    });
}

function initOverlayListeners() {
    document.querySelectorAll('.card-lock-overlay').forEach(overlay => {
        overlay.replaceWith(overlay.cloneNode(true));
    });

    document.querySelectorAll('.card-lock-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            showToast('Akses Terbatas! Silakan login atau buat akun terlebih dahulu.', 'info');
            paksaBukaModal();
            if(loginFormContainer) loginFormContainer.classList.remove('hidden');
            if(signupFormContainer) signupFormContainer.classList.add('hidden');
        });
    });
}

function updateLevelAndBadge() {
    let badgeName = "🏅 Green Explorer";
    if (totalPoints >= 60) {
        badgeName = "🛡️ Nature Guardian";
    } else if (totalPoints >= 30) {
        badgeName = "⚔️ Eco Warrior";
    }
    if (badgeElement) badgeElement.textContent = badgeName;
    if (pointElements) pointElements.textContent = totalPoints;

    const activeSessionEmail = localStorage.getItem('ecobyte_session');
    if (activeSessionEmail) {
        let users = JSON.parse(localStorage.getItem('ecobyte_users')) || [];
        const matchedUser = users.find(user => user.email === activeSessionEmail);
        if (matchedUser) {
            updateLeaderboardUI(true, matchedUser.name, totalPoints);
            return;
        }
    }
    updateLeaderboardUI(false, "Guest (Belum Login)", totalPoints);
}

function saveUserPoints() {
    if (!currentUserEmail) return;
    let users = JSON.parse(localStorage.getItem('ecobyte_users')) || [];
    let userIndex = users.findIndex(user => user.email === currentUserEmail);
    if (userIndex !== -1) {
        users[userIndex].points = totalPoints;
        localStorage.setItem('ecobyte_users', JSON.stringify(users));
    }
}

function loadUserPoints(email) {
    currentUserEmail = email;
    let users = JSON.parse(localStorage.getItem('ecobyte_users')) || [];
    const matchedUser = users.find(user => user.email === email);
    if (matchedUser) {
        totalPoints = matchedUser.points || 0;
        updateLevelAndBadge();
        document.querySelectorAll('.mission-check').forEach(box => box.checked = false);
    }
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameEl = document.getElementById('signup-name');
        const emailEl = document.getElementById('signup-email');
        const passEl = document.getElementById('signup-pass');

        if (!nameEl || !emailEl || !passEl) return;

        const name = nameEl.value.trim();
        const email = emailEl.value.toLowerCase().trim();
        const password = passEl.value;

        let users = JSON.parse(localStorage.getItem('ecobyte_users')) || [];
        const isEmailExist = users.some(user => user.email === email);

        if (isEmailExist) {
            showToast('Email ini sudah terdaftar! Silakan langsung login.', 'error');
            if(signupFormContainer) signupFormContainer.classList.add('hidden');
            if(loginFormContainer) loginFormContainer.classList.remove('hidden');
            return;
        }

        users.push({ name: name, email: email, password: password, points: 0 });
        localStorage.setItem('ecobyte_users', JSON.stringify(users));

        showToast(`Akun sukses dibuat! Selamat bergabung, ${name}.`, 'success');
        
        localStorage.setItem('ecobyte_session', email);
        if (userNameNav) userNameNav.textContent = name;
        
        paksaTutupModal();
        if (btnLoginNav) btnLoginNav.classList.add('hidden');
        if (userProfileNav) userProfileNav.classList.remove('hidden');
        
        unlockDashboard();
        loadUserPoints(email);
        signupForm.reset();
    });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailEl = document.getElementById('login-email');
        const passEl = document.getElementById('login-pass');

        if (!emailEl || !passEl) return;

        const email = emailEl.value.toLowerCase().trim();
        const password = passEl.value;

        const users = JSON.parse(localStorage.getItem('ecobyte_users')) || [];
        const matchedUser = users.find(user => user.email === email);

        if (!matchedUser) {
            showToast('Akun Belum Terdaftar! Silakan tekan "Daftar sekarang".', 'error');
            return;
        }

        if (matchedUser.password !== password) {
            showToast('Password salah! Periksa kembali ketikan Anda.', 'error');
            return;
        }

        showToast(`Login Berhasil! Selamat datang kembali, ${matchedUser.name}.`, 'success');
        
        localStorage.setItem('ecobyte_session', email);
        if (userNameNav) userNameNav.textContent = matchedUser.name;
        
        paksaTutupModal();
        if (btnLoginNav) btnLoginNav.classList.add('hidden');
        if (userProfileNav) userProfileNav.classList.remove('hidden');
        
        unlockDashboard();
        loadUserPoints(email);
        loginForm.reset();
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        showToast('Anda telah keluar dari sesi.', 'info');
        localStorage.removeItem('ecobyte_session');
        if (userProfileNav) userProfileNav.classList.add('hidden');
        if (btnLoginNav) btnLoginNav.classList.remove('hidden');
        
        currentUserEmail = null;
        totalPoints = 0;
        updateLevelAndBadge();
        lockDashboard();
        initOverlayListeners();
    });
}

const btnScan = document.getElementById('btn-scan');
if (btnScan) {
    const wasteData = {
        plastik: {
            name: "Botol Plastik (PET)",
            category: "Anorganik (Polimer Plastik)",
            duration: "Hingga 450 Tahun",
            method: "Potong bagian bawah botol plastik, bentuk pola telinga, cat warna dasar, dan lukis ekspresi wajah karakter hewan untuk pot tanaman hias, atau bersihkan residu airnya lalu lepaskan label kemasan dan pipihkan botol untuk disetorkan langsung ke stasiun Bank Sampah terdekat.",
            impact: "Sangat Kritis. Membutuhkan waktu mikro-degradasi yang sangat lama di ekosistem alami dan berisiko tinggi mencemari rantai makanan sebagai mikroplastik.",
            product: "Pot Karakter",
            ytLink: "https://youtu.be/KEwYYqrGwXk?si=UhJLclbf46J6VIeN",
            img: "assets/pot tanaman.jpg"
        },
        organik: {
            name: "Sisa Makanan / Organik",
            category: "Organik (Limbah Hayati Basah)",
            duration: "2 hingga 6 Minggu",
            method: "Difermentasi dalam wadah kedap udara untuk memproduksi cairan Eco-Enzyme serbaguna atau dikonversi menjadi pupuk kompos organik penunjang nutrisi tanah.",
            impact: "Sedang. Walau terurai cepat, penumpukan limbah organik secara anaerobik (tanpa udara) di TPA memicu pelepasan gas metana (CH4) berbahaya yang merusak atmosfer.",
            product: "Eco-Enzyme & Kompos",
            ytLink: "https://youtu.be/YU9AzKf2ZFA?si=vgrsso4ER88P4t1n",
            img: "assets/eco enzym.png"
        },
        kaca: {
            name: "Botol Kaca",
            category: "Anorganik (Silika Padat)",
            duration: "Hingga 1 Juta Tahun",
            method: "Disterilisasi secara termal untuk digunakan kembali sebagai wadah sekunder, atau dilukis secara artistik untuk dialihfungsikan menjadi vas bunga estetik.",
            impact: "Kritis Fisik. Bersifat kokoh dan stabil, material kaca sama sekali tidak dapat dihancurkan atau dilebur oleh organisme tanah dalam waktu singkat.",
            product: "Vas Bunga Estetik",
            ytLink: "https://youtube.com/shorts/RU72rAowgPo?si=8WMWCNjM42Hgwakn",
            img: "assets/vas botol kaca.png"
        },
        elektronik: {
            name: "Baterai / Elektronik Bekas",
            category: "Limbah Bahan Berbahaya & Beracun (B3)",
            duration: "Selamanya (Tidak Bisa Terurai Alami)",
            method: "Memilah komponen kecil e-waste seperti resistor, sirkuit, transisitor, dan kapasitor mati, lalu merakitnya secara presisi menggunakan solder/lem menjadi miniatur kendaraan motor artistik.",
            impact: "Sangat Berbahaya. Kandungan logam berat beracun di dalamnya akan menetap di tanah selamanya dan berisiko meracuni jaringan air bawah tanah.",
            product: "Miniatur Motor Limbah Elektronik",
            ytLink: "https://youtu.be/U3ldkLsGDgk?si=-eWXz1lRe2N-mdJ0", 
            img: "assets/miniatur limbah elektronik.jpg"
        },
        kertas: {
            name: "Kertas Ujian / Kardus Karton",
            category: "Anorganik (Serat Selulosa Kayu)",
            duration: "2 hingga 5 Bulan",
            method: "Dilarutkan menjadi bubur pulp, diberi pewarna organik opsional, disaring menggunakan screen mesh, lalu dikeringkan menjadi lembaran kertas handmade bertekstur estetik.",
            impact: "Rendah. Terurai alami dengan cepat. Namun, siklus penebangan pohon untuk kertas baru memicu degradasi kawasan hutan hijau apabila tidak didaur ulang.",
            product: "Kertas Handmade Estetik",
            ytLink: "https://youtu.be/H8zkeybyHcI?si=kCm-1DQe9U3gelAa",
            img: "assets/kertas daur ulang.jpg"
        },
        kaleng: {
            name: "Kaleng Minuman Alumunium",
            category: "Anorganik (Logam / Alumunium)",
            duration: "80 hingga 200 Tahun",
            method: "Potong bagian atas kaleng, gunting dindingnya secara vertikal menjadi rumbai-rumbai tipis dengan jarak sama rata, lalu lipat rumbai tersebut secara diagonal melingkar ke dalam hingga mengunci menjadi asbak.",
            impact: "Tinggi. Logam alumunium memerlukan waktu berabad-abad agar bisa teroksidasi tanah. Proses penambangan alumunium baru juga sangat boros energi.",
            product: "Asbak Kaleng Lipat",
            ytLink: "https://youtu.be/Ts67fGopjsU?si=5GKyS1QTExpyx4tt",
            img: "assets/kerajinan-tangan-asbak-kaleng-bekas-06.jpg"
        },
        styrofoam: {
            name: "Styrofoam / Wadah Gabus",
            category: "Residu Berbahaya (Expanded Polystyrene)",
            duration: "Sekitar 500 Tahun / Abadi",
            method: "Bersihkan wadah styrofoam, potong tipis membentuk pola kelopak mawar, susun dan rekatkan antar kelopak secara berlapis menggunakan lem, lalu tambahkan manik-manik sebagai putik bunga.",
            impact: "Sangat Tinggi. Sangat rapuh sehingga mudah pecah menjadi partikel kecil yang meracuni satwa liar serta mengandung zat pemicu kanker.",
            product: "Bunga Mawar Hias",
            ytLink: "https://youtu.be/HgqwGoY0wNU?si=GKrfXeTxmf7WeHED", 
            img: "assets/bunga styrofoam.jpg"
        },
        baju: {
            name: "Pakaian Bekas / Limbah Tekstil",
            category: "Anorganik / Organik (Serat Kain Campuran)",
            duration: "1 Bulan (Katun) hingga 200 Tahun (Sintetis)",
            method: "Pilahan kain katun dipotong mengikuti pola modular, lalu dijahit ulang secara kreatif (patchwork) menjadi pouch kosmetik atau tas belanja (Tote Bag) alternatif.",
            impact: "Tinggi. Pakaian berbahan poliester atau nilon membutuhkan waktu ratusan tahun untuk hancur dan menyisakan polusi zat pewarna kimia di ekosistem air.",
            product: "Tas Cantik dari Kain Perca",
            ytLink: "https://youtu.be/sr0QsCzz_5c?si=3JbjBoOuLkxMaDf-",
            img: "assets/tas cantik.png"
        }
    };

    btnScan.addEventListener('click', () => {
        const selectedWaste = document.getElementById('waste-select').value;
        const resultBox = document.getElementById('scan-result');
        
        const resWasteName = document.getElementById('res-waste-name');
        const resCat = document.getElementById('res-cat');
        const resDuration = document.getElementById('res-duration');
        const resMethod = document.getElementById('res-method');
        const resImpact = document.getElementById('res-impact');
        const resProductName = document.getElementById('res-product-name');
        const resVideoLink = document.getElementById('res-video-link');
        const imgResult = document.getElementById('scan-result-img');

        if (wasteData[selectedWaste]) {
            const data = wasteData[selectedWaste];
            
            if (resWasteName) resWasteName.textContent = data.name;
            if (resCat) resCat.textContent = data.category;
            if (resDuration) resDuration.textContent = data.duration;
            if (resMethod) resMethod.textContent = data.method;
            if (resImpact) resImpact.textContent = data.impact;
            if (resProductName) resProductName.textContent = data.product;
            if (resVideoLink && data.ytLink) resVideoLink.href = data.ytLink;
            if (imgResult && data.img) imgResult.src = data.img;
            
            if (resultBox) {
                resultBox.classList.remove('hidden');
                resultBox.style.display = "grid"; 
            }
        }
        
        if (typeof showToast === "function") {
            showToast(`Analisis material ${selectedWaste} berhasil diproses!`, "success");
        }
    });
}

function updateProgress(checkbox) {
    const points = parseInt(checkbox.getAttribute('data-points')) || 0;
    const missionItem = checkbox.closest('.mission-item') || checkbox.parentElement;
    
    if (checkbox.checked) {
        totalPoints += points;
        if(missionItem) {
            missionItem.style.opacity = '0.5';
            missionItem.style.textDecoration = 'line-through';
            missionItem.style.transition = 'all 0.3s ease';
        }
        showToast(`Misi Selesai! (+${points} XP)`, "success");
    } else {
        totalPoints -= points;
        if(missionItem) {
            missionItem.style.opacity = '1';
            missionItem.style.textDecoration = 'none';
        }
        showToast(`Misi dibatalkan. (-${points} XP)`, "info");
    }
    
    if (totalPoints < 0) totalPoints = 0;
    
    updateLevelAndBadge();
    saveUserPoints();
}

const btnTrack = document.getElementById('btn-track');
if (btnTrack) {
    btnTrack.addEventListener('click', () => {
        const kmInput = document.getElementById('km-input');
        const barUser = document.getElementById('bar-user');
        const statusBox = document.getElementById('carbon-status');
        
        const km = parseFloat(kmInput.value) || 0;
        if (km <= 0) {
            showToast('Silakan masukkan angka jarak KM yang valid di atas 0!', 'error');
            return;
        }

        let totalCarbon = km * 0.12;
        let percentage = (totalCarbon / 10) * 100;
        if (percentage > 100) percentage = 100;

        if (barUser) {
            barUser.className = 'bar-fill';
            if (totalCarbon <= 2) barUser.classList.add('neon');
            else if (totalCarbon <= 5) barUser.classList.add('cyan');
            else if (totalCarbon <= 8) barUser.classList.add('warning-orange');
            else barUser.classList.add('danger-red');
            barUser.style.width = percentage + '%';
        }
        
        let statusMessage = "";
        if (totalCarbon <= 2) {
            statusMessage = `🌱 Luar biasa! Emisi kamu hanya <strong>${totalCarbon.toFixed(2)} KG CO2</strong>. Gaya hidupmu sangat ramah lingkungan!`;
        } else if (totalCarbon <= 5) {
            statusMessage = `🚙 Stabil. Emisi kamu sebesar <strong>${totalCarbon.toFixed(2)} KG CO2</strong>. Masih dalam batas rata-rata wajar harian.`;
        } else if (totalCarbon <= 8) {
            statusMessage = `⚠️ Waspada! Emisi kamu mencapai <strong>${totalCarbon.toFixed(2)} KG CO2</strong>. Mulai kurangi penggunaan kendaraan pribadi.`;
        } else {
            statusMessage = `🚨 Bahaya! Emisi karbonmu <strong>${totalCarbon.toFixed(2)} KG CO2</strong> melewati ambang batas! Yuk, beralih ke sepeda atau jalan kaki.`;
        }

        if (statusBox) {
            statusBox.innerHTML = statusMessage;
            statusBox.classList.add('show');
        }
    });
}

const ecoInnovations = [
    {
        title: "🤖 AI-Driven Smart Sorting Bin (IoT)",
        desc: "Sistem tempat sampah terintegrasi IoT yang memanfaatkan Computer Vision untuk memilah otomatis sampah organik, anorganik, dan B3 secara real-time tepat di sumbernya.",
        impact: "♻️ Target Efisiensi: Mampu mereduksi salah pilah sampah di tingkat rumah tangga hingga 45%."
    },
    {
        title: "☀️ Piezoelectric Solar Footpath",
        desc: "Inovasi lantai pedestrian pintar yang mengonversi energi kinetik langkah kaki manusia dan radiasi termal matahari menjadi sumber listrik mandiri untuk fasilitas publik.",
        impact: "🔋 Target Efisiensi: Menghemat konsumsi jaringan listrik lampu jalanan kota hingga 30%."
    },
    {
        title: "🍃 Marine Macroalgae Bio-Plastic",
        desc: "Pengembangan material kemasan alternatif berbasis polimer rumput laut lokal yang dapat larut dalam air hangat dan 100% biodegradable jika terlepas ke ekosistem laut.",
        impact: "🌊 Target Efisiensi: Memutus rantai polusi mikroplastik pada biota laut secara drastis."
    },
    {
        title: "💧 Closed-Loop Hydro-Purifier",
        desc: "Sistem filtrasi air domestik portable berskala mikro yang mampu memurnikan air limbah sabun (greywater) bekas mandi secara instan untuk siklus penggunaan kembali yang aman.",
        impact: "🚰 Target Efisiensi: Menghemat penggunaan cadangan air bersih rumah tangga hingga 60%."
    },
    {
        title: "📱 E-Waste Tokenomics Network",
        desc: "Platform digital berbasis insentif lokal yang mengonversi pembuangan sampah elektronik berbahaya (baterai, komponen gadget) menjadi poin subsidi transportasi umum.",
        impact: "📉 Target Efisiensi: Mencegah kebocoran logam berat beracun (B3) ke dalam lapisan air tanah."
    },
    {
        title: "💨 Nano-Grid Urban Air Smog Filter",
        desc: "Menara filter udara vertikal berbasis teknologi elektrostatik nano yang dipasang pada halte bus kota untuk menyerap partikel polutan berbahaya (PM2.5) secara aktif.",
        impact: "🌬️ Target Efisiensi: Membersihkan radius udara sekitar area tunggu publik hingga mencapai 70%."
    },
    {
        title: "🪵 Mycelium Cyber-Packaging",
        desc: "Alternatif pengganti styrofoam pelindung barang elektronik yang dibudidayakan dari jaringan jamur (miselium) dan limbah pertanian, kuat menahan benturan dan kokoh.",
        impact: "📦 Target Efisiensi: Dapat terurai sempurna di dalam tanah dalam waktu kurang dari 30 hari."
    },
    {
        title: "🖨️ Eco-ReCycled 3D Filament",
        desc: "Mesin konverter skala mikro yang mampu mencacah dan memproses limbah tutup botol plastik (HDPE) menjadi filamen premium siap pakai untuk printer 3D manufaktur.",
        if: "",
        impact: "🏗️ Target Efisiensi: Menekan biaya produksi bahan baku cetak 3D hingga sebesar 50%."
    },
    {
        title: "⚡ Kinetic Thermal Energy Harvester",
        desc: "Alat pengumpul energi termal yang memanfaatkan sisa hawa panas dari mesin kompresor AC luar ruangan untuk diubah kembali menjadi arus listrik pengisi daya powerbank.",
        impact: "🔌 Target Efisiensi: Memanfaatkan energi buangan (waste energy) gedung menjadi daya listrik berguna."
    },
    {
        title: "🌿 Agro-Vision Precision Drone",
        desc: "Sistem drone mini otomatis berbasis AI pemeta tanah yang mampu mendeteksi tingkat kelembapan serta menyemprotkan pupuk organik cair secara presisi tanpa boros.",
        impact: "🚜 Target Efisiensi: Mencegah degradasi unsur hara tanah dan menghemat air siraman hingga 40%."
    },
    {
        title: "🏬 Smart Kinetic Window Glass",
        desc: "Kaca jendela gedung bertingkat yang otomatis meredup saat matahari terik untuk memantulkan radiasi panas, sekaligus menangkap energi foton menjadi listrik tambahan.",
        impact: "🏢 Target Efisiensi: Memangkas beban kerja AC ruangan dan menghemat konsumsi energi gedung 25%."
    },
    {
        title: "🚲 Smart Brake Energy Bike",
        desc: "Sistem regeneratif pada sepeda kayuh perkotaan yang menangkap energi gesekan saat melakukan pengereman dan menyimpannya ke dalam powerbank internal di stang sepeda.",
        impact: "🚴 Target Efisiensi: Menghasilkan daya listrik mikro mandiri yang bersih untuk kebutuhan gadget komuter."
    }
];

const btnGenerate = document.getElementById('btn-generate');
const innovationResultBox = document.getElementById('innovation-result');

if (btnGenerate && innovationResultBox) {
    btnGenerate.addEventListener('click', () => {
        btnGenerate.disabled = true;
        btnGenerate.style.opacity = '0.6';
        btnGenerate.textContent = "Processing System...";

        const randomIndex = Math.floor(Math.random() * ecoInnovations.length);
        const selectedIdea = ecoInnovations[randomIndex];

        innovationResultBox.classList.remove('hidden');
        innovationResultBox.innerHTML = `
            <h4 id="type-title" style="color: #39ff14; font-weight: 600; margin-bottom: 8px;"></h4>
            <p id="type-desc" style="color: #e0e6e3; font-size: 0.9rem; line-height: 1.5; margin-bottom: 12px;"></p>
            <div id="type-impact" style="font-size: 0.85rem; color: #00ffff; font-weight: 500; opacity: 0; transition: opacity 0.4s ease;"></div>
        `;

        let titleText = selectedIdea.title;
        let descText = selectedIdea.desc;
        let i = 0;
        let j = 0;

        function typeTitle() {
            const titleEl = document.getElementById('type-title');
            if (titleEl && i < titleText.length) {
                titleEl.innerHTML += titleText.charAt(i);
                i++;
                setTimeout(typeTitle, 40);
            } else {
                typeDesc();
            }
        }

        function typeDesc() {
            const descEl = document.getElementById('type-desc');
            if (descEl && j < descText.length) {
                descEl.innerHTML += descText.charAt(j);
                j++;
                setTimeout(typeDesc, 20);
            } else {
                const impactEl = document.getElementById('type-impact');
                if (impactEl) {
                    impactEl.innerHTML = selectedIdea.impact;
                    impactEl.style.opacity = '1';
                }
                btnGenerate.disabled = false;
                btnGenerate.style.opacity = '1';
                btnGenerate.textContent = "GENERATE IDEA";
            }
        }
        typeTitle();
    });
}

window.addEventListener('DOMContentLoaded', () => {
    if (typeof initOverlayListeners === 'function') initOverlayListeners();
    
    const missionCheckboxes = document.querySelectorAll('.mission-check');
    missionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateProgress(this);
        });
    });

    const activeSessionEmail = localStorage.getItem('ecobyte_session');
    if (activeSessionEmail) {
        let users = JSON.parse(localStorage.getItem('ecobyte_users')) || [];
        const matchedUser = users.find(user => user.email === activeSessionEmail);
        if (matchedUser) {
            if (userNameNav) userNameNav.textContent = matchedUser.name;
            if (btnLoginNav) btnLoginNav.classList.add('hidden');
            if (userProfileNav) userProfileNav.classList.remove('hidden');
            unlockDashboard();
            loadUserPoints(activeSessionEmail);
        }
    } else {
        lockDashboard();
        updateLeaderboardUI(false, "Guest (Belum Login)", 0);
    }
});

function updateLeaderboardUI(isLoggedIn, activeUserName = "", activeUserPoints = 0) {
    const tbody = document.querySelector('.leaderboard-table tbody');

    let leaderboardData = [
        { name: "Rian_EcoTech", points: 120, isDummy: true },
        { name: "Siti_GreenWarrior", points: 95, isDummy: true },
        { name: "Andi_Nature", points: 75, isDummy: true }
    ];

    let registeredUsers = JSON.parse(localStorage.getItem('ecobyte_users')) || [];

    registeredUsers.forEach(user => {
        const isActive = isLoggedIn && (user.name === activeUserName);
        leaderboardData.push({
            name: user.name,
            points: isActive ? activeUserPoints : (user.points || 0), 
            isActive: isActive
        });
    });

    if (!isLoggedIn && activeUserPoints > 0) {
        leaderboardData.push({ name: "Guest (Kamu)", points: activeUserPoints, isActive: true });
    }

    leaderboardData.sort((a, b) => b.points - a.points);

    if (tbody) {
        tbody.innerHTML = "";
        const MAX_DISPLAY = 5;
        let topUsers = leaderboardData.slice(0, MAX_DISPLAY);

        topUsers.forEach((user, index) => {
            renderLeaderboardRow(tbody, user, index + 1);
        });

        const myRealIndex = leaderboardData.findIndex(user => user.isActive);
        if (myRealIndex >= MAX_DISPLAY) {
            const dividerRow = document.createElement('tr');
            dividerRow.innerHTML = `<td colspan="3" style="text-align:center; color:#a3b8ae; padding:5px; font-size:0.8rem;">••• Peringkat Lainnya •••</td>`;
            tbody.appendChild(dividerRow);

            const myUserData = leaderboardData[myRealIndex];
            renderLeaderboardRow(tbody, myUserData, myRealIndex + 1);
        }
    }

    renderOrUpdateChart(leaderboardData, isLoggedIn, activeUserName);

    const grandTotalPoints = leaderboardData.reduce((sum, u) => sum + u.points, 0);
    updateGlobalImpactStats(grandTotalPoints);
}

function renderLeaderboardRow(tbody, user, rank) {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid rgba(255,255,255,0.02)';
    
    let rankBadge = rank;
    if (rank === 1) rankBadge = "🥇 1";
    else if (rank === 2) rankBadge = "🥈 2";
    else if (rank === 3) rankBadge = "🥉 3";
    else if (user.isActive) rankBadge = "⚡ " + rank;

    if (user.isActive) {
        row.style.background = 'rgba(0, 255, 255, 0.06)';
        row.style.borderLeft = '3px solid #00ffff';
    }

    row.innerHTML = `
        <td style="padding: 10px 5px; font-weight: 700;">${rankBadge}</td>
        <td style="padding: 10px 5px; color: ${user.isActive ? '#00ffff' : '#ffffff'};">
            ${user.name} ${user.isActive ? '<small style="font-size:0.75rem; color:#00ffff;">(You)</small>' : ''}
        </td>
        <td style="padding: 10px 5px; text-align: right; font-weight: 600; color: #39ff14;">${user.points} XP</td>
    `;
    tbody.appendChild(row);
}

function updateGlobalImpactStats(totalPoints) {
    const trashImpactEl = document.querySelector('.stats-box-info div:nth-child(2) span:nth-child(2)');
    const carbonImpactEl = document.querySelector('.stats-box-info div:nth-child(3) span:nth-child(2)');
    
    let baseTrash = 1248.5 + (totalPoints * 0.2); 
    let baseCarbon = 412.3 + (totalPoints * 0.05); 
    
    if (trashImpactEl) trashImpactEl.innerHTML = `${baseTrash.toFixed(1)} <small style="font-size: 0.9rem; color:#39ff14;">KG</small>`;
    if (carbonImpactEl) carbonImpactEl.innerHTML = `${baseCarbon.toFixed(1)} <small style="font-size: 0.9rem; color:#00ffff;">KG CO2</small>`;
}

const navLinks = document.querySelectorAll('nav a, .navbar a');
navLinks.forEach(link => {
    if (link.textContent.trim().toLowerCase() === 'statistics' || link.getAttribute('href') === '#statistics') {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.getElementById('statistics');
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                targetSection.querySelector('.card').style.borderColor = '#00ffff';
                setTimeout(() => {
                    targetSection.querySelector('.card').style.borderColor = 'rgba(57, 255, 20, 0.15)';
                }, 1000);
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const navbar = document.querySelector(".navbar");
    const navMenu = document.querySelector(".nav-menu");

    if (navbar && navMenu) {
        navbar.addEventListener("click", function (e) {
            if (window.innerWidth <= 900 && e.offsetX > navbar.offsetWidth * 0.8) {
                navMenu.classList.toggle("active");
            }
        });
    }
    
    const mobileLinks = document.querySelectorAll(".nav-menu a");
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (navMenu) navMenu.classList.remove("active");
        });
    });
});

function renderOrUpdateChart(leaderboardData, isLoggedIn, activeUserName) {
    const chartContainer = document.getElementById('leaderboard-custom-container');
    if (!chartContainer) return;

    chartContainer.innerHTML = '';

    let chartUsers = leaderboardData.slice(0, 10);
    
    const userIndexInChart = chartUsers.findIndex(u => u.isActive);
    if (userIndexInChart === -1) {
        const activeUser = leaderboardData.find(u => u.isActive);
        if (activeUser) {
            chartUsers[chartUsers.length - 1] = activeUser; 
        }
    }

    const maxXP = Math.max(...chartUsers.map(u => u.points), 100);

    chartUsers.forEach((u, index) => {
        const percentage = (u.points / maxXP) * 100;

        let medal = "";
        if (index === 0) medal = " 🥇";
        else if (index === 1) medal = " 🥈";
        else if (index === 2) medal = " 🥉";

        let displayName = u.name + medal;
        if (u.isActive) {
            displayName = isLoggedIn ? `${activeUserName} (You) ⚡` : "Guest (You) ⚡";
        }

        const isMeClass = u.isActive ? 'is-current-user' : '';

        const rowHTML = `
            <div class="chart-row ${isMeClass}">
                <div class="chart-label-wrapper">
                    <span class="chart-user-name">${displayName}</span>
                    <span class="chart-user-xp">${u.points} XP</span>
                </div>
                <div class="chart-bar-bg">
                    <div class="chart-bar-fill" id="custom-bar-${index}" style="width: 0%;"></div>
                </div>
            </div>
        `;
        
        chartContainer.insertAdjacentHTML('beforeend', rowHTML);

        setTimeout(() => {
            const barFill = document.getElementById(`custom-bar-${index}`);
            if (barFill) barFill.style.width = `${percentage}%`;
        }, 50);
    });
}