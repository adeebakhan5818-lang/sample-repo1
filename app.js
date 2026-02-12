// Contact Management App - JavaScript Logic

class ContactManager {
    constructor() {
        this.contacts = this.loadContacts();
        this.editingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderContacts();
        this.updateContactCount();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            this.filterContacts(e.target.value);
        });

        // Delete confirmation modal
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            this.confirmDelete();
        });
    }

    handleFormSubmit() {
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const address = document.getElementById('contactAddress').value.trim();

        if (!name || !email || !phone) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (this.editingId) {
            this.updateContact(this.editingId, { name, email, phone, address });
            this.showToast('Contact updated successfully!', 'success');
            this.cancelEdit();
        } else {
            this.addContact({ name, email, phone, address });
            this.showToast('Contact added successfully!', 'success');
        }

        this.clearForm();
        this.renderContacts();
        this.updateContactCount();
    }

    addContact(contact) {
        const newContact = {
            id: Date.now(),
            ...contact,
            dateAdded: new Date().toLocaleString()
        };
        this.contacts.push(newContact);
        this.saveContacts();
    }

    updateContact(id, updatedData) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact) {
            Object.assign(contact, updatedData);
            contact.dateUpdated = new Date().toLocaleString();
            this.saveContacts();
        }
    }

    deleteContact(id) {
        this.contactIdToDelete = id;
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
        deleteModal.show();
    }

    confirmDelete() {
        if (this.contactIdToDelete) {
            this.contacts = this.contacts.filter(c => c.id !== this.contactIdToDelete);
            this.saveContacts();
            this.renderContacts();
            this.updateContactCount();
            this.showToast('Contact deleted successfully!', 'success');

            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
            if (modal) {
                modal.hide();
            }

            this.contactIdToDelete = null;
        }
    }

    editContact(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (contact) {
            document.getElementById('contactName').value = contact.name;
            document.getElementById('contactEmail').value = contact.email;
            document.getElementById('contactPhone').value = contact.phone;
            document.getElementById('contactAddress').value = contact.address || '';

            this.editingId = id;
            document.getElementById('formTitle').textContent = 'Edit Contact';
            document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Contact';
            document.getElementById('cancelBtn').classList.remove('d-none');

            // Scroll to form
            document.getElementById('contactForm').scrollIntoView({ behavior: 'smooth' });
        }
    }

    cancelEdit() {
        this.editingId = null;
        this.clearForm();
        document.getElementById('formTitle').textContent = 'Add New Contact';
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-plus"></i> Add Contact';
        document.getElementById('cancelBtn').classList.add('d-none');
    }

    clearForm() {
        document.getElementById('contactForm').reset();
    }

    renderContacts(contactsToRender = null) {
        const container = document.getElementById('contactsContainer');
        const contacts = contactsToRender || this.contacts;

        if (contacts.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-inbox"></i> No contacts found.
                </div>
            `;
            return;
        }

        container.innerHTML = contacts.map(contact => `
            <div class="card contact-card shadow-sm">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6 class="mb-2">
                                <i class="fas fa-user-circle"></i> ${this.escapeHtml(contact.name)}
                            </h6>
                            <div class="contact-info">
                                <p>
                                    <i class="fas fa-envelope"></i> 
                                    <a href="mailto:${this.escapeHtml(contact.email)}">
                                        ${this.escapeHtml(contact.email)}
                                    </a>
                                </p>
                                <p>
                                    <i class="fas fa-phone"></i> 
                                    <a href="tel:${this.escapeHtml(contact.phone)}">
                                        ${this.escapeHtml(contact.phone)}
                                    </a>
                                </p>
                                ${contact.address ? `
                                    <p>
                                        <i class="fas fa-map-marker-alt"></i> 
                                        ${this.escapeHtml(contact.address)}
                                    </p>
                                ` : ''}
                                <small class="text-muted">Added: ${contact.dateAdded}</small>
                                ${contact.dateUpdated ? `<small class="text-muted d-block">Updated: ${contact.dateUpdated}</small>` : ''}
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="contact-actions justify-content-end">
                                <button class="btn btn-warning btn-sm" 
                                        onclick="contactManager.editContact(${contact.id})"
                                        title="Edit contact">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-danger btn-sm" 
                                        onclick="contactManager.deleteContact(${contact.id})"
                                        title="Delete contact">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterContacts(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = this.contacts.filter(contact => 
            contact.name.toLowerCase().includes(term) || 
            contact.email.toLowerCase().includes(term) ||
            contact.phone.includes(term)
        );
        this.renderContacts(filtered);
        this.updateContactCount(filtered.length);
    }

    updateContactCount(count = null) {
        const total = count !== null ? count : this.contacts.length;
        document.getElementById('contactCount').textContent = `Total Contacts: ${total}`;
    }

    showToast(message, type = 'success') {
        const toastElement = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        const header = toastElement.querySelector('.toast-header');

        toastMessage.textContent = message;

        if (type === 'error') {
            header.querySelector('i').classList.remove('text-success');
            header.querySelector('i').classList.add('text-danger');
            header.querySelector('i').classList.remove('fa-check-circle');
            header.querySelector('i').classList.add('fa-exclamation-circle');
        } else {
            header.querySelector('i').classList.add('text-success');
            header.querySelector('i').classList.remove('text-danger');
            header.querySelector('i').classList.add('fa-check-circle');
            header.querySelector('i').classList.remove('fa-exclamation-circle');
        }

        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    saveContacts() {
        localStorage.setItem('contacts', JSON.stringify(this.contacts));
    }

    loadContacts() {
        const stored = localStorage.getItem('contacts');
        return stored ? JSON.parse(stored) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contactManager = new ContactManager();
});
