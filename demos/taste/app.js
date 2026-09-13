/**
 * Taste Restaurant - Premium Digital Menu Web App
 * Real-time sync with Firestore for menu data and analytics.
 */

import { db, isFirebaseReady } from "./firebase-config.js?v=3";
import { getPublicOrderErrorMessage } from "./firebase-errors.js";
import {
    doc,
    collection,
    onSnapshot,
    updateDoc,
    addDoc,
    increment,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================================================
// 1. Default display data (used only when Firestore has no data yet)
// ==========================================================================
const DEFAULT_LOGO = "assets/logo-seal.jpg";
const FALLBACK_DISH_IMAGE = "assets/dish-fallback.svg";

const fallbackRestaurant = {
    name: { en: "Taste Restaurant", ar: "مطعم تيست" },
    slogan: { en: "Fresh & Delicious Every Day", ar: "طازج ولذيذ كل يوم" },
    whatsappNumber: "+970599123456",
    logoUrl: DEFAULT_LOGO,
    colors: { bg: "#0A0A0A", surface: "#121212", gold: "#D4AF37" },
    workingHours: { en: "Saturday - Friday (12:00 PM - 12:00 AM)", ar: "السبت - الجمعة (12:00 ظهراً - 12:00 ليلاً)" },
    currency: { en: "JD", ar: "دينار" },
    address: { en: "Ramallah, Palestine", ar: "رام الله، فلسطين" },
    subscription: { status: "active" }
};

const fallbackCategories = [
    { id: "burgers", name: { en: "Burgers", ar: "البرغر" }, orderIndex: 0 },
    { id: "pizza", name: { en: "Pizza", ar: "البيتزا" }, orderIndex: 1 },
    { id: "drinks", name: { en: "Drinks", ar: "المشروبات" }, orderIndex: 2 },
    { id: "desserts", name: { en: "Desserts", ar: "الحلويات" }, orderIndex: 3 }
];

const fallbackItems = [
    {
        id: "truffle-burger",
        categoryId: "burgers",
        price: 8.0,
        imageUrl: "assets/truffle_burger.png",
        name: { en: "Truffle Burger", ar: "برغر الترفل" },
        description: { en: "Juicy Angus beef, premium black truffle aioli, melted Swiss cheese, and caramelized onions on a toasted brioche bun.", ar: "لحم أنجوس مشوي، صلصة الترافل الأسود الفاخرة، جبن سويسري ذائب، وبصل مكرمل في خبز البريوش الطازج." },
        tags: { en: ["Premium", "Chef Special"], ar: ["فاخر", "مميز"] },
        isAvailable: true
    },
    {
        id: "cheese-burger",
        categoryId: "burgers",
        price: 7.0,
        imageUrl: "assets/cheese_burger.png",
        name: { en: "Cheese Burger", ar: "برغر الجبن" },
        description: { en: "Premium beef patty, melting cheddar cheese, fresh crisp lettuce, vine-ripened tomatoes, and our signature special sauce.", ar: "شريحة لحم بقري فاخر، جبنة شيدر ذائبة، خس طازج، طماطم، وصلصة تيست الخاصة." },
        tags: { en: ["Classic"], ar: ["كلاسيكي"] },
        isAvailable: true
    },
    {
        id: "margherita-pizza",
        categoryId: "pizza",
        price: 9.0,
        imageUrl: "assets/margherita_pizza.png",
        name: { en: "Margherita Pizza", ar: "بيتزا مارغريتا" },
        description: { en: "Artisan pizza crust topped with rich tomato sauce, fresh buffalo mozzarella, aromatic fresh basil leaves, and a drizzle of extra virgin olive oil.", ar: "عجينة البيتزا الحرفية تعلوها صلصة الطماطم الغنية، جبنة الموزاريلا الطازجة، أوراق الريحان العطرية ورشة من زيت الزيتون البكر." },
        tags: { en: ["Vegetarian", "Artisan"], ar: ["نباتي", "حرفية"] },
        isAvailable: true
    },
    {
        id: "pepperoni-pizza",
        categoryId: "pizza",
        price: 10.0,
        imageUrl: "assets/pepperoni_pizza.png",
        name: { en: "Pepperoni Pizza", ar: "بيتزا بيبروني" },
        description: { en: "Classic Italian crust loaded with premium spicy beef pepperoni, mozzarella cheese, fresh oregano, and an optional touch of hot honey.", ar: "عجينة إيطالية كلاسيكية مغطاة بقطع البيبروني البقري الحار، جبنة الموزاريلا، الأوريغانو الطازج مع لمسة عسل حار اختيارية." },
        tags: { en: ["Spicy"], ar: ["حار"] },
        isAvailable: true
    },
    {
        id: "golden-mojito",
        categoryId: "drinks",
        price: 3.0,
        imageUrl: "assets/golden_mojito.png",
        name: { en: "Golden Mojito", ar: "موهيتو ذهبي" },
        description: { en: "A refreshing blend of fresh lime, wild mint, sparkling club soda, and edible 24K gold flakes for a touch of luxury.", ar: "مزيج منعش من الليمون الأخضر، النعناع البري، صودا فوارة ورقاقات الذهب عيار 24 القابلة للأكل لمسة من الفخامة." },
        tags: { en: ["Signature", "Cold"], ar: ["توقيعنا", "بارد"] },
        isAvailable: true
    },
    {
        id: "orange-juice",
        categoryId: "drinks",
        price: 2.5,
        imageUrl: "assets/orange_juice.jpg",
        name: { en: "Fresh Orange Juice", ar: "عصير برتقال طازج" },
        description: { en: "100% freshly squeezed sweet oranges, served chilled on ice. Packed with Vitamin C and natural energy.", ar: "عصير برتقال طبيعي 100% معصور طازجاً، يقدم مبرداً مع الثلج. غني بفيتامين سي والطاقة الطبيعية." },
        tags: { en: ["Fresh"], ar: ["طازج"] },
        isAvailable: true
    },
    {
        id: "kunafa-cheesecake",
        categoryId: "desserts",
        price: 5.0,
        imageUrl: "assets/kunafa_cheesecake.jpg",
        name: { en: "Pistachio Kunafa Cheesecake", ar: "تشيز كيك الكنافة بالفستق" },
        description: { en: "An exquisite fusion of creamy New York cheesecake layered with crispy, golden Arabic kunafa, topped with rich pistachio sauce.", ar: "اندماج فاخر بين التشيز كيك الكريمي الغني وعجينة الكنافة الذهبية المقرمشة، مغطاة بصلصة الفستق الحلبي الفاخرة." },
        tags: { en: ["Best Seller", "Fusion"], ar: ["الأكثر مبيعاً", "مبتكر"] },
        isAvailable: true
    },
    {
        id: "lava-cake",
        categoryId: "desserts",
        price: 4.0,
        imageUrl: "assets/lava_cake.jpg",
        name: { en: "Chocolate Lava Cake", ar: "كيك الشوكولاتة البركانية" },
        description: { en: "Warm chocolate cake with a molten, liquid chocolate center, lightly dusted with cocoa and served with premium vanilla ice cream.", ar: "كيك الشوكولاتة الدافئ مع قلب من الشوكولاتة السائلة الذائبة، مرشوش بالكاكاو ويقدم مع آيس كريم الفانيليا الفاخر." },
        tags: { en: ["Warm"], ar: ["دافئ"] },
        isAvailable: true
    }
];

// ==========================================================================
// 2. Translations Dictionary
// ==========================================================================
const translations = {
    en: {
        title: "Taste Restaurant - Premium Digital Menu",
        slogan: "Fresh & Delicious Every Day",
        searchPlaceholder: "Search menu items...",
        filterLabel: "Filter",
        filterTitle: "Filter by Category",
        catAll: "All Menu",
        heroKicker: "Digital Dining Menu",
        itemsFound: "items found",
        noItemsTitle: "No items found",
        noItemsDesc: "Try searching for something else or browse other categories.",
        cartTitle: "Your Order List",
        cartEmpty: "Your order is empty. Add delicious items from the menu!",
        cartTotal: "Total Amount",
        sendWhatsAppOrder: "Send Order via WhatsApp",
        workingHoursTitle: "Opening Hours",
        daysWeek: "Saturday - Friday",
        hoursWeek: "12:00 PM - 12:00 AM",
        contactTitle: "Contact Us",
        address: "Ramallah, Palestine",
        scanMenuTitle: "Scan Our Menu",
        scanMenuDesc: "Share this menu with family & friends by scanning this QR Code.",
        copyright: "All rights reserved. Designed for excellence.",
        footerSlogan: "A luxury culinary experience crafted with passion and premium ingredients.",
        orderNow: "Order Now",
        addToOrder: "Add to Order",
        currency: "JD",
        itemAdded: "Item added to your order!",
        cartPruned: "Some dishes were removed because they are no longer available.",
        orderOffline: "Ordering is unavailable right now. Check your connection and try again.",
        emptyCheckout: "Add dishes to your order first.",
        menuOfflineTitle: "Menu Temporarily Offline",
        menuOfflineDesc: "This digital menu is temporarily unavailable. Please contact the restaurant administration.",
        outOfStock: "Out of Stock",
        qtyDecrease: "Decrease quantity",
        qtyIncrease: "Increase quantity",
        removeItem: "Remove item"
    },
    ar: {
        title: "مطعم تيست - قائمة الطعام الرقمية المميزة",
        slogan: "طازج ولذيذ كل يوم",
        searchPlaceholder: "ابحث عن طبق...",
        filterLabel: "تصفية",
        filterTitle: "تصفية حسب الفئة",
        catAll: "القائمة الكاملة",
        heroKicker: "قائمة الطعام الرقمية",
        itemsFound: "أطباق متوفرة",
        noItemsTitle: "لم يتم العثور على أطباق",
        noItemsDesc: "حاول البحث عن شيء آخر أو تصفح فئات أخرى.",
        cartTitle: "تفاصيل طلبك",
        cartEmpty: "سلة طلبك فارغة حالياً. أضف أطباقاً شهية من القائمة!",
        cartTotal: "المجموع الإجمالي",
        sendWhatsAppOrder: "تأكيد الطلب",
        workingHoursTitle: "أوقات العمل",
        daysWeek: "السبت - الجمعة",
        hoursWeek: "12:00 ظهراً - 12:00 ليلاً",
        contactTitle: "اتصل بنا",
        address: "رام الله، فلسطين",
        scanMenuTitle: "امسح القائمة الرقمية",
        scanMenuDesc: "شارك هذه القائمة مع العائلة والأصدقاء عبر مسح هذا الكود.",
        copyright: "جميع الحقوق محفوظة. صُمم بتميز لراحتكم.",
        footerSlogan: "تجربة طهي فاخرة معدة بشغف ومن أجود المكونات الطازجة.",
        orderNow: "اطلب الآن",
        addToOrder: "أضف للطلب",
        currency: "دينار",
        itemAdded: "تمت إضافة الطبق لطلبك!",
        cartPruned: "تمت إزالة أطباق لم تعد متوفرة من طلبك.",
        orderOffline: "الطلب غير متاح حالياً. تحقق من الاتصال وحاول مجدداً.",
        emptyCheckout: "أضف أطباقاً إلى طلبك أولاً.",
        menuOfflineTitle: "قائمة الطعام متوقفة مؤقتاً",
        menuOfflineDesc: "هذه القائمة متوقفة حالياً عن العمل. يرجى مراجعة إدارة المطعم.",
        outOfStock: "غير متوفر",
        qtyDecrease: "إنقاص الكمية",
        qtyIncrease: "زيادة الكمية",
        removeItem: "إزالة الطبق"
    }
};

// ==========================================================================
// 3. Dynamic State Variables
// ==========================================================================
let currentLanguage = "ar"; // Arabic-only experience
let currentCategory = "all";
let searchQuery = "";
let cart = [];
let isSubmittingOrder = false;

// Restaurant config data loaded from DB (or fallback)
let restaurantConfig = { ...fallbackRestaurant };
let categoriesList = [ ...fallbackCategories ];
let menuItemsList = [ ...fallbackItems ];
let activeRestaurantId = "taste";

// DOM Elements
const screenLoader = document.getElementById("screen-loader");
const expiredScreen = document.getElementById("expired-screen");
const menuGrid = document.getElementById("menu-grid");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("menu-search");
const searchClear = document.getElementById("search-clear");
const currentCategoryTitle = document.getElementById("current-category-title");
const itemsCountDisplay = document.getElementById("items-count");
const langToggle = document.getElementById("lang-toggle");
const themeToggle = document.getElementById("theme-toggle");
const THEME_STORAGE_KEY = "theme";

// Filter modal DOM (resolved on init)
let filterToggle = null;
let filterModal = null;
let filterFocusTrap = null;
let filterModalClose = null;
let filterModalOverlay = null;
let filterCategoriesList = null;

// Cart DOM Elements
const cartToggle = document.getElementById("cart-toggle");
const cartDrawer = document.getElementById("cart-drawer");
const cartClose = document.getElementById("cart-close");
const cartItemsContainer = document.getElementById("cart-items");
const cartEmptyState = document.getElementById("cart-empty-state");
const cartTotalValue = document.getElementById("cart-total-value");
const cartCountBadge = document.getElementById("cart-count");
const whatsappCheckoutBtn = document.getElementById("whatsapp-checkout");
const floatingWhatsappBtn = document.getElementById("floating-whatsapp-btn");
const floatingCartBadge = document.getElementById("floating-cart-badge");

// QR Code DOM Element
const qrCodeImg = document.getElementById("qr-code-img");

function cacheFilterDom() {
    filterToggle = document.getElementById("filter-toggle");
    filterModal = document.getElementById("filter-modal");
    filterModalClose = document.getElementById("filter-modal-close");
    filterModalOverlay = document.querySelector("#filter-modal .filter-modal-overlay");
    filterCategoriesList = document.getElementById("filter-categories-list");
}

// ==========================================================================
// 4. Initialisation
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    cacheFilterDom();

    const urlParams = new URLSearchParams(window.location.search);
    const rParam = urlParams.get("r");
    if (rParam && rParam.trim() !== "") {
        activeRestaurantId = rParam.toLowerCase().trim();
    }

    // Arabic-only: no language detection or persistence needed
    currentLanguage = "ar";

    loadCartFromStorage();
    initTheme();

    if (!isFirebaseReady || !db) {
        console.error("Firestore unavailable. Check firebase-config.js.");
        applyRestaurantConfig(fallbackRestaurant);
        applyCategories(fallbackCategories);
        applyMenuItems(fallbackItems);
        hideLoader();
    } else {
        syncWithFirestore();
    }

    setupEventListeners();
    setupQrCode();
    renderFilterModal();
});

// Setup dynamic QR code pointing to active URL
function setupQrCode() {
    let currentUrl = window.location.href;
    if (currentUrl.includes("127.0.0.1") || currentUrl.includes("localhost") || currentUrl.startsWith("file:///")) {
        // Fallback for clean QR codes locally
        currentUrl = `https://taste-restaurant.github.io/?r=${activeRestaurantId}`;
    }
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=d4af37&bgcolor=060606&data=${encodeURIComponent(currentUrl)}`;
    if (qrCodeImg) {
        qrCodeImg.src = qrApiUrl;
    }
}

// Hide full-screen load curtain
function hideLoader() {
    if (screenLoader && !screenLoader.classList.contains("fade-out")) {
        screenLoader.classList.add("fade-out");
    }
}

// ==========================================================================
// 5. Firebase Sync Engine
// ==========================================================================
let firestoreUnsubscribers = [];

function syncWithFirestore() {
    const restaurantDocRef = doc(db, "restaurants", activeRestaurantId);

    // Detach any previously-attached listeners before re-subscribing so they
    // never stack up (and stop billing/rendering after the page is dismissed).
    teardownFirestoreListeners();

    // 1. Sync Restaurant Settings
    firestoreUnsubscribers.push(onSnapshot(restaurantDocRef, (snapshot) => {
        if (!snapshot.exists()) {
            console.warn(`Restaurant "${activeRestaurantId}" not found in Firestore. Loading local template...`);
            applyRestaurantConfig(fallbackRestaurant);
            showToast(translations[currentLanguage].menuOfflineDesc);
            hideLoader();
            return;
        }

        const data = snapshot.data();
        
        // Subscription check
        if (data.subscription && data.subscription.status === "expired") {
            showExpiredScreen();
            hideLoader();
            return;
        }

        applyRestaurantConfig(data);
        
        // Increment views once per session
        triggerPageViewTracker();
        hideLoader();
    }, (error) => {
        console.error("Firestore sync error (settings):", error);
        applyRestaurantConfig(fallbackRestaurant);
        hideLoader();
    }));

    // 2. Sync Categories (Ordered by orderIndex)
    const categoriesQuery = query(
        collection(db, "restaurants", activeRestaurantId, "categories"),
        orderBy("orderIndex", "asc")
    );

    firestoreUnsubscribers.push(onSnapshot(categoriesQuery, (snapshot) => {
        const fetchedCats = [];
        snapshot.forEach(docSnap => {
            fetchedCats.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (fetchedCats.length > 0) {
            applyCategories(fetchedCats);
        } else {
            applyCategories(fallbackCategories);
        }
    }, (error) => {
        console.error("Firestore sync error (categories):", error);
        applyCategories(fallbackCategories);
    }));

    // 3. Sync Menu Items (Ordered by orderIndex)
    const itemsQuery = query(
        collection(db, "restaurants", activeRestaurantId, "menu_items"),
        orderBy("orderIndex", "asc")
    );

    firestoreUnsubscribers.push(onSnapshot(itemsQuery, (snapshot) => {
        const fetchedItems = [];
        snapshot.forEach(docSnap => {
            fetchedItems.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (fetchedItems.length > 0) {
            applyMenuItems(fetchedItems, { pruneCart: true });
        } else {
            applyMenuItems(fallbackItems);
        }
    }, (error) => {
        console.error("Firestore sync error (items):", error);
        applyMenuItems(fallbackItems);
    }));
}

// Detach all active Firestore listeners (prevents listener/cost leaks).
function teardownFirestoreListeners() {
    firestoreUnsubscribers.forEach((unsub) => {
        try { unsub(); } catch (e) { /* already detached */ }
    });
    firestoreUnsubscribers = [];
}

// Clean up listeners when the page is unloaded or hidden (bfcache-friendly).
window.addEventListener("pagehide", teardownFirestoreListeners, { once: true });

// Show subscription expiry screen block
function showExpiredScreen() {
    if (expiredScreen) {
        expiredScreen.classList.remove("hidden");
    }
    document.querySelector("main")?.setAttribute("inert", "");
    document.querySelector(".main-header")?.setAttribute("inert", "");
    document.querySelector(".main-footer")?.setAttribute("inert", "");
    cartDrawer?.setAttribute("inert", "");
    floatingWhatsappBtn?.setAttribute("hidden", "");
}

// Increment overall restaurant views counter once per session
function triggerPageViewTracker() {
    if (!db) return;
    const viewFlagKey = `tasteMenuViewsTracked_${activeRestaurantId}`;
    if (!sessionStorage.getItem(viewFlagKey)) {
        updateDoc(doc(db, "restaurants", activeRestaurantId), {
            "analytics.views": increment(1)
        }).then(() => {
            sessionStorage.setItem(viewFlagKey, "true");
        }).catch(err => console.error("Error updating views log:", err));
    }
}

// Increment WhatsApp checkout clicks
function triggerWhatsAppClicksTracker() {
    if (!db) return;
    updateDoc(doc(db, "restaurants", activeRestaurantId), {
        "analytics.whatsappOrders": increment(1)
    }).catch(err => console.error("Error updating analytics:", err));
}

// Increment specific menu item clicks
function triggerItemOrderClickTracker(itemId) {
    if (!db) return;
    const itemRef = doc(db, "restaurants", activeRestaurantId, "menu_items", itemId);
    updateDoc(itemRef, {
        "orderClicks": increment(1),
        "views": increment(1) // increment views alongside clicks
    }).catch(err => console.error("Error updating item analytics:", err));
}

// ==========================================================================
// 6. Data Binder Controllers
// ==========================================================================
function applyRestaurantConfig(data) {
    restaurantConfig = data;

    // Apply dynamic brand colors (respects light/dark mode)
    applyDynamicThemeColors();

    // Refresh translation templates
    applyLanguage(currentLanguage);
}

// ==========================================================================
// Security & utility helpers
// ==========================================================================
// Escape text before injecting it into innerHTML. Prevents stored XSS coming
// from Firestore-sourced content (item names, descriptions, tags, ...).
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function localizedText(value, lang = currentLanguage) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
        return value[lang] || value.ar || value.en || "";
    }
    return String(value);
}

function applyBrandLogo(el, url) {
    if (!el) return;
    const raw = String(url ?? "").trim();
    const isOldPlaceholder = !raw || /assets\/logo\.svg(\?|$)/i.test(raw);
    const logo = isOldPlaceholder ? DEFAULT_LOGO : (safeMediaUrl(raw) || DEFAULT_LOGO);
    el.src = logo;
    el.addEventListener("error", () => {
        if (el.getAttribute("src") !== DEFAULT_LOGO) el.src = DEFAULT_LOGO;
    }, { once: true });
}

const LOCAL_DISH_IMAGES = {
    "truffle-burger": "assets/truffle_burger.png",
    "cheese-burger": "assets/cheese_burger.png",
    "margherita-pizza": "assets/margherita_pizza.png",
    "pepperoni-pizza": "assets/pepperoni_pizza.png",
    "golden-mojito": "assets/golden_mojito.png",
    "orange-juice": "assets/orange_juice.jpg",
    "kunafa-cheesecake": "assets/kunafa_cheesecake.jpg",
    "lava-cake": "assets/lava_cake.jpg"
};

function dishImageUrl(item, width) {
    const fromItem = safeMediaUrl(item?.imageUrl);
    const fromId = LOCAL_DISH_IMAGES[item?.id] || "";
    return optimizedImg(fromItem || fromId || FALLBACK_DISH_IMAGE, width) || FALLBACK_DISH_IMAGE;
}

function safeMediaUrl(url) {
    const v = String(url ?? "").trim();
    if (!v) return "";
    if (/^(javascript|data|vbscript):/i.test(v)) return "";
    return v;
}

function telHref(phone) {
    const digits = String(phone ?? "").replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : "";
}

// Validate a CSS color before injecting it into a <style> element. Accepts hex,
// rgb()/rgba() and hsl()/hsla(); anything else falls back to a safe default so a
// malicious value like "</style><script>" can never reach the DOM.
function safeColor(value, fallback) {
    const v = String(value ?? "").trim();
    const ok = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ||
        /^rgba?\(\s*[\d.,\s%]+\)$/i.test(v) ||
        /^hsla?\(\s*[\d.,\s%deg]+\)$/i.test(v);
    return ok ? v : fallback;
}

// Debounce helper – avoids rebuilding the whole grid on every keystroke.
function debounce(fn, wait) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), wait);
    };
}

// Add Cloudinary auto-format/auto-quality + width transforms so images ship
// far smaller on mobile. Non-Cloudinary URLs are returned untouched.
function optimizedImg(url, width) {
    if (!url) return "";
    const marker = "/upload/";
    const idx = url.indexOf(marker);
    if (idx !== -1 && /res\.cloudinary\.com/.test(url)) {
        const after = url.slice(idx + marker.length);
        // Don't double-insert if a transform (or version) segment is already there
        if (!/^(f_|q_|w_|c_|e_|dpr_)/.test(after)) {
            return url.slice(0, idx + marker.length) + `f_auto,q_auto,w_${width}/` + after;
        }
    }
    return url;
}

// Constrain Tab focus inside a dialog and restore focus to the opener on close.
function createFocusTrap(container) {
    const SEL = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const previouslyFocused = document.activeElement;

    function onKeydown(event) {
        if (event.key !== "Tab") return;
        const nodes = Array.prototype.slice
            .call(container.querySelectorAll(SEL))
            .filter((el) => el.offsetParent !== null);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    document.addEventListener("keydown", onKeydown, true);
    const focusables = container.querySelectorAll(SEL);
    if (focusables.length) requestAnimationFrame(() => focusables[0].focus());

    return {
        release() {
            document.removeEventListener("keydown", onKeydown, true);
            if (previouslyFocused && typeof previouslyFocused.focus === "function") {
                previouslyFocused.focus();
            }
        }
    };
}

function applyDynamicThemeColors() {
    const colors = restaurantConfig.colors || {};
    const dynamicStyle = document.getElementById("dynamic-theme-colors");
    if (!dynamicStyle) return;

    const isLight = document.body.classList.contains("light");

    // Use textContent (not innerHTML) on the <style> node: CSS text is set
    // without HTML parsing, and every value is validated via safeColor().
    if (isLight) {
        if (!colors.gold) {
            dynamicStyle.textContent = "";
            return;
        }
        const gold = safeColor(colors.gold, "#9c6f13");
        dynamicStyle.textContent = `
            html.light, body.light {
                --primary: ${gold};
                --gold: ${gold};
                --gold-dark: ${safeColor(colors.goldDark, '#7a5610')};
                --gold-light: ${safeColor(colors.goldLight, 'rgba(156, 111, 19, 0.12)')};
            }
        `;
        return;
    }

    if (colors.bg && colors.gold) {
        dynamicStyle.textContent = `
            html.dark, body.dark {
                --background: ${safeColor(colors.bg, '#111111')};
                --surface: ${safeColor(colors.surface, '#1a1a1a')};
                --primary: ${safeColor(colors.gold, '#d4af37')};
                --bg-color: ${safeColor(colors.bg, '#111111')};
                --surface-color: ${safeColor(colors.surface, '#1a1a1a')};
                --surface-card: ${safeColor(colors.surfaceCard || colors.surface, '#1a1a1a')};
                --gold: ${safeColor(colors.gold, '#d4af37')};
                --gold-dark: ${safeColor(colors.goldDark, '#aa8c2c')};
                --gold-light: ${safeColor(colors.goldLight, 'rgba(212, 175, 55, 0.15)')};
                --gold-hover: ${safeColor(colors.goldHover, '#F5D36C')};
            }
        `;
    } else {
        dynamicStyle.textContent = "";
    }
}

function applyCategories(cats) {
    categoriesList = cats;
    renderFilterModal();
    updateCategoryTitleText();
}

function applyMenuItems(items, { pruneCart = false } = {}) {
    menuItemsList = Array.isArray(items) ? items : [];
    if (pruneCart) {
        pruneCartAgainstMenu();
    }
    renderMenuItems();
    renderCart();
    if (getFilterCategories().length > 0) {
        renderFilterModal();
    }
}

// ==========================================================================
// 7. Theme Manager
// ==========================================================================
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    const resolvedTheme = theme === "light" ? "light" : "dark";
    document.documentElement.classList.remove("dark", "light");
    document.body.classList.remove("dark", "light");
    document.documentElement.classList.add(resolvedTheme);
    document.body.classList.add(resolvedTheme);
    localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
    applyDynamicThemeColors();
    updateThemeToggleIcon(resolvedTheme);
}

function toggleTheme() {
    const isLight = document.body.classList.contains("light");
    applyTheme(isLight ? "dark" : "light");
}

function updateThemeToggleIcon(theme) {
    const icon = document.querySelector("#theme-toggle .theme-icon");
    if (!icon) return;
    // Font Awesome icon (inherits theme colors) instead of a colorful emoji
    icon.classList.remove("fa-sun", "fa-moon");
    icon.classList.add("fa-solid", theme === "light" ? "fa-moon" : "fa-sun");
}

// ==========================================================================
// 8. Dynamic Translation Manager
// ==========================================================================
function applyLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem("tasteMenuLang", lang);

    // Apply page direction
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    
    // Header title
    document.title = localizedText(restaurantConfig.name) || "Taste Restaurant";

    // Dynamic brand text
    const brandNameEl = document.getElementById("nav-brand-name");
    const logoImgEl = document.getElementById("nav-logo-img");
    if (brandNameEl) brandNameEl.textContent = localizedText(restaurantConfig.name);
    applyBrandLogo(logoImgEl, restaurantConfig.logoUrl);

    // Hero details
    const heroName = document.getElementById("hero-restaurant-name");
    const heroSlogan = document.getElementById("hero-restaurant-slogan");
    const heroLogo = document.getElementById("hero-logo-img");
    if (heroName) heroName.textContent = localizedText(restaurantConfig.name);
    if (heroSlogan) heroSlogan.textContent = localizedText(restaurantConfig.slogan);
    applyBrandLogo(heroLogo, restaurantConfig.logoUrl);

    // Footer details
    const footerLogo = document.getElementById("footer-logo-img");
    const footerName = document.getElementById("footer-restaurant-name");
    const footerSlogan = document.getElementById("footer-restaurant-slogan");
    const footerCopyrightName = document.getElementById("footer-copyright-name");
    
    const footerHours = document.getElementById("footer-hours-val");
    const footerPhone = document.getElementById("footer-phone-val");
    const footerPhoneLink = document.getElementById("footer-phone-link");
    const footerEmail = document.getElementById("footer-email-val");
    const footerEmailLink = document.getElementById("footer-email-link");
    const footerAddress = document.getElementById("footer-address-val");

    applyBrandLogo(footerLogo, restaurantConfig.logoUrl);
    if (footerName) footerName.textContent = localizedText(restaurantConfig.name);
    if (footerSlogan) footerSlogan.textContent = localizedText(restaurantConfig.slogan);
    if (footerCopyrightName) footerCopyrightName.textContent = localizedText(restaurantConfig.name);
    
    if (footerHours) footerHours.textContent = localizedText(restaurantConfig.workingHours);
    if (footerPhone) footerPhone.textContent = restaurantConfig.whatsappNumber || "";
    if (footerPhoneLink) {
        const href = telHref(restaurantConfig.whatsappNumber);
        if (href) footerPhoneLink.setAttribute("href", href);
    }
    const email = restaurantConfig.email || "info@tasterestaurant.com";
    if (footerEmail) footerEmail.textContent = email;
    if (footerEmailLink && email) footerEmailLink.setAttribute("href", `mailto:${email}`);
    if (footerAddress) footerAddress.textContent = localizedText(restaurantConfig.address);

    // Scan DOM for elements with translation tags
    document.querySelectorAll("[data-translate]").forEach(elem => {
        const key = elem.getAttribute("data-translate");
        if (translations[lang][key]) {
            elem.textContent = translations[lang][key];
        }
    });

    // Update Input Placeholders
    document.querySelectorAll("[data-translate-placeholder]").forEach(elem => {
        const key = elem.getAttribute("data-translate-placeholder");
        if (translations[lang][key]) {
            elem.setAttribute("placeholder", translations[lang][key]);
        }
    });

    // Update active category text
    updateCategoryTitleText();
    updateFilterButtonState();
    renderFilterModal();

    // Re-render items
    renderMenuItems();

    // Re-render cart with dynamic language labels
    renderCart();
}

function updateCategoryTitleText() {
    if (!currentCategoryTitle) return;
    
    if (currentCategory === "all") {
        currentCategoryTitle.textContent = translations[currentLanguage].catAll;
    } else {
        const activeCat = categoriesList.find(c => c.id === currentCategory);
        if (activeCat) {
            currentCategoryTitle.textContent = localizedText(activeCat.name);
        } else {
            currentCategoryTitle.textContent = translations[currentLanguage].catAll;
        }
    }
}

// Toggle language hook

// ==========================================================================
// 8. Category Filter Modal
// ==========================================================================
function getCategoryIconHtml(categoryId) {
    const idLower = categoryId.toLowerCase();
    if (idLower.includes("burger")) return '<i class="fa-solid fa-hamburger"></i>';
    if (idLower.includes("pizz")) return '<i class="fa-solid fa-pizza-slice"></i>';
    if (idLower.includes("drink") || idLower.includes("bever")) return '<i class="fa-solid fa-glass-water"></i>';
    if (idLower.includes("dessert") || idLower.includes("sweet")) return '<i class="fa-solid fa-ice-cream"></i>';
    return '<i class="fa-solid fa-circle-dot"></i>';
}

function getCategoryDisplayName(cat, lang) {
    if (cat?.name && typeof cat.name === "object") {
        return cat.name[lang] || cat.name.en || cat.name.ar || cat.id;
    }
    if (typeof cat?.name === "string") return cat.name;
    return cat?.id || "Category";
}

function getFilterCategories() {
    if (categoriesList.length > 0) {
        return [...categoriesList].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    }

    const derived = new Map();
    menuItemsList.forEach((item) => {
        if (!item.categoryId || derived.has(item.categoryId)) return;
        derived.set(item.categoryId, {
            id: item.categoryId,
            name: { en: item.categoryId, ar: item.categoryId },
            orderIndex: derived.size
        });
    });
    return Array.from(derived.values());
}

function renderFilterModal() {
    const list = filterCategoriesList || document.getElementById("filter-categories-list");
    if (!list) return;

    filterCategoriesList = list;
    list.innerHTML = "";
    const lang = currentLanguage;
    const categories = getFilterCategories();

    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = `filter-category-btn ${currentCategory === "all" ? "active" : ""}`;
    allBtn.setAttribute("data-category", "all");
    allBtn.innerHTML = `
        <i class="fa-solid fa-utensils"></i>
        <span>${translations[lang].catAll}</span>
    `;
    allBtn.addEventListener("click", handleCategorySelect);
    list.appendChild(allBtn);

    categories.forEach((cat) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `filter-category-btn ${currentCategory === cat.id ? "active" : ""}`;
        btn.setAttribute("data-category", cat.id);
        btn.innerHTML = `
            ${getCategoryIconHtml(cat.id)}
            <span>${escapeHtml(getCategoryDisplayName(cat, lang))}</span>
        `;
        btn.addEventListener("click", handleCategorySelect);
        list.appendChild(btn);
    });

    updateFilterButtonState();
}

function updateFilterButtonState() {
    if (!filterToggle) return;
    const hasFilter = currentCategory !== "all";
    filterToggle.classList.toggle("has-filter", hasFilter);
    filterToggle.setAttribute("aria-pressed", hasFilter ? "true" : "false");
}

function selectCategory(category) {
    currentCategory = category;
    updateCategoryTitleText();
    renderMenuItems();
    renderFilterModal();

    const menuMain = document.querySelector(".menu-main");
    if (!menuMain) return;

    const offset = 100;
    const elementPosition = menuMain.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth"
    });
}

function openFilterModal() {
    cacheFilterDom();
    if (!filterModal) return;

    renderFilterModal();
    requestAnimationFrame(() => {
        filterModal.classList.add("active");
        const panel = filterModal.querySelector(".filter-modal-panel") || filterModal;
        filterFocusTrap = createFocusTrap(panel);
    });
    filterToggle?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
}

function closeFilterModal() {
    if (!filterModal) return;
    filterModal.classList.remove("active");
    filterToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (filterFocusTrap) {
        filterFocusTrap.release();
        filterFocusTrap = null;
    }
}

function handleCategorySelect(e) {
    const btn = e.currentTarget;
    const category = btn.getAttribute("data-category");
    triggerButtonPressEffect(btn);
    selectCategory(category);
    closeFilterModal();
}

// ==========================================================================
// 9. Menu UI Grid Renderer
// ==========================================================================
function renderMenuItems() {
    if (!menuGrid) return;
    menuGrid.innerHTML = "";
    
    const lang = currentLanguage;
    const currencySymbol = localizedText(restaurantConfig.currency) || translations[lang].currency;
    
    // Filter Items by category and query
    const filteredItems = menuItemsList.filter(item => {
        // Category check
        const matchesCategory = currentCategory === "all" || item.categoryId === currentCategory;
        
        // Search query check
        const searchLower = searchQuery.toLowerCase().trim();
        if (!searchLower) return matchesCategory;

        const nameText = localizedText(item?.name).toLowerCase();
        const descText = localizedText(item?.description).toLowerCase();
        const nameAR = String(item?.name?.ar || "");
        const descAR = String(item?.description?.ar || "");
        
        const matchesSearch = nameText.includes(searchLower) ||
                              nameAR.includes(searchQuery.trim()) ||
                              descText.includes(searchLower) ||
                              descAR.includes(searchQuery.trim());
                              
        return matchesCategory && matchesSearch;
    });

    // Toggle Empty State
    if (filteredItems.length === 0) {
        emptyState.classList.remove("hidden");
        menuGrid.classList.add("hidden");
        itemsCountDisplay.textContent = "0";
    } else {
        emptyState.classList.add("hidden");
        menuGrid.classList.remove("hidden");
        itemsCountDisplay.textContent = filteredItems.length;
    }

    // Build Cards
    filteredItems.forEach((item, index) => {
        const card = document.createElement("div");
        
        // Manage stock status class
        const isOutOfStock = item.isAvailable === false;
        card.className = `menu-card animate-slide-up ${isOutOfStock ? 'out-of-stock' : ''}`;
        // Cap the stagger so long menus don't leave late cards invisible for seconds
        card.style.animationDelay = `${Math.min(index * 0.05, 0.4)}s`;
        
        // Tags rendering
        let tagsHtml = "";
        if (item.tags && item.tags[lang]) {
            item.tags[lang].forEach(tag => {
                if (tag.trim() !== "") {
                    tagsHtml += `<span class="tag-badge">${escapeHtml(tag)}</span>`;
                }
            });
        }

        // Out of stock badge
        const stockBadge = isOutOfStock ? 
            `<span class="out-of-stock-badge">${translations[lang].outOfStock}</span>` : "";

        // Add to Cart disables if out of stock
        const actionDisabled = isOutOfStock ? "disabled" : "";

        const safeImg = escapeHtml(dishImageUrl(item, 800));
        const safeName = escapeHtml(localizedText(item.name));
        const safeDesc = escapeHtml(localizedText(item.description));
        const safeId = escapeHtml(item.id);
        card.innerHTML = `
            <div class="card-img-container">
                <img src="${safeImg}" alt="${safeName}" class="menu-card-img skeleton" loading="lazy" decoding="async" onload="this.classList.remove('skeleton')" onerror="this.onerror=null;this.src='${FALLBACK_DISH_IMAGE}';this.classList.remove('skeleton')">
                <span class="card-price-badge">${Number(item.price).toFixed(2)} ${currencySymbol}</span>
                ${stockBadge}
            </div>
            <div class="card-info">
                <div class="card-title-row">
                    <h3 class="card-title">${safeName}</h3>
                </div>
                <p class="card-description">${safeDesc}</p>
                <div class="card-tags-row">${tagsHtml}</div>
                <div class="card-actions">
                    <button type="button" class="btn btn-primary" data-action="order" data-item-id="${safeId}" ${actionDisabled}>
                        <i class="fa-solid fa-utensils" aria-hidden="true"></i>
                        <span>${translations[lang].orderNow}</span>
                    </button>
                    <button type="button" class="btn btn-secondary" data-action="add" data-item-id="${safeId}" ${actionDisabled}>
                        <i class="fa-solid fa-plus" aria-hidden="true"></i>
                        <span>${translations[lang].addToOrder}</span>
                    </button>
                </div>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// ==========================================================================
// 10. Search Input Management
// ==========================================================================
// Debounced grid re-render so fast typing doesn't rebuild the DOM per keystroke.
const debouncedRenderMenuItems = debounce(renderMenuItems, 180);

function handleSearch(e) {
    searchQuery = e.target.value;
    if (searchQuery.length > 0) {
        searchClear.classList.add("show");
    } else {
        searchClear.classList.remove("show");
    }
    debouncedRenderMenuItems();
}

function clearSearch() {
    searchInput.value = "";
    searchQuery = "";
    searchClear.classList.remove("show");
    renderMenuItems();
    searchInput.focus();
}

// ==========================================================================
// 11. Shopping Cart Drawer Manager
// ==========================================================================
window.addToCart = function(itemId, buttonEl) {
    const item = menuItemsList.find(i => i.id === itemId);
    if (!item || item.isAvailable === false) return;

    triggerButtonPressEffect(buttonEl);
    
    // Check item existence
    const cartItem = cart.find(i => i.id === itemId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            quantity: 1
        });
    }
    
    saveCartToStorage();
    renderCart();
    
    // Bounce badges
    animateBadge(cartCountBadge);
    animateBadge(floatingCartBadge);

    // Toast
    showToast(translations[currentLanguage].itemAdded);
};

function animateBadge(badge) {
    badge.style.transform = "scale(1.4)";
    setTimeout(() => {
        badge.style.transform = "scale(1)";
    }, 200);
}

function triggerButtonPressEffect(button) {
    if (!button) return;
    button.classList.remove("button-press");
    void button.offsetWidth;
    button.classList.add("button-press");
    setTimeout(() => button.classList.remove("button-press"), 200);
}

// Toast
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = message;
    
    Object.assign(toast.style, {
        position: "fixed",
        bottom: "100px",
        left: "50%",
        transform: "translateX(-50%) translateY(20px)",
        backgroundColor: "rgba(212, 175, 55, 0.95)",
        color: "#0A0A0A",
        padding: "12px 24px",
        borderRadius: "30px",
        fontWeight: "700",
        fontSize: "0.9rem",
        zIndex: "999",
        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
        opacity: "0",
        transition: "all var(--transition-normal)",
        pointerEvents: "none"
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
    }, 50);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(-20px)";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}

window.changeQuantity = function(itemId, amount) {
    const cartItem = cart.find(i => i.id === itemId);
    if (!cartItem) return;
    
    cartItem.quantity += amount;
    
    if (cartItem.quantity <= 0) {
        removeFromCart(itemId);
    } else {
        saveCartToStorage();
        renderCart();
    }
};

window.removeFromCart = function(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    saveCartToStorage();
    renderCart();
};

function pruneCartAgainstMenu() {
    if (!Array.isArray(cart) || cart.length === 0) return;
    const before = cart.length;
    const availableIds = new Set(
        menuItemsList
            .filter((item) => item && item.id && item.isAvailable !== false)
            .map((item) => item.id)
    );
    cart = cart.filter((entry) => availableIds.has(entry.id));
    if (cart.length !== before) {
        saveCartToStorage();
        showToast(translations[currentLanguage].cartPruned);
    }
}

function getOrderableCartItems() {
    const lines = [];
    let total = 0;
    if (!Array.isArray(cart)) return { lines, total };
    cart.forEach((cartItem) => {
        const item = menuItemsList.find((entry) => entry.id === cartItem.id);
        if (!item || item.isAvailable === false) return;
        const quantity = Math.min(99, Math.max(1, Math.floor(Number(cartItem.quantity) || 0)));
        if (!quantity) return;
        const price = Number(item.price) || 0;
        total += price * quantity;
        lines.push({
            id: String(item.id).slice(0, 80),
            name: String(localizedText(item.name) || item.id).slice(0, 120),
            price,
            quantity
        });
    });
    return { lines, total };
}

function updateCheckoutButtonState() {
    const footer = document.querySelector(".cart-footer");
    const { lines } = getOrderableCartItems();
    const canSubmit = lines.length > 0 && isFirebaseReady && Boolean(db);
    if (whatsappCheckoutBtn && !isSubmittingOrder) {
        whatsappCheckoutBtn.disabled = !canSubmit;
    }
    footer?.classList.toggle("is-empty", cart.length === 0);
}

function renderCart() {
    const lang = currentLanguage;
    const currencySymbol = localizedText(restaurantConfig.currency) || translations[lang].currency;
    
    if (cart.length === 0) {
        cartItemsContainer.classList.add("hidden");
        cartEmptyState.classList.remove("hidden");
        cartTotalValue.textContent = `0.00 ${currencySymbol}`;
        cartCountBadge.textContent = "0";
        floatingCartBadge.textContent = "0";
        floatingCartBadge.classList.add("hidden");
        updateCheckoutButtonState();
        return;
    }

    cartItemsContainer.classList.remove("hidden");
    cartEmptyState.classList.add("hidden");
    cartItemsContainer.innerHTML = "";

    let total = 0;
    let totalItemsCount = 0;

    cart.forEach(cartItem => {
        const item = menuItemsList.find(i => i.id === cartItem.id);
        if (!item) return;

        const itemTotal = (Number(item.price) || 0) * cartItem.quantity;
        total += itemTotal;
        totalItemsCount += cartItem.quantity;

        const cartItemEl = document.createElement("div");
        cartItemEl.className = "cart-item";

        const safeCartImg = escapeHtml(dishImageUrl(item, 200));
        const safeCartName = escapeHtml(localizedText(item.name));
        const safeCartId = escapeHtml(item.id);
        cartItemEl.innerHTML = `
            <img src="${safeCartImg}" alt="${safeCartName}" class="cart-item-img" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_DISH_IMAGE}'">
            <div class="cart-item-info">
                <div>
                    <h4 class="cart-item-title">${safeCartName}</h4>
                    <span class="cart-item-price">${Number(item.price).toFixed(2)} ${currencySymbol}</span>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controller">
                        <button class="btn-qty" data-action="qty-dec" data-item-id="${safeCartId}" aria-label="${translations[lang].qtyDecrease}">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <span class="qty-val">${cartItem.quantity}</span>
                        <button class="btn-qty" data-action="qty-inc" data-item-id="${safeCartId}" aria-label="${translations[lang].qtyIncrease}">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn-cart-remove" data-action="remove" data-item-id="${safeCartId}" aria-label="${translations[lang].removeItem}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    cartTotalValue.textContent = `${total.toFixed(2)} ${currencySymbol}`;
    cartCountBadge.textContent = totalItemsCount;
    floatingCartBadge.textContent = totalItemsCount;
    floatingCartBadge.classList.remove("hidden");
    updateCheckoutButtonState();
}

// Storage helpers
function saveCartToStorage() {
    localStorage.setItem(`tasteMenuCart_${activeRestaurantId}`, JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem(`tasteMenuCart_${activeRestaurantId}`);
    if (savedCart) {
        try {
            const parsed = JSON.parse(savedCart);
            cart = Array.isArray(parsed)
                ? parsed
                    .filter((entry) => entry && typeof entry.id === "string" && Number(entry.quantity) > 0)
                    .map((entry) => ({
                        id: entry.id,
                        quantity: Math.min(99, Math.max(1, Math.floor(Number(entry.quantity))))
                    }))
                : [];
            renderCart();
        } catch (e) {
            cart = [];
        }
    }
}

// ==========================================================================
// 12. Quick Direct Single-Item Order
// ==========================================================================

// Checkout entire cart
// Brief "added ✓" confirmation on the card button + badge pop
function flashAddedFeedback(btn) {
    if (btn.dataset.flashing === "1") return;
    btn.dataset.flashing = "1";
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>أُضيفت لطلبك</span>';
    btn.classList.add("added-feedback");

    [document.getElementById("cart-count"), document.getElementById("floating-cart-badge")].forEach((badge) => {
        if (!badge) return;
        badge.classList.remove("badge-pop");
        void badge.offsetWidth; // restart animation
        badge.classList.add("badge-pop");
    });

    setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove("added-feedback");
        delete btn.dataset.flashing;
    }, 1300);
}

// ==========================================================================
// 12a. Cart drawer open/close (module scope so card buttons can open it)
// ==========================================================================
let cartFocusTrap = null;

function openCartDrawer() {
    resetCartSuccessView();
    cartDrawer.classList.add("active");
    cartToggle?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    const cartContent = cartDrawer.querySelector(".cart-content") || cartDrawer;
    cartFocusTrap = createFocusTrap(cartContent);
}

function closeCartDrawer() {
    cartDrawer.classList.remove("active");
    cartToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (cartFocusTrap) {
        cartFocusTrap.release();
        cartFocusTrap = null;
    }
    resetCartSuccessView();
    renderCart();
}

// ==========================================================================
// 12b. In-app order submission (orders land in the admin dashboard)
// ==========================================================================
function showOrderFieldError(message) {
    const hint = document.getElementById("order-form-error");
    if (!hint) return;
    hint.textContent = message;
    hint.classList.remove("hidden");
}

function hideOrderFieldError() {
    document.getElementById("order-form-error")?.classList.add("hidden");
}

function resetCartSuccessView() {
    document.getElementById("order-success")?.classList.add("hidden");
    document.querySelector(".cart-footer")?.classList.remove("hidden");
    if (cart.length > 0) {
        cartItemsContainer?.classList.remove("hidden");
    }
}

async function submitOrder() {
    if (isSubmittingOrder) return;

    const nameInput = document.getElementById("order-name");
    const phoneInput = document.getElementById("order-phone");
    const noteInput = document.getElementById("order-note");
    const submitBtn = document.getElementById("whatsapp-checkout");

    pruneCartAgainstMenu();
    renderCart();

    if (!isFirebaseReady || !db) {
        showOrderFieldError(translations[currentLanguage].orderOffline);
        return;
    }

    const { lines, total } = getOrderableCartItems();
    if (!lines.length) {
        showOrderFieldError(translations[currentLanguage].emptyCheckout);
        return;
    }

    const customerName = (nameInput?.value || "").trim();
    const customerPhone = (phoneInput?.value || "").trim();
    const note = (noteInput?.value || "").trim();

    if (!customerName) {
        showOrderFieldError("يرجى كتابة الاسم لإتمام الطلب.");
        nameInput?.focus();
        return;
    }
    if (customerPhone.length < 8) {
        showOrderFieldError("يرجى كتابة رقم هاتف صحيح للتواصل.");
        phoneInput?.focus();
        return;
    }
    hideOrderFieldError();

    isSubmittingOrder = true;
    submitBtn?.classList.add("is-loading");
    if (submitBtn) submitBtn.disabled = true;

    try {
        await addDoc(collection(db, "restaurants", activeRestaurantId, "orders"), {
            items: lines,
            total: Number(total.toFixed(2)),
            customerName: customerName.slice(0, 80),
            customerPhone: customerPhone.slice(0, 30),
            note: note.slice(0, 300),
            status: "new",
            createdAt: serverTimestamp()
        });

        lines.forEach((line) => triggerItemOrderClickTracker(line.id));
        triggerWhatsAppClicksTracker();

        // Success view
        cart = [];
        saveCartToStorage();
        renderCart();
        if (nameInput) nameInput.value = "";
        if (phoneInput) phoneInput.value = "";
        if (noteInput) noteInput.value = "";
        cartItemsContainer?.classList.add("hidden");
        document.getElementById("cart-empty-state")?.classList.add("hidden");
        document.querySelector(".cart-footer")?.classList.add("hidden");
        document.getElementById("order-success")?.classList.remove("hidden");
    } catch (error) {
        console.error("Order submission failed:", error);
        showOrderFieldError(getPublicOrderErrorMessage(error));
    } finally {
        isSubmittingOrder = false;
        submitBtn?.classList.remove("is-loading");
        updateCheckoutButtonState();
    }
}

// ==========================================================================
// 13. Event Listeners Setup
// ==========================================================================
function setupEventListeners() {
    cacheFilterDom();

    themeToggle?.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        toggleTheme();
    });

    filterToggle?.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        if (filterModal?.classList.contains("active")) {
            closeFilterModal();
        } else {
            openFilterModal();
        }
    });

    filterModalClose?.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        closeFilterModal();
    });

    filterModalOverlay?.addEventListener("click", closeFilterModal);

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (filterModal?.classList.contains("active")) {
            closeFilterModal();
        } else if (cartDrawer.classList.contains("active")) {
            closeCartDrawer();
        }
    });

    searchInput.addEventListener("input", handleSearch);
    searchClear.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        clearSearch();
    });

    // Delegated menu-card actions (replaces inline onclick => no attribute
    // injection from Firestore-sourced item ids, and one listener instead of N).
    menuGrid?.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-action]");
        if (!btn || !menuGrid.contains(btn)) return;
        const id = btn.getAttribute("data-item-id");
        if (!id) return;
        if (btn.dataset.action === "order") {
            // "اطلب الآن": add to the order and jump straight to checkout
            window.addToCart(id, btn);
            openCartDrawer();
        } else if (btn.dataset.action === "add") {
            window.addToCart(id, btn);
            flashAddedFeedback(btn);
        }
    });

    // Delegated cart-item actions.
    cartItemsContainer?.addEventListener("click", (event) => {
        const btn = event.target.closest("[data-action]");
        if (!btn || !cartItemsContainer.contains(btn)) return;
        const id = btn.getAttribute("data-item-id");
        if (!id) return;
        if (btn.dataset.action === "qty-dec") window.changeQuantity(id, -1);
        else if (btn.dataset.action === "qty-inc") window.changeQuantity(id, 1);
        else if (btn.dataset.action === "remove") window.removeFromCart(id);
    });

    cartToggle.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        openCartDrawer();
    });
    cartClose.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        closeCartDrawer();
    });
    document.querySelector(".cart-overlay").addEventListener("click", closeCartDrawer);

    // Floating order button — always opens the cart drawer
    floatingWhatsappBtn.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        openCartDrawer();
    });

    whatsappCheckoutBtn.addEventListener("click", (event) => {
        triggerButtonPressEffect(event.currentTarget);
        submitOrder();
    });

    updateCheckoutButtonState();
}
