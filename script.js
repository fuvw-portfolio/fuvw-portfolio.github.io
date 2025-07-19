document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav a');

    if (menuToggle && mainNav) {
        const toggleMenu = () => {
            const isOpen = mainNav.classList.contains('is-open');
            menuToggle.setAttribute('aria-expanded', !isOpen);
            mainNav.classList.toggle('is-open');
            menuToggle.classList.toggle('is-open');
            document.body.style.overflow = isOpen ? '' : 'hidden';
        };
        menuToggle.addEventListener('click', toggleMenu);
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('is-open')) toggleMenu();
            });
        });
    }

    const header = document.querySelector('.main-header');
    if (header) {
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            header.style.borderColor = (scrollTop > 50) ? 'var(--color-border)' : 'transparent';
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, false);
    }

    const animatedElements = document.querySelectorAll('.project-card, .section-header, .social-proof-container, .details-sticky-content, .content-block, .contact-content');
    if (animatedElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            revealObserver.observe(el);
        });
    }
    
    document.querySelectorAll('.project-gallery').forEach(gallery => {
        const galleryItems = gallery.querySelectorAll('.gallery-item');
        const galleryButton = gallery.querySelector('.gallery-button');
        const countSpan = gallery.querySelector('.gallery-count');
        
        if (galleryItems.length > 1 && galleryButton && countSpan) {
            const additionalItems = galleryItems.length - 1;
            countSpan.textContent = `+${additionalItems} more`;
        } else if (galleryButton) {
            galleryButton.style.display = 'none';
        }
    });

    const videoModal = document.getElementById('video-modal');
    if (videoModal) {
        const modalVideoPlayer = document.getElementById('modal-video-player');
        const modalNav = document.getElementById('modal-nav');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        let currentGallerySources = [];
        
        const switchVideo = (index) => {
            if (currentGallerySources[index]) {
                modalVideoPlayer.src = currentGallerySources[index];
                modalVideoPlayer.play();
                
                modalNav.querySelectorAll('.nav-thumbnail').forEach((thumb, i) => {
                    thumb.classList.toggle('is-active', i === index);
                });
            }
        };

        const openModal = (sources, startIndex) => {
            currentGallerySources = sources;
            modalNav.innerHTML = '';

            if (sources.length > 1) {
                sources.forEach((src, index) => {
                    const thumb = document.createElement('button');
                    thumb.classList.add('nav-thumbnail');
                    thumb.dataset.index = index;
                    
                    const thumbVideo = document.createElement('video');
                    thumbVideo.src = src;
                    thumbVideo.muted = true;
                    thumbVideo.playsinline = true;

                    thumb.appendChild(thumbVideo);
                    thumb.addEventListener('click', () => switchVideo(index));
                    modalNav.appendChild(thumb);
                });
                modalNav.style.display = 'flex';
            } else {
                modalNav.style.display = 'none';
            }
            
            videoModal.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
            switchVideo(startIndex);
        };

        const closeModal = () => {
            videoModal.classList.remove('is-visible');
            document.body.style.overflow = '';
            modalVideoPlayer.pause();
            modalVideoPlayer.src = '';
            modalNav.innerHTML = '';
            currentGallerySources = [];
        };

        document.querySelectorAll('.project-video-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const source = [link.dataset.videoSrc];
                openModal(source, 0);
            });
        });

        document.querySelectorAll('.gallery-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const galleryContainer = link.closest('.project-gallery');
                if (!galleryContainer) return;
                
                const galleryItems = Array.from(galleryContainer.querySelectorAll('.gallery-item'));
                const sources = galleryItems.map(item => item.dataset.videoSrc);
                const startIndex = galleryItems.indexOf(link);

                if (sources.length > 0) {
                    openModal(sources, startIndex);
                }
            });
        });
        
        modalCloseBtn.addEventListener('click', closeModal);
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeModal();
        });
    }
    
    const stickyTitle = document.getElementById('sticky-title');
    const stickySubtitle = document.getElementById('sticky-subtitle');
    const contentBlocks = document.querySelectorAll('.details-scrolling-content .content-block');
    if (stickyTitle && stickySubtitle && contentBlocks.length > 0) {
        let isUpdating = false;
        const updateStickyText = (newTitle, newSubtitle) => {
            if (isUpdating) return;
            isUpdating = true;
            
            stickyTitle.style.opacity = '0';
            stickyTitle.style.transform = 'translateY(10px)';
            stickySubtitle.style.opacity = '0';
            stickySubtitle.style.transform = 'translateY(10px)';

            setTimeout(() => {
                stickyTitle.innerHTML = newTitle;
                stickySubtitle.innerHTML = newSubtitle;
                stickyTitle.style.opacity = '1';
                stickyTitle.style.transform = 'translateY(0)';
                stickySubtitle.style.opacity = '1';
                stickySubtitle.style.transform = 'translateY(0)';
                isUpdating = false;
            }, 400);
        };
        
        const scrollytellingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const title = entry.target.dataset.title;
                    const subtitle = entry.target.dataset.subtitle;
                    if (title && subtitle && stickyTitle.innerHTML !== title) {
                        updateStickyText(title, subtitle);
                    }
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        contentBlocks.forEach(block => scrollytellingObserver.observe(block));
    }

    const visitCounters = document.querySelectorAll('.project-visits');
    if (visitCounters.length > 0) {
        const formatNumber = (num) => {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
            return num.toString();
        };

        const animateCount = (element, target) => {
            let start = 0;
            const duration = 2000;
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const current = Math.floor(progress * target);
                element.textContent = formatNumber(current);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    element.textContent = formatNumber(target);
                }
            };
            window.requestAnimationFrame(step);
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const visitsContainer = entry.target;
                    const countElement = visitsContainer.querySelector('.visits-count');
                    const target = parseInt(visitsContainer.dataset.visits, 10);
                    
                    animateCount(countElement, target);
                    counterObserver.unobserve(visitsContainer);
                }
            });
        }, { threshold: 0.5 });
        
        visitCounters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
});
