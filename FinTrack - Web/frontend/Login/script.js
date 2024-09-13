document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    senha: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                window.location.href = '../Dashboard/dashboard.html'; 
            } else {
                alert(`Erro: ${data.message}`);
            }
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            alert('Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.');
        }
    });
});
