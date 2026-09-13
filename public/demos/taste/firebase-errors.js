/**
 * ترجمة أكواد أخطاء Firebase إلى رسائل عربية واضحة للمستخدم.
 */

const AUTH_ERROR_MESSAGES = {
    "auth/invalid-email": "يرجى إدخال بريد إلكتروني صحيح.",
    "auth/user-disabled": "تم تعطيل هذا الحساب. تواصل مع مدير النظام.",
    "auth/user-not-found": "لا يوجد حساب مسجّل بهذا البريد الإلكتروني.",
    "auth/wrong-password": "كلمة المرور غير صحيحة. حاول مجدداً.",
    "auth/invalid-credential": "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "auth/too-many-requests": "محاولات فاشلة كثيرة. انتظر قليلاً ثم حاول مجدداً.",
    "auth/network-request-failed": "خطأ بالشبكة. تحقق من اتصالك وحاول مجدداً.",
    "auth/operation-not-allowed": "تسجيل الدخول بالبريد وكلمة المرور غير مفعّل في Firebase Console.",
    "auth/missing-email": "يرجى إدخال البريد الإلكتروني أولاً."
};

export function getAuthErrorMessage(error) {
    if (!error) return "حدث خطأ غير معروف.";
    if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
        return AUTH_ERROR_MESSAGES[error.code];
    }
    return error.message || "فشل تسجيل الدخول. حاول مجدداً.";
}

export function getFirestoreErrorMessage(error) {
    if (!error) return "حدث خطأ في قاعدة البيانات.";
    if (error.code === "permission-denied") {
        return (
            "صلاحيات Firestore غير كافية. تأكد من:\n" +
            "1) نشر قواعد firestore.rules من Firebase Console\n" +
            "2) إنشاء مستند users/{uid} يحتوي role و restaurantId\n" +
            "3) أن restaurantId يطابق مطعمك (مثال: taste)"
        );
    }
    return error.message || "فشل الاتصال بقاعدة البيانات.";
}

export function getPublicOrderErrorMessage(error) {
    if (!error) return "تعذّر إرسال الطلب. حاول مجدداً.";
    if (error.code === "permission-denied") {
        return "تعذّر إرسال الطلب حالياً. تواصل مع إدارة المطعم.";
    }
    if (error.code === "unavailable" || error.code === "network-request-failed") {
        return "تعذّر إرسال الطلب. تحقق من اتصالك وحاول مجدداً.";
    }
    return "تعذّر إرسال الطلب. حاول مجدداً.";
}

export function formatAppError(error) {
    if (!error) return "حدث خطأ غير معروف.";
    if (error.code === "permission-denied") {
        return getFirestoreErrorMessage(error);
    }
    return error.message || getFirestoreErrorMessage(error);
}
