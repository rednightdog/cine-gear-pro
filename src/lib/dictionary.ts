export type Language = 'TR' | 'EN';

export const jobTitles = [
    { value: "Görüntü Yönetmeni", tr: "Görüntü Yönetmeni", en: "Director of Photography" },
    { value: "Kameraman", tr: "Kameraman", en: "Camera Operator" },
    { value: "Focus Puller", tr: "Focus Puller (1. AC)", en: "1st AC (Focus Puller)" },
    { value: "2. Kamera Asistanı", tr: "2. Kamera Asistanı", en: "2nd AC" },
    { value: "3. Kamera Asistanı", tr: "3. Kamera Asistanı", en: "3rd AC" },
    { value: "DIT", tr: "DIT", en: "DIT" },
    { value: "Işık Şefi", tr: "Işık Şefi", en: "Gaffer" },
    { value: "Yapımcı", tr: "Yapımcı", en: "Producer" },
    { value: "Kiralama Şirketi", tr: "Kiralama Şirketi", en: "Rental House" },
    { value: "Diğer", tr: "Diğer", en: "Other" },
];

export const dictionary = {
    TR: {
        nav: {
            catalog: "Katalog",
            builder: "Oluşturucu",
            dashboard: "Listelerim",
            login: "Giriş",
            signup: "Kayıt Ol",
            logout: "Çıkış"
        },
        auth: {
            createAccount: "Hesap Oluştur",
            intro: "Ekipman listelerini oluşturmaya başla",
            fullName: "Ad Soyad",
            email: "E-posta",
            password: "Şifre",
            jobTitle: "Meslek",
            language: "Dil / Language",
            register: "Kayıt Ol",
            alreadyHaveAccount: "Zaten hesabın var mı?",
            signin: "Giriş yap",
            welcomeLogin: "Tekrar Hoşgeldin",
            loginIntro: "Hesabına giriş yap",
            loginButton: "Giriş Yap",
            noAccount: "Hesabın yok mu?",
            signupLink: "Kayıt ol"
        },
        sidebar: {
            title: "Mevcut Kit",
            itemsSelected: "ekipman seçildi",
            totalDaily: "Günlük Toplam",
            finalize: "Listeyi Tamamla",
            empty: "Listeniz boş."
        },
        dashboard: {
            myKits: "Listelerim",
            createNew: "Yeni Kit Oluştur",
            noKits: "Henüz kaydedilmiş kit yok.",
            lastUpdated: "Son Güncelleme",
            itemCount: "Parça",
            privacy: "Gizlilik",
            public: "Herkese Açık",
            private: "Özel",
            view: "Görüntüle",
            delete: "Sil",
            share: "Paylaş"
        },
        builder: {
            filters: "Filtreler",
            searchPlaceholder: "Ekipman ara...",
            allCategories: "Tüm Kategoriler",
            addToKit: "Ekle",
            notesPlaceholder: "Notlar..."
        }
    },
    EN: {
        nav: {
            catalog: "Catalog",
            builder: "Builder",
            dashboard: "My Lists",
            login: "Login",
            signup: "Sign Up",
            logout: "Logout"
        },
        auth: {
            createAccount: "Create Account",
            intro: "Start building your equipment lists",
            fullName: "Full Name",
            email: "Email",
            password: "Password",
            jobTitle: "Job Title",
            language: "Language / Dil",
            register: "Register",
            alreadyHaveAccount: "Already have an account?",
            signin: "Sign in",
            welcomeLogin: "Welcome Back",
            loginIntro: "Sign in to your account",
            loginButton: "Login",
            noAccount: "Don't have an account?",
            signupLink: "Sign up"
        },
        sidebar: {
            title: "Current Kit",
            itemsSelected: "items selected",
            totalDaily: "Total Daily Rate",
            finalize: "Finalize Kit",
            empty: "Your kit is empty."
        },
        dashboard: {
            myKits: "My Kits",
            createNew: "Create New Kit",
            noKits: "No saved kits yet.",
            lastUpdated: "Last Updated",
            itemCount: "Items",
            privacy: "Privacy",
            public: "Public",
            private: "Private",
            view: "View",
            delete: "Delete",
            share: "Share"
        },
        builder: {
            filters: "Filters",
            searchPlaceholder: "Search equipment...",
            allCategories: "All Categories",
            addToKit: "Add",
            notesPlaceholder: "Notes..."
        }
    }
};
