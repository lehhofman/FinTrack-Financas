document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reportForm');
    const chartsContainer = document.getElementById('chartsContainer');
    const summaryCard = document.getElementById('summaryCard');
    const token = localStorage.getItem('authToken');
  
    if (!token) {
      window.location.href = '../Login/login.html';
      return;
    }
  
    const getUsuarioIdFromToken = (token) => {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = atob(payloadBase64);
      const payload = JSON.parse(decodedPayload);
      return payload.id;
    };
  
    const usuarioId = getUsuarioIdFromToken(token);
  
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const reportType = document.getElementById('reportType').value;
      const dateFrom = document.getElementById('dateFrom').value;
      const dateTo = document.getElementById('dateTo').value;
  
      try {
        const [transacoesResponse, orcamentosResponse] = await Promise.all([
          fetch('http://localhost:3000/api/transacao', { headers }),
          fetch('http://localhost:3000/api/orcamento', { headers }),
        ]);
  
        if (!transacoesResponse.ok || !orcamentosResponse.ok) {
          throw new Error('Erro ao carregar dados do servidor.');
        }
  
        const transacoes = await transacoesResponse.json();
        const orcamentos = await orcamentosResponse.json();
  
        updateCharts(transacoes, orcamentos, reportType);
        updateSummary(transacoes, orcamentos);
  
        chartsContainer.classList.remove('d-none');
        summaryCard.classList.remove('d-none');
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        alert('Erro ao carregar dados. Por favor, tente novamente mais tarde.');
      }
    });
  
    function updateCharts(transacoes, orcamentos, reportType) {
      document.querySelectorAll('#chartsContainer .col-md-6').forEach(chart => {
        chart.classList.add('d-none');
      });
  
      switch (reportType) {
        case 'income-expense':
          document.getElementById('incomeExpenseChartContainer').classList.remove('d-none');
          createIncomeExpenseChart(transacoes);
          break;
        case 'category-breakdown':
          document.getElementById('categoryBreakdownChartContainer').classList.remove('d-none');
          createCategoryBreakdownChart(transacoes);
          break;
        case 'budget-performance':
          document.getElementById('budgetPerformanceChartContainer').classList.remove('d-none');
          createBudgetPerformanceChart(transacoes, orcamentos);
          break;
        case 'savings-trend':
          document.getElementById('savingsTrendChartContainer').classList.remove('d-none');
          createSavingsTrendChart(transacoes);
          break;
      }
    }
  
    function createIncomeExpenseChart(transacoes) {
      const incomeData = transacoes
        .filter(t => t.categoria === 'RENDA')
        .map(t => t.valor);
      const expenseData = transacoes
        .filter(t => t.categoria !== 'RENDA')
        .map(t => t.valor);
      const totalIncome = incomeData.reduce((acc, val) => acc + val, 0);
      const totalExpenses = expenseData.reduce((acc, val) => acc + val, 0);
  
      new Chart(document.getElementById('incomeExpenseChart'), {
        type: 'pie',
        data: {
          labels: ['Receitas', 'Despesas'],
          datasets: [
            {
              label: 'Receitas vs Despesas',
              data: [totalIncome, totalExpenses],
              backgroundColor: ['#4CAF50', '#FF5252'],
            },
          ],
        },
      });
    }
  
    function createCategoryBreakdownChart(transacoes) {
      const categoryLabels = [...new Set(transacoes.map(t => t.categoria))];
      const categoryData = categoryLabels.map(category => {
        return transacoes
          .filter(t => t.categoria === category)
          .reduce((acc, t) => acc + t.valor, 0);
      });
  
      new Chart(document.getElementById('categoryBreakdownChart'), {
        type: 'bar',
        data: {
          labels: categoryLabels,
          datasets: [
            {
              label: 'Despesas por Categoria',
              data: categoryData,
              backgroundColor: ['#FF9800', '#03A9F4', '#E91E63'],
            },
          ],
        },
      });
    }
  
    function createBudgetPerformanceChart(transacoes, orcamentos) {
      const budgetLabels = orcamentos.map(o => o.categoria);
      const budgetData = budgetLabels.map(label => {
        const orcado = orcamentos.find(o => o.categoria === label)?.valor || 0;
        const gasto = transacoes
          .filter(t => t.categoria === label)
          .reduce((acc, t) => acc + t.valor, 0);
        return (gasto / orcado) * 100;
      });
  
      new Chart(document.getElementById('budgetPerformanceChart'), {
        type: 'line',
        data: {
          labels: budgetLabels,
          datasets: [
            {
              label: 'Desempenho do Orçamento (%)',
              data: budgetData,
              borderColor: '#FF5722',
              backgroundColor: '#FF5722',
              fill: false,
            },
          ],
        },
      });
    }
  
    function createSavingsTrendChart(transacoes) {
        const formatDate = (dateString) => {
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0'); 
          return `${day}/${month}`;
        };
      
        const savingsData = transacoes.map(t => t.valor);
        const dates = transacoes.map(t => formatDate(t.data));
      
        new Chart(document.getElementById('savingsTrendChart'), {
          type: 'line',
          data: {
            labels: dates, 
            datasets: [
              {
                label: 'Tendência de Economia',
                data: savingsData, 
                borderColor: '#8BC34A',
                backgroundColor: '#8BC34A',
                fill: false,
              },
            ],
          },
        });
      }
      
  
    function updateSummary(transacoes, orcamentos) {
      const income = transacoes
        .filter(t => t.categoria === 'RENDA')
        .reduce((acc, t) => acc + t.valor, 0);
      const expenses = transacoes
        .filter(t => t.categoria !== 'RENDA')
        .reduce((acc, t) => acc + t.valor, 0);
      const balance = income - expenses;
      const highestExpenseCategory = transacoes
        .filter(t => t.categoria !== 'RENDA')
        .reduce((prev, curr) =>
          prev.valor > curr.valor ? prev : curr
        ).categoria;
  
      document.getElementById('totalIncome').textContent = `R$ ${income.toFixed(2)}`;
      document.getElementById('totalExpenses').textContent = `R$ ${expenses.toFixed(2)}`;
      document.getElementById('balance').textContent = `R$ ${balance.toFixed(2)}`;
      document.getElementById('highestExpenseCategory').textContent = highestExpenseCategory || '-';
      document.getElementById('monthlySavings').textContent = `${((income - expenses) / income * 100).toFixed(2)}%`;
    }
  });
  