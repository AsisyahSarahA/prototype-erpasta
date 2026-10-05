document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic (SPA) - Works for Sidebar Items & Cards
    const navTriggers = document.querySelectorAll('[data-target]');
    const views = document.querySelectorAll('.view-section');
    const breadcrumbTitle = document.getElementById('current-view-title');

    navTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            // Prevent default only if it's an anchor tag
            if (trigger.tagName === 'A') {
                e.preventDefault();
            }
            
            // 1. Sembunyikan semua kontainer (display: none via class active)
            views.forEach(view => view.classList.remove('active'));
            
            // Remove active class from all sidebar links specifically
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            
            // 2. Tampilkan kontainer yang dituju (display: block via class active)
            const targetId = trigger.getAttribute('data-target');
            const targetView = document.getElementById(targetId);
            if(targetView) {
                targetView.classList.add('active');
            }

            // 3. Highlight sidebar menu & Update Breadcrumb
            // Jika yang diklik adalah card, cari menu sidebar yang sesuai dengan targetId
            const correspondingNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
            if (correspondingNav) {
                correspondingNav.classList.add('active');
                if (breadcrumbTitle) {
                    breadcrumbTitle.textContent = correspondingNav.querySelector('span').textContent;
                }
            }
        });
    });

    // Check hash on load
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash) window.switchMarketingPage(hash);
    }

    // Chart.js - Performance Tracker (Analytics Page)
    const ctxPerf = document.getElementById('performanceChart');
    if (ctxPerf) {
        new Chart(ctxPerf, {
            type: 'line',
            data: {
                labels: ['1 Oct', '5 Oct', '10 Oct', '15 Oct', '20 Oct', '25 Oct', '30 Oct'],
                datasets: [
                    {
                        label: 'Instagram Reach',
                        data: [12000, 15000, 14500, 22000, 21000, 25000, 28000],
                        borderColor: '#e11d48', // Pink/Red
                        backgroundColor: 'rgba(225, 29, 72, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'TikTok Views',
                        data: [8000, 12000, 11000, 19000, 18500, 26000, 31000],
                        borderColor: '#0f172a', // Dark
                        backgroundColor: 'rgba(15, 23, 42, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Blog Visitors',
                        data: [3000, 3200, 3100, 3800, 3700, 4200, 4500],
                        borderColor: '#2563eb', // Blue
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { family: 'Inter', size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        titleFont: { family: 'Inter', size: 13 },
                        bodyFont: { family: 'Inter', size: 12 },
                        padding: 10,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { borderDash: [4, 4], color: '#e5e7eb' },
                        ticks: { font: { family: 'Inter', size: 11 }, color: '#6b7280' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: 'Inter', size: 11 }, color: '#6b7280' }
                    }
                }
            }
        });
    }
});

// Expose switchMarketingPage globally for sidebar.js integration
window.switchMarketingPage = function(subpage) {
    const views = document.querySelectorAll('.view-section');
    views.forEach(view => view.classList.remove('active'));
    
    const targetId = 'view-' + subpage;
    const targetView = document.getElementById(targetId);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    const breadcrumbTitle = document.getElementById('current-view-title');
    if (breadcrumbTitle) {
        const btn = document.querySelector(`.nav-sub-btn[data-marketing-sub="${subpage}"] span:not(.nav-sub-dot)`);
        if (btn) {
            breadcrumbTitle.textContent = btn.textContent;
        }
    }
};
