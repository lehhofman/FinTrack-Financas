document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken'); // Supondo que o token de autenticação está no localStorage

    if (!token) {
        window.location.href = '../Login/login.html'; // Redirecionar se o usuário não estiver autenticado
        return;
    }

    // Função para decodificar o token e obter o usuarioId
    const getUsuarioIdFromToken = (token) => {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    };

    const usuarioId = getUsuarioIdFromToken(token);

    // Função para carregar o dashboard e as transações
    const loadDashboardData = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/dashboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Erro ao carregar dados do dashboard.');

            const data = await response.json();

            document.getElementById('currentBalance').textContent = `R$ ${data.currentBalance.toFixed(2)}`;
            document.getElementById('monthlyExpenses').textContent = `R$ ${data.monthlyExpenses.toFixed(2)}`;

            // Atualizar gráficos
            updateCharts(data);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        }
    };

    // Função para atualizar gráficos
    const updateCharts = (data) => {
        const cashFlowChartCtx = document.getElementById('cashFlowChart').getContext('2d');
        const expensePieChartCtx = document.getElementById('expensePieChart').getContext('2d');

        // Gráfico de fluxo de caixa
        new Chart(cashFlowChartCtx, {
            type: 'line',
            data: {
                labels: data.cashFlow.labels,
                datasets: [{
                    label: 'Fluxo de Caixa',
                    data: data.cashFlow.values,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Gráfico de categorias de despesas
        new Chart(expensePieChartCtx, {
            type: 'pie',
            data: {
                labels: ['Alimentação', 'Transporte', 'Utilidades', 'Entretenimento'],
                datasets: [{
                    label: 'Despesas por Categoria',
                    data: [
                        data.expenseCategories['ALIMENTACAO'] || 0,
                        data.expenseCategories['TRANSPORTE'] || 0,
                        data.expenseCategories['UTILIDADES'] || 0,
                        data.expenseCategories['ENTRETENIMENTO'] || 0
                    ],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                    borderColor: '#ffffff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                const label = tooltipItem.label || '';
                                const value = tooltipItem.raw;
                                return `${label}: R$ ${value.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    };

    // Função para carregar e exibir transações
    const loadTransactions = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/transacao', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Erro ao carregar transações.');

            const transactions = await response.json();
            const transactionTableBody = document.getElementById('transactionTableBody');
            transactionTableBody.innerHTML = ''; // Limpar tabela antes de adicionar novas linhas

            let balance = 0;
            let monthlyExpenses = 0;
            const categories = {
                'ALIMENTACAO': 0,
                'TRANSPORTE': 0,
                'UTILIDADES': 0,
                'ENTRETENIMENTO': 0
            };

            transactions.forEach(transaction => {
                // Atualizar saldo e categorias de gasto
                if (transaction.categoria === 'RENDA') {
                    balance += transaction.valor;
                } else if (['ALIMENTACAO', 'TRANSPORTE', 'UTILIDADES', 'ENTRETENIMENTO'].includes(transaction.categoria)) {
                    monthlyExpenses += transaction.valor;
                    categories[transaction.categoria] += transaction.valor;
                }
            });

            // Atualizar o saldo e gastos do mês
            const finalBalance = balance - monthlyExpenses;
            document.getElementById('currentBalance').textContent = `R$ ${finalBalance.toFixed(2)}`;
            document.getElementById('monthlyExpenses').textContent = `R$ ${monthlyExpenses.toFixed(2)}`;

            // Mostrar apenas as 3 últimas transações na tabela
            const latestTransactions = transactions.slice(-3);
            latestTransactions.forEach(transaction => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(transaction.data).toLocaleDateString('pt-BR')}</td>
                    <td>${transaction.descricao}</td>
                    <td>${transaction.categoria}</td>
                    <td>R$ ${transaction.valor.toFixed(2)}</td>
                `;
                transactionTableBody.appendChild(row);
            });

            // Atualizar gráficos com base nas transações
            const cashFlowData = {
                labels: transactions.map(trans => new Date(trans.data).toLocaleDateString('pt-BR')),
                values: transactions.map(trans => trans.valor)
            };

            updateCharts({
                cashFlow: cashFlowData,
                expenseCategories: categories
            });
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        }
    };

    // Carregar os dados do dashboard e transações na inicialização
    loadDashboardData();
    loadTransactions();

    // Event listener para o botão de adicionar transação (não está mais no modal)
    document.getElementById('addTransactionButton').addEventListener('click', () => {
        // Aqui você pode redirecionar para uma página onde o usuário pode adicionar uma nova transação
        window.location.href = '../Transação/transacoes.html';
    });
});
