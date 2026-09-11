/**
 * Universal Document Previewer & Search Script for CE Web
 * Handles previewing .docx, .pdf, images, web links, and Google Drive links directly on page.
 * Provides direct open and download options for all file types.
 */

(function () {
    'use strict';

    // Global Search Function for all Semester & Master pages
    window.filterSubjectRows = function () {
        var searchInput = document.getElementById('subjectSearchInput');
        if (!searchInput) return;
        var q = searchInput.value.trim().toLowerCase();

        // Target all possible subject card layouts across degree, diploma & master pages
        var cards = document.querySelectorAll(
            '.sem3dip-subject-card, .subj-list-card, .subject-card, .sem-subject-card'
        );

        var visible = 0;
        cards.forEach(function (card) {
            var text = card.textContent.toLowerCase();
            var codeAttr = (card.getAttribute('data-subject-code') || '').toLowerCase();
            var nameAttr = (card.getAttribute('data-subject-name') || '').toLowerCase();

            var match = !q || text.includes(q) || codeAttr.includes(q) || nameAttr.includes(q);

            if (match) {
                card.style.display = '';
                card.classList.remove('subj-hidden');
                visible++;
            } else {
                card.style.display = 'none';
                card.classList.add('subj-hidden');
            }
        });

        // Handle no result message
        var noResultMsg = document.getElementById('sem3dipNoResult') || document.querySelector('.home-no-result');
        if (noResultMsg && cards.length > 0) {
            if (visible === 0 && q !== '') {
                noResultMsg.style.display = 'block';
            } else {
                noResultMsg.style.display = 'none';
            }
        }
    };

    // Initialize Modal and Global Events when DOM is ready
    document.addEventListener('DOMContentLoaded', function () {
        initDocumentViewerModal();
        attachEventListeners();
        setupSearchInput();
    });

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initDocumentViewerModal();
        attachEventListeners();
        setupSearchInput();
    }

    function setupSearchInput() {
        var searchInput = document.getElementById('subjectSearchInput');
        if (searchInput && !searchInput.dataset.listenerAttached) {
            searchInput.dataset.listenerAttached = 'true';
            searchInput.addEventListener('input', function () {
                window.filterSubjectRows();
            });
            searchInput.addEventListener('keyup', function (e) {
                if (e.key === 'Enter') {
                    window.filterSubjectRows();
                }
            });
        }
    }

    function initDocumentViewerModal() {
        if (document.getElementById('docViewerModal')) return;

        var modalHtml = `
        <div id="docViewerModal" class="doc-modal-overlay" aria-hidden="true" role="dialog">
            <div class="doc-modal-container">
                <div class="doc-modal-header">
                    <div class="doc-modal-title-group">
                        <div class="doc-modal-icon-badge" id="docModalIconBadge">
                            <i class="fa-solid fa-file-lines"></i>
                        </div>
                        <div>
                            <h3 class="doc-modal-title" id="docModalTitle">Document Preview</h3>
                            <span class="doc-modal-subtitle" id="docModalSubtitle">Material Viewer</span>
                        </div>
                    </div>
                    <div class="doc-modal-actions">
                        <a href="#" id="docModalOpenDirectBtn" class="doc-modal-action-btn doc-modal-btn-direct" target="_blank" rel="noopener noreferrer" title="Open Direct in New Tab">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            <span>Open Direct</span>
                        </a>
                        <a href="#" id="docModalDownloadBtn" class="doc-modal-action-btn doc-modal-btn-download" download title="Download File">
                            <i class="fa-solid fa-download"></i>
                            <span>Download</span>
                        </a>
                        <button id="docModalFullscreenBtn" class="doc-modal-action-btn doc-modal-btn-icon" title="Toggle Fullscreen">
                            <i class="fa-solid fa-expand"></i>
                        </button>
                        <button id="docModalCloseBtn" class="doc-modal-action-btn doc-modal-btn-icon doc-modal-btn-close" title="Close Preview">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
                <div class="doc-modal-body" id="docModalBody">
                    <div class="doc-modal-loader" id="docModalLoader">
                        <div class="doc-spinner"></div>
                        <p>Loading document content...</p>
                    </div>
                    <div class="doc-modal-content" id="docModalContent"></div>
                </div>
            </div>
        </div>
        <div id="docToastContainer" class="doc-toast-container"></div>
        `;

        var wrapper = document.createElement('div');
        wrapper.innerHTML = modalHtml;
        document.body.appendChild(wrapper.firstElementChild);
        document.body.appendChild(wrapper.lastElementChild);

        // Bind Modal Event Listeners
        var modal = document.getElementById('docViewerModal');
        var closeBtn = document.getElementById('docModalCloseBtn');
        var fullscreenBtn = document.getElementById('docModalFullscreenBtn');

        if (closeBtn) closeBtn.addEventListener('click', closeDocumentViewer);

        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeDocumentViewer();
                }
            });
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', function () {
                var container = modal.querySelector('.doc-modal-container');
                container.classList.toggle('is-fullscreen');
                var icon = fullscreenBtn.querySelector('i');
                if (container.classList.contains('is-fullscreen')) {
                    icon.className = 'fa-solid fa-compress';
                } else {
                    icon.className = 'fa-solid fa-expand';
                }
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                closeDocumentViewer();
            }
        });
    }

    function attachEventListeners() {
        // Intercept clicks on View buttons
        document.addEventListener('click', function (e) {
            var viewBtn = e.target.closest('.sem3dip-view-btn, .view-btn, [data-action="view"]');
            if (viewBtn) {
                e.preventDefault();
                e.stopPropagation();

                var href = viewBtn.getAttribute('href') || viewBtn.getAttribute('data-url') || '';
                href = href.trim();

                // Get document title from file item parent if available
                var fileItem = viewBtn.closest('.sem3dip-file-item, .file-item');
                var titleText = 'Document Preview';

                if (fileItem) {
                    var span = fileItem.querySelector('span');
                    if (span) {
                        titleText = span.textContent.replace(/^\s*\S+\s*/, '').trim() || titleText;
                    }
                }

                if (!href || href === '#' || href === 'javascript:void(0)') {
                    showToast('No material file uploaded yet for this item. Please check back later.', 'info');
                    return;
                }

                openDocumentViewer(href, titleText);
                return;
            }

            // Intercept clicks on Download buttons to show toast if empty
            var downloadBtn = e.target.closest('.sem3dip-download-btn, .download-btn, [data-action="download"]');
            if (downloadBtn) {
                var dHref = downloadBtn.getAttribute('href') || '';
                dHref = dHref.trim();
                if (!dHref || dHref === '#' || dHref === 'javascript:void(0)') {
                    e.preventDefault();
                    showToast('No material file uploaded yet for this item to download.', 'info');
                }
            }
        });
    }

    function openDocumentViewer(url, title) {
        var modal = document.getElementById('docViewerModal');
        var modalTitle = document.getElementById('docModalTitle');
        var modalSubtitle = document.getElementById('docModalSubtitle');
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');
        var downloadBtn = document.getElementById('docModalDownloadBtn');
        var openDirectBtn = document.getElementById('docModalOpenDirectBtn');
        var iconBadge = document.getElementById('docModalIconBadge');

        modalTitle.textContent = title || 'Document Preview';
        modalSubtitle.textContent = getFileName(url);

        if (downloadBtn) downloadBtn.setAttribute('href', url);
        if (openDirectBtn) openDirectBtn.setAttribute('href', url);

        modalContent.innerHTML = '';
        modalLoader.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        var ext = getFileExtension(url);
        updateIconBadge(iconBadge, ext);

        // Process file type
        if (ext === 'docx' || ext === 'doc') {
            loadDocxDocument(url);
        } else if (ext === 'pdf') {
            loadPdfDocument(url);
        } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].indexOf(ext) !== -1) {
            loadImageDocument(url);
        } else if (isWebUrl(url)) {
            loadWebPageDocument(url);
        } else {
            // Fallback for other file types (zip, txt, etc.)
            loadGenericDocument(url);
        }
    }

    function closeDocumentViewer() {
        var modal = document.getElementById('docViewerModal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        var modalContent = document.getElementById('docModalContent');
        if (modalContent) modalContent.innerHTML = '';
    }

    function loadDocxDocument(url) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');

        if (typeof mammoth === 'undefined') {
            renderDocxFallback(url, 'Mammoth.js parsing library is unavailable.');
            return;
        }

        fetch(url)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP status ' + response.status);
                }
                return response.arrayBuffer();
            })
            .then(function (arrayBuffer) {
                return mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
            })
            .then(function (result) {
                modalLoader.style.display = 'none';
                var html = result.value;

                if (!html || !html.trim()) {
                    html = '<p><em>The document is empty or text formatting could not be extracted.</em></p>';
                }

                modalContent.innerHTML = `
                    <div style="width: 100%; display: flex; flex-direction: column; align-items: center; gap: 16px;">
                        <div class="doc-pdf-toolbar">
                            <span class="doc-pdf-info"><i class="fa-solid fa-file-word"></i> Word Document (.docx) Preview</span>
                            <div class="doc-pdf-actions">
                                <a href="${url}" target="_blank" rel="noopener noreferrer" class="doc-btn-sm doc-btn-direct">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Direct
                                </a>
                                <a href="${url}" download class="doc-btn-sm doc-btn-dl">
                                    <i class="fa-solid fa-download"></i> Download File
                                </a>
                            </div>
                        </div>
                        <div class="docx-rendered-container">${html}</div>
                    </div>
                `;
            })
            .catch(function (err) {
                console.warn('DOCX arrayBuffer fetch error:', err);
                renderDocxFallback(url, 'Direct local in-modal parsing restricted by browser security. Click below to open directly or download.');
            });
    }

    function renderDocxFallback(url, message) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');
        if (modalLoader) modalLoader.style.display = 'none';

        modalContent.innerHTML = `
            <div class="doc-fallback-card">
                <div class="doc-fallback-icon"><i class="fa-solid fa-file-word"></i></div>
                <h4>Word Document (.docx)</h4>
                <p class="doc-fallback-msg">${message}</p>
                <div class="doc-fallback-actions">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="doc-btn doc-btn-primary">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Direct in New Tab
                    </a>
                    <a href="${url}" download class="doc-btn doc-btn-outline">
                        <i class="fa-solid fa-download"></i> Download File
                    </a>
                </div>
            </div>
        `;
    }

    function loadPdfDocument(url) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');

        var wrapper = document.createElement('div');
        wrapper.className = 'doc-pdf-wrapper';

        var toolbar = document.createElement('div');
        toolbar.className = 'doc-pdf-toolbar';
        toolbar.innerHTML = `
            <span class="doc-pdf-info"><i class="fa-solid fa-file-pdf"></i> PDF Document Preview</span>
            <div class="doc-pdf-actions">
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="doc-btn-sm doc-btn-direct">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Direct
                </a>
                <a href="${url}" download class="doc-btn-sm doc-btn-dl">
                    <i class="fa-solid fa-download"></i> Download PDF
                </a>
            </div>
        `;

        var iframe = document.createElement('iframe');
        iframe.className = 'doc-pdf-iframe';
        iframe.src = url + '#toolbar=1';

        iframe.onload = function () {
            if (modalLoader) modalLoader.style.display = 'none';
        };

        iframe.onerror = function () {
            if (modalLoader) modalLoader.style.display = 'none';
            renderPdfFallback(url, 'Unable to load PDF preview in iframe.');
        };

        wrapper.appendChild(toolbar);
        wrapper.appendChild(iframe);
        modalContent.appendChild(wrapper);

        // Safety timeout for loader hide
        setTimeout(function () {
            if (modalLoader) modalLoader.style.display = 'none';
        }, 1200);
    }

    function renderPdfFallback(url, message) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');
        if (modalLoader) modalLoader.style.display = 'none';

        modalContent.innerHTML = `
            <div class="doc-fallback-card">
                <div class="doc-fallback-icon"><i class="fa-solid fa-file-pdf"></i></div>
                <h4>PDF Preview</h4>
                <p class="doc-fallback-msg">${message}</p>
                <div class="doc-fallback-actions">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="doc-btn doc-btn-primary">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Open PDF Direct in Browser
                    </a>
                    <a href="${url}" download class="doc-btn doc-btn-outline">
                        <i class="fa-solid fa-download"></i> Download PDF File
                    </a>
                </div>
            </div>
        `;
    }

    function loadImageDocument(url) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');

        var wrapper = document.createElement('div');
        wrapper.className = 'doc-pdf-wrapper';

        var toolbar = document.createElement('div');
        toolbar.className = 'doc-pdf-toolbar';
        toolbar.innerHTML = `
            <span class="doc-pdf-info"><i class="fa-solid fa-image"></i> Image Preview</span>
            <div class="doc-pdf-actions">
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="doc-btn-sm doc-btn-direct">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Direct
                </a>
                <a href="${url}" download class="doc-btn-sm doc-btn-dl">
                    <i class="fa-solid fa-download"></i> Download Image
                </a>
            </div>
        `;

        var img = document.createElement('img');
        img.className = 'doc-modal-img';
        img.src = url;
        img.alt = 'Document Image';

        img.onload = function () {
            if (modalLoader) modalLoader.style.display = 'none';
        };

        img.onerror = function () {
            if (modalLoader) modalLoader.style.display = 'none';
            modalContent.innerHTML = `
                <div class="doc-fallback-card">
                    <div class="doc-fallback-icon"><i class="fa-solid fa-file-image"></i></div>
                    <h4>Image Preview Error</h4>
                    <p class="doc-fallback-msg">Image could not be loaded directly.</p>
                    <div class="doc-fallback-actions">
                        <a href="${url}" target="_blank" rel="noopener noreferrer" class="doc-btn doc-btn-primary">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Direct
                        </a>
                        <a href="${url}" download class="doc-btn doc-btn-outline">
                            <i class="fa-solid fa-download"></i> Download Image
                        </a>
                    </div>
                </div>
            `;
        };

        wrapper.appendChild(toolbar);
        wrapper.appendChild(img);
        modalContent.appendChild(wrapper);
    }

    function loadWebPageDocument(url) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');

        var wrapper = document.createElement('div');
        wrapper.className = 'doc-pdf-wrapper';

        var displayUrl = url;
        if (displayUrl.includes('drive.google.com') && displayUrl.includes('/view')) {
            displayUrl = displayUrl.replace('/view', '/preview');
        }

        var toolbar = document.createElement('div');
        toolbar.className = 'doc-pdf-toolbar';
        toolbar.innerHTML = `
            <span class="doc-pdf-info"><i class="fa-solid fa-globe"></i> Web Material Preview</span>
            <div class="doc-pdf-actions">
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="doc-btn-sm doc-btn-direct">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Direct
                </a>
            </div>
        `;

        var iframe = document.createElement('iframe');
        iframe.className = 'doc-pdf-iframe';
        iframe.src = displayUrl;

        iframe.onload = function () {
            if (modalLoader) modalLoader.style.display = 'none';
        };

        wrapper.appendChild(toolbar);
        wrapper.appendChild(iframe);
        modalContent.appendChild(wrapper);

        setTimeout(function () {
            if (modalLoader) modalLoader.style.display = 'none';
        }, 1500);
    }

    function loadGenericDocument(url) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');
        if (modalLoader) modalLoader.style.display = 'none';

        var fileName = getFileName(url);
        var ext = getFileExtension(url).toUpperCase();

        modalContent.innerHTML = `
            <div class="doc-fallback-card">
                <div class="doc-fallback-icon"><i class="fa-solid fa-file"></i></div>
                <h4>${fileName}</h4>
                <p class="doc-fallback-msg">Format: <strong>${ext || 'File'}</strong></p>
                <div class="doc-fallback-actions">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="doc-btn doc-btn-primary">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Direct in New Tab
                    </a>
                    <a href="${url}" download class="doc-btn doc-btn-outline">
                        <i class="fa-solid fa-download"></i> Download File
                    </a>
                </div>
            </div>
        `;
    }

    function updateIconBadge(badge, ext) {
        if (!badge) return;
        var iconMap = {
            'docx': 'fa-file-word',
            'doc': 'fa-file-word',
            'pdf': 'fa-file-pdf',
            'jpg': 'fa-file-image',
            'jpeg': 'fa-file-image',
            'png': 'fa-file-image',
            'svg': 'fa-file-image',
            'webp': 'fa-file-image',
            'pptx': 'fa-file-powerpoint',
            'ppt': 'fa-file-powerpoint',
            'xlsx': 'fa-file-excel',
            'xls': 'fa-file-excel'
        };

        var iconClass = iconMap[ext] || 'fa-file-lines';
        badge.innerHTML = '<i class="fa-solid ' + iconClass + '"></i>';
    }

    function getFileName(url) {
        if (!url) return 'document';
        var parts = url.split('/');
        var name = parts[parts.length - 1] || 'document';
        return decodeURIComponent(name.split('?')[0]);
    }

    function getFileExtension(url) {
        if (!url) return '';
        var filename = getFileName(url);
        var parts = filename.split('.');
        if (parts.length > 1) {
            return parts[parts.length - 1].toLowerCase();
        }
        return '';
    }

    function isWebUrl(url) {
        return url.startsWith('http://') || url.startsWith('https://');
    }

    function showToast(message, type) {
        var container = document.getElementById('docToastContainer');
        if (!container) return;

        var toast = document.createElement('div');
        toast.className = 'doc-toast doc-toast-' + (type || 'info');
        toast.innerHTML = '<i class="fa-solid fa-circle-info"></i> <span>' + message + '</span>';

        container.appendChild(toast);

        setTimeout(function () {
            toast.classList.add('show');
        }, 10);

        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3500);
    }

    // Expose utility globally
    window.CE_DocViewer = {
        open: openDocumentViewer,
        close: closeDocumentViewer,
        toast: showToast
    };

})();
