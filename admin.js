// Initialize Firebase with your config
const firebaseConfig = {
    apiKey: "AIzaSyDu6YrO1fIra2RrgU1YQqt6e86Rvv4pq2Q",
    authDomain: "annapurna-127.firebaseapp.com",
    projectId: "annapurna-127",
    storageBucket: "annapurna-127.appspot.com",
    messagingSenderId: "324721993652",
    appId: "1:324721993652:web:1abddc78805c6a49d4b4e1",
    measurementId: "G-RKDX39R2YW"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

document.getElementById('add-product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const productName = document.getElementById('product-name').value;
    const productDescription = document.getElementById('product-description').value;
    const productPrice = document.getElementById('product-price').value;
    const productCategory = document.getElementById('product-category').value;
    const productImage = document.getElementById('product-image').value;

    db.collection('products').add({
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        category: productCategory,
        imageUrl: productImage
    }).then(() => {
        alert('Product added successfully!');
        document.getElementById('add-product-form').reset();
    }).catch((error) => {
        console.error('Error adding product: ', error);
        alert('Error adding product. Please try again.');
    });
});

function loadOrders() {
    const orderList = document.getElementById('order-list');
    orderList.innerHTML = '<div class="text-center py-8">Loading orders...</div>';

    db.collection('orders').orderBy('timestamp', 'desc').get().then((querySnapshot) => {
        orderList.innerHTML = '';
        if (querySnapshot.empty) {
            orderList.innerHTML = '<div class="text-center py-8">No orders found</div>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const order = doc.data();
            const orderItem = document.createElement('div');
            orderItem.className = 'border-b pb-4 mb-4';
            orderItem.innerHTML = `
                <h4 class="font-bold">Order ID: ${doc.id}</h4>
                <p>Total: ₹${order.total.toFixed(2)}</p>
                <p>Status: ${order.status}</p>
                <button class="update-status bg-yellow-500 text-white py-1 px-2 rounded mt-2" data-id="${doc.id}">Update Status</button>
            `;
            orderList.appendChild(orderItem);
        });
    }).catch((error) => {
        console.error('Error loading orders: ', error);
        orderList.innerHTML = '<div class="text-center py-8 text-red-500">Error loading orders</div>';
    });
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('update-status')) {
        const orderId = e.target.getAttribute('data-id');
        const newStatus = prompt('Enter new status (pending, shipped, delivered):');
        if (newStatus) {
            db.collection('orders').doc(orderId).update({
                status: newStatus
            }).then(() => {
                alert('Order status updated successfully!');
                loadOrders();
            }).catch((error) => {
                console.error('Error updating order status: ', error);
                alert('Error updating order status. Please try again.');
            });
        }
    }
});

// Load orders when the page loads
document.addEventListener('DOMContentLoaded', loadOrders);
