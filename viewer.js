/**
 * Universal Document Previewer Modal for CE Web
 * Handles previewing .docx, .pdf, images, web links, and Google Drive links directly on page.
 */

(function () {
    'use strict';

    // Inject CSS styles dynamically if needed or ensure modal elements exist
    document.addEventListener('DOMContentLoaded', function () {
        initDocumentViewerModal();
        attachEventListeners();
    });

    // Also run immediately if DOM is already loaded
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initDocumentViewerModal();
        attachEventListeners();
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

        closeBtn.addEventListener('click', closeDocumentViewer);
        
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeDocumentViewer();
            }
        });

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

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
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
                    showToast('No material file or link uploaded yet for this item.', 'info');
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
                    showToast('No file available for download yet.', 'info');
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
        var iconBadge = document.getElementById('docModalIconBadge');

        modalTitle.textContent = title || 'Document Preview';
        modalSubtitle.textContent = getFileName(url);
        downloadBtn.setAttribute('href', url);

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
            // Fallback for other file types
            loadGenericDocument(url);
        }
    }

    function closeDocumentViewer() {
        var modal = document.getElementById('docViewerModal');
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        var modalContent = document.getElementById('docModalContent');
        modalContent.innerHTML = '';
    }

    function loadDocxDocument(url) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');

        if (typeof mammoth === 'undefined') {
            renderDocxFallback(url, 'Mammoth.js library is loading or unavailable.');
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
                    html = '<p><em>The document is empty or could not format text.</em></p>';
                }

                modalContent.innerHTML = '<div class="docx-rendered-container">' + html + '</div>';
            })
            .catch(function (err) {
                console.warn('DOCX arrayBuffer fetch error:', err);
                renderDocxFallback(url, 'Direct local file parsing restricted. View in Online Viewer or Download.');
            });
    }

    function renderDocxFallback(url, message) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');
        modalLoader.style.display = 'none';

        var encodedUrl = encodeURIComponent(window.location.origin + '/' + url.replace(/^\.\//, ''));
        var googleDocsUrl = 'https://docs.google.com/viewer?url=' + encodedUrl + '&embedded=true';
        var officeViewerUrl = 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodedUrl;

        modalContent.innerHTML = `
            <div class="doc-fallback-card">
                <div class="doc-fallback-icon"><i class="fa-solid fa-file-word"></i></div>
                <h4>Word Document (.docx) Preview</h4>
                <p class="doc-fallback-msg">${message}</p>
                <div class="doc-fallback-actions">
                    <a href="${officeViewerUrl}" target="_blank" rel="noopener noreferrer" class="doc-btn doc-btn-primary">
                        <i class="fa-solid fa-up-right-from-square"></i> Open in Office Online
                    </a>
                    <a href="${googleDocsUrl}" target="_blank" rel="noopener noreferrer" class="doc-btn doc-btn-secondary">
                        <i class="fa-solid fa-up-right-from-square"></i> Open in Google Viewer
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

        var iframe = document.createElement('iframe');
        iframe.className = 'doc-pdf-iframe';
        iframe.src = url + '#toolbar=1';

        iframe.onload = function () {
            modalLoader.style.display = 'none';
        };

        iframe.onerror = function () {
            modalLoader.style.display = 'none';
            modalContent.innerHTML = `
                <div class="doc-fallback-card">
                    <div class="doc-fallback-icon"><i class="fa-solid fa-file-pdf"></i></div>
                    <h4>PDF Preview</h4>
                    <p>Unable to load PDF preview in iframe.</p>
                    <a href="${url}" download class="doc-btn doc-btn-primary">
                        <i class="fa-solid fa-download"></i> Download PDF
                    </a>
                </div>
            `;
        };

        modalContent.appendChild(iframe);

        // Safety timeout for loader
        setTimeout(function () {
            modalLoader.style.display = 'none';
        }, 1200);
    }

    function loadImageDocument(url) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');

        var img = document.createElement('img');
        img.className = 'doc-modal-img';
        img.src = url;
        img.alt = 'Document Image';

        img.onload = function () {
            modalLoader.style.display = 'none';
        };

        img.onerror = function () {
            modalLoader.style.display = 'none';
            modalContent.innerHTML = '<p class="doc-error">Image could not be loaded.</p>';
        };

        modalContent.appendChild(img);
    }

    function loadWebPageDocument(url) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');

        var iframe = document.createElement('iframe');
        iframe.className = 'doc-pdf-iframe';

        // Check if Google Drive view link
        if (url.includes('drive.google.com') && url.includes('/view')) {
            url = url.replace('/view', '/preview');
        }

        iframe.src = url;

        iframe.onload = function () {
            modalLoader.style.display = 'none';
        };

        modalContent.appendChild(iframe);

        setTimeout(function () {
            modalLoader.style.display = 'none';
        }, 1500);
    }

    function loadGenericDocument(url) {
        var modalContent = document.getElementById('docModalContent');
        var modalLoader = document.getElementById('docModalLoader');
        modalLoader.style.display = 'none';

        var fileName = getFileName(url);
        var ext = getFileExtension(url).toUpperCase();

        modalContent.innerHTML = `
            <div class="doc-fallback-card">
                <div class="doc-fallback-icon"><i class="fa-solid fa-file"></i></div>
                <h4>${fileName}</h4>
                <p>Format: <strong>${ext || 'File'}</strong></p>
                <div class="doc-fallback-actions">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="doc-btn doc-btn-primary">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Open in New Tab
                    </a>
                    <a href="${url}" download class="doc-btn doc-btn-outline">
                        <i class="fa-solid fa-download"></i> Download File
                    </a>
                </div>
            </div>
        `;
    }

    function updateIconBadge(badge, ext) {
        var iconMap = {
            'docx': 'fa-file-word',
            'doc': 'fa-file-word',
            'pdf': 'fa-file-pdf',
            'jpg': 'fa-file-image',
            'jpeg': 'fa-file-image',
            'png': 'fa-file-image',
            'svg': 'fa-file-image',
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
