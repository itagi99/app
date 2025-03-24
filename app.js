// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyDu6YrO1fIra2RrgU1YQqt6e86Rvv4pq2Q",
    authDomain: "annapurna-127.firebaseapp.com",
    projectId: "annapurna-127",
    storageBucket: "annapurna-127.appspot.com", // Fixed storage bucket name
    messagingSenderId: "324721993652",
    appId: "1:324721993652:web:1abddc78805c6a49d4b4e1",
    measurementId: "G-RKDX39R2YW"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const productList = document.getElementById('product-list');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
const categoryBtns = document.querySelectorAll('.category-btn');

// Cart State
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load products when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartUI();
});

// Load products from Firestore
function loadProducts(category = 'all') {
    productList.innerHTML = '<div class="col-span-full text-center py-8">Loading products...</div>';

    let query = db.collection("products");
    if (category !== 'all') {
        query = query.where("category", "==", category);
    }

    query.get().then((querySnapshot) => {
        productList.innerHTML = '';
        if (querySnapshot.empty) {
            productList.innerHTML = '<div class="col-span-full text-center py-8">No products found</div>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            renderProduct(product, doc.id);
        });
    }).catch((error) => {
        console.error("Error loading products: ", error);
        productList.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Error loading products</div>';
    });
}

// Render product card
function renderProduct(product, id) {
    const productCard = document.createElement('div');
    productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';
    productCard.innerHTML = `
        <div class="relative">
            <img src="${product.imageUrl}" alt="${product.name}" 
                 class="w-full h-48 object-cover"
                 onerror="this.src='https://via.placeholder.com/300?text=Product+Image'">
            ${product.discount ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">${product.discount}% OFF</span>` : ''}
        </div>
        <div class="p-4">
            <h3 class="font-bold text-lg mb-1 truncate">${product.name}</h3>
            <p class="text-gray-600 text-sm mb-2">${product.description || ''}</p>
            <div class="flex items-center justify-between">
                <div>
                    <span class="font-bold text-lg">₹${product.price}</span>
                    ${product.originalPrice ? `<span class="text-gray-400 text-sm line-through ml-2">₹${product.originalPrice}</span>` : ''}
                </div>
                <button data-id="${id}" class="add-to-cart bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    Add
                </button>
            </div>
        </div>
    `;
    productList.appendChild(productCard);
}

// Add to cart
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
        const productId = e.target.getAttribute('data-id');
        db.collection("products").doc(productId).get().then((doc) => {
            if (doc.exists) {
                const product = doc.data();
                const existingItem = cart.find(item => item.id === productId);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        id: productId,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl,
                        quantity: 1
                    });
                }
                
                saveCart();
                updateCartUI();
                showNotification(`${product.name} added to cart`);
            }
        });
    }
});

// Cart functions
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    cartItems.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="text-center py-4 text-gray-500">Your cart is empty</div>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'flex items-center border-b pb-4';
            cartItem.innerHTML = `
                <img src="${item.imageUrl}" class="w-16 h-16 object-cover rounded mr-4"
                     onerror="this.src='https://via.placeholder.com/100?text=Product'">
                <div class="flex-1">
                    <h4 class="font-medium">${item.name}</h4>
                    <div class="flex items-center justify-between mt-1">
                        <div class="flex items-center">
                            <button class="change-qty bg-gray-200 px-2 rounded" data-id="${item.id}" data-change="-1">−</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="change-qty bg-gray-200 px-2 rounded" data-id="${item.id}" data-change="1">+</button>
                        </div>
                        <span class="font-medium">₹${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    cartTotal.textContent = `₹${total.toFixed(2)}`;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Cart quantity changes
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('change-qty')) {
        const productId = e.target.getAttribute('data-id');
        const change = parseInt(e.target.getAttribute('data-change'));
        
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            
            if (item.quantity <= 0) {
                cart = cart.filter(item => item.id !== productId);
            }
            
            saveCart();
            updateCartUI();
        }
    }
});

// Checkout
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    const order = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'pending'
    };
    
    if (auth.currentUser) {
        order.userId = auth.currentUser.uid;
        order.userEmail = auth.currentUser.email;
    }
    
    db.collection("orders").add(order)
        .then(() => {
            alert('Order placed successfully!');
            cart = [];
            saveCart();
            updateCartUI();
            cartModal.classList.add('hidden');
        })
        .catch(error => {
            console.error("Error placing order: ", error);
            alert('Error placing order. Please try again.');
        });
});

// Cart modal toggle
cartBtn.addEventListener('click', () => {
    cartModal.classList.remove('hidden');
});

closeCart.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

// Category filtering
categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');
        loadProducts(category);
        
        // Update active button
        categoryBtns.forEach(b => b.classList.remove('bg-yellow-500', 'text-white'));
        btn.classList.add('bg-yellow-500', 'text-white');
    });
});

// Notification function
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}