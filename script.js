// Load saved data or use defaults
let menuData = JSON.parse(localStorage.getItem('laceCafeMenuData')) || {
    pizza: [
        { id: 1, name: "Margherita Pizza", price: 45000, description: "Fresh tomatoes, mozzarella, basil", image: null },
        { id: 2, name: "Pepperoni Pizza", price: 52000, description: "Pepperoni, mozzarella, tomato sauce", image: null },
        { id: 3, name: "Quattro Stagioni", price: 58000, description: "Ham, mushrooms, artichokes, olives", image: null },
        { id: 16, name: "Spaghetti Carbonara", price: 48000, description: "Pasta with eggs, cheese, bacon", image: null },
        { id: 17, name: "Penne Arrabbiata", price: 42000, description: "Spicy tomato sauce pasta", image: null },
        { id: 18, name: "Lasagna", price: 55000, description: "Layered pasta with meat sauce", image: null }
    ],
    burger: [
        { id: 4, name: "Classic Burger", price: 35000, description: "Beef patty, lettuce, tomato, onion", image: null },
        { id: 5, name: "Cheese Burger", price: 38000, description: "Beef patty with melted cheese", image: null },
        { id: 6, name: "Bacon Burger", price: 45000, description: "Beef patty with crispy bacon", image: null }
    ],
    sushi: [
        { id: 7, name: "Salmon Roll", price: 32000, description: "Fresh salmon, avocado, cucumber", image: null },
        { id: 8, name: "Tuna Sashimi", price: 45000, description: "Fresh tuna slices", image: null },
        { id: 9, name: "California Roll", price: 28000, description: "Crab, avocado, cucumber", image: null }
    ],
    dessert: [
        { id: 10, name: "Chocolate Cake", price: 22000, description: "Rich chocolate layer cake", image: null },
        { id: 11, name: "Cheesecake", price: 25000, description: "Creamy New York style cheesecake", image: null },
        { id: 12, name: "Tiramisu", price: 28000, description: "Italian coffee-flavored dessert", image: null }
    ],
    coffee: [
        { id: 13, name: "Cappuccino", price: 18000, description: "Espresso with steamed milk foam", image: null },
        { id: 14, name: "Latte", price: 20000, description: "Espresso with steamed milk", image: null },
        { id: 15, name: "Americano", price: 15000, description: "Espresso with hot water", image: null }
    ]
};

let categoryEmojis = JSON.parse(localStorage.getItem('laceCafeCategoryEmojis')) || {
    pizza: '🍕',
    burger: '🍔',
    sushi: '🍣',
    dessert: '🍰',
    coffee: '☕'
};

let categoryNames = JSON.parse(localStorage.getItem('laceCafeCategoryNames')) || {
    pizza: 'Pizza & Pasta',
    burger: 'Burgers',
    sushi: 'Sushi',
    dessert: 'Desserts',
    coffee: 'Coffee & Drinks'
};

let nextId = parseInt(localStorage.getItem('laceCafeNextId')) || 19; // For new products
const ADMIN_PASSWORD = "20022002nnmm.."; // Change this to your desired password
let isAdminAuthenticated = false;

// Save data to localStorage
function saveData() {
    localStorage.setItem('laceCafeMenuData', JSON.stringify(menuData));
    localStorage.setItem('laceCafeCategoryEmojis', JSON.stringify(categoryEmojis));
    localStorage.setItem('laceCafeCategoryNames', JSON.stringify(categoryNames));
    localStorage.setItem('laceCafeNextId', nextId.toString());
    localStorage.setItem('laceCafeRatingCodes', JSON.stringify(ratingCodes));
    localStorage.setItem('laceCafePendingReviews', JSON.stringify(pendingReviews));
    localStorage.setItem('laceCafeApprovedReviews', JSON.stringify(approvedReviews));
    localStorage.setItem('laceCafeNextCodeId', nextCodeId.toString());
    localStorage.setItem('laceCafeNextReviewId', nextReviewId.toString());
}

// Rating system data - Load from localStorage or use defaults
let ratingCodes = JSON.parse(localStorage.getItem('laceCafeRatingCodes')) || [
    { id: 1, code: "RATE2024A", description: "Table 1 visit", expiry: "2024-12-31", used: false, usedDate: null },
    { id: 2, code: "RATE2024B", description: "Table 3 visit", expiry: "2024-12-31", used: true, usedDate: "2024-01-15" },
    { id: 3, code: "RATE2024C", description: "VIP customer", expiry: "2024-12-31", used: false, usedDate: null }
];

let pendingReviews = JSON.parse(localStorage.getItem('laceCafePendingReviews')) || [];
let approvedReviews = JSON.parse(localStorage.getItem('laceCafeApprovedReviews')) || [];
let nextCodeId = parseInt(localStorage.getItem('laceCafeNextCodeId')) || 4;
let nextReviewId = parseInt(localStorage.getItem('laceCafeNextReviewId')) || 1;

// DOM elements
const menuSections = document.getElementById('menu-sections');
let categoryButtons = document.querySelectorAll('.category-btn');
const adminBtn = document.getElementById('admin-btn');
const adminModal = document.getElementById('admin-modal');
const adminLoginModal = document.getElementById('admin-login-modal');
const closeAdmin = document.getElementById('close-admin');
const addProductForm = document.getElementById('add-product-form');
const addCategoryForm = document.getElementById('add-category-form');
const allProductsList = document.getElementById('all-products-list');
const adminLoginForm = document.getElementById('admin-login-form');
const cancelLogin = document.getElementById('cancel-login');
const loginError = document.getElementById('login-error');
const productImageInput = document.getElementById('product-image');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const scrollToTopBtn = document.getElementById('scroll-to-top');
const searchInput = document.getElementById('search-input');

let filteredMenuData = { ...menuData }; // For search functionality

// Initialize - Load only essential parts first
renderMenu();
setupScrollToTop();
setupSearch();

// Load heavy operations after page is ready
setTimeout(() => {
    setupScrollSpy();
    renderAllProducts(); // Initialize products list
}, 100);

function renderCategories() {
    const categoryContainer = document.querySelector('.category-scroll');
    categoryContainer.innerHTML = Object.keys(menuData).map(category => `
        <button class="category-btn flex items-center space-x-2 px-4 py-2" data-category="${category}">
            <span class="text-lg">${categoryEmojis[category]}</span>
            <span class="text-sm font-medium">${categoryNames[category]}</span>
        </button>
    `).join('');
    
    // Update category buttons reference
    categoryButtons = document.querySelectorAll('.category-btn');
    setupCategoryNavigation();
}

function renderMenu() {
    const dataToRender = filteredMenuData;
    const hasResults = Object.values(dataToRender).some(items => items.length > 0);
    
    if (!hasResults && searchInput.value.trim()) {
        menuSections.innerHTML = `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">🔍</div>
                <h3 class="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                <p class="text-gray-600">Try searching for something else</p>
            </div>
        `;
        return;
    }
    
    menuSections.innerHTML = Object.keys(dataToRender)
        .filter(category => dataToRender[category].length > 0)
        .map(category => `
        <section id="section-${category}" class="mb-8 w-full">
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-1">${categoryNames[category]}</h2>
                <p class="text-gray-500 text-sm">${dataToRender[category].length} items</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mobile-grid w-full">
                ${dataToRender[category].map(item => `
                    <div class="food-card overflow-hidden w-full">
                        ${item.image ? `
                            <div class="product-image-container">
                                <img src="${item.image}" alt="${item.name}" class="product-image">
                            </div>
                        ` : `
                            <div class="product-placeholder">
                                <span class="text-6xl opacity-30">${categoryEmojis[category]}</span>
                            </div>
                        `}
                        <div class="p-4">
                            <div class="flex items-start justify-between mb-2">
                                <h3 class="food-title text-lg flex-1 mr-2">${item.name}</h3>
                                <span class="price-text text-lg">${item.price.toLocaleString()} som</span>
                            </div>
                            <p class="food-description mb-3">${item.description}</p>
                            <div class="flex items-center justify-between flex-wrap gap-2">
                                <div class="flex items-center space-x-2 flex-wrap">
                                    <div class="flex items-center space-x-1">
                                        <span class="rating text-sm">★</span>
                                        <span class="text-sm text-gray-600">4.8</span>
                                    </div>
                                    <button class="rate-product bg-blue-100 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium" 
                                            data-product-id="${item.id}" data-product-name="${item.name}">
                                        ⭐ Rate
                                    </button>
                                </div>
                                <button class="add-to-cart px-3 py-2 text-sm font-medium whitespace-nowrap">
                                    ${item.price.toLocaleString()} som
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `).join('');
}

function setupScrollSpy() {
    const sections = Object.keys(filteredMenuData)
        .filter(cat => filteredMenuData[cat].length > 0)
        .map(cat => document.getElementById(`section-${cat}`))
        .filter(section => section !== null);
    const categoryContainer = document.querySelector('.category-scroll');
    
    function updateActiveCategory() {
        const scrollPosition = window.scrollY + 200; // Offset for sticky header + search
        
        let activeCategory = null;
        sections.forEach(section => {
            if (section && section.offsetTop <= scrollPosition) {
                activeCategory = section.id.replace('section-', '');
            }
        });

        if (activeCategory) {
            categoryButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === activeCategory) {
                    btn.classList.add('active');
                    
                    // Auto-scroll category into view on mobile
                    if (window.innerWidth <= 768) {
                        const btnRect = btn.getBoundingClientRect();
                        const containerRect = categoryContainer.getBoundingClientRect();
                        
                        if (btnRect.left < containerRect.left || btnRect.right > containerRect.right) {
                            btn.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                                inline: 'center'
                            });
                        }
                    }
                }
            });
        }
    }

    window.addEventListener('scroll', updateActiveCategory);
    updateActiveCategory(); // Initial call
}

function setupScrollToTop() {
    // Show/hide scroll to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.remove('hidden');
        } else {
            scrollToTopBtn.classList.add('hidden');
        }
    });

    // Scroll to top functionality
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (!searchTerm) {
            // Reset to show all items
            filteredMenuData = { ...menuData };
        } else {
            // Filter items based on search term
            filteredMenuData = {};
            Object.keys(menuData).forEach(category => {
                filteredMenuData[category] = menuData[category].filter(item => 
                    item.name.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm) ||
                    categoryNames[category].toLowerCase().includes(searchTerm)
                );
            });
        }
        
        renderMenu();
        setupScrollSpy();
    });
}

function setupCategoryNavigation() {
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            const section = document.getElementById(`section-${category}`);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Initial category navigation setup
setupCategoryNavigation();

// Admin Panel Functions
adminBtn.addEventListener('click', () => {
    if (isAdminAuthenticated) {
        adminModal.classList.remove('hidden');
        showAddTab(); // Default to add tab
        renderAllProducts(); // Make sure products are loaded
    } else {
        adminLoginModal.classList.remove('hidden');
    }
});

// Tab switching functionality
document.getElementById('tab-add').addEventListener('click', showAddTab);
document.getElementById('tab-manage').addEventListener('click', showManageTab);
document.getElementById('tab-codes').addEventListener('click', showCodesTab);
document.getElementById('tab-reviews').addEventListener('click', showReviewsTab);
document.getElementById('tab-history').addEventListener('click', showHistoryTab);

function showAddTab() {
    // Switch tab appearance
    resetTabStyles();
    document.getElementById('tab-add').classList.add('bg-white', 'text-blue-600', 'shadow-sm');
    document.getElementById('tab-add').classList.remove('text-gray-600', 'hover:text-gray-800');
    
    // Switch content
    hideAllTabContent();
    document.getElementById('add-content').classList.remove('hidden');
}

function showManageTab() {
    // Switch tab appearance
    resetTabStyles();
    document.getElementById('tab-manage').classList.add('bg-white', 'text-blue-600', 'shadow-sm');
    document.getElementById('tab-manage').classList.remove('text-gray-600', 'hover:text-gray-800');
    
    // Switch content
    hideAllTabContent();
    document.getElementById('manage-content').classList.remove('hidden');
    
    // Render products management
    renderAllProducts();
}

function showCodesTab() {
    // Switch tab appearance
    resetTabStyles();
    document.getElementById('tab-codes').classList.add('bg-white', 'text-blue-600', 'shadow-sm');
    document.getElementById('tab-codes').classList.remove('text-gray-600', 'hover:text-gray-800');
    
    // Switch content
    hideAllTabContent();
    document.getElementById('codes-content').classList.remove('hidden');
    
    // Render codes management
    renderRatingCodes();
}

function showReviewsTab() {
    // Switch tab appearance
    resetTabStyles();
    document.getElementById('tab-reviews').classList.add('bg-white', 'text-blue-600', 'shadow-sm');
    document.getElementById('tab-reviews').classList.remove('text-gray-600', 'hover:text-gray-800');
    
    // Switch content
    hideAllTabContent();
    document.getElementById('reviews-content').classList.remove('hidden');
    
    // Render pending reviews
    renderPendingReviews();
}

function showHistoryTab() {
    // Switch tab appearance
    resetTabStyles();
    document.getElementById('tab-history').classList.add('bg-white', 'text-blue-600', 'shadow-sm');
    document.getElementById('tab-history').classList.remove('text-gray-600', 'hover:text-gray-800');
    
    // Switch content
    hideAllTabContent();
    document.getElementById('history-content').classList.remove('hidden');
    
    // Render review history
    renderReviewHistory();
}

function resetTabStyles() {
    ['tab-add', 'tab-manage', 'tab-codes', 'tab-reviews', 'tab-history'].forEach(tabId => {
        const tab = document.getElementById(tabId);
        tab.classList.remove('bg-white', 'text-blue-600', 'shadow-sm');
        tab.classList.add('text-gray-600', 'hover:text-gray-800');
    });
}

function hideAllTabContent() {
    ['add-content', 'manage-content', 'codes-content', 'reviews-content', 'history-content'].forEach(contentId => {
        document.getElementById(contentId).classList.add('hidden');
    });
}

// Admin Login
adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
        isAdminAuthenticated = true;
        adminLoginModal.classList.add('hidden');
        adminModal.classList.remove('hidden');
        showAddTab(); // Default to add tab
        renderAllProducts(); // Load products when admin logs in
        loginError.classList.add('hidden');
        document.getElementById('admin-password').value = '';
    } else {
        loginError.classList.remove('hidden');
        document.getElementById('admin-password').value = '';
    }
});

cancelLogin.addEventListener('click', () => {
    adminLoginModal.classList.add('hidden');
    loginError.classList.add('hidden');
    document.getElementById('admin-password').value = '';
});

closeAdmin.addEventListener('click', () => {
    adminModal.classList.add('hidden');
});

adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
        adminModal.classList.add('hidden');
    }
});

adminLoginModal.addEventListener('click', (e) => {
    if (e.target === adminLoginModal) {
        adminLoginModal.classList.add('hidden');
        loginError.classList.add('hidden');
        document.getElementById('admin-password').value = '';
    }
});

// Image preview functionality
productImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.classList.add('hidden');
    }
});

// Add Category Form Handler
addCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const categoryName = document.getElementById('category-name').value.trim();
    const categoryEmoji = document.getElementById('category-emoji').value.trim();
    
    // Create category key (lowercase, no spaces)
    const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '');
    
    // Check if category already exists
    if (menuData[categoryKey]) {
        const submitBtn = addCategoryForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Category Already Exists!';
        submitBtn.classList.add('bg-red-600');
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.classList.remove('bg-red-600');
        }, 2000);
        return;
    }
    
    // Add new category
    menuData[categoryKey] = [];
    categoryEmojis[categoryKey] = categoryEmoji;
    categoryNames[categoryKey] = categoryName;
    saveData(); // Save to localStorage
    
    // Re-render everything
    renderCategories();
    renderMenu();
    renderProductCategoryOptions();
    setupScrollSpy();
    
    // Reset form
    addCategoryForm.reset();
    
    // Show success message
    const submitBtn = addCategoryForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Category Added!';
    submitBtn.classList.add('bg-green-700');
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('bg-green-700');
    }, 2000);
});

function renderProductCategoryOptions() {
    const categorySelect = document.getElementById('product-category');
    categorySelect.innerHTML = Object.keys(menuData).map(category => 
        `<option value="${category}">${categoryNames[category]}</option>`
    ).join('');
}

addProductForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const description = document.getElementById('product-description').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const imageFile = productImageInput.files[0];

    const newProduct = {
        id: nextId++,
        name: name,
        description: description,
        price: price,
        image: null
    };

    // Handle image upload
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            newProduct.image = e.target.result;
            menuData[category].push(newProduct);
            saveData(); // Save to localStorage
            
            // Update filtered data if no search is active
            if (!searchInput.value.trim()) {
                filteredMenuData = { ...menuData };
            }
            
            // Re-render menu and admin products
            renderMenu();
            renderAllProducts();
            setupScrollSpy();
        };
        reader.readAsDataURL(imageFile);
    } else {
        menuData[category].push(newProduct);
        saveData(); // Save to localStorage
        
        // Update filtered data if no search is active
        if (!searchInput.value.trim()) {
            filteredMenuData = { ...menuData };
        }
        
        // Re-render menu and admin products
        renderMenu();
        renderAllProducts();
        setupScrollSpy();
    }
    
    // Reset form
    addProductForm.reset();
    imagePreview.classList.add('hidden');
    
    // Show success message
    const submitBtn = addProductForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Added Successfully!';
    submitBtn.classList.add('bg-green-700');
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('bg-green-700');
    }, 2000);
});

function renderAllProducts() {
    const allProducts = [];
    Object.keys(menuData).forEach(category => {
        menuData[category].forEach(product => {
            allProducts.push({ ...product, category });
        });
    });

    if (allProducts.length === 0) {
        allProductsList.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <div class="text-6xl mb-4">📦</div>
                <h3 class="text-xl font-semibold mb-2">No products added yet</h3>
                <p>Add some products using the "Add Products" button</p>
            </div>
        `;
        return;
    }

    allProductsList.innerHTML = allProducts.map(product => `
        <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border">
            ${product.image ? `
                <div class="h-48 bg-gray-100">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                </div>
            ` : `
                <div class="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <span class="text-5xl">${categoryEmojis[product.category]}</span>
                </div>
            `}
            <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="font-semibold text-lg text-gray-800 leading-tight">${product.name}</h3>
                    <span class="text-xl font-bold text-orange-600 ml-2">${product.price.toLocaleString()} som</span>
                </div>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${product.description}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">${categoryNames[product.category]}</span>
                    <button class="delete-product bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium" 
                            data-id="${product.id}" data-category="${product.category}">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add delete listeners
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(btn.dataset.id);
            const category = btn.dataset.category;
            deleteProduct(productId, category, btn);
        });
    });
}

function deleteProduct(productId, category, btn) {
    // Show confirmation
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '✓ Confirm Delete';
    btn.classList.remove('bg-red-500', 'hover:bg-red-600');
    btn.classList.add('bg-red-700', 'hover:bg-red-800');
    
    const confirmDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove product from data
        menuData[category] = menuData[category].filter(product => product.id !== productId);
        saveData(); // Save to localStorage
        
        // Update filtered data if no search is active
        if (!searchInput.value.trim()) {
            filteredMenuData = { ...menuData };
        } else {
            // Re-apply search filter
            const searchTerm = searchInput.value.toLowerCase().trim();
            filteredMenuData = {};
            Object.keys(menuData).forEach(cat => {
                filteredMenuData[cat] = menuData[cat].filter(item => 
                    item.name.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm) ||
                    categoryNames[cat].toLowerCase().includes(searchTerm)
                );
            });
        }
        
        // Re-render everything
        renderMenu();
        renderAllProducts(); // Update the manage tab
        setupScrollSpy();
    };
    
    const cancelDelete = () => {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-red-700', 'hover:bg-red-800');
        btn.classList.add('bg-red-500', 'hover:bg-red-600');
        btn.removeEventListener('click', confirmDelete);
    };
    
    // Remove existing listeners and add new one
    btn.removeEventListener('click', confirmDelete);
    btn.addEventListener('click', confirmDelete, { once: true });
    
    // Auto-cancel after 3 seconds
    setTimeout(cancelDelete, 3000);
}

// Helper function to find product by ID
function findProductById(productId) {
    for (const category in menuData) {
        const product = menuData[category].find(p => p.id == productId);
        if (product) {
            return { ...product, category };
        }
    }
    return null;
}

// Rating System Functions
function setupRatingSystem() {
    // Rating modal elements
    const ratingModal = document.getElementById('rating-modal');
    const ratingForm = document.getElementById('rating-form');
    const cancelRating = document.getElementById('cancel-rating');
    const starButtons = document.querySelectorAll('.star-btn');
    const ratingPhotoInput = document.getElementById('rating-photo');
    const ratingPhotoPreview = document.getElementById('rating-photo-preview');
    const ratingPreviewImg = document.getElementById('rating-preview-img');
    
    let currentProductId = null;
    let currentProductName = '';

    // Rate product buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('rate-product')) {
            currentProductId = e.target.dataset.productId;
            currentProductName = e.target.dataset.productName;
            document.getElementById('rating-product-name').textContent = currentProductName;
            ratingModal.classList.remove('hidden');
        }
    });

    // Star rating functionality
    starButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const rating = parseInt(btn.dataset.rating);
            document.getElementById('selected-rating').value = rating;
            
            // Update star display
            starButtons.forEach((star, index) => {
                if (index < rating) {
                    star.classList.remove('text-gray-300');
                    star.classList.add('text-yellow-400');
                } else {
                    star.classList.remove('text-yellow-400');
                    star.classList.add('text-gray-300');
                }
            });
        });
    });

    // Photo preview
    ratingPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                ratingPreviewImg.src = e.target.result;
                ratingPhotoPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            ratingPhotoPreview.classList.add('hidden');
        }
    });

    // Submit rating
    ratingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const code = document.getElementById('rating-code').value.trim();
        const rating = document.getElementById('selected-rating').value;
        const comment = document.getElementById('rating-comment').value.trim();
        const photoFile = ratingPhotoInput.files[0];
        
        // Validate code (case insensitive)
        const codeObj = ratingCodes.find(c => c.code.toUpperCase() === code.toUpperCase() && !c.used);
        if (!codeObj) {
            showRatingError('Invalid or already used rating code');
            return;
        }
        
        // Check expiry
        if (codeObj.expiry && new Date(codeObj.expiry) < new Date()) {
            showRatingError('Rating code has expired');
            return;
        }
        
        // Mark code as used
        codeObj.used = true;
        codeObj.usedDate = new Date().toISOString().split('T')[0];
        saveData(); // Save immediately when code is used
        
        // Find product details
        const product = findProductById(currentProductId);
        
        // Create review object
        const review = {
            id: nextReviewId++,
            productId: currentProductId,
            productName: currentProductName,
            productCategory: product ? product.category : 'unknown',
            productEmoji: product ? categoryEmojis[product.category] : '🍽️',
            rating: parseInt(rating),
            comment: comment,
            photo: null,
            code: code,
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
        };
        
        // Handle photo
        if (photoFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                review.photo = e.target.result;
                pendingReviews.push(review);
                saveData(); // Save pending review
                updatePendingBadge();
                showRatingSuccess('Review submitted! Waiting for admin approval.');
                resetRatingForm();
            };
            reader.readAsDataURL(photoFile);
        } else {
            pendingReviews.push(review);
            saveData(); // Save pending review
            updatePendingBadge();
            showRatingSuccess('Review submitted! Waiting for admin approval.');
            resetRatingForm();
        }
    });

    // Cancel rating
    cancelRating.addEventListener('click', () => {
        ratingModal.classList.add('hidden');
        resetRatingForm();
    });

    // Close modal on backdrop click
    ratingModal.addEventListener('click', (e) => {
        if (e.target === ratingModal) {
            ratingModal.classList.add('hidden');
            resetRatingForm();
        }
    });

    function showRatingError(message) {
        const errorDiv = document.getElementById('rating-error');
        const successDiv = document.getElementById('rating-success');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        successDiv.classList.add('hidden');
    }

    function showRatingSuccess(message) {
        const errorDiv = document.getElementById('rating-error');
        const successDiv = document.getElementById('rating-success');
        successDiv.textContent = message;
        successDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        
        // Hide the rate button for this product
        const rateButtons = document.querySelectorAll(`[data-product-id="${currentProductId}"]`);
        rateButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        setTimeout(() => {
            ratingModal.classList.add('hidden');
            resetRatingForm();
            // Scroll to top of page (home)
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 2000);
    }

    function resetRatingForm() {
        ratingForm.reset();
        document.getElementById('selected-rating').value = '';
        starButtons.forEach(star => {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        });
        ratingPhotoPreview.classList.add('hidden');
        document.getElementById('rating-error').classList.add('hidden');
        document.getElementById('rating-success').classList.add('hidden');
    }
}

// Generate rating code
document.getElementById('generate-code-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const description = document.getElementById('code-description').value.trim();
    const expiry = document.getElementById('code-expiry').value;
    
    // Generate random code
    const code = 'RATE' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const newCode = {
        id: nextCodeId++,
        code: code,
        description: description,
        expiry: expiry || null,
        used: false,
        usedDate: null
    };
    
    ratingCodes.push(newCode);
    saveData(); // Save to localStorage
    renderRatingCodes();
    
    // Reset form and show success
    document.getElementById('generate-code-form').reset();
    const submitBtn = document.querySelector('#generate-code-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = `Code Generated: ${code}`;
    submitBtn.classList.add('bg-green-700');
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('bg-green-700');
    }, 3000);
});

function renderRatingCodes() {
    const codesList = document.getElementById('rating-codes-list');
    
    if (ratingCodes.length === 0) {
        codesList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">🎫</div>
                <p>No rating codes generated yet</p>
            </div>
        `;
        return;
    }
    
    codesList.innerHTML = ratingCodes.map(code => `
        <div class="bg-white rounded-lg p-4 border ${code.used ? 'border-gray-300 bg-gray-50' : 'border-green-300 bg-green-50'}">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-3">
                        <span class="font-mono text-lg font-bold ${code.used ? 'text-gray-500' : 'text-green-600'}">${code.code}</span>
                        <span class="text-sm px-2 py-1 rounded-full ${code.used ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}">
                            ${code.used ? 'Used' : 'Available'}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">${code.description}</p>
                    <div class="text-xs text-gray-500 mt-1">
                        ${code.expiry ? `Expires: ${code.expiry}` : 'No expiry'} 
                        ${code.used ? `| Used: ${code.usedDate}` : ''}
                    </div>
                </div>
                <button class="delete-code bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm" 
                        data-code-id="${code.id}">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
    
    // Add delete listeners
    document.querySelectorAll('.delete-code').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const codeId = parseInt(btn.dataset.codeId);
            ratingCodes = ratingCodes.filter(code => code.id !== codeId);
            saveData(); // Save changes
            renderRatingCodes();
        });
    });
}

function renderPendingReviews() {
    const reviewsList = document.getElementById('pending-reviews-list');
    
    if (pendingReviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">📝</div>
                <p>No pending reviews</p>
            </div>
        `;
        return;
    }
    
    reviewsList.innerHTML = pendingReviews.map(review => `
        <div class="bg-white rounded-lg p-4 border border-yellow-300 bg-yellow-50 relative">
            <div class="absolute top-2 right-2">
                <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">NEW</span>
            </div>
            <div class="flex items-start justify-between mb-3 pr-12">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-2xl">${review.productEmoji}</span>
                        <h4 class="font-semibold text-lg">${review.productName}</h4>
                        <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">${categoryNames[review.productCategory] || 'Unknown'}</span>
                    </div>
                    <div class="flex items-center space-x-2 mt-1">
                        <div class="flex">
                            ${Array.from({length: 5}, (_, i) => 
                                `<span class="text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}">★</span>`
                            ).join('')}
                        </div>
                        <span class="text-sm text-gray-600">(${review.rating}/5)</span>
                    </div>
                </div>
                <div class="text-right text-sm text-gray-500">
                    <div>Code: ${review.code}</div>
                    <div>${review.date}</div>
                </div>
            </div>
            
            <p class="text-gray-700 mb-3">${review.comment}</p>
            
            ${review.photo ? `
                <div class="mb-3">
                    <img src="${review.photo}" alt="Review photo" class="w-32 h-32 object-cover rounded-lg border">
                </div>
            ` : ''}
            
            <div class="flex space-x-2">
                <button class="approve-review bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm" 
                        data-review-id="${review.id}">
                    ✓ Approve
                </button>
                <button class="reject-review bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm" 
                        data-review-id="${review.id}">
                    ✗ Reject
                </button>
            </div>
        </div>
    `).join('');
    
    // Add approve/reject listeners
    document.querySelectorAll('.approve-review').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reviewId = parseInt(btn.dataset.reviewId);
            approveReview(reviewId);
        });
    });
    
    document.querySelectorAll('.reject-review').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reviewId = parseInt(btn.dataset.reviewId);
            rejectReview(reviewId);
        });
    });
}

function updatePendingBadge() {
    const badge = document.getElementById('pending-count-badge');
    const count = pendingReviews.length;
    
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function approveReview(reviewId) {
    const reviewIndex = pendingReviews.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
        const review = pendingReviews[reviewIndex];
        review.status = 'approved';
        approvedReviews.push(review);
        pendingReviews.splice(reviewIndex, 1);
        saveData(); // Save changes
        updatePendingBadge();
        renderPendingReviews();
        renderApprovedReviewsOnProducts(); // Show approved reviews on products
    }
}

function renderApprovedReviewsOnProducts() {
    const reviewsSection = document.getElementById('customer-reviews-section');
    const allReviewsContainer = document.getElementById('all-customer-reviews');
    
    if (approvedReviews.length === 0) {
        reviewsSection.style.display = 'none';
        return;
    }
    
    reviewsSection.style.display = 'block';
    
    allReviewsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${approvedReviews.map(review => `
                <div class="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div class="flex items-start space-x-3">
                        ${review.photo ? `
                            <img src="${review.photo}" alt="Review" class="w-12 h-12 object-cover rounded-lg flex-shrink-0">
                        ` : ''}
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-1 mb-1">
                                <span class="text-lg">${review.productEmoji}</span>
                                <h4 class="font-medium text-sm text-gray-900 truncate">${review.productName}</h4>
                            </div>
                            <div class="flex items-center space-x-2 mb-2">
                                <div class="flex">
                                    ${Array.from({length: 5}, (_, i) => 
                                        `<span class="text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}">★</span>`
                                    ).join('')}
                                </div>
                                <span class="text-xs text-gray-500">${review.date}</span>
                            </div>
                            <p class="text-xs text-gray-700 line-clamp-2">${review.comment}</p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function rejectReview(reviewId) {
    pendingReviews = pendingReviews.filter(r => r.id !== reviewId);
    saveData(); // Save changes
    updatePendingBadge();
    renderPendingReviews();
}

function renderReviewHistory() {
    const historyList = document.getElementById('review-history-list');
    
    if (approvedReviews.length === 0) {
        historyList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">📚</div>
                <p>No approved reviews yet</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = approvedReviews.map(review => `
        <div class="bg-white rounded-lg p-4 border border-green-300 bg-green-50">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-1">
                        <span class="text-2xl">${review.productEmoji}</span>
                        <h4 class="font-semibold text-lg">${review.productName}</h4>
                        <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">${categoryNames[review.productCategory] || 'Unknown'}</span>
                    </div>
                    <div class="flex items-center space-x-2 mt-1">
                        <div class="flex">
                            ${Array.from({length: 5}, (_, i) => 
                                `<span class="text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}">★</span>`
                            ).join('')}
                        </div>
                        <span class="text-sm text-gray-600">(${review.rating}/5)</span>
                        <span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">Approved</span>
                    </div>
                </div>
                <div class="text-right text-sm text-gray-500">
                    <div>Code: ${review.code}</div>
                    <div>${review.date}</div>
                </div>
            </div>
            
            <p class="text-gray-700 mb-3">${review.comment}</p>
            
            ${review.photo ? `
                <div class="mb-3">
                    <img src="${review.photo}" alt="Review photo" class="w-32 h-32 object-cover rounded-lg border">
                </div>
            ` : ''}
            
            <div class="flex justify-end">
                <button class="delete-history-review bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm" 
                        data-review-id="${review.id}">
                    🗑️ Delete from History
                </button>
            </div>
        </div>
    `).join('');
    
    // Add delete listeners
    document.querySelectorAll('.delete-history-review').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const reviewId = parseInt(btn.dataset.reviewId);
            approvedReviews = approvedReviews.filter(r => r.id !== reviewId);
            saveData(); // Save changes
            renderReviewHistory();
            renderApprovedReviewsOnProducts(); // Update product displays
        });
    });
}

// Initialize rating system
setupRatingSystem();

// Initialize pending badge and load saved reviews
updatePendingBadge();
renderApprovedReviewsOnProducts(); // Load saved approved reviews on startup

// Set initial active category
if (categoryButtons.length > 0) {
    categoryButtons[0].classList.add('active');
}
