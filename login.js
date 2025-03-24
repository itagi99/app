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
const auth = firebase.auth();

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Redirect to the main page or admin panel based on user role
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error signing in: ', error);
            alert('Error signing in. Please check your credentials and try again.');
        });
});