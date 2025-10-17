import { useLanguage } from '../contexts/LanguageContext';
import { useCallback } from 'react';

export const translations = {
  // General
  aiThinking: { id: "AI sedang berpikir... mohon tunggu sejenak.", ar: "الذكاء الاصطناعي يفكر... يرجى الانتظار لحظة.", en: "AI is thinking... please wait a moment." },
  errorFetching: { id: "Terjadi kesalahan saat mengambil jawaban. Silakan coba lagi.", ar: "حدث خطأ أثناء جلب الإجابة. يرجى المحاولة مرة أخرى.", en: "An error occurred while fetching the answer. Please try again." },
  errorApiUnavailable: { id: "AI sementara tidak tersedia. Silakan coba lagi nanti.", ar: "الذكاء الاصطناعي غير متاح مؤقتًا. يرجى المحاولة مرة أخرى لاحقًا.", en: "The AI is temporarily unavailable. Please try again later." },
  close: { id: "Tutup", ar: "إغلاق", en: "Close" },
  backToTop: { id: "Kembali ke atas", ar: "العودة إلى الأعلى", en: "Back to top" },
  loading: { id: "Memuat...", ar: "جار التحميل...", en: "Loading..." },
  saving: { id: "Menyimpan...", ar: "جار الحفظ...", en: "Saving..." },
  deleting: { id: "Menghapus...", ar: "جار الحذف...", en: "Deleting..." },
  
  // Header / Navbar
  headerTitle: { id: "Ensiklopedia AI Peradaban Islam", ar: "موسوعة الذكاء الاصطناعي للحضارة الإسلامية", en: "AI Encyclopedia of Islamic Civilization" },
  headerTitleShort: { id: "Ensiklopedia AI Islam", ar: "موسوعة AI الإسلامية", en: "AI Islamic Encyclopedia" },
  headerSubtitle: { id: "Jelajahi Khazanah Ilmu Pengetahuan Islam dengan Bantuan AI", ar: "استكشف كنوز المعرفة الإسلامية بمساعدة الذكاء الاصطناعي", en: "Explore the Treasures of Islamic Knowledge with the Help of AI" },
  language: { id: "Bahasa", ar: "اللغة", en: "Language" },
  theme: { id: "Tema", ar: "المظهر", en: "Theme" },
  history: { id: "Riwayat", ar: "السجل", en: "History" },
  adminDashboard: { id: "Dasbor Admin", ar: "لوحة تحكم المسؤول", en: "Admin Dashboard" },
  backToEncyclopedia: { id: "Kembali ke Ensiklopedia", ar: "العودة إلى الموسوعة", en: "Back to Encyclopedia" },

  // Auth
  authLoginTitle: { id: "Masuk ke Akun Anda", ar: "تسجيل الدخول إلى حسابك", en: "Login to Your Account" },
  authRegisterTitle: { id: "Buat Akun Baru", ar: "إنشاء حساب جديد", en: "Create a New Account" },
  authEmail: { id: "Email", ar: "البريد الإلكتروني", en: "Email" },
  authUsername: { id: "Nama Pengguna", ar: "اسم المستخدم", en: "Username" },
  authPassword: { id: "Kata Sandi", ar: "كلمة المرور", en: "Password" },
  authConfirmPassword: { id: "Konfirmasi Kata Sandi", ar: "تأكيد كلمة المرور", en: "Confirm Password" },
  authLoginButton: { id: "Masuk", ar: "تسجيل الدخول", en: "Login" },
  authLoggingIn: { id: "Sedang masuk...", ar: "جاري تسجيل الدخول...", en: "Logging in..." },
  authRegisterButton: { id: "Daftar", ar: "تسجيل", en: "Register" },
  authRegistering: { id: "Mendaftarkan...", ar: "جاري التسجيل...", en: "Registering..." },
  authLogout: { id: "Keluar", ar: "تسجيل الخروج", en: "Logout" },
  authNoAccount: { id: "Belum punya akun?", ar: "ليس لديك حساب؟", en: "Don't have an account?" },
  authHaveAccount: { id: "Sudah punya akun?", ar: "هل لديك حساب بالفعل؟", en: "Already have an account?" },
  authRegisterLink: { id: "Daftar di sini", ar: "سجل هنا", en: "Register here" },
  authLoginLink: { id: "Masuk di sini", ar: "سجل الدخول هنا", en: "Login here" },
  authErrorAllFields: { id: "Harap isi semua kolom.", ar: "يرجى ملء جميع الحقول.", en: "Please fill in all fields." },
  authErrorInvalidEmail: { id: "Format email tidak valid.", ar: "صيغة البريد الإلكتروني غير صالحة.", en: "Invalid email format." },
  authErrorPasswordLength: { id: "Kata sandi minimal harus 6 karakter.", ar: "يجب أن لا تقل كلمة المرور عن 6 أحرف.", en: "Password must be at least 6 characters." },
  authErrorPasswordMatch: { id: "Kata sandi tidak cocok.", ar: "كلمتا المرور غير متطابقتين.", en: "Passwords do not match." },
  authErrorLoginFailed: { id: "Email atau kata sandi salah.", ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", en: "Invalid email or password." },
  authErrorRegisterFailed: { id: "Gagal mendaftar. Email mungkin sudah digunakan.", ar: "فشل التسجيل. قد يكون البريد الإلكتروني مستخدمًا بالفعل.", en: "Failed to register. The email may already be in use." },
  authEmailPlaceholder: { id: "anda@contoh.com", ar: "your@example.com", en: "your@example.com" },
  authUsernamePlaceholder: { id: "Masukkan nama pengguna Anda", ar: "أدخل اسم المستخدم الخاص بك", en: "Enter your username" },
  authPasswordPlaceholder: { id: "Minimal 6 karakter", ar: "6 أحرف على الأقل", en: "At least 6 characters" },
  authConfirmPasswordPlaceholder: { id: "Ulangi kata sandi Anda", ar: "أعد كتابة كلمة المرور", en: "Repeat your password" },

  // Search
  searchPlaceholder: { id: "Tanyakan apa saja tentang sejarah, tokoh, atau penemuan dalam peradaban Islam...", ar: "اسأل أي شيء عن التاريخ أو الشخصيات أو الاكتشافات في الحضارة الإسلامية...", en: "Ask anything about the history, figures, or discoveries in Islamic civilization..." },
  searchButton: { id: "Tanya AI", ar: "اسأل AI", en: "Ask AI" },
  searchLoading: { id: "Memproses...", ar: "يعالج...", en: "Processing..." },
  errorInvalidSearch: { id: "Harap masukkan pertanyaan Anda.", ar: "الرجاء إدخال سؤالك.", en: "Please enter your question." },
  
  // History
  historyTitle: { id: "Riwayat Pencarian:", ar: "سجل البحث:", en: "Search History:" },
  historyFilterPlaceholder: { id: "Filter riwayat...", ar: "تصفية السجل...", en: "Filter history..." },
  dateAll: { id: "Semua Waktu", ar: "كل الأوقات", en: "All Time" },
  dateToday: { id: "Hari Ini", ar: "اليوم", en: "Today" },
  dateWeek: { id: "7 Hari Terakhir", ar: "آخر 7 أيام", en: "Last 7 Days" },
  historyEmpty: { id: "Tidak ada riwayat yang cocok dengan filter Anda.", ar: "لا يوجد سجل يطابق تصفيتك.", en: "No history matches your filter." },
  historyReopen: { id: "Buka lagi: \"{query}\"", ar: "إعادة فتح: \"{query}\"", en: "Reopen: \"{query}\"" },
  historyViewAll: { id: "Lihat Semua Riwayat", ar: "عرض كل السجل", en: "View All History" },
  
  // New History Page
  historyPageTitle: { id: "Riwayat Pencarian", ar: "سجل البحث", en: "Search History" },
  exportAllToPDF: { id: "Ekspor Semua ke PDF", ar: "تصدير الكل إلى PDF", en: "Export All to PDF" },
  exportToPDF: { id: "Ekspor ke PDF", ar: "تصدير إلى PDF", en: "Export to PDF" },
  searchHistoryPlaceholder: { id: "Cari dalam riwayat...", ar: "ابحث في السجل...", en: "Search in history..." },
  generatingPDF: { id: "Membuat PDF...", ar: "جاري إنشاء PDF...", en: "Generating PDF..." },
  pdfExportFailed: { id: "Gagal mengekspor PDF.", ar: "فشل تصدير PDF.", en: "Failed to export PDF." },
  searchedOn: { id: "Dicari pada", ar: "تم البحث في", en: "Searched on" },
  clearAllHistory: { id: "Hapus Semua Riwayat", ar: "مسح كل السجل", en: "Clear All History" },
  confirmClearHistory: { id: "Apakah Anda yakin ingin menghapus semua riwayat pencarian? Tindakan ini tidak dapat diurungkan.", ar: "هل أنت متأكد أنك تريد حذف كل سجل البحث؟ لا يمكن التراجع عن هذا الإجراء.", en: "Are you sure you want to delete all search history? This action cannot be undone." },
  viewHistoryItem: { id: "Lihat", ar: "عرض", en: "View" },
  deleteHistoryItem: { id: "Hapus", ar: "حذف", en: "Delete" },
  historyEmptyStateTitle: { id: "Riwayat Anda Kosong", ar: "سجلك فارغ", en: "Your History is Empty" },
  historyEmptyStateSubtitle: { id: "Mulai ajukan pertanyaan untuk melihat riwayat pencarian Anda di sini.", ar: "ابدأ في طرح الأسئلة لترى سجل البحث الخاص بك هنا.", en: "Start asking questions to see your search history here." },
  historyNoContentToExport: { id: "Tidak ada konten riwayat yang tersimpan secara lokal untuk diekspor.", ar: "لا يوجد محتوى محفوظات مخزن محليًا للتصدير.", en: "No history content is stored locally to export." },
  historyPartialContentToExport: { id: "Beberapa item riwayat tidak memiliki konten lokal dan dilewati dari ekspor.", ar: "بعض عناصر السجل لا تحتوي على محتوى محلي وتم تخطيها من التصدير.", en: "Some history items were missing local content and were skipped from the export." },
  
  // Map
  mapTitle: { id: "Peta Interaktif", ar: "خريطة تفاعلية", en: "Interactive Map" },
  mapReset: { id: "Reset Peta", ar: "إعادة تعيين الخريطة", en: "Reset Map" },
  mapAriaLabel: { id: "Peta interaktif", ar: "خريطة تفاعلية", en: "Interactive map" },
  mapLoading: { id: "Memuat peta interaktif...", ar: "جاري تحميل الخريطة التفاعلية...", en: "Loading interactive map..." },
  mapNoData: { id: "Tidak ada data peta yang relevan untuk topik ini.", en: "No relevant map data found for this topic.", ar: "لم يتم العثور على بيانات خريطة ذات صلة لهذا الموضوع." },
  map_mecca: { id: "Mekkah: Pusat spiritual Islam", ar: "مكة: المركز الروحي للإسلام", en: "Mecca: The spiritual center of Islam" },
  map_medina: { id: "Madinah: Kota Nabi dan ibu kota pertama Islam", ar: "المدينة المنورة: مدينة النبي وأول عاصمة إسلامية", en: "Medina: The Prophet's city and the first capital of Islam" },
  map_jerusalem: { id: "Yerusalem: Situs Masjid Al-Aqsa, kiblat pertama", ar: "القدس: موقع المسجد الأقصى، القبلة الأولى", en: "Jerusalem: Site of Al-Aqsa Mosque, the first qibla" },
  map_baghdad: { id: "Baghdad: Ibu kota Kekhalifahan Abbasiyah & pusat Rumah Kebijaksanaan", ar: "بغداد: عاصمة الخلافة العباسية ومركز بيت الحكمة", en: "Baghdad: Capital of the Abbasid Caliphate & center of the House of Wisdom" },
  map_cairo: { id: "Kairo: Didirikan oleh Fatimiyah, rumah bagi Universitas Al-Azhar", ar: "القاهرة: أسسها الفاطميون، موطن جامعة الأزهر", en: "Cairo: Founded by the Fatimids, home to Al-Azhar University" },
  map_istanbul: { id: "Istanbul (Konstantinopel): Ibu kota Kekaisaran Utsmaniyah", ar: "إسطنبول (القسطنطينية): عاصمة الإمبراطورية العثمانية", en: "Istanbul (Constantinople): Capital of the Ottoman Empire" },

  // Interactive Map Component
  mapRecenter: { id: "Pusatkan kembali peta", ar: "إعادة تمركز الخريطة", en: "Recenter map" },
  mapLegendTitle: { id: "Legenda Peta", ar: "مفتاح الخريطة", en: "Map Legend" },
  mapLayerGeoJSON: { id: "Wilayah", ar: "المناطق", en: "Regions" },
  mapLayerMarkers: { id: "Lokasi Penting", ar: "مواقع هامة", en: "Key Locations" },
  mapLayerPolyline: { id: "Jalur Linimasa", ar: "مسار الخط الزمني", en: "Timeline Path" },
  mapLayerEmpty: { id: "Tidak ada lapisan data untuk ditampilkan.", ar: "لا توجد طبقات بيانات لعرضها.", en: "No data layers to display." },
  mapLayerDefault: { id: "Default", ar: "افتراضي", en: "Default" },
  mapLayerSatellite: { id: "Satelit", ar: "قمر صناعي", en: "Satellite" },
  mapLayerTerrain: { id: "Medan", ar: "تضاريس", en: "Terrain" },
  
  // Directory
  directoryTitle: { id: "Direktori Sejarah", ar: "دليل التاريخ", en: "History Directory" },
  directorySubtitle: { id: "Mulai perjalanan Anda dengan memilih topik dari direktori kami, atau ajukan pertanyaan spesifik Anda di atas.", ar: "ابدأ رحلتك باختيار موضوع من دليلنا، أو اطرح سؤالك المحدد أعلاه.", en: "Start your journey by selecting a topic from our directory, or ask your specific question above." },
  
  // Tabs in ResponseDisplay
  tabSummary: { id: "Ringkasan", ar: "ملخص", en: "Summary" },
  tabViz: { id: "Visualisasi Data", ar: "تصور البيانات", en: "Data Visualization" },
  tabTimeline: { id: "Linimasa", ar: "الخط الزمني", en: "Timeline" },
  tabFigures: { id: "Tokoh Penting", ar: "شخصيات هامة", en: "Key Figures" },
  tabKeyTerms: { id: "Istilah Penting", ar: "مصطلحات رئيسية", en: "Key Terms" },
  tabAiImage: { id: "Gambar AI", ar: "صورة AI", en: "AI Image" },
  
  // Response Display Content
  tocTitle: { id: "Daftar Isi", ar: "جدول المحتويات", en: "Table of Contents" },
  sourcesTitle: { id: "Sumber & Referensi", ar: "المصادر والمراجع", en: "Sources & References" },
  accessedOn: { id: "Diakses pada", ar: "تم الوصول إليه في", en: "Accessed on" },
  keyContribution: { id: "Kontribusi Utama:", ar: "المساهمات الرئيسية:", en: "Key Contributions:" },
  etymology: { id: "Etimologi:", ar: "أصل الكلمة:", en: "Etymology:" },
  significance: { id: "Signifikansi", ar: "الأهمية", en: "Significance" },
  timelinePrev: { id: "Peristiwa Sebelumnya", ar: "الحدث السابق", en: "Previous Event" },
  timelineNext: { id: "Peristiwa Berikutnya", ar: "الحدث التالي", en: "Next Event" },
  timelineScrub: { id: "Geser linimasa", ar: "شريط تمرير الخط الزمني", en: "Scrub timeline" },
  aiImageAlt: { id: "Visualisasi gambar oleh AI", ar: "تصور صورة بواسطة الذكاء الاصطناعي", en: "Image visualization by AI" },
  aiImageAltWithTopic: { id: "Visualisasi gambar oleh AI tentang: {topic}", ar: "تصور صورة بواسطة الذكاء الاصطناعي حول: {topic}", en: "Image visualization by AI of: {topic}" },
  aiImageDisclaimer: { id: "Gambar ini adalah interpretasi artistik yang dihasilkan oleh AI dan mungkin tidak sepenuhnya akurat secara historis.", ar: "هذه الصورة هي تفسير فني تم إنشاؤه بواسطة الذكاء الاصطناعي وقد لا تكون دقيقة تاريخيًا بالكامل.", en: "This image is an artistic interpretation generated by AI and may not be entirely historically accurate." },
  invalidChartData: { id: "Data untuk visualisasi tidak lengkap atau tidak valid.", ar: "بيانات التصور غير مكتملة أو غير صالحة.", en: "Data for visualization is incomplete or invalid." },

  // Footer
  footerText: { id: "Sebuah proyek untuk membuat pengetahuan sejarah Islam lebih mudah diakses dan menarik melalui teknologi AI.", ar: "مشروع يهدف إلى جعل المعرفة بالتاريخ الإسلامي أكثر سهولة وجاذبية من خلال تقنية الذكاء الاصطناعي.", en: "A project to make Islamic historical knowledge more accessible and engaging through AI technology." },
  footerAbout: { id: "Tentang Proyek Ini", ar: "عن هذا المشروع", en: "About This Project" },
  
  // About Modal
  aboutTitle: { id: "Tentang Proyek Ini", ar: "عن هذا المشروع", en: "About This Project" },
  aboutCloseButton: { id: "Tutup", ar: "إغلاق", en: "Close" },
  aboutIntro: { id: "Ensiklopedia AI Peradaban Islam adalah sebuah platform eksplorasi pengetahuan yang dirancang untuk membuka wawasan tentang kekayaan sejarah, budaya, dan kontribusi peradaban Islam kepada dunia.", ar: "موسوعة الذكاء الاصطناعي للحضارة الإسلامية هي منصة استكشاف معرفية مصممة لفتح آفاق حول ثراء تاريخ وثقافة ومساهمات الحضارة الإسلامية للعالم.", en: "The AI Encyclopedia of Islamic Civilization is a knowledge exploration platform designed to provide insights into the rich history, culture, and contributions of Islamic civilization to the world." },
  aboutMissionTitle: { id: "Misi Kami", ar: "مهمتنا", en: "Our Mission" },
  aboutMissionText: { id: "Misi kami adalah menyajikan informasi historis yang akurat, komprehensif, dan mudah diakses. Dengan memanfaatkan kekuatan kecerdasan buatan (AI), kami bertujuan untuk menjadi jembatan antara warisan intelektual masa lalu dan keingintahuan generasi masa kini, serta menginspirasi pembelajaran dan penelitian lebih lanjut.", ar: "مهمتنا هي تقديم معلومات تاريخية دقيقة وشاملة وسهلة الوصول. من خلال الاستفادة من قوة الذكاء الاصطناعي (AI)، نهدف إلى أن نكون جسرًا بين التراث الفكري للماضي وفضول الجيل الحالي، وإلهام المزيد من التعلم والبحث.", en: "Our mission is to present historical information that is accurate, comprehensive, and easily accessible. By harnessing the power of artificial intelligence (AI), we aim to be a bridge between the intellectual heritage of the past and the curiosity of the present generation, inspiring further learning and research." },
  aboutTechTitle: { id: "Teknologi di Balik Layar", ar: "التكنولوجيا وراء الكواليس", en: "Technology Behind the Scenes" },
  aboutTechAI: { id: "Model AI: Aplikasi ini didukung oleh Google Gemini, sebuah model AI canggih yang mampu memahami dan menghasilkan jawaban yang mendalam dan kontekstual.", ar: "نموذج الذكاء الاصطناعي: هذا التطبيق مدعوم من Google Gemini، وهو نموذج ذكاء اصطناعي متقدم قادر على فهم وتوليد إجابات عميقة وسياقية.", en: "AI Model: This application is powered by Google Gemini, an advanced AI model capable of understanding and generating deep, contextual answers." },
  aboutTechWebSearch: { id: "Pencarian Web: Untuk informasi terkini, Gemini terintegrasi dengan Google Search, memastikan jawaban yang diberikan selalu relevan dan didukung oleh sumber-sumber web yang kredibel.", ar: "بحث الويب: للحصول على أحدث المعلومات، يتكامل Gemini مع بحث Google، مما يضمن أن الإجابات المقدمة دائمًا ذات صلة ومدعومة بمصادر ويب موثوقة.", en: "Web Search: For up-to-date information, Gemini is integrated with Google Search, ensuring that the answers provided are always relevant and backed by credible web sources." },
  aboutTechInterface: { id: "Antarmuka: Dibuat dengan React dan Tailwind CSS untuk pengalaman pengguna yang modern, responsif, dan indah.", ar: "الواجهة: تم إنشاؤها باستخدام React و Tailwind CSS لتجربة مستخدم حديثة وسريعة الاستجابة وجميلة.", en: "Interface: Built with React and Tailwind CSS for a modern, responsive, and beautiful user experience." },
  aboutTechViz: { id: "Visualisasi: Peta interaktif menggunakan Leaflet.js dan grafik data menggunakan Recharts untuk menghidupkan data.", ar: "التصور: تستخدم الخرائط التفاعلية Leaflet.js وتستخدم الرسوم البيانية للبيانات Recharts لإضفاء الحيوية على البيانات.", en: "Visualization: Interactive maps use Leaflet.js and data charts use Recharts to bring data to life." },
  aboutDisclaimer: { id: "Proyek ini adalah sebuah karya independen yang didedikasikan untuk pendidikan dan eksplorasi pengetahuan.", ar: "هذا المشروع هو عمل مستقل مكرس للتعليم واستكشاف المعرفة.", en: "This project is an independent work dedicated to education and the exploration of knowledge." },
  
  // Footer Banner
  bannerTitle: { id: "Siap untuk Menjelajah?", ar: "هل أنت مستعد للاستكشاف؟", en: "Ready to Explore?" },
  bannerSubtitle: { id: "Perjalanan sejarah Anda dimulai dengan satu pertanyaan. Apa yang ingin Anda ketahui hari ini?", ar: "رحلتك التاريخية تبدأ بسؤال واحد. ماذا تريد أن تعرف اليوم؟", en: "Your historical journey begins with a single question. What do you want to know today?" },
  bannerButton: { id: "Mulai Bertanya", ar: "ابدأ بالسؤال", en: "Start Asking" },

  // Directory categories
  dirEra: { id: "Era & Kekhalifahan", ar: "العصور والخلافات", en: "Eras & Caliphates" },
  dirScience: { id: "Ilmu Pengetahuan & Filsafat", ar: "العلوم والفلسفة", en: "Science & Philosophy" },
  dirArt: { id: "Seni & Arsitektur", ar: "الفن والعمارة", en: "Art & Architecture" },
  dirEconomy: { id: "Perdagangan & Ekonomi", ar: "التجارة والاقتصاد", en: "Trade & Economy" },
  dirCulture: { id: "Kehidupan Sosial & Budaya", ar: "الحياة الاجتماعية والثقافة", en: "Social Life & Culture" },
  dirFigures: { id: "Tokoh-Tokoh Penting", ar: "شخصيات بارزة", en: "Key Figures" },

  // Admin Dashboard
  adminDashboardTitle: { id: "Dasbor Admin", ar: "لوحة تحكم المسؤول", en: "Admin Dashboard" },
  adminOverview: { id: "Gambaran Umum", ar: "نظرة عامة", en: "Overview" },
  adminUserManagement: { id: "Manajemen Pengguna", ar: "إدارة المستخدمين", en: "User Management" },
  adminActivityLog: { id: "Log Aktivitas", ar: "سجل النشاط", en: "Activity Log" },
  adminContentManagement: { id: "Manajemen Konten", ar: "إدارة المحتوى", en: "Content Management" },
  adminTotalUsers: { id: "Total Pengguna", ar: "إجمالي المستخدمين", en: "Total Users" },
  adminTotalQueries: { id: "Total Pertanyaan", ar: "إجمالي الاستعلامات", en: "Total Queries" },
  adminQueriesToday: { id: "Pertanyaan Hari Ini", ar: "استعلامات اليوم", en: "Queries Today" },
  adminTopTopics: { id: "Topik Paling Dicari", ar: "المواضيع الأكثر بحثًا", en: "Top Searched Topics" },
  adminRecentQueries: { id: "Pertanyaan Terbaru", ar: "الاستعلامات الأخيرة", en: "Recent Queries" },
  adminTableUser: { id: "Pengguna", ar: "المستخدم", en: "User" },
  adminTableEmail: { id: "Email", ar: "البريد الإلكتروني", en: "Email" },
  adminTableRole: { id: "Peran", ar: "الدور", en: "Role" },
  adminTableJoined: { id: "Bergabung", ar: "انضم في", en: "Joined" },
  adminTableQueryCount: { id: "Jumlah Pertanyaan", ar: "عدد الاستعلامات", en: "Query Count" },
  adminTableQuery: { id: "Pertanyaan", ar: "الاستعلام", en: "Query" },
  adminTableTimestamp: { id: "Waktu", ar: "الوقت", en: "Timestamp" },
  adminTableActions: { id: "Tindakan", ar: "الإجراءات", en: "Actions" },
  adminFilterByUser: { id: "Filter berdasarkan pengguna...", ar: "تصفية حسب المستخدم...", en: "Filter by user..." },
  adminFilterByQuery: { id: "Cari pertanyaan...", ar: "بحث في الاستعلامات...", en: "Search queries..." },
  adminAllUsers: { id: "Semua Pengguna", ar: "كل المستخدمين", en: "All Users" },
  adminSystemPromptEditor: { id: "Editor Instruksi Sistem AI", ar: "محرر تعليمات النظام للذكاء الاصطناعي", en: "AI System Prompt Editor" },
  adminSystemPromptDesc: { id: "Ubah instruksi inti yang diberikan kepada AI untuk membentuk kepribadian dan format responsnya. Perubahan akan berlaku untuk semua permintaan di masa mendatang.", ar: "عدّل التعليمات الأساسية المقدمة للذكاء الاصطناعي لتشكيل شخصيته وتنسيق استجابته. ستطبق التغييرات على جميع الطلبات المستقبلية.", en: "Modify the core instructions given to the AI to shape its personality and response format. Changes will apply to all future requests." },
  adminDirectoryEditor: { id: "Editor Direktori Halaman Utama", ar: "محرر دليل الصفحة الرئيسية", en: "Homepage Directory Editor" },
  adminDirectoryDesc: { id: "Kelola topik-topik contoh yang ditampilkan di halaman utama aplikasi.", ar: "إدارة الموضوعات النموذجية المعروضة على الصفحة الرئيسية للتطبيق.", en: "Manage the example topics displayed on the application's homepage." },
  adminSave: { id: "Simpan Perubahan", ar: "حفظ التغييرات", en: "Save Changes" },
  adminSaved: { id: "Tersimpan!", ar: "تم الحفظ!", en: "Saved!" },
  adminReset: { id: "Reset ke Default", ar: "إعادة التعيين إلى الافتراضي", en: "Reset to Default" },
  adminConfirmReset: { id: "Apakah Anda yakin ingin mengembalikan ke default? Perubahan yang belum disimpan akan hilang.", ar: "هل أنت متأكد أنك تريد العودة إلى الوضع الافتراضي؟ ستفقد التغييرات غير المحفوظة.", en: "Are you sure you want to revert to default? Your unsaved changes will be lost." },
  adminAddCategory: { id: "Tambah Kategori", ar: "إضافة فئة", en: "Add Category" },
  adminAddItem: { id: "Tambah Item", ar: "إضافة عنصر", en: "Add Item" },
  adminEdit: { id: "Ubah", ar: "تعديل", en: "Edit" },
  adminDelete: { id: "Hapus", ar: "حذف", en: "Delete" },
  adminMobileNavLabel: { id: "Navigasi Dasbor", ar: "تنقل لوحة التحكم", en: "Dashboard Navigation" },
  adminConfirmDelete: { id: "Apakah Anda yakin ingin menghapus '{name}'?", ar: "هل أنت متأكد أنك تريد حذف '{name}'؟", en: "Are you sure you want to delete '{name}'?" },
  adminPromptCategory: { id: "Masukkan nama kategori baru (dalam Bahasa Indonesia untuk ikon):", ar: "أدخل اسم الفئة الجديدة (باللغة الإندونيسية للرمز):", en: "Enter the new category name (in Indonesian for the icon):" },
  adminPromptItem: { id: "Masukkan item topik baru:", ar: "أدخل عنصر الموضوع الجديد:", en: "Enter the new topic item:" },
  adminPromptEdit: { id: "Ubah nama:", ar: "تعديل الاسم:", en: "Edit name:" },
  adminAddUser: { id: "Tambah Pengguna", ar: "إضافة مستخدم", en: "Add User" },
  adminConfirmDeleteUser: { id: "Apakah Anda yakin ingin menghapus pengguna '{name}'? Semua riwayat mereka juga akan dihapus.", ar: "هل أنت متأكد أنك تريد حذف المستخدم '{name}'؟ سيتم حذف كل سجلاتهم أيضًا.", en: "Are you sure you want to delete the user '{name}'? All of their history will be deleted as well." },
  adminConfirmDeleteLog: { id: "Apakah Anda yakin ingin menghapus entri riwayat ini?", ar: "هل أنت متأكد أنك تريد حذف هذا السجل؟", en: "Are you sure you want to delete this history entry?" },
  adminCreateUserTitle: { id: "Buat Pengguna Baru", ar: "إنشاء مستخدم جديد", en: "Create New User" },
  adminEditUserTitle: { id: "Ubah Pengguna", ar: "تعديل المستخدم", en: "Edit User" },
  username: { id: "Nama Pengguna", ar: "اسم المستخدم", en: "Username" },
  role: { id: "Peran", ar: "الدور", en: "Role" },
  password: { id: "Kata Sandi", ar: "كلمة المرور", en: "Password" },
  adminSearchUserPlaceholder: { id: "Cari pengguna (nama/email)...", ar: "ابحث عن مستخدم (الاسم/البريد الإلكتروني)...", en: "Search user (name/email)..." },
  adminFilterByRole: { id: "Filter berdasarkan peran", ar: "تصفية حسب الدور", en: "Filter by role" },
  adminAllRoles: { id: "Semua Peran", ar: "كل الأدوار", en: "All Roles" },
  adminExportCSV: { id: "Ekspor ke CSV", ar: "تصدير إلى CSV", en: "Export to CSV" },
  adminNoUsersToExport: { id: "Tidak ada pengguna yang cocok dengan filter untuk diekspor.", ar: "لا يوجد مستخدمون يطابقون الفلتر للتصدير.", en: "No users matching filter to export." },
  adminIndonesian: { id: "Bahasa Indonesia", ar: "الإندونيسية", en: "Indonesian" },
  adminArabic: { id: "Bahasa Arab", ar: "العربية", en: "Arabic" },
  adminEnglish: { id: "Bahasa Inggris", ar: "الإنجليزية", en: "English" },
  adminCategory: { id: "Kategori", ar: "الفئة", en: "Category" },
  adminItems: { id: "Item", ar: "العناصر", en: "Items" },
  adminIconHelpText: { id: "Ikon ditentukan oleh nama kategori Bahasa Indonesia", ar: "يتم تحديد الرمز بواسطة اسم الفئة الإندونيسية", en: "Icon is determined by the Indonesian category name" },
  adminConfirmDeleteCategory: { id: "Apakah Anda yakin ingin menghapus kategori '{name}' dan semua item di dalamnya?", ar: "هل أنت متأكد أنك تريد حذف الفئة '{name}' وجميع العناصر الموجودة بداخلها؟", en: "Are you sure you want to delete the category '{name}' and all its items?" },
  adminConfirmDeleteItem: { id: "Apakah Anda yakin ingin menghapus item '{name}'?", ar: "هل أنت متأكد أنك تريد حذف العنصر '{name}'؟", en: "Are you sure you want to delete the item '{name}'?" },
};

type TranslationKey = keyof typeof translations;

export function useTranslation() {
    const { language } = useLanguage();
    const t = useCallback((key: TranslationKey, replacements?: Record<string, string | number>): string => {
        let translation = translations[key]?.[language] || String(key);

        if (replacements) {
            Object.keys(replacements).forEach(placeholder => {
                const value = replacements[placeholder];
                translation = translation.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
            });
        }

        return translation;
    }, [language]);
    
    return { t, lang: language };
}