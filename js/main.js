// DOM Elements
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.querySelector('nav');
let lastScroll = 0;

// Mobile Menu Toggle
const toggleMobileMenu = () => {
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
        // Toggle menu icon
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        }
        // Toggle body scroll
        document.body.classList.toggle('overflow-hidden', !mobileMenu.classList.contains('hidden'));
    }
};

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (mobileMenu && !mobileMenu.classList.contains('hidden') && 
        !mobileMenuBtn.contains(e.target) && 
        !mobileMenu.contains(e.target)) {
        toggleMobileMenu();
    }
});

// Navbar Scroll Behavior
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        if (navbar) {
            navbar.classList.remove('-translate-y-full');
            navbar.classList.remove('shadow-md');
        }
        return;
    }
    
    if (currentScroll > lastScroll && mobileMenu && !mobileMenu.classList.contains('hidden')) {
        // Scrolling down & menu is closed
        if (navbar) {
            navbar.classList.add('-translate-y-full');
        }
    } else {
        // Scrolling up
        if (navbar) {
            navbar.classList.remove('-translate-y-full');
            navbar.classList.add('shadow-md');
        }
    }
    
    lastScroll = currentScroll;
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Close mobile menu if open
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu();
            }
            
            // Smooth scroll to target
            if (navbar) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: targetPosition - navHeight,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Intersection Observer for Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target) {
                entry.target.classList.add('fade-in');
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add fade-in animation to sections
document.querySelectorAll('section').forEach(section => {
    if (section) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(section);
    }
});

// Contact Form Handling
const contactForm = document.querySelector('#contact form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form fields
        const nameInput = contactForm.querySelector('#name');
        const emailInput = contactForm.querySelector('#email');
        const messageInput = contactForm.querySelector('#message');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        
        // Reset previous errors
        if (contactForm) {
            contactForm.querySelectorAll('.error-message').forEach(el => el.remove());
            contactForm.querySelectorAll('.border-red-500').forEach(el => {
                el.classList.remove('border-red-500');
                el.classList.add('border-gray-300');
            });
        }
        
        // Validate inputs
        let hasError = false;
        
        if (nameInput && !nameInput.value.trim()) {
            showInputError(nameInput, 'الرجاء إدخال الاسم');
            hasError = true;
        }
        
        if (emailInput && !emailInput.value.trim()) {
            showInputError(emailInput, 'الرجاء إدخال البريد الإلكتروني');
            hasError = true;
        } else if (emailInput && !isValidEmail(emailInput.value)) {
            showInputError(emailInput, 'الرجاء إدخال بريد إلكتروني صحيح');
            hasError = true;
        }
        
        if (messageInput && !messageInput.value.trim()) {
            showInputError(messageInput, 'الرجاء إدخال الرسالة');
            hasError = true;
        }
        
        if (hasError) return;
        
        // Show loading state
        if (submitButton) {
            submitButton.disabled = true;
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        }
        
        try {
            // Simulate form submission (replace with your actual API endpoint)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Clear form
            if (contactForm) {
                contactForm.reset();
            }
            
            // Show success message
            showNotification('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', 'success');
        } catch (error) {
            showNotification('عذراً، حدث خطأ أثناء إرسال الرسالة. الرجاء المحاولة مرة أخرى', 'error');
        } finally {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        }
    });
}

function showInputError(input, message) {
    if (input) {
        input.classList.remove('border-gray-300');
        input.classList.add('border-red-500');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        
        if (input.parentNode) {
            input.parentNode.appendChild(errorDiv);
        }
    }
}

// Helper Functions
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white max-w-md transform transition-transform duration-300 translate-y-full`;
    notification.textContent = message;
    
    if (document.body) {
        document.body.appendChild(notification);
    }
    
    // Animate in
    setTimeout(() => {
        if (notification) {
            notification.classList.remove('translate-y-full');
        }
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification) {
            notification.classList.add('translate-y-full');
            setTimeout(() => {
                if (document.body) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Language Switcher
const languageSwitcher = document.querySelector('.language-switcher');
if (languageSwitcher) {
    languageSwitcher.addEventListener('click', () => {
        const currentLang = document.documentElement.lang;
        const newLang = currentLang === 'ar' ? 'en' : 'ar';
        const newDir = newLang === 'ar' ? 'rtl' : 'ltr';
        
        if (document.documentElement) {
            document.documentElement.lang = newLang;
            document.documentElement.dir = newDir;
        }
        
        // Update text content based on language
        // This would typically involve a translation system
        // For now, we'll just toggle the button text
        if (languageSwitcher) {
            languageSwitcher.textContent = newLang === 'ar' ? 'English' : 'العربية';
        }
    });
}
