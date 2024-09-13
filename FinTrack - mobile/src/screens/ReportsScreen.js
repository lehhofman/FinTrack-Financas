import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Button, Dimensions } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { BarChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const [reportType, setReportType] = useState("category-breakdown");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const currentUser = await AsyncStorage.getItem("currentUser");
        if (currentUser) {
          const savedTransactions = await AsyncStorage.getItem(`transactions_${currentUser}`);
          if (savedTransactions !== null) {
            setTransactions(JSON.parse(savedTransactions));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      }
    };

    loadTransactions();
  }, []);

  const filterTransactionsByDate = (transactions, dateFrom, dateTo) => {
    if (!dateFrom && !dateTo) return transactions;

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const from = dateFrom ? new Date(dateFrom) : new Date("1970-01-01");
      const to = dateTo ? new Date(dateTo) : new Date();

      return transactionDate >= from && transactionDate <= to;
    });
  };

  const generateReportData = () => {
    const filteredTransactions = filterTransactionsByDate(transactions, dateFrom, dateTo);

    const categories = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    filteredTransactions.forEach((transaction) => {
      if (transaction.type === "renda") {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
        if (!categories[transaction.category]) {
          categories[transaction.category] = 0;
        }
        categories[transaction.category] += transaction.amount;
      }
    });

    const labels = Object.keys(categories);
    const data = Object.values(categories);

    return { labels, data, totalIncome, totalExpenses };
  };

  const handleGenerateReport = () => {
    const data = generateReportData();
    setReportData(data);
    setShowReport(true);
  };

  const handleReportTypeChange = (itemValue) => {
    setReportType(itemValue);
    setReportData(null);
    setShowReport(false);
  };

  const chartData = () => {
    if (!reportData) return {};

    switch (reportType) {
      case "category-breakdown":
        return {
          data: reportData.labels.map((label, index) => ({
            name: label,
            amount: reportData.data[index],
            color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`,
            legendFontColor: "#7f7f7f",
            legendFontSize: 12,
          })),
        };
      case "budget-performance":
        return {
          labels: reportData.labels,
          datasets: [
            {
              data: reportData.data.map(amount => amount * 1.2),
              color: (opacity = 1) => `rgba(163, 194, 228, ${opacity})`,
              strokeWidth: 2,
            },
            {
              data: reportData.data,
              color: (opacity = 1) => `rgba(55, 111, 123, ${opacity})`,
              strokeWidth: 2,
            }
          ],
        };
      default:
        return {};
    }
  };

  const renderChart = () => {
    if (!reportData) return null;

    const data = chartData();

    switch (reportType) {
      case "category-breakdown":
        return (
          <PieChart
            data={data.data}
            width={width - 40}
            height={150}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffffff",
              },
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="5"
          />
        );
      case "budget-performance":
        return (
          <BarChart
            data={data}
            width={width - 80}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffffff",
              },
            }}
            fromZero
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Relatórios Financeiros</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Filtros de Relatório</Text>
        <Text style={styles.label}>Tipo de Relatório:</Text>
        <Picker
          selectedValue={reportType}
          style={styles.picker}
          onValueChange={handleReportTypeChange}
        >
          <Picker.Item label="Detalhamento por Categoria" value="category-breakdown" />
          <Picker.Item label="Desempenho do Orçamento" value="budget-performance" />
        </Picker>
        <Button title="Gerar Relatório" onPress={handleGenerateReport} color="#376f7b" />
      </View>

      {showReport && reportData && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resultado do Relatório</Text>
            <View style={styles.chartContainer}>
              {renderChart()}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resumo</Text>
            <View style={styles.summary}>
              <Text style={styles.incomeText}>
                Total de Receitas: <Text style={styles.incomeValue}>R$ {reportData.totalIncome.toFixed(2)}</Text>
              </Text>
              <Text style={styles.expenseText}>
                Total de Despesas: <Text style={styles.expenseValue}>R$ {reportData.totalExpenses.toFixed(2)}</Text>
              </Text>
              <Text style={styles.balanceText}>
                Saldo: <Text style={styles.balanceValue}>R$ {(reportData.totalIncome - reportData.totalExpenses).toFixed(2)}</Text>
              </Text>
              <Text style={styles.savingsText}>
                Categoria com Maior Gasto: {reportData.labels[reportData.data.indexOf(Math.max(...reportData.data))]}
              </Text>
              <Text style={styles.savingsText}>
                Economia do Mês: <Text style={styles.savingsValue}>{((reportData.totalIncome - reportData.totalExpenses) / reportData.totalIncome * 100).toFixed(2)}%</Text>
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#284767",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    borderColor: "#c2be99",
    borderWidth: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#376f7b",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#284767",
  },
  picker: {
    width: width - 80,
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderColor: "#c2be99",
    borderWidth: 2,
    marginBottom: 10,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    marginTop: 15,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#376f7b",
  },
  incomeValue: {
    color: "#47a447",
  },
  expenseText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#376f7b",
  },
  expenseValue: {
    color: "#d9534f",
  },
  balanceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#376f7b",
  },
  balanceValue: {
    color: "#5bc0de",
  },
  savingsText: {
    fontSize: 16,
    color: "#284767",
  },
  savingsValue: {
    color: "#47a447",
  },
});
