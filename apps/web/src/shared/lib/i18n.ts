/**
 * Persian (fa-IR) translation dictionary.
 *
 * Organized by feature/domain namespace. Flat keys within each namespace
 * for simple lookup. This can be upgraded to next-intl when multi-locale
 * support is needed.
 */

const fa = {
  // ── Common ──────────────────────────────────────
  common: {
    appName: 'حسابداری',
    loading: 'در حال بارگذاری...',
    save: 'ذخیره',
    cancel: 'انصراف',
    delete: 'حذف',
    edit: 'ویرایش',
    create: 'ایجاد',
    search: 'جستجو',
    filter: 'فیلتر',
    actions: 'عملیات',
    confirm: 'تأیید',
    back: 'بازگشت',
    next: 'بعدی',
    previous: 'قبلی',
    yes: 'بله',
    no: 'خیر',
    all: 'همه',
    none: 'هیچ‌کدام',
    close: 'بستن',
    submit: 'ارسال',
    reset: 'بازنشانی',
    active: 'فعال',
    inactive: 'غیرفعال',
    status: 'وضعیت',
    description: 'توضیحات',
    code: 'کد',
    name: 'نام',
    date: 'تاریخ',
    amount: 'مبلغ',
    total: 'جمع کل',
    currency: 'ارز',
    rial: 'ریال',
    toman: 'تومان',
    noData: 'اطلاعاتی یافت نشد',
    noResults: 'نتیجه‌ای یافت نشد',
    error: 'خطا',
    success: 'عملیات موفق',
    warning: 'هشدار',
    info: 'اطلاعات',
    rowsPerPage: 'ردیف در هر صفحه',
    of: 'از',
    page: 'صفحه',
    currentPeriod: 'دوره جاری',
  },

  // ── Navigation ──────────────────────────────────
  nav: {
    dashboard: 'داشبورد',
    accounting: 'حساب‌ها',
    journalEntries: 'اسناد حسابداری',
    invoices: 'فاکتورها',
    customers: 'مشتریان',
    vendors: 'تأمین‌کنندگان',
    reports: 'گزارش‌ها',
    settings: 'تنظیمات',
    treasury: 'خزانه‌داری',
    inventory: 'انبار',
    logout: 'خروج',
  },

  // ── Auth ────────────────────────────────────────
  auth: {
    signIn: 'ورود',
    signUp: 'ثبت‌نام',
    signOut: 'خروج از حساب',
    signingIn: 'در حال ورود...',
    email: 'ایمیل',
    password: 'رمز عبور',
    confirmPassword: 'تکرار رمز عبور',
    firstName: 'نام',
    lastName: 'نام خانوادگی',
    forgotPassword: 'فراموشی رمز عبور',
    resetPassword: 'بازنشانی رمز عبور',
    signInTitle: 'ورود به حسابداری',
    signInDescription: 'اطلاعات ورود خود را وارد کنید',
    emailPlaceholder: 'example@company.com',
    passwordPlaceholder: '********',
    noAccount: 'حساب کاربری ندارید؟',
    hasAccount: 'حساب کاربری دارید؟',
    invalidCredentials: 'ایمیل یا رمز عبور اشتباه است',
  },

  // ── Dashboard ───────────────────────────────────
  dashboard: {
    title: 'داشبورد',
    subtitle: 'نمای کلی مالی سازمان شما',
    totalRevenue: 'درآمد کل',
    totalExpenses: 'هزینه‌های کل',
    netIncome: 'سود خالص',
    openInvoices: 'فاکتورهای باز',
    awaitingPayment: 'در انتظار پرداخت',
    currentPeriodLabel: 'دوره جاری',
  },

  // ── Accounting ──────────────────────────────────
  accounting: {
    chartOfAccounts: 'سرفصل حساب‌ها',
    chartOfAccountsDesc: 'مدیریت سرفصل‌ها و زیرحساب‌ها',
    account: 'حساب',
    accountType: 'نوع حساب',
    parentAccount: 'حساب والد',
    accountCode: 'کد حساب',
    accountName: 'نام حساب',
    debit: 'بدهکار',
    credit: 'بستانکار',
    balance: 'مانده',
    types: {
      asset: 'دارایی',
      liability: 'بدهی',
      equity: 'حقوق صاحبان سهام',
      revenue: 'درآمد',
      expense: 'هزینه',
    },
  },

  // ── Journal Entries ─────────────────────────────
  journal: {
    title: 'اسناد حسابداری',
    subtitle: 'ثبت و مدیریت اسناد حسابداری',
    newEntry: 'سند جدید',
    entryNumber: 'شماره سند',
    entryDate: 'تاریخ سند',
    postEntry: 'ثبت نهایی',
    draftEntry: 'پیش‌نویس',
    posted: 'ثبت شده',
    draft: 'پیش‌نویس',
    lines: 'ردیف‌های سند',
    addLine: 'افزودن ردیف',
    totalDebit: 'جمع بدهکار',
    totalCredit: 'جمع بستانکار',
    balanceDiff: 'اختلاف تراز',
    balanced: 'تراز است',
    unbalanced: 'تراز نیست',
  },

  // ── Invoices ────────────────────────────────────
  invoice: {
    title: 'فاکتورها',
    subtitle: 'مدیریت فاکتورهای خرید و فروش',
    newInvoice: 'فاکتور جدید',
    invoiceNumber: 'شماره فاکتور',
    invoiceDate: 'تاریخ فاکتور',
    dueDate: 'سررسید',
    documentType: 'نوع سند',
    types: {
      sales: 'فروش',
      purchase: 'خرید',
      salesReturn: 'برگشت از فروش',
      purchaseReturn: 'برگشت از خرید',
      proforma: 'پیش‌فاکتور',
    },
    statuses: {
      draft: 'پیش‌نویس',
      confirmed: 'تأیید شده',
      cancelled: 'ابطال شده',
    },
    lines: 'اقلام فاکتور',
    addLine: 'افزودن قلم',
    product: 'کالا/خدمات',
    quantity: 'تعداد',
    unitPrice: 'فی',
    discount: 'تخفیف',
    tax: 'مالیات',
    lineTotal: 'مبلغ کل',
    subtotal: 'جمع اقلام',
    totalDiscount: 'جمع تخفیف',
    totalTax: 'جمع مالیات',
    grandTotal: 'مبلغ نهایی',
  },

  // ── Customers ───────────────────────────────────
  customer: {
    title: 'مشتریان',
    subtitle: 'مدیریت اطلاعات مشتریان',
    newCustomer: 'مشتری جدید',
    customerCode: 'کد مشتری',
    customerName: 'نام مشتری',
    phone: 'تلفن',
    address: 'آدرس',
    creditLimit: 'سقف اعتبار',
    nationalId: 'کد ملی',
    economicCode: 'کد اقتصادی',
    postalCode: 'کد پستی',
    bankAccount: 'حساب بانکی',
    birthDate: 'تاریخ تولد',
    referrer: 'معرف',
  },

  // ── Vendors ─────────────────────────────────────
  vendor: {
    title: 'تأمین‌کنندگان',
    subtitle: 'مدیریت اطلاعات تأمین‌کنندگان',
    newVendor: 'تأمین‌کننده جدید',
    vendorCode: 'کد تأمین‌کننده',
    vendorName: 'نام تأمین‌کننده',
  },

  // ── Treasury ────────────────────────────────────
  treasury: {
    bank: 'بانک',
    banks: 'بانک‌ها',
    bankAccount: 'حساب بانکی',
    bankAccounts: 'حساب‌های بانکی',
    cashbox: 'صندوق',
    cashboxes: 'صندوق‌ها',
    receivedCheque: 'چک دریافتی',
    receivedCheques: 'چک‌های دریافتی',
    paidCheque: 'چک پرداختی',
    paidCheques: 'چک‌های پرداختی',
    chequeNumber: 'شماره چک',
    sayadiNumber: 'شماره صیادی',
    chequeStatuses: {
      open: 'در جریان',
      deposited: 'به بانک واگذار شده',
      cashed: 'وصول شده',
      returned: 'برگشت خورده',
      bounced: 'برگشتی',
      cancelled: 'ابطال شده',
      cleared: 'تسویه شده',
    },
    openingBalance: 'مانده افتتاحیه',
    openingBalances: 'مانده‌های افتتاحیه',
  },

  // ── Inventory ───────────────────────────────────
  inventory: {
    product: 'کالا',
    products: 'کالاها',
    warehouse: 'انبار',
    warehouses: 'انبارها',
    stock: 'موجودی',
    productCode: 'کد کالا',
    productName: 'نام کالا',
    barcode: 'بارکد',
    countingUnit: 'واحد شمارش',
    salePrice: 'قیمت فروش',
    purchasePrice: 'قیمت خرید',
    costingMethod: 'روش ارزیابی موجودی',
    costingMethods: {
      fifo: 'فایفو (اولین وارده، اولین صادره)',
      lifo: 'لایفو (آخرین وارده، اولین صادره)',
      average: 'میانگین موزون',
    },
  },

  // ── Reports ─────────────────────────────────────
  reports: {
    title: 'گزارش‌ها',
    subtitle: 'گزارش‌ها و تحلیل مالی',
    balanceSheet: 'ترازنامه',
    incomeStatement: 'صورت سود و زیان',
    trialBalance: 'تراز آزمایشی',
    ledger: 'دفتر کل',
    journal: 'دفتر روزنامه',
    cashFlow: 'گردش وجوه نقد',
    agingReport: 'گزارش سنی بدهی‌ها',
    fromDate: 'از تاریخ',
    toDate: 'تا تاریخ',
    fiscalPeriod: 'دوره مالی',
    generateReport: 'ایجاد گزارش',
  },

  // ── Settings ────────────────────────────────────
  settings: {
    title: 'تنظیمات',
    subtitle: 'پیکربندی سازمان و ترجیحات',
    organization: 'سازمان',
    organizationName: 'نام سازمان',
    fiscalYear: 'سال مالی',
    defaultCurrency: 'ارز پیش‌فرض',
    theme: 'پوسته',
    lightTheme: 'روشن',
    darkTheme: 'تاریک',
    systemTheme: 'پیش‌فرض سیستم',
    language: 'زبان',
    toggleTheme: 'تغییر پوسته',
  },

  // ── Validation / Errors ─────────────────────────
  validation: {
    required: 'این فیلد الزامی است',
    invalidEmail: 'آدرس ایمیل معتبر نیست',
    minLength: (min: number) => `حداقل ${min} کاراکتر وارد کنید`,
    maxLength: (max: number) => `حداکثر ${max} کاراکتر مجاز است`,
    minValue: (min: number) => `مقدار باید حداقل ${min} باشد`,
    positiveNumber: 'مقدار باید عدد مثبت باشد',
    invalidAmount: 'مبلغ وارد شده معتبر نیست',
    passwordMismatch: 'رمز عبور و تکرار آن یکسان نیست',
    duplicateCode: 'این کد قبلاً استفاده شده است',
    unbalancedEntry: 'جمع بدهکار و بستانکار باید برابر باشد',
  },

  // ── Messages ────────────────────────────────────
  messages: {
    saveSuccess: 'تغییرات با موفقیت ذخیره شد',
    deleteSuccess: 'حذف با موفقیت انجام شد',
    deleteConfirm: 'آیا از حذف این مورد اطمینان دارید؟',
    deleteWarning: 'این عملیات قابل بازگشت نیست.',
    networkError: 'خطا در برقراری ارتباط با سرور',
    unexpectedError: 'خطای غیرمنتظره‌ای رخ داد',
    sessionExpired: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.',
    noPermission: 'شما مجوز دسترسی به این بخش را ندارید',
    comingSoon: 'این بخش به‌زودی فعال خواهد شد',
  },
} as const;

export type TranslationKey = keyof typeof fa;
export type Translations = typeof fa;

/**
 * Get a translation namespace.
 * Usage: `t('nav').dashboard` → 'داشبورد'
 */
export function t<K extends TranslationKey>(namespace: K): Translations[K] {
  return fa[namespace];
}

export default fa;
