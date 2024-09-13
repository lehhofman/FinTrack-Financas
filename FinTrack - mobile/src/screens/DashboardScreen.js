import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);

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

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      setScreenWidth(Dimensions.get("window").width);
    };

    const subscription = Dimensions.addEventListener("change", updateLayout);

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions(); 
    });
  
    return unsubscribe;
  }, [navigation]);
  

  const calculateBalanceAndExpenses = () => {
    let income = 0;
    let expenses = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "renda") {
        income += transaction.amount;
      } else if (transaction.type === "despesa") {
        expenses += transaction.amount;
      }
    });

    // Considera o saldo como a renda total menos as despesas totais
    return { balance: income - expenses, expenses };
  };

  const { balance, expenses } = calculateBalanceAndExpenses();

  const prepareLineChartData = () => {
    const labels = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    let incomeData = new Array(12).fill(0);
    let expenseData = new Array(12).fill(0);

    transactions.forEach((transaction) => {
      const dateParts = transaction.date.split("/");
      const monthIndex = parseInt(dateParts[1], 10) - 1;
      if (transaction.type === "renda") {
        incomeData[monthIndex] += transaction.amount;
      } else if (transaction.type === "despesa") {
        expenseData[monthIndex] += transaction.amount;
      }
    });

    return {
      labels,
      datasets: [
        {
          data: incomeData,
          color: () => `rgba(42, 173, 64, 1)`,
          label: "Renda",
        },
        {
          data: expenseData,
          color: () => `rgba(223, 72, 34, 1)`,
          label: "Despesas",
        },
      ],
      legend: ["Renda", "Despesas"],
    };
  };

  const preparePieChartData = () => {
    const colors = ["#ff9999", "#66b3ff", "#99ff99", "#ffcc99", "#c2c2f0", "#ffb3e6"];
    let categoryTotals = {};

    transactions.forEach((transaction) => {
      if (transaction.type === "despesa") {
        if (!categoryTotals[transaction.category]) {
          categoryTotals[transaction.category] = 0;
        }
        categoryTotals[transaction.category] += transaction.amount;
      }
    });

    return Object.keys(categoryTotals).map((category, index) => ({
      name: category,
      amount: categoryTotals[category],
      color: colors[index % colors.length],
      legendFontColor: "#284767",
      legendFontSize: 12,
    }));
  };

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionRow}>
      <Text style={styles.transactionText}>{item.date}</Text>
      <Text style={styles.transactionText}>{item.description}</Text>
      <Text
        style={[
          styles.transactionText,
          { color: item.type === "despesa" ? "#df4822" : "#284767" },
        ]}
      >
        {item.type === "despesa" ? `- R$ ${item.amount.toFixed(2)}` : `R$ ${item.amount.toFixed(2)}`}
      </Text>
    </View>
  );

  const keyExtractor = (item) => item.id ? item.id.toString() : Math.random().toString();

  // Filtrar as últimas 3 transações, excluindo "renda"
  const filteredTransactions = transactions
    .filter(transaction => transaction.type !== 'renda')
    .slice(-3);

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>

      <View style={styles.balanceContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Saldo Atual:</Text>
          <Text
            style={[
              styles.balance,
              { color: balance < 0 ? "#df4822" : "#2aad40" },
            ]}
          >
            R$ {balance < 0 ? balance.toFixed(2) : balance.toFixed(2)}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Gastos do Mês:</Text>
          <Text style={[styles.balance, { color: "#df4822" }]}>
            R$ {expenses ? expenses.toFixed(2) : "0.00"}
          </Text>
        </View>
      </View>

      <View style={[styles.chartRow, { flexDirection: screenWidth > 600 ? "row" : "column" }]}>
        <View style={[styles.chartContainer, { width: screenWidth > 600 ? "48%" : "100%" }]}>
          <Text style={styles.chartTitle}>Fluxo de Caixa:</Text>
          <LineChart
            data={prepareLineChartData()}
            width={screenWidth > 500 ? (screenWidth - 60) / 2 : screenWidth - 60}
            height={160}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
            bezier
            yAxisLabel=""
            yAxisSuffix=" R$"
          />
        </View>

        <View style={[styles.chartContainer, { width: screenWidth > 600 ? "48%" : "100%" }]}>
          <Text style={styles.chartTitle}>Categorias de Gastos:</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <PieChart
              data={preparePieChartData()}
              width={screenWidth > 500 ? (screenWidth - 60) / 2 : screenWidth - 60}
              height={140}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
              absolute
            />
          </View>
        </View>
      </View>

      <View style={styles.transactionsContainer}>
        <Text style={styles.transactionsTitle}>Últimas Transações:</Text>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionHeaderText}>Data</Text>
          <Text style={styles.transactionHeaderText}>Descrição</Text>
          <Text style={styles.transactionHeaderText}>Valor</Text>
        </View>
        <FlatList
          data={filteredTransactions}  
          renderItem={renderTransactionItem}
          keyExtractor={keyExtractor}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 10,
  },
  menuContainer: {
    backgroundColor: "#fff",
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderRadius: 5,
  },
  menuItem: {
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#33608d",
  },
  balanceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    height: 80,
    width: "48%",
    alignItems: "center",
    elevation: 3,
    borderColor: "#d4af37", 
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#284767",
  },
  balance: {
    fontSize: 24,
    fontWeight: "bold",
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    color: "#284767",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    borderColor: "#d4af37",
    borderWidth: 1,
    marginBottom: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#284767",
    textAlign: "center",
  },
  chart: {
    borderRadius: 5,
  },
  transactionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    marginTop: 5,
    borderColor: "#d4af37",
    borderWidth: 1,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#284767",
    textAlign: "center",
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  transactionText: {
    fontSize: 14,
    color: "#284767",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  transactionHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#376f7b",
  },
  legendContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendColor: {
    width: 14,
    height: 14,
    marginRight: 5,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 12,
    color: "#376f7b",
  },
});
