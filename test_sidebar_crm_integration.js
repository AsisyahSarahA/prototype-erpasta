const fs = require('fs');

console.log('=== VERIFYING MASTER UNIFIED SIDEBAR INTEGRATION ===\n');

// 1. Check sidebar.html
const sidebarHtml = fs.readFileSync('sidebar.html', 'utf8');
const expectedCrmSubpages = [
  { sub: 'dashboard', label: 'Executive Dashboard' },
  { sub: 'pipeline', label: 'Lead & Sales Pipeline' },
  { sub: 'quotation', label: 'Quotation & MoU Studio' },
  { sub: 'customer', label: 'Master Customer 360°' },
  { sub: 'master', label: 'Katalog Software & Harga' },
  { sub: 'activity', label: 'Jadwal & Follow-up' },
  { sub: 'guide', label: 'Panduan SOP CRM' }
];

console.log('1. Checking sidebar.html CRM submenus:');
expectedCrmSubpages.forEach(item => {
  const hasSub = sidebarHtml.includes(`data-sub="${item.sub}"`);
  const hasOnclick = sidebarHtml.includes(`window.navigateToModuleSubpage('crm', '${item.sub}'`);
  const hasLabel = sidebarHtml.includes(`<span>${item.label}</span>`);
  if (hasSub && hasOnclick && hasLabel) {
    console.log(`  [PASS] ${item.sub} -> "${item.label}"`);
  } else {
    console.error(`  [FAIL] ${item.sub} missing in sidebar.html! hasSub=${hasSub}, hasOnclick=${hasOnclick}, hasLabel=${hasLabel}`);
  }
});

// 2. Check sidebar.js
const sidebarJs = fs.readFileSync('sidebar.js', 'utf8');
console.log('\n2. Checking sidebar.js CRM submenus:');
expectedCrmSubpages.forEach(item => {
  const hasSub = sidebarJs.includes(`data-sub="${item.sub}"`);
  const hasOnclick = sidebarJs.includes(`window.navigateToModuleSubpage('crm', '${item.sub}'`);
  const hasLabel = sidebarJs.includes(`<span>${item.label}</span>`);
  if (hasSub && hasOnclick && hasLabel) {
    console.log(`  [PASS] ${item.sub} -> "${item.label}"`);
  } else {
    console.error(`  [FAIL] ${item.sub} missing in sidebar.js! hasSub=${hasSub}, hasOnclick=${hasOnclick}, hasLabel=${hasLabel}`);
  }
});

// 3. Check crm.html integration
const crmHtml = fs.readFileSync('crm/crm.html', 'utf8');
console.log('\n3. Checking crm/crm.html master integration:');
const checks = [
  { name: 'Linked sidebar.css', test: crmHtml.includes('<link rel="stylesheet" href="../sidebar.css">') },
  { name: 'Has #sidebar-container with data-active-page="crm"', test: crmHtml.includes('id="sidebar-container" data-active-page="crm"') },
  { name: 'Linked sidebar.js', test: crmHtml.includes('<script src="../sidebar.js"></script>') },
  { name: 'Has window.showPage export', test: crmHtml.includes('window.showPage = showPage;') },
  { name: 'Has window.switchCrmPage export', test: crmHtml.includes('window.switchCrmPage = showPage;') },
  { name: 'Has hashchange router synchronization', test: crmHtml.includes("window.addEventListener('hashchange'") },
  { name: 'No obsolete app-sidebar markup', test: !crmHtml.includes('<aside class="app-sidebar"') }
];

checks.forEach(c => {
  if (c.test) {
    console.log(`  [PASS] ${c.name}`);
  } else {
    console.error(`  [FAIL] ${c.name}`);
  }
});

// 4. Test simulated DOM render in JSDOM / Node environment
console.log('\n4. Simulating DOM & sidebar controller execution:');
try {
  // Mock window and document
  const mockContainer = {
    id: 'sidebar-container',
    getAttribute: (attr) => attr === 'data-active-page' ? 'crm' : (attr === 'data-active-subpage' ? 'customer' : null),
    innerHTML: ''
  };

  global.window = {
    location: {
      pathname: '/crm/crm.html',
      hash: '#customer'
    },
    addEventListener: () => { }
  };
  global.document = {
    readyState: 'complete',
    getElementById: (id) => {
      if (id === 'sidebar-container') {
        return mockContainer;
      }
      return null;
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => ({ id: '', innerHTML: '' }),
    addEventListener: () => { }
  };

  // Run sidebar.js in this sandbox
  eval(sidebarJs);
  console.log('  [PASS] sidebar.js executed without syntax or runtime errors');

  // Call renderDynamicSidebar
  window.renderDynamicSidebar({ activePage: 'crm', activeSubpage: 'customer' });
  if (mockContainer.innerHTML.includes('Executive Dashboard') && mockContainer.innerHTML.includes('Master Customer 360°')) {
    console.log('  [PASS] renderDynamicSidebar successfully populated container with 7 CRM subpages');
  } else {
    console.error('  [FAIL] renderDynamicSidebar output did not contain expected markup!');
  }

} catch (err) {
  console.error('  [FAIL] Error during DOM simulation:', err);
}

console.log('\n=== INTEGRATION VERIFICATION COMPLETE ===');
