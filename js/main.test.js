const { fireEvent, getByLabelText, getByText } = require('@testing-library/dom');
require('@testing-library/jest-dom');

describe('Contact Form', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="contact-form" class="space-y-4">
        <div>
          <label for="name">الاسم</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div>
          <label for="email">البريد الإلكتروني</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div>
          <label for="message">الرسالة</label>
          <textarea id="message" name="message" required></textarea>
        </div>
        <button type="submit">إرسال</button>
      </form>
    `;
    container = document.body;
  });

  test('should show validation message when submitting empty form', () => {
    const form = container.querySelector('#contact-form');
    const nameInput = getByLabelText(container, 'الاسم');
    
    fireEvent.submit(form);
    
    expect(nameInput.validity.valid).toBeFalsy();
    expect(nameInput.validationMessage).not.toBe('');
  });

  test('should allow form submission with valid data', () => {
    const form = container.querySelector('#contact-form');
    const nameInput = getByLabelText(container, 'الاسم');
    const emailInput = getByLabelText(container, 'البريد الإلكتروني');
    const messageInput = getByLabelText(container, 'الرسالة');
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });
    
    expect(nameInput.validity.valid).toBeTruthy();
    expect(emailInput.validity.valid).toBeTruthy();
    expect(messageInput.validity.valid).toBeTruthy();
  });
});

describe('Language Switcher', () => {
  beforeEach(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    document.body.innerHTML = `
      <button class="lang-btn" data-lang="ar">العربية</button>
      <button class="lang-btn" data-lang="en">English</button>
    `;

    // Mock the language switcher functionality
    document.querySelectorAll('.lang-btn').forEach(button => {
      button.addEventListener('click', () => {
        const lang = button.getAttribute('data-lang');
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      });
    });
  });

  test('should switch language when clicking language button', () => {
    const arButton = getByText(document.body, 'العربية');
    const enButton = getByText(document.body, 'English');
    
    fireEvent.click(enButton);
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    
    fireEvent.click(arButton);
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });
});
