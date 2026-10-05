/* =====================================================
   Astacode ERP Finance — Main JavaScript
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. ACCORDION SIDEBAR NAVIGATION
    // =========================================================
    document.querySelectorAll('.nav-select-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const group = trigger.closest('.nav-select-group');
            const items = group.querySelector('.nav-select-items');
            const isOpen = items.classList.contains('open');

            // Close all
            document.querySelectorAll('.nav-select-items').forEach(i => i.classList.remove('open'));
            document.querySelectorAll('.nav-select-trigger').forEach(t => t.classList.remove('open'));

            // Toggle current
            if (!isOpen) {
                items.classList.add('open');
                trigger.classList.add('open');
            }
        });
    });

    // Auto-open the section that has an active link
    const activeItem = document.querySelector('.nav-select-item.active');
    if (activeItem) {
        const items = activeItem.closest('.nav-select-items');
        const trigger = items ? items.previousElementSibling : null;
        if (items) items.classList.add('open');
        if (trigger) trigger.classList.add('open');
    }

    // =========================================================
    // 2. EXPENSE FORM: TOGGLE PROJECT DROPDOWN
    // =========================================================
    const projectToggle = document.getElementById('projectToggle');
    const projectDropdown = document.getElementById('projectDropdown');

    if (projectToggle && projectDropdown) {
        // Initial state (checked = show dropdown)
        projectDropdown.style.display = projectToggle.checked ? 'flex' : 'none';

        projectToggle.addEventListener('change', () => {
            if (projectToggle.checked) {
                projectDropdown.style.display = 'flex';
                projectDropdown.style.animation = 'fadeInUp 0.2s ease';
            } else {
                projectDropdown.style.display = 'none';
            }
        });
    }

    // =========================================================
    // 3. KPI CARDS — COUNT-UP ANIMATION
    // =========================================================
    const animateValue = (el, start, end, duration) => {
        let startTime = null;
        const isCurrency = el.dataset.currency === 'true';
        const prefix = el.dataset.prefix || '';

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            const value = Math.floor(eased * (end - start) + start);

            if (isCurrency) {
                el.textContent = prefix + 'Rp ' + value.toLocaleString('id-ID');
            } else {
                el.textContent = prefix + value.toLocaleString('id-ID');
            }

            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count);
        animateValue(el, 0, target, 1200);
    });

    // =========================================================
    // 4. TOAST NOTIFICATION
    // =========================================================
    window.showToast = (message, type = 'success', duration = 3000) => {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const color = type === 'success' ? '#10b981' : '#ef4444';

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${icon}" style="color:${color}; font-size:16px;"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // =========================================================
    // 5. ACTION BUTTONS — DEMO INTERACTIONS
    // =========================================================

    // "Ingatkan Klien" buttons
    document.querySelectorAll('[data-action="remind"]').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.innerHTML = '<i class="fas fa-check"></i> Terkirim!';
            btn.style.background = '#10b981';
            btn.disabled = true;
            showToast('Pengingat berhasil dikirim ke klien via Email.', 'success');
        });
    });

    // "Tandai Lunas" buttons
    document.querySelectorAll('[data-action="mark-paid"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('.recon-row');
            if (row) {
                row.style.opacity = '0.5';
                row.style.transition = 'opacity 0.4s ease';
            }
            showToast('Invoice berhasil ditandai Lunas & saldo bank diperbarui.', 'success');
        });
    });

    // "Submit Klaim" button
    const submitKlaim = document.getElementById('submitKlaim');
    if (submitKlaim) {
        submitKlaim.addEventListener('click', () => {
            showToast('Klaim pengeluaran berhasil diajukan dan menunggu approval.', 'success');
        });
    }

    // "Konfirmasi Match" buttons
    document.querySelectorAll('[data-action="confirm-match"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('.recon-row');
            if (row) {
                row.style.opacity = '0';
                row.style.transition = 'opacity 0.4s ease';
                setTimeout(() => row.style.display = 'none', 400);
            }
            showToast('Transaksi berhasil dicocokkan dan dicatat di jurnal.', 'success');
        });
    });

    // =========================================================
    // 6. TABLE ROW HOVER HIGHLIGHT
    // =========================================================
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
        row.style.cursor = 'pointer';
    });

    // =========================================================
    // 7. UPLOAD ZONE — Drag & Drop Visual Feedback
    // =========================================================
    const uploadZone = document.querySelector('.upload-zone');
    if (uploadZone) {
        ['dragenter', 'dragover'].forEach(event => {
            uploadZone.addEventListener(event, (e) => {
                e.preventDefault();
                uploadZone.style.borderColor = '#2563eb';
                uploadZone.style.background = '#eff6ff';
            });
        });
        ['dragleave', 'drop'].forEach(event => {
            uploadZone.addEventListener(event, (e) => {
                e.preventDefault();
                uploadZone.style.borderColor = '';
                uploadZone.style.background = '';
            });
        });
        uploadZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                uploadZone.innerHTML = `
                    <i class="fas fa-file-image" style="font-size:40px; color:#2563eb;"></i>
                    <p style="color:#1e40af; font-weight:600;">${files[0].name}</p>
                    <small style="color:#64748b;">File siap diproses</small>
                `;
                showToast('File struk berhasil diupload!', 'success');
            }
        });
    }

    // =========================================================
    // 8. FADE-IN ANIMATION on load
    // =========================================================
    document.querySelectorAll('.fade-in').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        setTimeout(() => {
            el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, i * 60);
    });

});
