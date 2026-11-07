/**
 * swal.js — Utilitas Terpusat SweetAlert2 (CDN) untuk Modul Management Proyek (MP)
 * Menggunakan global `window.Swal` dari CDN SweetAlert2 v11 dengan kustomisasi tema ASTACODE ERP.
 */

function getSwal() {
  if (typeof window !== 'undefined' && window.Swal) {
    return window.Swal;
  }
  return null;
}

const BASE_CONFIG = {
  customClass: {
    container: 'astacode-swal-container',
    popup: 'astacode-swal-popup',
    title: 'astacode-swal-title',
    htmlContainer: 'astacode-swal-html',
    confirmButton: 'astacode-swal-confirm',
    cancelButton: 'astacode-swal-cancel'
  },
  buttonsStyling: true,
  reverseButtons: true
};

/**
 * Menampilkan dialog validasi peringatan (Warning) menggunakan SweetAlert2
 */
export function swalValidation(title, htmlMessage) {
  const Swal = getSwal();
  if (!Swal) {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`${title}\n\n${String(htmlMessage || '').replace(/<[^>]+>/g, '')}`);
    }
    return Promise.resolve({ isConfirmed: true });
  }
  return Swal.fire({
    ...BASE_CONFIG,
    icon: 'warning',
    title: title || 'Validasi Diperlukan',
    html: htmlMessage || '',
    confirmButtonText: 'Mengerti',
    confirmButtonColor: '#4f46e5'
  });
}

/**
 * Menampilkan dialog kesalahan (Error) menggunakan SweetAlert2
 */
export function swalError(title, htmlMessage) {
  const Swal = getSwal();
  if (!Swal) {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`${title}\n\n${String(htmlMessage || '').replace(/<[^>]+>/g, '')}`);
    }
    return Promise.resolve({ isConfirmed: true });
  }
  return Swal.fire({
    ...BASE_CONFIG,
    icon: 'error',
    title: title || 'Terjadi Kesalahan',
    html: htmlMessage || '',
    confirmButtonText: 'Tutup',
    confirmButtonColor: '#dc2626'
  });
}

/**
 * Menampilkan dialog sukses (Success) menggunakan SweetAlert2
 */
export function swalSuccess(title, htmlMessage = '', timer = 2000) {
  const Swal = getSwal();
  if (!Swal) {
    return Promise.resolve({ isConfirmed: true });
  }
  return Swal.fire({
    ...BASE_CONFIG,
    icon: 'success',
    title: title || 'Berhasil',
    html: htmlMessage,
    timer: timer || undefined,
    timerProgressBar: Boolean(timer),
    showConfirmButton: !timer,
    confirmButtonText: 'OK',
    confirmButtonColor: '#10b981'
  });
}

/**
 * Menampilkan dialog informasi (Info) menggunakan SweetAlert2
 */
export function swalInfo(title, htmlMessage = '') {
  const Swal = getSwal();
  if (!Swal) {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`${title}\n\n${String(htmlMessage || '').replace(/<[^>]+>/g, '')}`);
    }
    return Promise.resolve({ isConfirmed: true });
  }
  return Swal.fire({
    ...BASE_CONFIG,
    icon: 'info',
    title: title || 'Informasi',
    html: htmlMessage,
    confirmButtonText: 'OK',
    confirmButtonColor: '#4f46e5'
  });
}

/**
 * Menampilkan dialog konfirmasi Ya / Batal menggunakan SweetAlert2
 * @returns {Promise<boolean>} true jika pengguna menekan tombol konfirmasi
 */
export async function swalConfirm({
  title = 'Konfirmasi Tindakan',
  html = '',
  text = '',
  icon = 'question',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  confirmColor = '#4f46e5',
  cancelColor = '#64748b'
} = {}) {
  const Swal = getSwal();
  if (!Swal) {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      return window.confirm(`${title}\n\n${text || String(html).replace(/<[^>]+>/g, '')}`);
    }
    return true;
  }
  const result = await Swal.fire({
    ...BASE_CONFIG,
    icon,
    title,
    ...(html ? { html } : { text }),
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: confirmColor,
    cancelButtonColor: cancelColor
  });
  return Boolean(result.isConfirmed);
}

/**
 * Menampilkan dialog input teks menggunakan SweetAlert2
 * @returns {Promise<string|null>} nilai input jika dikonfirmasi, atau null jika dibatalkan
 */
export async function swalPrompt({
  title = 'Masukkan Data',
  html = '',
  text = '',
  inputPlaceholder = '',
  inputValue = '',
  confirmText = 'Simpan',
  cancelText = 'Batal',
  required = true,
  requiredMessage = 'Kolom input tidak boleh kosong!'
} = {}) {
  const Swal = getSwal();
  if (!Swal) {
    if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
      return window.prompt(title, inputValue);
    }
    return null;
  }
  const result = await Swal.fire({
    ...BASE_CONFIG,
    title,
    ...(html ? { html } : text ? { text } : {}),
    input: 'text',
    inputValue,
    inputPlaceholder,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#64748b',
    inputValidator: (value) => {
      if (required && (!value || !value.trim())) {
        return requiredMessage;
      }
      return null;
    }
  });
  if (result.isConfirmed) {
    return (result.value || '').trim();
  }
  return null;
}

if (typeof window !== 'undefined') {
  window.astaSwal = {
    validation: swalValidation,
    error: swalError,
    success: swalSuccess,
    info: swalInfo,
    confirm: swalConfirm,
    prompt: swalPrompt
  };
}

