function togglePasswordVisibility() {
  const passwordInput = document.getElementById('loginPassword');
  const eyeIcon = document.getElementById('eyeIcon');
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.className = 'fa-regular fa-eye-slash';
  } else {
    passwordInput.type = 'password';
    eyeIcon.className = 'fa-regular fa-eye';
  }
}

function quickFillCredentials() {
  document.getElementById('loginEmail').value = 'admin@astacode.com';
  document.getElementById('loginPassword').value = 'password';
  showAlert('Kredensial prototype telah diisi otomatis. Klik tombol Masuk!', 'success');
}

function handleForgotPassword() {
  showAlert('Fitur reset password prototype: Masukkan password apa saja untuk login demo.', 'success');
}

function showAlert(msg, type = 'danger') {
  const alertBox = document.getElementById('authAlert');
  const alertMsg = document.getElementById('authAlertMsg');
  const alertIcon = document.getElementById('authAlertIcon');
  if (!alertBox) return;
  alertBox.className = 'auth-alert ' + type + ' show';
  alertMsg.textContent = msg;
  if (type === 'danger') {
    alertIcon.className = 'fa-solid fa-circle-exclamation';
  } else {
    alertIcon.className = 'fa-solid fa-circle-check';
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const submitBtn = document.getElementById('submitBtn');

  // Prototype simple credential check
  const validEmail = 'admin@astacode.com';
  const validPassword = 'password';

  if (email !== validEmail || password !== validPassword) {
    showAlert('Email atau kata sandi salah. Gunakan admin@astacode.com / password', 'danger');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Masuk ke Dashboard</span><i class="fa-solid fa-arrow-right"></i>';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Memverifikasi...</span>';

  setTimeout(() => {
    window.AstaAuth.setUser({
      email: email,
      role: 'Administrator'
    });

    showAlert('Autentikasi berhasil! Mengalihkan ke Dashboard...', 'success');

    const redirectTarget = sessionStorage.getItem('asta_auth_redirect') || 'index.html#dashboard';
    sessionStorage.removeItem('asta_auth_redirect');

    setTimeout(() => {
      window.location.replace(redirectTarget);
    }, 450);
  }, 450);
}
