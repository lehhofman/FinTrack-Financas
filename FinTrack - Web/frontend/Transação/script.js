document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = '/login.html';
    } else {
        loadTransactionData();

        document.getElementById('saveTransactionButton').addEventListener('click', async function () {
            const transactionData = {
                usuarioId: 1, 
                data: document.getElementById('transactionDate').value,
                descricao: document.getElementById('transactionDescription').value,
                categoria: document.getElementById('transactionCategory').value.toUpperCase(),
                valor: parseFloat(document.getElementById('transactionAmount').value)
            };
            await saveTransaction(transactionData);
        });

        document.getElementById('updateTransactionButton').addEventListener('click', async function () {
            const transactionData = {
                descricao: document.getElementById('editTransactionDescription').value,
                valor: parseFloat(document.getElementById('editTransactionAmount').value)
            };
            const transactionId = document.getElementById('editTransactionId').value;
            await updateTransaction(transactionId, transactionData);
        });
    }
});

async function loadTransactionData() {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch('http://localhost:3000/api/transacao', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Erro ao carregar transações');
        }
        const transactions = await response.json();
        renderTransactions(transactions);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function renderTransactions(transactions) {
    const tableBody = document.getElementById('transactionTableBody');
    tableBody.innerHTML = '';

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        let formattedValue = transaction.valor.toFixed(2);

        if (transaction.categoria.toUpperCase() === "RENDA") {
            formattedValue = `<span class="text-success">+ ${formattedValue}</span>`;
        } else {
            formattedValue = `<span class="text-danger">- ${formattedValue}</span>`;
        }

        row.innerHTML = `
            <td>${formatDate(transaction.data)}</td>
            <td>${transaction.descricao}</td>
            <td>${transaction.categoria}</td>
            <td>${formattedValue}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editTransaction(${transaction.id})">Editar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; 
}

async function saveTransaction(transactionData) {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch('http://localhost:3000/api/transacao', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });
        if (!response.ok) {
            throw new Error('Erro ao salvar transação');
        }
        const newTransaction = await response.json();
        const addTransactionModal = bootstrap.Modal.getInstance(document.getElementById('addTransactionModal'));
        addTransactionModal.hide();
        loadTransactionData();
    } catch (error) {
        console.error('Erro ao salvar transação:', error);
    }
}

function editTransaction(id) {
    const token = localStorage.getItem('authToken');

    fetch(`http://localhost:3000/api/transacao/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(transaction => {
            document.getElementById('editTransactionId').value = transaction.id;
            document.getElementById('editTransactionDate').value = formatDate(transaction.data);
            document.getElementById('editTransactionDescription').value = transaction.descricao;
            document.getElementById('editTransactionCategory').value = transaction.categoria;
            document.getElementById('editTransactionAmount').value = transaction.valor.toFixed(2);

            const editTransactionModal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
            editTransactionModal.show();
        })
        .catch(error => console.error('Erro ao carregar transação:', error));
}

async function updateTransaction(id, transactionData) {
    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`http://localhost:3000/api/transacao/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transactionData)
        });
        if (!response.ok) {
            throw new Error('Erro ao atualizar transação');
        }
        const editTransactionModal = bootstrap.Modal.getInstance(document.getElementById('editTransactionModal'));
        editTransactionModal.hide();
        loadTransactionData();
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
    }
}
