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

    const videoModal = document.getElementById('video-modal');
    if (videoModal) {
        const modalVideoPlayer = document.getElementById('modal-video-player');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const projectVideoLinks = document.querySelectorAll('.project-video-link');
        const openModal = (src) => {
            modalVideoPlayer.src = src;
            videoModal.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
            modalVideoPlayer.play();
        };
        const closeModal = () => {
            videoModal.classList.remove('is-visible');
            document.body.style.overflow = '';
            modalVideoPlayer.pause();
            modalVideoPlayer.src = '';
        };
        projectVideoLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const videoSrc = link.dataset.videoSrc;
                if (videoSrc) openModal(videoSrc);
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
});