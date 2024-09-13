document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const senha = document.getElementById('senha');
    const confirmarSenha = document.getElementById('confirmarSenha');

    togglePassword.addEventListener('click', () => {
        const type = senha.type === 'password' ? 'text' : 'password';
        senha.type = type;
        togglePassword.innerHTML = type === 'text' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });

    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmarSenha.type === 'password' ? 'text' : 'password';
        confirmarSenha.type = type;
        toggleConfirmPassword.innerHTML = type === 'text' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
    });

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senhaValue = document.getElementById('senha').value;
        const confirmarSenhaValue = document.getElementById('confirmarSenha').value;

        if (senhaValue !== confirmarSenhaValue) {
            alert('As senhas não conferem');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome,
                    email,
                    senha: senhaValue,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                window.location.href = '../Login/login.html'; 
            } else {
                alert(`Erro: ${data.message}`);
            }
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            alert('Ocorreu um erro ao tentar cadastrar. Por favor, tente novamente.');
        }
    });
});
