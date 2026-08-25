document.addEventListener('DOMContentLoaded', function() {
    // 1. Add hamburger button to header-brand if it doesn't exist
    const headerBrand = document.querySelector('.header-brand');
    if (headerBrand && !document.getElementById('hamburgerBtn')) {
        const hamburgerBtn = document.createElement('button');
        hamburgerBtn.className = 'hamburger-btn';
        hamburgerBtn.id = 'hamburgerBtn';
        hamburgerBtn.setAttribute('aria-label', 'Open Menu');
        hamburgerBtn.setAttribute('type', 'button');
        hamburgerBtn.innerHTML = '<span></span><span></span><span></span>';
        
        // Insert it as the first element in header-brand
        headerBrand.insertBefore(hamburgerBtn, headerBrand.firstChild);
    }

    // 2. Create the navigation drawer markup if it doesn't exist
    if (!document.getElementById('sideDrawer')) {
        // Drawer container
        const drawer = document.createElement('div');
        drawer.className = 'side-drawer';
        drawer.id = 'sideDrawer';
        
        // Drawer Header
        const drawerHeader = document.createElement('div');
        drawerHeader.className = 'drawer-header';
        drawerHeader.innerHTML = `
            <h3>CE Study Portal</h3>
            <button class="drawer-close-btn" id="closeDrawer" type="button">&times;</button>
        `;
        drawer.appendChild(drawerHeader);
        
        // Drawer Navigation Links
        const drawerNav = document.createElement('nav');
        drawerNav.className = 'drawer-nav';
        
        // Determine active link based on current page filename
        const pathSegments = window.location.pathname.split('/');
        const currentPage = pathSegments[pathSegments.length - 1] || 'index.html';
        
        const links = [
            { text: 'Home Page', href: './index.html', page: 'index.html' },
            { text: 'Dashboard Hub 📊', href: './dashboard.html', page: 'dashboard.html', highlight: true },
            { type: 'divider' },
            { type: 'header', text: 'Degree (CE)' },
            { text: '1st Semester', href: './sem1.html', page: 'sem1.html' },
            { text: '3rd Semester', href: './sem3.html', page: 'sem3.html' },
            { text: '5th Semester', href: './sem5.html', page: 'sem5.html' },
            { text: '7th Semester', href: './sem7.html', page: 'sem7.html' },
            { type: 'divider' },
            { type: 'header', text: 'Diploma (CE)' },
            { text: '1st Semester', href: './sem1dip.html', page: 'sem1dip.html' },
            { text: '3rd Semester', href: './sem3dip.html', page: 'sem3dip.html' },
            { text: '5th Semester', href: './sem5dip.html', page: 'sem5dip.html' }
        ];
        
        links.forEach(item => {
            if (item.type === 'divider') {
                const hr = document.createElement('hr');
                drawerNav.appendChild(hr);
            } else if (item.type === 'header') {
                const h4 = document.createElement('h4');
                h4.textContent = item.text;
                drawerNav.appendChild(h4);
            } else {
                const a = document.createElement('a');
                a.href = item.href;
                a.textContent = item.text;
                
                // Check if current page matches item page
                if (currentPage === item.page) {
                    a.classList.add('active');
                }
                if (item.highlight) {
                    a.style.borderLeftColor = '#f7c948';
                    a.style.fontWeight = '800';
                    a.style.background = 'rgba(247, 201, 72, 0.15)';
                }
                drawerNav.appendChild(a);
            }
        });
        
        drawer.appendChild(drawerNav);
        document.body.appendChild(drawer);
        
        // Drawer Overlay
        const overlay = document.createElement('div');
        overlay.className = 'drawer-overlay';
        overlay.id = 'drawerOverlay';
        document.body.appendChild(overlay);
    }

    // 3. Set up event listeners for opening and closing the drawer
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sideDrawer = document.getElementById('sideDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const closeDrawer = document.getElementById('closeDrawer');

    function toggleDrawer() {
        hamburgerBtn.classList.toggle('open');
        sideDrawer.classList.toggle('open');
        drawerOverlay.classList.toggle('open');
    }

    if (hamburgerBtn && sideDrawer && drawerOverlay) {
        hamburgerBtn.addEventListener('click', toggleDrawer);
        drawerOverlay.addEventListener('click', toggleDrawer);
        if (closeDrawer) {
            closeDrawer.addEventListener('click', toggleDrawer);
        }
    }
});
