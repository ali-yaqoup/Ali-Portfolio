import { auth, db, isFirebaseReady } from './firebase-config.js?v=4';
import { getAuthErrorMessage, getFirestoreErrorMessage, formatAppError } from './firebase-errors.js';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const UI_PREFS_KEY = 'taste-admin-ui-prefs';
const LOCAL_STATE_KEY = 'taste-admin-menu-snapshot';
const CLOUDINARY_CLOUD_NAME = window.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = window.CLOUDINARY_UPLOAD_PRESET || '';
const DEFAULT_LOGO = 'assets/logo-seal.jpg';
const DEFAULT_RESTAURANT_ID = 'taste';
const DEFAULT_RESTAURANT = {
  name: { en: 'Taste Restaurant', ar: 'مطعم تيست' },
  slogan: { en: 'Fresh & Delicious Every Day', ar: 'طازج ولذيذ كل يوم' },
  whatsappNumber: '+970599123456',
  email: 'info@tasterestaurant.com',
  workingHours: { en: 'Saturday - Friday (12:00 PM - 12:00 AM)', ar: 'السبت - الجمعة (12:00 ظهراً - 12:00 ليلاً)' },
  currency: { en: 'JD', ar: 'دينار' },
  address: { en: 'Ramallah, Palestine', ar: 'رام الله، فلسطين' },
  logoUrl: DEFAULT_LOGO,
  colors: { bg: '#0A0A0A', surface: '#121212', gold: '#D4AF37' },
  subscription: { status: 'trial' },
  analytics: { views: 0, whatsappOrders: 0 },
  customDomain: '',
  accessControl: { role: 'super_admin' },
  darkMode: true
};

const DEFAULT_CATEGORIES = [
  { id: 'burgers', name: { en: 'Burgers', ar: 'البرغر' }, orderIndex: 0 },
  { id: 'pizza', name: { en: 'Pizza', ar: 'البيتزا' }, orderIndex: 1 },
  { id: 'drinks', name: { en: 'Drinks', ar: 'المشروبات' }, orderIndex: 2 },
  { id: 'desserts', name: { en: 'Desserts', ar: 'الحلويات' }, orderIndex: 3 }
];

const DEFAULT_ITEMS = [
  {
    id: 'truffle-burger',
    categoryId: 'burgers',
    price: 8,
    imageUrl: 'assets/truffle_burger.png',
    name: { en: 'Truffle Burger', ar: 'برغر الترفل' },
    description: { en: 'Premium beef with truffle aioli.', ar: 'لحم فاخر وصلصة ترافل.' },
    tags: { en: ['Premium', 'Chef Special'], ar: ['فاخر', 'مميز'] },
    isAvailable: true,
    orderIndex: 0,
    views: 12,
    orderClicks: 5
  },
  {
    id: 'cheese-burger',
    categoryId: 'burgers',
    price: 7,
    imageUrl: 'assets/cheese_burger.png',
    name: { en: 'Cheese Burger', ar: 'برغر الجبن' },
    description: { en: 'Classic smash burger with cheddar.', ar: 'برغر كلاسيكي بالجبنة.' },
    tags: { en: ['Classic'], ar: ['كلاسيكي'] },
    isAvailable: true,
    orderIndex: 1,
    views: 8,
    orderClicks: 3
  },
  {
    id: 'margherita-pizza',
    categoryId: 'pizza',
    price: 9,
    imageUrl: 'assets/margherita_pizza.png',
    name: { en: 'Margherita Pizza', ar: 'بيتزا مارغريتا' },
    description: { en: 'Tomato, mozzarella, basil.', ar: 'طماطم وموزاريلا وريحان.' },
    tags: { en: ['Vegetarian'], ar: ['نباتي'] },
    isAvailable: true,
    orderIndex: 2,
    views: 15,
    orderClicks: 6
  }
];

const state = {
  restaurantId: DEFAULT_RESTAURANT_ID,
  restaurantConfig: structuredClone(DEFAULT_RESTAURANT),
  categories: structuredClone(DEFAULT_CATEGORIES),
  menuItems: structuredClone(DEFAULT_ITEMS),
  currentRole: null,
  currentUser: null,
  darkMode: true,
  logoCropper: null,
  logoObjectUrl: '',
  isLogoUploading: false,
  cloudinaryReady: false,
  confirmCallback: null,
  dragId: null,
  currentItemId: null,
  currentCategoryId: null,
  orders: [],
  knownOrderIds: null,
  firestoreUnsubscribers: []
};

const elements = {
  loader: document.getElementById('admin-loader'),
  loginContainer: document.getElementById('login-container'),
  dashboardContainer: document.getElementById('dashboard-container'),
  loginForm: document.getElementById('login-form'),
  loginError: document.getElementById('login-error'),
  logoutBtn: document.getElementById('logout-btn'),
  userEmailDisplay: document.getElementById('user-email-display'),
  adminUserRole: document.getElementById('admin-user-role'),
  sidebarBrandName: document.getElementById('sidebar-brand-name'),
  sidebarLogo: document.getElementById('sidebar-logo'),
  navItems: Array.from(document.querySelectorAll('.nav-item')),
  tabs: Array.from(document.querySelectorAll('.tab-content')),
  sidebar: document.getElementById('admin-sidebar'),
  sidebarToggle: document.getElementById('sidebar-toggle'),
  sidebarClose: document.getElementById('sidebar-close'),
  settingsForm: document.getElementById('settings-form'),
  itemForm: document.getElementById('item-form'),
  categoryForm: document.getElementById('category-form'),
  itemsTableBody: document.getElementById('items-table-body'),
  categoriesTableBody: document.getElementById('categories-table-body'),
  popularItemsList: document.getElementById('popular-items-list'),
  statViews: document.getElementById('stat-total-views'),
  statOrders: document.getElementById('stat-total-orders'),
  statActiveItems: document.getElementById('stat-active-items'),
  statSubscription: document.getElementById('stat-subscription-status'),
  adminQrImg: document.getElementById('admin-qr-img'),
  viewLiveMenuBtn: document.getElementById('view-live-menu-btn'),
  settingsLogoPreview: document.getElementById('settings-logo-preview'),
  settingsLogoUrl: document.getElementById('settings-logo-url'),
  logoFile: document.getElementById('logoFile'),
  logoPreview: document.getElementById('logoPreview'),
  cropContainer: document.getElementById('cropContainer'),
  cropImage: document.getElementById('cropImage'),
  cropConfirm: document.getElementById('cropConfirm'),
  logoUploadStatus: document.getElementById('logoUploadStatus'),
  itemImgPreview: document.getElementById('item-img-preview'),
  imageUrl: document.getElementById('imageUrl'),
  itemModalTitle: document.getElementById('item-modal-title'),
  categoryModalTitle: document.getElementById('category-modal-title'),
  itemEditId: document.getElementById('item-edit-id'),
  categoryEditId: document.getElementById('category-edit-id'),
  categoryOrderIndex: document.getElementById('category-order-index'),
  itemCategorySelect: document.getElementById('item-category'),
  itemsCategoryFilter: document.getElementById('items-category-filter'),
  itemAvailable: document.getElementById('item-available'),
  confirmModal: document.getElementById('modal-confirm'),
  ordersList: document.getElementById('orders-list'),
  ordersBadge: document.getElementById('orders-badge'),
  ordersFilter: document.getElementById('orders-status-filter'),
  confirmTitle: document.getElementById('confirm-title'),
  confirmMessage: document.getElementById('confirm-message'),
  confirmActionBtn: document.getElementById('confirm-action-btn'),
  confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
  btnExportJson: document.getElementById('btn-export-json'),
  importJsonInput: document.getElementById('import-json-input'),
  btnBackup: document.getElementById('btn-db-backup'),
  settingsNameEn: document.getElementById('settings-name-en'),
  settingsNameAr: document.getElementById('settings-name-ar'),
  settingsSloganEn: document.getElementById('settings-slogan-en'),
  settingsSloganAr: document.getElementById('settings-slogan-ar'),
  settingsWhatsapp: document.getElementById('settings-whatsapp'),
  itemNameEn: document.getElementById('item-name-en'),
  itemNameAr: document.getElementById('item-name-ar'),
  itemDescEn: document.getElementById('item-desc-en'),
  itemDescAr: document.getElementById('item-desc-ar'),
  itemPrice: document.getElementById('item-price'),
  itemTagsEn: document.getElementById('item-tags-en'),
  itemTagsAr: document.getElementById('item-tags-ar'),
  categoryIdVal: document.getElementById('category-id-val'),
  categoryNameEn: document.getElementById('category-name-en'),
  categoryNameAr: document.getElementById('category-name-ar'),
  settingsEmail: document.getElementById('settings-email'),
  settingsHoursEn: document.getElementById('settings-hours-en'),
  settingsHoursAr: document.getElementById('settings-hours-ar'),
  settingsCurrencyEn: document.getElementById('settings-currency-en'),
  settingsCurrencyAr: document.getElementById('settings-currency-ar'),
  settingsAddressEn: document.getElementById('settings-address-en'),
  settingsAddressAr: document.getElementById('settings-address-ar'),
  settingsColorBg: document.getElementById('settings-color-bg'),
  settingsColorSurface: document.getElementById('settings-color-surface'),
  settingsColorGold: document.getElementById('settings-color-gold'),
  settingsSubscriptionStatus: document.getElementById('settings-subscription-status'),
  settingsPortalRole: document.getElementById('settings-portal-role'),
  settingsCustomDomain: document.getElementById('settings-custom-domain'),
  settingsDarkMode: document.getElementById('settings-dark-mode'),
  downloadQrBtn: document.getElementById('download-qr-btn'),
  btnImportJson: document.getElementById('btn-import-json')
};

function isSuperAdmin() {
  return state.currentRole === 'super_admin';
}

function canManageRestaurant() {
  return ['super_admin', 'restaurant_admin', 'admin'].includes(state.currentRole);
}

function canEditMenu() {
  return canManageRestaurant() || state.currentRole === 'staff_editor';
}

function restaurantConfigForWrite() {
  const {
    analytics: _analytics,
    subscription,
    accessControl,
    ...rest
  } = state.restaurantConfig || {};
  const payload = { ...rest };
  if (isSuperAdmin()) {
    if (subscription) payload.subscription = subscription;
    if (accessControl) payload.accessControl = accessControl;
  }
  return payload;
}

function menuItemForWrite(item, index) {
  const { views: _views, orderClicks: _orderClicks, ...rest } = item || {};
  return { ...rest, orderIndex: index };
}

function init() {
  bindEvents();
  loadUiPreferences();
  applyTheme();

  if (!isFirebaseReady) {
    showLogin();
    showLoginError('لم يتم ضبط Firebase. تحقق من ملف firebase-config.js.');
    return;
  }

  onAuthStateChanged(auth, handleAuthStateChange);
}

async function handleAuthStateChange(user) {
  if (!user) {
    state.currentUser = null;
    state.currentRole = null;
    teardownFirestoreListeners();
    showLogin();
    return;
  }

  elements.loader.classList.remove('hidden');
  try {
    await loadUserProfile(user);
    state.currentUser = user;
    showDashboard(user);
    syncFromFirestore();
  } catch (error) {
    console.error('Auth profile load failed:', error);
    showLogin();
    showLoginError(formatAppError(error));
    try {
      await signOut(auth);
    } catch (signOutError) {
      console.error('Sign out after profile failure:', signOutError);
    }
  }
}

async function loadUserProfile(user) {
  const userRef = doc(db, 'users', user.uid);
  let snapshot;

  try {
    snapshot = await getDoc(userRef);
  } catch (error) {
    if (error.code === 'permission-denied') {
      throw Object.assign(new Error(formatAppError(error)), { code: error.code });
    }
    throw error;
  }

  if (!snapshot.exists()) {
    throw new Error(
      'ملف الأدمن غير موجود. من Firebase Console → Firestore أنشئ مستند:\n' +
      `users/${user.uid}\n` +
      'بالحقول: { "email": "' + (user.email || '') + '", "role": "restaurant_admin", "restaurantId": "taste" }'
    );
  }

  const profile = snapshot.data();
  const role = profile.role;
  const restaurantId = profile.restaurantId;

  if (!role) {
    throw new Error('ملفك الشخصي لا يحتوي حقل role.');
  }

  if (!restaurantId) {
    throw new Error('ملفك الشخصي لا يحتوي حقل restaurantId.');
  }

  state.currentRole = role;
  state.restaurantId = restaurantId;
  return profile;
}

function teardownFirestoreListeners() {
  state.firestoreUnsubscribers.forEach((unsubscribe) => {
    try {
      unsubscribe();
    } catch (error) {
      console.warn('Listener teardown error:', error);
    }
  });
  state.firestoreUnsubscribers = [];
}

function bindEvents() {
  elements.loginForm.addEventListener('submit', handleLogin);
  document.getElementById('forgot-password-link')?.addEventListener('click', handleForgotPassword);
  elements.logoutBtn.addEventListener('click', handleLogout);
  elements.settingsForm.addEventListener('submit', handleSettingsSave);
  elements.itemForm.addEventListener('submit', handleItemSave);
  elements.categoryForm.addEventListener('submit', handleCategorySave);
  elements.settingsLogoUrl.addEventListener('input', updateLogoPreview);
  elements.logoFile?.addEventListener('change', handleLogoFileChange);
  elements.cropConfirm?.addEventListener('click', handleLogoCropConfirm);
  elements.imageUrl.addEventListener('input', updateItemImagePreview);
  elements.btnExportJson.addEventListener('click', exportMenuJson);
  elements.importJsonInput.addEventListener('change', importMenuJson);
  elements.btnBackup.addEventListener('click', createLiveBackup);
  elements.confirmCancelBtn.addEventListener('click', closeConfirmModal);
  elements.ordersFilter?.addEventListener('change', renderOrders);
  document.getElementById('reset-analytics-btn')?.addEventListener('click', handleResetAnalytics);
  document.getElementById('download-qr-btn')?.addEventListener('click', downloadQrCode);

  // Close any open modal with Escape, or by clicking its dark overlay
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (elements.confirmModal?.classList.contains('active')) { closeConfirmModal(); return; }
    if (document.getElementById('modal-item')?.classList.contains('active')) { closeItemModal(); return; }
    if (document.getElementById('modal-category')?.classList.contains('active')) { closeCategoryModal(); }
  });
  [
    [document.getElementById('modal-item'), closeItemModal],
    [document.getElementById('modal-category'), closeCategoryModal],
    [elements.confirmModal, closeConfirmModal]
  ].forEach(([overlay, close]) => {
    overlay?.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
  });
  elements.confirmActionBtn.addEventListener('click', runConfirmAction);
  elements.sidebarToggle.addEventListener('click', toggleSidebar);
  elements.sidebarClose.addEventListener('click', toggleSidebar);
  elements.navItems.forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
  elements.itemsCategoryFilter.addEventListener('change', renderTables);
  elements.settingsDarkMode?.addEventListener('change', (event) => {
    state.darkMode = event.target.checked;
    applyTheme();
    persistUiPreferences();
  });

  document.querySelectorAll('[data-action="delete-category"]').forEach((button) => button.addEventListener('click', () => {}));
  window.openAddCategoryModal = openAddCategoryModal;
  window.closeCategoryModal = closeCategoryModal;
  window.openAddItemModal = openAddItemModal;
  window.closeItemModal = closeItemModal;
  window.deleteCategory = deleteCategory;
  window.deleteItem = deleteItem;
  window.toggleItemAvailability = toggleItemAvailability;
  window.duplicateItem = duplicateItem;
  window.editItem = editItem;
  window.editCategory = editCategory;

  const toolbar = document.createElement('button');
  toolbar.id = 'theme-toggle-btn';
  toolbar.className = 'theme-toggle-btn';
  toolbar.innerHTML = '<i class="fa-solid fa-moon"></i><span>تبديل الوضع</span>';
  toolbar.addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    if (elements.settingsDarkMode) elements.settingsDarkMode.checked = state.darkMode;
    applyTheme();
    persistUiPreferences();
  });
  const footer = document.querySelector('.sidebar-footer');
  footer?.prepend(toolbar);
}

function loadUiPreferences() {
  try {
    const saved = localStorage.getItem(UI_PREFS_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    state.darkMode = parsed.darkMode ?? true;
  } catch (error) {
    console.warn('Could not restore UI preferences', error);
  }
}

function persistUiPreferences() {
  localStorage.setItem(UI_PREFS_KEY, JSON.stringify({ darkMode: state.darkMode }));
}

// Persist a local snapshot of the working menu so in-progress edits (reorder,
// duplicate) survive a reload even before the Firestore write settles.
// Previously this function was referenced but never defined, which threw a
// ReferenceError and silently broke duplicate + drag-and-drop reordering.
function persistState() {
  try {
    localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify({
      restaurantId: state.restaurantId,
      restaurantConfig: state.restaurantConfig,
      categories: state.categories,
      menuItems: state.menuItems,
      savedAt: Date.now()
    }));
  } catch (error) {
    console.warn('Could not persist local menu snapshot', error);
  }
}

function showLoginError(message) {
  elements.loginError.textContent = message;
  elements.loginError.classList.remove('hidden', 'success');
}

function hideLoginError() {
  elements.loginError.textContent = '';
  elements.loginError.classList.add('hidden');
  elements.loginError.classList.remove('success');
}

// Success-styled notice in the same login message slot (e.g. reset email sent)
function showLoginNotice(message) {
  elements.loginError.textContent = message;
  elements.loginError.classList.remove('hidden');
  elements.loginError.classList.add('success');
}

// Non-blocking toast notification (replaces blocking alert()).
// type: 'success' | 'error' | 'warning' | 'info'
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.innerHTML =
    `<i class="fa-solid ${icons[type] || icons.info}" aria-hidden="true"></i>` +
    `<span class="toast-msg"></span>` +
    `<button type="button" class="toast-close" aria-label="Dismiss"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>`;
  // textContent keeps DB/error strings inert (no HTML injection)
  toast.querySelector('.toast-msg').textContent = message;

  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', remove);
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(remove, type === 'error' ? 6000 : 3500);
}

function setLoginLoading(isLoading) {
  const submitBtn = elements.loginForm.querySelector('button[type="submit"]');
  if (!submitBtn) return;
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle('is-loading', isLoading);
}

function showLogin() {
  elements.loginContainer.classList.remove('hidden');
  elements.dashboardContainer.classList.add('hidden');
  elements.loader.classList.add('hidden');
}

function showDashboard(user) {
  elements.loginContainer.classList.add('hidden');
  elements.dashboardContainer.classList.remove('hidden');
  elements.loader.classList.add('hidden');
  hideLoginError();

  elements.userEmailDisplay.textContent = user.email || '';
  const roleLabel =
    state.currentRole === 'super_admin'
      ? 'مدير عام'
      : state.currentRole === 'restaurant_admin' || state.currentRole === 'admin'
        ? 'مدير المطعم'
        : 'محرر محتوى';
  elements.adminUserRole.textContent = roleLabel;

  populateSettingsForm();
  renderCategoryOptions();
  renderTables();
  renderOverview();
  renderQrCode();
  renderAdminBrand();
  updatePermissionAwareUi();
}

function renderAdminBrand() {
  elements.sidebarBrandName.textContent = state.restaurantConfig.name?.ar || state.restaurantConfig.name?.en || 'لوحة التحكم';
  elements.sidebarLogo.src = state.restaurantConfig.logoUrl || DEFAULT_LOGO;
  elements.sidebarLogo.onerror = () => {
    elements.sidebarLogo.onerror = null;
    elements.sidebarLogo.src = DEFAULT_LOGO;
  };
}

function updatePermissionAwareUi() {
  const canManage = canManageRestaurant();
  const canDelete = canManage;
  document.querySelectorAll('[data-deleteable]').forEach((element) => {
    element.classList.toggle('hidden', !canDelete);
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    const tab = item.dataset.tab;
    if (tab === 'tab-settings' && state.currentRole === 'staff_editor') {
      item.classList.add('hidden');
    }
  });

  if (state.currentRole === 'staff_editor') {
    document.querySelectorAll('[data-staff-lock]').forEach((element) => element.classList.add('hidden'));
  }

  if (!canManage) {
    elements.btnBackup?.classList.add('hidden');
    elements.btnExportJson?.classList.add('hidden');
    elements.btnImportJson?.classList.add('hidden');
  } else {
    elements.btnBackup?.classList.remove('hidden');
    elements.btnExportJson?.classList.remove('hidden');
    elements.btnImportJson?.classList.remove('hidden');
  }

  const lockProtected = !isSuperAdmin();
  if (elements.settingsSubscriptionStatus) {
    elements.settingsSubscriptionStatus.disabled = lockProtected;
    elements.settingsSubscriptionStatus.title = lockProtected
      ? 'حالة الاشتراك يغيّرها المدير العام فقط'
      : '';
  }
  if (elements.settingsPortalRole) {
    elements.settingsPortalRole.disabled = lockProtected;
    elements.settingsPortalRole.title = lockProtected
      ? 'صلاحية البوابة يغيّرها المدير العام فقط'
      : '';
  }
}

async function handleLogin(event) {
  event.preventDefault();

  if (!isFirebaseReady) {
    showLoginError('خدمة Firebase غير متاحة. تحقق من ملف firebase-config.js.');
    return;
  }

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  hideLoginError();
  setLoginLoading(true);

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Login failed:', error);
    showLoginError(getAuthErrorMessage(error));
  } finally {
    setLoginLoading(false);
  }
}

// Send a Firebase password-reset email to the address typed in the email field
async function handleForgotPassword() {
  if (!isFirebaseReady) {
    showLoginError('خدمة Firebase غير متاحة. تحقق من ملف firebase-config.js.');
    return;
  }

  const email = document.getElementById('login-email').value.trim();
  if (!email) {
    showLoginError('اكتب بريدك الإلكتروني في الحقل أعلاه أولاً، ثم اضغط "نسيت كلمة المرور؟".');
    document.getElementById('login-email').focus();
    return;
  }

  hideLoginError();

  try {
    await sendPasswordResetEmail(auth, email);
    showLoginNotice(`تم إرسال رابط إعادة التعيين إلى ${email}. تفقد بريدك الوارد (ومجلد السبام).`);
  } catch (error) {
    console.error('Password reset failed:', error);
    showLoginError(getAuthErrorMessage(error));
  }
}

async function handleLogout() {
  try {
    teardownFirestoreListeners();
    await signOut(auth);
  } catch (error) {
    console.error('Logout failed:', error);
    showLoginError(getAuthErrorMessage(error));
  }
}

function assertAuthenticated() {
  if (!auth?.currentUser) {
    throw new Error('يجب تسجيل الدخول لتنفيذ هذا الإجراء.');
  }
}

function switchTab(tabId) {
  elements.navItems.forEach((item) => {
    const active = item.dataset.tab === tabId;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  elements.tabs.forEach((tab) => tab.classList.toggle('active', tab.id === tabId));
}

function toggleSidebar() {
  elements.sidebar.classList.toggle('open');
}

function populateSettingsForm() {
  const config = state.restaurantConfig;
  elements.settingsNameEn.value = config.name?.en || '';
  elements.settingsNameAr.value = config.name?.ar || '';
  elements.settingsSloganEn.value = config.slogan?.en || '';
  elements.settingsSloganAr.value = config.slogan?.ar || '';
  elements.settingsWhatsapp.value = config.whatsappNumber || '';
  elements.settingsEmail.value = config.email || '';
  elements.settingsHoursEn.value = config.workingHours?.en || '';
  elements.settingsHoursAr.value = config.workingHours?.ar || '';
  elements.settingsCurrencyEn.value = config.currency?.en || '';
  elements.settingsCurrencyAr.value = config.currency?.ar || '';
  elements.settingsAddressEn.value = config.address?.en || '';
  elements.settingsAddressAr.value = config.address?.ar || '';
  elements.settingsColorBg.value = config.colors?.bg || '#0A0A0A';
  elements.settingsColorSurface.value = config.colors?.surface || '#121212';
  elements.settingsColorGold.value = config.colors?.gold || '#D4AF37';
  elements.settingsSubscriptionStatus.value = config.subscription?.status || 'trial';
  elements.settingsPortalRole.value = config.accessControl?.role || state.currentRole || 'super_admin';
  elements.settingsCustomDomain.value = config.customDomain || '';
  elements.settingsDarkMode.checked = state.darkMode;
  elements.settingsLogoUrl.value = config.logoUrl || '';
  updateLogoPreview();
  resetLogoCropper();
  updateCloudinaryConfigStatus();
}

function updateLogoPreview() {
  const url = elements.settingsLogoUrl.value.trim();
  if (url) {
    elements.settingsLogoPreview.src = url;
    elements.settingsLogoPreview.hidden = false;
    if (elements.logoPreview) {
      elements.logoPreview.src = url;
      elements.logoPreview.hidden = false;
    }
  } else {
    elements.settingsLogoPreview.removeAttribute('src');
    elements.settingsLogoPreview.hidden = true;
    if (elements.logoPreview) {
      elements.logoPreview.removeAttribute('src');
      elements.logoPreview.hidden = true;
    }
  }
}

function isDataUrl(value) {
  return /^data:/i.test(String(value || '').trim());
}

function setLogoStatus(message, type = 'info') {
  if (!elements.logoUploadStatus) return;
  elements.logoUploadStatus.textContent = message || '';
  if (type === 'error') {
    elements.logoUploadStatus.style.color = '#ff6b6b';
  } else if (type === 'success') {
    elements.logoUploadStatus.style.color = '#6fdc8c';
  } else {
    elements.logoUploadStatus.style.color = '';
  }
}

function updateCloudinaryConfigStatus() {
  state.cloudinaryReady = Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
  if (!state.cloudinaryReady) {
    setLogoStatus(
      'Cloudinary config missing: set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET. Logo upload is disabled.',
      'error'
    );
  } else if (!state.isLogoUploading) {
    setLogoStatus('Cloudinary is configured. You can upload and crop your logo.', 'info');
  }
  updateLogoUploadingUi();
}

function updateLogoUploadingUi() {
  const shouldDisableUploadActions = state.isLogoUploading || !state.cloudinaryReady;
  if (elements.logoFile) {
    elements.logoFile.disabled = shouldDisableUploadActions;
  }
  if (elements.cropConfirm) {
    elements.cropConfirm.disabled = shouldDisableUploadActions || !state.logoCropper;
  }
}

function resetLogoCropper() {
  if (state.logoCropper) {
    state.logoCropper.destroy();
    state.logoCropper = null;
  }
  if (state.logoObjectUrl) {
    URL.revokeObjectURL(state.logoObjectUrl);
    state.logoObjectUrl = '';
  }
  if (elements.cropContainer) {
    elements.cropContainer.style.display = 'none';
  }
  if (elements.cropImage) {
    elements.cropImage.removeAttribute('src');
    elements.cropImage.onload = null;
  }
  updateLogoUploadingUi();
}

function handleLogoFileChange(event) {
  if (!state.cloudinaryReady) {
    setLogoStatus('Logo upload blocked: Cloudinary is not configured.', 'error');
    event.target.value = '';
    return;
  }

  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    setLogoStatus('Please select a valid image file for the logo.', 'error');
    event.target.value = '';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    setLogoStatus('Logo file is too large. Maximum allowed size is 2MB.', 'error');
    event.target.value = '';
    return;
  }

  resetLogoCropper();
  setLogoStatus('Image selected. Adjust crop area then confirm.', 'info');

  state.logoObjectUrl = URL.createObjectURL(file);
  elements.logoPreview.src = state.logoObjectUrl;
  elements.logoPreview.hidden = false;
  elements.cropImage.src = state.logoObjectUrl;
  elements.cropContainer.style.display = 'flex';

  if (typeof window.Cropper !== 'function') {
    setLogoStatus('Cropper failed to load. Please refresh and try again.', 'error');
    return;
  }

  elements.cropImage.onload = () => {
    if (state.logoCropper) {
      state.logoCropper.destroy();
      state.logoCropper = null;
    }
    state.logoCropper = new window.Cropper(elements.cropImage, {
      aspectRatio: 1,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      responsive: true,
      background: false
    });
    updateLogoUploadingUi();
  };
  if (elements.cropImage.complete) {
    elements.cropImage.onload();
  }
}

async function handleLogoCropConfirm() {
  if (state.isLogoUploading) {
    return;
  }
  if (!state.logoCropper) {
    setLogoStatus('Please select and crop a logo image first.', 'error');
    return;
  }
  if (!state.cloudinaryReady) {
    setLogoStatus(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET first.',
      'error'
    );
    return;
  }

  const cropButton = elements.cropConfirm;
  const originalLabel = cropButton.innerHTML;
  state.isLogoUploading = true;
  updateLogoUploadingUi();
  cropButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>جارٍ الرفع...</span>';
  setLogoStatus('Uploading cropped logo to Cloudinary...', 'info');

  try {
    const canvas = state.logoCropper.getCroppedCanvas({
      width: 800,
      height: 800,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });
    if (!canvas) {
      throw new Error('تعذّر قصّ الصورة.');
    }

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (!result) reject(new Error('Failed to convert cropped image.'));
        else resolve(result);
      }, 'image/png', 0.95);
    });

    const logoUrl = await uploadToCloudinaryWithRetry(blob);
    if (isDataUrl(logoUrl)) {
      throw new Error('استجابة غير صالحة من خدمة الرفع. لم يتم استلام رابط مستضاف.');
    }
    const optimizedLogoUrl = optimizeCloudinaryUrl(logoUrl);
    elements.settingsLogoUrl.value = optimizedLogoUrl;
    updateLogoPreview();

    state.restaurantConfig.logoUrl = optimizedLogoUrl;
    renderAdminBrand();
    try {
      assertAuthenticated();
      await saveRestaurantToFirestore();
    } catch (saveError) {
      console.error('Logo URL save failed:', saveError);
      setLogoStatus(`Logo uploaded but Firestore save failed: ${getFirestoreErrorMessage(saveError)}`, 'error');
      return;
    }

    setLogoStatus('Logo uploaded, optimized, and saved successfully.', 'success');
    elements.logoFile.value = '';
    resetLogoCropper();
  } catch (error) {
    console.error('Logo upload failed:', error);
    setLogoStatus(`Logo upload failed: ${error.message || 'Unknown error.'}`, 'error');
  } finally {
    state.isLogoUploading = false;
    updateLogoUploadingUi();
    cropButton.innerHTML = originalLabel;
  }
}

function optimizeCloudinaryUrl(url) {
  const value = String(url || '');
  if (!value || !value.includes('/upload/')) {
    return value;
  }
  return value.replace('/upload/', '/upload/w_300,h_300,c_fill,q_auto,f_auto/');
}

async function uploadToCloudinary(blob) {
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', `restaurants/${state.restaurantId}/logo`);

  let response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });
  } catch (networkError) {
    throw new Error('خطأ بالشبكة أثناء رفع الصورة. تحقق من اتصالك وحاول مجدداً.');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (jsonError) {
    throw new Error('تعذّر قراءة استجابة خدمة رفع الصور.');
  }

  if (!response.ok || !payload?.secure_url || typeof payload.secure_url !== 'string') {
    throw new Error(payload?.error?.message || 'Cloudinary upload failed due to invalid response.');
  }
  return payload.secure_url;
}

async function uploadToCloudinaryWithRetry(blob) {
  try {
    return await uploadToCloudinary(blob);
  } catch (firstError) {
    console.warn('Cloudinary upload first attempt failed, retrying once...', firstError);
    setLogoStatus('Upload failed once. Retrying...', 'info');
    return uploadToCloudinary(blob);
  }
}

function updateItemImagePreview() {
  const url = elements.imageUrl.value.trim();
  if (url) {
    elements.itemImgPreview.src = url;
    elements.itemImgPreview.hidden = false;
  } else {
    elements.itemImgPreview.removeAttribute('src');
    elements.itemImgPreview.hidden = true;
  }
}

function renderCategoryOptions() {
  elements.itemCategorySelect.innerHTML = '<option value="">اختر تصنيفاً</option>';
  elements.itemsCategoryFilter.innerHTML = '<option value="all">كل التصنيفات</option>';
  state.categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.id;
    option.textContent = category.name?.ar || category.name?.en || category.id;
    elements.itemCategorySelect.appendChild(option.cloneNode(true));
    elements.itemsCategoryFilter.appendChild(option.cloneNode(true));
  });
}

// Delegated click handling for the category table actions. Attached once to the
// table body (which persists across re-renders); reads the id from the row's
// dataset so no ids are interpolated into inline onclick attributes.
function bindCategoriesTableActions() {
  const tbody = elements.categoriesTableBody;
  if (!tbody || tbody.dataset.delegated === '1') return;
  tbody.dataset.delegated = '1';
  tbody.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn || !tbody.contains(btn)) return;
    const id = btn.closest('tr')?.dataset.id;
    if (!id) return;
    if (btn.dataset.action === 'edit') editCategory(id);
    else if (btn.dataset.action === 'delete') deleteCategory(id);
  });
}

// Delegated click handling for the item table actions.
function bindItemsTableActions() {
  const tbody = elements.itemsTableBody;
  if (!tbody || tbody.dataset.delegated === '1') return;
  tbody.dataset.delegated = '1';
  tbody.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn || !tbody.contains(btn)) return;
    const id = btn.closest('tr')?.dataset.id;
    if (!id) return;
    switch (btn.dataset.action) {
      case 'edit': editItem(id); break;
      case 'duplicate': duplicateItem(id); break;
      case 'toggle': toggleItemAvailability(id); break;
      case 'delete': deleteItem(id); break;
    }
  });
}

function renderTables() {
  renderCategoriesTable();
  renderItemsTable();
}

function renderCategoriesTable() {
  bindCategoriesTableActions();
  elements.categoriesTableBody.innerHTML = '';
  if (!state.categories.length) {
    elements.categoriesTableBody.innerHTML = '<tr class="empty-row"><td colspan="4">لا توجد تصنيفات بعد — اضغط "إضافة تصنيف" للبدء.</td></tr>';
    return;
  }
  state.categories
    .slice()
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .forEach((category) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><i class="fa-solid fa-grip-lines drag-handle" title="Drag to reorder"></i></td>
        <td>${escapeHtml(category.id)}</td>
        <td>${escapeHtml(category.name?.ar || category.name?.en || '')}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-admin-secondary" data-action="edit" aria-label="تعديل التصنيف"><i class="fa-solid fa-pen"></i></button>
            <button type="button" class="btn-admin-danger" data-deleteable data-action="delete" aria-label="حذف التصنيف"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>`;
      row.setAttribute('draggable', 'true');
      row.dataset.id = category.id;
      row.addEventListener('dragstart', () => { state.dragId = category.id; });
      row.addEventListener('dragover', (event) => event.preventDefault());
      row.addEventListener('drop', () => handleCategoryDrop(category.id));
      elements.categoriesTableBody.appendChild(row);
    });
}

function renderItemsTable() {
  bindItemsTableActions();
  const filter = elements.itemsCategoryFilter.value;
  elements.itemsTableBody.innerHTML = '';
  const filteredItems = state.menuItems.filter((item) => filter === 'all' || item.categoryId === filter);
  if (!filteredItems.length) {
    elements.itemsTableBody.innerHTML = '<tr class="empty-row"><td colspan="7">لا توجد أصناف هنا بعد — اضغط "إضافة صنف" للبدء.</td></tr>';
    return;
  }
  filteredItems
    .slice()
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
    .forEach((item) => {
      const categoryRef = state.categories.find((category) => category.id === item.categoryId);
      const categoryName = categoryRef?.name?.ar || categoryRef?.name?.en || 'بدون تصنيف';
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><i class="fa-solid fa-grip-lines drag-handle" title="Drag to reorder"></i></td>
        <td>${item.imageUrl ? `<img src="${escapeAttr(item.imageUrl)}" alt="item" class="avatar-preview" />` : '<span class="text-muted">—</span>'}</td>
        <td>${escapeHtml(item.name?.ar || item.name?.en || '')}</td>
        <td>${escapeHtml(categoryName)}</td>
        <td>${Number(item.price || 0).toFixed(2)}</td>
        <td><span class="status-pill ${item.isAvailable === false ? 'out-stock' : 'in-stock'}">${item.isAvailable === false ? 'غير متوفر' : 'متوفر'}</span></td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn-admin-secondary" data-action="edit" aria-label="تعديل الصنف"><i class="fa-solid fa-pen"></i></button>
            <button type="button" class="btn-admin-secondary" data-action="duplicate" aria-label="نسخ الصنف"><i class="fa-solid fa-copy"></i></button>
            <button type="button" class="btn-admin-secondary" data-action="toggle" aria-label="تبديل التوفر"><i class="fa-solid fa-toggle-on"></i></button>
            <button type="button" class="btn-admin-danger" data-deleteable data-action="delete" aria-label="حذف الصنف"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>`;
      row.setAttribute('draggable', 'true');
      row.dataset.id = item.id;
      row.addEventListener('dragstart', () => { state.dragId = item.id; });
      row.addEventListener('dragover', (event) => event.preventDefault());
      row.addEventListener('drop', () => handleItemDrop(item.id));
      elements.itemsTableBody.appendChild(row);
    });
}

function renderOverview() {
  const availableItems = state.menuItems.filter((item) => item.isAvailable !== false).length;
  elements.statViews.textContent = String(state.restaurantConfig.analytics?.views || 0);
  // Real order count from the orders collection (cancelled excluded)
  elements.statOrders.textContent = String(
    state.orders.filter((order) => order.status !== 'cancelled').length
  );
  elements.statActiveItems.textContent = String(availableItems);
  const subscription = state.restaurantConfig.subscription?.status || 'trial';
  elements.statSubscription.textContent = subscription === 'active' ? 'فعّال' : subscription === 'expired' ? 'منتهي' : 'تجريبي';
  elements.statSubscription.className = `status-badge-${subscription === 'expired' ? 'expired' : subscription === 'active' ? 'active' : 'trial'}`;

  const sortedItems = state.menuItems.slice().sort((a, b) => (b.orderClicks || 0) - (a.orderClicks || 0));
  elements.popularItemsList.innerHTML = '';
  if (!sortedItems.length) {
    elements.popularItemsList.innerHTML = '<tr class="empty-row"><td colspan="5">لا توجد بيانات بعد — ستظهر الإحصائيات فور تفاعل الزبائن مع المنيو.</td></tr>';
    return;
  }
  sortedItems.slice(0, 5).forEach((item) => {
    const category = state.categories.find((entry) => entry.id === item.categoryId);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(item.name?.ar || item.name?.en || '')}</td>
      <td>${escapeHtml(category?.name?.ar || category?.name?.en || 'بدون تصنيف')}</td>
      <td>${Number(item.price || 0).toFixed(2)}</td>
      <td>${item.orderClicks || 0}</td>
      <td>${item.views || 0}</td>`;
    elements.popularItemsList.appendChild(row);
  });
}

function renderQrCode() {
  const baseUrl = state.restaurantConfig.customDomain?.trim() || window.location.origin;
  const target = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}r=${encodeURIComponent(state.restaurantId)}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(target)}`;
  elements.adminQrImg.src = qrApiUrl;
  if (elements.viewLiveMenuBtn) {
    elements.viewLiveMenuBtn.href = target;
    elements.viewLiveMenuBtn.target = '_blank';
    elements.viewLiveMenuBtn.rel = 'noopener noreferrer';
  }
}

async function downloadQrCode() {
  const src = elements.adminQrImg?.src;
  if (!src) {
    showToast('رمز QR غير جاهز بعد.', 'warning');
    return;
  }
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error('qr-fetch-failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.restaurantId}-qr.png`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    window.open(src, '_blank', 'noopener,noreferrer');
  }
}

async function handleSettingsSave(event) {
  event.preventDefault();
  if (state.currentRole === 'staff_editor') {
    showToast('محرر المحتوى لا يملك صلاحية تعديل إعدادات المطعم.', 'warning');
    return;
  }
  const config = state.restaurantConfig;
  config.name = {
    en: sanitizeInput(elements.settingsNameEn.value),
    ar: sanitizeInput(elements.settingsNameAr.value)
  };
  config.slogan = {
    en: sanitizeInput(elements.settingsSloganEn.value),
    ar: sanitizeInput(elements.settingsSloganAr.value)
  };
  config.whatsappNumber = sanitizeInput(elements.settingsWhatsapp.value);
  config.email = sanitizeInput(elements.settingsEmail.value);
  config.workingHours = {
    en: sanitizeInput(elements.settingsHoursEn.value),
    ar: sanitizeInput(elements.settingsHoursAr.value)
  };
  config.currency = {
    en: sanitizeInput(elements.settingsCurrencyEn.value),
    ar: sanitizeInput(elements.settingsCurrencyAr.value)
  };
  config.address = {
    en: sanitizeInput(elements.settingsAddressEn.value),
    ar: sanitizeInput(elements.settingsAddressAr.value)
  };
  config.colors = {
    bg: elements.settingsColorBg.value,
    surface: elements.settingsColorSurface.value,
    gold: elements.settingsColorGold.value
  };
  if (isSuperAdmin()) {
    config.subscription = { status: elements.settingsSubscriptionStatus.value };
    config.accessControl = { role: elements.settingsPortalRole.value };
  }
  config.customDomain = sanitizeInput(elements.settingsCustomDomain.value);
  config.darkMode = state.darkMode;
  const logoUrl = sanitizeInput(elements.settingsLogoUrl.value);
  if (isDataUrl(logoUrl)) {
    showToast('يجب أن يكون الشعار رابطاً مستضافاً وليس صورة base64.', 'error');
    return;
  }
  config.logoUrl = logoUrl;
  state.restaurantConfig = config;
  applyTheme();
  renderOverview();
  renderAdminBrand();
  renderQrCode();
  populateSettingsForm();
  try {
    assertAuthenticated();
    await saveRestaurantToFirestore();
    showToast('تم حفظ إعدادات المطعم.', 'success');
  } catch (error) {
    console.error('Restaurant settings save failed:', error);
    showToast(getFirestoreErrorMessage(error), 'error');
  }
}

async function handleItemSave(event) {
  event.preventDefault();
  if (!canEditMenu()) {
    showToast('لا تملك صلاحية تعديل الأصناف.', 'warning');
    return;
  }

  const isEditing = Boolean(elements.itemEditId.value);
  const existingItem = isEditing
    ? state.menuItems.find((item) => item.id === elements.itemEditId.value)
    : null;
  const itemId = elements.itemEditId.value || `${createSlug(elements.itemNameEn.value || elements.itemNameAr.value)}-${Date.now()}`;

  const imageUrl = sanitizeInput(elements.imageUrl.value);

  const itemPayload = {
    id: itemId,
    categoryId: elements.itemCategorySelect.value,
    price: Number(elements.itemPrice.value || 0),
    name: {
      en: sanitizeInput(elements.itemNameEn.value),
      ar: sanitizeInput(elements.itemNameAr.value)
    },
    description: {
      en: sanitizeInput(elements.itemDescEn.value),
      ar: sanitizeInput(elements.itemDescAr.value)
    },
    tags: {
      en: splitTags(elements.itemTagsEn.value),
      ar: splitTags(elements.itemTagsAr.value)
    },
    isAvailable: elements.itemAvailable.checked,
    imageUrl,
    orderIndex: existingItem?.orderIndex ?? state.menuItems.length
  };

  if (isEditing) {
    const index = state.menuItems.findIndex((item) => item.id === elements.itemEditId.value);
    if (index >= 0) {
      state.menuItems[index] = { ...state.menuItems[index], ...itemPayload, id: elements.itemEditId.value };
    }
  } else {
    state.menuItems.push(itemPayload);
  }

  renderTables();
  renderOverview();
  try {
    assertAuthenticated();
    await saveMenuDataToFirestore();
    closeItemModal();
    showToast('تم حفظ الصنف بنجاح.', 'success');
  } catch (error) {
    console.error('Menu item save failed:', error);
    showToast(getFirestoreErrorMessage(error), 'error');
  }
}

async function handleCategorySave(event) {
  event.preventDefault();
  if (!canEditMenu()) {
    showToast('لا تملك صلاحية تعديل التصنيفات.', 'warning');
    return;
  }
  const categoryId = sanitizeSlug(elements.categoryIdVal.value);
  const categoryPayload = {
    id: categoryId,
    name: {
      en: sanitizeInput(elements.categoryNameEn.value),
      ar: sanitizeInput(elements.categoryNameAr.value)
    },
    orderIndex: Number(elements.categoryOrderIndex.value || state.categories.length)
  };

  if (elements.categoryEditId.value) {
    const index = state.categories.findIndex((entry) => entry.id === elements.categoryEditId.value);
    if (index >= 0) {
      state.categories[index] = { ...state.categories[index], ...categoryPayload, id: elements.categoryEditId.value };
    }
  } else {
    state.categories.push(categoryPayload);
  }

  renderCategoryOptions();
  renderTables();
  try {
    assertAuthenticated();
    await saveMenuDataToFirestore();
    closeCategoryModal();
    showToast('تم حفظ التصنيف بنجاح.', 'success');
  } catch (error) {
    console.error('Category save failed:', error);
    showToast(getFirestoreErrorMessage(error), 'error');
  }
}

function openAddCategoryModal() {
  elements.categoryForm.reset();
  elements.categoryEditId.value = '';
  elements.categoryIdVal.readOnly = false;
  elements.categoryOrderIndex.value = String(state.categories.length);
  elements.categoryModalTitle.textContent = 'إضافة تصنيف';
  document.getElementById('modal-category').classList.add('active');
}

function closeCategoryModal() {
  document.getElementById('modal-category').classList.remove('active');
}

function openAddItemModal() {
  elements.itemForm.reset();
  elements.itemEditId.value = '';
  elements.itemAvailable.checked = true;
  elements.itemModalTitle.textContent = 'إضافة صنف جديد';
  elements.imageUrl.value = '';
  updateItemImagePreview();
  document.getElementById('modal-item').classList.add('active');
}

function closeItemModal() {
  document.getElementById('modal-item').classList.remove('active');
}

function editCategory(categoryId) {
  const category = state.categories.find((entry) => entry.id === categoryId);
  if (!category) return;
  elements.categoryEditId.value = category.id;
  elements.categoryIdVal.value = category.id;
  elements.categoryIdVal.readOnly = true;
  elements.categoryNameEn.value = category.name?.en || '';
  elements.categoryNameAr.value = category.name?.ar || '';
  elements.categoryOrderIndex.value = String(category.orderIndex || 0);
  elements.categoryModalTitle.textContent = 'تعديل التصنيف';
  document.getElementById('modal-category').classList.add('active');
}

function editItem(itemId) {
  const item = state.menuItems.find((entry) => entry.id === itemId);
  if (!item) return;
  elements.itemEditId.value = item.id;
  elements.itemNameEn.value = item.name?.en || '';
  elements.itemNameAr.value = item.name?.ar || '';
  elements.itemDescEn.value = item.description?.en || '';
  elements.itemDescAr.value = item.description?.ar || '';
  elements.itemCategorySelect.value = item.categoryId || '';
  elements.itemPrice.value = item.price || 0;
  elements.itemAvailable.checked = item.isAvailable !== false;
  elements.itemTagsEn.value = (item.tags?.en || []).join(', ');
  elements.itemTagsAr.value = (item.tags?.ar || []).join(', ');
  elements.imageUrl.value = item.imageUrl || item.image || '';
  updateItemImagePreview();
  elements.itemModalTitle.textContent = 'تعديل الصنف';
  document.getElementById('modal-item').classList.add('active');
}

function deleteCategory(categoryId) {
  if (!canManageRestaurant()) {
    showToast('حذف التصنيفات متاح للمدراء فقط.', 'warning');
    return;
  }
  openConfirmModal('حذف التصنيف؟', 'سيتم حذف التصنيف وجميع الأصناف المرتبطة به.', async () => {
    const removedItems = state.menuItems.filter((item) => item.categoryId === categoryId);
    state.categories = state.categories.filter((entry) => entry.id !== categoryId);
    state.menuItems = state.menuItems.filter((item) => item.categoryId !== categoryId);
    renderCategoryOptions();
    renderTables();
    renderOverview();
    try {
      assertAuthenticated();
      await deleteDoc(doc(db, 'restaurants', state.restaurantId, 'categories', categoryId));
      await Promise.all(
        removedItems.map((item) =>
          deleteDoc(doc(db, 'restaurants', state.restaurantId, 'menu_items', item.id))
        )
      );
      await saveMenuDataToFirestore();
    } catch (error) {
      console.error('Category delete failed:', error);
      showToast(getFirestoreErrorMessage(error), 'error');
    }
  });
}

function deleteItem(itemId) {
  if (!canManageRestaurant()) {
    showToast('حذف الأصناف متاح للمدراء فقط.', 'warning');
    return;
  }
  openConfirmModal('حذف الصنف؟', 'سيتم حذف هذا الصنف نهائياً من المنيو.', async () => {
    state.menuItems = state.menuItems.filter((item) => item.id !== itemId);
    renderTables();
    renderOverview();
    try {
      assertAuthenticated();
      await deleteDoc(doc(db, 'restaurants', state.restaurantId, 'menu_items', itemId));
      await saveMenuDataToFirestore();
    } catch (error) {
      console.error('Item delete failed:', error);
      showToast(getFirestoreErrorMessage(error), 'error');
    }
  });
}

async function toggleItemAvailability(itemId) {
  const item = state.menuItems.find((entry) => entry.id === itemId);
  if (!item) return;
  item.isAvailable = !item.isAvailable;
  renderTables();
  renderOverview();
  try {
    assertAuthenticated();
    await saveMenuDataToFirestore();
  } catch (error) {
    item.isAvailable = !item.isAvailable;
    renderTables();
    renderOverview();
    console.error('Availability toggle failed:', error);
    showToast(getFirestoreErrorMessage(error), 'error');
  }
}

async function persistMenuOrToast() {
  persistState();
  if (!auth?.currentUser) return;
  try {
    await saveMenuDataToFirestore();
  } catch (error) {
    console.error('Menu persist failed:', error);
    showToast(getFirestoreErrorMessage(error), 'error');
  }
}

async function duplicateItem(itemId) {
  if (!canEditMenu()) {
    showToast('لا تملك صلاحية نسخ الأصناف.', 'warning');
    return;
  }
  const item = state.menuItems.find((entry) => entry.id === itemId);
  if (!item) return;
  const copy = {
    ...item,
    id: `${item.id}-copy-${Date.now()}`,
    name: { ...item.name, en: `${item.name?.en || 'Copy'} (Copy)`, ar: `${item.name?.ar || 'نسخة'} (نسخة)` },
    orderIndex: state.menuItems.length,
    views: 0,
    orderClicks: 0
  };
  state.menuItems.push(copy);
  renderTables();
  renderOverview();
  await persistMenuOrToast();
}

function handleCategoryDrop(targetId) {
  if (!canEditMenu()) return;
  if (!state.dragId || state.dragId === targetId) return;
  const fromIndex = state.categories.findIndex((entry) => entry.id === state.dragId);
  const toIndex = state.categories.findIndex((entry) => entry.id === targetId);
  if (fromIndex < 0 || toIndex < 0) return;
  const [moved] = state.categories.splice(fromIndex, 1);
  state.categories.splice(toIndex, 0, moved);
  state.categories = state.categories.map((entry, index) => ({ ...entry, orderIndex: index }));
  renderTables();
  persistMenuOrToast();
}

function handleItemDrop(targetId) {
  if (!canEditMenu()) return;
  if (!state.dragId || state.dragId === targetId) return;
  const filter = elements.itemsCategoryFilter?.value || 'all';
  const sorted = state.menuItems
    .slice()
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  const visible = filter === 'all'
    ? sorted
    : sorted.filter((item) => item.categoryId === filter);
  const fromVisible = visible.findIndex((entry) => entry.id === state.dragId);
  const toVisible = visible.findIndex((entry) => entry.id === targetId);
  if (fromVisible < 0 || toVisible < 0) return;

  const [moved] = visible.splice(fromVisible, 1);
  visible.splice(toVisible, 0, moved);

  if (filter === 'all') {
    state.menuItems = visible.map((entry, index) => ({ ...entry, orderIndex: index }));
  } else {
    const slots = sorted
      .filter((item) => item.categoryId === filter)
      .map((item) => item.orderIndex || 0)
      .sort((a, b) => a - b);
    const nextIndexById = new Map(visible.map((item, index) => [item.id, slots[index]]));
    state.menuItems = state.menuItems.map((item) => (
      nextIndexById.has(item.id) ? { ...item, orderIndex: nextIndexById.get(item.id) } : item
    ));
  }
  renderTables();
  renderOverview();
  persistMenuOrToast();
}

function exportMenuJson() {
  const payload = {
    restaurant: state.restaurantConfig,
    categories: state.categories,
    menuItems: state.menuItems
  };
  const data = JSON.stringify(payload, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${state.restaurantId}-menu.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function isMenuExportPayload(parsed) {
  return Boolean(
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray(parsed.categories) &&
    Array.isArray(parsed.menuItems)
  );
}

function importMenuJson(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  if (!canManageRestaurant()) {
    showToast('استيراد المنيو متاح للمدراء فقط.', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch (error) {
      showToast('الملف المحدد ليس ملف تصدير منيو صالحاً.', 'error');
      return;
    }
    if (!isMenuExportPayload(parsed)) {
      showToast('ملف الاستيراد ينقصه التصنيفات أو الأصناف.', 'error');
      return;
    }

    openConfirmModal(
      'استيراد المنيو؟',
      'سيتم استبدال التصنيفات والأصناف الحالية بهذا الملف. لا يمكن التراجع بسهولة.',
      async () => {
        const previous = {
          restaurantConfig: structuredClone(state.restaurantConfig),
          categories: structuredClone(state.categories),
          menuItems: structuredClone(state.menuItems)
        };
        try {
          if (parsed.restaurant && typeof parsed.restaurant === 'object') {
            const incoming = { ...parsed.restaurant };
            delete incoming.analytics;
            if (!isSuperAdmin()) {
              delete incoming.subscription;
              delete incoming.accessControl;
            }
            state.restaurantConfig = { ...state.restaurantConfig, ...incoming };
          }
          state.categories = parsed.categories;
          state.menuItems = parsed.menuItems;
          persistState();
          renderCategoryOptions();
          renderTables();
          renderOverview();
          populateSettingsForm();
          if (auth?.currentUser) {
            await saveMenuDataToFirestore();
            await saveRestaurantToFirestore();
          }
          showToast('تم استيراد المنيو بنجاح.', 'success');
        } catch (error) {
          state.restaurantConfig = previous.restaurantConfig;
          state.categories = previous.categories;
          state.menuItems = previous.menuItems;
          renderCategoryOptions();
          renderTables();
          renderOverview();
          populateSettingsForm();
          console.error('Menu import failed:', error);
          showToast(getFirestoreErrorMessage(error), 'error');
        }
      },
      'استيراد'
    );
  };
  reader.readAsText(file);
}

async function createLiveBackup() {
  try {
    assertAuthenticated();
    const backupRef = doc(collection(db, 'restaurants', state.restaurantId, 'backups'));
    await setDoc(backupRef, {
      restaurant: state.restaurantConfig,
      categories: state.categories,
      menuItems: state.menuItems,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
    showToast('تم حفظ النسخة الاحتياطية في السحابة.', 'success');
  } catch (error) {
    console.error('Backup failed:', error);
    showToast(getFirestoreErrorMessage(error), 'error');
  }
}

async function saveRestaurantToFirestore() {
  const restaurantRef = doc(db, 'restaurants', state.restaurantId);
  await setDoc(restaurantRef, restaurantConfigForWrite(), { merge: true });
}

async function saveMenuDataToFirestore() {
  const batch = writeBatch(db);
  const categoriesRef = collection(db, 'restaurants', state.restaurantId, 'categories');
  const itemsRef = collection(db, 'restaurants', state.restaurantId, 'menu_items');

  const [existingCategoriesSnap, existingItemsSnap] = await Promise.all([
    getDocs(categoriesRef),
    getDocs(itemsRef)
  ]);

  const activeCategoryIds = new Set(state.categories.map((category) => category.id));
  const activeItemIds = new Set(state.menuItems.map((item) => item.id));

  existingCategoriesSnap.forEach((docSnap) => {
    if (!activeCategoryIds.has(docSnap.id)) {
      batch.delete(doc(categoriesRef, docSnap.id));
    }
  });

  existingItemsSnap.forEach((docSnap) => {
    if (!activeItemIds.has(docSnap.id)) {
      batch.delete(doc(itemsRef, docSnap.id));
    }
  });

  state.categories.forEach((category, index) => {
    batch.set(doc(categoriesRef, category.id), { ...category, orderIndex: index }, { merge: true });
  });

  state.menuItems.forEach((item, index) => {
    batch.set(doc(itemsRef, item.id), menuItemForWrite(item, index), { merge: true });
  });

  await batch.commit();
}

async function seedFirestoreIfEmpty() {
  const restaurantRef = doc(db, 'restaurants', state.restaurantId);
  const restaurantSnap = await getDocs(collection(db, 'restaurants', state.restaurantId, 'categories'));
  if (!restaurantSnap.empty) return;

  await setDoc(restaurantRef, state.restaurantConfig);
  await saveMenuDataToFirestore();
}

function syncFromFirestore() {
  teardownFirestoreListeners();

  const restaurantRef = doc(db, 'restaurants', state.restaurantId);
  state.firestoreUnsubscribers.push(
    onSnapshot(
      restaurantRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          state.restaurantConfig = { ...structuredClone(DEFAULT_RESTAURANT), ...snapshot.data() };
          populateSettingsForm();
          renderAdminBrand();
          renderOverview();
          renderQrCode();
          updatePermissionAwareUi();
        } else {
          try {
            await seedFirestoreIfEmpty();
          } catch (error) {
            console.error('Failed to seed Firestore:', error);
            showToast(getFirestoreErrorMessage(error), 'error');
          }
        }
      },
      (error) => {
        console.error('Restaurant sync error:', error);
        showToast(getFirestoreErrorMessage(error), 'error');
      }
    )
  );

  const categoriesQuery = query(
    collection(db, 'restaurants', state.restaurantId, 'categories'),
    orderBy('orderIndex', 'asc')
  );
  state.firestoreUnsubscribers.push(
    onSnapshot(
      categoriesQuery,
      (snapshot) => {
        state.categories = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data()
        }));
        renderCategoryOptions();
        renderTables();
      },
      (error) => console.error('Categories sync error:', error)
    )
  );

  const itemsQuery = query(
    collection(db, 'restaurants', state.restaurantId, 'menu_items'),
    orderBy('orderIndex', 'asc')
  );
  state.firestoreUnsubscribers.push(
    onSnapshot(
      itemsQuery,
      (snapshot) => {
        state.menuItems = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data()
        }));
        renderTables();
        renderOverview();
      },
      (error) => console.error('Menu items sync error:', error)
    )
  );

  // Live customer orders — newest first
  const ordersQuery = query(
    collection(db, 'restaurants', state.restaurantId, 'orders'),
    orderBy('createdAt', 'desc')
  );
  state.firestoreUnsubscribers.push(
    onSnapshot(
      ordersQuery,
      (snapshot) => {
        state.orders = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data()
        }));

        // Notify on genuinely new arrivals (skip the initial load)
        if (state.knownOrderIds !== null) {
          const fresh = state.orders.filter((order) => !state.knownOrderIds.has(order.id));
          if (fresh.length) {
            showToast(`🛎️ وصل طلب جديد من ${fresh[0].customerName || 'زبون'}!`, 'success');
            playOrderChime();
          }
        }
        state.knownOrderIds = new Set(state.orders.map((order) => order.id));

        renderOrders();
        updateOrdersBadge();
        renderOverview();
      },
      (error) => console.error('Orders sync error:', error)
    )
  );
}

// Reset the historical counters (views + legacy clicks) to start fresh
function handleResetAnalytics() {
  openConfirmModal(
    'تصفير العدادات؟',
    'سيتم تصفير مشاهدات المطعم ونقرات كل طبق. عدد الطلبات الحقيقي لا يتأثر لأنه يُحسب من الطلبات الواردة.',
    async () => {
      try {
        assertAuthenticated();
        const batch = writeBatch(db);
        batch.update(doc(db, 'restaurants', state.restaurantId), {
          'analytics.views': 0,
          'analytics.whatsappOrders': 0
        });
        state.menuItems.forEach((item) => {
          batch.update(doc(db, 'restaurants', state.restaurantId, 'menu_items', item.id), {
            views: 0,
            orderClicks: 0
          });
        });
        await batch.commit();
        state.restaurantConfig.analytics = { views: 0, whatsappOrders: 0 };
        state.menuItems = state.menuItems.map((item) => ({ ...item, views: 0, orderClicks: 0 }));
        renderOverview();
        showToast('تم تصفير العدادات.', 'success');
      } catch (error) {
        console.error('Analytics reset failed:', error);
        showToast(getFirestoreErrorMessage(error), 'error');
      }
    },
    'تصفير'
  );
}

// ==========================================================================
// Orders management
// ==========================================================================
const ORDER_STATUS_META = {
  new: { label: 'جديد', className: 'st-new' },
  preparing: { label: 'قيد التحضير', className: 'st-preparing' },
  done: { label: 'مكتمل', className: 'st-done' },
  cancelled: { label: 'ملغي', className: 'st-cancelled' }
};

function formatOrderTime(createdAt) {
  const date = createdAt?.toDate ? createdAt.toDate() : null;
  if (!date) return 'الآن';
  const time = date.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' });
  const isToday = new Date().toDateString() === date.toDateString();
  return isToday ? time : `${date.toLocaleDateString('ar')} ${time}`;
}

function updateOrdersBadge() {
  if (!elements.ordersBadge) return;
  const newCount = state.orders.filter((order) => order.status === 'new').length;
  elements.ordersBadge.textContent = String(newCount);
  elements.ordersBadge.classList.toggle('hidden', newCount === 0);
}

function renderOrders() {
  if (!elements.ordersList) return;
  bindOrdersActions();

  const filter = elements.ordersFilter?.value || 'all';
  const visible = state.orders.filter((order) => filter === 'all' || order.status === filter);

  if (!visible.length) {
    elements.ordersList.innerHTML =
      '<div class="orders-empty"><i class="fa-solid fa-bell-concierge"></i><p>' +
      (state.orders.length ? 'لا توجد طلبات بهذه الحالة.' : 'لا توجد طلبات بعد — أول طلب من الزبائن رح يظهر هنا لحظياً.') +
      '</p></div>';
    return;
  }

  const canDelete = canManageRestaurant();

  elements.ordersList.innerHTML = visible.map((order) => {
    const meta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.new;
    const itemsHtml = (order.items || [])
      .map((line) => `<li><span class="oi-qty">${Number(line.quantity) || 1}×</span> ${escapeHtml(line.name || '')} <span class="oi-price">${Number(line.price || 0).toFixed(2)}</span></li>`)
      .join('');
    const noteHtml = order.note
      ? `<p class="order-note"><i class="fa-solid fa-comment-dots" aria-hidden="true"></i> ${escapeHtml(order.note)}</p>`
      : '';

    let actionsHtml = '';
    if (order.status === 'new') {
      actionsHtml =
        '<button type="button" class="btn-admin-primary" data-action="set-status" data-status="preparing"><i class="fa-solid fa-fire-burner"></i><span>بدء التحضير</span></button>' +
        '<button type="button" class="btn-admin-danger" data-action="set-status" data-status="cancelled"><i class="fa-solid fa-ban"></i><span>إلغاء</span></button>';
    } else if (order.status === 'preparing') {
      actionsHtml =
        '<button type="button" class="btn-admin-primary" data-action="set-status" data-status="done"><i class="fa-solid fa-circle-check"></i><span>تم التجهيز</span></button>' +
        '<button type="button" class="btn-admin-danger" data-action="set-status" data-status="cancelled"><i class="fa-solid fa-ban"></i><span>إلغاء</span></button>';
    } else if (canDelete) {
      actionsHtml =
        '<button type="button" class="btn-admin-secondary" data-action="delete"><i class="fa-solid fa-trash"></i><span>حذف</span></button>';
    }

    return `
      <article class="order-card ${meta.className}" data-order-id="${escapeHtml(order.id)}">
        <div class="order-card-head">
          <div class="order-meta">
            <span class="order-time"><i class="fa-regular fa-clock" aria-hidden="true"></i> ${formatOrderTime(order.createdAt)}</span>
            <span class="order-status-chip ${meta.className}">${meta.label}</span>
          </div>
          <span class="order-total">${Number(order.total || 0).toFixed(2)}</span>
        </div>
        <p class="order-customer">
          <i class="fa-solid fa-circle-user" aria-hidden="true"></i>
          <strong>${escapeHtml(order.customerName || 'زبون')}</strong>
          <a class="order-phone" href="tel:${escapeAttr(order.customerPhone || '')}" dir="ltr">${escapeHtml(order.customerPhone || '')}</a>
        </p>
        <ul class="order-items">${itemsHtml}</ul>
        ${noteHtml}
        <div class="order-actions">${actionsHtml}</div>
      </article>`;
  }).join('');
}

function bindOrdersActions() {
  const list = elements.ordersList;
  if (!list || list.dataset.delegated === '1') return;
  list.dataset.delegated = '1';
  list.addEventListener('click', async (event) => {
    const btn = event.target.closest('button[data-action]');
    if (!btn || !list.contains(btn)) return;
    const orderId = btn.closest('.order-card')?.dataset.orderId;
    if (!orderId) return;

    if (btn.dataset.action === 'set-status') {
      const status = btn.dataset.status;
      try {
        assertAuthenticated();
        await updateDoc(doc(db, 'restaurants', state.restaurantId, 'orders', orderId), { status });
        showToast(status === 'cancelled' ? 'تم إلغاء الطلب.' : status === 'done' ? 'تم إنهاء الطلب بنجاح.' : 'الطلب قيد التحضير الآن.', 'success');
      } catch (error) {
        console.error('Order status update failed:', error);
        showToast(getFirestoreErrorMessage(error), 'error');
      }
    } else if (btn.dataset.action === 'delete') {
      openConfirmModal('حذف الطلب؟', 'سيتم حذف سجل هذا الطلب نهائياً.', async () => {
        try {
          assertAuthenticated();
          await deleteDoc(doc(db, 'restaurants', state.restaurantId, 'orders', orderId));
          showToast('تم حذف الطلب.', 'success');
        } catch (error) {
          console.error('Order delete failed:', error);
          showToast(getFirestoreErrorMessage(error), 'error');
        }
      });
    }
  });
}

// Soft two-tone chime for incoming orders (WebAudio, no asset needed)
function playOrderChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[880, 0], [1174.66, 0.16]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.55);
    });
  } catch (error) {
    /* audio unavailable — silent fallback */
  }
}

function applyTheme() {
  // The warm palette lives entirely in admin.css (.admin-light overrides).
  // Never force colors inline — that used to override the design system.
  document.body.classList.toggle('admin-light', !state.darkMode);
}

function openConfirmModal(title, message, callback, actionLabel = 'حذف') {
  elements.confirmTitle.textContent = title;
  elements.confirmMessage.textContent = message;
  elements.confirmActionBtn.textContent = actionLabel;
  state.confirmCallback = callback;
  elements.confirmModal.classList.add('active');
}

function closeConfirmModal() {
  elements.confirmModal.classList.remove('active');
  state.confirmCallback = null;
}

async function runConfirmAction() {
  const callback = state.confirmCallback;
  closeConfirmModal();
  if (typeof callback !== 'function') return;
  try {
    await callback();
  } catch (error) {
    console.error('Confirm action failed:', error);
    showToast(getFirestoreErrorMessage(error), 'error');
  }
}

function sanitizeInput(value) {
  return String(value || '').replace(/<[^>]*>/g, '').trim();
}

function sanitizeSlug(value) {
  return sanitizeInput(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function splitTags(value) {
  return sanitizeInput(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function createSlug(value) {
  return sanitizeSlug(value || 'item');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function capitalize(value) {
  return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
}

window.addEventListener('DOMContentLoaded', init);
